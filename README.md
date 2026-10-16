Instant Stealth Lock: User Manual

A Chrome extension that covers every page with a lock screen as soon as the browser starts.

Installation
Download or clone this repository.
Open chrome://extensions and turn on Developer mode (top right).
Click Load unpacked and select the project folder.
The extension is now active.
How It Works
Every time Chrome starts, it locks itself.
Each page shows a black lock screen before any content appears, so nothing flickers through.
While locked, any tab that tries to open a history page is closed automatically.
Unlocking

Type your password and press Enter or click Unlock. A wrong password shakes the card, and you can try again.

The extension has two passwords:

Safe unlock (default 999999): unlocks the browser and leaves your history untouched.
Wipe unlock (default 123456): unlocks the browser and permanently deletes all browsing history. This can’t be undone.
Changing the Passwords

The defaults are public on GitHub, so change them before you use the extension:

Open background.js.
Find "123456" and "999999" and replace them with your own values.
Go to chrome://extensions and click the reload icon on the extension.

Choose two different passwords, and make sure you can tell them apart so you don’t wipe your history by mistake.

Troubleshooting
Lock doesn’t appear: reload the extension, then refresh the page.
Doesn’t work on some pages: Chrome blocks extensions on pages like the Chrome Web Store and chrome:// pages.
Forgot your passwords: edit them in background.js and reload the extension.
Disclaimer

This is a personal privacy tool. Use it only on your own devices. You are responsible for how you use it.
