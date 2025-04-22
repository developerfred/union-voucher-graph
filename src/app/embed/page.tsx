/* eslint-disable  @next/next/no-html-link-for-pages */

import React from 'react';
import { Metadata } from 'next';

// Define dynamic metadata for this route
export const metadata: Metadata = {
  title: 'Union Voucher Graph - Interactive Network Visualization',
  description: 'Explore the Union protocol vouching network with this interactive visualization.',
  openGraph: {
    title: 'Union Voucher Graph',
    description: 'Explore the Union protocol vouching network with this interactive visualization.',
    images: ['/opengraph-image.png'],
    url: 'https://union-vouch.aipop.fun',
    type: 'website',
  },
};

// Generate the Farcaster Frame embed metadata
export default function Head() {
  // You can make this dynamic based on query parameters if needed
  const frameEmbed = {
    version: "next",
    imageUrl: "https://union-vouch.aipop.fun/opengraph-image.png",
    button: {
      title: "Explore Network",
      action: {
        type: "launch_frame",
        url: "https://union-vouch.aipop.fun",
        name: "Union Voucher Graph",
        splashImageUrl: "https://union-vouch.aipop.fun/logo.png",
        splashBackgroundColor: "#3b82f6"
      }
    }
  };

  return (
    <>
      <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-blue-600 text-white">
        <h1 className="text-4xl font-bold mb-4">Union Voucher Graph</h1>
        <p className="text-xl max-w-2xl mb-8">
          Interactive visualization of the Union protocol vouching network.
          Explore relationships, amount of vouches, and connections between participants.
        </p>
        <div className="w-full max-w-3xl mb-8">
          <img 
            src="/opengraph-image.png" 
            alt="Union Voucher Graph Preview" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <a 
            href="/" 
            className="px-6 py-3 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Open Full App
          </a>
          <a 
            href="https://github.com/developerfred/union-voucher-graph" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-700 text-white rounded-full font-bold text-lg hover:bg-blue-800 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </>
  );
}