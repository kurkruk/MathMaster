import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Globe, LogOut } from 'lucide-react';
import { generateProblemBatch } from '../utils/mathUtils';
import { Problem } from '../types';
import { ProblemDisplay } from '../components/ProblemDisplay';
import { Keypad } from '../components/Keypad';

// Mock avatars
const BOT_NAMES = ["SpeedMath_X", "MathNinja88", "QuickCalc_CN", "Guest_9021"];
const PROBLEM_COUNT = 300;

interface OnlineBattleModeProps {
  onBack: () => void;
}

export const OnlineBattleMode: React.FC<OnlineBattleModeProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'IDLE' | 'SEARCHING' | 'MATCHED' | 'PLAYING' | 'RESULT'>('IDLE');
  const [opponent, setOpponent] = useState<string>('');
  const [countDown, setCountDown] = useState(3);
  
  // Game State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [gameTime, setGameTime] = useState(60);

  const oppIntervalRef = useRef<number | null>(null);

  // 1. Searching Phase
  useEffect(() => {
    if (status === 'SEARCHING') {
      const delay = Math.random() * 2000 + 1500; // 1.5s - 3.5s wait
      const timeout = setTimeout(() => {
        setOpponent(BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
        setStatus('MATCHED');
        // Prepare questions
        setProblems(generateProblemBatch(PROBLEM_COUNT));
        setCurrentIndex(0);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  // 2. Matched Countdown
  useEffect(() => {
    if (status === 'MATCHED') {
      if (countDown > 0) {
        const timer = setTimeout(() => setCountDown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setStatus('PLAYING');
      }
    }
  }, [status, countDown]);

  // 3. Playing Phase - Timer & Bot Logic
  useEffect(() => {
    if (status === 'PLAYING') {
      // Game Timer
      const timerInterval = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            setStatus('RESULT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Bot logic: Answers every 2-4 seconds with 85% accuracy
      const botLogic = () => {
         const reactionTime = Math.random() * 2000 + 2000; 
         oppIntervalRef.current = window.setTimeout(() => {
             // 85% chance to score
             if (Math.random() < 0.85) {
                 setOppScore(s => s + 1);
             }
             if (status === 'PLAYING') botLogic(); // Recursive loop
         }, reactionTime);
      };
      
      botLogic();

      return () => {
        clearInterval(timerInterval);
        if (oppIntervalRef.current) clearTimeout(oppIntervalRef.current);
      };
    }
  }, [status]);

  const handleStartSearch = () => {
    setStatus('SEARCHING');
    setMyScore(0);
    setOppScore(0);
    setGameTime(60);
    setCountDown(3);
  };

  const handleAnswer = (val: number) => {
    if (status !== 'PLAYING') return;
    
    const currentProblem = problems[currentIndex];
    if (!currentProblem) return;

    if (val === currentProblem.correctAnswer) {
      setMyScore(s => s + 1);
    }
    // Move to next question in the pre-generated batch
    setCurrentIndex(prev => Math.min(prev + 1, PROBLEM_COUNT - 1));
  };

  const handleExitGame = () => {
    if (confirm("确定要退出比赛吗？将被视为失败。")) {
        setStatus('IDLE');
        onBack();
    }
  };

  // --- Render Views ---

  if (status === 'IDLE') {
    return (
      <div className="h-full flex flex-col p-6 items-center justify-center bg-slate-50">
        <button onClick={onBack} className="absolute top-4 left-4 p-2 text-slate-400">
           <ArrowLeft />
        </button>
        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Globe className="w-16 h-16 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">在线 PK</h2>
        <p className="text-slate-500 mb-8 text-center">随机匹配在线玩家<br/>一分钟极速对决</p>
        <button 
          onClick={handleStartSearch}
          className="w-full max-w-xs bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          开始匹配
        </button>
      </div>
    );
  }

  if (status === 'SEARCHING') {
     return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white">
           <div className="animate-spin mb-6">
              <RefreshIcon /> 
           </div>
           <p className="text-xl font-medium tracking-wider">正在寻找对手...</p>
           <button onClick={() => setStatus('IDLE')} className="mt-8 text-slate-400 text-sm border border-slate-700 px-4 py-2 rounded-full">取消</button>
        </div>
     );
  }

  if (status === 'MATCHED') {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-600/20 z-0"></div>
            
            {/* VS Animation */}
            <div className="flex items-center justify-around w-full max-w-md z-10 px-4">
                <div className="text-center animate-in slide-in-from-left duration-500">
                    <div className="w-20 h-20 bg-green-500 rounded-full mb-2 mx-auto flex items-center justify-center text-3xl font-bold">我</div>
                    <div className="font-bold">Player</div>
                </div>
                
                <div className="text-6xl font-black text-yellow-500 italic">VS</div>

                <div className="text-center animate-in slide-in-from-right duration-500">
                    <div className="w-20 h-20 bg-red-500 rounded-full mb-2 mx-auto flex items-center justify-center text-3xl font-bold">?</div>
                    <div className="font-bold">{opponent}</div>
                </div>
            </div>

            <div className="mt-12 text-6xl font-mono font-bold text-white animate-ping">
                {countDown}
            </div>
        </div>
      );
  }

  if (status === 'RESULT') {
    const won = myScore > oppScore;
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6">
         <div className={`text-6xl mb-6 ${won ? 'text-yellow-500' : 'text-slate-400'}`}>
            {won ? '🏆' : '💀'}
         </div>
         <h2 className="text-3xl font-bold mb-8">{won ? '你赢了!' : '你输了!'}</h2>
         
         <div className="flex w-full max-w-sm justify-between items-center mb-10 bg-white p-6 rounded-xl shadow-lg">
             <div className="text-center">
                 <div className="text-sm text-slate-400 mb-1">我方</div>
                 <div className="text-4xl font-bold text-green-600">{myScore}</div>
             </div>
             <div className="text-slate-200 text-2xl">vs</div>
             <div className="text-center">
                 <div className="text-sm text-slate-400 mb-1">{opponent}</div>
                 <div className="text-4xl font-bold text-red-500">{oppScore}</div>
             </div>
         </div>

         <div className="flex gap-4 w-full max-w-xs">
            <button onClick={handleStartSearch} className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold">再来一局</button>
            <button onClick={() => {setStatus('IDLE'); onBack();}} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold">返回</button>
         </div>
      </div>
    );
  }

  // Playing UI
  return (
    <div className="h-full flex flex-col bg-slate-50">
       {/* Top Status Bar */}
       <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
           <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">我</div>
               <span className="text-2xl font-bold">{myScore}</span>
           </div>
           
           <div className="flex flex-col items-center">
               <span className={`font-mono text-xl font-bold ${gameTime < 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                   {gameTime}
               </span>
               <span className="text-[10px] text-slate-400 uppercase tracking-widest">Time</span>
           </div>

           <div className="flex items-center gap-2 flex-row-reverse">
               <button 
                  onClick={handleExitGame}
                  className="mr-2 text-slate-500 hover:text-white"
               >
                 <LogOut size={18} />
               </button>
               <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">敌</div>
               <span className="text-2xl font-bold">{oppScore}</span>
           </div>
       </div>

       {/* Opponent Progress Visualization (Simple Bar) */}
       <div className="w-full h-1 bg-slate-200">
          <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(oppScore / (myScore + oppScore + 1)) * 100}%` }}></div>
       </div>

       {/* Game Area */}
       <div className="flex-1 flex flex-col items-center justify-center p-6">
           {problems[currentIndex] && (
               <>
                 <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm">
                    <ProblemDisplay problem={problems[currentIndex]} />
                 </div>
                 <Keypad options={problems[currentIndex].options} onSelect={handleAnswer} />
               </>
           )}
       </div>
    </div>
  );
};

const RefreshIcon = () => (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);