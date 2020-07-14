// @flow

import { Platform, AppState, Linking } from 'react-native'
import delay from '@redux-saga/delay-p'
import { put, take, call, select, race, all } from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'
import uniqueId from 'react-native-unique-id'
import firebase from 'react-native-firebase'
import AlertAsync from 'react-native-alert-async'

import type { PushNotificationStore } from '../../push-notification/type-push-notification'
import type { UserOneTimeInfo } from './type-user-store'
import type { RouteUpdateAction } from '../route-store'

import { flattenAsync } from '../../common/flatten-async'
import {
  getPushNotificationStore,
  getCurrentScreen,
  getIsAppLocked,
  getOfflineStatus,
} from '../store-selector'
import {
  getProvisionToken,
  createOneTimeInfoWithToken,
  createOneTimeInfo,
  vcxShutdown,
} from '../../bridge/react-native-cxs/RNCxs'
import {
  LONG_PRESSED_IN_LOCK_SELECTION_SCREEN,
  UNLOCK_APP,
} from '../../lock/type-lock'
import { safeSet, safeGet } from '../../services/storage'
import {
  invitationRoute,
  onfidoRoute,
  genRecoveryPhraseRoute,
  walletRoute,
  cloudRestoreRoute,
} from '../../common'
import { ROUTE_UPDATE, handleRouteUpdate } from '../route-store'
import { OFFLINE_STATUS } from '../../offline/type-offline'
import { pushNotificationPermissionAction } from '../../push-notification/push-notification-store'

