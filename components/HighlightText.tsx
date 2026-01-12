
import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) {
    return <>{text}</>;
  }

  // Escape special characters for Regex
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span 
            key={i} 
            className="bg-yellow-300 text-black font-bold rounded-[2px] px-0.5 mx-[1px] shadow-sm inline-block leading-tight"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};
