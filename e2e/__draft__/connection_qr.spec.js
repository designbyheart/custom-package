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
    let [
      token,
      invitationId,
      fetchingInvitation,
      invitationUrl,
      jsonData,
    ] = await getInvitation()

    const { resolve, promise: invitationPushed } = getDeferred()
    const http = require('http')
    const server = http
      .createServer(function (request, response) {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.write(jsonData.trim())
        response.end()
        // resolve promise that invitation has been sent to QR scanner
        resolve && resolve()
      })
      .listen(1337)
    console.log(
      chalk.greenBright('Invitation server is listening on port 1337...')
    )

    await element(by.text('Scan')).tap()

    await invitationPushed

    // server has sent data, we can dispose the server
    server.close()
    console.log(chalk.redBright('Invitation server has been stopped.'))

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

function getDeferred() {
  let resolve
  let reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { resolve, reject, promise }
}
