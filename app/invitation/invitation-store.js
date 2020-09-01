// @flow
import { put, takeEvery, takeLatest, call, all, select } from 'redux-saga/effects'
import {
  CONNECTION_INVITE_TYPES,
  INVITATION_RECEIVED,
  INVITATION_RESPONSE_SEND,
  INVITATION_RESPONSE_SUCCESS,
  INVITATION_RESPONSE_FAIL,
  INVITATION_REJECTED,
  ERROR_INVITATION_CONNECT,
  ERROR_INVITATION_SERIALIZE_UPDATE,
  OUT_OF_BAND_INVITATION_ACCEPTED,
  ERROR_INVITATION_ALREADY_ACCEPTED,
} from './type-invitation'
import { ResponseType } from '../components/request/type-request'
import { ERROR_ALREADY_EXIST } from '../api/api-constants'
import {
  getInvitationPayload,
  isDuplicateConnection,
} from '../store/store-selector'
import {
  connectionDeleteAttachedRequest,
  saveNewConnection,
  persistConnections,
  updateSerializedConnectionFail,
  updateConnectionSerializedState,
  saveNewOneTimeConnection,
} from '../store/connections-store'
import {
  createConnectionWithInvite,
  acceptInvitationVcx,
  serializeConnection,
  createConnectionWithAriesInvite,
  createConnectionWithAriesOutOfBandInvite,
  connectionUpdateState,
  getHandleBySerializedConnection,
  connectionGetState,
  createCredentialWithAriesOfferObject,
} from '../bridge/react-native-cxs/RNCxs'
import type {
  AriesOutOfBandInvite,
  InvitationResponseSendData,
  InvitationResponseSendAction,
  InvitationPayload,
  InvitationStore,
  InvitationAction,
  InvitationReceivedActionData,
  OutOfBandInvitationAcceptedAction,
} from './type-invitation'
import type { CustomError, GenericObject } from '../common/type-common'
import { captureError } from '../services/error/error-handler'
import { RESET } from '../common/type-common'
import { ensureVcxInitSuccess } from '../store/route-store'
import type { MyPairwiseInfo } from '../store/type-connection-store'
import { flattenAsync } from '../common/flatten-async'
import {
  connectionFail,
  ERROR_CONNECTION,
} from '../store/type-connection-store'
import { flatJsonParse } from '../common/flat-json-parse'
import { toUtf8FromBase64 } from '../bridge/react-native-cxs/RNCxs'
import { getConnectionByUserDid } from '../store/store-selector'
import type { Connection } from '../store/type-connection-store'
import { ID, TYPE } from '../common/type-common'
import {
  sendConnectionReuse,
  connectionAttachRequest,
} from '../store/connections-store'
import {
  getConnection,
  getConnectionExists,
} from '../store/store-selector'
import {
  acceptClaimOffer,
  saveSerializedClaimOffer,
} from '../claim-offer/claim-offer-store'
import { CONNECTION_ALREADY_EXISTS } from '../bridge/react-native-cxs/error-cxs'
import { outOfBandConnectionForPresentationEstablished, } from '../proof-request/proof-request-store'

export const invitationInitialState = {}

export const invitationReceived = (data: InvitationReceivedActionData) => ({
  type: INVITATION_RECEIVED,
  data,
})

export const sendInvitationResponse = (data: InvitationResponseSendData) => ({
  type: INVITATION_RESPONSE_SEND,
  data,
})

export const invitationSuccess = (senderDID: string) => ({
  type: INVITATION_RESPONSE_SUCCESS,
  senderDID,
})

export const invitationFail = (error: CustomError, senderDID: string) => ({
  type: INVITATION_RESPONSE_FAIL,
  error,
  senderDID,
})

export const invitationRejected = (senderDID: string) => ({
  type: INVITATION_REJECTED,
  senderDID,
})

export const acceptOutOfBandInvitation = (
  invitationPayload: InvitationPayload,
  attachedRequest: GenericObject
): OutOfBandInvitationAcceptedAction => ({
  type: OUT_OF_BAND_INVITATION_ACCEPTED,
  invitationPayload,
  attachedRequest,
})

export async function getAttachedRequest(
  invite: AriesOutOfBandInvite
): GenericObject {
  const requests = invite['request~attach']
  if (!requests || !requests.length) {
    return null
  }

  const req = requests[0].data
  if (!req) {
    return null
  }

  if (req.json) {
    const [error, reqData] = flatJsonParse(req.json)
    if (error || !reqData) {
      return null
    }

    return reqData
  } else if (req.base64) {
    const [decodeError, decodedRequest] = await flattenAsync(toUtf8FromBase64)(
      req.base64
    )
    if (decodeError || decodedRequest === null) {
      return null
    }

    const [error, reqData] = flatJsonParse(decodedRequest)
    if (error || !reqData) {
      return null
    }

    return reqData
  }

  return null
}

