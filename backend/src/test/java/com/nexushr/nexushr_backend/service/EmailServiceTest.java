package com.nexushr.nexushr_backend.service;

import jakarta.mail.Address;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailServiceTest {

    private RecordingMailSender mailSender;
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        mailSender = new RecordingMailSender();
        emailService = new EmailService(mailSender);

        ReflectionTestUtils.setField(emailService, "mailEnabled", true);
        ReflectionTestUtils.setField(emailService, "fromName", "NexusHR");
        ReflectionTestUtils.setField(emailService, "fromEmail", "no-reply@nexushr.com");
        ReflectionTestUtils.setField(emailService, "supportEmail", "support@nexushr.test");
    }

    @Test
    void sendsVerificationEmailWithDisplayNameAndAddress() throws Exception {
        emailService.sendVerificationEmail("employee@example.com", "https://example.com/verify?token=abc");

        MimeMessage sentMessage = mailSender.lastSentMessage;
        sentMessage.saveChanges();
        Address[] fromAddresses = sentMessage.getFrom();
        InternetAddress from = (InternetAddress) fromAddresses[0];
        String body = readContent(sentMessage.getContent());

        assertEquals("no-reply@nexushr.com", from.getAddress());
        assertEquals("NexusHR", from.getPersonal());
        assertEquals("employee@example.com", ((InternetAddress) sentMessage.getRecipients(Message.RecipientType.TO)[0]).getAddress());
        assertEquals("Verify your NexusHR email", sentMessage.getSubject());
        assertTrue(body.contains("https://example.com/verify?token=abc"));
        assertTrue(body.contains("Verify Email"));
        assertTrue(body.contains("mailto:support@nexushr.test"));
    }

    @Test
    void sendsEmployeeWelcomeEmailWithSetupLink() throws Exception {
        emailService.sendEmployeeWelcomeEmail("employee@example.com", "Alex Johnson", "https://example.com/reset-password?token=setup");

        MimeMessage sentMessage = mailSender.lastSentMessage;
        sentMessage.saveChanges();
        String body = readContent(sentMessage.getContent());

        assertEquals("Set up your NexusHR account", sentMessage.getSubject());
        assertTrue(body.contains("Alex Johnson"));
        assertTrue(body.contains("https://example.com/reset-password?token=setup"));
        assertTrue(body.contains("Set Password"));
    }

    @Test
    void wrapsMailFailuresInServiceUnavailableResponse() {
        mailSender.throwOnSend = true;

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> emailService.sendPasswordResetEmail("employee@example.com", "https://example.com/reset?token=abc")
        );

        assertEquals(503, exception.getStatusCode().value());
        assertEquals("Unable to send email right now. Please try again later.", exception.getReason());
    }

    private String readContent(Object content) throws Exception {
        assertNotNull(content);

        if (content instanceof String text) {
            return text;
        }

        if (content instanceof Multipart multipart) {
            StringBuilder builder = new StringBuilder();
            for (int index = 0; index < multipart.getCount(); index++) {
                builder.append(readContent(multipart.getBodyPart(index).getContent()));
            }
            return builder.toString();
        }

        return content.toString();
    }

    private static final class RecordingMailSender implements JavaMailSender {
        private MimeMessage lastSentMessage;
        private boolean throwOnSend;

        @Override
        public MimeMessage createMimeMessage() {
            return new MimeMessage(Session.getInstance(new Properties()));
        }

        @Override
        public MimeMessage createMimeMessage(java.io.InputStream contentStream) throws MailException {
            try {
                return new MimeMessage(Session.getInstance(new Properties()), contentStream);
            } catch (MessagingException ex) {
                throw new MailSendException("Unable to read message content", ex);
            }
        }

        @Override
        public void send(MimeMessage mimeMessage) throws MailException {
            if (throwOnSend) {
                throw new MailSendException("SMTP rejected message");
            }
            lastSentMessage = mimeMessage;
        }

        @Override
        public void send(MimeMessage... mimeMessages) throws MailException {
            if (mimeMessages.length > 0) {
                send(mimeMessages[0]);
            }
        }

        @Override
        public void send(SimpleMailMessage simpleMessage) throws MailException {
            throw new UnsupportedOperationException("SimpleMailMessage is not used by EmailService");
        }

        @Override
        public void send(SimpleMailMessage... simpleMessages) throws MailException {
            throw new UnsupportedOperationException("SimpleMailMessage is not used by EmailService");
        }
    }
}
