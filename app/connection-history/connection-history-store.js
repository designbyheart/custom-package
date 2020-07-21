// @flow

import {
  all,
  takeLatest,
  takeEvery,
  put,
  call,
  select,
  take,
} from 'redux-saga/effects'
import merge from 'lodash.merge'
import { CONNECTIONS } from '../common'
import {
  LOAD_HISTORY,
  LOAD_HISTORY_SUCCESS,
  LOAD_HISTORY_FAIL,
  RECORD_HISTORY_EVENT,
  DELETE_HISTORY_EVENT,
  SHOW_USER_BACKUP_ALERT,
  ERROR_LOADING_HISTORY,
  HISTORY_EVENT_OCCURRED,
  EventTypeToEventStatusMap,
  HISTORY_EVENT_STATUS,
  HISTORY_EVENT_TYPE,
  HISTORY_EVENT_STORAGE_KEY,
  ERROR_HISTORY_EVENT_OCCURRED,
} from './type-connection-history'
import type {
  HistoryEventType,
  HistoryEventStatus,
  ConnectionHistoryEvent,
  ConnectionHistoryData,
  ConnectionHistoryAction,
  ConnectionHistoryStore,
  HistoryEventOccurredAction,
  HistoryEventOccurredEventType,
  DeleteHistoryEventAction,
  ShowUserBackupAlertAction,
  RecordHistoryEventAction,
} from './type-connection-history'
import type { Connection } from '../store/type-connection-store'
import type {
  CustomError,
  GenericObject,
  GenericStringObject,
} from '../common/type-common'
import type { InvitationPayload } from '../invitation/type-invitation'
import { uuid } from '../services/uuid'
import { INVITATION_RECEIVED } from '../invitation/type-invitation'
import moment from 'moment'
import type { NewConnectionAction } from '../store/type-connection-store'
import { NEW_CONNECTION_SUCCESS } from '../store/new-connection-success'
import type {
  SendClaimRequestSuccessAction,
  ClaimOfferPayload,
  ClaimOfferDenyAction,
  ClaimOfferReceivedAction,
  ClaimOfferAcceptedAction,
  SendClaimRequestFailAction,
  PaidCredentialRequestFailAction,
} from '../claim-offer/type-claim-offer'
import type { ClaimStorageSuccessAction } from '../claim/type-claim'
import type {
  Proof,
  UpdateAttributeClaimAction,
  ErrorSendProofFailAction,
} from '../proof/type-proof'
import type { Store } from '../store/type-store'
import {
  SEND_CLAIM_REQUEST_SUCCESS,
  CLAIM_OFFER_ACCEPTED,
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
  DENY_CLAIM_OFFER,
  DENY_CLAIM_OFFER_SUCCESS,
  DENY_CLAIM_OFFER_FAIL,
} from '../claim-offer/type-claim-offer'
import { UPDATE_ATTRIBUTE_CLAIM, ERROR_SEND_PROOF } from '../proof/type-proof'
import type {
  ProofRequestReceivedAction,
  SendProofSuccessAction,
  ProofRequestPayload,
  DenyProofRequestSuccessAction,
  SelfAttestedAttributes,
  DenyProofRequestAction,
  DenyProofRequestFailAction,
} from '../proof-request/type-proof-request'
import type {
  QuestionReceivedAction,
  QuestionPayload,
  UpdateQuestionAnswerAction,
} from '../question/type-question'
import type { Item } from '../components/custom-list/type-custom-list'
import {
  PROOF_REQUEST_RECEIVED,
  SEND_PROOF_SUCCESS,
  DENY_PROOF_REQUEST_SUCCESS,
  DENY_PROOF_REQUEST,
  PROOF_REQUEST_ACCEPTED,
  DENY_PROOF_REQUEST_FAIL,
} from '../proof-request/type-proof-request'
import { secureSet, getHydrationItem } from '../services/storage'
import {
  getProofRequest,
  getProof,
  getClaimOffer,
  getPendingHistoryEvent,
  getHistory,
  getPendingHistory,
  getHistoryEvent,
  getClaimReceivedHistory,
} from '../store/store-selector'
import { CLAIM_STORAGE_SUCCESS } from '../claim/type-claim'
import type { UserOneTimeInfo } from '../store/user/type-user-store'
import { RESET } from '../common/type-common'
import {
  CLAIM_OFFER_RECEIVED,
  NEW_CONNECTION_SEEN,
  CONNECTION_HISTORY_BACKED_UP,
} from '../claim-offer/type-claim-offer'
import { captureError } from '../services/error/error-handler'
import { customLogger } from '../store/custom-logger'
import {
  QUESTION_RECEIVED,
  UPDATE_QUESTION_ANSWER,
} from '../question/type-question'
import { MESSAGE_TYPE } from '../api/api-constants'
import { selectQuestion } from '../question/question-store'

