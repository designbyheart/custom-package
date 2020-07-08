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
  HOME_NEW_MESSAGE,
  CLAIM_OFFER_ACCEPT,
  CLAIM_OFFER_REJECT,
  PROOF_REQUEST_SEND,
  PROOF_REQUEST_REJECT,
  PROOF_REQUEST_GENERATE,
  ALLOW_BUTTON,
  SCAN_BUTTON,
  GENERAL_SCROLL_VIEW,
  PROOF_REQUEST_MISSING_ATTRIBUTE_BASE,
  BURGER_MENU,
  MENU_MY_CONNECTIONS,
  MY_CONNECTIONS_CONTAINER,
  MY_CONNECTIONS_HEADER,
  MY_CONNECTIONS_CONNECTION,
  CONNECTION_ENTRY_HEADER,
  VIEW_CREDENTIAL,
  CREDENTIAL_HEADER,
  VIEW_PROOF,
  PROOF_HEADER,
  CLOSE_BUTTON,
  SCREENSHOT_INVITATION,
  SCREENSHOT_CLAIM_OFFER_PROFILE_INFO,
  SCREENSHOT_PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED,
  SCREENSHOT_TEST_CONNECTION,
} from '../utils/test-constants'
import { waitForElementAndTap } from '../utils/detox-selectors'
import { element, by, waitFor, expect } from 'detox'
import {
  getInvitation,
  createSchema,
  createClaimDef,
  sendClaimOffer,
  sendProofRequest,
  CLAIM_OFFER_PROFILE_INFO,
  CLAIM_OFFER_ADDRESS,
  PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED,
  PROOF_TEMPLATE_TWO_CLAIM_FULFILLED,
  PROOF_TEMPLATE_MISSING_ATTRIBUTES,
} from '../utils/api'
import { unlock } from '../utils/lock-unlock'
import { matchScreenshot } from '../utils/screenshot'
import chalk from 'chalk'

let connectionId
let schema
let credDef
let credential
let proof
const TIMEOUT = 10000

