// @flow
import { Platform } from 'react-native'
import {
  call,
  all,
  takeLatest,
  takeEvery,
  take,
  select,
  put,
  fork,
} from 'redux-saga/effects'
import { MESSAGE_TYPE } from '../api/api-constants'
import { captureError } from '../services/error/error-handler'
import {
  getAgencyUrl,
  getAllConnection,
  getRemotePairwiseDidAndName,
  getUserOneTimeInfo,
  getAgencyVerificationKey,
  getHydrationState,
  getPoolConfig,
  getInvitations,
  getDeepLinkTokens,
  getPendingFetchAdditionalDataKey,
  getIsAppLocked,
  getSerializedClaimOffer,
  getCurrentScreen,
  getBackupWalletHandle,
  getAllConnectionsPairwiseDid,
  getBackupWalletPath,
  getEncryptedFileLocation,
} from '../store/store-selector'
import {
  PUSH_NOTIFICATION_PERMISSION,
  PUSH_NOTIFICATION_UPDATE_TOKEN,
  PUSH_NOTIFICATION_RECEIVED,
  FETCH_ADDITIONAL_DATA,
  FETCH_ADDITIONAL_DATA_ERROR,
  HYDRATE_PUSH_TOKEN,
  FETCH_ADDITIONAL_DATA_PENDING_KEYS,
  UPDATE_RELEVANT_PUSH_PAYLOAD_STORE_AND_REDIRECT,
  UPDATE_RELEVANT_PUSH_PAYLOAD_STORE,
} from './type-push-notification'

import type {
  CustomError,
  NotificationPayload,
  ReactNavigation,
} from '../common/type-common'
import type {
  AdditionalDataPayload,
  PushNotificationPermissionAction,
  PushNotificationUpdateTokenAction,
  PushNotificationReceivedAction,
  FetchAdditionalDataAction,
  AdditionalDataResponse,
  PushNotificationAction,
  PushNotificationStore,
  DownloadedNotification,
  ClaimOfferPushPayload,
  ClaimPushPayload,
  HydratePushTokenAction,
  updatePayloadToRelevantStoreAndRedirectAction,
  RedirectToRelevantScreen,
  NotificationOpenOptions,
} from './type-push-notification'
import type { Connections } from '../connection/type-connection'
import type { UserOneTimeInfo } from '../store/user/type-user-store'
import {
  updatePushTokenVcx,
  downloadClaimOffer,
  downloadProofRequest,
  getHandleBySerializedConnection,
  serializeClaimOffer,
  downloadMessages,
  vcxGetAgentMessages,
  updateWalletBackupStateWithMessage,
  backupWalletBackup,
  serializeBackupWallet,
} from '../bridge/react-native-cxs/RNCxs'
import {
  HYDRATED,
  VCX_INIT_SUCCESS,
  MESSAGE_RESPONSE_CODE,
} from '../store/type-config-store'
import type {
  DownloadedConnectionsWithMessages,
  DownloadedMessage,
} from '../store/type-config-store'
import { CONNECT_REGISTER_CREATE_AGENT_DONE } from '../store/user/type-user-store'
import uniqueId from 'react-native-unique-id'
import { RESET } from '../common/type-common'
import { ensureVcxInitSuccess } from '../store/route-store'
import type { Connection } from '../store/type-connection-store'
import type { CxsCredentialOfferResult } from '../bridge/react-native-cxs/type-cxs'
import type {
  ProofRequestPushPayload,
  AdditionalProofDataPayload,
} from '../proof-request/type-proof-request'
import type { ClaimPushPayloadVcx } from '../claim/type-claim'
import type { Claim } from '../claim/type-claim'
import type { QuestionPayload } from './../question/type-question'
import { saveSerializedClaimOffer } from '../claim-offer/claim-offer-store'
import { safeGet, safeSet, secureGet, walletSet } from '../services/storage'
import {
  PUSH_COM_METHOD,
  PASSPHRASE_STORAGE_KEY,
  PASSPHRASE_SALT_STORAGE_KEY,
  LAST_SUCCESSFUL_CLOUD_BACKUP,
  connectionHistRoute,
} from '../common'
import type { NavigationParams, GenericObject } from '../common/type-common'

