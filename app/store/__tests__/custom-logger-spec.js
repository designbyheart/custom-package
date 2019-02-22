// @flow
import { customLogger } from '../custom-logger'

describe('Custom Logger', () => {
  it('Custom Logger should log to file', () => {
    customLogger.log('test log statement', ' asdfasdf ')
    //console.log(customLogger.calculateRotatingLog)
  })
})
