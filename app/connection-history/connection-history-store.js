/* eslint-disable */
// Disabling linting for this because we need to fix type issues with this file
// whenever we get some time for code refactoring, then we need to fix it
// we were not running flow on this file even before because we had added $FlowFixMe
// So, get some time from product and fix Flow errors and enable Flow for this file
// $FlowFixMe
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
  ClaimOfferReceivedAction,
} from '../claim-offer/type-claim-offer'
import type { ClaimStorageSuccessAction } from '../claim/type-claim'
import type { Proof } from '../proof/type-proof'
import { SEND_CLAIM_REQUEST_SUCCESS } from '../claim-offer/type-claim-offer'
import type {
  ProofRequestReceivedAction,
  SendProofSuccessAction,
  ProofRequestPayload,
} from '../proof-request/type-proof-request'
import type {
  QuestionReceivedAction,
  QuestionPayload,
  UpdateQuestionAnswerAction,
} from '../question/type-question'
import {
  PROOF_REQUEST_RECEIVED,
  SEND_PROOF_SUCCESS,
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

export const loadHistorySuccess = (data: ConnectionHistoryData) => ({
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
      oldHistory = JSON.parse(historyEvents)
      oldHistoryKeys = Object.keys(oldHistory)
      newHistory = {}

      if (!oldHistory.connections) {
        for (let i = 0; i < oldHistoryKeys.length; i++) {
          newHistory['connections'][oldHistoryKeys[i]] = {
            data: oldHistory[oldHistoryKeys[i]],
            newBadge: false,
          }
        }
        newHistory['connectionsUpdated'] = false
        yield put(loadHistorySuccess(newHistory))
      } else {
        yield put(loadHistorySuccess(oldHistory))
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

// TODO:KS Add claim accepted
//export function convertClaimAcceptedToHistoryEvent(): ConnectionHistoryEvent {}

export function convertClaimStorageSuccessToHistoryEvent(
  action: ClaimStorageSuccessAction,
  claim: ClaimOfferPayload
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[CLAIM_STORAGE_SUCCESS],
    data: claim.data && claim.data.revealedAttributes,
    id: uuid(),
    name: claim.data && claim.data.name,
    status: HISTORY_EVENT_STATUS[CLAIM_STORAGE_SUCCESS],
    timestamp: moment().format(),
    type: HISTORY_EVENT_TYPE.CLAIM,
    remoteDid: claim.remotePairwiseDID,
    originalPayload: action,
  }
}

// TODO:KS Add proof request received
export function convertProofRequestToHistoryEvent(
  action: ProofRequestReceivedAction
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[PROOF_REQUEST_RECEIVED],
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

// TODO:SC change the action type from any to appropriate type
export function convertClaimOfferToHistoryEvent(
  action: ClaimOfferReceivedAction
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[CLAIM_OFFER_RECEIVED],
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

function mapSentAttributes(
  revealedAttributes: Array<GenericStringObject>,
  selfAttestedAttributes: Array<GenericStringObject>,
  requestedAttributes: Array<Array<Attribute>>
): Array<Attribute> {
  let sentAttributes = []
  if (revealedAttributes) {
    const revealedAttributeKeys = Object.keys(revealedAttributes)
    Object.values(revealedAttributes).forEach((revealedAttribute, index) => {
      sentAttributes.push({
        label: requestedAttributes[revealedAttributeKeys[index]].name,
        key: revealedAttributeKeys[index],
        data: revealedAttribute[1],
        claimUuid: revealedAttribute[0],
      })
    })
  }

  if (selfAttestedAttributes) {
    const selfAttestedAttributesKeys = Object.keys(selfAttestedAttributes)
    Object.values(selfAttestedAttributes).forEach(
      (selfAttestedAttribute, index) => {
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
  { requested_proof: { revealed_attrs, self_attested_attrs } }: Proof
): ConnectionHistoryEvent {
  return {
    action: HISTORY_EVENT_STATUS[SEND_PROOF_SUCCESS],
    data: mapSentAttributes(
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

    if (event.type === SEND_CLAIM_REQUEST_SUCCESS) {
      historyEvent = convertSendClaimRequestSuccessToHistoryEvent(event)
      const claimOfferReceivedEvent = yield select(
        getHistoryEvent,
        historyEvent.originalPayload.uid,
        historyEvent.remoteDid,
        CLAIM_OFFER_RECEIVED
      )

      const existingEvent = yield select(
        getPendingHistory,
        historyEvent.originalPayload.uid,
        historyEvent.remoteDid,
        SEND_CLAIM_REQUEST_SUCCESS
      )
      if (existingEvent) historyEvent = null
      if (claimOfferReceivedEvent)
        yield put(deleteHistoryEvent(claimOfferReceivedEvent))
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

    if (event.type === SEND_PROOF_SUCCESS) {
      const proofRequest: ProofRequestPayload = yield select(
        getProofRequest,
        event.uid
      )
      const proof: ProofRequestPayload = yield select(getProof, event.uid)
      historyEvent = convertProofSendToHistoryEvent(event, proofRequest, proof)
      const oldHistoryEvent = yield select(
        getHistoryEvent,
        historyEvent.originalPayload.uid,
        historyEvent.remoteDid,
        PROOF_REQUEST_RECEIVED
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
  yield takeEvery(RECORD_HISTORY_EVENT, persistHistory)
}

export function* watchNewConnectionSeen(): any {
  yield takeEvery(NEW_CONNECTION_SEEN, persistHistory)
}

export function* watchConnectionHistoryBackedUp(): any {
  yield takeEvery(CONNECTION_HISTORY_BACKED_UP, persistHistory)
}

export function* persistHistory(action): any {
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
  action: HistoryEventOccurredEventType
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
          ? state.data.connections[remoteDid].data.filter(item => {
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
