export class SessionStorage {
  public set<T>(key: string, value: T) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  public get<T>(key: string): T | undefined {
    const json = sessionStorage.getItem(key);

    if (!json) {
      return;
    }

    try {
      const payload = JSON.parse(json) as T;
      return payload;
    } catch (e) {
      return;
    }
  }

  public remove(key: string) {
    sessionStorage.removeItem(key);
  }
}
