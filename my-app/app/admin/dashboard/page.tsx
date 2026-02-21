'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Play, Users, Link as LinkIcon } from 'lucide-react';

export default function FacilitatorDashboard() {
    const router = useRouter();
    const [strategies, setStrategies] = useState([{ id: 1, text: '' }, { id: 2, text: '' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addStrategy = () => {
        if (strategies.length >= 150) return;
        setStrategies([...strategies, { id: Date.now(), text: '' }]);
    };

    const removeStrategy = (id: number) => {
        if (strategies.length <= 2) return;
        setStrategies(strategies.filter(s => s.id !== id));
    };

    const updateStrategy = (id: number, text: string) => {
        setStrategies(strategies.map(s => (s.id === id ? { ...s, text } : s)));
    };

    const createSession = async () => {
        const validStrategies = strategies.filter(s => s.text.trim().length > 0);

        if (validStrategies.length < 2) {
            setError('You must provide at least 2 valid strategies to run a session.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Create Session
            const sessionRes = await fetch('/api/sessions', { method: 'POST' });
            const sessionData = await sessionRes.json();

            if (!sessionRes.ok) throw new Error(sessionData.error);
            const sessionId = sessionData.session.id;

            // 2. Upload Strategies
            const stratRes = await fetch('/api/strategies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    strategies: validStrategies.map(s => s.text)
                })
            });

            if (!stratRes.ok) throw new Error('Failed to save strategies');

            // 3. Redirect to Live Monitor
            router.push(`/admin/session/${sessionId}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred creating the session');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Facilitator Dashboard</h1>
                        <p className="text-gray-500 mt-1">Configure your Paired Voting session and strategies.</p>
                    </div>
                    <button
                        onClick={createSession}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                <span>Start Session</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Strategies ({strategies.length}/150)</h2>
                        <button
                            onClick={addStrategy}
                            disabled={strategies.length >= 150}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Strategy</span>
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {strategies.map((strategy, index) => (
                            <div key={strategy.id} className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mt-1">
                                    {index + 1}
                                </div>
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        value={strategy.text}
                                        onChange={(e) => updateStrategy(strategy.id, e.target.value)}
                                        placeholder="Enter strategy description..."
                                        className="w-full text-gray-900 bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => removeStrategy(strategy.id)}
                                    disabled={strategies.length <= 2}
                                    className="flex-shrink-0 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 mt-1"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
