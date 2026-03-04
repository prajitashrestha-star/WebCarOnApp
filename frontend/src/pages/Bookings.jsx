import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editDates, setEditDates] = useState({ startDate: '', endDate: '' });
    const [editMeta, setEditMeta] = useState({ pricePerDay: 0, quantity: 1 });

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Calculate days and new total from current edit state
    const calcDays = (start, end) => {
        if (!start || !end) return 0;
        const ms = new Date(end) - new Date(start);
        return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    };

    const editDays = calcDays(editDates.startDate, editDates.endDate);
    const editNewTotal = editDays * editMeta.pricePerDay * editMeta.quantity;

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This will restore the car stock.')) return;
        try {
            await api.delete(`/bookings/${id}`);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const handleEditClick = (booking) => {
        setEditingBooking(booking.id);
        setEditDates({ startDate: booking.startDate, endDate: booking.endDate });
        setEditMeta({
            pricePerDay: parseFloat(booking.Car.pricePerDay),
            quantity: booking.quantity
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (editDays <= 0) {
            toast.error('End date must be after start date');
            return;
        }
        try {
            await api.put(`/bookings/${editingBooking}`, editDates);
            toast.success('Booking updated! New total: $' + editNewTotal.toFixed(2));
            setEditingBooking(null);
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

            {loading ? (
                <p>Loading...</p>
            ) : bookings.length === 0 ? (
                <div className="bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-700 text-center">
                    <p className="text-slate-400">You haven't booked any cars yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <div key={booking.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold">
                                    {booking.Car.name}
                                    {booking.quantity > 1 && (
                                        <span className="ml-2 text-sm bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                            x{booking.quantity}
                                        </span>
                                    )}
                                </h3>

                                {editingBooking === booking.id ? (
                                    <form onSubmit={handleUpdate} className="mt-4 space-y-4">
                                        <div className="flex flex-wrap gap-4 items-end">
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="bg-slate-800 border border-slate-700 p-2 rounded text-sm"
                                                    value={editDates.startDate}
                                                    onChange={e => setEditDates({ ...editDates, startDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    className="bg-slate-800 border border-slate-700 p-2 rounded text-sm"
                                                    value={editDates.endDate}
                                                    onChange={e => setEditDates({ ...editDates, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Live Bill Preview */}
                                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">Updated Bill Preview</p>
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-2xl font-black text-white">{editDays}</p>
                                                    <p className="text-xs text-slate-500">Day{editDays !== 1 ? 's' : ''}</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black text-slate-300">×</p>
                                                    <p className="text-xs text-slate-500">&nbsp;</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black text-emerald-400">${editMeta.pricePerDay}</p>
                                                    <p className="text-xs text-slate-500">Per Day{editMeta.quantity > 1 ? ` × ${editMeta.quantity} cars` : ''}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-700 mt-3 pt-3 flex justify-between items-center">
                                                <span className="text-sm text-slate-400">New Total:</span>
                                                <span className="text-2xl font-black text-blue-400">
                                                    ${editNewTotal.toFixed(2)}
                                                </span>
                                            </div>
                                            {parseFloat(booking.totalAmount) !== editNewTotal && (
                                                <p className="text-xs mt-2 text-yellow-400">
                                                    {editNewTotal > parseFloat(booking.totalAmount) ? '↑' : '↓'} Changed from ${parseFloat(booking.totalAmount).toFixed(2)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded text-sm font-bold transition-colors">
                                                Save Changes
                                            </button>
                                            <button type="button" onClick={() => setEditingBooking(null)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <p className="text-slate-400 text-sm mt-1">{booking.startDate} to {booking.endDate}</p>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between shrink-0">
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-400">${parseFloat(booking.totalAmount).toFixed(2)}</p>
                                    <p className="text-slate-400 text-sm">Total Paid</p>
                                </div>

                                {booking.status === 'pending' && !editingBooking && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(booking)}
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            title="Edit Dates"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                            title="Cancel Booking"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookings;
