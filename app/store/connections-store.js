// @flow
import {
  put,
  takeLatest,
  takeEvery,
  call,
  select,
  all,
} from 'redux-saga/effects'
import {
  secureSet,
  secureDelete,
  getHydrationItem,
  secureGet,
} from '../services/storage'
import { CONNECTIONS } from '../common'
import {
  getAllConnection,
  getThemes,
  getConnection as getConnectionBySenderDid,
} from './store-selector'
import { color } from '../common/styles/constant'
import { bubbleSize } from '../common/styles'
import type { CustomError, GenericObject } from '../common/type-common'
import type {
  ConnectionStore,
  Connection,
  Connections,
  ConnectionThemes,
  ConnectionAttachRequestAction,
  ConnectionDeleteAttachedRequestAction,
  DeleteConnectionSuccessEventAction,
  DeleteConnectionFailureEventAction,
  DeleteConnectionEventAction,
  SendConnectionRedirectAction,
  SendConnectionReuseAction,
  UpdateConnectionSerializedStateAction,
} from './type-connection-store'
import type {
  AriesOutOfBandInvite,
  InvitationPayload,
} from '../invitation/type-invitation'
import {
  CONNECTION_ATTACH_REQUEST,
  CONNECTION_DELETE_ATTACHED_REQUEST,
  NEW_CONNECTION,
  DELETE_CONNECTION_SUCCESS,
  DELETE_CONNECTION_FAILURE,
  DELETE_CONNECTION,
  STORAGE_KEY_THEMES,
  HYDRATE_CONNECTION_THEMES,
  UPDATE_CONNECTION_THEME,
  UPDATE_STATUS_BAR_THEME,
  HYDRATE_CONNECTIONS,
  SEND_CONNECTION_REDIRECT,
  SEND_CONNECTION_REUSE,
  UPDATE_CONNECTION_SERIALIZED_STATE,
  SEND_REDIRECT_SUCCESS,
  SEND_REUSE_SUCCESS,
  CONNECTION_FAIL,
  NEW_ONE_TIME_CONNECTION,
  NEW_CONNECTION_SUCCESS,
  NEW_PENDING_CONNECTION,
  UPDATE_CONNECTION,
  connectionFail,
} from './type-connection-store'
import {
  deleteConnection,
  getHandleBySerializedConnection,
  createConnectionWithInvite,
  connectionRedirect,
  connectionReuse,
} from '../bridge/react-native-cxs/RNCxs'
import { RESET } from '../common/type-common'
import { promptBackupBanner } from '../backup/backup-store'
import { HYDRATED } from './type-config-store'
import { captureError } from '../services/error/error-handler'
import { customLogger } from '../store/custom-logger'
import { ensureVcxInitSuccess } from './route-store'
import moment from 'moment'

const initialState: ConnectionStore = {
  data: {},
  isFetching: false,
  isPristine: true,
  connectionThemes: {
    default: {
      primary: `rgba(${color.actions.button.primary.rgba})`,
      secondary: `rgba(${color.actions.button.secondary.rgba})`,
    },
  },
  claimMap: null,
  error: {
    code: '',
    message: '',
  },
  hydrated: false,
}

// TODO:KS As of now we have added flow to this file and only checking imports
// but we need to fix all any types. I will do that once claims are done

export const connectionMapper = ({
  logoUrl,
  size = bubbleSize.XL,
  senderName = 'Unknown',
  ...otherArgs
}: GenericObject) => ({
  logoUrl,
  size,
  senderName,
  ...otherArgs,
})

export const updateConnectionTheme = (
  logoUrl: string,
  primaryColor: string,
  secondaryColor: string
) => ({
  type: UPDATE_CONNECTION_THEME,
  logoUrl,
  primaryColor,
  secondaryColor,
})

export const saveNewConnection = (connection: GenericObject) => ({
  type: NEW_CONNECTION,
  connection,
})

export const saveNewPendingConnection = (connection: GenericObject) => ({
  type: NEW_PENDING_CONNECTION,
  connection,
})

export const updateConnection = (connection: GenericObject) => ({
  type: UPDATE_CONNECTION,
  connection,
})

export const saveNewOneTimeConnection = (connection: GenericObject) => ({
  type: NEW_ONE_TIME_CONNECTION,
  connection,
})

//TODO refactor create a new store for ui
export const updateStatusBarTheme = (statusColor?: string) => ({
  type: UPDATE_STATUS_BAR_THEME,
  color: statusColor || color.bg.tertiary.color,
})

export const deleteConnectionAction = (
  senderDID: string
): DeleteConnectionEventAction => ({
  type: DELETE_CONNECTION,
  senderDID,
})

