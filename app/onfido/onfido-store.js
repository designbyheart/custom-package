// @flow
import {
  put,
  takeLatest,
  call,
  all,
  select,
  take,
  fork,
  race,
} from 'redux-saga/effects'
import { NativeModules } from 'react-native'
import firebase from 'react-native-firebase'

import type {
  OnfidoStore,
  OnfidoStoreAction,
  LaunchOnfidoSDKAction,
  OnfidoProcessStatus,
  OnfidoConnectionStatus,
  UpdateOnfidoProcessStatusAction,
} from './type-onfido'
import type { CustomError, GenericObject } from '../common/type-common'
import type { Store } from '../store/type-store'
import type { QrCode } from '../components/qr-scanner/type-qr-scanner'

import {
  LAUNCH_ONFIDO_SDK,
  UPDATE_ONFIDO_PROCESS_STATUS,
  onfidoProcessStatus,
  ERROR_ONFIDO_APPLICANT_ID_API,
  HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS,
  UPDATE_ONFIDO_APPLICANT_ID,
  ERROR_MESSAGE_NO_APPLICANT_ID,
  ERROR_ONFIDO_SDK,
  ERROR_CONNECTION_DETAIL_INVALID,
  ONFIDO_CONNECTION_ESTABLISHED,
  HYDRATE_ONFIDO_DID_SUCCESS,
  REMOVE_ONFIDO_DID,
  GET_APPLICANT_ID,
  onfidoConnectionStatus,
  UPDATE_ONFIDO_CONNECTION_STATUS,
  RESET_ONFIDO_STATUES,
} from './type-onfido'
import {
  getApplicantId as getApplicantIdApi,
  getCheckUuid,
  getOnfidoInvitation,
} from './onfido-api'
import { captureError } from '../services/error/error-handler'
import { secureDelete, getHydrationItem, secureSet } from '../services/storage'
import { isValidQrCode } from '../components/qr-scanner/qr-scanner-validator'
import {
  invitationReceived,
  sendInvitationResponse,
} from '../invitation/invitation-store'
import { convertQrCodeToInvitation } from '../qr-code/qr-code'
import { ResponseType } from '../components/request/type-request'
import { QR_CODE_SENDER_DETAIL, QR_CODE_SENDER_DID } from '../api/api-constants'
import { NEW_CONNECTION_SUCCESS } from '../store/connections-store'
import { ensureAppHydrated } from '../store/config-store'
import { getUserPairwiseDid } from '../store/store-selector'
import { INVITATION_RESPONSE_FAIL } from '../invitation/type-invitation'
import { pushNotificationPermissionAction } from '../push-notification/push-notification-store'

const initialState = {
  status: onfidoProcessStatus.IDLE,
  applicantId: null,
  error: null,
  onfidoDid: null,
  onfidoConnectionStatus: onfidoConnectionStatus.IDLE,
}

export const updateOnfidoStatus = (
  status: OnfidoProcessStatus,
  error: ?CustomError
) => ({
  type: UPDATE_ONFIDO_PROCESS_STATUS,
  status,
  error,
})

export const updateOnfidoConnectionStatus = (
  status: OnfidoConnectionStatus,
  error: ?CustomError
) => ({
  type: UPDATE_ONFIDO_CONNECTION_STATUS,
  status,
  error,
})

export const launchOnfidoSDK = () => ({
  type: LAUNCH_ONFIDO_SDK,
})

export const onfidoConnectionEstablished = (onfidoDid: string) => ({
  type: ONFIDO_CONNECTION_ESTABLISHED,
  onfidoDid,
})

const ONFIDO_APPLICANT_ID_STORAGE_KEY = 'ONFIDO_APPLICANT_ID_STORAGE_KEY'
export function* removePersistedOnfidoApplicantIdSaga(): Generator<*, *, *> {
  try {
    yield put({ type: 'REMOVE_ONFIDO_APPLICANT_ID_START' })
    yield call(secureDelete, ONFIDO_APPLICANT_ID_STORAGE_KEY)
    yield put({ type: 'REMOVE_ONFIDO_APPLICANT_ID_SUCCESS' })
  } catch (e) {
    captureError(e)
    yield put({
      type: 'REMOVE_ONFIDO_APPLICANT_ID_FAIL',
    })
  }
}

