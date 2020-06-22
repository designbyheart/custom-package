// @flow

import isUrl from 'validator/lib/isURL'
import URLParse from 'url-parse'

import type {
  AriesConnectionInvite,
  AriesConnectionInvitePayload,
} from '../../../invitation/type-invitation'

import { CONNECTION_INVITE_TYPES } from '../../../invitation/type-invitation'
import { schemaValidator } from '../../../services/schema-validator'
import { ID, TYPE } from '../../../common/type-common'
import { flattenAsync } from '../../../common/flatten-async'
import { toUtf8FromBase64 } from '../../../bridge/react-native-cxs/RNCxs'

export async function isAriesConnectionInviteQrCode(
  parsedUrl: URLParse
): Promise<AriesConnectionInvite | false> {
  const { query } = parsedUrl

  if (!query.c_i) {
    // if url does not have a query param named c_i, then return false
    return false
  }

  const [decodeError, decodedInvite] = await flattenAsync(toUtf8FromBase64)(
    query.c_i
  )
  if (decodeError || decodedInvite === null) {
    return false
  }

  let qrData: AriesConnectionInvitePayload
  try {
    qrData = (JSON.parse(decodedInvite): AriesConnectionInvitePayload)
  } catch (e) {
    return false
  }

  return isValidAriesV1InviteData(qrData, decodedInvite)
}

export function isValidAriesV1InviteData(
  payload: Object,
  original: string
): false | AriesConnectionInvite {
  if (!schemaValidator.validate(ariesConnectionInviteQrSchema, payload)) {
    return false
  }

  if (!isUrl(payload.serviceEndpoint)) {
    return false
  }

  return {
    original,
    payload,
    type: CONNECTION_INVITE_TYPES.ARIES_V1_QR,
    version: '1.0',
  }
}

const ariesConnectionInviteQrSchema = {
  type: 'object',
  properties: {
    [ID]: { type: 'string' },
    [TYPE]: { type: 'string' },
    label: { type: ['null', 'string'] },
    recipientKeys: {
      type: 'array',
      items: [{ type: 'string' }],
      minItems: 1,
    },
    routingKeys: {
      type: ['null', 'array'],
      items: [{ type: 'string' }],
      minItems: 0,
    },
    serviceEndpoint: { type: 'string' },
  },
  required: [ID, TYPE, 'recipientKeys', 'serviceEndpoint'],
}
