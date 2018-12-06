import { expect, use as chaiUse } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

import { sessionStorageGetItem, sessionStorageSetItem } from '../src/session-storage';

chaiUse(sinonChai);

global.window = {};

describe('SessionStorage', () => {

    let originalSessionStorage;

    beforeEach(() => {
        originalSessionStorage = window.sessionStorage;

        window.sessionStorage = {
            getItem: stub(),
            setItem: stub()
        };
    });

    afterEach(() => {
        window.sessionStorage = originalSessionStorage;
    });

    describe('sessionStorageGetItem', () => {

        it('should delegate to window.sessionStorage.getItem', () => {

            const DUMMY_KEY = 'my-key';
            const DUMMY_VALUE = 'my-value';

            window.sessionStorage.getItem.withArgs(DUMMY_KEY).returns(DUMMY_VALUE);

            const value = sessionStorageGetItem(DUMMY_KEY);

            expect(value).to.equal(DUMMY_VALUE);

        });

    });

    describe('sessionStorageSetItem', () => {

        it('should delegate to window.sessionStorage.setItem', () => {
            
            const DUMMY_KEY = 'my-key';
            const DUMMY_VALUE = 'my-value';

            sessionStorageSetItem(DUMMY_KEY, DUMMY_VALUE);

            expect(window.sessionStorage.setItem).to.have.been.calledOnce;
            expect(window.sessionStorage.setItem).to.have.been.calledWith(DUMMY_KEY, DUMMY_VALUE);

        });

    });

});
