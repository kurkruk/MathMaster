export enum Operation {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '×',
  DIVIDE = '÷'
}

export interface Problem {
  id: string;
  num1: number;
  num2: number;
  operation: Operation;
  correctAnswer: number;
  options: number[]; // Array of 3 numbers
}

export interface AnswerRecord {
  problem: Problem;
  selectedAnswer: number;
  isCorrect: boolean;
  timeTaken: number;
}

export enum GameMode {
  MENU = 'MENU',
  TRAINING = 'TRAINING',
  LOCAL_BATTLE = 'LOCAL_BATTLE',
  ONLINE_BATTLE = 'ONLINE_BATTLE'
}

export interface PlayerState {
  score: number;
  combo: number;
  lastResult: 'correct' | 'wrong' | null;
}