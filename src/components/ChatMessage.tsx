
import React, { useEffect, useRef, useState } from 'react';
import { canPlotEquation, extractEquations, parseVectors } from '../services/ollamaService';
import EquationPlot from './EquationPlot';

export interface MessageProps {
  text: string;
  isUser: boolean;
  isMathjaxLoaded?: boolean;
}

const ChatMessage: React.FC<MessageProps> = ({ text, isUser, isMathjaxLoaded }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [equations, setEquations] = useState<string[]>([]);
  const [showPlot, setShowPlot] = useState(false);

  // Extract equations when the message changes
  useEffect(() => {
    if (!isUser && canPlotEquation(text)) {
      const extractedEquations = extractEquations(text);
      if (extractedEquations.length > 0) {
        setEquations(extractedEquations);
        setShowPlot(true);
      }
    }
  }, [text, isUser]);
  
  // Function to typeset math when content or MathJax changes
  useEffect(() => {
    if (isMathjaxLoaded && containerRef.current) {
      // Wait for the next tick to ensure the content is in the DOM
      setTimeout(() => {
        if (window.MathJax?.typeset) {
          window.MathJax.typeset([containerRef.current]);
        }
      }, 0);
    }
  }, [text, isMathjaxLoaded]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${!isUser && showPlot && equations.length > 0 ? 'message-with-plot' : ''}`}>
        <div 
          ref={containerRef}
          className={`p-4 rounded-lg ${
            isUser
              ? 'bg-mathBuddy-cardBg text-gray-100'
              : 'bg-mathBuddy-teal text-gray-50'
          } math-content shadow-lg`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
        
        {/* Show plot for equations if available */}
        {!isUser && showPlot && equations.length > 0 && (
          <EquationPlot equations={equations} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