import { addPendingRedirection } from '../lock/lock-store'
import { UNLOCK_APP } from '../lock/type-lock'
import { claimOfferReceived } from '../claim-offer/claim-offer-store'
import { proofRequestReceived } from '../proof-request/proof-request-store'
import {
  updateMessageStatus,
  processMessages,
  traverseAndGetAllMessages,
  convertDecryptedPayloadToQuestion,
} from '../store/config-store'
import {
  claimOfferRoute,
  invitationRoute,
  proofRequestRoute,
  qrCodeScannerTabRoute,
  homeTabRoute,
  lockPinSetupRoute,
  lockTouchIdSetupRoute,
  lockPinSetupHomeRoute,
  lockEnterPinRoute,
  lockEnterFingerprintRoute,
  lockAuthorizationRoute,
  lockAuthorizationHomeRoute,
  questionRoute,
} from '../common'
import { claimReceivedVcx } from '../claim/claim-store'
import { questionReceived } from '../question/question-store'
import { NavigationActions } from 'react-navigation'
import type { SerializedClaimOffer } from './../claim-offer/type-claim-offer'
import { customLogger } from '../store/custom-logger'
import {
  SET_WALLET_HANDLE,
  WALLET_FILE_NAME,
  AUTO_CLOUD_BACKUP_ENABLED,
  WALLET_BACKUP_FAILURE,
} from '../backup/type-backup'
import { getWords } from '../backup/secure-passphrase'
import moment from 'moment'
import {
  cloudBackupSuccess,
  cloudBackupFailure,
  setAutoCloudBackupEnabled,
  viewedWalletError,
} from '../backup/backup-store'
import { connectionHistoryBackedUp } from '../connection-history/connection-history-store'
import RNFetchBlob from 'rn-fetch-blob'
import { showInAppNotification } from '../in-app-notification/in-app-notification-actions'

async function delay(ms): Promise<number> {
  return new Promise(res => setTimeout(res, ms))
}

const blackListedRoute = {
  [proofRequestRoute]: proofRequestRoute,
  [claimOfferRoute]: claimOfferRoute,
  [lockPinSetupRoute]: lockPinSetupRoute,
  [lockTouchIdSetupRoute]: lockTouchIdSetupRoute,
  [lockPinSetupHomeRoute]: lockPinSetupHomeRoute,
  [lockEnterPinRoute]: lockEnterPinRoute,
  [lockEnterFingerprintRoute]: lockEnterFingerprintRoute,
  [lockAuthorizationRoute]: lockAuthorizationRoute,
  [lockAuthorizationHomeRoute]: lockAuthorizationHomeRoute,
  [invitationRoute]: invitationRoute,
}

const initialState = {
  isAllowed: false,
  notification: null,
  pushToken: null,
  isPristine: true,
  isFetching: false,
  error: null,
  pendingFetchAdditionalDataKey: null,
  navigateRoute: null,
}

export const pushNotificationPermissionAction = (isAllowed: boolean) => ({
  type: PUSH_NOTIFICATION_PERMISSION,
  isAllowed,
})

export const updatePushToken = (token: string) => ({
  type: PUSH_NOTIFICATION_UPDATE_TOKEN,
  token,
})

export function* onPushTokenUpdate(
  action: PushNotificationUpdateTokenAction
): Generator<*, *, *> {
  try {
    const pushToken = `FCM:${action.token}`
    const id = yield uniqueId()
    const vcxResult = yield* ensureVcxInitSuccess()
    if (vcxResult && vcxResult.fail) {
      yield take(VCX_INIT_SUCCESS)
    }
    yield call(updatePushTokenVcx, { uniqueId: id, pushToken })
    yield* savePushTokenSaga(pushToken)
  } catch (e) {
    captureError(e)
  }
}

