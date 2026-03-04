import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email, phone: user.phone || '', password: '' });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/users/profile', formData);
            login(data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 mb-2">Full Name</label>
                        <input
                            value={formData.name}
                            className="w-full bg-slate-800 p-3 rounded-lg"
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2">Email</label>
                        <input
                            value={formData.email}
                            className="w-full bg-slate-800 p-3 rounded-lg"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2">Phone</label>
                        <input
                            value={formData.phone}
                            className="w-full bg-slate-800 p-3 rounded-lg"
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2">New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            value={formData.password}
                            className="w-full bg-slate-800 p-3 rounded-lg"
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold">
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
