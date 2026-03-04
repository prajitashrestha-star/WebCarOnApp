import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';

const Home = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCars = async () => {
        try {
            const { data } = await api.get('/cars');
            console.log('Cars from API:', data); // Diagnostic: check if stock exists
            setCars(data);
        } catch (error) {
            toast.error('Failed to load cars');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleBooking = async (carId, pricePerDay) => {
        // Paranoid check: ensure we don't even call the API if we think it's sold out
        const car = cars.find(c => c.id === carId);
        if (!car || !(Number(car.stock) > 0)) {
            toast.error('This car is already sold out!');
            return;
        }

        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        try {
            await api.post('/bookings', { carId, startDate, endDate, totalAmount: pricePerDay });
            toast.success('Car booked successfully!');
            fetchCars(); // Refresh stock in UI
        } catch (error) {
            console.error('Booking API Error:', error.response?.data);
            toast.error(error.response?.data?.message || 'Booking failed.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Available Cars for Rental</h1>
                    <p className="text-slate-400">Choose the best car for your next journey.</p>
                </header>

                {loading ? (
                    <div className="text-white text-center text-xl">Loading cars...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cars.map((car) => (
                            <div key={car.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group">
                                <div className="h-48 bg-slate-800 flex items-center justify-center p-4">
                                    <div className="text-blue-400 text-5xl font-mono">🚗</div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{car.name}</h3>
                                            <p className="text-slate-400 text-sm">{car.brand} {car.model} ({car.year})</p>
                                            <p className="text-slate-500 text-xs mt-1">Stock: {Number(car.stock)}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${Number(car.stock) > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {Number(car.stock) > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-6">
                                        <div>
                                            <span className="text-2xl font-bold text-white">${car.pricePerDay}</span>
                                            <span className="text-slate-400 text-sm"> / day</span>
                                        </div>
                                        <button
                                            onClick={() => handleBooking(car.id, car.pricePerDay)}
                                            disabled={!(Number(car.stock) > 0)}
                                            className={`px-6 py-2 rounded-lg font-semibold transition-all shadow-lg ${Number(car.stock) > 0
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                                }`}
                                        >
                                            {Number(car.stock) > 0 ? 'Book Now' : 'Sold Out'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