export function* hydrateOnfidoApplicantIdSaga(): any {
  try {
    yield put({ type: 'HYDRATE_ONFIDO_APPLICANT_ID_START' })
    const applicantId: string = yield call(
      getHydrationItem,
      ONFIDO_APPLICANT_ID_STORAGE_KEY
    )
    if (applicantId) {
      yield put(hydrateApplicantId(applicantId))
      return applicantId
    }
    yield put({ type: 'HYDRATE_ONFIDO_APPLICANT_ID_NOT_FOUND' })
  } catch (e) {
    captureError(e)
    yield put({
      type: 'HYDRATE_ONFIDO_APPLICANT_ID_FAIL',
    })
  }
}

export function* persistOnfidoApplicantId(
  applicantId: string
): Generator<*, *, *> {
  try {
    yield put({ type: 'PERSIST_ONFIDO_APPLICANT_ID_START' })
    yield call(secureSet, ONFIDO_APPLICANT_ID_STORAGE_KEY, applicantId)
    yield put({ type: 'PERSIST_ONFIDO_APPLICANT_ID_SUCCESS' })
  } catch (e) {
    captureError(e)
    yield put({
      type: 'PERSIST_ONFIDO_APPLICANT_ID_FAIL',
    })
  }
}

export const hydrateApplicantId = (applicantId: string) => ({
  type: HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS,
  applicantId,
})

export const updateOnfidoApplicantId = (applicantId: string) => ({
  type: UPDATE_ONFIDO_APPLICANT_ID,
  applicantId,
})

export const selectOnfidoApplicantId = (state: Store) =>
  state.onfido.applicantId

export const selectOnfidoDid = (state: Store) => state.onfido.onfidoDid

export function* getApplicantIdSaga(): Generator<*, *, *> {
  yield put(updateOnfidoStatus(onfidoProcessStatus.APPLICANT_ID_FETCHING))
  let applicantId: ?string = yield select(selectOnfidoApplicantId)
  if (!applicantId) {
    applicantId = yield* hydrateOnfidoApplicantIdSaga()
  }

  // check if connection is established with onfido
  let onfidoDid: ?string = yield* getOnfidoDidSaga()
  // if connection is not established with onfido or maybe connection was deleted
  // then we won't use previous applicant id, we create a new applicant id
  if (applicantId && onfidoDid) {
    yield put(updateOnfidoStatus(onfidoProcessStatus.APPLICANT_ID_SUCCESS))
    return applicantId
  }

  const response: { id: string } = yield call(getApplicantIdApi)
  if (response && response.id) {
    yield put(updateOnfidoApplicantId(response.id))
    yield call(persistOnfidoApplicantId, response.id)
    yield put(updateOnfidoStatus(onfidoProcessStatus.APPLICANT_ID_SUCCESS))
    return response.id
  }

  throw new Error(ERROR_MESSAGE_NO_APPLICANT_ID)
}

function promisifyOnfidoStartSDK(applicantId: string) {
  return new Promise((resolve, reject) => {
    NativeModules.OnfidoSDK.startSDK(
      applicantId,
      id => resolve(id),
      error => reject(new Error(error))
    )
  })
}

export function* launchOnfidoSDKSaga(
  action: LaunchOnfidoSDKAction
): Generator<*, *, *> {
  try {
    const applicantId: string = yield* getApplicantIdSaga()
    // make connection with onfido in background
    yield fork(makeConnectionWithOnfidoSaga, applicantId)

    try {
      yield put(updateOnfidoStatus(onfidoProcessStatus.START_NO_CONNECTION))
      yield call(promisifyOnfidoStartSDK, applicantId)
      yield put(updateOnfidoStatus(onfidoProcessStatus.CHECK_UUID_FETCHING))
      try {
        const checkUuid: string | { error: { message: string } } = yield call(
          getCheckUuid,
          applicantId
        )
        if (checkUuid.error && checkUuid.error.message) {
          throw new Error(checkUuid.error.message)
        }
        yield put(updateOnfidoStatus(onfidoProcessStatus.CHECK_UUID_SUCCESS))
      } catch (e) {
        yield put(updateOnfidoStatus(onfidoProcessStatus.CHECK_UUID_ERROR))
      }
    } catch (e) {
      yield put(
        updateOnfidoStatus(
          onfidoProcessStatus.SDK_ERROR,
          ERROR_ONFIDO_SDK(e.message)
        )
      )
    }
  } catch (e) {
    yield put(
      updateOnfidoStatus(
        onfidoProcessStatus.APPLICANT_ID_API_ERROR,
        ERROR_ONFIDO_APPLICANT_ID_API(e.message)
      )
    )
  }
}

