// @flow

import { element, by, waitFor, expect } from 'detox'
import {
  BURGER_MENU,
  MENU_SETTINGS,
  SETTINGS_ONFIDO,
  ONFIDO_BACK_ARROW,
  ONFIDO_CUSTOM_BACK_ARROW,
  ONFIDO_ACCEPT_BUTTON,
} from '../utils/test-constants'

describe('Onfido', () => {
  it('check onfido', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_SETTINGS)).tap()
    await element(by.text(SETTINGS_ONFIDO)).tap()
    await element(by.text(ONFIDO_ACCEPT_BUTTON)).tap()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
    await element(by.id(ONFIDO_BACK_ARROW)).tap()
  })
})
