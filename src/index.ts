import { StorageService } from './storage-service/index';
import { BrowserTabTracker, SessionIdGenerator, SessionInfo } from './browser-tab-tracker/index';

const storageService = new StorageService();
const singleton = new BrowserTabTracker(storageService);

export { SessionIdGenerator, SessionInfo, singleton as BrowserTabTracker };
