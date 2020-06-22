import { StorageService } from '../storage-service';

import { BrowserTabTracker, SessionInfo } from './index';

jest.mock('../storage-service');

describe('BrowserTabTracker', () => {
  const storageService = {
    sessionStorageSet: jasmine.createSpy(),
    sessionStorageGet: jasmine.createSpy(),
    sessionCookieSet: jasmine.createSpy(),
    sessionCookieGet: jasmine.createSpy()
  };

  let service: BrowserTabTracker<string>;

  beforeEach(() => {
    service = new BrowserTabTracker<string>(storageService as StorageService);
  });

  describe('storageKey', () => {
    it('should be `browser-session-info` by default', () => {
      expect(service.storageKey).toEqual('browser-session-info');
    });

    it('should be able to set storageKey', () => {
      service.storageKey = 'my-key';
      expect(service.storageKey).toEqual('my-key');
    });

    it('should throw error when setting storageKey to an empty value', () => {
      expect(() => {
        service.storageKey = '';
      }).toThrow();
    });
  });

  describe('sessionIdGenerator', () => {
    it('should throw error if session id generator is not set', () => {
      expect(() => service.initialize()).toThrow();
    });

    it('should not throw error if session id generator is set', () => {
      service.sessionIdGenerator = () => 'something';
      expect(() => service.initialize()).not.toThrow();
    });

    it('should use session id generator to generate new session id', () => {
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(null);

      service.sessionIdGenerator = () => 'my-random-session-id';
      service.initialize();

      const result = service.sessionId;
      expect(result).toEqual('my-random-session-id');
    });
  });

  describe('tabId', () => {
    beforeEach(() => {
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(null);

      storageService.sessionStorageGet.calls.reset();
      storageService.sessionStorageSet.calls.reset();
      storageService.sessionCookieGet.calls.reset();
      storageService.sessionCookieSet.calls.reset();

      service.sessionIdGenerator = () => 'dummy-id';
    });

    it('should throw error if not initialized', () => {
      expect(() => {
        const result = service.tabId;
      }).toThrow();
    });

    it('should not throw error if initialized', () => {
      service.initialize();
      expect(() => {
        const result = service.tabId;
      }).not.toThrow();
    });

    it('should return a new tab id starting at 1 if there is not session storage', () => {
      service.initialize();
      expect(service.tabId).toEqual('1');
    });

    it('should return tab id stored in session storage', () => {
      const sessionInfo = buildSessionInfo({
        tab: 4
      });
      storageService.sessionStorageGet.and.returnValue(sessionInfo);

      service.initialize();

      // same as already in session storage
      expect(service.tabId).toEqual('4');

      // taken from session storage
      expect(storageService.sessionStorageGet).toHaveBeenCalled();
      expect(storageService.sessionStorageGet).toHaveBeenCalledWith(service.storageKey);

      // cookies are not checked
      expect(storageService.sessionCookieGet).not.toHaveBeenCalled();
    });

    it('should return incremented tab id stored in session cookie', () => {
      const sessionInfo = buildSessionInfo({
        tab: 8
      });
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(sessionInfo);

      service.initialize();

      // incremented tab id from previous tab
      expect(service.tabId).toEqual('9');

      // session storage is checked
      expect(storageService.sessionStorageGet).toHaveBeenCalled();
      expect(storageService.sessionStorageGet).toHaveBeenCalledWith(service.storageKey);

      // then session cookies are checked
      expect(storageService.sessionCookieGet).toHaveBeenCalled();
      expect(storageService.sessionCookieGet).toHaveBeenCalledWith(service.storageKey);
    });

    it('should save new session info in session cookie and storage when generated', () => {
      const sessionInfo = buildSessionInfo({
        id: 'my-session-id',
        tab: 3
      });
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(sessionInfo);

      // info is retrieved
      service.initialize();

      // saved in session storage (with incremented tab id)
      expect(storageService.sessionStorageSet).toHaveBeenCalled();
      expect(storageService.sessionStorageSet).toHaveBeenCalledWith(service.storageKey, {
        id: 'my-session-id',
        tab: 4
      });

      // saved in session cookie (with incremented tab id)
      expect(storageService.sessionCookieSet).toHaveBeenCalled();
      expect(storageService.sessionCookieSet).toHaveBeenCalledWith(service.storageKey, {
        id: 'my-session-id',
        tab: 4
      });
    });

    it('should save in storage and cookie only the first time the value is retrieved', () => {
      const sessionInfo = buildSessionInfo({
        tab: 2
      });
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(sessionInfo);

      // first retrieval
      service.initialize();

      // saved the first time
      expect(storageService.sessionStorageSet).toHaveBeenCalledTimes(1);
      expect(storageService.sessionCookieSet).toHaveBeenCalledTimes(1);

      // try to initialize multiple times
      service.initialize();
      service.initialize();

      // only saved the first time
      expect(storageService.sessionStorageSet).toHaveBeenCalledTimes(1);
      expect(storageService.sessionCookieSet).toHaveBeenCalledTimes(1);
    });
  });

  describe('sessionId', () => {
    beforeEach(() => {
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(null);

      storageService.sessionStorageGet.calls.reset();
      storageService.sessionStorageSet.calls.reset();
      storageService.sessionCookieGet.calls.reset();
      storageService.sessionCookieSet.calls.reset();

      service.sessionIdGenerator = () => 'dummy-id';
    });

    it('should throw error if not initialized', () => {
      expect(() => {
        const result = service.sessionId;
      }).toThrow();
    });

    it('should not throw error if initialized', () => {
      service.initialize();
      expect(() => {
        const result = service.sessionId;
      }).not.toThrow();
    });

    it('should return a new session id that was returned by the session id generator', () => {
      service.sessionIdGenerator = () => 'my-random-session-id';
      service.initialize();

      const result = service.sessionId;
      expect(result).toEqual('my-random-session-id');
    });

    it('should return session id stored in session storage', () => {
      const sessionInfo = buildSessionInfo({
        id: 'my-session-id-from-storage'
      });
      storageService.sessionStorageGet.and.returnValue(sessionInfo);

      service.initialize();

      // same as already in session storage
      expect(service.sessionId).toEqual('my-session-id-from-storage');

      // taken from session storage
      expect(storageService.sessionStorageGet).toHaveBeenCalled();
      expect(storageService.sessionStorageGet).toHaveBeenCalledWith(service.storageKey);

      // cookies are not checked
      expect(storageService.sessionCookieGet).not.toHaveBeenCalled();
    });

    it('should return incremented tab id stored in session cookie', () => {
      const sessionInfo = buildSessionInfo({
        id: 'my-session-id-from-cookie'
      });
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(sessionInfo);

      service.initialize();

      // taken from session cookie
      expect(service.sessionId).toEqual('my-session-id-from-cookie');

      // session storage is checked
      expect(storageService.sessionStorageGet).toHaveBeenCalled();
      expect(storageService.sessionStorageGet).toHaveBeenCalledWith(service.storageKey);

      // then session cookies are checked
      expect(storageService.sessionCookieGet).toHaveBeenCalled();
      expect(storageService.sessionCookieGet).toHaveBeenCalledWith(service.storageKey);
    });

    it('should save new session info in session cookie and storage when generated new tab id is created', () => {
      const sessionInfo = buildSessionInfo({
        id: 'my-session-id',
        tab: 3
      });
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(sessionInfo);

      // info is retrieved
      service.initialize();

      // saved in session storage (with incremented tab id)
      expect(storageService.sessionStorageSet).toHaveBeenCalled();
      expect(storageService.sessionStorageSet).toHaveBeenCalledWith(service.storageKey, {
        id: 'my-session-id',
        tab: 4 // tab id is incremented
      });

      // saved in session cookie (with incremented tab id)
      expect(storageService.sessionCookieSet).toHaveBeenCalled();
      expect(storageService.sessionCookieSet).toHaveBeenCalledWith(service.storageKey, {
        id: 'my-session-id',
        tab: 4 // tab id is incremented
      });
    });

    it('should save in storage and cookie only the first time the value is retrieved', () => {
      const sessionInfo = buildSessionInfo({
        id: 'my-session-id'
      });
      storageService.sessionStorageGet.and.returnValue(null);
      storageService.sessionCookieGet.and.returnValue(sessionInfo);

      // first retrieval
      service.initialize();

      // saved the first time
      expect(storageService.sessionStorageSet).toHaveBeenCalledTimes(1);
      expect(storageService.sessionCookieSet).toHaveBeenCalledTimes(1);

      // initialize again multiple times
      service.initialize();
      service.initialize();

      // only saved the first time
      expect(storageService.sessionStorageSet).toHaveBeenCalledTimes(1);
      expect(storageService.sessionCookieSet).toHaveBeenCalledTimes(1);
    });
  });

  function buildSessionInfo(props: any = {}): SessionInfo<number> {
    return {
      ...props
    };
  }
});
