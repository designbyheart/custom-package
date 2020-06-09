// @flow

import detox, { device } from 'detox'
import { storeBootedDeviceId } from '../utils/screenshot'
import { setDeviceType } from '../utils/test-constants'
import { unlock } from '../utils/lock-unlock'

jest.setTimeout(120000)
const config = require('../../package.json').detox

beforeAll(async () => {
  await detox.init(config, { launchApp: false })
  await device.launchApp({
    permissions: { camera: 'YES', photos: 'YES', notifications: 'YES' },
  })
  await storeBootedDeviceId()
  setDeviceType(device.getPlatform())

  await unlock() // moved here to run before each `describe` only, not before each `it`
})

beforeEach(async () => {})

afterEach(async () => {})

afterAll(async () => {
  // await device.terminateApp()
  await detox.cleanup()
})
