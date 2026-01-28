
import { FRACTION_DATA } from '../constants';
import { Question } from '../types';

// Fisher-Yates shuffle algorithm
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Math Helpers ---

function getGCD(a: number, b: number): number {
  return b === 0 ? a : getGCD(b, a % b);
}

export function formatPercent(num: number, den: number): string {
  const total = num * 100;
  const whole = Math.floor(total / den);
  const remainder = total % den;

  if (remainder === 0) {
    return `${whole}\\%`;
  }

  const gcd = getGCD(remainder, den);
  const simpleRem = remainder / gcd;
  const simpleDen = den / gcd;

  return `${whole}\\frac{${simpleRem}}{${simpleDen}}\\%`;
}

export function generateDistractors(num: number, den: number, correctPercent: string): string[] {
  const distractors = new Set<string>();
  const total = num * 100;
  const whole = Math.floor(total / den);
  const remainder = total % den;

  // Calculate the simplified parts for the correct answer
  let targetDen = den;
  let targetRem = remainder;
  if (remainder > 0) {
      const common = getGCD(remainder, den);
      targetDen = den / common;
      targetRem = remainder / common;
  }
  
  // Helper to construct latex percent string
  const makeStr = (w: number, n: number, d: number) => {
    if (n === 0 || d === 1) return `${w}\\%`;
    return `${w}\\frac{${n}}{${d}}\\%`;
  };

  // Strategy 1: Same Denominator, Different Numerator (Hardest to guess)
  if (targetDen > 1) {
      // e.g. 7 9/13 -> 7 8/13, 7 10/13
      distractors.add(makeStr(whole, Math.max(1, targetRem - 1), targetDen));
      distractors.add(makeStr(whole, targetRem + 1, targetDen));
      // e.g. 7 4/13 (complement)
      if (targetRem !== targetDen - targetRem) {
          distractors.add(makeStr(whole, Math.abs(targetDen - targetRem), targetDen));
      }
  }

  // Strategy 2: Same Denominator, Different Whole Number
  distractors.add(makeStr(Math.max(0, whole - 1), targetRem, targetDen));
  distractors.add(makeStr(whole + 1, targetRem, targetDen));

  // Strategy 3: Subtle variations (Nearby whole numbers)
  distractors.add(`${whole + 2}\\%`);
  distractors.add(`${Math.max(1, whole - 2)}\\%`);

  // Convert Set to Array, filter out correct answer and exact duplicates
  let options = Array.from(distractors)
    .filter(opt => opt !== correctPercent)
    .slice(0, 3);
    
  // If we don't have enough (e.g. for exact percentages like 50%), add generic nearby
  while (options.length < 3) {
    let fakeWhole = whole + (options.length + 1) * (Math.random() > 0.5 ? 1 : -1);
    if (fakeWhole <= 0) fakeWhole = 1;
    options.push(`${fakeWhole}\\%`);
  }

  return options;
}

export const generateQuestions = (count: number = 25): Question[] => {
  // Shuffle the source data to get random starting points
  const shuffledData = shuffleArray(FRACTION_DATA);
  const selectedData = shuffledData.slice(0, count);

  return selectedData.map((item) => {
    // Parse fraction string "\frac{n}{d}" to generate smart distractors
    const match = item.fraction.match(/\\frac\{(\d+)\}\{(\d+)\}/);
    let options: string[] = [];

    if (match) {
      const num = parseInt(match[1]);
      const den = parseInt(match[2]);
      const distractors = generateDistractors(num, den, item.percent);
      options = shuffleArray([item.percent, ...distractors]);
    } else {
      // Fallback
      const otherItems = FRACTION_DATA.filter((d) => d.fraction !== item.fraction);
      const shuffledDistractors = shuffleArray(otherItems).slice(0, 3);
      options = shuffleArray([
        item.percent,
        ...shuffledDistractors.map((d) => d.percent),
      ]);
    }

    return {
      ...item,
      options,
    };
  });
};
