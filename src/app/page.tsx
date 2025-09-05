'use client';

import { useState } from 'react';

interface Source {
  id: number;
  text: string;
  similarityScore: number;
  rerankScore: number;
}

export default function Home() {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !query.trim()) {
      setError('Please provide both text and a query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to format scores properly
  const formatScore = (score: any): number => {
    if (typeof score === 'number') {
      return Math.min(100, Math.max(0, Math.round(score * 100)));
    }
    if (typeof score === 'string') {
      const num = parseFloat(score);
      return isNaN(num) ? 0 : Math.min(100, Math.max(0, Math.round(num)));
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Mini RAG Application
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Input Text (Paste your complete content here)
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your complete text content here..."
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              required
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>

          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              required
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Processing...' : 'Get Answer'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {answer && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Answer</h2>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</p>
            </div>
          </div>
        )}

        {sources.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sources</h2>
            <div className="space-y-4">
              {sources.map((source) => (
                <div key={source.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-700">Source [{source.id}]</span>
                    <div className="text-sm text-gray-600">
                      Similarity: {formatScore(source.similarityScore)}% • 
                      Rerank: {formatScore(source.rerankScore)}%
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{source.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}