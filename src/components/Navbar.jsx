
import React, { useState } from 'react';
import { Menu, X, Zap, Sun, Moon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <Zap className="h-6 w-6 text-indigo-600 fill-current" />
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">AskGPT</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#features" className="hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">Features</a>
                            <a href="#how-it-works" className="hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">How it Works</a>
                            <a href="#pricing" className="hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">Pricing</a>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {user ? (
                            <>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Hello, {user.username || 'User'}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </button>
                                <Link to="/chat" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30">
                                    Open Chat
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    Log in
                                </Link>
                                <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-200 hover:text-indigo-600">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-xl transition-colors duration-300">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">Features</a>
                        <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">Pricing</a>
                        <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                            {user ? (
                                <>
                                    <Link to="/chat" className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800">
                                        Open Chat
                                    </Link>
                                    <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-gray-800">
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        Log in
                                    </Link>
                                    <Link to="/login" className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
