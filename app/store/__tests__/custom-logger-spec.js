// @flow
import { customLogger, CUSTOM_LOG_UTILS } from '../custom-logger'

describe('Custom Logger', () => {
  // beforeAll(() => {
  //   CUSTOM_LOG_UTILS.fs = {
  //     stat: jest.fn()
  //   }
  // })

  it('Custom Logger should log to file', () => {
    customLogger.log('test log statement', ' asdfasdf ')
    //console.log(customLogger.calculateRotatingLog)
  })
})
