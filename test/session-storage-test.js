import { expect, use as chaiUse } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import { JSDOM } from 'jsdom';

import { sessionStorageGetItem, sessionStorageSetItem } from '../src/session-storage';

chaiUse(sinonChai);

const { window } = new JSDOM('<!DOCTYPE html><p>Hello world</p>');

describe('SessionStorage', () => {

    let sessionStorageGetItemStub, sessionStorageSetItemStub;

    beforeEach(() => {
        sessionStorageGetItemStub = stub(window.sessionStorage, 'getItem');
        sessionStorageSetItemStub = stub(window.sessionStorage, 'setItem');
    });

    afterEach(() => {
        sessionStorageGetItemStub.restore();
        sessionStorageSetItemStub.restore();
    });

    describe('sessionStorageGetItem', () => {

        it('should call window.sessionStorage.getItem', () => {
            // sessionStorageGetItemStub.withArgs(DUMMY_STORAGE_KEY).returns(DUMMY_TAB_ID);

            // const tabId = getTabId(DUMMY_STORAGE_KEY);
            // expect(tabId).to.equal(DUMMY_TAB_ID);
        });

    });

    describe('sessionStorageSetItem', () => {

        it('should call window.sessionStorage.setItem', () => {
            // sessionStorageGetItemStub.withArgs(DUMMY_STORAGE_KEY).returns(DUMMY_TAB_ID);

            // const tabId = getTabId(DUMMY_STORAGE_KEY);
            // expect(tabId).to.equal(DUMMY_TAB_ID);
        });

    });

});
