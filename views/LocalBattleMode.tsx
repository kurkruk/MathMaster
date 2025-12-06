import React, { useState, useEffect } from 'react';
import { Trophy, LogOut } from 'lucide-react';
import { generateProblemBatch } from '../utils/mathUtils';
import { Problem } from '../types';

interface LocalBattleModeProps {
  onBack: () => void;
}

const BATTLE_TIME = 60;
const PROBLEM_COUNT = 300;

export const LocalBattleMode: React.FC<LocalBattleModeProps> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BATTLE_TIME);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  
  // Shared Question Bank State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [p1Index, setP1Index] = useState(0);
  const [p2Index, setP2Index] = useState(0);

  const startGame = () => {
    setP1Score(0);
    setP2Score(0);
    setP1Index(0);
    setP2Index(0);
    setTimeLeft(BATTLE_TIME);
    // Generate a shared batch of 300 questions so both players face the same sequence
    setProblems(generateProblemBatch(PROBLEM_COUNT));
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleAnswer = (player: 1 | 2, answer: number) => {
    if (!isPlaying) return;
    
    if (player === 1) {
      const problem = problems[p1Index];
      if (problem && answer === problem.correctAnswer) setP1Score(s => s + 1);
      // Move to next problem regardless of correctness
      setP1Index(i => Math.min(i + 1, PROBLEM_COUNT - 1));
    } else {
      const problem = problems[p2Index];
      if (problem && answer === problem.correctAnswer) setP2Score(s => s + 1);
      // Move to next problem regardless of correctness
      setP2Index(i => Math.min(i + 1, PROBLEM_COUNT - 1));
    }
  };

  const handleExit = () => {
    if (confirm("确定要退出对战吗？")) {
      setIsPlaying(false);
      onBack();
    }
  };

  // --- Render Helpers ---

  const renderPlayerSide = (player: 1 | 2, score: number, problemIndex: number) => {
    const isRotated = player === 2;
    const problem = problems[problemIndex];
    
    // Theme configurations
    const theme = player === 2 
      ? { 
          label: '红方', 
          textColor: 'text-red-900', 
          labelColor: 'text-red-600/70',
          scoreColor: 'text-red-700',
          buttonClass: 'active:bg-red-100 active:border-red-300',
          operatorColor: 'text-red-800'
        }
      : { 
          label: '蓝方', 
          textColor: 'text-blue-900', 
          labelColor: 'text-blue-600/70',
          scoreColor: 'text-blue-700',
          buttonClass: 'active:bg-blue-100 active:border-blue-300',
          operatorColor: 'text-blue-800'
        };

    if (!problem) return <div className={`h-full flex items-center justify-center ${theme.labelColor} font-bold`}>准备...</div>;

    return (
      <div className={`h-full flex flex-col p-6 ${isRotated ? 'rotate-180' : ''}`}>
        <div className="flex justify-between items-center mb-4">
           <span className={`text-sm font-black tracking-wider uppercase ${theme.labelColor}`}>{theme.label}</span>
           <span className={`text-4xl font-black ${theme.scoreColor}`}>{score}</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`text-6xl font-mono font-bold ${theme.operatorColor} mb-8 tracking-wide`}>
              {problem.num1} {problem.operation} {problem.num2}
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full">
              {problem.options.map((opt, i) => (
                <button
                  key={`${problem.id}-${i}`}
                  className={`
                    bg-white border-b-4 border-slate-200 rounded-xl aspect-square 
                    text-3xl font-bold text-slate-700 
                    transition-all shadow-sm touch-none select-none
                    ${theme.buttonClass}
                    active:scale-95 active:border-b-0 active:translate-y-1
                  `}
                  onPointerDown={(e) => {
                    e.preventDefault(); // Prevent browser gestures/ghost clicks
                    handleAnswer(player, opt);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
        </div>
      </div>
    );
  };

  if (!isPlaying && timeLeft === 0) {
    const winner = p1Score > p2Score ? 'P1' : p2Score > p1Score ? 'P2' : 'Draw';
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-8 space-y-8 animate-in fade-in">
         <Trophy className="text-yellow-500 w-24 h-24 drop-shadow-lg" />
         <h2 className="text-4xl font-black text-slate-800">
            {winner === 'Draw' ? '平局!' : `${winner === 'P1' ? '蓝方' : '红方'} 获胜!`}
         </h2>
         
         <div className="flex items-center gap-8 w-full max-w-sm justify-center">
            <div className="text-center p-4 bg-red-100 rounded-2xl min-w-[100px]">
              <div className="text-xs text-red-400 font-bold mb-1 uppercase">红方</div>
              <div className="text-5xl font-black text-red-600">{p2Score}</div>
            </div>
            <div className="text-slate-300 font-black text-2xl italic">VS</div>
            <div className="text-center p-4 bg-blue-100 rounded-2xl min-w-[100px]">
              <div className="text-xs text-blue-400 font-bold mb-1 uppercase">蓝方</div>
              <div className="text-5xl font-black text-blue-600">{p1Score}</div>
            </div>
         </div>

         <div className="flex gap-4 w-full max-w-xs mt-8">
            <button onClick={startGame} className="flex-1 bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">再战</button>
            <button onClick={onBack} className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-xl font-bold shadow active:scale-95 transition-transform">退出</button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 relative overflow-hidden">
      {/* P2 Area (Top - Red) */}
      <div className="flex-1 bg-red-100 border-b-2 border-red-200">
        {isPlaying ? renderPlayerSide(2, p2Score, p2Index) : (
           <div className="h-full flex items-center justify-center rotate-180 flex-col gap-2">
              <span className="text-red-300 font-black text-3xl">红方</span>
              <span className="text-red-300/60 font-medium text-sm">等待开始...</span>
           </div>
        )}
      </div>

      {/* Middle Bar (Timer & Controls) */}
      <div className="h-14 bg-slate-900 flex items-center justify-between px-6 text-white z-10 shadow-2xl ring-4 ring-slate-900/10">
        <div className="font-mono font-bold text-2xl w-16 text-center">{timeLeft}</div>
        
        {/* Simple Progress Bar */}
        <div className="flex-1 mx-6 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
             <div 
               className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000 linear"
               style={{ width: `${(timeLeft / BATTLE_TIME) * 100}%` }}
             ></div>
        </div>

        {isPlaying ? (
           <button 
             onClick={handleExit}
             className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
             aria-label="退出"
           >
             <LogOut size={20} />
           </button>
        ) : (
          <button 
            onClick={startGame} 
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-6 py-1.5 rounded-full font-black text-sm active:scale-95 transition-all shadow-[0_0_15px_rgba(234,179,8,0.5)]"
          >
            开始对战
          </button>
        )}
      </div>

      {/* P1 Area (Bottom - Blue) */}
      <div className="flex-1 bg-blue-100 border-t-2 border-blue-200">
        {isPlaying ? renderPlayerSide(1, p1Score, p1Index) : (
            <div className="h-full flex items-center justify-center flex-col gap-4">
               {!isPlaying && timeLeft === BATTLE_TIME && (
                 <>
                   <div className="mb-2">
                      <h1 className="text-3xl font-black text-slate-800 text-center">双人对决</h1>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">红方</span>
                        <span className="text-slate-400 text-xs">VS</span>
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">蓝方</span>
                      </div>
                   </div>
                   <button onClick={onBack} className="text-slate-400 font-medium text-sm py-2 px-4 hover:bg-slate-200 rounded-full transition-colors">返回主页</button>
                 </>
               )}
            </div>
        )}
      </div>
    </div>
  );
};