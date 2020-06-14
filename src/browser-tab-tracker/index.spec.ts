import { StorageService } from '../storage-service';

import { BrowserTabTracker } from './index';

jest.mock('../storage-service');

describe('BrowserTabTracker', () => {

    let storageService: jest.Mocked<StorageService>;

    let service: BrowserTabTracker;

    beforeEach(() => {
        storageService = (StorageService as any).mock.instances[0];
        service = new BrowserTabTracker(storageService);
    });

});
