# Browser Tab Tracker [![CircleCI](https://circleci.com/gh/prageeth/browser-tab-tracker.svg?style=svg)](https://circleci.com/gh/prageeth/browser-tab-tracker)

This module allows you to track multiple tabs/windows for a given browser session.

Tabs/windows are tracked using the following:
- SessionStorage (only available for the current window/tab)
- SessionCookies (only available until the browser is closed)

## Installation
```
npm install @prageeths/browser-tab-tracker
```

## Getting started
```
// ES5
var btt = require('@prageeths/browser-tab-tracker');

// ES6
import btt from '@prageeths/browser-tab-tracker';

// initialise once at the start
// NOTE: this allows you to add configuration overrides
btt.storageKey = "my-storage-key";
btt.init();

// NOTE: by default, the storage key is set to "browser-tab-tracker".
// This key is used to store data in the sessionStorage and cookies.

// get the ID of the current tab/window
console.log("Current tab ID", btt.currentTabIdInSession);
```

## Tab ID

The `currentTabIdInSession` is a number returned as a string. You can use `parseInt()` if you prefer to convert it to an integer.

The `currentTabIdInSession` always starts at `1` and increments as new tabs/windows are opened for the same session. However, if a tab/window is closed, the count does NOT decrement, as we want to keep each ID unique.

## Tracking Purposes

We can use this for analytics or logging purposes to know when users have multiple tabs/windows opened.

```
// Analytics
analyticsTool.initialise({
	'some-field-to-represent-tab': btt.currentTabIdInSession
});

// Logging
logger.error({
	error: 'some error message',
	url: window.location.href,
	tab: btt.currentTabIdInSession
});
```
