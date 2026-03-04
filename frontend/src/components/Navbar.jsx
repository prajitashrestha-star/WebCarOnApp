import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                CarRental
            </Link>
            <div className="flex items-center gap-6">
                {user ? (
                    user.role === 'admin' ? (
                        <>
                            <Link to="/admin" className="text-slate-300 hover:text-white transition-colors">Admin Dashboard</Link>
                            <Link to="/profile" className="text-slate-300 hover:text-white transition-colors">Profile</Link>
                            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
                            <Link to="/bookings" className="text-slate-300 hover:text-white transition-colors">My Bookings</Link>
                            <Link to="/profile" className="text-slate-300 hover:text-white transition-colors">Profile</Link>
                            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">Logout</button>
                        </>
                    )
                ) : (
                    <>
                        <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
                        <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg transition-all font-medium text-white shadow-lg shadow-blue-500/20">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
