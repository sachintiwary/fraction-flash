import React, { useEffect, useState } from 'react';
import { Question } from '../types';
import { Latex } from './Latex';

interface FlashCardProps {
  question: Question;
  isFlipped: boolean;
  isCorrect: boolean | null;
}

export const FlashCard: React.FC<FlashCardProps> = ({ question, isFlipped, isCorrect }) => {
  // We manage content visibility to prevent "bleed through" on semi-transparent glass cards.
  // When backface-visibility is flaky (some browsers), you see the mirrored back text through the front.
  // This ensures the back content is hidden DOM-wise until needed.
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      // Show back immediately when flipping starts (or slightly after 90deg if we wanted to be perfect, but immediate is safer for rotation)
      // Actually, to prevent seeing it instantly, we can delay slightly or just rely on rotation.
      // But for the "mirrored text on front" issue, we care about when isFlipped is FALSE.
      setShowBack(true);
    } else {
      // Hide back after transition (700ms)
      const timer = setTimeout(() => setShowBack(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  return (
    <div className="w-full max-w-sm h-80 md:h-96 perspective-1000 mx-auto my-6 md:my-8 group cursor-default">
      <div
        className="relative w-full h-full text-center transition-transform duration-700 transform-style-3d"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front Face - Glassmorphism */}
        <div 
            className="absolute w-full h-full backface-hidden rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-6 p-6 border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
            style={{ 
              transform: 'rotateY(0deg)',
              // Hide front face content when flipped to prevent it interfering with back (optional but good for glass)
              opacity: isFlipped ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out',
              transitionDelay: isFlipped ? '0.2s' : '0s' // Fade out halfway
            }} 
        >
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>

          <p className="text-indigo-300 font-bold text-xs tracking-[0.2em] uppercase">Convert Fraction</p>
          
          <div className="flex-1 flex items-center justify-center w-full">
             <div className="text-6xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-lg scale-110">
                <Latex content={question.fraction} displayMode={true} />
             </div>
          </div>
          
          <p className="text-slate-400 text-xs md:text-sm font-light">Select the matching percentage</p>
        </div>

        {/* Back Face - Result */}
        <div 
            className={`absolute w-full h-full backface-hidden rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4 p-4 border-2 backdrop-blur-xl overflow-hidden ${
                isCorrect 
                  ? 'bg-green-900/40 border-green-500/50' 
                  : 'bg-red-900/40 border-red-500/50'
            }`}
            style={{ 
              transform: 'rotateY(180deg)',
              // Only show back content if flipped (prevents mirrored text bleeding through front)
              opacity: showBack ? 1 : 0, 
            }} 
        >
          {/* Status Icon Header */}
          <div className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} shadow-lg transform transition-all duration-500 scale-100`}>
                {isCorrect ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <p className={`font-bold text-lg uppercase tracking-wider ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
          </div>

          {/* Answer - Centered & Responsive Size */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
                <Latex content={question.percent} displayMode={true} />
            </div>
          </div>
          
          {/* Footer Equation */}
          <div className="text-slate-300 text-sm flex items-center justify-center gap-3 bg-black/20 px-4 py-2 rounded-lg">
             <Latex content={question.fraction} />
             <span className="text-slate-500 font-bold">=</span>
             <Latex content={question.percent} />
          </div>
        </div>
      </div>
    </div>
  );
};
