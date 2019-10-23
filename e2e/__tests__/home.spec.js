// @flow

import { matchScreenshot } from '../utils/screenshot'
import { SCREENSHOT_HOME } from '../utils/test-constants'

describe('Home screen', () => {
  it('pass code unlock, show home, take screenshot', async () => {
    await matchScreenshot(SCREENSHOT_HOME)
  })
})
