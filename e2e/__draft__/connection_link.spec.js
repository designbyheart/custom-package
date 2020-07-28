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
  SCREENSHOT_INVITATION_LINK_TO_EXISTING_CONNECTION,
  SCREENSHOT_CLAIM_OFFER_PROFILE_INFO,
  SCREENSHOT_PROOF_TEMPLATE_SINGLE_CLAIM_FULFILLED,
  SCREENSHOT_TEST_CONNECTION,
  BACK_ARROW,
} from '../utils/test-constants'
import { device, element, by, waitFor } from 'detox'
import { waitForElementAndTap } from '../utils/detox-selectors'
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
import { exec } from 'child-process-async'
import chalk from 'chalk'

let connectionId
let schema
let credDef
let credential
let proof
const TIMEOUT = 10000

describe('Connection via SMS Link', () => {
  it('Case 1: user should be able to establish connection via opening SMS link', async () => {
    let [
      token,
      invitationId,
      fetchingInvitation,
      invitationUrl,
      jsonData,
    ] = await getInvitation()

    console.log(chalk.cyanBright(`${invitationUrl}`))

    connectionId = invitationId

    // // option 1: close app and then open with url
    // await device.launchApp({
    //   // // uncomment to remove and install app again and then open with url
    //   // delete: true,
    //   newInstance: true,
    //   url: invitationUrl,
    //   sourceApp: 'com.evernym.connectme.callcenter'
    // })

    // // option 2: mock opening url on launched app
    // await device.openURL({
    // url: invitationUrl,
    // sourceApp: 'com.evernym.connectme.callcenter'
    // })

    // option 3: mock url opening using xcode shell tools
    await new Promise((r) => setTimeout(r, 5000)) // sync issue

    await exec(`xcrun simctl openurl booted ${invitationUrl}`)

    // await waitForElementAndTap('text', ALLOW_BUTTON, TIMEOUT) // for new connection only

    await matchScreenshot(SCREENSHOT_INVITATION_LINK_TO_EXISTING_CONNECTION) // screenshot

    // await waitForElementAndTap('id', INVITATION_ACCEPT, TIMEOUT) // for new connection only

    try {
      await element(by.id(BACK_ARROW)).tap()
    } catch (e) {
      await element(by.text('Ok')).tap() // invitation has been expired
    }
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
})
