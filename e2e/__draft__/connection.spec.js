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
        // token,
        invitationId,
        // fetchingInvitation,
        // invitationUrl,
        jsonData,
      ] = await getInvitation()
      // connections.push([token, invitationId, fetchingInvitation, invitationUrl])

      const { resolve, promise: invitationPushed } = getDeferred()
      const http = require('http')
      const server = http
        .createServer(function(request, response) {
          response.writeHead(200, { 'Content-Type': 'application/json' })
          response.write(jsonData.trim())
          response.end()
          // resolve promise that invitation has been sent to QR scanner
          resolve && resolve()
        })
        .listen(1337)
      console.log(chalk.green('invitation server is listening on port 1337...'))

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

      await invitationPushed

      // server has sent data, we can dispose the server
      server.close()

      await waitFor(element(by.id(INVITATION_ACCEPT)))
        .toBeVisible()
        .withTimeout(15000)
      await element(by.id(INVITATION_ACCEPT)).tap()

      // await waitFor(element(by.id(PIN_CODE_INPUT_BOX)).atIndex(1))
      //   .toBeVisible()
      //   .withTimeout(15000)
      await waitFor(element(by.id(PIN_CODE_INPUT_BOX)))
        .toExist()
        .withTimeout(10000)
      await element(by.id(PIN_CODE_INPUT_BOX))
        .atIndex(1)
        .replaceText(TEST_PASS_CODE)
    }
  }
  return connections
}

function getDeferred() {
  let resolve
  let reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { resolve, reject, promise }
}
