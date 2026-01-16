import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
const Hero = () => {
    return (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <div className="mx-auto max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-sm font-semibold mb-8 animate-fade-in-up">
                        <Sparkles className="w-4 h-4" />
                        <span>The Future of Agentic AI is Here</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                        One Interface. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Every Best-in-Class Model.
                        </span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                        Stop switching tabs. AskGPT intelligently routes your prompts to the perfect model—GPT-4o for chat, Claude for code, and Imagen for visuals.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg shadow-lg hover:shadow-indigo-500/30 transition-all">
                            Start Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <a href="#pricing" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 md:text-lg transition-all">
                            View Pricing
                        </a>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 inset-x-0 h-full -z-10 overflow-hidden">
                <div className="absolute left-[calc(50%-11rem)] top-[calc(50%-30rem)] h-[50rem] w-[50rem] -translate-y-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-30rem)] sm:h-[70rem] sm:w-[70rem] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-[calc(50%-11rem)] top-[calc(50%+10rem)] h-[50rem] w-[50rem] -translate-y-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80ffdb] to-[#0096c7] opacity-20 dark:opacity-10 sm:right-[calc(50%-30rem)] sm:h-[70rem] sm:w-[70rem] rounded-full blur-3xl pointer-events-none" />
            </div>
        </div>
    );
};

export default Hero;
