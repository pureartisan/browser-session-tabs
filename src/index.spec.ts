import { BrowserTabTracker } from './browser-tab-tracker';

import { BrowserTabTracker as BrowserTabTrackerSingleton } from './index';

jest.mock('./browser-tab-tracker');

describe('Public API', () => {
  it('should be an instance of BrowserTabTracker', () => {
    expect(BrowserTabTrackerSingleton instanceof BrowserTabTracker).toBe(true);
  });

  it('should be a singleton', () => {
    const instances = (BrowserTabTracker as any).mock.instances;
    expect(instances).toHaveLength(1);
    expect(BrowserTabTrackerSingleton).toBe(instances[0]);
  });
});