export function* processAttachedRequest(
  did: string
): Generator<*, *, *> {
  const connection = yield select(
    getConnectionByUserDid,
    did
  )
  const attachedRequest = connection.attachedRequest
  if (!attachedRequest) {
    return
  }

  yield put(connectionDeleteAttachedRequest(connection.identifier))

  yield* persistConnections()

  const uid = attachedRequest[ID]

  if (attachedRequest[TYPE].endsWith('offer-credential')) {
    const { claimHandle } = yield call(
      createCredentialWithAriesOfferObject,
      uid,
      attachedRequest
    )

    yield call(saveSerializedClaimOffer, claimHandle, connection.identifier, uid)
    yield put(acceptClaimOffer(uid, connection.senderDID))
  } else if (attachedRequest[TYPE].endsWith('request-presentation')) {
    yield put(outOfBandConnectionForPresentationEstablished(uid))
  }
}

export function* sendResponse(
  action: InvitationResponseSendAction
): Generator<*, *, *> {
  const { senderDID } = action.data

  try {
    const vcxResult = yield* ensureVcxInitSuccess()
    const alreadyExist: boolean = yield select(isDuplicateConnection, senderDID)
    if (alreadyExist) {
      yield put(invitationFail(ERROR_ALREADY_EXIST, senderDID))

      return
    }
    if (vcxResult && vcxResult.fail) {
      throw new Error(vcxResult.fail.message)
    }
    const payload: InvitationPayload = yield select(
      getInvitationPayload,
      senderDID
    )

    if (payload.type === CONNECTION_INVITE_TYPES.ARIES_V1_QR) {
      yield call(
        sendResponseOnAriesConnectionInvitation,
        payload
      )
      return
    }

    if (payload.type === CONNECTION_INVITE_TYPES.ARIES_OUT_OF_BAND) {
      yield call(
        sendResponseOnAriesOutOfBandInvitation,
        payload
      )
      return
    }

    // proprietary connection
    const connectionHandle: number = yield call(createConnectionWithInvite, payload)
    let pairwiseInfo: MyPairwiseInfo = yield call(acceptInvitationVcx, connectionHandle)
    yield put(invitationSuccess(senderDID))

    // once the connection is successful, we need to save serialized connection
    // in secure storage as well, because libIndy does not handle persistence
    // once we have persisted serialized state, we can hydrate vcx
    // if we need anything from that connection
    const vcxSerializedConnection: string = yield call(
      serializeConnection,
      connectionHandle
    )

    const connection = {
      newConnection: {
        identifier: pairwiseInfo.myPairwiseDid,
        logoUrl: payload.senderLogoUrl,
        myPairwiseDid: pairwiseInfo.myPairwiseDid,
        myPairwiseVerKey: pairwiseInfo.myPairwiseVerKey,
        myPairwiseAgentDid: pairwiseInfo.myPairwiseAgentDid,
        myPairwiseAgentVerKey: pairwiseInfo.myPairwiseAgentVerKey,
        myPairwisePeerVerKey: pairwiseInfo.myPairwisePeerVerKey,
        vcxSerializedConnection,
        publicDID: payload.senderDetail.publicDID,
        isCompleted: true,
        ...payload,
      },
    }
    yield put(saveNewConnection(connection))
  } catch (e) {
    captureError(e)
    if (e.code === CONNECTION_ALREADY_EXISTS) {
      yield put(
        invitationFail(ERROR_INVITATION_ALREADY_ACCEPTED(e.message), senderDID)
      )
    } else {
      yield put(invitationFail(ERROR_INVITATION_CONNECT(e.message), senderDID))
    }
  }
}

