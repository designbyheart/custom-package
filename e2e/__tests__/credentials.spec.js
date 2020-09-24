// @flow

import { element, by, waitFor, expect } from 'detox'
import { waitForElementAndTap } from '../utils/detox-selectors'
import { matchScreenshot } from '../utils/screenshot'
import {
  BURGER_MENU,
  SCAN_BUTTON,
  MENU_MY_CREDENTIALS,
  MY_CREDENTIALS_HEADER,
  CLAIM_OFFER_PROFILE_INFO,
  CLAIM_OFFER_ADDRESS,
  MY_CREDENTIALS_DETAILS_HEADER,
  MY_CREDENTIALS_DETAILS_ISSUED_BY,
  MY_CREDENTIALS_BACK_ARROW,
  MY_CREDENTIALS_DELETE,
  SCREENSHOT_MY_CREDENTIALS_LIST,
  SCREENSHOT_MY_CREDENTIALS_ENTRY,
  SCREENSHOT_MY_CREDENTIALS_LIST_ONE_DELETED,
} from '../utils/test-constants'

const TIMEOUT = 10000

describe('My credentials screen', () => {
  it('Case 1: go to my credentials, find all necessary elements', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_MY_CREDENTIALS)).tap()

    // check credentials header
    await waitFor(element(by.text(MY_CREDENTIALS_HEADER)))
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

    await matchScreenshot(SCREENSHOT_MY_CREDENTIALS_LIST) // screenshot
  })

  it('Case 2: check credential details', async () => {
    await element(by.text(CLAIM_OFFER_ADDRESS)).atIndex(1).tap()

    await expect(element(by.text(MY_CREDENTIALS_DETAILS_HEADER))).toBeVisible()

    await expect(
      element(by.text(MY_CREDENTIALS_DETAILS_ISSUED_BY))
    ).toBeVisible()

    await expect(element(by.text(CLAIM_OFFER_ADDRESS))).toBeVisible()

    await matchScreenshot(SCREENSHOT_MY_CREDENTIALS_ENTRY) // screenshot

    await waitForElementAndTap('id', MY_CREDENTIALS_BACK_ARROW, TIMEOUT)
  })

  xit('Case 3: delete credential from deleted connection', async () => {
    // CM-2745
    await element(by.text(CLAIM_OFFER_ADDRESS)).atIndex(1).swipe('left')

    await waitForElementAndTap('text', MY_CREDENTIALS_DELETE, TIMEOUT)

    await element(by.text(MY_CREDENTIALS_DELETE)).atIndex(0).tap()

    // TODO screenshot check
  })

  it('Case 4: delete credential from existing connection', async () => {
    // it affects another test
    await element(by.text(CLAIM_OFFER_PROFILE_INFO)).atIndex(0).swipe('left')

    await waitForElementAndTap('text', MY_CREDENTIALS_DELETE, TIMEOUT)

    await element(by.text(MY_CREDENTIALS_DELETE)).atIndex(0).tap()

    await matchScreenshot(SCREENSHOT_MY_CREDENTIALS_LIST_ONE_DELETED) // screenshot
  })
})
