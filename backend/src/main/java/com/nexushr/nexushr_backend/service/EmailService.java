package com.nexushr.nexushr_backend.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EmailService {

    private static final String APP_NAME = "NexusHR";

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from-name:NexusHR}")
    private String fromName;

    @Value("${app.mail.from-email:${spring.mail.username:}}")
    private String fromEmail;

    @Value("${app.mail.support-email:${app.mail.from-email:${spring.mail.username:}}}")
    private String supportEmail;

    @PostConstruct
    void validateMailConfiguration() {
        if (mailEnabled && (fromEmail == null || fromEmail.isBlank())) {
            log.warn("Email sending is enabled but no from email address is configured. Set APP_MAIL_FROM_EMAIL or MAIL_USERNAME.");
        }
    }

    public void sendVerificationEmail(String toEmail, String verificationUrl) {
        sendOrLog(
                toEmail,
                buildActionEmail(
                        "Verify your NexusHR email",
                        "Verify your email address",
                        "Welcome to NexusHR. Please verify your email address to finish setting up your account.",
                        "Verify Email",
                        verificationUrl,
                        "If you did not create this account, you can safely ignore this email."
                )
        );
    }

    public void sendPasswordResetEmail(String toEmail, String resetUrl) {
        sendOrLog(
                toEmail,
                buildActionEmail(
                        "Reset your NexusHR password",
                        "Reset your password",
                        "We received a request to reset your NexusHR password. Use the secure link below to choose a new one.",
                        "Reset Password",
                        resetUrl,
                        "If you did not request this change, you can ignore this email and your password will stay the same."
                )
        );
    }

    public void sendEmployeeWelcomeEmail(String toEmail, String employeeName, String setupUrl) {
        String safeName = employeeName == null || employeeName.isBlank() ? "there" : employeeName.trim();

        sendOrLog(
                toEmail,
                buildActionEmail(
                        "Set up your NexusHR account",
                        "Your NexusHR account is ready",
                        "Hi " + safeName + ", your employee account has been created. Use the secure link below to set your password and sign in.",
                        "Set Password",
                        setupUrl,
                        "For security, this link should only be used by you. If you were not expecting this invitation, please contact support."
                )
        );
    }

    private void sendOrLog(String toEmail, EmailContent content) {
        if (!mailEnabled || fromEmail == null || fromEmail.isBlank()) {
            log.info(
                    "Email sending is disabled or not configured. To: {}, Subject: {}, Body: {}",
                    toEmail,
                    content.subject(),
                    content.textBody()
            );
            return;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(toEmail);
            helper.setSubject(content.subject());
            helper.setText(content.textBody(), content.htmlBody());
            String resolvedFromName = resolveFromName();
            if (resolvedFromName == null) {
                helper.setFrom(fromEmail);
            } else {
                helper.setFrom(fromEmail, resolvedFromName);
            }
            mailSender.send(message);
        } catch (MailException | jakarta.mail.MessagingException | java.io.UnsupportedEncodingException ex) {
            log.error("Failed to send email to {}", toEmail, ex);
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Unable to send email right now. Please try again later."
            );
        }
    }

    private String resolveFromName() {
        if (fromName == null || fromName.isBlank()) {
            return null;
        }
        return fromName.trim();
    }

    private String footerText() {
        if (supportEmail == null || supportEmail.isBlank()) {
            return APP_NAME + " Team";
        }
        return APP_NAME + " Team\nNeed help? Reply to " + supportEmail.trim();
    }

    private String footerHtml() {
        String supportLine = "";
        if (supportEmail != null && !supportEmail.isBlank()) {
            String email = escapeHtml(supportEmail.trim());
            supportLine = """
                    <p style="margin:8px 0 0;color:#64748b;font-size:13px;line-height:20px;">
                      Need help? Reach us at <a href="mailto:%s" style="color:#4f46e5;text-decoration:none;">%s</a>
                    </p>
                    """.formatted(email, email);
        }

        return """
                <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#0f172a;font-size:14px;font-weight:600;">%s Team</p>
                  %s
                </div>
                """.formatted(APP_NAME, supportLine);
    }

    private static String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private EmailContent buildActionEmail(
            String subject,
            String heading,
            String intro,
            String actionLabel,
            String actionUrl,
            String outro
    ) {
        String safeSubject = escapeHtml(subject);
        String safeHeading = escapeHtml(heading);
        String safeIntro = escapeHtml(intro);
        String safeActionLabel = escapeHtml(actionLabel);
        String safeActionUrl = escapeHtml(actionUrl);
        String safeOutro = escapeHtml(outro);

        String textBody = """
                %s

                %s

                %s:
                %s

                %s

                %s
                """.formatted(
                heading,
                intro,
                actionLabel,
                actionUrl,
                outro,
                footerText()
        );

        String htmlBody = """
                <!doctype html>
                <html lang="en">
                  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
                      <tr>
                        <td style="padding:0;">
                          <div style="background:linear-gradient(135deg,#4f46e5,#0f172a);padding:24px 28px;border-radius:24px 24px 0 0;">
                            <p style="margin:0;color:#c7d2fe;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">%s</p>
                            <h1 style="margin:12px 0 0;color:#ffffff;font-size:28px;line-height:36px;">%s</h1>
                          </div>
                          <div style="background:#ffffff;padding:32px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 24px 24px;">
                            <p style="margin:0 0 24px;color:#334155;font-size:16px;line-height:26px;">%s</p>
                            <p style="margin:0 0 28px;">
                              <a href="%s" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 22px;border-radius:999px;">%s</a>
                            </p>
                            <p style="margin:0;color:#475569;font-size:14px;line-height:24px;">%s</p>
                            <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:22px;">If the button does not work, copy and paste this link into your browser:</p>
                            <p style="margin:8px 0 0;word-break:break-word;">
                              <a href="%s" style="color:#4f46e5;text-decoration:none;font-size:13px;line-height:22px;">%s</a>
                            </p>
                            %s
                          </div>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(
                APP_NAME,
                safeHeading,
                safeIntro,
                safeActionUrl,
                safeActionLabel,
                safeOutro,
                safeActionUrl,
                safeActionUrl,
                footerHtml()
        );

        return new EmailContent(safeSubject, textBody, htmlBody);
    }

    private record EmailContent(String subject, String textBody, String htmlBody) {
    }
}