export function* registerCloudAgentWithToken(
  agencyConfig: *
): Generator<*, *, *> {
  // When trying to register cloud agent with agency
  // we need unique id per app installation
  // and we also need push notification token from device

  // get unique device id
  const [uniqueIdError, id] = yield call(flattenAsync(uniqueId))
  if (uniqueIdError) {
    return [
      `CS-004::Could not get unique Id while trying to register cloud agent. ${uniqueIdError}`,
      null,
    ]
  }
  yield put({ type: 'REGISTER_CLOUD_AGENT_UNIQUE_ID_SUCCESS' })

  const isAppLocked: boolean = yield select(getIsAppLocked)
  if (isAppLocked) {
    // check for app to be unlocked, because if app is locked
    // then we should not ask for push notification permission
    // if we ask push permission on lock screens, then,
    // it will be bad user experience, if user get native pop up
    // while entering pass code or entering Biometric
    // so, if app is locked, we wait till app is unlocked
    yield take(UNLOCK_APP)
  }

  // From here on we are focused on business logic to show pop up dialogue
  // to user. There are three types of dialogues that we show to the user
  // One, is educating user on why we need push notification permission
  // Second, is device's native Push permission dialogue
  // Third, dialogue which pop's up if user has not given push permission

  // The business logic to show/hide those dialogues can be more deeply
  // understood by reading ./cloud-agent-readme.md

  // There are three variables which are used to identify those business
  // logics and then perform action on the basis of those values
  // These three variables are
  // - currentScreen -> decide what text we use in pop up
  // - userPreviousChoice -> indicates if user has already seen pop up
  //                         and made a choice.
  // - userCurrentChoice -> what user selected on pop up that user saw now
  let currentScreen: string = yield select(getCurrentScreen)
  if (!routesForSpecialMessage.includes(currentScreen)) {
    // if we are not on routes that needs vcx init
    // then we wait for user to go on one such route
    const action: RouteUpdateAction = yield take(isUserOnInitNeedRoute)
    currentScreen = action.currentScreen
  }

  let userCurrentChoice = null
  // check if we have already shown user the choice to allow push permission
  const [_, userPreviousChoice] = yield call(
    flattenAsync(safeGet),
    previousChoiceStorageKey
  )

  if (!userPreviousChoice) {
    if (routesForSpecialMessage.includes(currentScreen)) {
      // this falls in case #3, #4 from ./cloud-agent-readme.md
      userCurrentChoice = yield* showInitialPopUp(routeSpecificPushDialogue)
    } else {
      // this falls in case #1, #2 from ./cloud-agent-readme.md
      userCurrentChoice = yield* showInitialPopUp(genericPushDialogue)
    }
  }

  if (userPreviousChoice === DENY) {
    if (routesForSpecialMessage.includes(currentScreen)) {
      // this falls in case #10, #12
      userCurrentChoice = yield* showInitialPopUp(routeSpecificPushDialogue)
    } else {
      // this falls in case #6
      // TODO:KS Confirm with Tyler that if we are on non special screen
      // then do we need to tell user why something is not happening
      return [
        `CS-011::User previously denied giving push notification permission, and this time user is not on a route that would ask for permission again.`,
        null,
      ]
    }
  }

  if (userPreviousChoice === ALLOW) {
    // this falls in case #5, #7, #9, #11
    userCurrentChoice = ALLOW
  }
  // set this flag to allow once ConnectMe has push permission
  yield call(flattenAsync(safeSet), previousChoiceStorageKey, userCurrentChoice)

  if (userCurrentChoice === DENY) {
    // this falls in case #2, #4, #12, #8
    return [`CS-010::User denied push notification permission`, null]
  }

  // once we tell user the reason for asking push notification permission
  // go ahead and ask push notification permission
  const [permissionError] = yield call(flattenAsync(getPushPermission))
  const [hasPermissionError, hasPermissionResult] = yield call(
    flattenAsync(hasPushPermission)
  )
  if (permissionError || hasPermissionError || !hasPermissionResult) {
    // if user does not provide push notification permission
    // then tell user that they won't be able to establish a connection or take a backup
    const permissionChoice: string = yield call(
      AlertAsync,
      'Denied permission',
      'You would not be able to establish connection. If you need to establish connection, you can enable push notification permission in your phone settings for ConnectMe.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => 'settings' },
      ],
      { cancelable: true }
    )

    if (permissionChoice !== 'settings') {
      // if user cancels, then just return from here
      return [
        `CS-009::User denied to change settings for push notification permission`,
        null,
      ]
    }

    // We are here, that means user wants to go to app settings
    // redirect to app settings
    Linking.openSettings()

    // wait for user to come back, check for app state change
    const appStateChannel = yield call(appStateSource)
    while (true) {
      const state: string = yield take(appStateChannel)
      if (state === 'active') {
        // close channel, as we are not interested anymore to listen
        // for state changes, since state has become 'active'
        appStateChannel.close()

        // user has come back from settings, check permissions again
        const [
          secondCheckHasPermissionError,
          secondCheckHasPermissionResult,
        ] = yield call(flattenAsync(hasPushPermission))
        if (secondCheckHasPermissionError || !secondCheckHasPermissionResult) {
          // even when user came back from settings,
          // ConnectMe still does not have permission, exit and return error
          return [
            `CS-012::User came back from settings, and app still does not have push permission`,
            null,
          ]
        }

        // if ConnectMe got permission, then proceed further
        break
      }
    }
  }
  yield put({ type: 'REGISTER_CLOUD_AGENT_PUSH_PERMISSION_SUCCESS' })

  // if user provides push notification permission
  // then go ahead and get token from firebase
  // if getting token from firebase takes more than 1 minute
  // then cancel the task and return error
  // race timeout and getFirebaseToken
  const [
    [notificationTokenError, notificationToken],
    refreshedNotificationToken,
    getTokenTimeout,
  ] = yield race([
    call(flattenAsync(getFirebaseToken)),
    call(onTokenRefresh),
    call(delay, 60000),
  ])
  if (!notificationToken && !refreshedNotificationToken) {
    // if we don't get either notification token
    // to notification token from onRefresh, then we raise error
    const permissionChoice = yield call(
      AlertAsync,
      'Notification Error',
      'Failed to get push notification permission. Please shake you device and send logs to our customer support.',
      [{ text: 'OK' }],
      { cancelable: true }
    )
    return [
      `CS-006::Failed to get notification token, ${
        notificationTokenError || getTokenTimeout || ''
      }`,
      null,
    ]
  }

  // We might get notification token either from getToken, or from onRefresh
  const fcmNotificationToken = notificationToken || refreshedNotificationToken
  if (!fcmNotificationToken) {
    return [
      `CS-013::Did not receive token from either getToken or onRefresh`,
      null,
    ]
  }
  yield put({
    type: 'REGISTER_CLOUD_AGENT_NOTIFICATION_TOKEN_RECEIVED',
    fcmNotificationToken,
  })
  // update push permission flag in push-notification store
  yield put(pushNotificationPermissionAction(true))

  // get provision Token
  const [provisionTokenError, provisionToken] = yield* askForProvisionToken(
    fcmNotificationToken,
    agencyConfig,
    id
  )
  if (provisionTokenError || !provisionToken) {
    return [provisionTokenError || `CS-015::Error provisioning token`, null]
  }

  // Since in previous vcx API call, we used wallet
  // we need to close wallet and other open handles
  yield call(flattenAsync(vcxShutdown), true)

  // Now, we have provision token which can be used to register/provision cloud agent
  const [createOneTimeInfoError, userOneTimeInfo]: [
    null | string,
    null | UserOneTimeInfo
  ] = yield call(createOneTimeInfoWithToken, agencyConfig, provisionToken)
  if (createOneTimeInfoError) {
    return [
      `CS-008::Error calling createOneTimeInfoWithToken: ${createOneTimeInfoError}`,
      null,
    ]
  }

  return [null, userOneTimeInfo]
}

