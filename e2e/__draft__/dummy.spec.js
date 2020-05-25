/**
 * @jest-environment node
 */

// @flow
import { post, get } from 'axios'
import imap from 'imap-simple'
import moment from 'moment'
import R from 'ramda'
import https from 'https'
import fs from 'fs'
import { element, by, waitFor } from 'detox'
import { doesNotThrow } from 'assert'

let verityBaseUrl = 'https://vui.pqa.evernym.com/api/v1'
let token = ''
let agencyBaseUrl = 'https://agency.pqa.evernym.com'

describe('Dummy test suite', () => {
  it('Case 1: VerityUI connection', async () => {
    async function connectVerity() {
      let res = await post(
        `${verityBaseUrl}/connections`,
        {
          name: 'Alex',
          phone: '8327364896',
          sms: true,
        },
        {
          timeout: 150000,
          httpsAgent: new https.Agent({
            ca: fs.readFileSync('devops/ca.crt'),
          }),
          auth: {
            username: 'demo',
            password: 'ktjo6iKiJsn7EGlCCZj07qKw3',
          },
        }
      )

      return res.data.id
    }

    let invitationId = await connectVerity()
    console.log(invitationId)
    await new Promise(r => setTimeout(r, 30000)) // wait before fetching latest message
  })

  it('Case 2: Mail connection', async () => {
    const inboxConfig = {
      imap: {
        user: 'number.2018@yahoo.com',
        password: 'Evernym123',
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true,
        authTimeout: 30000,
      },
    }
    const waitingInbox = imap
      .connect(inboxConfig)
      .then(connection => {
        return [connection, connection.openBox('INBOX')]
      })
      .catch(console.error)
    const today = moment().format('MMMM DD, YYYY')
    const emailSearchCriteria = ['UNSEEN', ['SINCE', today]]
    const emailFetchOptions = {
      markSeen: false,
      bodies: ['TEXT', 'HEADER'],
    }

    const [connection, openingInbox] = await waitingInbox
    await openingInbox
    const emails = await connection.search(
      emailSearchCriteria,
      emailFetchOptions
    )
    const latestEmailBody = R.compose(
      R.prop('body'),
      R.head,
      R.filter(R.eqProps('which', { which: 'TEXT' })),
      R.flatten,
      R.prop('parts'),
      R.head,
      R.sortWith([R.descend(R.prop('seqNo'))])
    )(emails)
    const appLink = 'https://link.comect.me/?t='
    const appLinkIndex = latestEmailBody.indexOf(appLink)
    const tokenSize = 8
    token = latestEmailBody.slice(
      appLinkIndex + appLink.length,
      appLinkIndex + appLink.length + tokenSize
    )

    console.log(latestEmailBody)
    console.log(token)
  })

  it('Case 3: Agency connection', async () => {
    async function connectAgency() {
      const fetchingInvitation = await get(
        `${agencyBaseUrl}/agency/url-mapper/${token}`
      )
        .then(R.compose(get, R.path(['data', 'url'])))
        .catch(console.error)

      return fetchingInvitation
    }

    let res = await connectAgency()
    console.log(res)
  })
})
