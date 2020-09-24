/**
 * @jest-environment node
 */

// @flow

import https from 'https'
import http from 'http'
import fs from 'fs'
import { post, get } from 'axios'
import R from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child-process-async'
import chalk from 'chalk'

import { element, by, waitFor, expect, device } from 'detox'
import { waitForElementAndTap } from '../utils/detox-selectors'
import {
  SCAN_BUTTON,
  ALLOW_BUTTON,
  INVITATION_ACCEPT,
  HOME_CONTAINER,
  HOME_NEW_MESSAGE,
  CLAIM_OFFER_ACCEPT,
  PROOF_REQUEST_SEND,
} from '../utils/test-constants'

import { VAS } from '../utils/api_new'
import type { InvitationType, QRType } from '../utils/api_new'

//$FlowFixMe
require('tls').DEFAULT_ECDH_CURVE = 'auto'

const TIMEOUT = 10000

describe('Connection via SMS link as QR code', () => {
  it('Connection via SMS link as QR code', async () => {
    // // Start server to listen VAS responses
    let instance = new VAS(VASconfig)

    // // Register server endpoint in VAS - run it once
    let result1 = await instance.registerEndpoint(
      'http://94cdbe722ac2.ngrok.io'
    )
    console.warn(result1)

    // // CreateRelationship request :: VAS returns RelationshipCreated
    let [
      relationshipThreadID,
      DID,
      result2,
    ] = await instance.createRelationship('New Test Label')
    console.warn([relationshipThreadID, DID, result2])

    let jsonData = await instance.relationshipInvitation(
      relationshipThreadID,
      DID,
      'connection-invitation',
      'ARIES_V1_QR'
    )
    console.warn(jsonData)

    const { resolve, promise: invitationPushed } = getDeferred()
    const server = http
      .createServer(function (request, response) {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.write(jsonData.trim())
        response.end()
        resolve && resolve()
      })
      .listen(1337)
    console.log(
      chalk.greenBright('Invitation server is listening on port 1337...')
    )

    await waitForElementAndTap('text', SCAN_BUTTON, TIMEOUT)

    await invitationPushed

    server.close()
    console.log(chalk.redBright('Invitation server has been stopped.'))

    await waitForElementAndTap('text', ALLOW_BUTTON, TIMEOUT)

    await waitForElementAndTap('text', 'Connect', TIMEOUT)

    await new Promise((r) => setTimeout(r, 30000)) // sync

    // // WriteSchema
    let [schemaID, result3] = await instance.createSchema([
      'firstname',
      'lastname',
    ])
    console.warn([schemaID, result3])

    // // WriteCredDef
    let [credDefID, result4] = await instance.createCredentialDef(schemaID)
    console.warn([credDefID, result4])

    // // SendOffer
    let result5 = await instance.sendCredentialOffer(DID, credDefID, {
      firstname: 'Leonid',
      lastname: 'Azadovskiy',
    })
    console.warn(result5)

    await new Promise((r) => setTimeout(r, 10000)) // wait for new message
    await element(by.text('No new notifications.')).swipe('down')
    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)
    await waitForElementAndTap('text', CLAIM_OFFER_ACCEPT, TIMEOUT)
    await new Promise((r) => setTimeout(r, 10000))

    // // IssueCredential
    let result6 = await instance.issueCredential(DID)
    console.warn(result6)

    await new Promise((r) => setTimeout(r, 30000)) // wait for credential issuance

    // // PresentProof
    let result7 = await instance.presentProof(
      DID,
      'proof request',
      ['firstname', 'lastname'],
      true
    )
    console.warn(result7)

    await new Promise((r) => setTimeout(r, 10000)) // wait for new message
    await element(by.text('No new notifications.')).swipe('down')
    await waitForElementAndTap('text', HOME_NEW_MESSAGE, TIMEOUT)
    await waitForElementAndTap('text', PROOF_REQUEST_SEND, TIMEOUT)

    instance.endpointServer.close()
    console.log(chalk.redBright('VAS server has been stopped.'))
  })
})

// QA RC
const VASconfig = {
  verityUrl: 'https://vas.pqa.evernym.com/api/',
  verityPublicDID: 'D6tuzxJe4Vpyz2XwTwnf7T',
  verityPublicVerKey: '7bZHdWn2KNyD36iRxQSLqikFKmjFYfAyBjYJqw76Tfqg',
  domainDID: 'PofY18gShVSS4wfN5pmYjB',
  verityAgentVerKey: 'Tz4Z41bUAJJJgMCm1WhkjqLq7nFVP2bLC9WFXrbwEj6',
  sdkVerKeyId: 'KGtd7qrDmudHSRuc8ox5dP',
  sdkVerKey: 'AxgDQMEvACUxYE6oEpYSNC43EyawKpBSfD19xwx8kkko',
  version: '0.2',
  apiKey:
    'AxgDQMEvACUxYE6oEpYSNC43EyawKpBSfD19xwx8kkko:2WCxXCjFhrpRUtz93XQZxsqGcqaBpPnmkvJa8FEH16HPEnMXCAzChVsCdqcNh9bYieBCYma77pZAMKqtXdzADu3z',
}

// // Dev Team 1
// const VASconfig = {
//   verityUrl: 'https://vas-team1.pdev.evernym.com/api/',
//   domainDID: 'XNRkA8tboikwHD3x1Yh7Uz',
//   apiKey: 'HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp'
// }

// // Dev RC
// const VASconfig = {
//   verityUrl: 'https://vas.pdev.evernym.com/api/',
//   domainDID: '32djqLcu9WGsZL4MwyAjVn',
//   apiKey:
//     'C6jtgbRwzTHp1T1mQSFGDf2YTdHeN1kj2sJr7VJbvT5P:4iBetiYFD998So2APxqRRdjYFg7qhjQvLnkwpJ6vDBszoWGuRpj75YKvLJKBhsXSQtPvXTGghCyKaPMLJEVwX6v7',
// }

const httpsConfig = {
  timeout: 180000,
  httpsAgent: new https.Agent({}),
  headers: {
    'X-API-KEY': VASconfig['apiKey'],
  },
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
