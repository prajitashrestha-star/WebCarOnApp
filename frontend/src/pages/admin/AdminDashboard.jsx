import { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [revenue, setRevenue] = useState({ totalRevenue: 0, totalBookings: 0 });
    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddCar, setShowAddCar] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [newCar, setNewCar] = useState({
        name: '', brand: '', model: '', year: '', pricePerDay: '', registrationNumber: '', description: '', image: '', stock: ''
    });

    const fetchData = async () => {
        setLoading(true);
        console.log('Fetching admin data...');
        try {
            const revRes = await api.get('/bookings/revenue');
            setRevenue(revRes.data);
            console.log('Revenue data loaded');

            const userRes = await api.get('/users');
            setUsers(userRes.data);
            console.log('Users data loaded');

            const carRes = await api.get('/cars');
            setCars(carRes.data);
            console.log('Cars data loaded:', carRes.data.length);

            const bookRes = await api.get('/bookings/list');
            setAllBookings(bookRes.data);
            console.log('All bookings data loaded');
        } catch (err) {
            console.error('Error fetching admin data:', err.response?.status, err.response?.data);
            toast.error(err.response?.data?.message || 'Dashboard failed to load.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cars', newCar);
            toast.success('Car added successfully');
            setShowAddCar(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add car');
        }
    };

    const handleUpdateCar = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/cars/${editingCar.id}`, editingCar);
            toast.success('Car updated successfully');
            setEditingCar(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleDeleteCar = async (id) => {
        if (window.confirm('CRITICAL ACTION: Are you sure you want to PERMANENTLY remove this car from the system? This action cannot be undone.')) {
            try {
                await api.delete(`/cars/${id}`);
                toast.success('Car removed');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete car. Check if it has bookings.');
            }
        }
    };

    if (loading && !cars.length) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Admin Dashboard...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <div className="bg-slate-900 p-1 rounded-xl flex">
                    {['overview', 'cars', 'users', 'bookings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Revenue</p>
                            <h2 className="text-5xl font-black text-emerald-400 font-mono">
                                ${Number(revenue.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Active Bookings</p>
                            <h2 className="text-5xl font-black text-blue-400 font-mono">{revenue.totalBookings}</h2>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                            <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Registered Users</p>
                            <h2 className="text-5xl font-black text-purple-400 font-mono">{users.length}</h2>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                        <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                        <button
                            onClick={() => setShowAddCar(true)}
                            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            Add New Rental Car
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'cars' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">Car Name</th>
                                <th className="p-4">Brand/Model</th>
                                <th className="p-4">Rate</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {cars.map(car => (
                                <tr key={car.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-semibold">{car.name}</td>
                                    <td className="p-4 text-slate-400">{car.brand} {car.model}</td>
                                    <td className="p-4 font-mono text-emerald-400">${car.pricePerDay}</td>
                                    <td className="p-4 font-mono">{car.stock}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${car.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {car.stock > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => setEditingCar(car)}
                                                className="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCar(car.id)}
                                                className="text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Join Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-semibold">{u.name}</td>
                                    <td className="p-4 text-slate-400">{u.email}</td>
                                    <td className="p-4 capitalize">{u.role}</td>
                                    <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Car booked</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Total Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {allBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold">{booking.User?.name}</div>
                                        <div className="text-xs text-slate-500">{booking.User?.email}</div>
                                    </td>
                                    <td className="p-4">{booking.Car?.name} ({booking.Car?.brand})</td>
                                    <td className="p-4 font-mono">{booking.quantity}</td>
                                    <td className="p-4 font-mono text-emerald-400">${booking.totalAmount}</td>
                                    <td className="p-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(showAddCar || editingCar) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-6">{editingCar ? 'Update Car Details' : 'Add Available Car'}</h2>
                        <form onSubmit={editingCar ? handleUpdateCar : handleAddCar} className="space-y-4 text-white">
                            <input
                                placeholder="Car Name"
                                className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                                value={editingCar ? editingCar.name : newCar.name}
                                onChange={e => editingCar ? setEditingCar({ ...editingCar, name: e.target.value }) : setNewCar({ ...newCar, name: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Brand"
                                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                                    value={editingCar ? editingCar.brand : newCar.brand}
                                    onChange={e => editingCar ? setEditingCar({ ...editingCar, brand: e.target.value }) : setNewCar({ ...newCar, brand: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Model"
                                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                                    value={editingCar ? editingCar.model : newCar.model}
                                    onChange={e => editingCar ? setEditingCar({ ...editingCar, model: e.target.value }) : setNewCar({ ...newCar, model: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Year"
                                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                                    value={editingCar ? editingCar.year : newCar.year}
                                    onChange={e => editingCar ? setEditingCar({ ...editingCar, year: e.target.value }) : setNewCar({ ...newCar, year: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Price/Day"
                                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                                    value={editingCar ? editingCar.pricePerDay : newCar.pricePerDay}
                                    onChange={e => editingCar ? setEditingCar({ ...editingCar, pricePerDay: e.target.value }) : setNewCar({ ...newCar, pricePerDay: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Current Stock"
                                    className="bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500 w-full col-span-2"
                                    value={editingCar ? editingCar.stock : newCar.stock}
                                    onChange={e => editingCar ? setEditingCar({ ...editingCar, stock: e.target.value }) : setNewCar({ ...newCar, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                placeholder="Registration Number"
                                className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500"
                                value={editingCar ? editingCar.registrationNumber : newCar.registrationNumber}
                                onChange={e => editingCar ? setEditingCar({ ...editingCar, registrationNumber: e.target.value }) : setNewCar({ ...newCar, registrationNumber: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none focus:border-blue-500 h-24"
                                value={editingCar ? editingCar.description : newCar.description}
                                onChange={e => editingCar ? setEditingCar({ ...editingCar, description: e.target.value }) : setNewCar({ ...newCar, description: e.target.value })}
                            />
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-grow bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold shadow-lg shadow-blue-500/20">
                                    {editingCar ? 'Update Car' : 'Save Car'}
                                </button>
                                <button type="button" onClick={() => { setShowAddCar(false); setEditingCar(null); }} className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
