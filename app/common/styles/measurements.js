// @flow

import { Dimensions, Platform } from 'react-native'
import { isIphoneX } from './constant'

const windowSize = Dimensions.get('screen')
const WINDOW_HEIGHT = windowSize.height

let bottomNavBarHeight = isIphoneX ? 84 : 60
let bottomBlurNavBarHeight = isIphoneX ? 83 : 59
let connectionDetailsNav = 175
let settingsHeader

if (isIphoneX) {
  settingsHeader = 200
} else {
  settingsHeader = 180
}

export const measurements = {
  WINDOW_HEIGHT,
  bottomNavBarHeight,
  bottomBlurNavBarHeight,
  connectionDetailsNav,
  settingsHeader,
}
