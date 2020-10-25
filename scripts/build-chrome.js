/* eslint-disable @typescript-eslint/no-var-requires */
const { run, bash, title, CODE, RESET } = require('./utils');
const { zip } = require('zip-a-folder');
const path = require('path');

module.exports = async function buildChrome(OUTPUT_DIR) {
  title('Chrome');
  const chromeZip = path.join(OUTPUT_DIR, 'chrome.zip');
  const dist = path.join(__dirname, '..', 'dist');

  await run(`Building ${CODE}dist/${RESET} for Chrome`, () => bash('yarn build:prod'));

  await run(`Creating ${CODE}chrome.zip`, () => zip(dist, chromeZip));
};