const initialState = {
  error: null,
  isLoading: false,
  data: null,
}

export const newConnectionSeen = (senderDid: string) => ({
  type: NEW_CONNECTION_SEEN,
  senderDid,
})

export const connectionHistoryBackedUp = () => ({
  type: CONNECTION_HISTORY_BACKED_UP,
})

export const loadHistory = () => ({
  type: LOAD_HISTORY,
})

// FIXME: Flow is showing an error with ConnectionHistoryData type, need to look into this.
export const loadHistorySuccess = (data: any) => ({
  type: LOAD_HISTORY_SUCCESS,
  data,
})

export const loadHistoryFail = (error: CustomError) => ({
  type: LOAD_HISTORY_FAIL,
  error,
})

export function* loadHistorySaga(): Generator<*, *, *> {
  yield put(loadHistory())
  try {
    const historyEvents = yield call(
      getHydrationItem,
      HISTORY_EVENT_STORAGE_KEY
    )

    if (historyEvents) {
      const oldHistory = JSON.parse(historyEvents) // IMPORTANT: This is history.data, not just history object.
      const oldHistoryKeys = Object.keys(oldHistory)
      let newHistory = {
        connections: { data: {}, newBadge: false },
        connectionsUpdated: false,
      }

      if ('connectionsUpdated' in oldHistory) {
        yield put(loadHistorySuccess(oldHistory))
      } else if ('newBadge' in oldHistory[oldHistoryKeys[0]]) {
        newHistory = {
          ...newHistory,
          connections: oldHistory,
        }
        // $FlowFixMe Need to fix the type error here
        yield put(loadHistorySuccess(newHistory))
      } else {
        const modifiedData = {}
        for (let i = 0; i < oldHistoryKeys.length; i++) {
          modifiedData[oldHistoryKeys[i]] = {
            data: oldHistory[oldHistoryKeys[i]].data,
            newBadge: false,
          }
        }
        newHistory = {
          ...newHistory,
          connections: modifiedData,
        }
        yield put(loadHistorySuccess(newHistory))
      }
    }
  } catch (e) {
    captureError(e)
    yield put(
      loadHistoryFail({
        ...ERROR_LOADING_HISTORY,
        message: `${ERROR_LOADING_HISTORY.message} ${e.message}`,
      })
    )
  }
}

// receive invitation
export function convertInvitationToHistoryEvent(
  invitation: InvitationPayload
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[INVITATION_RECEIVED],
    data: {},
    id: uuid(),
    name: invitation.senderName,
    status: HISTORY_EVENT_STATUS[INVITATION_RECEIVED],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.INVITATION,
    remoteDid: invitation.senderDID,
    originalPayload: invitation,
  }
}

// accept invitation
export function convertConnectionSuccessToHistoryEvent(
  action: NewConnectionAction
): ConnectionHistoryEvent {
  const { senderName, senderDID } = action.connection

  return {
    action: HISTORY_EVENT_STATUS[NEW_CONNECTION_SUCCESS],
    data: [
      {
        label: 'Established on',
        data: moment().format(),
      },
    ],
    id: uuid(),
    name: senderName,
    status: HISTORY_EVENT_STATUS[NEW_CONNECTION_SUCCESS],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.INVITATION,
    remoteDid: senderDID,
    originalPayload: action,
  }
}

