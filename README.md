# Browser Session Tabs

[![npm version](https://badge.fury.io/js/browser-session-tabs.svg)](https://badge.fury.io/js/browser-session-tabs) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=pureartisan_browser-session-tabs&metric=coverage)](https://sonarcloud.io/dashboard?id=pureartisan_browser-session-tabs) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pureartisan_browser-session-tabs&metric=alert_status)](https://sonarcloud.io/dashboard?id=pureartisan_browser-session-tabs) [![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

This module allows you to track multiple tabs/windows for a given browser session.

Tabs/windows are tracked using the following:

- Session Storage (only available for the current window/tab)
- Session Cookies (only available until the browser is closed)

It is written in Typescript, but can also be used in vanilla JS (or ES) projects too.

## Getting started

```
npm install --save browser-session-tabs
```

## Usage

```
import { BrowserTabTracker } from 'browser-session-tabs';

/*
 * The BrowserTabTracker needs to be initialized before
 * the session ID and tab ID can be accessed.
 * Initializing makes sure that if it's a new session,
 * a session ID is generated correctly, or if it's a new
 * tab, then a new tab ID is generated correctly.
 *
 * sessionIdGenerator
 * ------------------
 * The session ID for a new session needs to be created.
 * The generator decides what that is.
 * It could be something as simple as epoch time, or a UUID.
 * This method only gets called once at the start of a new
 * session, even across multiple tabs (once and only once
 * per session).
 *
 * storageKey (optional)
 * ---------------------
 * By default, the Session storage/cookie "key"
 * is set to `browser-session-info`.
 * If you wish to customise this, you need to do
 * is as the very first thing in your application.
 *
 * sessionStartedCallback (optional)
 * ---------------------------------
 * A callback that will be triggered when a new session is
 * initialized. Only called once per session, even across
 * multiple tabs. The `sessionId` and `tabId` are passed
 * to this callback as the first two arguments, respectively.
 */
BrowserTabTracker.initialize({
    storageKey: 'my-custom-storage-key',
    sessionIdGenerator: () => {
        return (new Date()).getTime();
    },
    sessionStartedCallback: (sessionId, tabId) => {
        console.log('New session', sessionId, tabId);
    }
});

/*
 * The Session ID can be anything (a string, number, etc),
 * and depends purely on the provided `sessionIdGenerator`.
 * It is shared across multiple tabs in a single session.
 * This ID is shared across tabs with the use of a "Session Cookie".
 */
const sessionId = BrowserTabTracker.sessionId;

/*
 * The Tab ID is a number respresented as a string.
 * The first tab starts at `1` and the number increments as new tabs
 * are opened in the same session.
 * This ID will remain the same, even if the user refreshes/reloads
 * the application, but in the same browser tab.
 * The tab ID is preserved across a refresh/reload with the use of
 * "Session Storage", which acts as a sandbox for the current tab.
 */
const tabId: string = BrowserTabTracker.tabId;

```

## Tracking Purposes

We can use this for analytics or logging purposes to know when users have multiple tabs/windows opened.

```
// Analytics
analyticsTool.initialise({
    'some-field-to-represent-session': BrowserTabTracker.sessionId,
    'some-field-to-represent-tab': BrowserTabTracker.tabId
});

// Logging
logger.error({
    error: 'some error message',
    url: window.location.href,
    session: BrowserTabTracker.sessionId,
    tab: BrowserTabTracker.tabId
});
```

## Session started callback

When a new sesison is started, and the optional `sessionStartedCallback` is provided at initializing, this callback is triggered.

```
// e.g. analytics purposes
const sendSessionStartAnalyticsEvent = (sessionId, tabId) => {
    ...
};

BrowserTabTracker.initialize({
    ...
    sessionStartedCallback: sendSessionStartAnalyticsEvent
    ...
});

```
