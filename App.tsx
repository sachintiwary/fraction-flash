
import React, { useState, useCallback } from 'react';
import { generateQuestions } from './utils/gameLogic';
import { generateAIQuestions } from './utils/gemini';
import { Question } from './types';
import { FlashCard } from './components/FlashCard';
import { Latex } from './components/Latex';
import { Button } from './components/Button';

type GameMode = 'memorize' | 'practice';
type AppState = 'menu' | 'playing' | 'results';

// Icons
const PracticeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const MemorizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export default function App() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [mode, setMode] = useState<GameMode>('memorize');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  // Initialize Standard Quiz (Memorize)
  const startMemorize = useCallback(() => {
    const newQuestions = generateQuestions(25); 
    setQuestions(newQuestions);
    setMode('memorize');
    resetGame();
    setAppState('playing');
  }, []);

  // Initialize Practice Mode (AI Powered)
  const startPractice = useCallback(async () => {
    setLoading(true);
    setMode('practice');
    setAppState('playing');
    resetGame();
    // Fetch batch of 10 questions
    const qBatch = await generateAIQuestions(10);
    setQuestions(qBatch);
    setLoading(false);
  }, []);

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setIsFlipped(false);
    setIsCorrect(null);
    setSelectedOption(null);
  };

  const handleOptionSelect = async (option: string) => {
    if (isFlipped || loading) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correct = option === currentQuestion.percent;

    setSelectedOption(option);
    setIsCorrect(correct);
    setIsFlipped(true);

    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    // Delay before next action
    setTimeout(() => {
      // Logic for moving to next question
      if (currentQuestionIndex < questions.length - 1) {
          nextQuestion();
      } else {
        // End of current set -> Go to Results
        setAppState('results');
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setIsFlipped(false);
    // Wait for the card to be halfway rotated (invisible) before changing content
    // Card flip duration is 700ms, so 350ms is ideal
    setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsCorrect(null);
        setSelectedOption(null);
    }, 350);
  };

  const goBackToMenu = () => {
      setAppState('menu');
      setQuestions([]);
  };

  // --- RENDERERS ---

  if (appState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-premium flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
         {/* Background Elements */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s'}}></div>
         </div>

        <div className="max-w-md w-full text-center relative z-10">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Fraction Flash
            </h1>
            <p className="text-indigo-200 text-lg font-light">
              Master the art of conversion
            </p>
          </div>
          
          <div className="space-y-4">
             <button 
                onClick={startMemorize}
                className="group w-full relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 text-left"
             >
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 group-hover:text-white transition-colors">
                     <MemorizeIcon />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white mb-1">Memorize Mode</h3>
                      <p className="text-sm text-slate-400">Master all 25 standard fractions</p>
                   </div>
                </div>
             </button>

             <button 
                onClick={startPractice}
                className="group w-full relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 text-left"
             >
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-purple-500/20 rounded-xl text-purple-300 group-hover:text-white transition-colors">
                     <PracticeIcon />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white mb-1">AI Practice</h3>
                      <p className="text-sm text-slate-400">Challenge yourself with new questions</p>
                   </div>
                </div>
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
        <div className="min-h-screen bg-gradient-premium flex flex-col items-center justify-center p-6 text-white relative">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative z-10">
                <p className="text-indigo-300 font-bold tracking-widest uppercase text-xs mb-4">Session Complete</p>
                <h2 className="text-4xl font-bold mb-2">You Scored</h2>
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-white mb-6">
                    {percentage}%
                </div>
                <p className="text-slate-300 mb-8">
                    You got <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{questions.length}</span> correct!
                </p>

                <div className="space-y-3">
                    {mode === 'practice' ? (
                         <Button onClick={startPractice} variant="secondary" className="w-full">
                            Take Another Test
                         </Button>
                    ) : (
                         <Button onClick={startMemorize} variant="secondary" className="w-full">
                            Retry Set
                         </Button>
                    )}
                    
                    <Button onClick={goBackToMenu} variant="outline" className="w-full">
                        Back to Menu
                    </Button>
                </div>
            </div>
        </div>
    )
  }

  // PLAYING STATE
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-premium flex flex-col items-center relative text-white">
      
      {/* Header */}
      <div className="w-full p-6 flex justify-between items-center z-20 max-w-4xl mx-auto">
        <button onClick={goBackToMenu} className="text-xs md:text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            EXIT
        </button>
        <div className="flex gap-4 md:gap-6">
            <div className="text-center">
                <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-bold">Progress</p>
                <p className="text-xs md:text-sm font-bold text-indigo-300">
                    {questions.length > 0 ? `${currentQuestionIndex + 1} / ${questions.length}` : '-'}
                </p>
            </div>
            <div className="text-center">
                <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-bold">Streak</p>
                <p className="text-xs md:text-sm font-bold text-orange-400">{streak}</p>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-2xl p-4 md:p-6 flex flex-col z-10 justify-start md:justify-center">
        
        {/* Loading State or Card */}
        {loading || !currentQuestion ? (
           <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-indigo-300 animate-pulse">Crafting {mode === 'practice' ? 'AI' : ''} questions...</p>
           </div>
        ) : (
           <>
                <FlashCard 
                    question={currentQuestion} 
                    isFlipped={isFlipped} 
                    isCorrect={isCorrect} 
                />

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-8 pb-8 md:pb-12">
                {currentQuestion.options.map((option, idx) => {
                    let statusClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200";
                    
                    if (isFlipped) {
                        if (option === currentQuestion.percent) {
                            statusClass = "bg-green-500/20 border-green-500 text-green-300 ring-1 ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"; 
                        } else if (option === selectedOption && option !== currentQuestion.percent) {
                            statusClass = "bg-red-500/20 border-red-500 text-red-300";
                        } else {
                            statusClass = "opacity-30 bg-black/20 border-transparent";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(option)}
                            disabled={isFlipped}
                            className={`h-16 md:h-20 rounded-xl border backdrop-blur-sm transition-all duration-300 flex items-center justify-center text-lg md:text-xl font-medium ${statusClass}`}
                        >
                            <Latex content={`\\displaystyle ${option}`} />
                        </button>
                    );
                })}
                </div>
           </>
        )}
      </div>
    </div>
  );
}
