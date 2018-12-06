// wrapping to allow mocking for testing

export const sessionStorageGetItem = (key) => window.sessionStorage.getItem(key);

export const sessionStorageSetItem = (key, value) => window.sessionStorage.setItem(key, value);
