// @flow

import isUrl from 'validator/lib/isURL'

import type {
  AriesConnectionInvite,
  AriesConnectionInvitePayload,
} from '../../../invitation/type-invitation'

import { CONNECTION_INVITE_TYPES } from '../../../invitation/type-invitation'
import { schemaValidator } from '../../../services/schema-validator'
import { ID, TYPE } from '../../../common/type-common'
import URLParse from 'url-parse'
import { flattenAsync } from '../../../common/flatten-async'
import { toUtf8FromBase64 } from '../../../bridge/react-native-cxs/RNCxs'

export async function isAriesConnectionInviteQrCode(
  qr: string
): Promise<AriesConnectionInvite | false> {
  if (!isUrl(qr)) {
    // if qr is not a url, then it cannot be a aries invite
    return false
  }

  const { query } = URLParse(qr, {}, true)

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

  if (!schemaValidator.validate(ariesConnectionInviteQrSchema, qrData)) {
    return false
  }

  if (!isUrl(qrData.serviceEndpoint)) {
    return false
  }

  return {
    original: decodedInvite,
    payload: qrData,
    type: CONNECTION_INVITE_TYPES.ARIES_V1_QR,
    version: '1.0',
  }
}

const ariesConnectionInviteQrSchema = {
  type: 'object',
  properties: {
    [ID]: { type: 'string' },
    [TYPE]: { type: 'string' },
    label: { type: 'string' },
    recipientKeys: {
      type: 'array',
      minItems: 1,
    },
    routingKeys: {
      type: 'array',
      minItems: 1,
    },
    serviceEndpoint: { type: 'string' },
  },
  required: [ID, TYPE, 'recipientKeys', 'routingKeys', 'serviceEndpoint'],
}
