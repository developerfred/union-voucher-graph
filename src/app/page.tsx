'use client'
import React, { useState } from 'react';
import UnionVouchGraph from './components/UnionVouchGraph';
import useVouchStore from '../store/vouchStore';

function App() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { loading, error } = useVouchStore();

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="app-container min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Union Vouch Network</h1>
            <p className="text-sm opacity-80">Interactive visualization of the vouching network</p>
          </div>
          <div className="flex items-center space-x-4">
            {loading && (
              <div className="flex items-center text-white">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading</span>
              </div>
            )}

            <button
              onClick={toggleFullScreen}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
            >
              {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
            </button>
          </div>
        </div>
      </header>

      <main className={`container mx-auto p-4 ${isFullScreen ? 'mt-0' : 'mt-6'}`}>
        <div
          className={`bg-white rounded-lg shadow-lg overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}
          style={{ height: isFullScreen ? '100vh' : 'calc(100vh - 200px)', minHeight: '600px' }}
        >
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500 text-center p-8">
                <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                <p>{error}</p>
                <button
                  onClick={() => useVouchStore.getState().fetchGraphData()}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <UnionVouchGraph />
          )}
        </div>
      </main>

      {!isFullScreen && (
        <footer className="bg-gray-800 text-white p-6 mt-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">About Union</h3>
                <p className="text-gray-300">
                  The Union network is a decentralized trust graph enabling
                  economic and social opportunities through vouching.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="https://github.com/developerfred/union-voucher-graph" className="text-blue-300 hover:text-white">Documentation</a></li>
                  <li><a href="https://github.com/developerfred/union-voucher-graph" className="text-blue-300 hover:text-white">API Reference</a></li>
                  <li><a href="https://github.com/developerfred/union-voucher-graph" className="text-blue-300 hover:text-white">GitHub Repository</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Connect</h3>
                <ul className="space-y-2">
                  <li><a href="https://x.com/codingsh" className="text-blue-300 hover:text-white">Twitter</a></li>
                  <li><a href="codingshthefounder" className="text-blue-300 hover:text-white">Discord</a></li>
                  <li><a href="https://t.me/codingsh" className="text-blue-300 hover:text-white">Telegram</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
              <p>© {new Date().getFullYear()} Union Network. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;