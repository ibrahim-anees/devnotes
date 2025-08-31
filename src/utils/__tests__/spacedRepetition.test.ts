import { calculateNextReview } from '../spacedRepetition';

describe('Spaced Repetition Algorithm', () => {
  beforeEach(() => {
    // Mock Date.now() to return a consistent timestamp
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00 UTC
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should reset interval to 1 for "again" difficulty', () => {
    const result = calculateNextReview('again', 5, 2.5);
    
    expect(result.interval).toBe(1);
    expect(result.ease).toBe(2.3); // 2.5 - 0.2
    expect(result.nextReview.getTime()).toBe(1640995200000 + 24 * 60 * 60 * 1000); // +1 day
  });

  it('should slightly increase interval for "hard" difficulty', () => {
    const result = calculateNextReview('hard', 5, 2.5);
    
    expect(result.interval).toBe(6); // Math.floor(5 * 1.2)
    expect(result.ease).toBe(2.35); // 2.5 - 0.15
    expect(result.nextReview.getTime()).toBe(1640995200000 + 6 * 24 * 60 * 60 * 1000); // +6 days
  });

  it('should use ease factor for "good" difficulty', () => {
    const result = calculateNextReview('good', 3, 2.5);
    
    expect(result.interval).toBe(7); // Math.floor(3 * 2.5)
    expect(result.ease).toBe(2.5); // unchanged
    expect(result.nextReview.getTime()).toBe(1640995200000 + 7 * 24 * 60 * 60 * 1000); // +7 days
  });

  it('should significantly increase interval for "easy" difficulty', () => {
    const result = calculateNextReview('easy', 3, 2.5);
    
    expect(result.interval).toBe(9); // Math.floor(3 * 2.5 * 1.3)
    expect(result.ease).toBe(2.65); // 2.5 + 0.15
    expect(result.nextReview.getTime()).toBe(1640995200000 + 9 * 24 * 60 * 60 * 1000); // +9 days
  });

  it('should handle minimum ease factor', () => {
    const result = calculateNextReview('again', 1, 1.3);
    
    expect(result.ease).toBe(1.3); // Should not go below 1.3
  });

  it('should handle minimum interval', () => {
    const result = calculateNextReview('hard', 1, 1.3);
    
    expect(result.interval).toBe(1); // Should not go below 1
  });

  it('should use default values when not provided', () => {
    const result = calculateNextReview('good');
    
    expect(result.interval).toBe(2); // Math.floor(1 * 2.5)
    expect(result.ease).toBe(2.5);
  });
});
