import React, { useState, useEffect } from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

/**
 * Componente de loading com feedback progressivo
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = 'Loading data...' }) => {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [stage, setStage] = useState(0);

  // Animação de pontos
  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Contador de tempo
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
      
      // Atualiza estágios baseado no tempo decorrido
      if (elapsed > 5 && stage === 0) {
        setStage(1);
      } else if (elapsed > 15 && stage === 1) {
        setStage(2);
      } else if (elapsed > 30 && stage === 2) {
        setStage(3);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [elapsed, stage]);

  // Mensagens por estágio
  const getStatusMessage = () => {
    switch (stage) {
      case 0:
        return 'Initializing graph...';
      case 1:
        return 'Fetching network data...';
      case 2:
        return 'Processing vouching relationships...';
      case 3:
        return 'This is taking longer than expected. Please wait...';
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
      
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      <p className="text-gray-600 mb-4">{getStatusMessage()}{dots}</p>
      
      {elapsed > 5 && (
        <div className="mt-4 w-full max-w-md">
          <div className="bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(elapsed * 2, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {elapsed} seconds elapsed
          </p>
        </div>
      )}
      
      {stage === 3 && (
        <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
          <p className="font-medium">The API rate limit may be affecting load times</p>
          <p className="text-sm mt-1">We&apos;re retrieving data gradually to avoid overloading the API.</p>
        </div>
      )}
    </div>
  );
};

export default LoadingIndicator;