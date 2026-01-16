
import React from 'react';
import { Check } from 'lucide-react';

const tiers = [
    {
        name: 'Starter',
        price: 0,
        features: ['Access to GPT-4o-mini', '5 daily messages', 'Standard support', 'No image generation'],
        cta: 'Start for Free',
        mostPopular: false,
    },
    {
        name: 'Pro',
        price: 20,
        features: ['Access to Claude 3.5 Sonnet', 'GPT-4o (Limited)', '50 Images/mo', 'Priority support', 'Agentic Routing'],
        cta: 'Get Pro',
        mostPopular: true,
    },
    {
        name: 'Power',
        price: 50,
        features: ['Unlimited Research Agents', 'High-Res Image Generation', 'API Access', '24/7 Priority Support', 'Early Access Features'],
        cta: 'Contact Sales',
        mostPopular: false,
    },
];

const Pricing = () => {
    return (
        <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                        Choose the plan that fits your needs. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {tiers.map((tier) => (
                        <div key={tier.name} className={`relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 ${tier.mostPopular ? 'scale-105 z-10 ring-2 ring-indigo-600 dark:ring-indigo-500' : ''}`}>
                            {tier.mostPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-indigo-600 text-white shadow-sm">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tier.name}</h3>
                                <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-100">
                                    <span className="text-5xl font-extrabold tracking-tight">${tier.price}</span>
                                    <span className="ml-1 text-xl text-gray-500 dark:text-gray-400 font-semibold">/mo</span>
                                </div>
                                <ul className="mt-6 space-y-4">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex">
                                            <Check className="flex-shrink-0 w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <span className="ml-3 text-gray-500 dark:text-gray-400">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
                                <button className={`w-full block text-center px-6 py-3 rounded-lg text-base font-medium transition-colors ${tier.mostPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'}`}>
                                    {tier.cta}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
