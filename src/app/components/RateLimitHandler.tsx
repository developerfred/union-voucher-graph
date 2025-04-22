'use client'
import React, { useEffect, useState } from 'react';
import useVouchStore from '@/store/vouchStore';

/**
 * Component to handle and display rate limit errors
 */
const RateLimitHandler: React.FC = () => {
  const { isRateLimited, getRateLimitRemainingTime, retryAfterRateLimit } = useVouchStore();
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Update the countdown timer every second
  useEffect(() => {
    if (!isRateLimited) return;

    const updateTimer = () => {
      setRemainingTime(getRateLimitRemainingTime());
    };

    // Initial update
    updateTimer();

    // Set up interval for updates
    const interval = setInterval(updateTimer, 1000);

    // Auto-retry when timer reaches zero
    const checkAutoRetry = () => {
      if (remainingTime === "Ready to retry") {
        retryAfterRateLimit();
      }
    };

    // Check if we can auto-retry
    const retryCheck = setInterval(checkAutoRetry, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(retryCheck);
    };
  }, [isRateLimited, getRateLimitRemainingTime, retryAfterRateLimit, remainingTime]);

  if (!isRateLimited) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 my-4 rounded shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            API Rate Limit Exceeded
          </p>
          <p className="text-sm mt-1">
            The Neynar API rate limit has been exceeded. Please wait a moment before trying again.
          </p>
          {remainingTime && (
            <p className="text-sm mt-2 font-semibold">
              {remainingTime}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={() => retryAfterRateLimit()}
          disabled={remainingTime !== "Ready to retry"}
          className={`px-4 py-2 rounded text-sm font-medium ${
            remainingTime === "Ready to retry"
              ? "bg-orange-600 hover:bg-orange-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {remainingTime === "Ready to retry" ? "Retry Now" : "Please Wait"}
        </button>
      </div>
    </div>
  );
};

export default RateLimitHandler;