import { Operation, Problem } from '../types';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateProblem = (): Problem => {
  const operations = [Operation.ADD, Operation.SUBTRACT, Operation.MULTIPLY, Operation.DIVIDE];
  const op = operations[getRandomInt(0, 3)];
  
  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  // Logic for single digit arithmetic (1-9)
  switch (op) {
    case Operation.ADD:
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      answer = num1 + num2;
      break;
    case Operation.SUBTRACT:
      num1 = getRandomInt(1, 18);
      num2 = getRandomInt(1, 9);
      // Ensure result is positive or zero, and within reasonable bounds for single digit feel
      if (num2 > num1) {
          const temp = num1;
          num1 = num2;
          num2 = temp;
      }
      answer = num1 - num2;
      break;
    case Operation.MULTIPLY:
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      answer = num1 * num2;
      break;
    case Operation.DIVIDE:
      // Working backwards to ensure integer division
      num2 = getRandomInt(1, 9);
      answer = getRandomInt(1, 9);
      num1 = num2 * answer;
      break;
  }

  // Generate Distractors
  const options = new Set<number>();
  options.add(answer);

  while (options.size < 3) {
    // Generate distractors close to the answer
    const offset = getRandomInt(-3, 3);
    const candidate = answer + offset;
    // Avoid negative answers if the actual answer is positive, keep it somewhat realistic
    if (candidate >= 0 && candidate !== answer) {
      options.add(candidate);
    } else if (candidate < 0) {
        options.add(getRandomInt(0, 10)); // Fallback
    }
  }

  return {
    id: Math.random().toString(36).substring(7),
    num1,
    num2,
    operation: op,
    correctAnswer: answer,
    options: shuffleArray(Array.from(options)),
  };
};

export const generateProblemBatch = (count: number): Problem[] => {
  return Array.from({ length: count }, () => generateProblem());
};