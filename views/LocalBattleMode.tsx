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
    
    if (!problem) return <div className="h-full flex items-center justify-center text-slate-400">准备...</div>;

    return (
      <div className={`h-full flex flex-col p-4 ${isRotated ? 'rotate-180' : ''}`}>
        <div className="flex justify-between items-center mb-2">
           <span className="text-sm font-bold text-slate-400">{player === 2 ? '对方' : '我方'}</span>
           <span className="text-3xl font-black text-brand-600">{score}</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-5xl font-mono font-bold text-slate-800 mb-6">
              {problem.num1} {problem.operation} {problem.num2}
            </div>
            
            <div className="grid grid-cols-3 gap-3 w-full">
              {problem.options.map((opt, i) => (
                <button
                  key={`${problem.id}-${i}`}
                  className="bg-white border-b-4 border-slate-200 rounded-lg aspect-square text-2xl font-bold text-slate-700 active:bg-brand-50 active:border-brand-200 transition-colors shadow-sm touch-none select-none"
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
         <Trophy className="text-yellow-500 w-24 h-24" />
         <h2 className="text-3xl font-bold text-slate-800">
            {winner === 'Draw' ? '平局!' : `${winner === 'P1' ? '下方玩家' : '上方玩家'} 获胜!`}
         </h2>
         <div className="flex items-center gap-12 text-2xl font-bold">
            <div className="text-center">
              <div className="text-sm text-slate-400 uppercase">上方 P2</div>
              <div className="text-4xl">{p2Score}</div>
            </div>
            <div className="text-slate-300">vs</div>
            <div className="text-center">
              <div className="text-sm text-slate-400 uppercase">下方 P1</div>
              <div className="text-4xl">{p1Score}</div>
            </div>
         </div>
         <div className="flex gap-4 w-full max-w-xs">
            <button onClick={startGame} className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold">再战</button>
            <button onClick={onBack} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold">退出</button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 relative overflow-hidden">
      {/* P2 Area (Top) */}
      <div className="flex-1 bg-red-50/50 border-b-2 border-slate-300">
        {isPlaying ? renderPlayerSide(2, p2Score, p2Index) : (
           <div className="h-full flex items-center justify-center rotate-180">
              <span className="text-slate-400 font-bold text-xl">等待开始...</span>
           </div>
        )}
      </div>

      {/* Middle Bar (Timer & Controls) */}
      <div className="h-12 bg-slate-800 flex items-center justify-between px-4 text-white z-10 shadow-xl">
        <div className="font-mono font-bold text-xl min-w-[3rem]">{timeLeft}s</div>
        
        {/* Simple Progress Bar inside the middle strip */}
        <div className="flex-1 mx-4 h-2 bg-slate-700 rounded-full overflow-hidden">
             <div 
               className="h-full bg-yellow-400 transition-all duration-1000 linear"
               style={{ width: `${(timeLeft / BATTLE_TIME) * 100}%` }}
             ></div>
        </div>

        {isPlaying ? (
           <button 
             onClick={handleExit}
             className="text-slate-400 hover:text-white p-1 rounded active:bg-slate-700"
             aria-label="退出"
           >
             <LogOut size={20} />
           </button>
        ) : (
          <button 
            onClick={startGame} 
            className="bg-yellow-500 text-slate-900 px-4 py-1 rounded font-bold text-sm active:scale-95 transition-transform"
          >
            开始
          </button>
        )}
      </div>

      {/* P1 Area (Bottom) */}
      <div className="flex-1 bg-blue-50/50">
        {isPlaying ? renderPlayerSide(1, p1Score, p1Index) : (
            <div className="h-full flex items-center justify-center flex-col gap-4">
               {!isPlaying && timeLeft === BATTLE_TIME && (
                 <>
                   <h1 className="text-2xl font-bold text-slate-700">双人对战</h1>
                   <div className="text-slate-500 text-sm">屏幕一分为二 · 面对面PK</div>
                   <button onClick={onBack} className="text-slate-400 underline text-sm mt-4">返回主页</button>
                 </>
               )}
            </div>
        )}
      </div>
    </div>
  );
};