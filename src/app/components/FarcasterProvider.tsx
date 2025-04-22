'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';

const FarcasterContext = createContext(null);

export function useFarcaster() {
    return useContext(FarcasterContext);
}

export function FarcasterProvider({ children }) {
    const [farcasterUser, setFarcasterUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initFarcaster = async () => {
            try {
                // Hide the splash screen once the app is ready
                await sdk.actions.ready();
                setIsReady(true);

                // Store user context information
                if (sdk.context && sdk.context.user) {
                    setFarcasterUser({
                        fid: sdk.context.user.fid,
                        username: sdk.context.user.username,
                        displayName: sdk.context.user.displayName,
                        pfpUrl: sdk.context.user.pfpUrl,
                    });
                }

                // Set up event listeners
                sdk.on("frameAdded", () => {
                    console.log("Frame was added by user");
                });

                sdk.on("frameRemoved", () => {
                    console.log("Frame was removed by user");
                });
            } catch (error) {
                console.error("Error initializing Farcaster Mini App:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initFarcaster();

        return () => {
            // Clean up event listeners
            sdk.removeAllListeners();
        };
    }, []);

    const closeApp = async () => {
        try {
            await sdk.actions.close();
        } catch (error) {
            console.error("Error closing app:", error);
        }
    };

    const addFrame = async () => {
        try {
            await sdk.actions.addFrame();
        } catch (error) {
            console.error("Error adding frame:", error);
        }
    };

    const value = {
        user: farcasterUser,
        isLoading,
        isReady,
        closeApp,
        addFrame,
        context: sdk.context
    };

    return (
        <FarcasterContext.Provider value={value}>
            {children}
        </FarcasterContext.Provider>
    );
}