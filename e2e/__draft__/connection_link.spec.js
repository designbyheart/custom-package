/**
 * @jest-environment node
 */

// @flow

import {
  HOME_CONTAINER,
  QR_CODE_INPUT_ENV_SWITCH,
  QR_CODE_ENV_SWITCH_URL,
  QR_CODE_NATIVE_ALERT_SWITCH_TEXT,
  OK_TEXT_ALERT,
  NATIVE_ALERT_OK_MATCHER,
  TEST_PASS_CODE,
  INVITATION_SUCCESS_MODAL_CONTINUE,
  INVITATION_ACCEPT,
  PIN_CODE_INPUT_BOX,
} from '../utils/test-constants'
import { device, element, by, waitFor } from 'detox'
import { getInvitation } from '../utils/api'
import { unlock } from '../utils/lock-unlock'
import chalk from 'chalk'

describe('Connection via SMS Link', () => {
  it('User should be able to establish connection via opening SMS link', async () => {
    let [
      token,
      invitationId,
      fetchingInvitation,
      invitationUrl,
      jsonData,
    ] = await getInvitation()

    console.log(chalk.cyanBright(`${invitationUrl}`))

    // option 1: close app and then open with url
    await device.terminateApp()
    await device.launchApp({
      //   // uncomment to remove and install app again and then open with url
      //   delete: true,
      newInstance: true,
      url: invitationUrl,
    })

    // // option 2: mock opening url on launched app
    // await device.openURL({
    // url: invitationUrl,
    // sourceApp: 'com.evernym.connectme.callcenter'
    // })

    await unlock()

    await waitFor(element(by.id(INVITATION_ACCEPT)))
      .toBeVisible()
      .withTimeout(10000)
    await element(by.id(INVITATION_ACCEPT)).tap()

    await waitFor(element(by.id(PIN_CODE_INPUT_BOX)).atIndex(1))
      .toExist()
      .withTimeout(10000)
    await element(by.id(PIN_CODE_INPUT_BOX))
      .atIndex(1)
      .replaceText(TEST_PASS_CODE)
  })
})
