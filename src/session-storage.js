// wrapping to allow mocking for testing

export const sessionStorageGetItem = (key) => window.sessionStorage.getItem(key);

export const sessionStorageSetItem = (key) => window.sessionStorage.setItem(key);