export const connectionAttachRequest = (
  identifier: string,
  request: GenericObject
): ConnectionAttachRequestAction => ({
  type: CONNECTION_ATTACH_REQUEST,
  identifier,
  request,
})

export const connectionDeleteAttachedRequest = (
  identifier: string
): ConnectionDeleteAttachedRequestAction => ({
  type: CONNECTION_DELETE_ATTACHED_REQUEST,
  identifier,
})

export function* deleteConnectionOccurredSaga(
  action: DeleteConnectionEventAction
): Generator<*, *, *> {
  const connections: GenericObject = yield select(getAllConnection)

  const [connection]: Array<Connection> = yield select(
    getConnectionBySenderDid,
    action.senderDID
  )

  const { [connection.identifier]: deleted, ...rest } = connections

  try {
    yield call(secureSet, CONNECTIONS, JSON.stringify(rest))

    // We need to save connection identifier mapped to its corresponding senderDID before we delete a connection,
    // because the getConnection method won't return a valid connection since it has been deleted.
    const retrieveDeletedConnectionsJSON = yield call(
      secureGet,
      'DELETED_CONNECTIONS'
    ) || {}
    const retrieveDeletedConnectionsParsed =
      JSON.parse(retrieveDeletedConnectionsJSON) || {}

    if (!(action.senderDID in retrieveDeletedConnectionsParsed)) {
      retrieveDeletedConnectionsParsed[action.senderDID] = connection.identifier
    }

    yield call(
      secureSet,
      'DELETED_CONNECTIONS',
      JSON.stringify(retrieveDeletedConnectionsParsed)
    )

    yield put(deleteConnectionSuccess(rest))

    if (connection.vcxSerializedConnection) {
      const connectionHandle = yield call(
        getHandleBySerializedConnection,
        connection.vcxSerializedConnection
      )
      yield call(deleteConnection, connectionHandle)
    }
  } catch (e) {
    captureError(e)
    yield put(deleteConnectionFailure(connection, e))
  }
}

export function* watchDeleteConnectionOccurred(): any {
  yield takeLatest(DELETE_CONNECTION, deleteConnectionOccurredSaga)
}

export function* loadNewConnectionSaga(_: GenericObject): Generator<*, *, *> {
  try {
    yield put(promptBackupBanner(true))
    yield* persistConnections()
  } catch (e) {
    captureError(e)
  }
}

export function* watchConnectionsChanged(): any {
  yield takeEvery(
    [
      NEW_CONNECTION,
      NEW_PENDING_CONNECTION,
      UPDATE_CONNECTION,
      NEW_CONNECTION_SUCCESS,
      CONNECTION_FAIL,
      DELETE_CONNECTION_SUCCESS,
      CONNECTION_ATTACH_REQUEST,
      CONNECTION_DELETE_ATTACHED_REQUEST,
      UPDATE_CONNECTION_SERIALIZED_STATE,
    ],
    loadNewConnectionSaga
  )
}

export function* persistConnections(): Generator<*, *, *> {
  try {
    const connections = yield select(getAllConnection)
    yield call(secureSet, CONNECTIONS, JSON.stringify(connections))
  } catch (e) {
    captureError(e)
    customLogger.log(`hydrateConnectionSaga: ${e}`)
  }
}

export const hydrateConnections = (connections: Connections) => ({
  type: HYDRATE_CONNECTIONS,
  connections,
})

export function* hydrateConnectionSaga(): Generator<*, *, *> {
  try {
    const connections = yield call(getHydrationItem, CONNECTIONS)
    if (connections) {
      yield put(hydrateConnections(JSON.parse(connections)))
    }
  } catch (e) {
    // to capture secure get
    captureError(e)
    customLogger.log(`hydrateConnectionSaga: ${e}`)
  }
}

export const getConnections = (connectionsData: ?Connections) =>
  connectionsData ? Object.values(connectionsData) : []

export const getConnectionLogo = (logoUrl: ?string) =>
  logoUrl ? { uri: logoUrl } : require('../images/cb_evernym.png')

export const deleteConnectionSuccess = (
  filteredConnections: Connections
): DeleteConnectionSuccessEventAction => ({
  type: DELETE_CONNECTION_SUCCESS,
  filteredConnections,
})

export const deleteConnectionFailure = (
  connection: Connection,
  error: CustomError
): DeleteConnectionFailureEventAction => ({
  type: DELETE_CONNECTION_FAILURE,
  connection,
  error,
})

export const hydrateConnectionThemes = (themes: ConnectionThemes) => ({
  type: HYDRATE_CONNECTION_THEMES,
  themes,
})

