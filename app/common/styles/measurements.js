// @flow

import { Dimensions, Platform } from 'react-native'
import { iPhoneXHeight, isIphoneX } from './constant'

const windowSize = Dimensions.get('window')
const WINDOW_HEIGHT = windowSize.height

const bottomNavBarHeight = isIphoneX ? 90 : 50
let bottomBlurNavBarHeight
let connectionDetailsNav
let settingsHeader

function isIphoneXorAbove() {
  const dimen = Dimensions.get('window')
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 ||
      dimen.width === 812 ||
      (dimen.height === 896 || dimen.width === 896))
  )
}
if (isIphoneXorAbove()) {
  settingsHeader = 224
} else {
  settingsHeader = 192
}

switch (WINDOW_HEIGHT) {
  case iPhoneXHeight:
    bottomBlurNavBarHeight = 89
    connectionDetailsNav = 175
    break
  default:
    bottomBlurNavBarHeight = 49
    connectionDetailsNav = 175
}

export const measurements = {
  WINDOW_HEIGHT,
  bottomNavBarHeight,
  bottomBlurNavBarHeight,
  connectionDetailsNav,
  settingsHeader,
}
