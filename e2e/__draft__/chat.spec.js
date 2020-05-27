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

describe('Chat', () => {
  it('chat with support', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_SETTINGS)).tap()
    await element(by.text(SETTINGS_CHAT)).tap()
    await element(by.text(CHAT_CANCEL)).tap()
    await element(by.text(SETTINGS_CHAT)).tap()
    await expect(element(by.text('Chat with Evernym'))).toBeVisible() // header
    await expect(element(by.text('New Message'))).toBeVisible()
    await element(by.type('UITextView')).typeText('test')
    await element(by.type('UITextView')).tapReturnKey()
    await element(by.text('Send')).tap()
    await expect(
      element(by.text('We will respond to your message soon.'))
    ).toBeVisible()
    await element(by.text(CHAT_CLOSE)).tap()
  })
})
