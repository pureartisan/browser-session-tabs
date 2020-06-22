import { StorageService } from '../storage-service';

const DEFAULT_STORAGE_KEY = 'browser-session-info';
const REGEX_EMPTY_STRING = /^\s*$/;

const INVALID_STORAGE_KEY_ERROR = 'Invalid storage key';
const SESSION_ID_GENERATOR_NOT_SET_ERROR = 'Session ID generator not set';

export interface SessionInfo<T> {
  id: T;
  tab: number;
}

export type SessionIdGenerator<T> = () => T;

export class BrowserTabTracker<T> {
  private storageKeyName: string = DEFAULT_STORAGE_KEY;

  private sessionInfo: SessionInfo<T> = null as any;

  private generator: SessionIdGenerator<T> = null as any;

  constructor(private storageService: StorageService) {}

  /**
   * The current tab ID.
   * The tab ID starts from 1, and increments for every tab opened in the session.
   * @returns a number as a string
   */
  get tabId(): string {
    return `${this.sessionInfo.tab}`;
  }

  /**
   * The current session ID.
   * The session ID is shared across multiple browser tabs for a given session.
   * @returns a value returned by the SessionIdGenerator
   */
  get sessionId(): T {
    return this.sessionInfo.id;
  }

  /**
   * The name used for the `session storage` item and `cookie`
   */
  get storageKey(): string {
    return this.storageKeyName;
  }

  /**
   * Set the name used for the `session storage` item and `cookie`
   * This needs to be a none empty string.
   */
  set storageKey(key: string) {
    this.validateKey(key);
    this.storageKeyName = key;
  }

  /**
   * Set the session ID generator.
   */
  set sessionIdGenerator(generator: SessionIdGenerator<T>) {
    this.generator = generator;
  }

  /**
   * This should be called only after the `sessionIdGenerator` and `storageKey` are set.
   */
  public initialize(): void {
    if (!this.sessionInfo) {
      this.sessionInfo = this.generateSessionInfo();
    }
  }

  private generateSessionInfo(): SessionInfo<T> {
    // if the page has been refreshed in the same tab,
    // we expect the info to be in session storage already
    let sessionInfo = this.storageService.sessionStorageGet<SessionInfo<T>>(this.storageKeyName) as SessionInfo<T>;

    // first time ever on this browser tab?
    // we expect the session storage to not have the info
    if (!sessionInfo) {
      sessionInfo = this.generateNewTabId();
    }

    return sessionInfo;
  }

  private generateNewTabId(): SessionInfo<T> {
    // check if there's already a session in a different tab
    let sessionInfo = this.storageService.sessionCookieGet<SessionInfo<T>>(this.storageKeyName) as SessionInfo<T>;
    if (!sessionInfo) {
      sessionInfo = this.startNewSession();
    }
    sessionInfo.tab = sessionInfo.tab + 1; // increase count

    // save cookie, to be shared amongst other tabs in the same session
    this.storageService.sessionCookieSet(this.storageKeyName, sessionInfo);
    // save in session storage, just so it can be accessed within this tab
    this.storageService.sessionStorageSet(this.storageKeyName, sessionInfo);

    return sessionInfo;
  }

  private validateKey(key: string): void {
    if (!key || REGEX_EMPTY_STRING.test(key)) {
      throw new Error(INVALID_STORAGE_KEY_ERROR);
    }
  }

  private startNewSession(): SessionInfo<T> {
    this.validateSessionIdGenerator();
    return {
      id: this.generator(),
      tab: 0
    };
  }

  private validateSessionIdGenerator(): void {
    if (!this.generator) {
      throw new Error(SESSION_ID_GENERATOR_NOT_SET_ERROR);
    }
  }
}
