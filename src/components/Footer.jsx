
import React from 'react';
import { Zap } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Zap className="h-6 w-6 text-indigo-600" />
                        <span className="font-bold text-xl text-gray-900 dark:text-white">AskGPT</span>
                    </div>

                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            Terms
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            Privacy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            Contact
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-gray-400">
                    &copy; 2026 AskGPT. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
