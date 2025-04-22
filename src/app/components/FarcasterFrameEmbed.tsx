'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';

type FrameEmbedProps = {
    title: string;
    description: string;
    imageUrl: string;
    buttonTitle: string;
    appName: string;
    appUrl: string;
    splashImageUrl: string;
    splashBackgroundColor: string;
};

const FarcasterFrameEmbed: React.FC<FrameEmbedProps> = ({
    title,
    description,
    imageUrl,
    buttonTitle,
    appName,
    appUrl,
    splashImageUrl,
    splashBackgroundColor,
}) => {
    const [absoluteImageUrl, setAbsoluteImageUrl] = useState(imageUrl);
    const [absoluteAppUrl, setAbsoluteAppUrl] = useState(appUrl);
    const [absoluteSplashImageUrl, setAbsoluteSplashImageUrl] = useState(splashImageUrl);

    useEffect(() => {
        // Convert relative URLs to absolute URLs if needed
        if (typeof window !== 'undefined') {
            if (!imageUrl.startsWith('http')) {
                setAbsoluteImageUrl(`${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`);
            }

            if (!appUrl.startsWith('http')) {
                setAbsoluteAppUrl(`${window.location.origin}${appUrl.startsWith('/') ? '' : '/'}${appUrl}`);
            }

            if (!splashImageUrl.startsWith('http')) {
                setAbsoluteSplashImageUrl(`${window.location.origin}${splashImageUrl.startsWith('/') ? '' : '/'}${splashImageUrl}`);
            }
        }
    }, [imageUrl, appUrl, splashImageUrl]);

    // Create Farcaster Frame embed metadata
    const frameEmbed = {
        version: "next",
        imageUrl: absoluteImageUrl,
        button: {
            title: buttonTitle,
            action: {
                type: "launch_frame",
                url: absoluteAppUrl,
                name: appName,
                splashImageUrl: absoluteSplashImageUrl,
                splashBackgroundColor: splashBackgroundColor
            }
        }
    };

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Farcaster Frame meta tag */}
            <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />

            {/* OpenGraph tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:url" content={absoluteAppUrl} />
            <meta property="og:type" content="website" />

            {/* Twitter tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImageUrl} />
        </Head>
    );
};

export default FarcasterFrameEmbed;