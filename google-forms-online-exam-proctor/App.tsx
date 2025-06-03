
import React, { useState, useCallback } from 'react';
import { ExamSetupScreen } from './components/ExamSetupScreen';
import { ExamInProgressScreen } from './components/ExamInProgressScreen';
import { ExamFinishedScreen } from './components/ExamFinishedScreen';
import { AppView, type ExamConfig } from './types';
import { FullscreenIcon, ExitFullscreenIcon } from './components/icons'; // Assuming icons.tsx is created

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SETUP);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleExamStart = useCallback((config: ExamConfig) => {
    setExamConfig(config);
    setCurrentView(AppView.IN_PROGRESS);
    // Attempt to enter fullscreen when exam starts, if supported and desired
    // This needs to be triggered by a user gesture, so often better tied to a button in ExamInProgressScreen
  }, []);

  const handleExamFinish = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
    }
    setIsFullscreen(false);
    setCurrentView(AppView.FINISHED);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenEnabled) {
      alert("Fullscreen mode is not supported by your browser.");
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen API error:", error);
      setIsFullscreen(!!document.fullscreenElement); // Update state based on actual status
    }
  }, []);
  
  // Listen to fullscreen changes (e.g. user pressing ESC)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  const renderView = () => {
    switch (currentView) {
      case AppView.SETUP:
        return <ExamSetupScreen onExamStart={handleExamStart} />;
      case AppView.IN_PROGRESS:
        if (!examConfig) {
          // Should not happen, but as a fallback
          setCurrentView(AppView.SETUP);
          return <ExamSetupScreen onExamStart={handleExamStart} />;
        }
        return (
          <ExamInProgressScreen
            examConfig={examConfig}
            onFinishExam={handleExamFinish}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        );
      case AppView.FINISHED:
        return <ExamFinishedScreen onRestart={() => {
          setExamConfig(null);
          setCurrentView(AppView.SETUP);
        }} />;
      default:
        return <ExamSetupScreen onExamStart={handleExamStart} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white p-4 selection:bg-sky-500 selection:text-white">
      <div className="absolute top-4 right-4">
        {currentView === AppView.IN_PROGRESS && document.fullscreenEnabled && (
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <ExitFullscreenIcon className="w-6 h-6" /> : <FullscreenIcon className="w-6 h-6" />}
          </button>
        )}
      </div>
      <div className={`w-full transition-all duration-300 ease-in-out ${currentView === AppView.IN_PROGRESS && isFullscreen ? 'max-w-full h-screen' : 'max-w-4xl'}`}>
        {renderView()}
      </div>
       {currentView !== AppView.IN_PROGRESS && (
         <footer className="absolute bottom-4 text-center text-xs text-slate-400 w-full">
            Online Exam Proctor v1.0.0
        </footer>
       )}
    </div>
  );
};

export default App;
