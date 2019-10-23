// @flow

import detox, { device } from 'detox'
import { storeBootedDeviceId } from '../utils/screenshot'
import { setDeviceType } from '../utils/test-constants'
import { unlock } from '../utils/lock-unlock'

jest.setTimeout(120000)
const config = require('../../package.json').detox

beforeAll(async () => {
  await detox.init(config)
  await storeBootedDeviceId()
  setDeviceType(device.getPlatform())
})

beforeEach(async () => {
  await unlock()
})

afterAll(async () => {
  await detox.cleanup()
})
