import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage-service';

const DEFAULT_STORAGE_KEY = 'browser-session-info';
const REGEX_EMPTY_STRING = /^\s*$/;
const INVALID_STORAGE_KEY_ERROR = 'Invalid storage key';

export interface SessionInfo {
  id: string;
  tab: number;
}

export class BrowserTabTracker {

  private storageKeyName: string = DEFAULT_STORAGE_KEY;

  private sessionInfo: SessionInfo = null as any;

  constructor(private storageService: StorageService) {}

  /**
   * The current tab ID.
   * The tab ID starts from 1, and increments for every tab opened in the session.
   * @returns a number as a string
   */
  get tabId(): string {
    if (!this.sessionInfo) {
      this.sessionInfo = this.generateSessionInfo();
    }
    return `${this.sessionInfo.tab}`;
  }

  /**
   * The current session ID.
   * The session ID is shared across multiple browser tabs for a given session.
   * @returns a UUID (v4) as a string
   */
  get sessionId(): string {
    if (!this.sessionInfo) {
      this.sessionInfo = this.generateSessionInfo();
    }
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

  private generateSessionInfo(): SessionInfo {
    // if the page has been refreshed in the same tab,
    // we expect the info to be in session storage already
    let sessionInfo = this.storageService.sessionStorageGet<SessionInfo>(this.storageKeyName) as SessionInfo;

    // first time ever on this browser tab?
    // we expect the session storage to not have the info
    if (!sessionInfo) {
      sessionInfo = this.generateNewTabId();
    }

    return sessionInfo;
  }

  private generateNewTabId(): SessionInfo {
    // check if there's already a session in a different tab
    let sessionInfo = this.storageService.sessionCookieGet<SessionInfo>(this.storageKeyName) as SessionInfo;
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

  private startNewSession(): SessionInfo {
    return {
      id: uuidv4(),
      tab: 0
    };
  }

}