// claim request pending
export function convertSendClaimRequestSuccessToHistoryEvent(
  action: SendClaimRequestSuccessAction
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[SEND_CLAIM_REQUEST_SUCCESS],
    // $FlowFixMe
    data: action.payload.data && action.payload.data.revealedAttributes,
    id: uuid(),
    name: action.payload.data && action.payload.data.name,
    status: HISTORY_EVENT_STATUS[SEND_CLAIM_REQUEST_SUCCESS],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.CLAIM,
    remoteDid: action.payload.remotePairwiseDID,
    originalPayload: action,
  }
}

export function convertClaimStorageSuccessToHistoryEvent(
  action: ClaimStorageSuccessAction,
  claim: ClaimOfferPayload
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[CLAIM_STORAGE_SUCCESS],
    // $FlowFixMe
    data: claim.data && claim.data.revealedAttributes,
    id: uuid(),
    name: claim.data && claim.data.name,
    status: HISTORY_EVENT_STATUS[CLAIM_STORAGE_SUCCESS],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.CLAIM,
    remoteDid: claim.remotePairwiseDID,
    originalPayload: {
      ...action,
      remotePairwiseDID: claim.remotePairwiseDID,
    },
    payTokenValue: claim.payTokenValue,
  }
}

export function convertProofRequestToHistoryEvent(
  action: ProofRequestReceivedAction
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[PROOF_REQUEST_RECEIVED],
    // $FlowFixMe
    data: action.payload.data.requestedAttributes,
    id: uuid(),
    name: action.payload.data.name,
    status: HISTORY_EVENT_STATUS[PROOF_REQUEST_RECEIVED],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.PROOF,
    remoteDid: action.payloadInfo.remotePairwiseDID,
    originalPayload: action,
  }
}

export function convertClaimOfferToHistoryEvent(
  action: ClaimOfferReceivedAction
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[CLAIM_OFFER_RECEIVED],
    // $FlowFixMe
    data: action.payload.data.revealedAttributes,
    id: uuid(),
    name: action.payload.data.name,
    status: HISTORY_EVENT_STATUS[CLAIM_OFFER_RECEIVED],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.CLAIM,
    remoteDid: action.payload.issuer.did,
    originalPayload: action,
  }
}

export function convertClaimOfferAcceptedToHistoryEvent(
  action: ClaimOfferAcceptedAction,
  credentialOfferReceivedHistoryEvent: ConnectionHistoryEvent
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[CLAIM_OFFER_ACCEPTED],
    data: credentialOfferReceivedHistoryEvent.data,
    id: uuid(),
    name: credentialOfferReceivedHistoryEvent.name,
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.CLAIM,
    remoteDid: credentialOfferReceivedHistoryEvent.remoteDid,
    originalPayload: action,
    status: HISTORY_EVENT_STATUS[CLAIM_OFFER_ACCEPTED],
  }
}

export function convertClaimOfferDenyToHistoryEvent(
  action: ClaimOfferDenyAction,
  claimOffer: any
) {
  return {
    action: HISTORY_EVENT_STATUS[action.type],
    data: claimOffer.data.revealedAttributes,
    id: uuid(),
    name: claimOffer.data.name,
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.CLAIM,
    remoteDid: claimOffer.remotePairwiseDID,
    originalPayload: { ...action, claimOffer },
    status: HISTORY_EVENT_STATUS[action.type],
  }
}

export function convertCredentialRequestFailToHistoryEvent(
  action: SendClaimRequestFailAction | PaidCredentialRequestFailAction,
  credentialOfferAcceptedHistoryEvent: ConnectionHistoryEvent
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[action.type],
    data: credentialOfferAcceptedHistoryEvent.data,
    id: uuid(),
    name: credentialOfferAcceptedHistoryEvent.name,
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.CLAIM,
    remoteDid: credentialOfferAcceptedHistoryEvent.remoteDid,
    originalPayload: action,
    status: HISTORY_EVENT_STATUS[action.type],
  }
}

function convertUpdateAttributeToHistoryEvent(
  action: UpdateAttributeClaimAction,
  proofReceivedEvent: ConnectionHistoryEvent,
  selfAttestedAttributes: *
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[action.type],
    data: proofReceivedEvent.data,
    id: uuid(),
    name: proofReceivedEvent.name,
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.PROOF,
    remoteDid: proofReceivedEvent.remoteDid,
    originalPayload: { ...action, selfAttestedAttributes },
    status: HISTORY_EVENT_STATUS[action.type],
  }
}

