import { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <Toaster position="top-right" />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                WebPrajita Project
            </h1>
            <p className="text-xl text-slate-300 mb-8">
                React + Vite + Tailwind CSS + Express + PostgreSQL
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-blue-500/50 transition-all duration-300 group">
                    <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-400">Frontend</h2>
                    <p className="text-slate-400">React 19, Axios, React Router, Tailwind V4</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-all duration-300 group">
                    <h2 className="text-2xl font-semibold mb-2 group-hover:text-emerald-400">Backend</h2>
                    <p className="text-slate-400">Node.js, Express, Sequelize, PostgreSQL</p>
                </div>
            </div>

            <div className="mt-12 text-slate-500 text-sm">
                Happy coding! 🚀
            </div>
        </div>
    )
}

export default App
