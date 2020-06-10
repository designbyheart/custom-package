// @flow

import { element, by, waitFor, expect } from 'detox'
import {
  BURGER_MENU,
  MENU_SETTINGS,
  SETTINGS_ABOUT,
  ABOUT_BACK_ARROW,
  ABOUT_HEADER,
  ABOUT_TAC_BUTTON_HEADER,
  ABOUT_PP_BUTTON_HEADER,
} from '../utils/test-constants'

describe('About', () => {
  it('check about', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_SETTINGS)).tap()
    await element(by.text(SETTINGS_ABOUT)).tap()
    await expect(element(by.text(ABOUT_HEADER))).toBeVisible() // header
    await expect(element(by.text('built by'))).toBeVisible()
    await expect(element(by.text('powered by'))).toBeVisible()

    await element(by.text(ABOUT_TAC_BUTTON_HEADER)).tap()
    await expect(
      element(by.text(ABOUT_TAC_BUTTON_HEADER)).atIndex(0)
    ).toBeVisible()
    await element(by.id(ABOUT_BACK_ARROW)).tap()

    await element(by.text(ABOUT_PP_BUTTON_HEADER)).tap()
    await expect(
      element(by.text(ABOUT_PP_BUTTON_HEADER)).atIndex(0)
    ).toBeVisible()
    await element(by.id(ABOUT_BACK_ARROW)).tap()

    await element(by.id(ABOUT_BACK_ARROW)).tap()
  })
})