function convertErrorSendProofToHistoryEvent(
  action: ErrorSendProofFailAction,
  storedUpdateAttributeEvent: ConnectionHistoryEvent
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[action.type],
    data: storedUpdateAttributeEvent.data,
    id: uuid(),
    name: storedUpdateAttributeEvent.name,
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.PROOF,
    remoteDid: storedUpdateAttributeEvent.remoteDid,
    originalPayload: {
      ...storedUpdateAttributeEvent.originalPayload,
      type: action.type,
    },
    status: HISTORY_EVENT_STATUS[action.type],
  }
}

function mapSentAttributes(
  revealedGroupAttributes: *,
  revealedAttributes: *,
  selfAttestedAttributes: *,
  requestedAttributes: *
): Array<Item> {
  let sentAttributes = []
  if (revealedAttributes) {
    const revealedAttributeKeys = Object.keys(revealedAttributes)
    const revealedAttributeValues: Array<any> = Object.values(
      revealedAttributes
    )
    revealedAttributeValues.forEach(
      (revealedAttribute: Array<string>, index: number) => {
        sentAttributes.push({
          label: requestedAttributes[revealedAttributeKeys[index]].name,
          key: revealedAttributeKeys[index],
          data: revealedAttribute[1],
          claimUuid: revealedAttribute[0],
        })
      }
    )
  }

  if (revealedGroupAttributes) {
    const attributes = revealedGroupAttributes
    Object.keys(attributes).forEach(attributeKey => {
      const revealedAttribute = attributes[attributeKey]
      sentAttributes.push({
        key: attributeKey,
        values: revealedAttribute.values,
        claimUuid: revealedAttribute.claimUuid
      })
    })
  }

  if (selfAttestedAttributes) {
    const selfAttestedAttributesKeys = Object.keys(selfAttestedAttributes)
    const selfAttestedAttributesValues: Array<any> = Object.values(
      selfAttestedAttributes
    )
    selfAttestedAttributesValues.forEach(
      (selfAttestedAttribute: string, index: number) => {
        sentAttributes.push({
          label: requestedAttributes[selfAttestedAttributesKeys[index]].name,
          key: selfAttestedAttributesKeys[index],
          data: selfAttestedAttribute,
        })
      }
    )
  }
  return sentAttributes
}

export function convertProofSendToHistoryEvent(
  action: SendProofSuccessAction,
  {
    data: { name },
    originalProofRequestData: { requested_attributes },
    remotePairwiseDID: remoteDid,
  }: ProofRequestPayload,
  { requested_proof: { revealed_group_attrs, revealed_attrs, self_attested_attrs } }: Proof
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[SEND_PROOF_SUCCESS],
    data: mapSentAttributes(
      revealed_group_attrs,
      revealed_attrs,
      self_attested_attrs,
      requested_attributes
    ),
    id: uuid(),
    name,
    status: HISTORY_EVENT_STATUS[SEND_PROOF_SUCCESS],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.PROOF,
    remoteDid,
    originalPayload: action,
  }
}

export function convertProofDenyToHistoryEvent(
  action:
    | DenyProofRequestSuccessAction
    | DenyProofRequestAction
    | DenyProofRequestFailAction,
  proofRequest: ProofRequestPayload
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[action.type],
    data: proofRequest,
    id: uuid(),
    name: proofRequest.data.name,
    status: HISTORY_EVENT_STATUS[action.type],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.PROOF,
    remoteDid: proofRequest.remotePairwiseDID,
    originalPayload: { ...action, proofRequest },
  }
}

export function convertQuestionReceivedToHistoryEvent(
  action: QuestionReceivedAction
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[QUESTION_RECEIVED],
    data: action.question,
    id: uuid(),
    name: action.question.messageTitle,
    status: HISTORY_EVENT_STATUS[QUESTION_RECEIVED],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.QUESTION,
    remoteDid: action.question.from_did,
    originalPayload: {
      payloadInfo: action.question,
      type: MESSAGE_TYPE.QUESTION,
    },
  }
}

