import { expect, use as chaiUse } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

import * as HelpersImport from '../src/helpers';

import { BrowserTabTracker, TRACKER_NOT_INITIALISED_ERROR, DEFAULT_STORAGE_KEY } from '../src/browser-tab-tracker';

chaiUse(sinonChai);

describe('BrowserTabTracker', () => {

    let getTabIdStub, validateKeyStub;

    beforeEach(() => {
        getTabIdStub = stub(HelpersImport, 'getTabId');
        validateKeyStub = stub(HelpersImport, 'validateKey');
    });

    afterEach(() => {
        getTabIdStub.restore();
        validateKeyStub.restore();
    });

    it('should not throw error when instantiating', () => {
        expect(() => new BrowserTabTracker()).to.not.throw();
    });

    describe('storageKey', () => {

        const DUMMY_VALID_KEY = 'my-valid-key';
        const DUMMY_INVALID_KEY = 'my-invalid-key';

        const DUMMY_INVALID_KEY_ERROR = 'Invalid Key';

        beforeEach(() => {
            validateKeyStub.withArgs(DUMMY_INVALID_KEY).throws(new Error(DUMMY_INVALID_KEY_ERROR));
        });

        it('should initialise storage key to default key', () => {
            const tracker = new BrowserTabTracker();
            tracker.init();
            expect(tracker.storageKey).to.equal(DEFAULT_STORAGE_KEY);
        });

        it('should be able to override default storge key', () => {
            const tracker = new BrowserTabTracker();
            tracker.storageKey = 'my-storage-key';
            tracker.init();
            expect(tracker.storageKey).to.equal('my-storage-key');
        });

        it('should not throw error when key is valid', () => {
            const tracker = new BrowserTabTracker();
            expect(() => {
                tracker.storageKey = DUMMY_VALID_KEY;
            }).to.not.throw();
        });

        it('should throw error when key is invalid', () => {
            const tracker = new BrowserTabTracker();
            expect(() => {
                tracker.storageKey = DUMMY_INVALID_KEY;
            }).to.throw(DUMMY_INVALID_KEY_ERROR);
        });

    });

    describe('init', () => {

        it('should call getTabId to initalise', () => {
            const tracker = new BrowserTabTracker();

            // getTabIdStub is not called
            expect(getTabIdStub).to.not.be.called;

            // set storage key
            tracker.storageKey = 'my-storage-key';

            // call init on the tracker
            tracker.init();

            expect(getTabIdStub).to.have.been.calledOnce;
            expect(getTabIdStub).to.have.been.calledWith('my-storage-key');
        });

    });

    describe('currentTabIdInSession', () => {

        const DUMMY_STORAGE_KEY = 'my-storage-key';
        const DUMMY_CURRENT_SESSION_TAB_ID = 'my-session-tab-id';

        it('should throw error if "currentTabIdInSession" is called before calling "init"', () => {
            const tracker = new BrowserTabTracker();
            expect(() => tracker.currentTabIdInSession).to.throw(TRACKER_NOT_INITIALISED_ERROR);
        });

        it('should return the result of "getTabId" when "currentTabIdInSession" is called"', () => {

            getTabIdStub.withArgs(DUMMY_STORAGE_KEY).returns(DUMMY_CURRENT_SESSION_TAB_ID);

            const tracker = new BrowserTabTracker();
            tracker.storageKey = DUMMY_STORAGE_KEY;
            tracker.init();

            expect(tracker.currentTabIdInSession).to.equal(DUMMY_CURRENT_SESSION_TAB_ID);
        });

    });

});
