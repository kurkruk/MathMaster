import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateProblem } from '../utils/mathUtils';
import { Problem, AnswerRecord } from '../types';
import { Keypad } from '../components/Keypad';
import { ProblemDisplay } from '../components/ProblemDisplay';

interface TrainingModeProps {
  onBack: () => void;
}

export const TrainingMode: React.FC<TrainingModeProps> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [score, setScore] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Initialize game
  const startGame = () => {
    setScore(0);
    setHistory([]);
    setTimeLeft(60);
    setIsPlaying(true);
    setAiFeedback(null);
    setCurrentProblem(generateProblem());
  };

  // Timer logic
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

  const handleAnswer = (answer: number) => {
    if (!currentProblem || !isPlaying) return;

    const isCorrect = answer === currentProblem.correctAnswer;
    
    // Add to history
    setHistory(prev => [...prev, {
      problem: currentProblem,
      selectedAnswer: answer,
      isCorrect,
      timeTaken: 0 // Simplification for now
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Next problem immediately regardless of correctness
    setCurrentProblem(generateProblem());
  };

  const getAIAnalysis = async () => {
    const wrongAnswers = history.filter(h => !h.isCorrect);
    if (wrongAnswers.length === 0) {
      setAiFeedback("完美！全对，继续保持！");
      return;
    }

    if (!process.env.API_KEY) {
      setAiFeedback("请配置 API KEY 以获取智能分析。");
      return;
    }

    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = wrongAnswers.map(w => 
        `${w.problem.num1} ${w.problem.operation} ${w.problem.num2} = ? (你选了 ${w.selectedAnswer}, 正确是 ${w.problem.correctAnswer})`
      ).join('\n');

      const prompt = `我是一个小学生，正在练习数学速算。这是我刚才做错的题：
      ${summary}
      请用简短、鼓励的语气，分析一下我的主要弱点是什么（比如是乘法不熟练，还是进位加法有问题）？给出一句中文建议。不要超过50个字。`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setAiFeedback(response.text);
    } catch (e) {
      console.error(e);
      setAiFeedback("AI 分析暂时不可用，请稍后再试。");
    } finally {
      setLoadingAi(false);
    }
  };

  // Game Over Screen
  if (!isPlaying && timeLeft === 0) {
    const wrongAnswers = history.filter(h => !h.isCorrect);
    
    return (
      <div className="flex flex-col h-full p-6 max-w-md mx-auto animate-in fade-in duration-300">
        <h2 className="text-3xl font-bold text-center mb-2">训练结束</h2>
        <div className="text-center mb-6">
          <span className="text-6xl font-black text-brand-600">{score}</span>
          <p className="text-slate-500 uppercase text-sm font-bold tracking-wider">总得分</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={startGame} className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <RefreshCw size={20} /> 再来一次
          </button>
          <button onClick={onBack} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-bold shadow active:scale-95 transition-transform">
            返回主页
          </button>
        </div>

        {/* AI Section */}
        <div className="mb-4">
             {!aiFeedback ? (
                <button 
                  onClick={getAIAnalysis}
                  disabled={loadingAi}
                  className="w-full bg-purple-100 text-purple-700 border border-purple-200 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                >
                  <BrainCircuit size={16} />
                  {loadingAi ? '分析中...' : '智能错题分析'}
                </button>
             ) : (
               <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg text-sm text-purple-800 leading-relaxed">
                 <span className="font-bold flex items-center gap-1"><BrainCircuit size={14}/> 老师点评:</span> {aiFeedback}
               </div>
             )}
        </div>

        <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
          <AlertCircle size={18} className="text-red-500" /> 错题回顾 ({wrongAnswers.length})
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {wrongAnswers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">太棒了！没有错题。</div>
          ) : (
            wrongAnswers.map((record, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm flex justify-between items-center">
                <span className="font-mono text-lg font-medium text-slate-700">
                  {record.problem.num1} {record.problem.operation} {record.problem.num2} = ?
                </span>
                <div className="text-right">
                  <div className="text-xs text-slate-400">你选了 <span className="text-red-500 font-bold strike-through decoration-red-500">{record.selectedAnswer}</span></div>
                  <div className="text-sm font-bold text-green-600">正确: {record.problem.correctAnswer}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Active Game Screen
  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600">
          <ArrowLeft />
        </button>
        <div className="text-2xl font-black text-brand-600">{score}</div>
        <div className={`text-xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200">
        <div 
          className="h-full bg-brand-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 pb-20">
        {currentProblem ? (
          <>
            <div className="mb-8 animate-in zoom-in duration-200">
               <ProblemDisplay problem={currentProblem} />
            </div>
            
            <Keypad 
              options={currentProblem.options} 
              onSelect={handleAnswer} 
            />
          </>
        ) : (
          <button 
            onClick={startGame}
            className="bg-brand-600 text-white text-2xl font-bold py-4 px-12 rounded-2xl shadow-xl hover:bg-brand-700 active:scale-95 transition-all"
          >
            开始训练
          </button>
        )}
      </div>
    </div>
  );
};