export function convertClaimOfferPushPayloadToAppClaimOffer(
  pushPayload: ClaimOfferPushPayload
): AdditionalDataPayload {
  /**
   * Below expression Converts this format
   * {
   *  name: ["Test"],
   *  height: ["170"]
   * }
   * TO
   * [
   *  {label: "name", data: "Test"},
   *  {label: "height", data: "170"},
   * ]
   */
  const revealedAttributes = Object.keys(pushPayload.claim).map(
    attributeName => {
      let attributeValue = pushPayload.claim[attributeName]
      if (Array.isArray(attributeValue)) {
        attributeValue = attributeValue[0]
      }
      return {
        label: attributeName,
        data: attributeValue,
      }
    }
  )

  return {
    issuer: {
      name: pushPayload.issuer_name || pushPayload.remoteName,
      did: pushPayload.issuer_did,
    },
    data: {
      name: pushPayload.claim_name,
      version: pushPayload.version,
      revealedAttributes,
      claimDefinitionSchemaSequenceNumber: pushPayload.schema_seq_no,
    },
    payTokenValue: pushPayload.price,
  }
}

export function convertProofRequestPushPayloadToAppProofRequest(
  pushPayload: ProofRequestPushPayload
): AdditionalProofDataPayload {
  const { proof_request_data, remoteName, proofHandle } = pushPayload
  const { requested_attributes, name, version } = proof_request_data

  const requestedAttributes = Object.keys(requested_attributes).map(
    attributeKey => ({
      label: requested_attributes[attributeKey].name,
    })
  )

  return {
    data: {
      name,
      version,
      requestedAttributes,
    },
    requester: {
      name: remoteName,
    },
    originalProofRequestData: proof_request_data,
    proofHandle,
  }
}

export function convertClaimPushPayloadToAppClaim(
  pushPayload: ClaimPushPayload,
  uid: string,
  forDID: string
): Claim {
  return {
    ...pushPayload,
    messageId: pushPayload.claim_offer_id,
    remoteDid: pushPayload.from_did,
    uid,
    forDID,
  }
}

function* watchPushTokenUpdate(): any {
  yield takeLatest(PUSH_NOTIFICATION_UPDATE_TOKEN, onPushTokenUpdate)
}

export const pushNotificationReceived = (
  notification: DownloadedNotification
) => ({
  type: PUSH_NOTIFICATION_RECEIVED,
  notification,
})

export const fetchAdditionalData = (
  notificationPayload: NotificationPayload,
  notificationOpenOptions: ?NotificationOpenOptions
) => ({
  type: FETCH_ADDITIONAL_DATA,
  notificationPayload,
  notificationOpenOptions,
})

export const fetchAdditionalDataError = (error: CustomError) => ({
  type: FETCH_ADDITIONAL_DATA_ERROR,
  error,
})

export const setFetchAdditionalDataPendingKeys = (
  uid: string,
  forDID: string
) => ({
  type: FETCH_ADDITIONAL_DATA_PENDING_KEYS,
  uid,
  forDID,
})

