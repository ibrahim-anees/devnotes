// Spaced repetition algorithm (simplified SM-2)
export const calculateNextReview = (
  difficulty: 'again' | 'hard' | 'good' | 'easy',
  currentInterval: number = 1,
  currentEase: number = 2.5
): { interval: number; ease: number; nextReview: Date } => {
  let newInterval = currentInterval;
  let newEase = currentEase;

  switch (difficulty) {
    case 'again':
      newInterval = 1;
      newEase = Math.max(1.3, currentEase - 0.2);
      break;
    case 'hard':
      newInterval = Math.max(1, Math.floor(currentInterval * 1.2));
      newEase = Math.max(1.3, currentEase - 0.15);
      break;
    case 'good':
      newInterval = Math.floor(currentInterval * newEase);
      break;
    case 'easy':
      newInterval = Math.floor(currentInterval * newEase * 1.3);
      newEase = currentEase + 0.15;
      break;
  }

  const nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
  
  return { interval: newInterval, ease: newEase, nextReview };
};
