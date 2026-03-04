import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    // Redirect non-admins trying to access admin pages
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

    // Redirect admins trying to access user-only pages (if specified)
    if (userOnly && user.role === 'admin') return <Navigate to="/admin" />;

    return children;
};

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">Loading...</div>;
    }

    return (
        <Router>
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <Toaster position="top-right" />
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        {/* Role based root route redirection */}
                        <Route
                            path="/"
                            element={user?.role === 'admin' ? <Navigate to="/admin" /> : <Home />}
                        />

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* User Protected Routes */}
                        <Route
                            path="/profile"
                            element={<ProtectedRoute><Profile /></ProtectedRoute>}
                        />
                        <Route
                            path="/bookings"
                            element={<ProtectedRoute userOnly={true}><Bookings /></ProtectedRoute>}
                        />

                        {/* Admin Protected Routes */}
                        <Route
                            path="/admin"
                            element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>}
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