export function* persistThemes(): Generator<*, *, *> {
  const themes = yield select(getThemes)
  try {
    yield call(secureSet, STORAGE_KEY_THEMES, JSON.stringify(themes))
  } catch (e) {
    // capture error for secure set
    captureError(e)
    customLogger.error(`persistThemes: ${e}`)
  }
}

export function* hydrateThemes(): Generator<*, *, *> {
  try {
    const themes = yield call(getHydrationItem, STORAGE_KEY_THEMES)
    if (themes) {
      yield put(hydrateConnectionThemes(JSON.parse(themes)))
    }
  } catch (e) {
    // capture error for secure get
    captureError(e)
    customLogger.error(`hydrateThemes: ${e}`)
  }
}

export function* removePersistedThemes(): Generator<*, *, *> {
  try {
    yield call(secureDelete, STORAGE_KEY_THEMES)
  } catch (e) {
    // capture error for secure delete
    captureError(e)
    customLogger.error(`removePersistedThemes: ${e}`)
  }
}

export function updateConnectionSerializedState({
  identifier,
  vcxSerializedConnection,
}: *): UpdateConnectionSerializedStateAction {
  return {
    type: UPDATE_CONNECTION_SERIALIZED_STATE,
    identifier,
    vcxSerializedConnection,
  }
}

export const sendConnectionRedirect = (
  qrCodeInvitationPayload: InvitationPayload,
  existingConnectionDetails: $PropertyType<
    SendConnectionRedirectAction,
    'existingConnectionDetails'
  >
) => ({
  type: SEND_CONNECTION_REDIRECT,
  qrCodeInvitationPayload,
  existingConnectionDetails,
})

export const sendConnectionReuse = (
  invite: AriesOutOfBandInvite,
  existingConnectionDetails: $PropertyType<
    SendConnectionReuseAction,
    'existingConnectionDetails'
  >
) => ({
  type: SEND_CONNECTION_REUSE,
  invite,
  existingConnectionDetails,
})

function* sendConnectionRedirectSaga(
  action: SendConnectionRedirectAction
): Generator<*, *, *> {
  try {
    const vcxResult = yield* ensureVcxInitSuccess()
    if (vcxResult && vcxResult.fail) {
      throw new Error(vcxResult.fail.message)
    }

    try {
      // get redirect connection handle
      const [connection]: Array<Connection> = yield select(
        getConnectionBySenderDid,
        action.existingConnectionDetails.senderDID
      )
      const redirectConnectionHandle = yield call(
        getHandleBySerializedConnection,
        connection.vcxSerializedConnection
      )
      try {
        // get (new) connection handle
        const connectionHandle = yield call(
          createConnectionWithInvite,
          action.qrCodeInvitationPayload
        )
        try {
          // call API for connectionRedirect
          yield call(
            connectionRedirect,
            redirectConnectionHandle,
            connectionHandle
          )
          yield put({
            type: SEND_REDIRECT_SUCCESS,
          })
        } catch (e) {
          // catch error if connectionRedirect API fails
          yield put({
            type: 'ERROR_SENDING_REDIRECT',
            e,
          })
        }
      } catch (e) {
        // catch error if handle creation API fails
        yield put({
          type: 'ERROR_CONNECTION_HANDLE_NEW_CONNECTION_REDIRECT',
          e,
        })
      }
    } catch (e) {
      // catch error if existing handle is not found
      yield put({
        type: 'ERROR_CONNECTION_HANDLE_REDIRECT',
        e,
      })
    }
  } catch (e) {
    // catch error
    captureError(e)
    customLogger.error(`connectionRedirect: ${e}`)
  }
}

function* sendConnectionReuseSaga(
  action: SendConnectionReuseAction
): Generator<*, *, *> {
  try {
    const vcxResult = yield* ensureVcxInitSuccess()
    if (vcxResult && vcxResult.fail) {
      throw new Error(vcxResult.fail.message)
    }

    try {
      // get reuse connection handle
      const [connection]: Array<Connection> = yield select(
        getConnectionBySenderDid,
        action.existingConnectionDetails.senderDID
      )
      const connectionHandle = yield call(
        getHandleBySerializedConnection,
        connection.vcxSerializedConnection
      )

      try {
        // call API for connectionReuse
        yield call(connectionReuse, connectionHandle, action.invite)
        yield put({
          type: SEND_REUSE_SUCCESS,
        })
      } catch (e) {
        // catch error if connectionReuse API fails
        yield put({
          type: 'ERROR_SENDING_REUSE',
          e,
        })
      }
    } catch (e) {
      // catch error if existing handle is not found
      yield put({
        type: 'ERROR_CONNECTION_HANDLE_REUSE',
        e,
      })
    }
  } catch (e) {
    // catch error
    captureError(e)
    customLogger.error(`connectionReuse: ${e}`)
  }
}

