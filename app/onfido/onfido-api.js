// @flow
import type { GenericObject } from '../common/type-common'

// although this seems like a big issue that we are committing this token
// directly in source code, there is actually no issue with this
// because even if people get this token, the most that they can do
// is launch onFido SDK in their mobile app, and then scan documents
// and scanned documents would only show up in our account if onfido approves
// those documents
// Having said above things, we have to discuss this with onFido team
// because onFido team suggested this approach
const onfidoAuthorizationToken = 'test_wSVTpffhcS0014N11jRHoWyQrm_J3DRM'
const applicantParams = {
  // as per onFido team we can hard code name and user's name
  // would be extracted from documents that user uploads
  // this paramter is needed because onFido API needs this param
  first_name: 'Evernym',
  last_name: 'connect.me',
}
const applicantParamsQueryString = encodeStringify(applicantParams)
const onFidoBaseUrl = 'https://api.onfido.com/v2/applicants/'
const onFidoChecks = {
  type: 'express',
  async: 'true',
  'reports[][name]': 'document',
  'reports[][name]': 'facial_similarity',
  'reports[][variant]': 'standard',
}
const checkParamsQueryString = encodeStringify(onFidoChecks)
const onfidoInvitationUrl = 'https://credentials-gateway.onfido.com/invite'

function encodeStringify(params: GenericObject) {
  return Object.keys(params)
    .map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    })
    .join('&')
}

async function post(config: {
  url: string,
  body: string,
  contentType: ?string,
}) {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': config.contentType
        ? config.contentType
        : 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: `Token token=${onfidoAuthorizationToken}`,
    },
    body: config.body,
  })

  return await response.json()
}

export async function getApplicantId() {
  return post({
    url: onFidoBaseUrl,
    body: applicantParamsQueryString,
    contentType: null,
  })
}

export async function getCheckUuid(applicantId: string) {
  return post({
    url: `${onFidoBaseUrl}${applicantId}/checks`,
    body: checkParamsQueryString,
    contentType: null,
  })
}

export async function getOnfidoInvitation(applicantId: string) {
  return post({
    url: onfidoInvitationUrl,
    body: JSON.stringify({ applicant_uuid: applicantId }),
    contentType: 'application/json',
  })
}
