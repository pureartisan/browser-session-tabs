import { StorageService } from '../storage-service';

import { BrowserTabTracker, SessionInfo, SessionIdGenerator } from './index';

jest.mock('../storage-service');

describe('BrowserTabTracker', () => {
  const storageService = {
    sessionStorageSet: jest.fn(),
    sessionStorageGet: jest.fn(),
    sessionCookieSet: jest.fn(),
    sessionCookieGet: jest.fn()
  };

  let service: BrowserTabTracker<string>;

  beforeEach(() => {
    service = new BrowserTabTracker<string>(storageService as StorageService);
  });

  describe('storageKey', () => {
    it('should be `browser-session-info` by default', () => {
      expect(service.storageKey).toEqual('browser-session-info');
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(null);
    });

    describe('storageKey', () => {
      let sessionIdGenerator: SessionIdGenerator<string>;

      beforeEach(() => {
        sessionIdGenerator = () => 'dummy-id';
      });

      it('should be `browser-session-info` by default', () => {
        expect(service.storageKey).toEqual('browser-session-info');
      });

      it('should be able to set storage key when initializing', () => {
        service.initialize({
          sessionIdGenerator,
          storageKey: 'my-key'
        });
        expect(service.storageKey).toEqual('my-key');
      });

      it('should throw error if provided storage key is invalid', () => {
        expect(() => {
          service.initialize({
            sessionIdGenerator,
            storageKey: '     ' // invalid key
          });
        }).toThrow();
      });
    });

    describe('sessionIdGenerator', () => {
      it('should throw error if session id generator is invalid', () => {
        expect(() => {
          service.initialize({
            sessionIdGenerator: null as any
          });
        }).toThrow();
      });

      it('should not throw error if session id generator is valid', () => {
        const sessionIdGenerator = () => 'my-random-id';
        expect(() => {
          service.initialize({
            sessionIdGenerator
          });
        }).not.toThrow();
      });
    });

    describe('sessionStartedCallback', () => {
      let sessionIdGenerator: SessionIdGenerator<string>;

      beforeEach(() => {
        sessionIdGenerator = () => 'dummy-id';
      });

      it('should not throw error if session started callback is not provided', () => {
        expect(() => {
          service.initialize({
            sessionIdGenerator
          });
        }).not.toThrow();
      });

      it('should be able to set storage key when initializing', () => {
        // session info not in storage, so this will be a new session
        storageService.sessionStorageGet.mockReturnValue(null);
        storageService.sessionCookieGet.mockReturnValue(null);

        // new session id
        sessionIdGenerator = () => 'my-new-session-id';

        const callback = jest.fn();
        service.initialize({
          sessionIdGenerator,
          sessionStartedCallback: callback
        });

        expect(callback).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(
          'my-new-session-id', // session id
          '1' // tab id
        );
      });

      it('should not trigger the callback multiple times', () => {
        // session info not in storage, so this will be a new session
        storageService.sessionStorageGet.mockReturnValue(null);
        storageService.sessionCookieGet.mockReturnValue(null);

        const callback = jest.fn();
        service.initialize({
          sessionIdGenerator,
          sessionStartedCallback: callback
        });

        // called the first time
        expect(callback).toHaveBeenCalledTimes(1);

        // try to reinitialize multiple times
        service.initialize({
          sessionIdGenerator,
          sessionStartedCallback: callback
        });
        service.initialize({
          sessionIdGenerator,
          sessionStartedCallback: callback
        });

        // still only called the first time
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('tabId', () => {
    let sessionIdGenerator: SessionIdGenerator<string>;

    beforeEach(() => {
      jest.resetAllMocks();

      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(null);

      sessionIdGenerator = () => 'dummy-id';
    });

    it('should not throw error if not initialized', () => {
      expect(() => {
        const result = service.tabId;
      }).not.toThrow();
    });

    it('should return empty string if not initialized', () => {
      expect(service.tabId).toEqual('');
    });

    it('should not throw error if initialized', () => {
      service.initialize({ sessionIdGenerator });
      expect(() => {
        const result = service.tabId;
      }).not.toThrow();
    });

    it('should return a new tab id starting at 1 if there is not session storage', () => {
      service.initialize({ sessionIdGenerator });
      expect(service.tabId).toEqual('1');
    });

    it('should return tab id stored in session storage', () => {
      const sessionInfo = buildSessionInfo({
        tab: 4
      });
      storageService.sessionStorageGet.mockReturnValue(sessionInfo);

      service.initialize({ sessionIdGenerator });

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
      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(sessionInfo);

      service.initialize({ sessionIdGenerator });

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
      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(sessionInfo);

      // info is retrieved
      service.initialize({ sessionIdGenerator });

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
      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(sessionInfo);

      // first retrieval
      service.initialize({ sessionIdGenerator });

      // saved the first time
      expect(storageService.sessionStorageSet).toHaveBeenCalledTimes(1);
      expect(storageService.sessionCookieSet).toHaveBeenCalledTimes(1);

      // try to initialize multiple times
      service.initialize({ sessionIdGenerator });
      service.initialize({ sessionIdGenerator });

      // only saved the first time
      expect(storageService.sessionStorageSet).toHaveBeenCalledTimes(1);
      expect(storageService.sessionCookieSet).toHaveBeenCalledTimes(1);
    });
  });

  describe('sessionId', () => {
    let sessionIdGenerator: SessionIdGenerator<string>;

    beforeEach(() => {
      jest.resetAllMocks();

      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(null);

      sessionIdGenerator = () => 'dummy-id';
    });

    it('should not throw error if not initialized', () => {
      expect(() => {
        const result = service.sessionId;
      }).not.toThrow();
    });

    it('should return undefined if not initialized', () => {
      expect(service.sessionId).toBeUndefined();
    });

    it('should not throw error if initialized', () => {
      service.initialize({ sessionIdGenerator });
      expect(() => {
        const result = service.sessionId;
      }).not.toThrow();
    });

    it('should return a new session id that was returned by the session id generator', () => {
      sessionIdGenerator = () => 'my-custom-random-session-id';
      service.initialize({ sessionIdGenerator });

      const result = service.sessionId;
      expect(result).toEqual('my-custom-random-session-id');
    });

    it('should return session id stored in session storage', () => {
      const sessionInfo = buildSessionInfo({
        id: 'my-session-id-from-storage'
      });
      storageService.sessionStorageGet.mockReturnValue(sessionInfo);

      service.initialize({ sessionIdGenerator });

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
      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(sessionInfo);

      service.initialize({ sessionIdGenerator });

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
      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(sessionInfo);

      // info is retrieved
      service.initialize({ sessionIdGenerator });

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
      storageService.sessionStorageGet.mockReturnValue(null);
      storageService.sessionCookieGet.mockReturnValue(sessionInfo);

      // first retrieval
      service.initialize({ sessionIdGenerator });

      // saved the first time
      expect(storageService.sessionStorageSet).toHaveBeenCalledTimes(1);
      expect(storageService.sessionCookieSet).toHaveBeenCalledTimes(1);

      // initialize again multiple times
      service.initialize({ sessionIdGenerator });
      service.initialize({ sessionIdGenerator });

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
