
import React, { useState } from 'react';
import { type ExamConfig } from '../types';

interface ExamSetupScreenProps {
  onExamStart: (config: ExamConfig) => void;
}

export const ExamSetupScreen: React.FC<ExamSetupScreenProps> = ({ onExamStart }) => {
  const [formUrl, setFormUrl] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formUrl.trim()) {
      setError('Google Form URL is required.');
      return;
    }
    // Basic URL validation (must be improved for production)
    try {
      new URL(formUrl);
    } catch (_) {
      setError('Invalid Google Form URL format.');
      return;
    }
    if (!formUrl.includes('docs.google.com/forms')) {
        setError('Please provide a valid Google Form URL.');
        return;
    }


    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      setError('Exam duration must be a positive number of minutes.');
      return;
    }
    if (duration > 300) { // Max 5 hours
        setError('Duration cannot exceed 300 minutes.');
        return;
    }

    // A common issue: users might paste the direct view link instead of an embeddable one.
    // Google Forms often use /viewform. We can try to make it more embed-friendly.
    // For robust solution, instruct users or provide a checker.
    // This simple replacement might not cover all cases.
    let processedUrl = formUrl;
    if (formUrl.includes('/viewform') && !formUrl.includes('embedded=true')) {
        processedUrl = formUrl.replace('/viewform', '/viewform?embedded=true');
    } else if (!formUrl.includes('embedded=true') && formUrl.includes('docs.google.com/forms/d/e/')) {
        // Assuming it's a publish link that might not have /viewform but needs embedded=true
        // This is heuristic. Proper URL construction is complex.
        const separator = formUrl.includes('?') ? '&' : '?';
        processedUrl = `${formUrl}${separator}embedded=true`;
    }


    onExamStart({ formUrl: processedUrl, durationMinutes: duration });
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-lg text-center">
      <h1 className="text-3xl font-bold mb-8 text-sky-400">Online Exam Setup</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="formUrl" className="block text-sm font-medium text-slate-300 mb-1 text-left">
            Google Form URL
          </label>
          <input
            type="url"
            id="formUrl"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            placeholder="https://docs.google.com/forms/d/e/.../viewform"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-white"
            required
          />
           <p className="mt-1 text-xs text-slate-400 text-left">Paste the link to your Google Form exam.</p>
        </div>
        <div>
          <label htmlFor="durationMinutes" className="block text-sm font-medium text-slate-300 mb-1 text-left">
            Exam Duration (minutes)
          </label>
          <input
            type="number"
            id="durationMinutes"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g., 60"
            min="1"
            max="300"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-white"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Start Exam
        </button>
      </form>
    </div>
  );
};
