
import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons'; // Assuming icons.tsx

interface CountdownTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');

    if (h > 0) {
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <div className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium tabular-nums
        ${timeLeft <= 0 ? 'text-red-400 bg-red-900/50' : 
          timeLeft < 60 ? 'text-orange-400 bg-orange-900/50' : 
          'text-green-400 bg-green-900/50'}`}
    >
        <ClockIcon className="w-4 h-4 mr-2"/>
        <span>{formatTime(timeLeft)}</span>
    </div>
  );
};
