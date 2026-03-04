import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchBookings();
    }, []);

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
                        <div key={booking.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">
                                    {booking.Car.name}
                                    {booking.quantity > 1 && (
                                        <span className="ml-2 text-sm bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                            x{booking.quantity}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-slate-400 text-sm">{booking.startDate} to {booking.endDate}</p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-400">${booking.totalAmount}</p>
                                <p className="text-slate-400 text-sm">Total Paid</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookings;
