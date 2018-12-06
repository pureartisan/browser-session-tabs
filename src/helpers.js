import Cookies from 'js-cookie';

import { sessionStorageGetItem, sessionStorageSetItem } from './session-storage';

const REGEX_EMPTY_STRING = /^\s*$/;

export const INVALID_STORAGE_KEY_ERROR = 'Invalid storage key';

export const getTabId = (storageKey) => {
	let tabId = sessionStorageGetItem(storageKey);
	if (!tabId) {
		tabId = parseInt(Cookies.get(storageKey) || 0);
		tabId = `${tabId + 1}`; // increase count
		sessionStorageSetItem(storageKey, tabId);
		Cookies.set(storageKey, tabId);
	}
	return tabId;
};

export const validateKey = (key) => {
	if (!key || REGEX_EMPTY_STRING.test(key)) {
		throw new Error(INVALID_STORAGE_KEY_ERROR);
	}
};
