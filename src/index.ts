import { StorageService } from './storage-service/index';
import { BrowserTabTracker } from './browser-tab-tracker/index';

const storageService = new StorageService();
const singleton = new BrowserTabTracker(storageService);

export { singleton as BrowserTabTracker };
