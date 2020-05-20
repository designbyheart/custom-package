// @flow

import { element, by, waitFor } from 'detox'
import {
  LOCK_SELECTION_PIN_CODE,
  TEST_PASS_CODE,
  PIN_CODE_INPUT_BOX,
  LOCK_SETUP_SUCCESS_CLOSE_BUTTON,
  LOCK_SELECTION_OR_TEXT,
  SWITCH_ENVIRONMENT_SAVE_BUTTON,
  NATIVE_ALERT_OK_MATCHER,
  APP_ENVIRONMENT,
} from './test-constants'

export const unlock = async () => {
  try {
    await waitFor(element(by.id(PIN_CODE_INPUT_BOX)))
      .toExist()
      .withTimeout(2000)
    // If lock is already setup, then just unlock the app
    await unlockAppViaPassCode()
  } catch (e) {
    // if lock is not setup then setup environment and pass code
    await setEnvironment()
    await setupPassCode()
  }
}

async function setEnvironment() {
  const acceptButton = element(by.id('eula-accept'))
  await acceptButton.tap()

  // We have hidden start-fresh button for now, Once we enable it then we can add this line again
  // const startFreshButton = element(by.id('start-fresh'))
  // await startFreshButton.tap()
  const orText = element(by.id(LOCK_SELECTION_OR_TEXT))

  await orText.longPress()
  await orText.multiTap(10)
  await element(NATIVE_ALERT_OK_MATCHER()).tap()

  await element(by.id(APP_ENVIRONMENT)).tap()
  await element(by.id(SWITCH_ENVIRONMENT_SAVE_BUTTON)).tap()
}

async function setupPassCode() {
  await element(by.id(LOCK_SELECTION_PIN_CODE)).tap()

  await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)
  await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)

  await element(by.id(LOCK_SETUP_SUCCESS_CLOSE_BUTTON)).tap()

  // const home = element(by.id('tab-bar-home-icon'))
  const home = element(by.id('home-container'))
  // $FlowFixMe not sure why toBeVisible is not being recognized by Flow
  await expect(home).toBeVisible()
}

async function unlockAppViaPassCode() {
  await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)
}

async function setupBiometric() {}

async function unlockAppViaBiometric() {}
