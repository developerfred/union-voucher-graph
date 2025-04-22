import React from 'react';

export default function FarcasterSplash() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-blue-600 z-50">
            <div className="w-24 h-24 mb-6 rounded-full bg-white p-4 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-600">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h-2v-6h2v6zm0-8h-2V8h2v2zm4 8h-2v-8h2v8zm0-10h-2V6h2v2z" fill="currentColor" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Union Vouch Graph</h1>
            <p className="text-white opacity-80">Loading visualization...</p>
            <div className="mt-6 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
    );
}