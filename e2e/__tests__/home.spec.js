// @flow

import { matchScreenshot } from '../utils/screenshot'
import { SCREENSHOT_HOME } from '../utils/test-constants'

describe('Home screen', () => {
  it.skip('pass code unlock, show home, take screenshot', async () => {
    // it doesn't work in pipeline: CM-2552
    await matchScreenshot(SCREENSHOT_HOME)
  })
})
