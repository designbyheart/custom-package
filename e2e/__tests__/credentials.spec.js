// @flow

import { element, by, waitFor } from 'detox'
import {
  BURGER_MENU,
  SCAN_BUTTON,
  MENU_MY_CREDENTIALS,
  MY_CREDENTIALS_HEADER,
} from '../utils/test-constants'

describe('My credentials screen', () => {
  it('Case 1: go to my credentials, find all necessary elements', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text(MENU_MY_CREDENTIALS)).tap()

    // check credentials header
    await waitFor(element(by.text(MY_CREDENTIALS_HEADER)))
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

  xit('Case 2: check credential details', async () => {})

  xit('Case 3: delete credential', async () => {})
})