export function* makeConnectionWithOnfidoSaga(
  applicantId: string
): Generator<*, *, *> {
  try {
    // if connection is already established, then don't make connection again
    let onfidoDid: ?string = yield* getOnfidoDidSaga()
    if (onfidoDid) {
      yield put(
        updateOnfidoConnectionStatus(onfidoConnectionStatus.CONNECTION_SUCCESS)
      )
      return
    }

    // create connection because no connection is established or
    // user deleted connection that was established
    yield put(
      updateOnfidoConnectionStatus(
        onfidoConnectionStatus.CONNECTION_DETAIL_FETCHING
      )
    )
    const invitationDetails: {
      invite: GenericObject,
      state: string,
    } = yield call(getOnfidoInvitation, applicantId)

    if (!invitationDetails.invite) {
      yield put(
        updateOnfidoConnectionStatus(
          onfidoConnectionStatus.CONNECTION_DETAIL_INVALID_ERROR,
          ERROR_CONNECTION_DETAIL_INVALID('No invite found')
        )
      )
      return
    }
    const invitationData: QrCode | boolean = isValidQrCode(
      JSON.stringify(invitationDetails.invite)
    )
    if (!invitationData || typeof invitationData !== 'object') {
      yield put(
        updateOnfidoConnectionStatus(
          onfidoConnectionStatus.CONNECTION_DETAIL_INVALID_ERROR,
          ERROR_CONNECTION_DETAIL_INVALID('Invalid invite json')
        )
      )
      return
    }
    yield put(
      updateOnfidoConnectionStatus(
        onfidoConnectionStatus.CONNECTION_DETAIL_FETCH_SUCCESS
      )
    )
    yield put(
      invitationReceived({
        payload: convertQrCodeToInvitation(invitationData),
      })
    )
    onfidoDid = invitationData[QR_CODE_SENDER_DETAIL][QR_CODE_SENDER_DID]
    yield put(
      sendInvitationResponse({
        response: ResponseType.accepted,
        senderDID: onfidoDid,
      })
    )
    yield put(
      updateOnfidoConnectionStatus(
        onfidoConnectionStatus.CONNECTION_IN_PROGRESS
      )
    )
    const { success, fail } = yield race({
      success: take(NEW_CONNECTION_SUCCESS),
      fail: take(INVITATION_RESPONSE_FAIL),
    })
    if (fail) {
      yield put(
        updateOnfidoConnectionStatus(onfidoConnectionStatus.CONNECTION_FAIL)
      )
      return
    }
    yield fork(askPushNotificationPermission)
    yield put(onfidoConnectionEstablished(onfidoDid))
    yield put(
      updateOnfidoConnectionStatus(onfidoConnectionStatus.CONNECTION_SUCCESS)
    )
    yield* persistOnfidoDidSaga(onfidoDid)
  } catch (e) {
    yield put(
      updateOnfidoConnectionStatus(
        onfidoConnectionStatus.CONNECTION_DETAIL_FETCH_ERROR
      )
    )
  }
}

export function* getOnfidoDidSaga(): Generator<*, *, *> {
  let onfidoDid: ?string = yield select(selectOnfidoDid)
  if (!onfidoDid) {
    onfidoDid = yield* hydrateOnfidoDidSaga()
  }

  if (!onfidoDid) {
    return null
  }

  // since we want to take data from connections store
  // we need to make sure that data is hydrated before we take data
  // from persisted stores
  yield* ensureAppHydrated()
  const userPairwiseDid: ?string = yield select(getUserPairwiseDid, onfidoDid)
  if (userPairwiseDid) {
    return onfidoDid
  }

  // if we have onfidoDid, but no corresponding user pairwise did
  // then user might have deleted the connection that was established
  // so, we reset onfido did as well
  yield put(removeOnfidoDid())
  yield* removePersistedOnfidoDidSaga()
  return null
}

