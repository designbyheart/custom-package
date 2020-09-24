// @flow

import { element, by, waitFor } from 'detox'
import {
  BURGER_MENU,
  SCAN_BUTTON,
  MENU_MY_CONNECTIONS,
  MY_CONNECTIONS_CONTAINER,
  MY_CONNECTIONS_HEADER,
  SCREENSHOT_TEST_CONNECTION,
  MY_CONNECTIONS_CONNECTION,
  GENERAL_SCROLL_VIEW,
  CONNECTION_ENTRY_HEADER,
  VIEW_CREDENTIAL,
  CREDENTIAL_HEADER,
  CLOSE_BUTTON,
  VIEW_PROOF,
  PROOF_HEADER,
  BACK_ARROW,
  CLAIM_OFFER_ADDRESS,
  PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED,
} from '../utils/test-constants'
import { waitForElementAndTap } from '../utils/detox-selectors'
import { matchScreenshot } from '../utils/screenshot'

const TIMEOUT = 15000

describe('My connections screen', () => {
  it('Case 1: go to my connections, find all necessary elements', async () => {
    await waitForElementAndTap('id', BURGER_MENU, TIMEOUT)

    await waitForElementAndTap('text', MENU_MY_CONNECTIONS, TIMEOUT)

    // check connections view
    await waitFor(element(by.id(MY_CONNECTIONS_CONTAINER)))
      .toBeVisible()
      .withTimeout(TIMEOUT)

    // check connections header
    await waitFor(element(by.text(MY_CONNECTIONS_HEADER)))
      .toBeVisible()
      .withTimeout(TIMEOUT)

    // check menu button
    await waitFor(element(by.id(BURGER_MENU)))
      .toBeVisible()
      .withTimeout(TIMEOUT)

    // check camera button
    await waitFor(element(by.text(SCAN_BUTTON)))
      .toBeVisible()
      .withTimeout(TIMEOUT)

    await matchScreenshot(SCREENSHOT_TEST_CONNECTION) // screenshot
  })

  it('Case 2: drill down to connection and check its elements', async () => {
    await waitForElementAndTap('text', MY_CONNECTIONS_CONNECTION, TIMEOUT)

    await element(by.type(GENERAL_SCROLL_VIEW))
      .atIndex(0)
      .swipe('down', 'fast', 0.5)

    await expect(element(by.text(CONNECTION_ENTRY_HEADER))).toBeVisible()

    try {
      await element(by.text(VIEW_CREDENTIAL)).tap()
    } catch (e) {
      // profile info is not deleted
      await element(by.text(VIEW_CREDENTIAL)).atIndex(0).tap()
    }
    await expect(element(by.text(CREDENTIAL_HEADER))).toBeVisible()

    await expect(element(by.text(CLAIM_OFFER_ADDRESS)).atIndex(0)).toBeVisible()

    await waitForElementAndTap('text', CLOSE_BUTTON, TIMEOUT)

    await element(by.type(GENERAL_SCROLL_VIEW))
      .atIndex(0)
      .swipe('up', 'fast', 0.5)

    await element(by.text(VIEW_PROOF)).tap()

    await expect(element(by.text(PROOF_HEADER))).toBeVisible()

    await expect(
      element(by.text(PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED)).atIndex(0)
    ).toBeVisible()

    await waitForElementAndTap('text', CLOSE_BUTTON, TIMEOUT)

    await element(by.id(BACK_ARROW)).tap()
  })
})
