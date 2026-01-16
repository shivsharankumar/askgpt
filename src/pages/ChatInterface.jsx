import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Paperclip, Mic, Plus, MessageSquare, Settings, LogOut, Bot, Code, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm AskGPT. How can I help you today?", sender: 'ai', model: 'GPT-4o' },
    ]);
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [attachedImage, setAttachedImage] = useState(null);
    const messagesEndRef = useRef(null);

    const [showSettings, setShowSettings] = useState(false);

    // Fetch Conversations list
    const fetchConversations = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8000/api/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const handleNewChat = () => {
        setCurrentConversationId(null);
        setMessages([
            { id: Date.now(), text: "Hello! I'm AskGPT. How can I help you today?", sender: 'ai', model: 'GPT-4o' },
        ]);
        setInput("");
        setAttachedImage(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load History when conversation changes
    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            // If New Chat (null ID), don't fetch history, just keep welcome msg
            if (!currentConversationId) return;

            try {
                const response = await fetch(`http://localhost:8000/api/history?conversation_id=${currentConversationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) {
                    logout();
                    navigate('/');
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setMessages(data);
                    } else {
                        setMessages([]); // Empty if new
                    }
                }
            } catch (error) {
                console.error("Failed to load history:", error);
            }
        };
        fetchHistory();
    }, [currentConversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if ((!input.trim() && !attachedImage) || isLoading) return;

        const userText = input;
        const currentImage = attachedImage;

        // Optimistically add user message
        const userMsg = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            image: currentImage ? currentImage.split(',')[1] : null // Store base64 raw for consistency with backend return
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setAttachedImage(null);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    message: userText,
                    image: currentImage, // Send full data URL
                    conversation_id: currentConversationId
                })
            });

            if (response.status === 401) {
                logout();
                navigate('/');
                return;
            }

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // If new conversation created, update ID and refresh list
            if (data.conversation_id && data.conversation_id !== currentConversationId) {
                setCurrentConversationId(data.conversation_id);
                fetchConversations();
            }

            const aiMsg = {
                id: Date.now() + 1,
                text: data.response,
                sender: 'ai',
                model: data.model_used,
                image: data.image
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Error fetching chat:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "Sorry, I couldn't connect to the Agentic Brain. Is the backend running?",
                sender: 'ai',
                model: 'System Error'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteConversation = async (e, id) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!confirm("Are you sure you want to delete this chat?")) return;

        try {
            await fetch(`http://localhost:8000/api/conversations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchConversations();
            if (currentConversationId === id) handleNewChat();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const deleteAllConversations = async () => {
        const token = localStorage.getItem('token');
        if (!confirm("Delete ALL chats? This cannot be undone.")) return;
        try {
            await fetch(`http://localhost:8000/api/conversations`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchConversations();
            handleNewChat();
            setShowSettings(false);
        } catch (error) {
            console.error("Failed to delete all", error);
        }
    };

    const clearCache = () => {
        if (!confirm("Clear local cache? This will reload the page.")) return;
        localStorage.removeItem('token'); // Logout effectively? Or just refresh? 
        // User asked for "clear cache". Usually means app state.
        // Let's just reload window for now, or maybe clear non-essential LS.
        // But for this app, token is the main thing.
        // Let's just reload.
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 text-gray-300 flex flex-col hidden md:flex">
                <div className="p-4 border-b border-gray-800">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">History</div>
                    {conversations.map((chat) => (
                        <div key={chat.id} className="group relative">
                            <button
                                onClick={() => setCurrentConversationId(chat.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 text-sm truncate pr-8 ${currentConversationId === chat.id ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
                            >
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                <span className="truncate">{chat.title}</span>
                            </button>
                            <button
                                onClick={(e) => deleteConversation(e, chat.id)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className="text-sm text-gray-600 px-3">No chats yet.</div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm"
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm text-red-400 hover:text-red-300">
                        <LogOut className="h-4 w-4" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 transition-colors duration-300">
                {/* Header */}
                <header className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">New Chat</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Agentic Mode</span>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-3xl gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-green-100 dark:bg-green-900'}`}>
                                    {msg.sender === 'user' ? <div className="text-indigo-600 dark:text-indigo-300 font-bold text-xs">U</div> : <Bot className="h-5 w-5 text-green-600 dark:text-green-300" />}
                                </div>
                                <div>

                                    {msg.sender === 'ai' && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{msg.model || 'AI'}</span>
                                            {msg.model?.includes('Claude') && <Code className="h-3 w-3 text-orange-500" />}
                                            {msg.model?.includes('GPT') && <Sparkles className="h-3 w-3 text-green-500" />}
                                            {msg.model?.includes('Imagen') && <Image className="h-3 w-3 text-purple-500" />}
                                        </div>
                                    )}

                                    <div className={`px-5 py-3.5 rounded-2xl shadow-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                                        }`}>
                                        <div className={`prose dark:prose-invert max-w-none ${msg.sender === 'user' ? 'text-white prose-headings:text-white prose-strong:text-white' : 'text-sm'}`}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                        {msg.image && (
                                            <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                                                <img src={`data:image/png;base64,${msg.image}`} alt="Generated content" className="w-full h-auto max-w-md" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex max-w-3xl gap-4 flex-row">
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Bot className="h-5 w-5 text-green-600 dark:text-green-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Thinking...</span>
                                    </div>
                                    <div className="px-5 py-3.5 rounded-2xl rounded-bl-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Generating response...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
                    <div className="max-w-4xl mx-auto relative">
                        <div className="absolute left-3 top-3 flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Paperclip className="h-5 w-5" />
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <Image className="h-5 w-5" />
                            </button>
                            {/* Image Preview */}
                            {attachedImage && (
                                <div className="absolute left-0 -top-24 ml-4">
                                    <div className="relative group">
                                        <img src={attachedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-gray-200 shadow-lg" />
                                        <button
                                            onClick={() => setAttachedImage(null)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Ask anything or describe an image..."
                            className="w-full pl-24 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all resize-none shadow-sm"
                            rows="1"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !attachedImage) || isLoading}
                            className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-400 dark:text-gray-600">AskGPT integrates GPT-4o, Claude 3.5, and Gemini. Models may make mistakes.</p>
                    </div>
                </div>
            </main>
            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                {/* Close Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Appearance</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Toggle light/dark theme</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    // Note: I need to update the useTheme destructuring at the top of the file to include toggleTheme first.
                                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-indigo-600 transition-colors"
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Account Info */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                        U
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">User Account</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Logged In</p>
                                    </div>
                                </div>
                            </div>

                            {/* Data & Storage */}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white mb-2">Data & Storage</p>
                                <div className="space-y-2">
                                    <button
                                        onClick={deleteAllConversations}
                                        className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete All Chats
                                    </button>
                                    <button
                                        onClick={clearCache}
                                        className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        <Loader2 className="h-4 w-4" />
                                        Clear Cache & Reload
                                    </button>
                                </div>
                            </div>

                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
