import React from 'react';
import { Problem } from '../types';

interface ProblemDisplayProps {
  problem: Problem;
  size?: 'sm' | 'lg';
}

export const ProblemDisplay: React.FC<ProblemDisplayProps> = ({ problem, size = 'lg' }) => {
  const textClass = size === 'lg' ? 'text-6xl' : 'text-4xl';
  
  return (
    <div className={`flex justify-center items-center font-mono font-bold text-slate-700 tracking-wider ${textClass} py-4`}>
      <span>{problem.num1}</span>
      <span className="mx-3 text-brand-500">{problem.operation}</span>
      <span>{problem.num2}</span>
      <span className="mx-3">=</span>
      <span className="w-16 h-16 border-b-4 border-slate-300 rounded bg-slate-100 flex items-center justify-center text-slate-400">?</span>
    </div>
  );
};