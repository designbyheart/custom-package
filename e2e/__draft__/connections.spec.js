// @flow

import { element, by, waitFor } from 'detox'
import { BURGER_MENU, SCAN_BUTTON } from '../utils/test-constants'

describe('My connections screen', () => {
  it('Case 1: go to my connections, find all necessary elements', async () => {
    await element(by.id(BURGER_MENU)).tap()
    await element(by.text('My Connections')).tap()

    // check connections view
    await waitFor(element(by.id('my-connections-container')))
      .toBeVisible()
      .withTimeout(5000)

    // check connections header
    await waitFor(element(by.text('My Connections')))
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
  it('Case 2: check credential screen', async () => {})
  it('Case 3: check proof screen', async () => {})
})