describe('Connection via QR Code', () => {
  it('Case 1: user should be able to establish connection via scanning QR code', async () => {
    let [
      // token,
      invitationId,
      // fetchingInvitation,
      // invitationUrl,
      jsonData,
    ] = await getInvitation()

    connectionId = invitationId

    const { resolve, promise: invitationPushed } = getDeferred() // <<< can work without it
    const http = require('http')
    const server = http
      .createServer(function(request, response) {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.write(jsonData.trim())
        response.end()
        // resolve promise that invitation has been sent to QR scanner
        resolve && resolve() // <<< can work without it
      })
      .listen(1337)
    console.log(
      chalk.greenBright('Invitation server is listening on port 1337...')
    )

    await waitForElementAndTap('text', SCAN_BUTTON, TIMEOUT)

    await invitationPushed // <<< can work without it

    // server has sent data, we can dispose the server
    server.close()
    console.log(chalk.redBright('Invitation server has been stopped.'))

    await waitForElementAndTap('text', ALLOW_BUTTON, TIMEOUT)

    await matchScreenshot(SCREENSHOT_INVITATION) // screenshot

    await waitForElementAndTap('id', INVITATION_ACCEPT, TIMEOUT)

    await waitFor(element(by.id(PIN_CODE_INPUT_BOX)).atIndex(1))
      .toExist()
      .withTimeout(10000)
    await element(by.id(PIN_CODE_INPUT_BOX))
      .atIndex(1)
      .replaceText(TEST_PASS_CODE)
  })

  it('Case 2.1: create and reject credential', async () => {
    credential = await sendClaimOffer(
      CLAIM_OFFER_PROFILE_INFO,
      connectionId
    ).catch(console.error)

    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)

    await waitForElementAndTap('text', CLAIM_OFFER_REJECT, TIMEOUT)
  })

  it('Case 2.2: create and accept credential', async () => {
    credential = await sendClaimOffer(
      CLAIM_OFFER_PROFILE_INFO,
      connectionId
    ).catch(console.error)

    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)

    await matchScreenshot(SCREENSHOT_CLAIM_OFFER_PROFILE_INFO) // screenshot

    await waitForElementAndTap('text', CLAIM_OFFER_ACCEPT, TIMEOUT)
  })

  it('Case 2.3: create and accept another credential', async () => {
    credential = await sendClaimOffer(CLAIM_OFFER_ADDRESS, connectionId).catch(
      console.error
    )

    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)

    await waitForElementAndTap('text', CLAIM_OFFER_ACCEPT, TIMEOUT)
  })

  it('Case 3.1: create and reject proof request', async () => {
    proof = await sendProofRequest(
      PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED,
      connectionId
    ).catch(console.error)

    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)

    await waitForElementAndTap('text', PROOF_REQUEST_REJECT, TIMEOUT)
  })

  it('Case 3.2: create and send proof request', async () => {
    proof = await sendProofRequest(
      PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED,
      connectionId
    ).catch(console.error)

    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)

    await matchScreenshot(SCREENSHOT_PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED) // screenshot

    await waitForElementAndTap('text', PROOF_REQUEST_SEND, TIMEOUT)
  })

  it('Case 3.3: create and send another proof request', async () => {
    proof = await sendProofRequest(
      PROOF_TEMPLATE_TWO_CLAIM_FULFILLED,
      connectionId
    ).catch(console.error)

    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)

    await waitForElementAndTap('text', PROOF_REQUEST_SEND, TIMEOUT)
  })

  it('Case 3.4: create and send self-attested proof request', async () => {
    proof = await sendProofRequest(
      PROOF_TEMPLATE_MISSING_ATTRIBUTES,
      connectionId
    ).catch(console.error)

    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)

    await waitForElementAndTap('text', OK_TEXT_ALERT, TIMEOUT)

    await element(by.type(GENERAL_SCROLL_VIEW))
      .atIndex(2)
      .swipe('down')

    try {
      await element(
        by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('1'))
      ).typeText('test attribute 1')
    } catch (e) {
      try {
        await element(by.type(GENERAL_SCROLL_VIEW))
          .atIndex(2)
          .swipe('down')

        await element(
          by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('1'))
        ).typeText('test attribute 1')
      } catch (e) {
        await element(by.type(GENERAL_SCROLL_VIEW))
          .atIndex(2)
          .swipe('up')

        await element(
          by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('1'))
        ).typeText('test attribute 1')
      }
    }
    await element(
      by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('1'))
    ).tapReturnKey()

    try {
      await element(
        by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('2'))
      ).typeText('test attribute 2')
    } catch (e) {
      try {
        await element(by.type(GENERAL_SCROLL_VIEW))
          .atIndex(2)
          .swipe('down')

        await element(
          by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('2'))
        ).typeText('test attribute 2')
      } catch (e) {
        await element(by.type(GENERAL_SCROLL_VIEW))
          .atIndex(2)
          .swipe('up')

        await element(
          by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('2'))
        ).typeText('test attribute 2')
      }
    }
    await element(
      by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('2'))
    ).tapReturnKey()

    try {
      await element(
        by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('3'))
      ).typeText('test attribute 3')
    } catch (e) {
      try {
        await element(by.type(GENERAL_SCROLL_VIEW))
          .atIndex(2)
          .swipe('down')

        await element(
          by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('3'))
        ).typeText('test attribute 3')
      } catch (e) {
        await element(by.type(GENERAL_SCROLL_VIEW))
          .atIndex(2)
          .swipe('up')

        await element(
          by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('3'))
        ).typeText('test attribute 3')
      }
    }
    await element(
      by.id(PROOF_REQUEST_MISSING_ATTRIBUTE_BASE.concat('3'))
    ).tapReturnKey()

    await waitForElementAndTap('text', PROOF_REQUEST_GENERATE, TIMEOUT)

    await waitForElementAndTap('text', PROOF_REQUEST_SEND, TIMEOUT)
  })

  it('Case 4.1: check my connections screen and its elements', async () => {
    // await element(by.id(BURGER_MENU)).tap()
    await waitForElementAndTap('id', BURGER_MENU, TIMEOUT)
    // await element(by.text(MENU_MY_CONNECTIONS)).tap()
    await waitForElementAndTap('text', MENU_MY_CONNECTIONS, TIMEOUT)

    // check connections view
    await waitFor(element(by.id(MY_CONNECTIONS_CONTAINER)))
      .toBeVisible()
      .withTimeout(TIMEOUT)

    // check connections header
    await waitFor(element(by.text(MY_CONNECTIONS_HEADER)))
      .toBeVisible()
      .withTimeout(TIMEOUT)

    // check menu button
    await waitFor(element(by.id(BURGER_MENU)))
      .toBeVisible()
      .withTimeout(TIMEOUT)

    // check camera button
    await waitFor(element(by.text(SCAN_BUTTON)))
      .toBeVisible()
      .withTimeout(TIMEOUT)
  })

  it('Case 4.2: check my connections screenshot with test connection', async () => {
    await matchScreenshot(SCREENSHOT_TEST_CONNECTION) // screenshot
  })

  it('Case 5: drill down to connection and check its elements', async () => {
    await waitForElementAndTap('text', MY_CONNECTIONS_CONNECTION, TIMEOUT)

    await element(by.type(GENERAL_SCROLL_VIEW))
      .atIndex(0)
      .swipe('down', 'fast', 0.5)

    await expect(element(by.text(CONNECTION_ENTRY_HEADER))).toBeVisible()

    await element(by.text(VIEW_CREDENTIAL))
      .atIndex(1)
      .tap()

    await expect(element(by.text(CREDENTIAL_HEADER))).toBeVisible()

    await expect(
      element(by.text(CLAIM_OFFER_PROFILE_INFO)).atIndex(0)
    ).toBeVisible()

    await waitForElementAndTap('text', CLOSE_BUTTON, TIMEOUT)

    await element(by.type(GENERAL_SCROLL_VIEW))
      .atIndex(0)
      .swipe('up', 'fast', 0.5)

    await element(by.text(VIEW_PROOF))
      .atIndex(0)
      .tap()

    await expect(element(by.text(PROOF_HEADER))).toBeVisible()

    await expect(
      element(by.text(PROOF_TEMPLATE_MISSING_ATTRIBUTES)).atIndex(0)
    ).toBeVisible()

    await waitForElementAndTap('text', CLOSE_BUTTON, TIMEOUT)
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
