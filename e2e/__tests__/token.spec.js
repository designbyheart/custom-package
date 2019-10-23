// @flow

import { device } from 'detox'
import { tapOn } from '../utils/detox-selectors'
import { SOVRIN_TOKEN_AMOUNT_TEST_ID } from '../../app/home/home-constants'
import { matchScreenshot } from '../utils/screenshot'

describe('Token functionality', () => {
  it('should show token history', async () => {
    await tapOn('tab-bar-settings-icon')
    await tapOn(SOVRIN_TOKEN_AMOUNT_TEST_ID)
    await matchScreenshot('token-dashboard.png')
    // copy payment address from simulator
    // get data from simulator pasteboard to test
    // check if data read from detox test matches pasteboard data
    // start token minting process
    // create a file with mint file as base and replacing payment address
    // with the one that we got from pasteboard/detox query
    // check if pem file is available for ssh
    // ssh login
    // put mint file to ssh
    // run mint command on ssh server
    // logout from ssh server
    // close token screen
    // open token screen again
    // balance should be same as 1000 tokens
    // go to history tab
    // history tab should show an incoming txn for 1000 tokens
    // take screenshot for this txn
    // try to remove date part from the screenshot
    // then save screenshot
  })
})
