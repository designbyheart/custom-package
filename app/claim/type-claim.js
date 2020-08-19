// @flow

import type {
  GenericObject,
  CustomError,
  InitialTestAction,
  ResetAction,
  NotificationPayload,
} from '../common/type-common'
import type { Connection, Connections } from '../store/type-connection-store'
import type { ClaimOfferStore } from '../claim-offer/type-claim-offer'

export type Claim = {
  messageId: string,
  claim: { [string]: Array<string> },
  schema_seq_no: number,
  issuer_did: string,
  signature: {
    primary_claim: {
      m2: string,
      a: string,
      e: string,
      v: string,
    },
    non_revocation_claim?: GenericObject,
  },
  optional_data?: GenericObject,
  remoteDid: string,
  uid: string,
  from_did: string,
  forDID: string,
  connectionHandle?: number,
  remotePairwiseDID?: string,
}

export type ClaimWithUuid = Claim & {
  claim_uuid: string,
}

export const CLAIM_RECEIVED = 'CLAIM_RECEIVED'
export type ClaimReceivedAction = {
  type: typeof CLAIM_RECEIVED,
  claim: Claim,
}

export const CLAIM_STORAGE_SUCCESS = 'CLAIM_STORAGE_SUCCESS'
export type ClaimStorageSuccessAction = {
  type: typeof CLAIM_STORAGE_SUCCESS,
  messageId: string,
  issueDate: number,
}

export const CLAIM_STORAGE_FAIL = 'CLAIM_STORAGE_FAIL'
export type ClaimStorageFailAction = {
  type: typeof CLAIM_STORAGE_FAIL,
  messageId: string,
  error: CustomError,
}

export const MAP_CLAIM_TO_SENDER = 'MAP_CLAIM_TO_SENDER'
export type MapClaimToSenderAction = {
  type: typeof MAP_CLAIM_TO_SENDER,
  claimUuid: string,
  senderDID: string,
  myPairwiseDID: string,
  logoUrl: string,
  issueDate: number,
}

export type ClaimMap = {
  +[claimUuid: string]: {
    senderDID: string,
    myPairwiseDID: string,
    logoUrl: string,
    issueDate: number,
  },
}

export const HYDRATE_CLAIM_MAP = 'HYDRATE_CLAIM_MAP'
export type HydrateClaimMapAction = {
  type: typeof HYDRATE_CLAIM_MAP,
  claimMap: ClaimMap,
}

export const HYDRATE_CLAIM_MAP_FAIL = 'HYDRATE_CLAIM_MAP_FAIL'
export type HydrateClaimMapFailAction = {
  type: typeof HYDRATE_CLAIM_MAP_FAIL,
  error: CustomError,
}

export type ClaimPushPayloadVcx = {
  connectionHandle: number,
}
export type ClaimVcx = NotificationPayload & ClaimPushPayloadVcx

export const CLAIM_RECEIVED_VCX = 'CLAIM_RECEIVED_VCX'
export type ClaimReceivedVcxAction = {
  type: typeof HYDRATE_CLAIM_MAP_FAIL,
  claim: ClaimVcx,
}

export const DELETE_CLAIM = 'DELETE_CLAIM'
export type DeleteClaimAction = {
  type: typeof DELETE_CLAIM,
  uuid: string,
}

export const DELETE_CLAIM_SUCCESS = 'DELETE_CLAIM_SUCCESS'

export type DeleteClaimSuccessAction = {
  type: typeof DELETE_CLAIM_SUCCESS,
  claimMap: ClaimMap,
  messageId: string,
}

export type ClaimAction =
  | ClaimReceivedAction
  | ClaimStorageSuccessAction
  | ClaimStorageFailAction
  | MapClaimToSenderAction
  | HydrateClaimMapAction
  | HydrateClaimMapFailAction
  | InitialTestAction
  | ResetAction
  | ClaimReceivedVcxAction
  | DeleteClaimSuccessAction

export type ClaimStore = {
  +[string]: {
    claim: Claim,
    error?: CustomError,
  },
  claimMap: ClaimMap,
}

export const ERROR_CLAIM_HYDRATE_FAIL = {
  message: 'Failed to hydrate claim map',
  code: 'CL-001',
}
