
import React, { useState, useEffect, useCallback } from 'react';
import { type ExamConfig } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { GoogleFormEmbed } from './GoogleFormEmbed';
import { WarningModal } from './WarningModal';
import { AlertTriangleIcon } from './icons';


interface ExamInProgressScreenProps {
  examConfig: ExamConfig;
  onFinishExam: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const ExamInProgressScreen: React.FC<ExamInProgressScreenProps> = ({
  examConfig,
  onFinishExam,
  isFullscreen,
  // toggleFullscreen // Provided by App.tsx at top level for global control
}) => {
  const [showVisibilityWarning, setShowVisibilityWarning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(examConfig.durationMinutes * 60);
  const [timeUp, setTimeUp] = useState<boolean>(false);
  const [visibilityChangeCount, setVisibilityChangeCount] = useState<number>(0);

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    // onFinishExam(); // Optionally auto-finish, or let user acknowledge
  }, []);


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!timeUp) { // Don't show warning if time is already up
          setShowVisibilityWarning(true);
          setVisibilityChangeCount(prev => prev + 1);
        }
      } else {
        setShowVisibilityWarning(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeUp]);

  // Try to enter fullscreen when component mounts, if not already.
  // This might be better initiated by user click on "Start Exam" or a dedicated button.
  // useEffect(() => {
  //   if (!isFullscreen && document.fullscreenEnabled) {
  //       // A direct call here might be blocked by browsers if not user-initiated.
  //       // Consider moving this to a button click if issues arise.
  //     // toggleFullscreen(); 
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);


  return (
    <div className={`flex flex-col h-screen w-screen transition-all duration-300 ${isFullscreen ? 'bg-slate-900' : 'bg-slate-800 shadow-2xl rounded-xl'} text-white overflow-hidden`}>
      <header className={`p-3 flex items-center justify-between ${isFullscreen ? 'bg-slate-950' : 'bg-slate-700 rounded-t-xl'} shadow-md`}>
        <h1 className="text-xl font-semibold text-sky-400">Exam in Progress</h1>
        <div className="flex items-center space-x-4">
            {visibilityChangeCount > 0 && !timeUp && (
                <div className="flex items-center text-yellow-400" title={`Tab switches detected: ${visibilityChangeCount}`}>
                    <AlertTriangleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">{visibilityChangeCount}</span>
                </div>
            )}
          {!timeUp ? (
             <CountdownTimer initialSeconds={examConfig.durationMinutes * 60} onTimeUp={handleTimeUp} />
          ) : (
            <div className="text-red-500 font-bold px-3 py-1.5 rounded bg-red-900/50">Time's Up!</div>
          )}
        </div>
      </header>

      <main className="flex-grow overflow-hidden relative">
        <GoogleFormEmbed formUrl={examConfig.formUrl} />
         {timeUp && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 p-8">
            <h2 className="text-4xl font-bold text-red-500 mb-4">Time's Up!</h2>
            <p className="text-slate-200 text-lg mb-6 text-center">
              Your exam time has concluded. Please ensure you have submitted your answers through the Google Form.
            </p>
            <button
              onClick={onFinishExam}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-black/70"
            >
              Acknowledge & End Session
            </button>
          </div>
        )}
      </main>
      
      {!timeUp && (
          <footer className={`p-2 text-center text-xs ${isFullscreen ? 'bg-slate-950' : 'bg-slate-700 rounded-b-xl'} text-slate-400`}>
            Please focus on your exam. Switching tabs or applications may be recorded.
          </footer>
        )}


      {showVisibilityWarning && !timeUp && (
        <WarningModal
          title="Visibility Warning"
          message={`You have switched away from the exam tab ${visibilityChangeCount} time(s). Please return to the exam immediately to avoid issues. Continuous tab switching may be flagged.`}
          onClose={() => setShowVisibilityWarning(false)}
        />
      )}
    </div>
  );
};
