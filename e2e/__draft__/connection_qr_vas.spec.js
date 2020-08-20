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

import { waitForElementAndTap } from '../utils/detox-selectors'
import {
  SCAN_BUTTON,
  ALLOW_BUTTON,
  INVITATION_ACCEPT,
} from '../utils/test-constants'

//$FlowFixMe
require('tls').DEFAULT_ECDH_CURVE = 'auto'

const TIMEOUT = 10000

describe('Connection via SMS link as QR code', () => {
  it('Connection via SMS link as QR code', async () => {
    const jsonData = await main()

    const { resolve, promise: invitationPushed } = getDeferred()
    const server = http
      .createServer(function (request, response) {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        // response.writeHead(200, { 'Content-Type': 'text/plain' })
        response.write(jsonData.trim())
        response.end()
        resolve && resolve()
      })
      .listen(1337)
    console.log(
      chalk.greenBright('Invitation server is listening on port 1337...')
    )

    await new Promise((r) => setTimeout(r, 10000))

    await waitForElementAndTap('text', SCAN_BUTTON, TIMEOUT)

    await invitationPushed

    server.close()
    console.log(chalk.redBright('Invitation server has been stopped.'))

    await waitForElementAndTap('text', ALLOW_BUTTON, TIMEOUT)

    await waitForElementAndTap('id', INVITATION_ACCEPT, TIMEOUT)
  })
})

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

const httpsConfig = {
  timeout: 180000,
  httpsAgent: new https.Agent({}),
  headers: {
    'X-API-KEY': VASconfig['apiKey'],
  },
}

const main = async () => {
  // Start server to listen VAS responses
  let VASresponse // keep the latest VAS response here
  const server = http
    .createServer(function (request, response) {
      const { headers, method, url } = request
      let body = ''
      request
        .on('error', (err) => {
          console.error(err)
        })
        .on('data', (chunk) => {
          console.log(`On data chunk >>> ${chunk}`)
          body += chunk.toString()
        })
        .on('end', () => {
          VASresponse = body
          console.log(
            '----------------\n',
            `Headers: ${JSON.stringify(headers)}\n`,
            `Method: ${method}\n`,
            `URL: ${url}\n`,
            `Body: ${body}\n`,
            '----------------\n'
          )
        })
    })
    .listen(1338)
  console.log(chalk.greenBright('VAS server is listening on port 1338...'))

  // Register server endpoint in VAS - run it once
  await post(
    `${VASconfig['verityUrl']}${
      VASconfig['domainDID']
    }/configs/0.6/${uuidv4()}`,
    {
      '@id': uuidv4(),
      '@type':
        'did:sov:123456789abcdefghi1234;spec/configs/0.6/UPDATE_COM_METHOD',
      comMethod: {
        id: 'webhook',
        type: 2,
        value: 'http://94cdbe722ac2.ngrok.io', // it changes everytime you run ngrok
        packaging: {
          pkgType: 'plain',
        },
      },
    },
    httpsConfig
  )
    .catch((err) => console.error(err))
    .then((res) => console.log(res.data))

  // CreateRelationship request :: VAS returns RelationshipCreated
  await post(
    `${VASconfig['verityUrl']}${
      VASconfig['domainDID']
    }/relationship/1.0/${uuidv4()}`,
    {
      '@type': 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/create',
      '@id': uuidv4(),
      label: 'Alex',
    },
    httpsConfig
  )
    .catch((err) => console.error(err))
    .then((res) => console.log(res.data))

  await new Promise((r) => setTimeout(r, 10000))

  // RelationshipInvitationRequest request :: VAS returns RelationshipInvite
  //$FlowFixMe
  let lastResponse = JSON.parse(VASresponse)
  console.log(`DID: ${lastResponse['did']}`)
  const THREAD_ID = lastResponse['~thread']['thid']
  console.log(`THREAD ID: ${THREAD_ID}`)
  await post(
    `${VASconfig['verityUrl']}${VASconfig['domainDID']}/relationship/1.0/${THREAD_ID}`,
    {
      '@type':
        'did:sov:123456789abcdefghi1234;spec/relationship/1.0/connection-invitation',
      '@id': uuidv4(),
      '~forRelationship': lastResponse['did'],
    },
    httpsConfig
  )
    .catch((err) => console.error(err))
    .then((res) => console.log(res.data))

  await new Promise((r) => setTimeout(r, 10000))
  //$FlowFixMe
  lastResponse = JSON.parse(VASresponse)
  let link = lastResponse['inviteURL']
  console.log(link)
  // link = link.substr(45)
  // console.log(link)
  // const { stdout } = await exec(
  //   `echo "${link}" | base64 --decode`
  // )
  // console.log(chalk.cyan(stdout))
  // const jsonData = stdout

  // Shutdown server
  await new Promise((r) => setTimeout(r, 10000))
  server.close()
  console.log(chalk.redBright('VAS server has been stopped.'))

  // return jsonData
  return link
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