export function* sendResponseOnAriesConnectionInvitation(
  payload: InvitationPayload,
): Generator<*, *, *> {
  try {
    const connectionHandle: number = yield call(createConnectionWithAriesInvite, payload)

    let pairwiseInfo: MyPairwiseInfo = yield call(acceptInvitationVcx, connectionHandle)
    yield put(invitationSuccess(payload.senderDID))

    // once the connection is successful, we need to save serialized connection
    // in secure storage as well, because libIndy does not handle persistence
    // once we have persisted serialized state, we can hydrate vcx
    // if we need anything from that connection
    const vcxSerializedConnection: string = yield call(
      serializeConnection,
      connectionHandle
    )

    const connection = {
      newConnection: {
        identifier: pairwiseInfo.myPairwiseDid,
        logoUrl: payload.senderLogoUrl,
        myPairwiseDid: pairwiseInfo.myPairwiseDid,
        myPairwiseVerKey: pairwiseInfo.myPairwiseVerKey,
        myPairwiseAgentDid: pairwiseInfo.myPairwiseAgentDid,
        myPairwiseAgentVerKey: pairwiseInfo.myPairwiseAgentVerKey,
        myPairwisePeerVerKey: pairwiseInfo.myPairwisePeerVerKey,
        vcxSerializedConnection,
        publicDID: payload.senderDetail.publicDID,
        isCompleted: false,
        ...payload,
      },
    }
    yield put(saveNewConnection(connection))
  } catch (e) {
    captureError(e)
    if (e.code === CONNECTION_ALREADY_EXISTS) {
      yield put(
        invitationFail(ERROR_INVITATION_ALREADY_ACCEPTED(e.message), payload.senderDID)
      )
    } else {
      yield put(invitationFail(ERROR_INVITATION_CONNECT(e.message), payload.senderDID))
    }
  }
}

export function* sendResponseOnAriesOutOfBandInvitation(
  payload: InvitationPayload,
): Generator<*, *, *> {
  try {
    const connectionHandle: number = yield call(createConnectionWithAriesOutOfBandInvite, payload)

    const [getStateError, connectionState]: [Error, number] = yield call(
      flattenAsync(connectionGetState),
      connectionHandle
    )

    if (getStateError) {
      yield put(
        connectionFail(ERROR_CONNECTION(getStateError.message), payload.senderDID)
      )
      return
    }

    const attachedRequest = yield call(
      getAttachedRequest,
      ((payload.originalObject: any): AriesOutOfBandInvite)
    )

    if (connectionState !== 4) {
      // we need to setup regular connection
      let pairwiseInfo: MyPairwiseInfo = yield call(acceptInvitationVcx, connectionHandle)

      yield put(invitationSuccess(payload.senderDID))

      //  we need to save serialized connection
      // in secure storage as well, because VCX does not handle persistence
      // once we have persisted serialized state, we can hydrate vcx
      // if we need anything from that connection
      const vcxSerializedConnection: string = yield call(
        serializeConnection,
        connectionHandle
      )

      const connection = {
        newConnection: {
          identifier: pairwiseInfo.myPairwiseDid,
          logoUrl: payload.senderLogoUrl,
          myPairwiseDid: pairwiseInfo.myPairwiseDid,
          myPairwiseVerKey: pairwiseInfo.myPairwiseVerKey,
          myPairwiseAgentDid: pairwiseInfo.myPairwiseAgentDid,
          myPairwiseAgentVerKey: pairwiseInfo.myPairwiseAgentVerKey,
          myPairwisePeerVerKey: pairwiseInfo.myPairwisePeerVerKey,
          vcxSerializedConnection,
          publicDID: payload.senderDetail.publicDID,
          isCompleted: false,
          attachedRequest,
          ...payload,
        },
      }
      yield put(saveNewConnection(connection))
    } else {
      yield put(invitationSuccess(payload.senderDID))

      // we received an invitation reflecting one-time channel
      const vcxSerializedConnection: string = yield call(
        serializeConnection,
        connectionHandle
      )

      const connection = {
        identifier: payload.senderDID,
        logoUrl: payload.senderLogoUrl,
        senderDID: payload.senderDID,
        senderEndpoint: payload.senderEndpoint,
        senderName: payload.senderName,
        vcxSerializedConnection,
        publicDID: payload.senderDetail.publicDID,
        attachedRequest,
        myPairwiseDid: '',
        myPairwiseVerKey: '',
        myPairwiseAgentDid: '',
        myPairwiseAgentVerKey: '',
        myPairwisePeerVerKey: '',
      }

      yield put(saveNewOneTimeConnection(connection))

      yield* processAttachedRequest(payload.senderDID)
    }
  } catch (e) {
    captureError(e)
    if (e.code === CONNECTION_ALREADY_EXISTS) {
      yield put(
        invitationFail(ERROR_INVITATION_ALREADY_ACCEPTED(e.message), payload.senderDID)
      )
    } else {
      yield put(invitationFail(ERROR_INVITATION_CONNECT(e.message), payload.senderDID))
    }
  }
}

