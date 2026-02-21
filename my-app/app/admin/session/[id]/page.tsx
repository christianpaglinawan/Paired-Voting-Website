'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Link as LinkIcon, AlertCircle, Play, CheckCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function FacilitatorLiveMonitor() {
    const { id } = useParams();
    const router = useRouter();

    const [session, setSession] = useState<any>(null);
    const [strategies, setStrategies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [socket, setSocket] = useState<Socket | null>(null);
    const [participantCount, setParticipantCount] = useState(0);
    const [roomState, setRoomState] = useState('waiting');
    const [questionIndex, setQuestionIndex] = useState(0);

    // Fetch session details
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/sessions/${id}/strategies`);
                const data = await res.json();
                if (data.strategies) setStrategies(data.strategies);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSession();
    }, [id]);

    // Connect WebSocket
    useEffect(() => {
        if (!id) return;
        const socketIo = io();

        socketIo.on('connect', () => {
            socketIo.emit('join_session', id);
        });

        socketIo.on('participant_count', (count: number) => {
            setParticipantCount(count);
        });

        socketIo.on('room_state_changed', (data: any) => {
            setRoomState(data.state);
            setQuestionIndex(data.questionIndex);
        });

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, [id]);

    const startPhase = (nextState: string) => {
        if (socket) {
            socket.emit('set_room_state', { sessionId: id, state: nextState, questionIndex: 0 });
        }
    };

    const nextQuestion = () => {
        if (socket) {
            socket.emit('set_room_state', { sessionId: id, state: roomState, questionIndex: questionIndex + 1 });
        }
    };

    const finishSession = () => {
        if (socket) {
            socket.emit('set_room_state', { sessionId: id, state: 'completed', questionIndex: 0 });
            router.push(`/results/${id}`);
        }
    };

    const joinLink = typeof window !== 'undefined' ? `${window.location.origin}?session=${id}` : '';

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                <div className="bg-blue-600 p-8 text-center text-white relative">
                    <h1 className="text-3xl font-bold">Session is Live</h1>
                    <div className="mt-4 inline-flex items-center space-x-2 bg-blue-700 rounded-full px-6 py-2 text-xl font-mono tracking-widest text-blue-100 uppercase box-shadow-inner border border-blue-500">
                        Passcode: <span className="font-bold text-white ml-2">XYZ123</span> {/* Fallback placeholder */}
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                            <Users className="w-12 h-12 text-blue-500" />
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-gray-900">{participantCount}</span>
                                <span className="block text-sm text-gray-500 font-medium tracking-wide uppercase mt-1">Active Participants</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                            <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-xs text-gray-400">QR Code Here</span>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(joinLink)}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                                <LinkIcon className="w-4 h-4" />
                                <span>Copy Join Link</span>
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Session Control</h2>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full uppercase tracking-wider">
                                {roomState} Data
                            </span>
                        </div>

                        {roomState === 'waiting' && (
                            <button onClick={() => startPhase('importance')} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-bold shadow-md transition-colors">
                                <span>Start Importance Voting</span>
                                <Play className="w-5 h-5 ml-1" />
                            </button>
                        )}

                        {roomState === 'importance' && (
                            <div className="space-y-4">
                                <div className="text-center font-medium text-gray-700 mb-2">
                                    Round {questionIndex + 1} of {Math.max(1, strategies.length - 1)}
                                </div>
                                {questionIndex < strategies.length - 2 ? (
                                    <button onClick={nextQuestion} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg font-bold shadow-md transition-colors">
                                        <span>Next Matchup</span>
                                        <Play className="w-5 h-5 ml-1" />
                                    </button>
                                ) : (
                                    <button onClick={() => startPhase('performance')} className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl text-lg font-bold shadow-md transition-colors">
                                        <span>Move to Performance Voting</span>
                                        <Play className="w-5 h-5 ml-1" />
                                    </button>
                                )}
                            </div>
                        )}

                        {roomState === 'performance' && (
                            <div className="space-y-4">
                                <div className="text-center font-medium text-gray-700 mb-2">
                                    Round {questionIndex + 1} of {Math.max(1, strategies.length)}
                                </div>
                                {questionIndex < strategies.length - 1 ? (
                                    <button onClick={nextQuestion} className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl text-lg font-bold shadow-md transition-colors">
                                        <span>Next Strategy</span>
                                        <Play className="w-5 h-5 ml-1" />
                                    </button>
                                ) : (
                                    <button onClick={finishSession} className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-lg font-bold shadow-md transition-colors">
                                        <span>End Voting & View Results</span>
                                        <CheckCircle className="w-5 h-5 ml-1" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
