// @flow

// import { matchScreenshot } from '../utils/screenshot'
// import { SCREENSHOT_HOME } from '../utils/test-constants'

import { element, by, waitFor } from 'detox'
import { HOME_CONTAINER } from '../utils/test-constants'

describe('Home screen', () => {
  it('pass code unlock, show home, find all necessary elements', async () => {
    // // it doesn't work in pipeline: CM-2552
    // await matchScreenshot(SCREENSHOT_HOME)

    // check home view
    await waitFor(element(by.id(HOME_CONTAINER)))
      .toBeVisible()
      .withTimeout(5000)

    // check home header
    await waitFor(element(by.text('Home')))
      .toBeVisible()
      .withTimeout(5000)

    // check menu button
    await waitFor(element(by.id('burger-menu')))
      .toBeVisible()
      .withTimeout(5000)

    // check camera button
    await waitFor(element(by.text('Scan')))
      .toBeVisible()
      .withTimeout(5000)
  })

  it('open and close menu and scanner', async () => {
    await element(by.id('burger-menu')).tap()
    // await element(by.id(HOME_CONTAINER)).swipe('left', 'slow') // it doesn't work
    await element(by.text('Scan')).tap()
    await element(by.text('Scan')).tap()
    await element(by.id('close-qr-scanner-icon')).tap()
  })
})
