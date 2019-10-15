## Functional tests setup

* Ensure that Node version greater than 8.5.0 and less than 10 is installed. We recommend using `nvm` to install node
* Ensure that iphone 7, iphone X and iPhone 5s simulators are installed
* Run the simulator for which you need to run tests
* `$ brew update`
* `$ brew tap wix/brew && brew install applesimutils`
* `$ brew install imagemagick` - This gives you convert
* `$ brew install GraphicsMagick` - This gives you gm
* `$ yarn global add detox-cli`
* `$ yarn add detox --dev`
* `$ xcrun instruments -w "iPhone 7 (12.1)"` - this command can launch a simulator directly
* If the xcrun command does not launch the iOS simulator then launch it from Xcode. From menu `Xcode -> Open Developer tool -> Simulators`
* `$ npm run e2e:build -- --configuration=ios.sim7.debug`. Refer more details in next section about this command
* Get base url of server that is running verity-ui and set it as value of `VERITY_API` environment variable. An example command for \*nix based terminal is `$ export VERITY_API=https://33edceed.ngrok.io/`
* Set SMS_INBOX_PASSWORD environment variable for inbox where we get emails about SMS invitation. \*nix based terminal we could run `$ export SMS_INBOX_PASSWORD=password`
* `$ npm run e2e:iphone7:debug`

> If you get an error for installing imagemagick about `/usr/local/Frameworks`, then run below commands and run `$ brew install imagemagick` again
```
sudo mkdir /usr/local/Frameworks
sudo chown $USER /usr/local/Frameworks
```
> If you get an error about permission for ruby gems then run this command `sudo chown -R $(whoami) /usr/local/lib/ruby/gems/2.4.0/gems/`
> If you get an error in logs saying that `image not found`. Run `$ detox clean-framework-cache && detox build-framework-cache`, then run last command in above steps
> If you get an error while trying to type pass code. Ensure that all simulators has hardware keyboard disconnected. `Hardware -> Keyboard -> Un check 'Connect Hardware Keyboard'`
> See [documentation](__e2e__/README.md) about functional tests

## Build for tests

### `npm run e2e:build`
This builds the react native app with configuration parameter passed to it. Run this command as `npm run e2e:build --configuration ios.simX.debug`. Check `detox.configurations` in [package.json](../package.json) for list of available configurations.

## Running tests

Once build is generated in either `debug` or `release` mode. We can run the tests on simulator by running any of the below commands. Here is the convention for commands that we are following

- Commands that ends with name of simulator e.g. `e2e:iphone7`. These type of commands use the release build and run tests in release mode
- Commands that ends with `debug` e.g. `e2e:iphone7:debug`. These commands use debug build and run tests in simulator in debug mode. These types of commands are preferred while developing and writing tests. Because when build is generated in debug mode, then JavaScript bundle is loaded from packager server, so if we change our react native code, we won't have to run `e2e:build` again and our test run will pick up new changes automatically
- Commands that ends with `update` e.g. `e2e:iphone7:update`. These commands updates screenshot for that simulator even if screenshots don't match. Find more details about this [here](#screenshot-tests)

List of commands available to run tests:

- `npm run e2e:iphone7`
- `npm run e2e:iphone7:update`
- `npm run e2e:iphone7:debug`
- `npm run e2e:iphone7:debug:update`
- `npm run e2e:iphonex`
- `npm run e2e:iphonex:update`
- `npm run e2e:iphonex:debug`
- `npm run e2e:iphonex:debug:update`
- `npm run e2e:iphone5s`
- `npm run e2e:iphone5s:update`
- `npm run e2e:iphone5s:debug`
- `npm run e2e:iphone5s:debug:update`

## Screenshot tests

### Background
While testing an application there are libraries and tools that we can use to test functionality. For example, in mobile application we can test whether user can click on a button and navigate to a screen. However, how do we test if that button is at the proper place in UI, or whole layout of home screen is unchanged by some style refactoring or opacity of button is same as it was last time. These all things belong to UI testing and remain in realm of manual testing.

The way we are going to test UI and layout is similar to [Jest snapshot](https://facebook.github.io/jest/docs/en/snapshot-testing.html), but instead of serializing view in json format, we will save the screenshot of a screen in image, and instead of comparing a JSON object, we will be comparing an image with another image.

### Approach

When we run tests for the very first time, we will take a screenshot of the screen and save it. A screenshot can be taken in any test by

```js
import { matchScreenshot } from './screenshot'
...
describe('App', () => {
  it('home screen', async () => {
    // this takes care of all screenshot related stuff
    await matchScreenshot('home.jpg')
  })
})
```
Let's dive into details of what happen inside `matchScreenshot`. 

We first decide that which simulator is running the test. If iPhone X is running the test, then all default screenshots will go to `iphonex` directories. The way we know which simulator is running test is via `npm scripts`. If you look at `npm run e2e:iphonex`, it sets an environment variable before running tests and we get the value of environment variable to identify simulator.

Once we know the simulator, then we need to know whether this is the first time we are taking a screenshot with the name passed in `matchScreenshot`. If this is the first time we are taking screenshot, then this screenshot directly goes to `screenshots/iphonex/` directory. If this is not the first time we are taking screenshot, that means we have something to compare to, then we put the screenshot to `tmp/iphonex/` directory. Whatever the UI design that we have at very first run of tests will be considered as base UI.

Now, we compare existing and new screenshots and check if UI is changed or not. If UI is changed, then we print the error on console, fail test, generate an image which highlights the differences with red color and save diff image in `diff/iphonex/` directory. If changes are regression and we don't want them, we go ahead and fix the code till tests pass.

If we want to keep new changes and override the existing ones, then we run test via commands that ends with `:update`. If you look into these commands in [package.json](../package.json), then you would see that apart from setting SIMULATOR environment variable, we are setting UPDATE environment variable as well. This environment variable helps us to decide whether we need to remove existing screenshots and override with new ones. 

> One more thing that we do before we save any screenshot is that we remove the header from screenshot, because header contains battery icon, date and time which will never be same and our image diff will always find UI differences. So, we crop the header and then save the screenshot.

> If you look closely into commands to run tests, they feel repetitive and one way to solve this could be commands like `npm run e2e --sim iphonex -d -u`. In this example command, we are using arguments to define simulator, and whether to update argument along with debug, build. The reason we could not achieve this type of command is as follows. `npm run e2e:*` command invokes `detox build` or `detox test`, arguments that we pass to `npm scripts` gets passed to `detox build` command. However, `detox build` command internally calls `jest` command to identify and run tests, and `detox build` is not passing our arguments to `jest`. When our tests gets run via `jest` we can't get those arguments, because they were not passed to `jest`. We can go and run `jest` directly without having to rely on `detox` to call `jest`, although we could loose some benefits. However, `jest` fails on unrecognized arguments, so we can't short circuit `detox build` and directly run functional tests via `jest`. Hence, one solution that we have landed on is to use environment variable along with a list of commands for each [operation](#running-tests).
