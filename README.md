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
 * By default, the Session storage/cookie "key"
 * is set to `browser-session-info`.
 * If you wish to customise this, you need to do
 * is as the very first thing in your application.
 */
BrowserTabTracker.storageKey = 'my-custom-storage-key';

/*
 * The Session ID is a unique (UUID v4) string.
 * It is shared across multiple tabs in a single session.
 * This ID is shared across tabs with the use of a "Session Cookie".
 */
const sessionId: string = BrowserTabTracker.sessionId;

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