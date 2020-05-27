// @flow

import { element, by, waitFor, expect } from 'detox'
import {
  BURGER_MENU,
  MENU_SETTINGS,
  SETTINGS_PASSCODE,
  PIN_CODE_INPUT_BOX,
  TEST_PASS_CODE,
  TEST_PASS_CODE_CHANGED,
  SETTINGS_CHAT,
  CHAT_CANCEL,
  CHAT_CLOSE,
  SETTINGS_ABOUT,
  ABOUT_BACK_ARROW,
  SETTINGS_ONFIDO,
  ONFIDO_BACK_ARROW,
} from '../utils/test-constants'

describe('Passcode', () => {
  it('change passcode', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_SETTINGS)).tap()
    await element(by.text(SETTINGS_PASSCODE)).tap()
    await element(by.id(PIN_CODE_INPUT_BOX))
      .atIndex(0)
      .replaceText(TEST_PASS_CODE)
    // CM-2625
    // await element(by.id(PIN_CODE_INPUT_BOX)).atIndex(0).replaceText(TEST_PASS_CODE_CHANGED)
  })
})
