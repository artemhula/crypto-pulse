export const alertKeys = {
  all: ['alerts'] as const,
  list: () => [...alertKeys.all, 'list'] as const,
  byTicker: (ticker: string) =>
    [...alertKeys.all, 'coin', ticker.toLowerCase()] as const,
};
