// @flow

import { put, take, call, select } from 'redux-saga/effects'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import AlertAsync from 'react-native-alert-async'

import { onfidoRoute } from '../../../common'
import { registerCloudAgentWithToken } from '../cloud-agent'
import {
  agencyUrl,
  agencyDID,
  agencyVerificationKey,
  poolConfig,
  paymentMethod,
  userOneTimeInfo,
} from '../../../../__mocks__/static-data'
import {
  getProvisionToken,
  createOneTimeInfoWithToken,
} from '../../../bridge/react-native-cxs/RNCxs'
import { FETCH_ADDITIONAL_DATA } from '../../../push-notification/type-push-notification'

describe('cloud-agent:saga', () => {
  const agencyConfig = {
    agencyUrl: agencyUrl,
    agencyDID: agencyDID,
    agencyVerificationKey: agencyVerificationKey,
    poolConfig,
    paymentMethod,
  }
  const unlockedState = {
    route: {
      currentScreen: onfidoRoute,
    },
    lock: {
      isAppLocked: false,
    },
    offline: {
      offline: false,
    },
  }

  it('should return success, and ask to allow push permission only on specific routes', () => {
    return expectSaga(registerCloudAgentWithToken, agencyConfig)
      .withState(unlockedState)
      .provide([
        [matchers.call.fn(AlertAsync), 'Allow'],
        [matchers.call.fn(getProvisionToken), [null, true]],
        [matchers.call.fn(createOneTimeInfoWithToken), [null, userOneTimeInfo]],
      ])
      .dispatch({
        type: FETCH_ADDITIONAL_DATA,
        notificationPayload: {
          msg: 'token-msg',
        },
      })
      .returns([null, userOneTimeInfo])
      .run()
  })

  it('should show native push permission dialogue only if app dialogue is allowed', () => {
    return expectSaga(registerCloudAgentWithToken, agencyConfig)
      .withState(unlockedState)
      .provide([
        [matchers.call.fn(AlertAsync), 'Allow'],
        [matchers.call.fn(getProvisionToken), [null, true]],
        [matchers.call.fn(createOneTimeInfoWithToken), [null, userOneTimeInfo]],
      ])
      .dispatch({
        type: FETCH_ADDITIONAL_DATA,
        notificationPayload: {
          msg: 'token-msg',
        },
      })
      .put({ type: 'REGISTER_CLOUD_AGENT_PUSH_PERMISSION_SUCCESS' })
      .returns([null, userOneTimeInfo])
      .run()
  })

  it('should return error if app dialogue is denied', () => {
    return expectSaga(registerCloudAgentWithToken, agencyConfig)
      .withState(unlockedState)
      .provide([[matchers.call.fn(AlertAsync), 'Deny']])
      .returns([`CS-010::User denied push notification permission`, null])
      .run()
  })
})