export function convertQuestionAnswerToHistoryEvent(
  action: UpdateQuestionAnswerAction,
  question: QuestionPayload
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[UPDATE_QUESTION_ANSWER],
    data: { payload: question, ...action },
    id: uuid(),
    name: `You responded with: ${action.answer.text}`,
    status: HISTORY_EVENT_STATUS[UPDATE_QUESTION_ANSWER],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.QUESTION,
    remoteDid: question.from_did,
    originalPayload: {
      payloadInfo: question,
      type: MESSAGE_TYPE.QUESTION,
    },
  }
}

export const recordHistoryEvent = (historyEvent: ConnectionHistoryEvent) => ({
  type: RECORD_HISTORY_EVENT,
  historyEvent,
})

export const showUserBackupAlert = (
  action: any
): ShowUserBackupAlertAction => ({
  type: SHOW_USER_BACKUP_ALERT,
  action,
})

export const deleteHistoryEvent = (
  historyEvent: ConnectionHistoryEvent
): DeleteHistoryEventAction => ({
  type: DELETE_HISTORY_EVENT,
  historyEvent,
})

export const historyEventOccurred = (event: HistoryEventOccurredEventType) => ({
  type: HISTORY_EVENT_OCCURRED,
  event,
})

export function* historyEventOccurredSaga(
  action: HistoryEventOccurredAction
): Generator<*, *, *> {
  const { event, type } = action
  let historyEvent: ?ConnectionHistoryEvent = null

  try {
    if (event.type === INVITATION_RECEIVED) {
      historyEvent = convertInvitationToHistoryEvent(event.data.payload)
    }

    if (event.type === NEW_CONNECTION_SUCCESS) {
      historyEvent = convertConnectionSuccessToHistoryEvent(event)
    }

    if (event.type === CLAIM_OFFER_RECEIVED) {
      historyEvent = convertClaimOfferToHistoryEvent(event)
      const existingEvent = yield select(
        getHistoryEvent,
        historyEvent.originalPayload.payloadInfo.uid,
        historyEvent.remoteDid,
        CLAIM_OFFER_RECEIVED
      )
      if (existingEvent) historyEvent = null
    }

    if (event.type === DENY_CLAIM_OFFER) {
      const claimOffer = yield select(getClaimOffer, event.uid)
      historyEvent = convertClaimOfferDenyToHistoryEvent(event, claimOffer)
      const claimOfferReceivedEvent = yield select(
        getHistoryEvent,
        event.uid,
        historyEvent.remoteDid,
        CLAIM_OFFER_RECEIVED
      )
      const claimOfferDenyFailedEvent = yield select(
        getPendingHistory,
        event.uid,
        historyEvent.remoteDid,
        DENY_CLAIM_OFFER_FAIL
      )
      const oldHistoryEvent =
        claimOfferReceivedEvent || claimOfferDenyFailedEvent
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (event.type === DENY_CLAIM_OFFER_FAIL) {
      const claimOffer = yield select(getClaimOffer, event.uid)
      historyEvent = convertClaimOfferDenyToHistoryEvent(event, claimOffer)
      const oldHistoryEvent = yield select(
        getPendingHistory,
        event.uid,
        historyEvent.remoteDid,
        DENY_CLAIM_OFFER
      )
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (event.type === DENY_CLAIM_OFFER_SUCCESS) {
      const claimOffer = yield select(getClaimOffer, event.uid)
      historyEvent = convertClaimOfferDenyToHistoryEvent(event, claimOffer)
      const oldHistoryEvent = yield select(
        getPendingHistory,
        event.uid,
        historyEvent.remoteDid,
        DENY_CLAIM_OFFER
      )
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (event.type === CLAIM_OFFER_ACCEPTED) {
      const existingCredentialOfferReceivedEvent: ConnectionHistoryEvent = yield select(
        getHistoryEvent,
        event.uid,
        event.remoteDid,
        CLAIM_OFFER_RECEIVED
      )
      // if sending credential request fails, then history store will delete credential offer accepted event, and add send_credential_request_fail event
      // Now, if user re-try to send credential request, then CLAIM_OFFER_ACCEPTED event will be raised again. But this time, history store won't have any CLAIM_OFFER_RECEIVED event, because it was deleted when user accepted credential offer first time
      // We need to check if history store already had SEND_CLAIM_REQUEST_FAIL or PAID_CREDENTIAL_REQUEST_FAIL
      const existingCredRequestFailEvent: ConnectionHistoryEvent = yield select(
        getPendingHistory,
        event.uid,
        event.remoteDid,
        SEND_CLAIM_REQUEST_FAIL
      )
      const existingPaidCredRequestFailEvent: ConnectionHistoryEvent = yield select(
        getPendingHistory,
        event.uid,
        event.remoteDid,
        PAID_CREDENTIAL_REQUEST_FAIL
      )
      const existingEvent =
        existingCredentialOfferReceivedEvent ||
        existingCredRequestFailEvent ||
        existingPaidCredRequestFailEvent
      const credentialOfferAcceptedEvent = convertClaimOfferAcceptedToHistoryEvent(
        event,
        existingEvent
      )
      if (existingEvent) {
        yield put(deleteHistoryEvent(existingEvent))
      }
      historyEvent = credentialOfferAcceptedEvent
    }

    if (
      event.type === SEND_CLAIM_REQUEST_FAIL ||
      event.type === PAID_CREDENTIAL_REQUEST_FAIL
    ) {
      const existingCredentialOfferAcceptedEvent = yield select(
        getPendingHistory,
        event.uid,
        event.remoteDid,
        CLAIM_OFFER_ACCEPTED
      )
      const credentialRequestFailEvent = convertCredentialRequestFailToHistoryEvent(
        event,
        existingCredentialOfferAcceptedEvent
      )
      if (existingCredentialOfferAcceptedEvent) {
        yield put(deleteHistoryEvent(existingCredentialOfferAcceptedEvent))
      }
      historyEvent = credentialRequestFailEvent
    }

    if (event.type === SEND_CLAIM_REQUEST_SUCCESS) {
      historyEvent = convertSendClaimRequestSuccessToHistoryEvent(event)
      const claimOfferAcceptedEvent = yield select(
        getPendingHistory,
        historyEvent.originalPayload.uid,
        historyEvent.remoteDid,
        CLAIM_OFFER_ACCEPTED
      )

      const existingEvent = yield select(
        getPendingHistory,
        historyEvent.originalPayload.uid,
        historyEvent.remoteDid,
        SEND_CLAIM_REQUEST_SUCCESS
      )
      if (existingEvent) historyEvent = null
      if (claimOfferAcceptedEvent) {
        yield put(deleteHistoryEvent(claimOfferAcceptedEvent))
      }
    }

    if (event.type === CLAIM_STORAGE_SUCCESS) {
      const claim: ClaimOfferPayload = yield select(
        getClaimOffer,
        event.messageId
      )
      historyEvent = convertClaimStorageSuccessToHistoryEvent(event, claim)
      const existingEvent = yield select(
        getClaimReceivedHistory,
        historyEvent.originalPayload.messageId,
        historyEvent.remoteDid,
        CLAIM_STORAGE_SUCCESS
      )
      if (existingEvent) historyEvent = null
      const pendingHistory = yield select(getPendingHistoryEvent, claim)

      if (pendingHistory) yield put(deleteHistoryEvent(pendingHistory))
    }

    if (event.type === PROOF_REQUEST_RECEIVED) {
      historyEvent = convertProofRequestToHistoryEvent(event)
      const existingEvent = yield select(
        getHistoryEvent,
        historyEvent.originalPayload.payloadInfo.uid,
        historyEvent.remoteDid,
        PROOF_REQUEST_RECEIVED
      )
      if (existingEvent) historyEvent = null
    }

    if (event.type === UPDATE_ATTRIBUTE_CLAIM) {
      // get proof request received event
      const storedProofReceivedEvent = yield select(
        getHistoryEvent,
        event.uid,
        event.remoteDid,
        PROOF_REQUEST_RECEIVED
      )
      const storedErrorSendProofEvent = yield select(
        getPendingHistory,
        event.uid,
        event.remoteDid,
        ERROR_SEND_PROOF
      )
      const selfAttestedAttributes: SelfAttestedAttributes = yield select(
        (store: Store, uid: string) =>
          store.proof[uid].proofData
            ? store.proof[uid].proofData.selfAttestedAttributes
            : {},
        event.uid
      )
      const existingEvent =
        storedProofReceivedEvent || storedErrorSendProofEvent
      const updateAttributeClaimEvent = convertUpdateAttributeToHistoryEvent(
        event,
        existingEvent,
        selfAttestedAttributes
      )
      if (existingEvent) {
        yield put(deleteHistoryEvent(existingEvent))
      }
      historyEvent = updateAttributeClaimEvent
    }

    if (event.type === ERROR_SEND_PROOF) {
      const storedUpdateAttributeEvent = yield select(
        getPendingHistory,
        event.uid,
        event.remoteDid,
        UPDATE_ATTRIBUTE_CLAIM
      )
      const errorSendProofEvent = convertErrorSendProofToHistoryEvent(
        event,
        storedUpdateAttributeEvent
      )
      if (storedUpdateAttributeEvent) {
        yield put(deleteHistoryEvent(storedUpdateAttributeEvent))
      }
      historyEvent = errorSendProofEvent
    }

    if (event.type === SEND_PROOF_SUCCESS) {
      const proofRequest: ProofRequestPayload = yield select(
        getProofRequest,
        event.uid
      )
      const proof: Proof = yield select(getProof, event.uid)
      historyEvent = convertProofSendToHistoryEvent(event, proofRequest, proof)
      const oldHistoryEvent = yield select(
        getPendingHistory,
        historyEvent.originalPayload.uid,
        historyEvent.remoteDid,
        UPDATE_ATTRIBUTE_CLAIM
      )
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (event.type === DENY_PROOF_REQUEST) {
      const proofRequest: ProofRequestPayload = yield select(
        getProofRequest,
        event.uid
      )
      historyEvent = convertProofDenyToHistoryEvent(event, proofRequest)
      const proofRequestReceivedEvent = yield select(
        getHistoryEvent,
        event.uid,
        historyEvent.remoteDid,
        PROOF_REQUEST_RECEIVED
      )
      const proofDenyFailedEvent = yield select(
        getPendingHistory,
        event.uid,
        historyEvent.remoteDid,
        DENY_PROOF_REQUEST_FAIL
      )
      const oldHistoryEvent = proofRequestReceivedEvent || proofDenyFailedEvent
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (event.type === DENY_PROOF_REQUEST_FAIL) {
      const proofRequest: ProofRequestPayload = yield select(
        getProofRequest,
        event.uid
      )
      historyEvent = convertProofDenyToHistoryEvent(event, proofRequest)
      const oldHistoryEvent = yield select(
        getPendingHistory,
        event.uid,
        historyEvent.remoteDid,
        DENY_PROOF_REQUEST
      )
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (event.type === DENY_PROOF_REQUEST_SUCCESS) {
      const proofRequest: ProofRequestPayload = yield select(
        getProofRequest,
        event.uid
      )
      historyEvent = convertProofDenyToHistoryEvent(event, proofRequest)
      const oldHistoryEvent = yield select(
        getPendingHistory,
        event.uid,
        historyEvent.remoteDid,
        DENY_PROOF_REQUEST
      )
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (event.type === QUESTION_RECEIVED) {
      historyEvent = convertQuestionReceivedToHistoryEvent(event)
    }

    if (event.type === UPDATE_QUESTION_ANSWER) {
      const questionPayload: QuestionPayload = yield select(
        selectQuestion,
        event.uid
      )
      historyEvent = convertQuestionAnswerToHistoryEvent(event, questionPayload)
      const oldHistoryEvent = yield select(
        getHistoryEvent,
        event.uid,
        historyEvent.remoteDid,
        MESSAGE_TYPE.QUESTION
      )
      if (oldHistoryEvent) yield put(deleteHistoryEvent(oldHistoryEvent))
    }

    if (historyEvent) {
      yield put(recordHistoryEvent(historyEvent))
    }
  } catch (e) {
    captureError(e)
    yield put(
      loadHistoryFail({
        ...ERROR_HISTORY_EVENT_OCCURRED,
        message: `${ERROR_HISTORY_EVENT_OCCURRED.message} ${e.message}`,
      })
    )
  }
}

export function* watchRecordHistoryEvent(): any {
  yield takeEvery([RECORD_HISTORY_EVENT, DELETE_HISTORY_EVENT], persistHistory)
}

export function* watchNewConnectionSeen(): any {
  yield takeEvery(NEW_CONNECTION_SEEN, persistHistory)
}

export function* watchConnectionHistoryBackedUp(): any {
  yield takeEvery(CONNECTION_HISTORY_BACKED_UP, persistHistory)
}

export function* persistHistory(action: RecordHistoryEventAction): any {
  // if we get action to record history event
  // that means our history store is updated with data
  // we can now store history data to secure storage

  const historyData: ConnectionHistoryData | null = yield select(getHistory)
  if (historyData) {
    try {
      yield call(
        secureSet,
        HISTORY_EVENT_STORAGE_KEY,
        JSON.stringify(historyData)
      )
    } catch (e) {
      // Need to figure out what happens if storage fails
      captureError(e)
      customLogger.error(`persistHistory: ${e}`)
    }
  }
}

export function* watchHistoryEventOccurred(): any {
  yield takeEvery(HISTORY_EVENT_OCCURRED, historyEventOccurredSaga)
}

export function* watchConnectionHistory(): any {
  yield all([
    watchHistoryEventOccurred(),
    watchRecordHistoryEvent(),
    watchNewConnectionSeen(),
    watchConnectionHistoryBackedUp(),
  ])
}

export default function connectionHistoryReducer(
  state: ConnectionHistoryStore = initialState,
  action: ConnectionHistoryAction
) {
  switch (action.type) {
    case LOAD_HISTORY:
      return {
        ...state,
        isLoading: true,
      }

    case LOAD_HISTORY_SUCCESS:
      return {
        ...state,
        data: {
          ...merge(state.data, action.data),
        },
        isLoading: false,
      }

    case LOAD_HISTORY_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      }

    case RECORD_HISTORY_EVENT: {
      const { remoteDid } = action.historyEvent
      return {
        ...state,
        data: {
          ...(state.data ? state.data : {}),
          connections: {
            ...(state.data && state.data.connections
              ? state.data.connections
              : {}),
            [remoteDid]: {
              data: [
                ...(state.data &&
                  state.data.connections &&
                  state.data.connections[remoteDid]
                  ? state.data.connections[remoteDid].data
                  : []),
                action.historyEvent,
              ],
              newBadge: true,
            },
          },
          connectionsUpdated: true,
        },
      }
    }

    case DELETE_HISTORY_EVENT: {
      const { remoteDid } = action.historyEvent
      const filteredDataArr =
        state.data &&
        state.data.connections &&
        state.data.connections[remoteDid] &&
        state.data.connections[remoteDid].data
          ? state.data.connections[remoteDid].data.filter((item) => {
              // $FlowFixMe
              return item !== action.historyEvent
            })
          : []
      return {
        ...state,
        data: {
          ...(state.data ? state.data : {}),
          connections: {
            ...(state.data && state.data.connections
              ? state.data.connections
              : {}),
            [remoteDid]: {
              data: filteredDataArr,
              newBadge: false,
            },
          },
          connectionsUpdated: true,
        },
      }
    }

    case SHOW_USER_BACKUP_ALERT: {
      return {
        ...state,
        data: {
          ...(state.data ? state.data : {}),
          connectionsUpdated: true,
        },
      }
    }

    case NEW_CONNECTION_SEEN:
      return {
        ...state,
        data: {
          ...(state.data ? state.data : {}),
          connections: {
            ...(state.data && state.data.connections
              ? state.data.connections
              : {}),
            [action.senderDid]: {
              data: [
                ...(state.data &&
                  state.data.connections &&
                  state.data.connections[action.senderDid]
                  ? state.data.connections[action.senderDid].data
                  : []),
              ],
              newBadge: false,
            },
          },
        },
      }

    case CONNECTION_HISTORY_BACKED_UP:
      return {
        ...state,
        data: {
          ...(state.data ? state.data : {}),
          connectionsUpdated: false,
        },
      }

    case RESET:
      return initialState

    default:
      return state
  }
}
