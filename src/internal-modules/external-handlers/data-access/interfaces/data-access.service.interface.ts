export interface IDataAccessService<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<boolean>;
  retrieveAndCache(
    key: string,
    fetchFunction: () => Promise<T | null>,
    transformFunction: (data: T) => T,
    ttl?: number,
  ): Promise<T | null>;
}
