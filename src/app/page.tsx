/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

'use client'
import React, { useState, useEffect } from 'react';
import { Moon, Sun, HelpCircle, Info, Filter, Zap } from 'lucide-react';
import UnionVouchGraph from './components/UnionVouchGraph';
import useVouchStore from '../store/vouchStore';
import FarcasterHeader from './components/FarcasterHeader';
import { useFarcaster } from './components/FarcasterProvider';
import { sdk } from '@farcaster/frame-sdk';

function App() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);
  const [user, setUser] = useState(null);
  const { loading, error, fetchGraphData, graphData } = useVouchStore();


  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize Farcaster Mini App SDK
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Check if we're in a Farcaster client
        if (window.parent !== window) {
          setIsFarcasterMiniApp(true);

          // Tell Farcaster we're ready to be displayed
          await sdk.actions.ready();

          // Get user context if available
          const context = await sdk.context;
          if (context?.user) {
            setUser(context.user);
          }

          // Listen for events
          sdk.on('frameAdded', () => {
            console.log('App was added by user');
          });

          sdk.on('frameRemoved', () => {
            console.log('App was removed by user');
          });
        }
      } catch (error) {
        console.error('Error initializing Farcaster Mini App:', error);
      }
    };

    initFarcaster();

    return () => {
      // Clean up event listeners
      if (isFarcasterMiniApp) {
        sdk.removeAllListeners();
      }
    };
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAddApp = async () => {
    if (isFarcasterMiniApp) {
      try {
        await sdk.actions.addFrame();
      } catch (error) {
        console.error('Error adding mini app:', error);
      }
    }
  };

  const handleClose = async () => {
    if (isFarcasterMiniApp) {
      try {
        await sdk.actions.close();
      } catch (error) {
        console.error('Error closing mini app:', error);
      }
    }
  };

  const handleShareGraph = async () => {
    if (isFarcasterMiniApp) {
      try {
        await sdk.actions.composeCast({
          text: "Exploring the Union vouching network with the Union Voucher Graph app. Check out the connections between users and vouches in the decentralized trust graph!",
          embeds: [window.location.origin]
        });
      } catch (error) {
        console.error('Error composing cast:', error);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-blue-600'} text-white p-4 shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Union Vouch Network</h1>
              <p className="text-sm opacity-80">Interactive visualization of the vouching network</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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

            {isFarcasterMiniApp && (
              <>
                <button
                  onClick={handleAddApp}
                  className={`px-4 py-2 rounded-lg font-medium ${isDarkMode
                      ? 'bg-purple-700 hover:bg-purple-600 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                >
                  Add App
                </button>

                <button
                  onClick={handleShareGraph}
                  className={`px-4 py-2 rounded-lg font-medium ${isDarkMode
                      ? 'bg-green-700 hover:bg-green-600 text-white'
                      : 'bg-green-600 text-white hover:bg-green-500'
                    }`}
                >
                  Share
                </button>
              </>
            )}

            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'}`}
              aria-label="Help"
              title="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'}`}
              aria-label="Legend"
              title="Show Legend"
            >
              <Info className="h-5 w-5" />
            </button>

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'}`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {!isFarcasterMiniApp && (
              <button
                onClick={toggleFullScreen}
                className={`px-4 py-2 rounded-lg font-medium ${isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            )}

            {isFarcasterMiniApp && (
              <button
                onClick={handleClose}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-500 hover:bg-red-400'}`}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {user && (
          <div className="container mx-auto mt-2 text-sm opacity-80">
            <span>Hello, {user.displayName || user.username || `fid:${user.fid}`}! Welcome to Union Voucher Graph.</span>
          </div>
        )}
      </header>

      {showHelp && (
        <div className={`container mx-auto p-4 mt-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">How to Use the Union Vouch Graph</h2>
            <button
              onClick={() => setShowHelp(false)}
              className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              ✕
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className="font-semibold mb-2">Navigation</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Drag to move around the graph</li>
                <li>Scroll to zoom in/out</li>
                <li>Click on nodes to view details</li>
                <li>Drag nodes to rearrange</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <h3 className="font-semibold mb-2">Searching</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the search bar to find users</li>
                <li>Search by name or address</li>
                <li>The graph will filter to show relevant connections</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <h3 className="font-semibold mb-2">Understanding the Graph</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Arrows show vouching direction</li>
                <li>Node size indicates activity level</li>
                <li>Node colors represent different types of users</li>
                <li>Click on a node to see its vouching relationships</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {showLegend && (
        <div className={`container mx-auto p-4 mt-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Graph Legend</h2>
            <button
              onClick={() => setShowLegend(false)}
              className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              ✕
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-semibold mb-2">Node Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 mr-2"></div>
                  <span>Active voucher (given more than 10 vouches)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 mr-2"></div>
                  <span>Popular recipient (received more than 10 vouches)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-orange-500 mr-2"></div>
                  <span>Big voucher (vouched more than $100K)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-purple-500 mr-2"></div>
                  <span>Big recipient (received more than $100K)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-500 mr-2"></div>
                  <span>Regular user</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Other Elements</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-10 h-0 border-t-2 border-red-500 mr-2 relative">
                    <div className="absolute right-0 top-0 transform -translate-y-1/2 rotate-45 w-3 h-0 border-t-2 border-red-500"></div>
                    <div className="absolute right-0 top-0 transform -translate-y-1/2 -rotate-45 w-3 h-0 border-t-2 border-red-500"></div>
                  </div>
                  <span>Active connection (when node is selected)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-0 border-t-2 border-gray-400 mr-2 relative">
                    <div className="absolute right-0 top-0 transform -translate-y-1/2 rotate-45 w-3 h-0 border-t-2 border-gray-400"></div>
                    <div className="absolute right-0 top-0 transform -translate-y-1/2 -rotate-45 w-3 h-0 border-t-2 border-gray-400"></div>
                  </div>
                  <span>Vouching relationship</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 mr-2"></div>
                  <span>Selected or connected node</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-400 mr-2"></div>
                  <span>Node size indicates activity level</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={`container mx-auto p-4 ${isFullScreen ? 'mt-0' : 'mt-4'}`}>
        <div
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}
          style={{
            height: isFullScreen ? '100vh' : 'calc(100vh - 200px)',
            minHeight: '600px',
            // Adjust for Farcaster safe areas if provided
            padding: isFarcasterMiniApp && sdk.context?.client?.safeAreaInsets ?
              `${sdk.context.client.safeAreaInsets.top}px ${sdk.context.client.safeAreaInsets.right}px ${sdk.context.client.safeAreaInsets.bottom}px ${sdk.context.client.safeAreaInsets.left}px` : ''
          }}
        >
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className={`text-red-500 text-center p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-red-50'} rounded-lg`}>
                <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                <p>{error}</p>
                <button
                  onClick={() => fetchGraphData()}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <UnionVouchGraph darkMode={isDarkMode} />
          )}
        </div>
      </main>

      {!isFullScreen && !isFarcasterMiniApp && (
        <footer className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white p-6 mt-8`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">About Union</h3>
                <p className="text-gray-300">
                  The Union network is a decentralized trust graph enabling
                  economic and social opportunities through vouching.
                </p>
                <p className="text-gray-300 mt-2">
                  Currently displaying {graphData.nodes.length} users and {graphData.links.length} vouching relationships.
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
                  <li><a href="https://discord.gg/codingshthefounder" className="text-blue-300 hover:text-white">Discord</a></li>
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