export function* fetchAdditionalDataSaga(
  action: FetchAdditionalDataAction
): Generator<*, *, *> {
  const { forDID, uid, type, senderLogoUrl } = action.notificationPayload
  const { notificationOpenOptions } = action

  if (forDID && uid) {
    const fetchDataAlreadyExists = yield select(
      getPendingFetchAdditionalDataKey
    )
    if (fetchDataAlreadyExists && fetchDataAlreadyExists[`${uid}-${forDID}`]) {
      return
    }
    yield put(setFetchAdditionalDataPendingKeys(uid, forDID))
  }

  const vcxResult = yield* ensureVcxInitSuccess()
  if (vcxResult && vcxResult.fail) {
    yield take(VCX_INIT_SUCCESS)
  }

  if (!forDID) {
    yield put(
      fetchAdditionalDataError({
        code: 'OCS-001',
        message: 'Missing forDID in notification payload',
      })
    )
    return
  }

  // NOTE: CLOUD-BACKUP wait for push notification after createWalletBackup
  if (type === MESSAGE_TYPE.WALLET_BACKUP_READY) {
    try {
      // NOTE: CLOUD-BACKUP-STEP-2 get message
      const data = yield call(
        vcxGetAgentMessages,
        MESSAGE_RESPONSE_CODE.MESSAGE_PENDING,
        uid
      )

      let message = data.substring(1, data.length - 1)

      yield put(
        pushNotificationReceived({
          additionalData: message,
          type,
          uid,
          remotePairwiseDID: 'NA',
          forDID: 'NA',
          notificationOpenOptions,
        })
      )

      // CLOUD-BACKUP-STEP-3
      const walletHandle = yield select(getBackupWalletHandle)
      const walletBackupState = yield call(
        updateWalletBackupStateWithMessage,
        walletHandle,
        message
      )

      const { fs } = RNFetchBlob
      const documentDirectory: string = fs.dirs.DocumentDir
      const backupTimeStamp = moment().format('YYYY-MM-DD-HH-mm-ss')
      let destinationZipPath: string = `${documentDirectory}/${WALLET_FILE_NAME}-${backupTimeStamp}.zip`

      // NOTE: similar logic is shareBackupSaga, not sure if this is needed
      // if (Platform.OS === 'android') {
      //   destinationZipPath = `file://${destinationZipPath}`
      // }

      // NOTE: CLOUD-BACKUP-STEP-4
      yield call(backupWalletBackup, walletHandle, destinationZipPath)
      return
    } catch (error) {
      customLogger.error(`MESSAGE_TYPE.WALLET_BACKUP_READY: ${error}`)
      yield put(cloudBackupFailure('error'))
      return
    }
  }

  if (type === WALLET_BACKUP_FAILURE) {
    yield put(
      pushNotificationReceived({
        pushNotifMsgText: action.notificationPayload.pushNotifMsgText,
        pushNotifMsgTitle: action.notificationPayload.pushNotifMsgTitle,
        uid,
        type,
        remotePairwiseDID: 'NA',
        forDID: 'NA',
        additionalData: {},
        notificationOpenOptions,
      })
    )
    walletSet(AUTO_CLOUD_BACKUP_ENABLED, 'false')
    safeSet(AUTO_CLOUD_BACKUP_ENABLED, 'false')
    safeSet(WALLET_BACKUP_FAILURE, 'true')
    yield put(setAutoCloudBackupEnabled(false))
    yield put(viewedWalletError(false))
    yield put(cloudBackupFailure(WALLET_BACKUP_FAILURE))
    return
  }

  // NOTE: CLOUD-BACKUP wait for push notification after backupWalletBackup
  if (type === MESSAGE_TYPE.WALLET_BACKUP_ACK) {
    try {
      //  NOTE: CLOUD-BACKUP-STEP-5
      const data = yield call(
        vcxGetAgentMessages,
        MESSAGE_RESPONSE_CODE.MESSAGE_PENDING,
        uid
      )

      let message = data.substring(1, data.length - 1)
      yield put(
        pushNotificationReceived({
          additionalData: message,
          type,
          uid,
          remotePairwiseDID: 'NA',
          forDID: 'NA',
          notificationOpenOptions,
        })
      )

      // NOTE: CLOUD-BACKUP-STEP-6
      const walletHandle = yield select(getBackupWalletHandle)
      const walletBackupState = yield call(
        updateWalletBackupStateWithMessage,
        walletHandle,
        message
      )

      // NOTE: CLOUD-BACKUP-STEP-7 serialization(NOT IMPLEMENTED)

      const lastSuccessfulCloudBackup = moment().format()
      yield put(connectionHistoryBackedUp())
      safeSet(LAST_SUCCESSFUL_CLOUD_BACKUP, lastSuccessfulCloudBackup)
      yield put(cloudBackupSuccess(lastSuccessfulCloudBackup))
      return
    } catch (error) {
      customLogger.error(`MESSAGE_TYPE.WALLET_BACKUP_ACK: ${error}`)
      yield put(cloudBackupFailure('error'))
      return
    }
  }

  const connection: {
    remotePairwiseDID: string,
    remoteName: string,
  } & Connection = yield select(getRemotePairwiseDidAndName, forDID)

  if (!connection.remotePairwiseDID || !connection.vcxSerializedConnection) {
    yield put(
      fetchAdditionalDataError({
        code: 'OCS-002',
        message: 'No pairwise connection found',
      })
    )

    return
  }

  const connectionHandle = yield call(
    getHandleBySerializedConnection,
    connection.vcxSerializedConnection
  )

  try {
    let additionalData:
      | ClaimOfferPushPayload
      | ProofRequestPushPayload
      | ClaimPushPayload
      | ClaimPushPayloadVcx
      | QuestionPayload
      | null = null

    if (type === MESSAGE_TYPE.CLAIM_OFFER) {
      const vcxSerializedClaimOffer: SerializedClaimOffer | null = yield select(
        getSerializedClaimOffer,
        forDID,
        uid
      )
      if (!vcxSerializedClaimOffer) {
        const {
          claimHandle,
          claimOffer,
        }: CxsCredentialOfferResult = yield call(
          downloadClaimOffer,
          connectionHandle,
          uid,
          uid
        )
        additionalData = claimOffer
        yield fork(saveSerializedClaimOffer, claimHandle, forDID, uid)
      }
    }

    if (type === MESSAGE_TYPE.CLAIM) {
      // as per vcx apis we are not downloading claim
      // we will update state of existing claim offer instance
      // and vcx will internally download claim and store inside wallet
      additionalData = {
        connectionHandle,
      }
    }

    if (type === MESSAGE_TYPE.PROOF_REQUEST) {
      additionalData = yield call(
        downloadProofRequest,
        uid,
        connectionHandle,
        uid
      )
    }

    // toLowerCase here to handle type 'question' and 'Question'
    if (type.toLowerCase() === MESSAGE_TYPE.QUESTION.toLowerCase()) {
      const data = yield call(
        downloadMessages,
        MESSAGE_RESPONSE_CODE.MESSAGE_PENDING,
        uid,
        forDID
      )
      if (data && data.length != 0) {
        const parsedData: DownloadedConnectionsWithMessages = JSON.parse(data)
        const messages: Array<DownloadedMessage> = traverseAndGetAllMessages(
          parsedData
        )
        const {
          pushNotifMsgTitle,
          pushNotifMsgText,
        } = action.notificationPayload
        for (let i = 0; i < messages.length; i++) {
          additionalData = convertDecryptedPayloadToQuestion(
            connectionHandle,
            messages[i].decryptedPayload ? messages[i].decryptedPayload : '',
            uid,
            forDID,
            messages[i].senderDID,
            pushNotifMsgTitle ? pushNotifMsgTitle : '',
            pushNotifMsgText ? pushNotifMsgText : ''
          )
        }
      }
    }

    // do something with data, probably get the message here

    if (!additionalData) {
      // we did not get any data or either push notification type is not supported
      return
    }

    const remoteName = connection.remoteName
    const remotePairwiseDID = connection.remotePairwiseDID
    const senderImage = connection.logoUrl

    // NOTE: We need to wait for the app to be unlocked before
    // dispatching the pushNotificationReceived action. Also, we
    // delay for a few milliseconds after the app is unlocked to
    // wait for the route updates to the home/dashboard screen
    const isAppLocked: boolean = yield select(getIsAppLocked)
    if (isAppLocked) {
      yield take(UNLOCK_APP)
    }
    yield call(delay, 600)

    yield put(
      pushNotificationReceived({
        type,
        additionalData: {
          ...additionalData,
          remoteName,
          senderLogoUrl: senderImage,
        },
        uid,
        senderLogoUrl,
        remotePairwiseDID,
        forDID,
        notificationOpenOptions,
      })
    )
  } catch (e) {
    customLogger.log(e)
    captureError(e)
    yield put(
      fetchAdditionalDataError({
        code: 'OCS-000',
        message: 'Invalid additional data',
      })
    )
  }
}