export function* updateAriesConnectionState(
  identifier: string,
  vcxSerializedConnection: string,
  message: string // TODO: must be used since we replace connectionUpdateState
): Generator<*, *, *> {
  const connectionHandle = yield call(
    getHandleBySerializedConnection,
    vcxSerializedConnection
  )

  const [updateStateError]: [Error] = yield call(
    // TODO: use connectionUpdateStateWithMessage function instead
    // TODO: connectionUpdateStateWithMessage is missed in VCX Objective-C wrapper
    flattenAsync(connectionUpdateState),
    connectionHandle
  )
  if (updateStateError) {
    yield put(
      connectionFail(ERROR_CONNECTION(updateStateError.message), identifier)
    )
    return
  }

  const [getStateError, connectionState]: [Error, number] = yield call(
    flattenAsync(connectionGetState),
    connectionHandle
  )

  if (getStateError) {
    yield put(
      connectionFail(ERROR_CONNECTION(getStateError.message), identifier)
    )
    return
  }

  // we need to take serialized connection state again
  // and update serialized state on connectme side
  const [serializedStateError, updateVcxSerializedConnection]: [
    typeof Error,
    string
  ] = yield call(flattenAsync(serializeConnection), connectionHandle)

  if (serializedStateError) {
    yield put(
      updateSerializedConnectionFail({
        identifier: identifier,
        error: ERROR_INVITATION_SERIALIZE_UPDATE(
          serializedStateError.toString()
        ),
      })
    )
    return
  }

  if (connectionState === 1) {
    // if connection object moved into state = 1 it means connection failed
    // TODO: update VCX Null state to contain details about connection failure reason
    yield put(
      connectionFail(
        ERROR_CONNECTION('Connection Problem Report was received'), // TODO: use VCX state reason
        identifier
      )
    )
  }

  const isCompleted = connectionState === 4

  yield put(
    updateConnectionSerializedState({
      identifier: identifier,
      vcxSerializedConnection: updateVcxSerializedConnection,
      isCompleted: isCompleted,
    })
  )
  // once we have update our connection store
  // we need to update phone storage as well
  yield* persistConnections()

  if (isCompleted) {
    yield* processAttachedRequest(
      identifier
    )
  }
}

function* outOfBandInvitationAccepted(
  action: OutOfBandInvitationAcceptedAction
): Generator<*, *, *> {
  const { invitationPayload, attachedRequest } = action

  const connectionExists = yield select(getConnectionExists, action.invitationPayload.senderDID)
  if (!connectionExists) {
    yield put(
      invitationReceived({
        payload: invitationPayload,
      })
    )

    yield put(
      sendInvitationResponse({
        response: ResponseType.accepted,
        senderDID: invitationPayload.senderDID,
      })
    )
  } else {
    const [connection]: Connection[] = yield select(
      getConnection,
      action.invitationPayload.senderDID
    )

    yield put(connectionAttachRequest(connection.identifier, attachedRequest))

    if (!invitationPayload.originalObject){
      return
    }

    const invitation = ((invitationPayload.originalObject: any): AriesOutOfBandInvite)

    yield put(
      sendConnectionReuse(invitation, {
        senderDID: action.invitationPayload.senderDID,
      })
    )
  }
}

function* watchOutOfBandInvitationAccepted(): any {
  yield takeEvery(OUT_OF_BAND_INVITATION_ACCEPTED, outOfBandInvitationAccepted)
}

function* watchSendInvitationResponse(): any {
  yield takeLatest(INVITATION_RESPONSE_SEND, sendResponse)
}

export function* watchInvitation(): any {
  yield all([
    watchOutOfBandInvitationAccepted(),
    watchSendInvitationResponse(),
  ])
}

export default function invitationReducer(
  state: InvitationStore = invitationInitialState,
  action: InvitationAction
) {
  switch (action.type) {
    case INVITATION_RECEIVED:
      return {
        ...state,
        [action.data.payload.senderDID]: {
          ...action.data,
          status: ResponseType.none,
          isFetching: false,
          error: null,
        },
      }

    case INVITATION_RESPONSE_SEND:
      return {
        ...state,
        [action.data.senderDID]: {
          ...state[action.data.senderDID],
          isFetching: true,
          status: action.data.response,
          error: null,
        },
      }

    case INVITATION_RESPONSE_SUCCESS:
      return {
        ...state,
        [action.senderDID]: {
          ...state[action.senderDID],
          isFetching: false,
          error: null,
        },
      }

    case INVITATION_RESPONSE_FAIL:
      return {
        ...state,
        [action.senderDID]: {
          ...state[action.senderDID],
          isFetching: false,
          error: action.error,
          status: ResponseType.none,
        },
      }

    case INVITATION_REJECTED:
      return {
        ...state,
        [action.senderDID]: {
          ...state[action.senderDID],
          isFetching: false,
          error: null,
          status: ResponseType.rejected,
        },
      }

    case RESET:
      return invitationInitialState

    default:
      return state
  }
}
