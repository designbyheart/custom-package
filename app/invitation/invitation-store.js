// @flow
import { put, takeLatest, call, all, select, fork } from 'redux-saga/effects'
import {
  INVITATION_RECEIVED,
  INVITATION_RESPONSE_SEND,
  INVITATION_RESPONSE_SUCCESS,
  INVITATION_RESPONSE_FAIL,
  INVITATION_REJECTED,
  ERROR_INVITATION_CONNECT,
  ERROR_INVITATION_SERIALIZE_UPDATE,
} from './type-invitation'
import { ResponseType } from '../components/request/type-request'
import { ERROR_ALREADY_EXIST } from '../api/api-constants'
import {
  getInvitationPayload,
  isDuplicateConnection,
} from '../store/store-selector'
import {
  saveNewConnection,
  persistConnections,
  updateSerializedConnectionFail,
  updateConnectionSerializedState,
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
} from '../bridge/react-native-cxs/RNCxs'
import type {
  InvitationResponseSendData,
  InvitationResponseSendAction,
  InvitationPayload,
  InvitationStore,
  InvitationAction,
  InvitationReceivedActionData,
} from './type-invitation'
import type { CustomError } from '../common/type-common'
import { captureError } from '../services/error/error-handler'
import { RESET } from '../common/type-common'
import { ensureVcxInitSuccess } from '../store/route-store'
import type { MyPairwiseInfo } from '../store/type-connection-store'
import { flattenAsync } from '../common/flatten-async'
import {
  connectionFail,
  ERROR_CONNECTION,
} from '../store/type-connection-store'

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
    // check if invitation is aries protocol invitation
    const isAriesInvite = Boolean(payload.original)
    const isOutOfBandInvite = Boolean(payload.type == 'ARIES_OUT_OF_BAND')
    const createConnectionApi = isAriesInvite
      ? isOutOfBandInvite
        ? createConnectionWithAriesOutOfBandInvite
        : createConnectionWithAriesInvite
      : createConnectionWithInvite

    const connectionHandle: number = yield call(createConnectionApi, payload)
    const pairwiseInfo: MyPairwiseInfo = yield call(
      acceptInvitationVcx,
      connectionHandle
    )

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
        isCompleted: !isAriesInvite,
        ...payload,
      },
    }
    yield put(saveNewConnection(connection))
  } catch (e) {
    captureError(e)
    yield put(invitationFail(ERROR_INVITATION_CONNECT(e.message), senderDID))
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
}

function* watchSendInvitationResponse(): any {
  yield takeLatest(INVITATION_RESPONSE_SEND, sendResponse)
}

export function* watchInvitation(): any {
  yield all([watchSendInvitationResponse()])
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