export const updatePayloadToRelevantStoreAndRedirect = (
  notification: DownloadedNotification
) => ({
  type: UPDATE_RELEVANT_PUSH_PAYLOAD_STORE_AND_REDIRECT,
  notification,
})

export const updatePayloadToRelevantStore = (
  notification: DownloadedNotification
) => ({
  type: UPDATE_RELEVANT_PUSH_PAYLOAD_STORE,
  notification,
})

export const goToUIScreen = (
  uiType: string,
  uid: string,
  navigation: $PropertyType<ReactNavigation, 'navigation'>
) => ({
  type: 'GO_TO_UI_SCREEN',
  uiType,
  uid,
  navigation,
})

function* watchUpdateRelevantPushPayloadStoreAndRedirect(): any {
  yield takeEvery(UPDATE_RELEVANT_PUSH_PAYLOAD_STORE_AND_REDIRECT, function*({
    notification,
  }: updatePayloadToRelevantStoreAndRedirectAction) {
    yield* updatePayloadToRelevantStoreSaga(notification)
    yield* redirectToRelevantScreen({ ...notification, uiType: null })
    const { forDID: pairwiseDID, uid } = notification
    const directStatusUpdateMessageTypes = [
      MESSAGE_TYPE.PROOF_REQUEST,
      MESSAGE_TYPE.QUESTION,
      MESSAGE_TYPE.QUESTION.toLowerCase(),
    ]
    if (directStatusUpdateMessageTypes.indexOf(notification.type) > -1) {
      yield* updateMessageStatus([{ pairwiseDID, uids: [uid] }])
    }
  })
}

