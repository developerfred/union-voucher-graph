import React from 'react';
import { sdk } from '@farcaster/frame-sdk';

export default function ShareButton({ selectedNode }) {
    const shareApp = async () => {
        try {
            let text = "Exploring the Union vouching network with this interactive graph! 🔍";

            if (selectedNode) {
                text = `Check out ${selectedNode.name}'s vouching connections in the Union network! ${selectedNode.vouchesGiven} vouches given, ${selectedNode.vouchesReceived} received.`;
            }

            await sdk.actions.composeCast({
                text,
                embeds: ["https://union-vouch.aipop.fun/"] 
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <button
            onClick={shareApp}
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center justify-center"
        >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-3v10H9V8H6L12 2l6 6zm-6 10v2H6v-2h6z" fill="currentColor" />
            </svg>
            Share
        </button>
    );
}