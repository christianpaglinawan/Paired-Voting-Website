'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertCircle } from 'lucide-react';

export default function ParticipantJoin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preFilledSessionId = searchParams?.get('session');

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 4) {
      setError('Passcode must be at least 4 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sessions/${passcode}/join`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join session');
      }

      // On success, redirect to the voting/waiting room
      router.push(`/vote/${data.sessionId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Paired Voting</h1>
          <p className="text-blue-100">Enter your passcode to join the session</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                Session Passcode
              </label>
              <input
                id="passcode"
                type="text"
                autoComplete="off"
                required
                className="block w-full text-center text-3xl tracking-widest uppercase border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-4 bg-gray-50 uppercase text-gray-900 font-mono"
                placeholder="XXXXXX"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.toUpperCase().slice(0, 6))}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || passcode.length < 4}
              className="w-full flex items-center justify-center space-x-2 py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Session</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <a href="/admin/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                Facilitator Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
