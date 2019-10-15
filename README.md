# ConnectMe
App to connect Sovrin with 3rd party authentication

# Pre requisite to run

- Mac machine
- XCode 10
- Node >8.0 & < 9. Preferred way to install node is via [nvm](https://www.sitepoint.com/quick-tip-multiple-versions-node-nvm/)
- [React native setup](http://facebook.github.io/react-native/docs/getting-started.html). Use tab `Building Projects with Native Code`.
- Ruby
- Make sure `pod` (1.5.3) is installed or run `sudo gem install cocoapods -v 1.5.3`
- Android Studio 3+

# Steps to run

- Clone this repository with `SSH`
- `yarn` or `yarn install`
- `yarn start`

## Run on ios simulator
- `yarn pod:dev:install`
- `yarn react-native run-ios`

## Run ios on device
- Do not use XCode automatic code signing
- `cd ios/fastlane`
- `sudo gem install bundle`
- `bundle install`
- Make sure you get added to the connectme-callcenter-certs repo so that the following command is successful --
git clone 'git@github.com:evernym/connectme-callcenter-certs.git' '/var/folders/dt/sk594jpn40d0097bpg17gwc40000gn/T/d20180705-10510-lw9oue'
- To get the development release certificates do `bundle exec fastlane match development`. DO NOT use `--force` with this command.
- You'll be prompted to enter 2 passwords. Slack a contributor for credentials
- Open Xcode, select your device and run

## Run on Android simulator
- Make sure a simulator is already created. Otherwise create one from Android studio
- `cd android/keystores && keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000`
- `yarn react-native run-android`

## Run functional automated test

- Check [e2e guide](./e2e/README.md)

# To Read

- [Coding guidelines](https://github.com/evernym/ConnectMe/blob/master/docs/CODING_GUIDELINES.md)
- [Contributing guidelines](https://github.com/evernym/ConnectMe/blob/master/docs/CONTRIBUTING_GUIDELINES.MD)
- [Build release](./docs/RELEASE_BUILDS.md)
- [Test recipes](./docs/TEST_RECIPES.md)

## Tech stack used

- [React Native](https://facebook.github.io/react-native/)
- [React Navigation](http://reactnavigation.org)
- [Redux](http://redux.js.org)
- [Redux Saga](https://redux-saga.js.org)
- [Flow](http://flow.org/)
- [Jest](https://facebook.github.io/jest/)
- [Yarn](http://yarnpkg.com)
- [Cocoa pods](http://cocoadocs.org)
- [Detox](https://github.com/wix/Detox)

## IDE
- You may use any IDE you feel more comfortable with.
- Our preferred IDE would be "VS Code" with extensions like
  - Prettier - Code formatter (esbenp.prettier-vscode)
  - VS Code ES7 React/Redux/React-Native/JS snippets
  - Code Spell Checker (streetsidesoftware.code-spell-checker)
  - Better Comments (aaron-bond.better-comments)
  - Path Autocomplete (ionutvmi.path-autocomplete)
  - Flow Language Support (flowtype.flow-for-vscode)

# Things to improve

- [ ] Need to consider scenario if user has not allowed permission for push notification or user disable the permission
- [ ] We need to communicate to user on why we need push notification permission

# How To Upgrade to next version of React Native
- Follow the instructions here -- https://github.com/pvinis/rn-diff-purge
- OR follow the instructions here -- https://github.com/react-native-community/rn-diff-purge
  - Determine the two versions: current_version -- next_version.
  This web page will help determine the versions: https://react-native-community.github.io/rn-diff-purge/
  - Example: current_version-> 0.57.8 and next_version-> 0.58.0
  - Go to this page to see the differences:
  https://github.com/react-native-community/rn-diff-purge/compare/release/current_version..release/next_version
  - Example: https://github.com/react-native-community/rn-diff-purge/compare/release/0.57.8..release/0.58.0
  - Now you can manually make the changes to go from one version to the next by modifying your source code
  - If you want to try to use a patching tool to apply the changes in an automated fashion then use the next few steps
  - Get the patch to go from the current_version to the next_version at this web page:
  https://raw.githubusercontent.com/react-native-community/rn-diff-purge/diffs/diffs/current_version..next_version.diff
  - Example: https://raw.githubusercontent.com/react-native-community/rn-diff-purge/diffs/diffs/0.57.8..0.58.0.diff
  - Save the diff to a file on your local hard drive
  - Apply the patch with a tool that is used to apply patches
- Once you have the changes applied for the next version then clean and rebuild the source code
  to make sure the build works correctly and make any changes as necessary.
- Then completely test the mobile app by launching the app on iOS and Android and testing
  each of the features of the mobile app.

# Frequently Encountered Problems (FEP)

## iOS Simulator keyboard issue

- *Problem*" `The iOS simulator does not take input from my MacBook Pro keyboard`. *Workaround*: A temporary workaround is to disconnect the hardward keyboard with the Shift+Cmd+K key combination (via the menu it is Hardware -> Keyboard -> Connect Hardware Keyboard to unselect that option). Then only using the menu Hardware -> Shake Gesture will bring up the React Native Developer Menu and then you select the Reload option from the React Native Developer Menu and then the software keyboard will come up and allow you to use the mouse to input characters. After a while you can try to re-enable The MacBook Pro keyboard but if it still fails then use this workaround again.

## iOS build issue

- *Problem*: `third-party/glog-0.3.4/src/base/mutex.h 'config.h' file not found`. *Solution*: https://github.com/facebook/react-native/issues/16097. Basically from the ConnectMe toplevel source code directory do 1) cd node_modules/react-native/third-party/glog-0.3.4/ && ../../scripts/ios-configure-glog.sh

# Makefile
- If you want to run the iOS or android emulators from a terminal without the need for
the Xcode or Android Studio IDE then you can use the Makefile (this is how Norman runs
the iOS and android emulator on his MacBook). The commands to setup
your environment for the Makefile are:
  - export PATH=$PWD/node_modules/.bin:$PATH
  - make clean
  - make pre-run
  - For iOS: SIMULATOR="iPhone 7" make run-ios
  - For Android: Start the android emulator in a separate terminal with
  - RUST_BACKTRACE=1 /Users/norm/Library/Android/sdk/emulator/emulator -writable-system -avd Pixel_API_26 -netdelay none -netspeed full
  - Then run the app in a separate terminal with: make run-android or VARIANT=release make run-android or VARIANT=debug make run-android

trigger build 7
