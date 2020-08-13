// @flow

import { element, by, waitFor } from 'detox'
import {
  BURGER_MENU,
  SCAN_BUTTON,
  MENU_MY_CONNECTIONS,
  MY_CONNECTIONS_CONTAINER,
  MY_CONNECTIONS_HEADER,
} from '../utils/test-constants'
import { waitForElementAndTap } from '../utils/detox-selectors'

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
  })
})
