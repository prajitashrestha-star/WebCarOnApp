import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register', formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-white">
                <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text" placeholder="Full Name"
                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg"
                        onChange={e => setFormData({ ...formData, name: e.target.value })} required
                    />
                    <input
                        type="email" placeholder="Email Address"
                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg"
                        onChange={e => setFormData({ ...formData, email: e.target.value })} required
                    />
                    <input
                        type="text" placeholder="Phone Number"
                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg"
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <input
                        type="password" placeholder="Password"
                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg"
                        onChange={e => setFormData({ ...formData, password: e.target.value })} required
                    />
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20">
                        Sign Up
                    </button>
                </form>
                <p className="mt-6 text-center text-slate-400">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
