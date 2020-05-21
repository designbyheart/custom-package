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

describe('Connection via QR Code', () => {
  it('User should be able to establish connection via scanning QR code', async () => {
    // await device.launchApp({ permissions: { camera: 'YES' } })
    // await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)
    // await expect(element(by.id(USER_AVATAR))).toBeVisible()
    // -----
    // await element(by.id(HOME_CONTAINER)).swipe('left')
    // await element(by.id(QR_CODE_INPUT_ENV_SWITCH)).replaceText(
    //   JSON.stringify({
    //     url: QR_CODE_ENV_SWITCH_URL,
    //     name: 'Development',
    //   })
    // )
    // await element(
    //   by
    //     .label(QR_CODE_NATIVE_ALERT_SWITCH_TEXT)
    //     .and(by.type(NATIVE_ALERT_TYPE()))
    // ).tap()
    // await expect(element(by.id(HOME_CONTAINER))).toBeVisible()
    // await element(
    //   by.label(OK_TEXT_ALERT).and(by.type(NATIVE_ALERT_TYPE()))
    // ).tap()
    // -----
    let res = await addConnections()
    console.log(res)
  })
})

// make sure app is in unlocked state before calling this method
export const addConnections = async (noOfConnectionsToAdd: number = 1) => {
  let connections = []
  for (let i = 0; i < noOfConnectionsToAdd; i++) {
    {
      let [
        token,
        invitationId,
        fetchingInvitation,
        invitationUrl,
        qrCode,
      ] = await getInvitation()
      connections.push([token, invitationId, fetchingInvitation, invitationUrl])
      console.log(invitationUrl)

      // // option 1: close app and then open with url
      // await device.terminateApp()
      // await device.launchApp({
      //   // // uncomment to remove and install app again and then open with url
      //   // delete: true,
      //   newInstance: true,
      //   url: invitationUrl,
      // })

      // // option 2: mock opening url on launched app
      // await device.openURL({
      //   url: invitationUrl,
      //   sourceApp: 'com.evernym.connectme.callcenter'
      // })

      // await unlock()

      await element(by.text('Scan')).tap()

      await waitFor(element(by.id(INVITATION_ACCEPT)))
        .toBeVisible()
        .withTimeout(15000)
      await element(by.id(INVITATION_ACCEPT)).tap()

      await waitFor(element(by.id(PIN_CODE_INPUT_BOX)).atIndex(1))
        .toBeVisible()
        .withTimeout(15000)
      await element(by.id(PIN_CODE_INPUT_BOX))
        .atIndex(1)
        .replaceText(TEST_PASS_CODE)
    }
  }
  return connections
}
