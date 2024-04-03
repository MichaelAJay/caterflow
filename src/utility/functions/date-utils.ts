const dateUtils = {
  transformCreatedSinceToDate(
    since: 'last_week' | 'last_month' | 'last_year',
  ): Date {
    const now = new Date();
    switch (since) {
      case 'last_week':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case 'last_month':
        return new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          Math.min(
            now.getDate(),
            this.getDaysInMonth(now.getFullYear(), now.getMonth() - 1),
          ),
        );
      case 'last_year':
        const lastYear = now.getFullYear() - 1;
        return new Date(
          lastYear,
          now.getMonth(),
          Math.min(
            now.getDate(),
            this.getDaysInMonth(lastYear, now.getMonth()),
          ),
        );
      default:
        throw new Error(`Invalid input ${since}`);
    }
  },

  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  },
};

export default dateUtils;
