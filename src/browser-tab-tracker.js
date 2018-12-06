import { getTabId, validateKey } from './helpers';

const DEFAULT_STORAGE_KEY = 'browser-tab-tracker';

const TRACKER_NOT_INITIALISED_ERROR = 'Tracker is not initialised, please call the init() method. before accessing the current tab ID';

class BrowserTabTracker {

	constructor() {
		this._storageKey = DEFAULT_STORAGE_KEY;
		this._initialised = false;
	}

	get storageKey() {
		return this._storageKey;
	}

	set storageKey(storageKey) {
		validateKey(storageKey);
		this._storageKey = storageKey;
	}

	get currentTabIdInSession() {
		if (!this._initialised) {
			throw new Error(TRACKER_NOT_INITIALISED_ERROR);
		}
		return getTabId(this._storageKey);
	}

	init() {
		this._initialised = true;
		// initialise tab details
		getTabId(this._storageKey);
	};

}

export {
	BrowserTabTracker,
	TRACKER_NOT_INITIALISED_ERROR,
	DEFAULT_STORAGE_KEY
};