export function* askPushNotificationPermission(): Generator<*, *, *> {
  const onfidoStatus: OnfidoProcessStatus = yield select(selectOnfidoStatus)
  const {
    CHECK_UUID_SUCCESS,
    CHECK_UUID_ERROR,
    SDK_ERROR,
  } = onfidoProcessStatus
  const validStatesToAskPermission = [
    CHECK_UUID_SUCCESS,
    CHECK_UUID_ERROR,
    SDK_ERROR,
  ]
  if (!validStatesToAskPermission.includes(onfidoStatus)) {
    // if we don't have onfido process in any of the valid states
    // then we wait for onfido process to go into any of these states
    // and then we will move ahead with permission
    while (true) {
      const { status }: UpdateOnfidoProcessStatusAction = yield take(
        UPDATE_ONFIDO_PROCESS_STATUS
      )
      if (validStatesToAskPermission.includes(status)) {
        break
      }
    }
  }

  try {
    // ask permission and update store about it
    yield call(() => firebase.messaging().requestPermission())
    yield put(pushNotificationPermissionAction(true))
  } catch (e) {
    // not sure what can be done if we get error while asking
    // for push permission, for now just ignore and let user continue
    console.log(e)
  }
}

export const selectOnfidoStatus = (state: Store) => state.onfido.status

const ONFIDO_DID_STORAGE_KEY = 'ONFIDO_DID_STORAGE_KEY'
export function* removePersistedOnfidoDidSaga(): Generator<*, *, *> {
  try {
    yield put({ type: 'REMOVE_ONFIDO_DID_START' })
    yield call(secureDelete, ONFIDO_DID_STORAGE_KEY)
    yield put({ type: 'REMOVE_ONFIDO_DID_SUCCESS' })
  } catch (e) {
    captureError(e)
    yield put({
      type: 'REMOVE_ONFIDO_DID_FAIL',
    })
  }
}

export function* hydrateOnfidoDidSaga(): any {
  try {
    yield put({ type: 'HYDRATE_ONFIDO_DID_START' })
    const onfidoDid: string = yield call(
      getHydrationItem,
      ONFIDO_DID_STORAGE_KEY
    )
    if (onfidoDid) {
      yield put(hydrateOnfidoDid(onfidoDid))
      return onfidoDid
    }
  } catch (e) {
    captureError(e)
    yield put({
      type: 'HYDRATE_ONFIDO_DID_FAIL',
    })
  }
}

export function* persistOnfidoDidSaga(onfidoDid: string): Generator<*, *, *> {
  try {
    yield put({ type: 'PERSIST_ONFIDO_DID_START' })
    yield call(secureSet, ONFIDO_DID_STORAGE_KEY, onfidoDid)
    yield put({ type: 'PERSIST_ONFIDO_DID_SUCCESS' })
  } catch (e) {
    captureError(e)
    yield put({
      type: 'PERSIST_ONFIDO_DID_FAIL',
    })
  }
}

export const hydrateOnfidoDid = (onfidoDid: string) => ({
  type: HYDRATE_ONFIDO_DID_SUCCESS,
  onfidoDid,
})

export const removeOnfidoDid = () => ({
  type: REMOVE_ONFIDO_DID,
})

export const getApplicantId = () => ({
  type: GET_APPLICANT_ID,
})

export const resetOnfidoStatues = () => ({
  type: RESET_ONFIDO_STATUES,
})

function* watchOnfidoStart(): any {
  yield takeLatest(LAUNCH_ONFIDO_SDK, launchOnfidoSDKSaga)
}

export function* watchOnfido(): any {
  yield all([watchOnfidoStart()])
}

export default function onfidoReducer(
  state: OnfidoStore = initialState,
  action: OnfidoStoreAction
) {
  switch (action.type) {
    case UPDATE_ONFIDO_PROCESS_STATUS:
      return {
        ...state,
        status: action.status,
        error: action.error ? action.error : null,
      }
    case UPDATE_ONFIDO_CONNECTION_STATUS:
      return {
        ...state,
        onfidoConnectionStatus: action.status,
      }
    case UPDATE_ONFIDO_APPLICANT_ID:
      return {
        ...state,
        applicantId: action.applicantId,
      }
    case HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS:
      // if we already have applicant id even before we can hydrate
      // then we don't need to update value from hydration
      if (state.applicantId) {
        return state
      }

      return {
        ...state,
        applicantId: action.applicantId,
      }
    case ONFIDO_CONNECTION_ESTABLISHED:
    case HYDRATE_ONFIDO_DID_SUCCESS:
      return {
        ...state,
        onfidoDid: action.onfidoDid,
      }
    case REMOVE_ONFIDO_DID:
      return {
        ...state,
        onfidoDid: null,
      }
    case RESET_ONFIDO_STATUES:
      return {
        ...state,
        status: initialState.status,
        error: initialState.error,
        onfidoConnectionStatus: initialState.onfidoConnectionStatus,
      }
    default:
      return state
  }
}
