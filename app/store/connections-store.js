import { put, takeLatest, call } from 'redux-saga/effects'
import { getProfile, connectionMapper, setItem, getItem } from '../services'
import { CONNECTIONS } from '../common'
import {
  sendUserInvitationResponseSuccess,
  sendUserInvitationResponseFailure,
  INVITATION_STATUS,
  INVITATION_TYPE,
} from '../invitation/invitation-store'

const NEW_CONNECTION = 'NEW_CONNECTION'
const NEW_CONNECTION_SUCCESS = 'NEW_CONNECTION_SUCCESS'
const NEW_CONNECTION_FAIL = 'NEW_CONNECTION_FAIL'
const HYDRATE_CONNECTIONS = 'HYDRATE_CONNECTIONS'

const initialState = {
  data: {},
  isFetching: false,
  isPristine: true,
  error: {
    code: '',
    message: '',
  },
}

export const saveNewConnection = connection => ({
  type: NEW_CONNECTION,
  connection,
})

export const saveNewConnectionSuccess = connection => ({
  type: NEW_CONNECTION_SUCCESS,
  connection,
})

export const saveNewConnectionFailed = error => ({
  type: NEW_CONNECTION_FAIL,
  error,
})

export function* loadNewConnectionSaga(action) {
  const { identifier, remoteConnectionId } = action.connection.newConnection
  try {
    let connection = {}
    try {
      connection = yield call(
        getProfile,
        action.connection.newConnection,
        action.connection.config
      )
    } catch (e) {
      console.log(e)
      console.log('get profile call failed for ', identifier)
    }
    Object.assign(connection, {
      identifier,
      logoUrl: connection.logoUrl,
      remoteConnectionId,
    })

    //TODO:Add a middleware which will periodically save redux store to secure storage.
    let connections = yield call(getItem, CONNECTIONS)
    connections = connections ? JSON.parse(connections) : {}

    Object.assign(connections, { [identifier]: connectionMapper(connection) })

    yield call(setItem, CONNECTIONS, JSON.stringify(connections))
    yield put(saveNewConnectionSuccess(connection))
    yield put(
      sendUserInvitationResponseSuccess({
        newStatus: action.connection.data.newStatus,
      })
    )
  } catch (e) {
    yield put(saveNewConnectionFailed(e))
    yield put(
      sendUserInvitationResponseFailure({
        message: e.message,
        invitationType: INVITATION_TYPE.PENDING_CONNECTION_REQUEST,
      })
    )
  }
}

export function* watchNewConnection() {
  yield takeLatest(NEW_CONNECTION, loadNewConnectionSaga)
}

export const hydrateConnections = connections => ({
  type: HYDRATE_CONNECTIONS,
  connections,
})

export default function connections(state = initialState, action) {
  switch (action.type) {
    case NEW_CONNECTION:
      return {
        ...state,
        isFetching: true,
        isPristine: false,
        error: initialState.error,
      }
    case NEW_CONNECTION_SUCCESS:
      const { connection, connection: { identifier } } = action
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          [identifier]: connectionMapper(connection),
        },
      }
    case NEW_CONNECTION_FAIL:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      }
    case HYDRATE_CONNECTIONS:
      return {
        ...state,
        data: action.connections,
      }
    default:
      return state
  }
}
