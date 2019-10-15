import { matchScreenshot } from './screenshot'
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
import {
  initialLockSetup,
  freshInstallation,
  // addConnections,
  unLockApp,
} from './common'

describe('ConnectMe without invitation', () => {
  it('switch environment, pin code setup, show dashboard', async () => {
    // await device.freshInstallation()
    await freshInstallation()
    const acceptButton = element(by.id('eula-accept'))
    await acceptButton.tap()

    const startFreshButton = element(by.id('start-fresh'))
    await startFreshButton.tap()
    const orText = element(by.id(LOCK_SELECTION_OR_TEXT))

    await orText.longPress()
    await orText.multiTap(10)
    await element(NATIVE_ALERT_OK_MATCHER()).tap()

    await element(by.id(SWITCH_ENVIRONMENT_DEV_BUTTON)).tap()
    await element(by.id(SWITCH_ENVIRONMENT_SAVE_BUTTON)).tap()

    await initialLockSetup()
    await matchScreenshot(SCREENSHOT_HOME)
  })

  // it('environment switch via qr code', async () => {
  //   await device.launchApp({ permissions: { camera: 'YES' } })

  //   await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)
  //   await expect(element(by.id(USER_AVATAR))).toBeVisible()
  //   await element(by.id(HOME_CONTAINER)).swipe('left')
  //   await element(by.id(QR_CODE_INPUT_ENV_SWITCH)).replaceText(
  //     JSON.stringify({
  //       url: QR_CODE_ENV_SWITCH_URL,
  //       name: 'Development',
  //     })
  //   )
  //   await element(
  //     by
  //       .label(QR_CODE_NATIVE_ALERT_SWITCH_TEXT)
  //       .and(by.type(NATIVE_ALERT_TYPE()))
  //   ).tap()
  //   await expect(element(by.id(HOME_CONTAINER))).toBeVisible()
  //   await element(
  //     by.label(OK_TEXT_ALERT).and(by.type(NATIVE_ALERT_TYPE()))
  //   ).tap()
  // })
})
// describe('ConnectMe with invitation', () => {
//   beforeAll(async () => {
//     await freshInstallation()
//     await initialLockSetup()
//   })
//   it('add Connection via URL', async () => {
//     const connections = await addConnections(2)
//   })
// })
