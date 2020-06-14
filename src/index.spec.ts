import { BrowserTabTracker } from './browser-tab-tracker';

import {
    BrowserTabTracker as BrowserTabTrackerSingleton
} from './index';

jest.mock('./browser-tab-tracker');

describe('Public API', () => {
  let singleton: jest.Mocked<BrowserTabTracker>;

  beforeEach(() => {
    singleton = (BrowserTabTracker as any).mock.instances[0];
  });
});
