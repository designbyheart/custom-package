// @flow

import { element, by, waitFor, expect } from 'detox'
import {
  BURGER_MENU,
  MENU_SETTINGS,
  SETTINGS_CHAT,
  CHAT_CANCEL,
  CHAT_CLOSE,
  CHAT_HEADER,
  CHAT_NEW_MESSAGE,
  CHAT_TEXT_VIEW,
  CHAT_SEND_BUTTON,
  CHAT_SUCCESS_MESSAGE,
} from '../utils/test-constants'

describe('Chat', () => {
  it('chat with support', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_SETTINGS)).tap()
    await element(by.text(SETTINGS_CHAT)).tap() // CM-2628
    try {
      await element(by.text(CHAT_CANCEL)).tap() // open first time
    } catch (e) {
      await element(by.text(CHAT_CLOSE)).tap()
    }
    await element(by.text(SETTINGS_CHAT)).tap()
    await expect(element(by.text(CHAT_HEADER))).toBeVisible() // header
    await expect(element(by.text(CHAT_NEW_MESSAGE))).toBeVisible()

    await element(by.type(CHAT_TEXT_VIEW)).typeText('test message')
    await element(by.type(CHAT_TEXT_VIEW)).tapReturnKey()
    await element(by.text(CHAT_SEND_BUTTON)).tap()
    await expect(element(by.text(CHAT_SUCCESS_MESSAGE))).toBeVisible()

    await element(by.text(CHAT_NEW_MESSAGE))
      .atIndex(0)
      .tap()
    await element(by.type(CHAT_TEXT_VIEW))
      .atIndex(2)
      .typeText('one more test message')
    await element(by.type(CHAT_TEXT_VIEW))
      .atIndex(2)
      .tapReturnKey()
    await element(by.text(CHAT_SEND_BUTTON)).tap()
    await expect(element(by.text(CHAT_SUCCESS_MESSAGE))).toBeVisible()

    await element(by.text(CHAT_CLOSE)).tap()
  })
})
