import { BrowserTabTracker } from './browser-tab-tracker';

const browserTabTrackerSingleton = new BrowserTabTracker();

export {
	browserTabTrackerSingleton as default
};