export function* watchGoToUIScreen(): any {
  yield takeEvery('GO_TO_UI_SCREEN', redirectToRelevantScreen)
}

export function* updatePayloadToRelevantStoreSaga(
  message: DownloadedNotification
): Generator<*, *, *> {
  const {
    type,
    additionalData,
    uid,
    senderLogoUrl,
    remotePairwiseDID,
    forDID,
  } = message
  if (type) {
    switch (type) {
      case MESSAGE_TYPE.CLAIM_OFFER:
        yield put(
          claimOfferReceived(
            convertClaimOfferPushPayloadToAppClaimOffer(additionalData),
            {
              uid,
              senderLogoUrl,
              remotePairwiseDID,
            }
          )
        )

        break
      case MESSAGE_TYPE.PROOF_REQUEST:
        yield put(
          proofRequestReceived(
            convertProofRequestPushPayloadToAppProofRequest(additionalData),
            {
              uid,
              senderLogoUrl,
              remotePairwiseDID,
            }
          )
        )
        break
      case MESSAGE_TYPE.CLAIM:
        yield put(
          claimReceivedVcx({
            connectionHandle: additionalData.connectionHandle,
            uid,
            type,
            forDID,
            remotePairwiseDID,
          })
        )
        break
      case MESSAGE_TYPE.QUESTION:
        yield put(questionReceived(additionalData))
        break
    }
  }
}

function* redirectToRelevantScreen(notification: RedirectToRelevantScreen) {
  const {
    additionalData,
    uiType,
    type,
    uid,
    notificationOpenOptions,
    remotePairwiseDID,
    forDID,
  } = notification
  const currentScreen: string = yield select(getCurrentScreen)

  if (uiType || type) {
    if (!blackListedRoute[currentScreen]) {
      let routeToDirect = null
      let notificationText = ''
      switch (uiType || type) {
        case 'CLAIM_OFFER_RECEIVED':
        case MESSAGE_TYPE.CLAIM_OFFER:
          routeToDirect = claimOfferRoute
          notificationText = `Offering ${additionalData.claim_name}`
          break

        case MESSAGE_TYPE.PROOF_REQUEST:
        case 'PROOF_REQUEST_RECEIVED':
          routeToDirect = proofRequestRoute
          notificationText = `${
            additionalData.remoteName
          } wants you to share information`
          break

        case MESSAGE_TYPE.QUESTION:
          routeToDirect = questionRoute
          notificationText = `${additionalData.messageTitle}`
          break
      }

      if (routeToDirect) {
        yield handleRedirection(
          routeToDirect,
          {
            uid,
            notificationOpenOptions,
            senderDID: remotePairwiseDID,
            image: additionalData.senderLogoUrl,
            senderName: additionalData.remoteName,
            messageType: type,
            identifier: forDID,
          },
          notification,
          notificationText
        )
      }
    }
  }
}

