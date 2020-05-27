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

describe('Onfido', () => {
  it('check onfido', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_SETTINGS)).tap()
    await element(by.text(SETTINGS_ONFIDO)).tap()
    await element(by.text('I accept')).tap()
    await element(by.label('back')).tap()
    await element(by.id(ONFIDO_BACK_ARROW)).tap()
  })
})
