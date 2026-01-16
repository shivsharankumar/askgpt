
import React from 'react';
import { Users, CreditCard, Activity, Settings, LogOut, LayoutDashboard, Search } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col hidden md:flex">
                <div className="p-6 h-16 flex items-center border-b border-gray-100 dark:border-gray-700">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">AskGPT Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-medium">Overview</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Users</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Subscriptions</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Activity className="h-5 w-5" />
                        <span className="font-medium">Usage</span>
                    </a>
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 mt-2 text-red-500 hover:text-red-700 transition-colors">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-8 transition-colors duration-300">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard Overview</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>
                        <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                            A
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Users</h3>
                                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">12,345</p>
                            <span className="text-sm text-green-500 flex items-center mt-2">
                                +12% from last month
                            </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 dark:text-gray-400 font-medium">Revenue</h3>
                                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">$45,678</p>
                            <span className="text-sm text-green-500 flex items-center mt-2">
                                +8% from last month
                            </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 dark:text-gray-400 font-medium">Model Usage</h3>
                                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">1.2M</p>
                            <span className="text-sm text-indigo-500 flex items-center mt-2">
                                Tokens generated
                            </span>
                        </div>
                    </div>

                    {/* Recent Users Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600" />
                                                    <span className="font-medium text-gray-900 dark:text-white">User Name {item}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Pro Plan</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Oct 24, 2024</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
