import {
  LOCK_SELECTION_OR_TEXT,
  OK_TEXT_ALERT,
  NATIVE_ALERT_TYPE,
  SWITCH_ENVIRONMENT_DEV_BUTTON,
  SWITCH_ENVIRONMENT_SAVE_BUTTON,
  LOCK_SELECTION_PIN_CODE,
  TEST_PASS_CODE,
  PIN_CODE_INPUT_BOX,
  LOCK_SETUP_SUCCESS_CLOSE_BUTTON,
  USER_AVATAR,
  SCREENSHOT_HOME,
  HOME_FEEDBACK_BUTTON,
  QR_CODE_INPUT_ENV_SWITCH,
  QR_CODE_ENV_SWITCH_URL,
  QR_CODE_NATIVE_ALERT_SWITCH_TEXT,
  HOME_CONTAINER,
  NATIVE_ALERT_OK_MATCHER,
  INVITATION_ACCEPT,
  INVITATION_SUCCESS_MODAL_CONTINUE,
  ACCEPT_INVITATION_LABEL,
  REQUEST_CONTAINER,
} from './test-constants'
import { matchScreenshot } from './screenshot'
// import { getInvitation } from './api'

export const initialLockSetup = async () => {
  await element(by.id(LOCK_SELECTION_PIN_CODE)).tap()

  await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)
  await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)

  await element(by.id(LOCK_SETUP_SUCCESS_CLOSE_BUTTON)).tap()

  await expect(element(by.id('tab-bar-home-icon'))).toBeVisible()
}

export const unLockApp = async () => {
  await waitFor(element(by.id(PIN_CODE_INPUT_BOX).and(by.text(''))))
    .toBeVisible()
    .withTimeout(15000)
  await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)
}

// should not be called from with in the test case, should be used in beforeAll
export const freshInstallation = async () => {
  await device.launchApp({
    delete: true,
    permissions: { notifications: 'YES', camera: 'YES' },
  })
}

// make sure app is in unlocked state before calling this method
// export const addConnections = async (noOfConnectionsToAdd = 1) => {
//   let connections = []
//   for (i = 0; i < noOfConnectionsToAdd; i++) {
//     {
//       let [
//         token,
//         invitationId,
//         fetchingInvitation,
//         invitationUrl,
//       ] = await getInvitation()
//       connections.push([token, invitationId, fetchingInvitation, invitationUrl])
//       await device.relaunchApp({
//         url: invitationUrl,
//       })
//       await unLockApp()

//       await waitFor(element(by.id(INVITATION_ACCEPT)))
//         .toBeVisible()
//         .withTimeout(15000)
//       await element(by.id(INVITATION_ACCEPT)).tap()

//       await waitFor(element(by.id(PIN_CODE_INPUT_BOX).and(by.text(''))))
//         .toBeVisible()
//         .withTimeout(15000)
//       await element(by.id(PIN_CODE_INPUT_BOX).and(by.text(''))).replaceText(
//         TEST_PASS_CODE
//       )
//       await waitFor(element(by.id(INVITATION_SUCCESS_MODAL_CONTINUE)))
//         .toBeVisible()
//         .withTimeout(50000)
//       await element(by.id(INVITATION_SUCCESS_MODAL_CONTINUE)).tap()
//     }
//   }
//   return connections
// }
