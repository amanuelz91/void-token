# Crowdsale

Code for the Odyssey token sale.<br><br>
⚠️ Warning: this code is NOT ready for production.<br>
Onessus and its developers claim no responsibility for any financial loss resulting from the use of this code.<br><br>
All rights reserved.<br>

## Screenshots

![Dashboard](/screenshots/dashboard.png?raw=true "Dashboard Proof of Concept")

## Installation

Clone the repo:<br>
`git clone git@github.com:Onessus/crowdsale.git`<br>

Install Truffle and project depencies:<br>
`npm install -g truffle`<br>
`cd crowdsale`<br>
`npm install`<br>

Install Metamask, preferably in Chrome/Chromium:<br>
https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=chrome-app-launcher-info-dialog

Open Metamask, click the hamburger icon in the top right and click Settings.<br>
Add the following RPC URL: http://localhost:9545<br>

If any contract .json files exist in /build/contracts, delete them.<br>
`rm /build/contracts/*`<br>

Enter into Truffle's development and testrpc console.<br>
`truffle develop --reset`<br>

Your accounts and private keys should be listed in the terminal.<br>
Copy the default mnemonic:<br>
`candy maple cake sugar pudding cream honey rich smooth crumble sweet treat`<br>

Open Metamask. If it is unlocked (showing account info), click the hamburger icon in the top right and click Lock.<br>
From the lock screen, click Restore key phrase. Enter in the mnemonic from above and set a password.<br>

Compile any contracts<br>
`compile`<br>

Migrate the contracts<br>
`migrate --reset`<br>

Exit out of the truffle development console and run<br>
`npm run dev`<br><br>

All rights reserved. © 2017.<br>

