import { Bell, Search, LogOut } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Header = ({ title }: { title: string }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const displayName = user?.username || 'Admin'

    // const handleLogout = async () => {
    //     await logout()
    //     toast.success('Logged out successfully!')
    //     navigate('/login')
    // }
    const handleLogout = async () => {
        await logout()  // async hai ab
        toast.success('Logged out!')
        navigate('/login')
    }
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-purple-500 w-64"
                    />
                </div>
                <button className="relative p-2 hover:bg-slate-100 rounded-lg">
                    <Bell size={18} className="text-slate-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {displayName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700 hidden md:block">
            {displayName}
          </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    <span className="hidden md:block">Logout</span>
                </button>
            </div>
        </header>
    )
}

export default Header
