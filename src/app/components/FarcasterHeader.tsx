import React from 'react';
import { useFarcaster } from './FarcasterProvider';

export default function FarcasterHeader() {
    const { user, addFrame, closeApp } = useFarcaster();

    return (
        <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">Union Vouch Network</h1>
                    <p className="text-xs opacity-80">Visualizing the vouching network</p>
                </div>
                <div className="flex items-center space-x-2">
                    {user && (
                        <div className="flex items-center mr-2">
                            {user.pfpUrl && (
                                <img
                                    src={user.pfpUrl}
                                    alt={user.displayName || user.username || `User ${user.fid}`}
                                    className="w-6 h-6 rounded-full mr-2"
                                />
                            )}
                            <span className="text-sm truncate max-w-24">
                                {user.displayName || user.username || `User ${user.fid}`}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={addFrame}
                        className="px-2 py-1 bg-white text-blue-600 rounded text-xs font-medium hover:bg-blue-50"
                    >
                        Add App
                    </button>
                    <button
                        onClick={closeApp}
                        className="px-2 py-1 bg-transparent border border-white text-white rounded text-xs font-medium hover:bg-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </header>
    );
}