# ConnectMe
App to connect Sovrin with 3rd party authentication

# Pre requisite to run

- Mac machine
- XCode 11
- Node >12.13 . Preferred way to install node is via [nvm](https://www.sitepoint.com/quick-tip-multiple-versions-node-nvm/)
- [React native setup](http://facebook.github.io/react-native/docs/getting-started.html). Use tab `Building Projects with Native Code`.
- Ruby
- Make sure `pod` (1.9.3) is installed or run `sudo gem install cocoapods -v 1.9.3`
- Android Studio 3+

# Steps to run

- Clone this repository with `SSH`
- `yarn` or `yarn install`
- `yarn start`

## Run on ios simulator
- `yarn pod:dev:install`
- `yarn ios`

## Run on ios device
- DO NOT use XCode automatic code signing
- `cd ios/fastlane`
- `sudo gem install bundle`
- `bundle install`
- Make sure you have Development or higher access to the [connectme-callcenter-certs](https://gitlab.corp.evernym.com/dev/connectme/connectme-callcenter-certs/-/project_members) repo so that the following command is successful --
`git clone 'git@gitlab.corp.evernym.com:dev/connectme/connectme-callcenter-certs.git' '/var/folders/dt/sk594jpn40d0097bpg17gwc40000gn/T/d20180705-10510-lw9oue'`
- Install the development certificates, inside the ios folder run `bundle exec fastlane match development`. DO NOT use `--force` with this command.
- You'll be prompted to enter 2 different passwords. Slack a contributor for credentials.
- Open Xcode, select your device and run

## Run on Android simulator/device
- Make sure a simulator is already created. Otherwise create one from Android studio
- One time command: `cd android/keystores && keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000`
- `yarn android`

## Run functional automated test

- Check [e2e guide](./e2e/README.md)

# To Read

- [Coding guidelines](./docs/CODING_GUIDELINES.md)
- [Contributing guidelines](./docs/CONTRIBUTING_GUIDELINES.MD)
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
- [Cocoapods](http://cocoadocs.org)
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

- *Problem*: `curl: (60) SSL certificate problem`. (on Catalina) SSL certificate on repository server for downloading .vcx is self-signed, which is not secure 'enough' and CURL rejects connecting. *Solution
  *: Before installing .vcx, run this command: `echo insecure >> $HOME/.curlrc`. After commit is successfully pushed and .vcx installed, go and remove `insecure` from `~/.curlrc`.

trigger build 15