export function* registerCloudAgentWithoutToken(
  agencyConfig: *
): Generator<*, *, *> {
  const oneTimeInfoResult = yield call(createOneTimeInfo, agencyConfig)

  return oneTimeInfoResult
}

function getPushPermission() {
  return new Promise((resolve, reject) =>
    firebase.messaging().requestPermission().then(resolve).catch(reject)
  )
}

function hasPushPermission() {
  return new Promise((resolve, reject) =>
    firebase.messaging().hasPermission().then(resolve).catch(reject)
  )
}

function getFirebaseToken() {
  return new Promise((resolve, reject) =>
    firebase.messaging().getToken().then(resolve).catch(reject)
  )
}

function* showInitialPopUp({
  title,
  text,
}: {
  title: string,
  text: string,
}): Generator<*, *, *> {
  if (Platform.OS === 'android') {
    return ALLOW
  }

  const userChoice = yield call(
    AlertAsync,
    title,
    text,
    [
      { text: DENY, style: 'destructive', onPress: () => DENY },
      { text: ALLOW, style: 'default', onPress: () => ALLOW },
    ],
    { cancelable: false }
  )

  return userChoice
}

function isUserOnInitNeedRoute(action: *) {
  return (
    action.type === ROUTE_UPDATE &&
    routesForSpecialMessage.includes(action.currentScreen)
  )
}

function appStateSource() {
  let currentState = AppState.currentState || 'background'

  return eventChannel((emitter) => {
    const _stateChangeListener = (nextAppState) => {
      if (
        currentState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        emitter(nextAppState)
      }
      currentState = nextAppState
    }
    AppState.addEventListener('change', _stateChangeListener)

    // return an unsubscribe function
    return () => {
      // remove listeners
      AppState.removeEventListener('change', _stateChangeListener)
    }
  })
}

function onTokenRefresh() {
  return new Promise((resolve) => firebase.messaging().onTokenRefresh(resolve))
}

function* askForProvisionToken(
  notificationToken: string,
  agencyConfig: *,
  id: *
): Generator<*, *, *> {
  let i = 0
  while (i < 2) {
    // We re-try only 2 times, after that we exit loop
    i++

    // we need to delete wallet or vcx data if vcx already created
    // wallet or other objects, because we need to re-try getting token
    // to call getProvisionToken vcx API call, Connectme needs to ensure that
    // there is no wallet or config inside vcx, so we delete existing stuff
    yield call(flattenAsync(vcxShutdown), true)

    // Now, we have both unique id and notification token
    // let us get provisioning token from our agency
    // to get provisioning token from our agency, we need to make an API call to vcx
    const [provisionTokenError] = yield call(getProvisionToken, agencyConfig, {
      type: 1, // 1 means push notification, its the only one registered
      id,
      value: `FCM:${notificationToken}`,
    })
    if (provisionTokenError) {
      // if we get an error while calling getProvisionToken API call
      // stop processing further, and raise error
      return [
        `CS-007::Error calling getProvisionToken vcx API call ${provisionTokenError}`,
        null,
      ]
    }
    yield put({ type: 'REGISTER_CLOUD_AGENT_GET_PROVISION_API_SUCCESS' })

    // Now, we wait for agency to send push notification to this device
    // or stop waiting after 1 minute
    const [
      {
        notificationPayload: { msg: provisionToken },
      },
      timeout,
    ] = yield race([take('FETCH_ADDITIONAL_DATA'), call(delay, 60000)])

    const offline: boolean = yield select(getOfflineStatus)
    if (offline) {
      // check if we still have internet connectivity, if there is no internet
      // then we wait for internet to come back online
      yield take(isOnline)
    }

    if (timeout) {
      // if ConnectMe does not receive push notification even after 1 minute
      // then, we ask agency to send push notification again
      continue
    }

    return [null, provisionToken]
  }

  return [
    'CS-014::Tried 2 times to get provision token and still did not receive token',
    null,
  ]
}

function isOnline(action: *) {
  return action.type === OFFLINE_STATUS && action.offline === false
}

const ALLOW = 'Allow'
const DENY = 'Deny'
export const previousChoiceStorageKey = 'previousChoiceResult'
const genericPushDialogue = {
  title: 'Register device',
  text:
    'Connect.Me works best with push notification permissions. You can receive alerts much faster and never miss an important message.',
}
const routeSpecificPushDialogue = {
  title: 'Push notifications needed',
  text:
    'Push notifications are needed to make connections. You do not need a username and password to use Connect.Me. But because of this, Connect.Me needs push notification permissions to register your unique device and prevent spam. You can turn off push notifications in Settings at any time.',
}
// TODO:KS Confirm with Tyler about other screens as well
// screens such as Onfido, Backup, Cloud Restore, Token
const routesForSpecialMessage = [
  invitationRoute,
  onfidoRoute,
  genRecoveryPhraseRoute,
  walletRoute,
  cloudRestoreRoute,
]
