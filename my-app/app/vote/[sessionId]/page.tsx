'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function ParticipantVote() {
    const { sessionId } = useParams();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [roomState, setRoomState] = useState('waiting'); // waiting, importance, performance, completed
    const [questionIndex, setQuestionIndex] = useState(0);

    const [hasVotedCurrent, setHasVotedCurrent] = useState(false);

    // MOCK DATA for layout testing since we don't have the API fully wired for fetching strategies down to the client yet.
    const mockStrategies = [
        { id: '1', text: 'Strategy A: Reduce operational costs by 15%' },
        { id: '2', text: 'Strategy B: Launch 3 new product features' },
        { id: '3', text: 'Strategy C: Increase marketing spend by 10%' }
    ];

    useEffect(() => {
        if (!sessionId) return;
        const socketIo = io();

        socketIo.on('connect', () => {
            socketIo.emit('join_session', sessionId);
        });

        socketIo.on('room_state_changed', (data: any) => {
            setRoomState(data.state);
            setQuestionIndex(data.questionIndex);
            setHasVotedCurrent(false); // Reset vote block on new question/state
        });

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, [sessionId]);

    const submitVote = async (choice: string | number) => {
        setHasVotedCurrent(true);

        // In a real implementation: Make a POST request to /api/votes/importance or /api/votes/performance
        // For now, we mock the submission to let the user see the "Waiting for others" screen
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10 flex justify-center w-full">
                <h1 className="text-xl font-bold text-gray-900">Paired Voting Session</h1>
            </div>

            <div className="flex-1 p-4 flex items-center justify-center">

                {roomState === 'waiting' && (
                    <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Waiting Room</h2>
                        <p className="text-gray-500 mt-2">Please wait for the facilitator to officially start the session.</p>
                    </div>
                )}

                {hasVotedCurrent && roomState !== 'waiting' && roomState !== 'completed' && (
                    <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
                            <span className="text-green-600 text-3xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Vote Logged!</h2>
                        <p className="text-gray-500 mt-2">Waiting for other participants to finish voting.</p>
                    </div>
                )}

                {!hasVotedCurrent && roomState === 'importance' && (
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                        <div className="bg-blue-600 px-6 py-4">
                            <div className="flex justify-between items-center text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">
                                <span>Importance Evaluation</span>
                                <span>Question {questionIndex + 1}</span>
                            </div>
                            <h2 className="text-xl text-white font-semibold">Which strategy is more important?</h2>
                        </div>

                        <div className="p-6 md:p-10 flex flex-col space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-1">
                                <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl min-h-[160px] text-center">
                                    <span className="text-lg font-medium text-gray-800">{mockStrategies[0].text}</span>
                                </div>

                                <div className="hidden md:flex items-center justify-center text-gray-400 font-bold italic">VS</div>

                                <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl min-h-[160px] text-center">
                                    <span className="text-lg font-medium text-gray-800">{mockStrategies[1].text}</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                <button onClick={() => submitVote('A')} className="flex-1 py-4 px-6 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-colors">
                                    More Important (Left)
                                </button>
                                <button onClick={() => submitVote('Neutral')} className="flex-1 py-4 px-6 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold rounded-xl transition-colors">
                                    Neutral / Equal
                                </button>
                                <button onClick={() => submitVote('B')} className="flex-1 py-4 px-6 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl transition-colors">
                                    More Important (Right)
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!hasVotedCurrent && roomState === 'performance' && (
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                        <div className="bg-purple-600 px-6 py-4">
                            <div className="flex justify-between items-center text-purple-100 text-sm font-medium uppercase tracking-wider mb-2">
                                <span>Performance Evaluation</span>
                                <span>Question {questionIndex + 1}</span>
                            </div>
                            <h2 className="text-xl text-white font-semibold">How well does our organization execute this strategy today?</h2>
                        </div>

                        <div className="p-6 md:p-10 flex flex-col space-y-8">
                            <div className="flex items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl min-h-[160px] text-center">
                                <span className="text-xl font-bold text-gray-900">{mockStrategies[0].text}</span>
                            </div>

                            <div className="flex flex-col space-y-4">
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <button key={rating} onClick={() => submitVote(rating)} className="w-full flex items-center justify-between py-4 px-6 bg-white border border-gray-200 hover:border-purple-600 hover:bg-purple-50 text-gray-800 font-bold rounded-xl transition-all shadow-sm">
                                        <span>{rating === 1 ? '1 - Not Well At All' : rating === 5 ? '5 - Extremely Well' : rating}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {roomState === 'completed' && (
                    <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
                        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                            <span className="text-5xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Session Complete!</h2>
                        <p className="text-gray-500 mt-2">Thank you for voting. The facilitator will share the final results graph shortly.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
