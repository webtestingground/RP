'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Recording {
  callId: string;
  recordingUrl: string;
  duration?: number;
  createdAt: string;
  transcript?: string;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recordings', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setRecordings(data.recordings);
      } else {
        setError(data.error || 'Failed to load recordings');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const downloadRecording = async (recording: Recording) => {
    try {
      // Download the audio file
      const response = await fetch(recording.recordingUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `call_${recording.callId}_${new Date(recording.createdAt).toISOString().slice(0,10)}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download recording');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">🎙️ Call Recordings</h1>
              <p className="mt-2 text-slate-600">
                View and download your voice call recordings
              </p>
            </div>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Chat
            </Link>
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
                <p className="mt-4 text-slate-600">Loading recordings...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchRecordings}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            ) : recordings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-2xl">🎤</p>
                <p className="mt-4 text-slate-600">No recordings yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Start a voice call to create recordings
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-block rounded-lg bg-slate-700 px-6 py-2 text-white transition hover:bg-slate-600"
                >
                  Start Calling
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={fetchRecordings}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {recordings.map((recording) => (
                  <div
                    key={recording.callId}
                    className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎙️</span>
                          <div>
                            <p className="font-semibold text-slate-900">
                              Call Recording
                            </p>
                            <p className="text-sm text-slate-600">
                              {formatDate(recording.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-4 text-sm text-slate-600">
                          <span>⏱️ {formatDuration(recording.duration)}</span>
                          <span>🆔 {recording.callId.slice(0, 8)}...</span>
                        </div>

                        {recording.transcript && (
                          <div className="mt-3 rounded bg-slate-50 p-3">
                            <p className="text-xs font-semibold text-slate-700">
                              Transcript:
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {recording.transcript.substring(0, 200)}
                              {recording.transcript.length > 200 && '...'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => downloadRecording(recording)}
                          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                        >
                          ⬇️ Download
                        </button>
                        <audio
                          src={recording.recordingUrl}
                          controls
                          className="w-48"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
