import * as Cookies from 'js-cookie';

export class StorageService {

  /**
   * Sets a given value identified by a given key, in session storage.
   * The value will be stored as a JSON string.
   */
  sessionStorageSet(key: string, value: any): void {
    const raw = JSON.stringify(value);
    window.sessionStorage.setItem(key, raw);
  }

  /**
   * Get a value from session storage, by a given key.
   * @returns The unserialised object if found, otherwise the provided default value.
   *          If no default value is provided, it returns `null`.
   */
  sessionStorageGet<T>(key: string, defaultValue?: T): T | null {
    try {
      const raw = window.sessionStorage.getItem(key) as string;
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // do nothing
    }
    return defaultValue === undefined ? null : defaultValue;
  }

  /**
   * Sets a given value identified by a given key, as a session cookie.
   * The value will be stored as a JSON string.
   */
  sessionCookieSet(key: string, value: any): void {
    const raw = JSON.stringify(value);
    Cookies.set(key, raw);
  }

  /**
   * Get a value from session cookies, by a given key.
   * @returns The unserialised object if found, otherwise the provided default value.
   *          If no default value is provided, it returns `null`.
   */
  sessionCookieGet<T>(key: string, defaultValue?: T): T | null {
    try {
      const raw = Cookies.get(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // do nothing
    }
    return defaultValue === undefined ? null : defaultValue;
  }

}
