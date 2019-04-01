// @flow

import { Dimensions, Platform } from 'react-native'
import { iPhoneXHeight } from './constant'

const windowSize = Dimensions.get('window')
const WINDOW_HEIGHT = windowSize.height

const bottomNavBarHeight = 50
let bottomBlurNavBarHeight

switch (WINDOW_HEIGHT) {
  case iPhoneXHeight:
    bottomBlurNavBarHeight = 83
    break
  default:
    bottomBlurNavBarHeight = 49
}

export const measurements = {
  bottomNavBarHeight,
  bottomBlurNavBarHeight,
}
