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

describe('About', () => {
  it('check about', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_SETTINGS)).tap()
    await element(by.text(SETTINGS_ABOUT)).tap()
    await expect(element(by.text('About this App'))).toBeVisible() // header
    await element(by.text('Terms and Conditions')).tap()
    await expect(
      element(by.text('Terms and Conditions')).atIndex(0)
    ).toBeVisible()
    await element(by.id(ABOUT_BACK_ARROW)).tap()
    await element(by.text('Privacy Policy')).tap()
    await expect(element(by.text('Privacy Policy')).atIndex(0)).toBeVisible()
    await element(by.id(ABOUT_BACK_ARROW)).tap()
  })
})