function* handleRedirection(
  routeName: string,
  params: NavigationParams,
  notification: RedirectToRelevantScreen,
  notificationText: string
): any {
  const isAppLocked: boolean = yield select(getIsAppLocked)
  if (isAppLocked) {
    yield put(
      addPendingRedirection([
        { routeName: homeTabRoute },
        { routeName, params },
      ])
    )
  } else if (
    params.notificationOpenOptions &&
    params.notificationOpenOptions.openMessageDirectly
  ) {
    // if we find that we can open notification directly
    // i.e. we received this notification from user tapping on notification
    // from notification center outside of the app
    // then we want user to go connection details screen of particular notification
    // and then inside connection details screen, we want to show message
    // that belongs to this notification
    yield put(navigateToRoutePN(connectionHistRoute, params))
  } else {
    // if we find that we did not have indication to open notification directly
    // that means we need to show in-app notification that we have received a message
    yield put(
      showInAppNotification({
        senderName: params.senderName,
        senderImage: params.image,
        senderDID: params.senderDID,
        text: notificationText,
        messageType: notification.type,
        messageId: params.uid,
        identifier: notification.forDID,
      })
    )
  }
}

export const navigateToRoutePN = (
  routeName: string,
  params: GenericObject
) => ({
  type: 'NAVIGATE_TO_ROUTE',
  routeName,
  params,
})

export const clearNavigateToRoutePN = () => ({
  type: 'CLEAR_NAVIGATE_TO_ROUTE',
})

function* watchFetchAdditionalData(): any {
  yield takeEvery(FETCH_ADDITIONAL_DATA, fetchAdditionalDataSaga)
}

export const hydratePushToken = (token: string): HydratePushTokenAction => ({
  type: HYDRATE_PUSH_TOKEN,
  token,
})

export function* hydratePushTokenSaga(): Generator<*, *, *> {
  try {
    const token = yield call(safeGet, PUSH_COM_METHOD)
    if (token) {
      yield put(hydratePushToken(token))
    }
  } catch (e) {
    // capture error for safe get
    captureError(e)
    customLogger.error(`hydratePushTokenSaga: ${e}`)
  }
}

export function* savePushTokenSaga(pushToken: string): Generator<*, *, *> {
  try {
    yield call(safeSet, PUSH_COM_METHOD, pushToken)
  } catch (e) {
    // Need to figure out what should be done if storage fails
    customLogger.error(`savePushTokenSaga: ${e}`)
  }
}

export function* watchPushNotification(): any {
  yield all([
    watchPushTokenUpdate(),
    watchFetchAdditionalData(),
    watchGoToUIScreen(),
    watchUpdateRelevantPushPayloadStoreAndRedirect(),
  ])
}

export default function pushNotification(
  state: PushNotificationStore = initialState,
  action: PushNotificationAction
) {
  switch (action.type) {
    case PUSH_NOTIFICATION_PERMISSION:
      return {
        ...state,
        isAllowed: action.isAllowed,
      }
    case HYDRATE_PUSH_TOKEN:
    case PUSH_NOTIFICATION_UPDATE_TOKEN:
      return {
        ...state,
        pushToken: action.token,
        isAllowed: true,
      }
    case FETCH_ADDITIONAL_DATA:
      return {
        ...state,
        isPristine: false,
        isFetching: true,
      }
    case FETCH_ADDITIONAL_DATA_ERROR:
      return {
        ...state,
        isPristine: false,
        isFetching: false,
        error: action.error,
      }
    case PUSH_NOTIFICATION_RECEIVED:
      return {
        ...state,
        notification: action.notification,
      }
    case FETCH_ADDITIONAL_DATA_PENDING_KEYS:
      return {
        ...state,
        pendingFetchAdditionalDataKey: {
          ...state.pendingFetchAdditionalDataKey,
          [`${action.uid}-${action.forDID}`]: true,
        },
      }
    case RESET:
      return {
        ...state,
        notification: null,
        error: null,
      }
    case 'NAVIGATE_TO_ROUTE':
      return {
        ...state,
        navigateRoute: {
          routeName: action.routeName,
          params: action.params,
        },
      }
    case 'CLEAR_NAVIGATE_TO_ROUTE':
      return {
        ...state,
        navigateRoute: null,
      }
    default:
      return state
  }
}
