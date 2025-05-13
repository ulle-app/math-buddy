
import React, { useEffect, useRef } from 'react';

interface ProblemCardProps {
  equation: string;
  isMathjaxLoaded: boolean;
}

declare global {
  interface Window {
    MathJax: any;
  }
}

const ProblemCard: React.FC<ProblemCardProps> = ({ equation, isMathjaxLoaded }) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [equation, isMathjaxLoaded]);

  return (
    <div className="bg-mathBuddy-cardBg rounded-lg p-4 mb-4">
      <h2 className="text-mathBuddy-teal text-lg font-bold mb-3">Current Problem</h2>
      <div 
        ref={containerRef} 
        className="text-white text-center text-base my-4 min-h-[40px]"
      >
        {`\\(${equation}\\)`}
      </div>
      <div className="flex justify-center mt-4">
        <button className="bg-mathBuddy-teal hover:bg-mathBuddy-tealLight text-white rounded-md px-4 py-2 transition-all duration-200">
          Get Hint
        </button>
      </div>
    </div>
  );
};

export default ProblemCard;
