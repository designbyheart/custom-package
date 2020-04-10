// @flow
import urlParse from 'url-parse'

import type {
  AriesConnectionInvite,
  AriesConnectionInvitePayload,
} from '../../../invitation/type-invitation'
import type {
  QrCodeOIDC,
  QR_SCAN_STATUS,
  QrCodeNonJsonUrl,
} from '../type-qr-scanner'

import { SCAN_STATUS, QR_CODE_TYPES } from '../type-qr-scanner'
import { flatFetch } from '../../../common/flat-fetch'
import { flatJsonParse } from '../../../common/flat-json-parse'
import { isAriesConnectionInviteQrCode } from './qr-code-aries-connection-invite'
import { isValidOIDCQrCode } from './qr-code-oidc'

export function isValidUrlQrCode(urlQrCode: string): urlParse | boolean {
  const parsedUrl: urlParse = urlParse(urlQrCode, {}, true)

  if (!validUrlQrCodeScheme.includes(parsedUrl.protocol)) {
    return false
  }

  return parsedUrl
}

export async function getUrlQrCodeData(
  parsedUrl: urlParse,
  url: string
): Promise<
  [
    null | QR_SCAN_STATUS,
    null | Object | AriesConnectionInvite | QrCodeOIDC | QrCodeNonJsonUrl,
  ]
> {
  // if we get url qr code, then there are three ways as of now that ConnectMe supports
  // to get data from url qr code

  // Two ways are to get data directly from URL query params

  // 1. get aries invitation data using url qr code
  const ariesConnectionInvite = await isAriesConnectionInviteQrCode(parsedUrl)
  if (ariesConnectionInvite) {
    return [null, ariesConnectionInvite]
  }

  // 2. get OIDC authentication data from url
  const oidcQrCode = isValidOIDCQrCode(parsedUrl)
  if (oidcQrCode) {
    return [null, oidcQrCode]
  }

  // if there is no data available in url params, then try to download data
  // from the passed url and check if we get data from url

  // 3. download data and get a valid json object
  const [downloadError, downloadedData] = await flatFetch(url)
  if (downloadedData) {
    // we are able to get data from url

    // now we need to verify that data is a valid json
    const [parseError, parsedData] = flatJsonParse(downloadedData)

    if (parsedData) {
      // if we get some json data, then return it
      return [null, parsedData]
    }

    // since we know that we got some downloadedData
    // but this downloaded data is not json
    // so we return with type non-json

    return [
      null,
      { type: QR_CODE_TYPES.URL_NON_JSON_RESPONSE, data: downloadedData },
    ]
  }

  // if we reach to this point, that means that we could not get data from url
  // either by downloading data behind url, or by extracting data from url itself
  // so the url qr code is invalid
  return [SCAN_STATUS.INVALID_URL_QR_CODE, null]
}

export const validUrlQrCodeScheme = ['https:', 'http:']
