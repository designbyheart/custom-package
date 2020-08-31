// @flow

import type { Url } from 'url-parse'

import type {
  AriesConnectionInvite,
  AriesConnectionInvitePayload,
  AriesOutOfBandInvite,
} from '../../../invitation/type-invitation'

import { flattenAsync } from '../../../common/flatten-async'
import { toUtf8FromBase64 } from '../../../bridge/react-native-cxs/RNCxs'
import {
  isValidAriesV1InviteData,
  isValidAriesOutOfBandInviteData,
} from '../../../invitation/invitation'

export async function isAriesConnectionInviteQrCode(
  parsedUrl: Url
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

export async function isAriesOutOfBandInviteQrCode(
  parsedUrl: Url
): Promise<AriesOutOfBandInvite | false> {
  const { query } = parsedUrl

  if (!query.oob) {
    return false
  }

  const [decodeError, decodedInvite] = await flattenAsync(toUtf8FromBase64)(
    query.oob,
    'URL_SAFE'
  )
  if (decodeError || decodedInvite === null) {
    return false
  }

  try {
    return isValidAriesOutOfBandInviteData(JSON.parse(decodedInvite))
  } catch (e) {
    return false
  }
}
