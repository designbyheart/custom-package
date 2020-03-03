// @flow

import detox, { device } from 'detox'
import { storeBootedDeviceId } from '../utils/screenshot'
import { setDeviceType } from '../utils/test-constants'
import { unlock } from '../utils/lock-unlock'

jest.setTimeout(120000)
const config = require('../../package.json').detox

beforeAll(async done => {
  // await detox.init(config)
  await detox.init(config, { launchApp: false })
  await device.launchApp({ permissions: { camera: 'YES' } })
  await storeBootedDeviceId()
  setDeviceType(device.getPlatform())
  done()
})

beforeEach(async () => {
  await unlock()
})

afterAll(async done => {
  await detox.cleanup()
  done()
})
