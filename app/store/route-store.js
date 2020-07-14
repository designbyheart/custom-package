// @flow
import { splashScreenRoute } from '../common/route-constants'
import type { RouteStore } from './type-store'
import type { InitialTestAction } from '../common/type-common'
import {
  VCX_INIT_SUCCESS,
  VCX_INIT_FAIL,
  VCX_INIT_NOT_STARTED,
  VCX_INIT_START,
} from './type-config-store'
import { getVcxInitializationState } from './store-selector'
import { put, take, race, select } from 'redux-saga/effects'

export type RouteStoreAction = typeof handleRouteUpdate | InitialTestAction

const initialState = {
  currentScreen: splashScreenRoute,
  timeStamp: new Date().getTime(),
}

export const ROUTE_UPDATE = 'ROUTE_UPDATE'

export const handleRouteUpdate = (currentScreen: string) => ({
  type: ROUTE_UPDATE,
  currentScreen,
})

export type RouteUpdateAction = {
  type: typeof ROUTE_UPDATE,
  currentScreen: string,
}

export default function routeReducer(
  state: RouteStore = initialState,
  action: RouteStoreAction
) {
  switch (action.type) {
    case ROUTE_UPDATE:
      return {
        currentScreen: action.currentScreen,
        timeStamp: new Date().getTime(),
      }
    default:
      return state
  }
}

export const vcxInitStart = () => ({
  type: VCX_INIT_START,
})

export function* ensureVcxInitSuccess(): Generator<*, *, *> {
  // vcx init ensures that
  // -- app is hydrated
  // -- user one time info is available
  // -- vcx initialization was success

  const vcxInitializationState = yield select(getVcxInitializationState)
  if (vcxInitializationState === VCX_INIT_SUCCESS) {
    // if already initialized, no need to process further
    return
  }

  if ([VCX_INIT_NOT_STARTED, VCX_INIT_FAIL].includes(vcxInitializationState)) {
    // if vcx init not started or vcx init failed and we want to init again
    yield put(vcxInitStart())
  }

  // if we are here, that means we either started vcx init
  // or vcx init was already in progress and now we need to wait for success
  return yield race({
    success: take(VCX_INIT_SUCCESS),
    fail: take(VCX_INIT_FAIL),
  })
}
