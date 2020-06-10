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
    await expect(element(by.text('Identity verification'))).toBeVisible()
    await expect(element(by.text('Select a document'))).toBeVisible()
  })

  it('check passport', async () => {
    await element(by.text('Passport')).tap()
    await expect(element(by.text('Passport photo page'))).toBeVisible()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
  })

  it('check license', async () => {
    await element(by.text("Driver's License")).tap()
    await expect(element(by.text('Select your country'))).toBeVisible()
    await element(by.text('United States')).tap()
    await expect(element(by.text("Front of driver's license"))).toBeVisible()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
  })

  it('check NIC', async () => {
    await element(by.text('National Identity Card')).tap()
    await expect(element(by.text('Select your country'))).toBeVisible()
    await element(by.text('United States')).tap()
    await expect(element(by.text('Front of card'))).toBeVisible()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
  })

  it('check RPC', async () => {
    await element(by.text('Residence Permit Card')).tap()
    await expect(element(by.text('Select your country'))).toBeVisible()
    await element(by.text('United States')).tap()
    await expect(element(by.text('Front of permit'))).toBeVisible()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()

    await element(by.label(ONFIDO_CUSTOM_BACK_ARROW)).tap()
    await element(by.id(ONFIDO_BACK_ARROW)).tap()
  })
})
