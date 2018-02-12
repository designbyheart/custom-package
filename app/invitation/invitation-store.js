// @flow
import { AsyncStorage } from 'react-native'
import { put, takeLatest, call, all, select } from 'redux-saga/effects'
import {
  INVITATION_RECEIVED,
  INVITATION_RESPONSE_SEND,
  INVITATION_RESPONSE_SUCCESS,
  INVITATION_RESPONSE_FAIL,
  INVITATION_REJECTED,
} from './type-invitation'
import { ResponseType } from '../components/request/type-request'
import {
  ERROR_ALREADY_EXIST,
  ERROR_INVITATION_RESPONSE_PARSE_CODE,
  ERROR_INVITATION_RESPONSE_PARSE,
} from '../api/api-constants'
import {
  getAgencyUrl,
  getAgencyDID,
  getAgencyVerificationKey,
  getPushToken,
  getInvitationPayload,
  isDuplicateConnection,
  getUserOneTimeInfo,
  getPoolConfig,
} from '../store/store-selector'
import { saveNewConnection } from '../store/connections-store'
import {
  addConnection,
  connectToAgency,
  registerWithAgency,
  createOneTimeAgent,
  createPairwiseAgent,
  acceptInvitation,
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
import { IS_CONSUMER_AGENT_ALREADY_CREATED } from '../common'
import type {
  ConnectAgencyResponse,
  RegisterAgencyResponse,
  CreateOneTimeAgentResponse,
  CreatePairwiseAgentResponse,
  AcceptInvitationResponse,
} from '../bridge/react-native-cxs/type-cxs'
import type { UserOneTimeInfo } from '../store/user/type-user-store'
import { connectRegisterCreateAgentDone } from '../store/user/user-store'

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

function* createConsumerAgencyAgent(
  senderDID: string,
  identifier: string,
  verificationKey: string,
  payload: InvitationPayload
): Generator<*, *, *> {
  // get data needed for agent api call from store using selectors
  // this will keep our components and screen to not pass data
  // and will keep our actions lean
  const agencyUrl: string = yield select(getAgencyUrl)
  const pushToken: string = yield select(getPushToken)
  const agencyDid: string = yield select(getAgencyDID)
  const agencyVerificationKey: string = yield select(getAgencyVerificationKey)
  const poolConfig: string = yield select(getPoolConfig)

  const metadata = {
    ...payload,
  }

  try {
    const url = `${agencyUrl}/agency/msg`
    const connectResponse: ConnectAgencyResponse = yield call(connectToAgency, {
      url,
      myDid: identifier,
      agencyDid,
      myVerKey: verificationKey,
      agencyVerKey: agencyVerificationKey,
      poolConfig,
    })

    const oneTimeAgencyDid = connectResponse.withPairwiseDID
    const oneTimeAgencyVerificationKey = connectResponse.withPairwiseDIDVerKey
    const myOneTimeDid = identifier
    const myOneTimeVerificationKey = verificationKey

    const registerResponse: RegisterAgencyResponse = yield call(
      registerWithAgency,
      {
        url,
        oneTimeAgencyVerKey: oneTimeAgencyVerificationKey,
        oneTimeAgencyDid: oneTimeAgencyDid,
        myOneTimeVerKey: myOneTimeVerificationKey,
        agencyVerKey: agencyVerificationKey,
        poolConfig,
      }
    )

    const createAgentResponse: CreateOneTimeAgentResponse = yield call(
      createOneTimeAgent,
      {
        url,
        oneTimeAgencyVerKey: oneTimeAgencyVerificationKey,
        oneTimeAgencyDid: oneTimeAgencyDid,
        myOneTimeVerKey: myOneTimeVerificationKey,
        agencyVerKey: agencyVerificationKey,
        poolConfig,
      }
    )

    const myOneTimeAgentDid = createAgentResponse.withPairwiseDID
    const myOneTimeAgentVerificationKey =
      createAgentResponse.withPairwiseDIDVerKey

    const userOneTimeInfo = {
      oneTimeAgencyDid,
      oneTimeAgencyVerificationKey,
      myOneTimeDid,
      myOneTimeVerificationKey,
      myOneTimeAgentDid,
      myOneTimeAgentVerificationKey,
    }

    yield put(connectRegisterCreateAgentDone(userOneTimeInfo))

    // now save the key in user's default storage in phone
    try {
      yield call(
        AsyncStorage.setItem,
        IS_CONSUMER_AGENT_ALREADY_CREATED,
        'true'
      )
    } catch (e) {
      // somehow the storage failed, so we need to find someway to store
      // maybe we fallback to file based storage

      // Capture AsyncStorage failed
      captureError(e)
    }
  } catch (e) {
    console.log(e)
    let error: CustomError = {
      code: ERROR_INVITATION_RESPONSE_PARSE_CODE,
      message: ERROR_INVITATION_RESPONSE_PARSE,
    }
    try {
      error = JSON.parse(e.message)
    } catch (_) {}
    yield put(invitationFail(error, senderDID))
  }
}

export function* sendResponse(
  action: InvitationResponseSendAction
): Generator<*, *, *> {
  const { senderDID } = action.data
  // get data needed for agent api call from store using selectors
  // this will keep our components and screen to not pass data
  // and will keep our actions lean
  const agencyUrl: string = yield select(getAgencyUrl)
  const pushToken: string = yield select(getPushToken)
  const agencyDid: string = yield select(getAgencyDID)
  const agencyVerificationKey: string = yield select(getAgencyVerificationKey)
  const payload: InvitationPayload = yield select(
    getInvitationPayload,
    senderDID
  )
  const poolConfig: string = yield select(getPoolConfig)
  const metadata = {
    ...payload,
  }

  const { identifier, verificationKey } = yield call(
    addConnection,
    agencyDid,
    agencyVerificationKey,
    metadata,
    poolConfig
  )

  const alreadyExist: boolean = yield select(isDuplicateConnection, senderDID)
  if (alreadyExist) {
    yield put(invitationFail(ERROR_ALREADY_EXIST, senderDID))
  } else {
    const metadata = {
      ...payload,
    }
    const isConsumerAgentCreated = yield call(
      AsyncStorage.getItem,
      IS_CONSUMER_AGENT_ALREADY_CREATED
    )
    if (isConsumerAgentCreated !== 'true') {
      yield* createConsumerAgencyAgent(
        senderDID,
        identifier,
        verificationKey,
        payload
      )
    }

    try {
      const pairwiseConnection = yield call(
        addConnection,
        senderDID,
        payload.senderVerificationKey,
        metadata,
        poolConfig
      )

      const url = `${agencyUrl}/agency/msg`
      const userOneTimeInfo: UserOneTimeInfo = yield select(getUserOneTimeInfo)

      const createPairwiseKeyResponse: CreatePairwiseAgentResponse = yield call(
        createPairwiseAgent,
        {
          url,
          myPairwiseDid: pairwiseConnection.identifier,
          myPairwiseVerKey: pairwiseConnection.verificationKey,
          oneTimeAgentVerKey: userOneTimeInfo.myOneTimeAgentVerificationKey,
          oneTimeAgentDid: userOneTimeInfo.myOneTimeAgentDid,
          myOneTimeVerKey: userOneTimeInfo.myOneTimeVerificationKey,
          agencyVerKey: agencyVerificationKey,
          poolConfig,
        }
      )

      // TODO:KS Check errors from backend in api utils
      yield call(acceptInvitation, {
        url,
        requestId: payload.requestId,
        myPairwiseDid: pairwiseConnection.identifier,
        myPairwiseVerKey: pairwiseConnection.verificationKey,
        invitation: payload,
        myPairwiseAgentDid: createPairwiseKeyResponse.withPairwiseDID,
        myPairwiseAgentVerKey: createPairwiseKeyResponse.withPairwiseDIDVerKey,
        myOneTimeAgentDid: userOneTimeInfo.myOneTimeAgentDid,
        myOneTimeAgentVerKey: userOneTimeInfo.myOneTimeAgentVerificationKey,
        myOneTimeDid: userOneTimeInfo.myOneTimeDid,
        myOneTimeVerKey: userOneTimeInfo.myOneTimeVerificationKey,
        myAgencyVerKey: agencyVerificationKey,
        poolConfig,
      })
      yield put(invitationSuccess(senderDID))

      if (action.data.response === ResponseType.accepted) {
        const connection = {
          newConnection: {
            identifier: pairwiseConnection.identifier,
            logoUrl: payload.senderLogoUrl,
            myPairwiseDid: pairwiseConnection.identifier,
            myPairwiseVerKey: pairwiseConnection.verificationKey,
            myPairwiseAgentDid: createPairwiseKeyResponse.withPairwiseDID,
            myPairwiseAgentVerKey:
              createPairwiseKeyResponse.withPairwiseDIDVerKey,
            myPairwisePeerVerKey: payload.senderDetail.verKey,
            ...payload,
          },
        }
        yield put(saveNewConnection(connection))
      }
    } catch (e) {
      let error: CustomError = {
        code: ERROR_INVITATION_RESPONSE_PARSE_CODE,
        message: ERROR_INVITATION_RESPONSE_PARSE,
      }
      try {
        error = JSON.parse(e.message)
      } catch (_) {}
      yield put(invitationFail(error, senderDID))
    }
  }
}

function* watchSendInvitationResponse(): any {
  yield takeLatest(INVITATION_RESPONSE_SEND, sendResponse)
}

export function* watchInvitation(): Generator<*, *, *> {
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

    default:
      return state
  }
}
