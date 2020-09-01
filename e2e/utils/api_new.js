// @flow
/**
 * @jest-environment node
 */

import https from 'https'
import http from 'http'
import fs from 'fs'
import { post, get } from 'axios'
import R from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child-process-async'
import chalk, { magentaBright } from 'chalk'

export type InvitationType = 'connection-invitation' | 'out-of-band-invitation'
export type QRType = 'ARIES_V1_QR' | 'ARIES_OUT_OF_BAND'

export class VAS {
  verityConfig: any
  httpsConfig: any
  verityUrl: string
  domainDID: string
  endpointServer: any
  responseTimeout: number

  constructor(verityConfig: any) {
    this.verityConfig = verityConfig
    this.httpsConfig = {
      timeout: 180000,
      httpsAgent: new https.Agent({}),
      headers: {
        'X-API-KEY': this.verityConfig['apiKey'],
      },
    }
    this.verityUrl = this.verityConfig['verityUrl']
    this.domainDID = this.verityConfig['domainDID']
    this.responseTimeout = 15000

    this.endpointServer = http
      .createServer(function (request, response) {
        const { headers, method, url } = request
        let body = ''
        request
          .on('error', (err) => {
            console.error(err)
          })
          .on('data', (chunk) => {
            body += chunk.toString()
          })
          .on('end', () => {
            global.lastResponse = JSON.parse(body)
            console.log(
              '----------------\n',
              `Headers: ${JSON.stringify(headers)}\n`,
              `Method: ${method}\n`,
              `URL: ${url}\n`,
              `Body: ${JSON.stringify(global.lastResponse)}\n`,
              '----------------\n'
            )
          })
      })
      .listen(1338)
    console.log(chalk.greenBright('VAS server is listening on port 1338...'))
  }

  async registerEndpoint(endpointUrl: string): string {
    const result = await post(
      `${this.verityUrl}${this.domainDID}/configs/0.6/${uuidv4()}`,
      {
        '@id': uuidv4(),
        '@type':
          'did:sov:123456789abcdefghi1234;spec/configs/0.6/UPDATE_COM_METHOD',
        comMethod: {
          id: 'webhook',
          type: 2,
          value: endpointUrl, // it changes everytime you run ngrok
          packaging: {
            pkgType: 'plain',
          },
        },
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    //$FlowFixMe
    return result
  }

  async createRelationship(label: string): Array<string> {
    const result = await post(
      `${this.verityUrl}${this.domainDID}/relationship/1.0/${uuidv4()}`,
      {
        '@type': 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/create',
        '@id': uuidv4(),
        label: label,
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    await new Promise((r) => setTimeout(r, this.responseTimeout))

    const relationshipThreadID = global.lastResponse['~thread']['thid']
    console.log(chalk.magentaBright(`THREAD ID: ${relationshipThreadID}`))
    const DID = global.lastResponse['did']
    console.log(chalk.magentaBright(`RELATIONSHIP DID: ${DID}`))

    //$FlowFixMe
    return [relationshipThreadID, DID, result]
  }

  async relationshipInvitation(
    relationshipThreadID: string,
    DID: string,
    invitationType: InvitationType,
    qrType: QRType
  ): string {
    const result = await post(
      `${this.verityUrl}${this.domainDID}/relationship/1.0/${relationshipThreadID}`,
      {
        '@type': `did:sov:123456789abcdefghi1234;spec/relationship/1.0/${invitationType}`,
        '@id': uuidv4(),
        '~forRelationship': DID,
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    await new Promise((r) => setTimeout(r, this.responseTimeout))

    let link = global.lastResponse['inviteURL']
    console.log(chalk.cyanBright(link))
    link = link.substr(45) // this depends on verity environment used
    console.log(chalk.cyanBright(link))
    const { stdout } = await exec(`echo "${link}" | base64 --decode`)
    console.log(chalk.cyanBright(stdout))
    const payload = stdout

    const jsonData = JSON.stringify({
      payload: JSON.parse(payload),
      type: qrType,
      version: '1.0',
      original: payload,
    })
    console.log(chalk.magentaBright(jsonData))

    //$FlowFixMe
    return jsonData
  }

  async createSchema(attributes: Array<string>): Array<string> {
    const result = await post(
      `${this.verityUrl}${this.domainDID}/write-schema/0.6/${uuidv4()}`,
      {
        '@type': 'did:sov:123456789abcdefghi1234;spec/write-schema/0.6/write',
        '@id': uuidv4(),
        name: uuidv4(),
        version: '1.0',
        attrNames: attributes,
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    await new Promise((r) => setTimeout(r, this.responseTimeout * 2))

    const schemaID = global.lastResponse['schemaId']
    console.log(chalk.magentaBright(`SCHEMA ID: ${schemaID}`))

    //$FlowFixMe
    return [schemaID, result]
  }

  async createCredentialDef(schemaID: string): Array<string> {
    const result = await post(
      `${this.verityUrl}${this.domainDID}/write-cred-def/0.6/${uuidv4()}`,
      {
        '@type': 'did:sov:123456789abcdefghi1234;spec/write-cred-def/0.6/write',
        '@id': uuidv4(),
        name: uuidv4(),
        tag: 'tag',
        schemaId: schemaID,
        revocationDetails: {
          support_revocation: true,
          tails_file: 'string',
          max_creds: 100,
        },
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    await new Promise((r) => setTimeout(r, this.responseTimeout * 2))

    const credDefID = global.lastResponse['credDefId']
    console.log(chalk.magentaBright(`CRED DEF ID: ${credDefID}`))

    //$FlowFixMe
    return [credDefID, result]
  }

  async sendCredentialOffer(
    DID: string,
    credDefID: string,
    values: any
  ): string {
    const result = await post(
      `${this.verityUrl}${this.domainDID}/issue-credential/1.0/${uuidv4()}`,
      {
        '@type':
          'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/offer',
        '@id': uuidv4(),
        '~for_relationship': DID,
        cred_def_id: credDefID,
        credential_values: values,
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    //$FlowFixMe
    return result
  }

  async issueCredential(DID: string): string {
    const credThreadID = global.lastResponse['~thread']['thid']
    console.log(`CRED THREAD ID: ${credThreadID}`)

    const result = await post(
      `${this.verityUrl}${this.domainDID}/issue-credential/1.0/${credThreadID}`,
      {
        '@type':
          'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/issue',
        '@id': uuidv4(),
        '~for_relationship': DID,
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    //$FlowFixMe
    return result
  }

  async presentProof(
    DID: string,
    name: string,
    attributes: Array<string>,
    self_attest_allowed: boolean
  ): string {
    const result = await post(
      `${this.verityUrl}${this.domainDID}/present-proof/1.0/${uuidv4()}`,
      {
        '@type':
          'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/request',
        '@id': uuidv4(),
        '~for_relationship': DID,
        name: name,
        proof_attrs: [
          {
            names: attributes,
            self_attest_allowed: self_attest_allowed,
          },
        ],
      },
      this.httpsConfig
    )
      .catch((err) => console.error(err))
      .then((res) => res.data)

    //$FlowFixMe
    return result
  }
}

// TODO
export class VUI {
  constructor() {}
}