export function* watchSendConnectionRedirect(): any {
  yield takeEvery(SEND_CONNECTION_REDIRECT, sendConnectionRedirectSaga)
}

export function* watchSendConnectionReuse(): any {
  yield takeEvery(SEND_CONNECTION_REUSE, sendConnectionReuseSaga)
}

export function* watchUpdateConnectionTheme(): any {
  yield takeLatest(UPDATE_CONNECTION_THEME, persistThemes)
}

export function* watchConnection(): any {
  yield all([
    watchDeleteConnectionOccurred(),
    watchConnectionsChanged(),
    watchUpdateConnectionTheme(),
    watchSendConnectionRedirect(),
    watchSendConnectionReuse(),
  ])
}

export default function connections(
  state: ConnectionStore = initialState,
  action:
    | any
    | UpdateConnectionSerializedStateAction
    | ConnectionAttachRequestAction
    | ConnectionDeleteAttachedRequestAction
) {
  switch (action.type) {
    case UPDATE_CONNECTION_THEME:
      return {
        ...state,
        connectionThemes: {
          ...state.connectionThemes,
          [action.logoUrl]: {
            primary: action.primaryColor,
            secondary: action.secondaryColor,
          },
        },
      }
    case HYDRATE_CONNECTION_THEMES:
      return {
        ...state,
        connectionThemes: {
          ...state.connectionThemes,
          ...action.themes,
        },
      }
    case NEW_PENDING_CONNECTION: {
      const {
        connection,
        connection: { identifier },
      } = action
      return {
        ...state,
        data: {
          ...state.data,
          [identifier]: {
            ...connectionMapper(connection),
            isFetching: true,
            isCompleted: false,
            timestamp: moment().format(),
          },
        },
      }
    }
    case UPDATE_CONNECTION: {
      const {
        connection,
        connection: { identifier, senderDID },
      } = action

      const { [senderDID]: pendingConnection, ...connections } =
        state.data || {}

      return {
        ...state,
        data: {
          ...connections,
          [identifier]: {
            ...connectionMapper(connection),
            isFetching: true,
            isCompleted: false,
            timestamp: pendingConnection.timestamp,
          },
        },
      }
    }
    case NEW_ONE_TIME_CONNECTION:
      return {
        ...state,
        oneTimeConnections: {
          ...state.oneTimeConnections,
          [action.connection.identifier]: {
            ...action.connection,
            isCompleted: true,
            isFetching: false,
            timestamp: moment().format(),
          },
        },
      }
    case NEW_CONNECTION_SUCCESS:
      const { identifier } = action
      return {
        ...state,
        data: {
          ...state.data,
          [identifier]: {
            ...(state.data && state.data[identifier]
              ? state.data[identifier]
              : {}),
            isCompleted: true,
            isFetching: false,
            timestamp: moment().format(),
          },
        },
      }
    case DELETE_CONNECTION_SUCCESS:
      const filteredData = { ...action.filteredConnections }
      return {
        ...state,
        data: filteredData,
      }
    case UPDATE_STATUS_BAR_THEME:
      return {
        ...state,
        statusBarTheme: action.color,
      }
    case HYDRATE_CONNECTIONS:
      return {
        ...state,
        data: action.connections,
      }
    case HYDRATED:
      return {
        ...state,
        hydrated: true,
      }
    case UPDATE_CONNECTION_SERIALIZED_STATE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.identifier]: {
            ...(state.data ? state.data[action.identifier] || {} : {}),
            vcxSerializedConnection: action.vcxSerializedConnection,
          },
        },
      }
    case CONNECTION_FAIL:
      if (!state.data) {
        return state
      }

      const connection: any = Object.values(state.data).find(
        (connection: any) => connection.senderDID === action.senderDid
      )

      if (!connection) {
        return state
      }

      return {
        ...state,
        data: {
          ...state.data,
          [connection.identifier]: {
            ...(state.data ? state.data[connection.identifier] || {} : {}),
            isFetching: false,
            error: action.error,
          },
        },
      }
    case CONNECTION_ATTACH_REQUEST: {
      return {
        ...state,
        data: {
          ...state.data,
          [action.identifier]: {
            ...state.data?.[action.identifier],
            attachedRequest: action.request,
          },
        },
      }
    }
    case CONNECTION_DELETE_ATTACHED_REQUEST: {
      if (state.data && state.data[action.identifier]) {
        // eslint-disable-next-line no-unused-vars
        const { attachedRequest, ...connection } =
          state.data?.[action.identifier] ?? {}

        return {
          ...state,
          data: {
            ...state.data,
            [action.identifier]: connection,
          },
        }
      } else {
        return state
      }
    }
    case RESET:
      return initialState
    default:
      return state
  }
}
