
import React from 'react';

interface GoogleFormEmbedProps {
  formUrl: string;
}

export const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ formUrl }) => {
  // It's crucial that formUrl is correctly formatted for embedding.
  // e.g., ends with ?embedded=true
  // The setup screen attempts to add this, but a more robust solution might be needed.
  return (
    <iframe
      src={formUrl}
      width="100%"
      height="100%"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title="Google Form Exam"
      className="bg-white" // Google forms usually have white background
    >
      Loading exam form...
    </iframe>
  );
};
