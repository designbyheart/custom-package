// @flow
import {
  SOME_CLOUD_RESTORE_START_ACTION,
  CloudRestoreStatus,
  initialState,
  RESTORE_CLOUD_SUBMIT_PASSPHRASE,
  RESET_ERROR,
  SET_CLOUD_RESTORE_MESSAGE,
} from './cloud-restore-type'
import type { RestoreCloudSubmitPassphraseAction } from './cloud-restore-type'
import { unzip } from 'react-native-zip-archive'
import { pinHash as generateKey, generateSalt } from '../lock/pin-hash'
import type { RestoreSubmitPassphrase } from '../restore/type-restore'
import { WALLET_FILE_NAME } from '../backup/type-backup'
import {
  takeLatest,
  all,
  put,
  call,
  take,
  select,
  fork,
} from 'redux-saga/effects'
import {
  ERROR_RESTORE,
  DECRYPT_FAILED_MESSAGE,
  RestoreStatus,
} from '../restore/type-restore'
import {
  restoreWallet,
  simpleInit,
  vcxShutdown,
} from '../bridge/react-native-cxs/RNCxs'
import { getRestoreFileName } from '../store/store-selector'
import RNFetchBlob from 'rn-fetch-blob'
import {
  getWalletItem,
  walletGet,
  safeSet,
  secureSet,
} from '../services/storage'
import { PASSPHRASE_SALT_STORAGE_KEY, PASSPHRASE_STORAGE_KEY } from '../common'
import { PIN_ENABLED_KEY, IN_RECOVERY } from '../lock/type-lock'
import { hydrate, hydrateNonReduxData } from '../store/hydration-store'
import firebase from 'react-native-firebase'
import { pushNotificationPermissionAction } from '../push-notification/push-notification-store'
import { customLogger } from '../store/custom-logger'
import { restoreStatus } from '../restore/restore-store'
import { captureError } from '../services/error/error-handler'
import { ensureVcxInitSuccess } from '../store/route-store'
import { generateRecoveryPhraseSuccess } from '../backup/backup-store'
import { vcxInitReset } from '../store/config-store'

export const errorRestore = (error: string) => ({
  type: ERROR_RESTORE,
  error,
})

export function* cloudRestore(
  action: RestoreCloudSubmitPassphraseAction
): Generator<*, *, *> {
  try {
    // try to loacte the cloud backup...
    const { passphrase } = action
    const salt = yield call(generateSalt, false)
    const hashedPassphrase = yield call(
      generateKey,
      passphrase,
      salt //use hardcoded salt
    )
    const { fs } = RNFetchBlob
    const restoreDirectoryPath = `${fs.dirs.DocumentDir}/restoreDirectory`
    fs.mkdir(restoreDirectoryPath)
    let walletFilePath = `${restoreDirectoryPath}/${WALLET_FILE_NAME}.wallet`
    // ensurevcxint
    const vcxResult = yield* ensureVcxInitSuccess()
    if (vcxResult && vcxResult.fail) {
      throw new Error(JSON.stringify(vcxResult.fail.message))
    }

    yield put(setCloudRestoreMessage('Downloading backup'))
    yield call(restoreWallet, walletFilePath, hashedPassphrase)
    yield put(setCloudRestoreMessage('Restoring wallet'))

    yield call(vcxShutdown, false) //true
    yield put(vcxInitReset())

    // copied from restoreFileDecrypt
    yield put(restoreStatus(RestoreStatus.FILE_DECRYPT_SUCCESS))

    // since we have decrypted file successfully, now we restore data from wallet
    // Need to set this here manually, because in normal flow this flag
    // will be set when user sets pin code. However, since user is importing
    // wallet file, we know that user has already enabled pin code
    // so we set this flag manually
    yield call(safeSet, IN_RECOVERY, 'true')
    yield call(safeSet, PIN_ENABLED_KEY, 'true')
    yield* hydrate()
    // hydrate data in secure storage which is not put in store by hydrate saga
    yield fork(hydrateNonReduxData)

    try {
      //Push Notification permissions are asked when we do our first connection
      //but in this case if connections are imported from backup then that case is missed
      //since connection is already there
      // so after push token update
      // we need to do requestPermission or else push notifications won't come
      const requestPushNotificationPermission = () => {
        firebase.messaging().requestPermission()
      }
      yield call(requestPushNotificationPermission)
      yield put(pushNotificationPermissionAction(true))
    } catch (e) {
      // even if we user does not give permission for push notification
      // we should not be stopping from restore success event
      customLogger.log(
        'Push notification permission failed while restoring backup'
      )
    }
    yield put(restoreStatus(RestoreStatus.RESTORE_DATA_STORE_SUCCESS))
    // } catch (e) {
    //   captureError(e)
    //   yield put(errorRestore(DECRYPT_FAILED_MESSAGE(e.message)))
    // }
  } catch (e) {
    yield put(
      errorRestore(
        'Error locating backup, plese try enter recover phrase again'
      )
    )
  }
  // Downloading cloud backup...
  // Decrypting cloud backup..
  // Restoring cloud backup...
}

export const resetError = () => ({
  type: RESET_ERROR,
})

export const submitPassphrase = (passphrase: string) => ({
  type: RESTORE_CLOUD_SUBMIT_PASSPHRASE,
  passphrase,
})

export const setCloudRestoreMessage = (message: string) => ({
  type: SET_CLOUD_RESTORE_MESSAGE,
  message,
})
export function* watchCloudRestore(): any {
  yield all([cloudRestoreSaga()])
}

export function* cloudRestoreSaga(): any {
  yield takeLatest(RESTORE_CLOUD_SUBMIT_PASSPHRASE, cloudRestore)
}

export default function cloudRestoreReducer(
  // state: CloudRestoreStore = initialState,
  state: any = initialState,
  // action: CloudRestoreActions
  action: any
) {
  switch (action.type) {
    case RESTORE_CLOUD_SUBMIT_PASSPHRASE:
      return {
        ...state,
        status: CloudRestoreStatus.LOCATING_BACKUP_START,
        message: 'Locating your backup...',
        passphrase: action.passphrase,
        error: null,
      }
    case ERROR_RESTORE:
      return {
        ...state,
        error: action.error,
        message: 'error',
      }
    case RESET_ERROR:
      return {
        ...state,
        error: null,
        message: '',
      }
    case SET_CLOUD_RESTORE_MESSAGE:
      return {
        ...state,
        message: action.message,
      }
    default:
      return state
  }
}
