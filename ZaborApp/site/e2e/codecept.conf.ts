/// <reference types='./steps' />
import "ts-node/register";
import { setHeadlessWhen, setCommonPlugins, setWindowSize, setTestHost } from '@codeceptjs/configure';
// const { setHeadlessWhen, setCommonPlugins, setWindowSize, setTestHost } = (await import("@codeceptjs/configure"));

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

// setWindowSize(1200, 800);
// setTestHost(process.env.TEST_HOST);

export const testingUsingCodeceptJS = true;

export const config: CodeceptJS.MainConfig = {
  tests: './login.spec.ts',
  // timeout: 10,
  output: './output2',
  // emptyOutputFolder: true,
  // fullPromiseBased: true,
  helpers: {
    Playwright: {
      url: 'http://localhost:4201',
      browser: 'chromium',
      waitForNavigation: 'load',
      waitForTimeout: 30_000,

      windowSize: '1280x720',
      // locale: 'ja-JP',
      video: false,
      keepVideoForPassedTests: false,
      disableScreenshots: false,
      fullPageScreenshots: true,
      uniqueScreenshotNames: true,
      highlightElement: false,
      show: true,
      trace: true,
      keepTraceForPassedTests: false,
    },
    // Expect: {},
  },
  include: {
    I: './steps_file.ts',
    loginPage: './pages/Login.ts',
  },
  "bootstrap": false,
  "mocha": {},
  name: 'codeceptjs-playwright-fun',
  plugins: {
    heal: {
      enabled: false,
    },
    retryFailedStep: {
      enabled: false,
      retries: 3
    },
    screenshotOnFail: {
      enabled: true
    }
  },
  require: ["ts-node/register"]
}
