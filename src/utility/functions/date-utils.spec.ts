import dateUtils from './date-utils';

describe('transformCreatedSinceToDate', () => {
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date(2023, 3, 15); // April 15, 2023
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the correct date for "last_week"', () => {
    const result = dateUtils.transformCreatedSinceToDate('last_week');
    const expectedDate = new Date(2023, 3, 8); // April 8, 2023
    expect(result).toEqual(expectedDate);
  });

  it('returns the correct date for "last_month"', () => {
    const result = dateUtils.transformCreatedSinceToDate('last_month');
    const expectedDate = new Date(2023, 2, 15); // March 15, 2023
    expect(result).toEqual(expectedDate);
  });

  it('returns the correct date for "last_year"', () => {
    const result = dateUtils.transformCreatedSinceToDate('last_year');
    const expectedDate = new Date(2022, 3, 15); // April 15, 2022
    expect(result).toEqual(expectedDate);
  });

  it('throws an error for an invalid input', () => {
    expect(() => {
      dateUtils.transformCreatedSinceToDate('invalid_input' as any);
    }).toThrow('Invalid input invalid_input');
  });

  it('handles edge case when current date is the last day of the month', () => {
    jest.setSystemTime(new Date(2023, 2, 31)); // March 31, 2023
    const result = dateUtils.transformCreatedSinceToDate('last_month');
    const expectedDate = new Date(2023, 1, 28); // February 28, 2023
    expect(result).toEqual(expectedDate);
  });

  it('handles edge case when current date is February 29 in a leap year', () => {
    jest.setSystemTime(new Date(2024, 1, 29)); // February 29, 2024
    const result = dateUtils.transformCreatedSinceToDate('last_year');
    const expectedDate = new Date(2023, 1, 28); // February 28, 2023
    expect(result).toEqual(expectedDate);
  });

  it('correctly handles the transition from January to December of the previous year', () => {
    jest.setSystemTime(new Date(2023, 0, 15)); // January 15, 2023
    const result = dateUtils.transformCreatedSinceToDate('last_month');
    const expectedDate = new Date(2022, 11, 15); // December 15, 2022
    expect(result).toEqual(expectedDate);
  });

  it('correctly handles a week transition from early January back to December', () => {
    jest.setSystemTime(new Date(2023, 0, 3)); // January 3, 2023
    const result = dateUtils.transformCreatedSinceToDate('last_week');
    const expectedDate = new Date(2022, 11, 27); // December 27, 2022
    expect(result).toEqual(expectedDate);
  });

  it('handles the case when the current date is the first day of the month', () => {
    jest.setSystemTime(new Date(2023, 3, 1)); // April 1, 2023
    const result = dateUtils.transformCreatedSinceToDate('last_month');
    const expectedDate = new Date(2023, 2, 1); // March 1, 2023
    expect(result).toEqual(expectedDate);
  });
});

describe('getDaysInMonth', () => {
  it('returns the correct number of days for January', () => {
    expect(dateUtils.getDaysInMonth(2023, 0)).toBe(31);
  });

  it('returns the correct number of days for February in a non-leap year', () => {
    expect(dateUtils.getDaysInMonth(2023, 1)).toBe(28);
  });

  it('returns the correct number of days for February in a leap year', () => {
    expect(dateUtils.getDaysInMonth(2024, 1)).toBe(29);
  });

  it('returns the correct number of days for March', () => {
    expect(dateUtils.getDaysInMonth(2023, 2)).toBe(31);
  });

  it('returns the correct number of days for April', () => {
    expect(dateUtils.getDaysInMonth(2023, 3)).toBe(30);
  });

  it('returns the correct number of days for May', () => {
    expect(dateUtils.getDaysInMonth(2023, 4)).toBe(31);
  });

  it('returns the correct number of days for June', () => {
    expect(dateUtils.getDaysInMonth(2023, 5)).toBe(30);
  });

  it('returns the correct number of days for July', () => {
    expect(dateUtils.getDaysInMonth(2023, 6)).toBe(31);
  });

  it('returns the correct number of days for August', () => {
    expect(dateUtils.getDaysInMonth(2023, 7)).toBe(31);
  });

  it('returns the correct number of days for September', () => {
    expect(dateUtils.getDaysInMonth(2023, 8)).toBe(30);
  });

  it('returns the correct number of days for October', () => {
    expect(dateUtils.getDaysInMonth(2023, 9)).toBe(31);
  });

  it('returns the correct number of days for November', () => {
    expect(dateUtils.getDaysInMonth(2023, 10)).toBe(30);
  });

  it('returns the correct number of days for December', () => {
    expect(dateUtils.getDaysInMonth(2023, 11)).toBe(31);
  });

  it('returns the correct number of days for February in different leap years', () => {
    expect(dateUtils.getDaysInMonth(2000, 1)).toBe(29);
    expect(dateUtils.getDaysInMonth(2004, 1)).toBe(29);
    expect(dateUtils.getDaysInMonth(2100, 1)).toBe(28);
    expect(dateUtils.getDaysInMonth(2400, 1)).toBe(29);
  });
});
