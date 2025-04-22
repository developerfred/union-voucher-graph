import React from 'react';

export default function Head() {
  // Create Farcaster Frame embed metadata
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
      <title>Union Voucher Graph - Interactive Network Visualization</title>
      <meta name="description" content="Interactive visualization of the Union protocol's vouching network showing relationships, amount of vouches, and connections between participants." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      
      {/* Farcaster Frame meta tag */}
      <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />
      
      {/* OpenGraph tags */}
      <meta property="og:title" content="Union Voucher Graph" />
      <meta property="og:description" content="Interactive visualization of the Union protocol's vouching network" />
      <meta property="og:image" content="https://union-vouch.aipop.fun/opengraph-image.png" />
      <meta property="og:url" content="https://union-vouch.aipop.fun" />
      <meta property="og:type" content="website" />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Union Voucher Graph" />
      <meta name="twitter:description" content="Interactive visualization of the Union protocol's vouching network" />
      <meta name="twitter:image" content="https://union-vouch.aipop.fun/opengraph-image.png" />
    </>
  );
}