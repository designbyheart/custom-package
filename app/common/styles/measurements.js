// @flow

import { Dimensions, Platform } from 'react-native'
import { iPhoneXHeight, isIphoneX } from './constant'

const windowSize = Dimensions.get('window')
const WINDOW_HEIGHT = windowSize.height

const bottomNavBarHeight = isIphoneX ? 90 : 50
let bottomBlurNavBarHeight
let connectionDetailsNav

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
}
