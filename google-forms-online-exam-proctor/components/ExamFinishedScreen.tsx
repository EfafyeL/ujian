
import React from 'react';
import { CheckCircleIcon } from './icons'; // Assuming icons.tsx

interface ExamFinishedScreenProps {
  onRestart: () => void;
}

export const ExamFinishedScreen: React.FC<ExamFinishedScreenProps> = ({ onRestart }) => {
  return (
    <div className="bg-slate-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-lg text-center">
      <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4 text-green-400">Exam Session Ended</h1>
      <p className="text-slate-300 mb-8">
        Your exam session has concluded. We hope you did well!
        If you haven't submitted your Google Form, please ensure you do so if still possible.
      </p>
      <button
        onClick={onRestart}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
      >
        Start New Exam Setup
      </button>
    </div>
  );
};
