// @flow

import type { InvitationPayload } from '../../invitation/type-invitation'

export const SCAN_STATUS = {
  SCANNING: 'scanning...',
  SUCCESS: 'Success!',
  FAIL: 'QR code format is invalid.',
  DOWNLOADING_INVITATION: 'Downloading invitation...',
  NO_INVITATION_DATA: 'No message found behind this QR code.',
  DOWNLOADING_AUTHENTICATION_JWT: 'Loading authentication request...',
  NO_AUTHENTICATION_REQUEST:
    'No authentication request found behind this QR code.',
  AUTH_REQUEST_DOWNLOAD_FAILED: 'Failed to load authentication request.',
  AUTH_REQUEST_INVALID_HEADER_DECODE_ERROR:
    '001::Malformed authentication request.',
  AUTH_REQUEST_INVALID_HEADER_SCHEMA: '002::Malformed authentication request.',
  AUTH_REQUEST_INVALID_BODY_DECODE_ERROR:
    '003::Malformed authentication request.',
  AUTH_REQUEST_INVALID_BODY_SCHEMA: '004::Malformed authentication request.',
  AUTH_REQUEST_INVALID_SIGNATURE: '005::Malformed authentication request.',
  AUTH_REQUEST_INVALID_BODY_SCHEMA_AND_SEND_FAIL:
    '006::Malformed authentication request.',
}

export type QrCode = {
  id: string,
  s: {
    n: string,
    dp: {
      d: string,
      k: string,
      s: string,
    },
    d: string,
    l: string,
    v: string,
    publicDID?: string,
  },
  sa: {
    d: string,
    v: string,
    e: string,
  },
  t: string,
  version?: string,
}

type ValuesType = <V>(v: V) => V

type QR_SCAN_STATUS =
  | typeof SCAN_STATUS.SCANNING
  | typeof SCAN_STATUS.FAIL
  | typeof SCAN_STATUS.SUCCESS
  | typeof SCAN_STATUS.DOWNLOADING_INVITATION
  | typeof SCAN_STATUS.NO_INVITATION_DATA

export type QrScannerState = {
  scanning: boolean,
  scanStatus: QR_SCAN_STATUS,
  cameraActive?: boolean,
}

export type QrScannerProps = {
  onRead: QrCode => void,
  onClose: () => void,
  onEnvironmentSwitchUrl: EnvironmentSwitchUrlQrCode => void,
  onInvitationUrl: InvitationPayload => void,
  onOIDCAuthenticationRequest: OIDCAuthenticationRequest => void,
}

export type CameraMarkerProps = {
  status: QR_SCAN_STATUS,
  onClose: () => void,
}

export const TOP_LEFT = 'topLeft'
export const TOP_RIGHT = 'topRight'
export const BOTTOM_LEFT = 'bottomLeft'
export const BOTTOM_RIGHT = 'bottomRight'

export type CornerBoxProps = {
  status: QR_SCAN_STATUS,
  position:
    | typeof TOP_LEFT
    | typeof TOP_RIGHT
    | typeof BOTTOM_LEFT
    | typeof BOTTOM_RIGHT,
}

export type EnvironmentSwitchUrlQrCode = {
  url: string,
  name: string,
}

export type InvitationUrlQrCode = {
  url: string,
}

export const QR_CODE_TYPES = {
  INVITATION: 'INVITATION',
  URL_INVITATION: 'URL_INVITATION',
  ENV_SWITCH_URL: 'ENV_SWITCH_URL',
  OIDC: 'OIDC',
}
export type QrCodeTypes = $Keys<typeof QR_CODE_TYPES>

export type QrCodeOIDC = {
  type: 'OIDC',
  version: string,
  clientId: string,
  requestUri: string,
  responseType: string,
}

export type JWTAuthenticationRequest = {
  header: {
    alg: string,
    typ: string,
    kid: ?string,
  },
  body: {
    iss: string,
    response_type: string,
    client_id: string,
    scope: string,
    state: string,
    nonce: string,
    response_mode: string,
    registration: {
      request_object_signing_alg: ?string,
      jwks_uri: ?string,
      id_token_signed_response_alg: Array<string>,
    },
  },
  encodedSignature: ?string,
}

export type OIDCAuthenticationRequest = {
  oidcAuthenticationQrCode: QrCodeOIDC,
  jwtAuthenticationRequest: JWTAuthenticationRequest,
  id: string,
}
