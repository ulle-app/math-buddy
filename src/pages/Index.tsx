
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';

const Index: React.FC = () => {
  const [isMathjaxLoaded, setIsMathjaxLoaded] = useState(false);

  // Load MathJax
  useEffect(() => {
    // Check if MathJax is already loaded to avoid duplicates
    if (window.MathJax) {
      setIsMathjaxLoaded(true);
      return;
    }

    // Configure MathJax
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        packages: ['base', 'ams', 'noerrors', 'noundefined'],
      },
      svg: {
        fontCache: 'global',
        scale: 1.05, // Slightly increase size
      },
      options: {
        enableMenu: false,  // Disable context menu
        processHtmlClass: 'math-content',
      },
      startup: {
        ready: () => {
          window.MathJax.startup.defaultReady();
          setIsMathjaxLoaded(true);
        }
      }
    };

    // Add MathJax script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'; // Using SVG output
    script.async = true;
    
    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-mathBuddy-background">
      <Header />
      
      <div className="flex-1 overflow-hidden p-4 flex flex-col">
        <div className="flex-1 overflow-hidden bg-mathBuddy-background rounded-lg">
          <ChatWindow isMathjaxLoaded={isMathjaxLoaded} />
        </div>
      </div>
    </div>
  );
};

export default Index;
