import '@fontsource-variable/geist/wght.css'
import './index.css'
import ReactDOM from 'react-dom/client'
import AppRoutes from './Routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'


ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
)