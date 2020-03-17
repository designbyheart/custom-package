CONTENTS OF THIS FILE
---------------------  
 * Introduction
 * Requirements
 * How to Run Tc
 
  INTRODUCTION
  ------------
  E2ETest is properitary UI Automation framework for Evernym ,its designed to cover almost 100 %
  E2E scenarios
 
 
  REQUIREMENTS
  ------------
  1.Eclipse//Optional <<one can run maven build comand from command line >> 
  2.Maven
  
  PREREQUISITES
  ------------
  1. Safari must be set to PRIVATE while running in iOS
  2: TouchID or Fingerprint must be enabled in device or emulator settings

  How to Run TC
  ------------ 
  Run Maven build either from cmd or Eclipse
  1) Install Appium and start the Appium Server
  2) In the Appium Server console click on the "Start Inspector Session" icon magnifying glass
  3) The start session window comes up. Add and save a capability set that contains the following
{
  "automationName": "UiAutomator2",
  "platformName": "Android",
  "noReset": "true",
  "newCommandTimeout": "1800",
  "appPackage": "me.connect",
  "appActivity": ".MainActivity",
  "deviceName": "emulator",
  "path": "/Users/norm/forge/work/code/evernym/ConnectMe/android/app/build/outputs/apk/debug/app-debug.apk"
}
  4) Change the "path" attribute in the capability set to point to your own .apk location
  5) In a terminal start the android emulator
  RUST_LOG=trace RUST_BACKTRACE=full /Users/norm/Library/Android/sdk/emulator/emulator -writable-system -avd Pixel_XL_API_26 -netdelay none -partition-size 128 -netspeed full
  6) Install the apk to the android emulator by opening a terminal and typing
     adb install [path-to-apk]
     i.e. adb install /Users/norm/forge/work/code/evernym/ConnectMe/android/app/build/outputs/apk/release/app-release.apk
  7) In the Appium start session window click on the "Start Session" button after you have saved the capability
  8) The ConnectMe app should lauch on the android emulator and you should be able to see the app screens in the Appium session window as well
  9) Stop the session by clicking on the x close icon in the upper left corner of the start session window
  10) Finally, in a terminal start the e2e automation tests with
      cd /Users/norm/forge/work/code/evernym/e2e-automation
      mvn clean test

If you have issues in the above steps then it is most likely due to the fact that your version of the Chrome browser on your android mobile device is old.
The solution is to use a new android mobile device!! Also, please make sure that you are logged into the hockeyapp.net web site in your mobile devices
Chrome browser if you don't then a step of the tests will fail.
  
  Note : Below is for UI Automation development 
  How to setup your own appium server and connect your device 
  https://appium.readthedocs.io/en/stable/en/appium-setup/real-devices-ios/

 
