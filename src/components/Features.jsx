
import React from 'react';
import { MessageSquare, Image, Code, Brain, Zap, Layers } from 'lucide-react';

const featureList = [
    {
        icon: <MessageSquare className="h-6 w-6 text-white" />,
        title: "Smart Chat",
        description: "Everyday conversations handled by GPT-4o-mini for speed and efficiency.",
        color: "bg-blue-500"
    },
    {
        icon: <Image className="h-6 w-6 text-white" />,
        title: "Image Generation",
        description: "Create stunning visuals with Google Imagen & Midjourney integration.",
        color: "bg-purple-500"
    },
    {
        icon: <Code className="h-6 w-6 text-white" />,
        title: "Code & Research",
        description: "Complex reasoning and coding tasks routed to Claude 3.5 Sonnet.",
        color: "bg-orange-500"
    },
    {
        icon: <Brain className="h-6 w-6 text-white" />,
        title: "Agentic Router",
        description: "Our proprietary AI analyzes your intent to pick the perfect model automatically.",
        color: "bg-pink-500"
    },
    {
        icon: <Zap className="h-6 w-6 text-white" />,
        title: "Fast & Responsive",
        description: "Streamlined interface ensuring low latency and high availability.",
        color: "bg-yellow-500"
    },
    {
        icon: <Layers className="h-6 w-6 text-white" />,
        title: "Context Aware",
        description: "Remembers your preferences and history across different model providers.",
        color: "bg-green-500"
    }
];

const Features = () => {
    return (
        <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Everything you need, <br /> all in one place.
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
                        We've aggregated the world's best AI capabilities into a single, cohesive experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featureList.map((feature, index) => (
                        <div key={index} className="relative group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className={`absolute top-6 left-6 inline-flex p-3 rounded-lg ${feature.color} shadow-lg ring-4 ring-white dark:ring-gray-800`}>
                                {feature.icon}
                            </div>
                            <div className="mt-8 pt-6">
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mt-4 mb-2">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
