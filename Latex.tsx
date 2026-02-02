import React, { useState, useEffect, useMemo } from 'react';

// Declare katex on window to avoid TS errors
declare global {
  interface Window {
    katex: any;
  }
}

interface LatexProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

export const Latex: React.FC<LatexProps> = ({ content, className = '', displayMode = false }) => {
  // State to track if katex script is loaded
  const [isKatexLoaded, setIsKatexLoaded] = useState(false);

  useEffect(() => {
    // Check if available immediately
    if (window.katex) {
      setIsKatexLoaded(true);
    } else {
      // Poll for it (since it's a defer script)
      const interval = setInterval(() => {
        if (window.katex) {
          setIsKatexLoaded(true);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  const html = useMemo(() => {
    if (!isKatexLoaded || !window.katex) return null;
    
    try {
      // renderToString does not check document.compatMode (quirks mode),
      // making it safer to use in various environments compared to render().
      return window.katex.renderToString(content, {
        throwOnError: false,
        displayMode: displayMode,
      });
    } catch (error) {
      console.error("KaTeX rendering error:", error);
      return null;
    }
  }, [content, displayMode, isKatexLoaded]);

  // Fallback to plain text if not loaded or error
  if (!html) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};