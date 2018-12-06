import { expect, use as chaiUse } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import { JSDOM } from 'jsdom';

import Cookie from 'js-cookie';

import * as SessionStorage from '../src/session-storage';
import { getTabId, validateKey, INVALID_STORAGE_KEY_ERROR } from '../src/helpers';

chaiUse(sinonChai);

const { window } = new JSDOM('<!DOCTYPE html><p>Hello world</p>');

describe('Helpers', () => {

    const DUMMY_STORAGE_KEY = 'my-storage-key';
    const DUMMY_TAB_ID = '10';

    let cookieGetStub, cookieSetStub;
    let sessionStorageGetItemStub, sessionStorageSetItemStub;

    beforeEach(() => {
        cookieGetStub = stub(Cookie, 'get');
        cookieSetStub = stub(Cookie, 'set');
        sessionStorageGetItemStub = stub(SessionStorage, 'sessionStorageGetItem');
        sessionStorageSetItemStub = stub(SessionStorage, 'sessionStorageSetItem');
    });

    afterEach(() => {
        cookieGetStub.restore();
        cookieSetStub.restore();
        sessionStorageGetItemStub.restore();
        sessionStorageSetItemStub.restore();
    });

    describe('getTabId', () => {

        it('should return tab id from sessionStorage', () => {
            sessionStorageGetItemStub.withArgs(DUMMY_STORAGE_KEY).returns(DUMMY_TAB_ID);

            const tabId = getTabId(DUMMY_STORAGE_KEY);
            expect(tabId).to.equal(DUMMY_TAB_ID);
        });

        it('should not check or update cookies and not update sessionStorage if already in sessionStorage', () => {
            sessionStorageGetItemStub.withArgs(DUMMY_STORAGE_KEY).returns(DUMMY_TAB_ID);

            const tabId = getTabId(DUMMY_STORAGE_KEY);
            expect(tabId).to.equal(DUMMY_TAB_ID);

            expect(cookieGetStub).to.not.have.been.called;
            expect(cookieSetStub).to.not.have.been.called;
            expect(sessionStorageSetItemStub).to.not.have.been.called;
        });

        it('should get previous tab id from cookies and return incremented tab id if not in sessionStorage', () => {
            cookieGetStub.withArgs(DUMMY_STORAGE_KEY).returns(DUMMY_TAB_ID);
            const incrementedValue = `${parseInt(DUMMY_TAB_ID) + 1}`;

            const tabId = getTabId(DUMMY_STORAGE_KEY);
            expect(tabId).to.equal(incrementedValue);
        });

        it('should update cookies and sessionStorage if not already in sessionStorage', () => {
            cookieGetStub.withArgs(DUMMY_STORAGE_KEY).returns(DUMMY_TAB_ID);
            const incrementedValue = `${parseInt(DUMMY_TAB_ID) + 1}`;

            const tabId = getTabId(DUMMY_STORAGE_KEY);
            expect(tabId).to.equal(incrementedValue);

            expect(cookieSetStub).to.have.been.calledOnce;
            expect(cookieSetStub).to.have.been.calledWith(DUMMY_STORAGE_KEY, incrementedValue);

            expect(sessionStorageSetItemStub).to.have.been.calledOnce;
            expect(sessionStorageSetItemStub).to.have.been.calledWith(DUMMY_STORAGE_KEY, incrementedValue);
        });

        it('should return "1" if no data is found in sessionStorage or cookies', () => {
            const tabId = getTabId(DUMMY_STORAGE_KEY);
            expect(tabId).to.equal('1');
        });

        // it('should return incremented value when getTabId', () => {
        //     const tabId = getTabId(DUMMY_STORAGE_KEY);
        //     expect(tabId).to.equal('1');
        // });

    });

    describe('validateKey', () => {

        it('should not throw error when key ivalid string', () => {
            expect(() => validateKey('some valid string')).to.not.throw();
        });

        it('should throw error when key is undefined', () => {
            expect(() => validateKey(undefined)).to.throw(INVALID_STORAGE_KEY_ERROR);
        });

        it('should throw error when key is null', () => {
            expect(() => validateKey(null)).to.throw(INVALID_STORAGE_KEY_ERROR);
        });

        it('should throw error when key is empty string', () => {
            expect(() => validateKey('')).to.throw(INVALID_STORAGE_KEY_ERROR);
        });

        it('should throw error when key is white-space only string', () => {
            expect(() => validateKey("  \t \n ")).to.throw(INVALID_STORAGE_KEY_ERROR);
        });

    });

});
