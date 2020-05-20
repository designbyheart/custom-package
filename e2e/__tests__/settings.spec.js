// @flow

import { element, by, waitFor } from 'detox'
import {
  BURGER_MENU,
  SCAN_BUTTON,
  QR_CODE_SCANNER_CLOSE_BUTTON,
  SETTINGS_CONTAINER,
  SETTINGS_HEADER,
  SETTINGS_CREATE_BACKUP,
  BACKUP_CLOSE,
  SETTINGS_BIOMETRICS,
  BIOMETRICS_OK,
} from '../utils/test-constants'

describe('Settings screen', () => {
  it('Case 1: go to settings, find all necessary elements', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text('Settings')).tap()

    // check settings view
    await waitFor(element(by.id(SETTINGS_CONTAINER)))
      .toBeVisible()
      .withTimeout(5000)

    // check settings header
    await waitFor(element(by.text(SETTINGS_HEADER)))
      .toBeVisible()
      .withTimeout(5000)

    // check menu button
    await waitFor(element(by.id(BURGER_MENU)))
      .toBeVisible()
      .withTimeout(5000)

    // check camera button
    await waitFor(element(by.text(SCAN_BUTTON)))
      .toBeVisible()
      .withTimeout(5000)
  })
  it('Case 2: open and close all available options', async () => {
    await element(by.text(SCAN_BUTTON)).tap()
    await element(by.id(QR_CODE_SCANNER_CLOSE_BUTTON)).tap()
    await element(by.text(SETTINGS_CREATE_BACKUP)).tap()
    await element(by.id(BACKUP_CLOSE)).tap()
    await element(by.text(SETTINGS_BIOMETRICS)).tap()
    await element(by.text(BIOMETRICS_OK)).tap()
  })
})
