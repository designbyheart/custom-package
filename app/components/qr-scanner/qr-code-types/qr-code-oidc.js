// @flow

import urlParse from 'url-parse'
import isUrl from 'validator/lib/isURL'
import { stringify } from 'query-string'

import type { QrCodeOIDC, JWTAuthenticationRequest } from '../type-qr-scanner'

import { QR_CODE_TYPES, SCAN_STATUS } from '../type-qr-scanner'
import { flatFetch } from '../../../common/flat-fetch'
import { STORE_STATUS } from '../../../common/type-common'
import { schemaValidator } from '../../../services/schema-validator'
import { toUtf8FromBase64 } from '../../../bridge/react-native-cxs/RNCxs'
import { addBase64Padding } from '../../../common/base64-padding'
import { flatTryCatch } from '../../../common/flat-try-catch'

export function isValidOIDCQrCode(parsedUrl: urlParse): QrCodeOIDC | false {
  const { protocol, query, hostname } = parsedUrl

  if (!validInvitationUrlScheme.includes(protocol)) {
    return false
  }

  if (!trustedDomains.includes(hostname)) {
    return false
  }

  // validate query string params that needs to be present in OIDC link
  for (const requiredParamName of requiredQueryParams) {
    if (!query[requiredParamName]) {
      return false
    }
  }

  // validation for values of required query params
  const responseType = query.response_type
  if (responseType !== 'id_token') {
    return false
  }

  const [decodeError, clientId] = flatTryCatch(decodeURIComponent)(
    query.client_id
  )
  if (decodeError || !clientId || !isUrl(clientId)) {
    return false
  }

  const [requestDecodeError, requestUri] = flatTryCatch(decodeURIComponent)(
    query.request_uri
  )
  if (requestDecodeError || !requestUri || !isUrl(requestUri)) {
    return false
  }

  return {
    type: QR_CODE_TYPES.OIDC,
    version: '0.1',
    clientId,
    requestUri,
    responseType,
  }
}

export async function fetchValidateJWT(
  oidcAuthenticationCode: QrCodeOIDC
): Promise<[null | JWTAuthenticationRequest, null | string]> {
  const [error, jwtResponse] = await flatFetch(
    oidcAuthenticationCode.requestUri
  )
  if (error !== null || jwtResponse === null) {
    return [null, SCAN_STATUS.AUTH_REQUEST_DOWNLOAD_FAILED]
  }

  const [encodedHeader, encodedBody, encodedSignature] = jwtResponse
    .split('.')
    .map(addBase64Padding)

  // check if header is valid as per ConnectMe expectations
  const [decodeError, header] = await decodeToJSON(encodedHeader)
  if (decodeError !== null || header === null) {
    return [null, SCAN_STATUS.AUTH_REQUEST_INVALID_HEADER_DECODE_ERROR]
  }
  if (!schemaValidator.validate(jwtHeaderSchema, header)) {
    return [null, SCAN_STATUS.AUTH_REQUEST_INVALID_HEADER_SCHEMA]
  }

  // check if body is valid
  const [bodyDecodeError, body] = await decodeToJSON(encodedBody)
  if (bodyDecodeError !== null || body === null) {
    return [null, SCAN_STATUS.AUTH_REQUEST_INVALID_BODY_DECODE_ERROR]
  }
  if (!schemaValidator.validate(jwtBodySchema, body)) {
    const [fail, success] = await sendValidationErrorToClient(
      oidcAuthenticationCode.clientId,
      JSON.stringify(schemaValidator.errors),
      body
    )
    if (fail) {
      return [null, SCAN_STATUS.AUTH_REQUEST_INVALID_BODY_SCHEMA_AND_SEND_FAIL]
    }
    return [null, SCAN_STATUS.AUTH_REQUEST_INVALID_BODY_SCHEMA]
  }

  // TODO:KS Add functionality to add signature verification using libVcx
  // For now, signature may or may not be available, and we are going ahead
  // with requests even without signature. Once this changes, and we decide
  // to enforce signatures and signature validation, then we need to add logic
  // here to enforce signature verification using libVcx
  // check if signature is present
  // if (encodedSignature.length < 2) {
  //   return [null, SCAN_STATUS.AUTH_REQUEST_INVALID_SIGNATURE]
  // }

  return [
    {
      header,
      body,
      encodedSignature,
    },
    null,
  ]
}

async function decodeToJSON(
  encodedValue: string
): Promise<[null | typeof Error, null | Object]> {
  try {
    const decodedUtf = await toUtf8FromBase64(encodedValue, 'URL_SAFE')
    const decodedJSON = JSON.parse(decodedUtf)

    return [null, decodedJSON]
  } catch (e) {
    return [e, null]
  }
}

async function sendValidationErrorToClient(
  url: string,
  errors: string,
  body: Object
) {
  const state =
    !body.state || typeof body.state !== 'string'
      ? 'property state missing in payload'
      : body.state

  const response = {
    error: 'invalid_request',
    error_description: errors,
    state,
  }
  const [sendError, status] = await flatFetch(url, stringify(response), {
    'Content-Type': 'application/x-www-form-urlencoded',
  })

  return [!!sendError, !!status]
}

// only trust if scheme is https, http is not allowed
const validInvitationUrlScheme = ['https:']

// maximum length allowed for whole url-qr-code
const validInvitationUrlLength = 4096

// only trust urls that has origin of connectme.app.link
const trustedDomains = ['connectme.app.link']

// required query string params
const requiredQueryParams = ['response_type', 'client_id', 'request_uri']

const jwtHeaderSchema = {
  type: 'object',
  properties: {
    alg: { type: 'string', enum: ['Ed25519', 'none'] },
    typ: { type: 'string', enum: ['JWT'] },
    kid: { type: 'string', minLength: 2, maxLength: 1024 },
  },
  required: ['alg', 'typ'],
}

const jwtBodySchema = {
  type: 'object',
  properties: {
    iss: { type: 'string', minLength: 3 },
    response_type: { type: 'string', minLength: 2 }, // need to add ENUM for possible values of response_type
    client_id: { type: 'string', minLength: 5, maxLength: 4096 },
    scope: { type: 'string', minLength: 2 },
    state: { type: 'string', minLength: 2 },
    nonce: { type: 'string', minLength: 8 },
    response_mode: { type: 'string', enum: ['form_post', 'query'] },
    registration: {
      type: 'object',
      properties: {
        id_token_signed_response_alg: {
          type: 'array',
          minItems: 1,
          enum: [['Ed25519']],
        },
        request_object_signing_alg: { type: 'string' },
        jwks_uri: { type: 'string', minLength: 4, maxLength: 4096 },
      },
      required: ['id_token_signed_response_alg'],
    },
  },
  required: [
    'iss',
    'response_type',
    'client_id',
    'scope',
    'nonce',
    'response_mode',
    'registration',
    'state',
  ],
}
