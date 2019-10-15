import detox from 'detox'
import { storeBootedDeviceId } from './screenshot'
import { setDeviceType } from './test-constants'

const config = require('../package.json').detox

jest.setTimeout(600000)

beforeAll(async () => {
  await detox.init(config)
  await storeBootedDeviceId()
  setDeviceType(device.getPlatform())
})

afterAll(async () => {
  await detox.cleanup()
})
