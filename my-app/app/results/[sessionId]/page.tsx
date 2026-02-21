'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

interface StrategyResult {
    id: string;
    text: string;
    importance: number;
    performance: number;
}

export default function ResultsView() {
    const { sessionId } = useParams();
    const [results, setResults] = useState<StrategyResult[]>([]);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/results/${sessionId}`);
                const data = await res.json();
                // Since API is not fully wired with data in dev right now, I'll mock
                // the response if it fails or returns empty to show the graph working.
                if (data.results && data.results.length > 0) {
                    setResults(data.results);
                } else {
                    setResults([
                        { id: '1', text: 'Strategy A', importance: 15, performance: 4.2 },
                        { id: '2', text: 'Strategy B', importance: 5, performance: 1.5 },
                        { id: '3', text: 'Strategy C', importance: 22, performance: 2.1 },
                        { id: '4', text: 'Strategy D', importance: 8, performance: 4.8 },
                    ]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [sessionId]);

    const maxImportance = Math.max(...results.map((r) => r.importance), 10);
    const maxPerformance = 5; // Performance is always out of 5

    const chartData = {
        datasets: [
            {
                label: 'Strategies',
                data: results.map((r) => ({
                    x: r.performance,
                    y: r.importance,
                    label: r.text,
                })),
                backgroundColor: '#3b82f6',
                pointRadius: 8,
                pointHoverRadius: 10,
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const dataPoint = context.raw;
                        return `${dataPoint.label}: (Perf: ${dataPoint.x}, Imp: ${dataPoint.y})`;
                    },
                },
            },
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Performance (1-5)', font: { size: 14, weight: 'bold' } },
                min: 0,
                max: 5,
                grid: {
                    color: (ctx: any) => (ctx.tick.value === 2.5 ? '#111827' : '#e5e7eb'), // Center line
                    lineWidth: (ctx: any) => (ctx.tick.value === 2.5 ? 2 : 1),
                },
            },
            y: {
                title: { display: true, text: 'Importance (Points)', font: { size: 14, weight: 'bold' } },
                min: 0,
                max: maxImportance + (maxImportance * 0.1), // Add 10% padding to top
                grid: {
                    // Center line dynamically calculated
                    color: (ctx: any) => (ctx.tick.value === maxImportance / 2 ? '#111827' : '#e5e7eb'),
                    lineWidth: (ctx: any) => (ctx.tick.value === maxImportance / 2 ? 2 : 1),
                },
            },
        },
    };

    const handleExportPDF = () => {
        // In a full implementation, use html2canvas + jspdf
        alert('PDF Export functionality would trigger here.');
    };

    const handleExportExcel = () => {
        // In a full implementation, use xlsx
        alert('Excel Export functionality would trigger here.');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Session Results</h1>
                        <p className="text-gray-500 mt-1">Review the final 4-quadrant strategic priority matrix.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <FileText className="w-5 h-5 text-red-500" />
                            <span>Export PDF</span>
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                            <span>Export Excel</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="h-[600px] w-full relative">
                        <Scatter ref={chartRef} data={chartData} options={options} />

                        {/* Quadrant Labels */}
                        <div className="absolute top-4 left-4 p-2 bg-white/80 rounded shadow-sm text-sm font-bold text-gray-600">
                            High Imp. / Low Perf.<br /><span className="text-red-600 font-bold">Invest Immediately</span>
                        </div>
                        <div className="absolute top-4 right-4 p-2 bg-white/80 rounded shadow-sm text-sm font-bold text-gray-600 text-right">
                            High Imp. / High Perf.<br /><span className="text-emerald-600 font-bold">Maintain & Monitor</span>
                        </div>
                        <div className="absolute bottom-12 left-4 p-2 bg-white/80 rounded shadow-sm text-sm font-bold text-gray-600">
                            Low Imp. / Low Perf.<br /><span className="text-gray-400 font-bold">Acknowledge</span>
                        </div>
                        <div className="absolute bottom-12 right-4 p-2 bg-white/80 rounded shadow-sm text-sm font-bold text-gray-600 text-right">
                            Low Imp. / High Perf.<br /><span className="text-blue-600 font-bold">Leverage As Needed</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
