// @flow

import { Dimensions, Platform } from 'react-native'
import { iPhoneXHeight } from './constant'

const windowSize = Dimensions.get('window')
const WINDOW_HEIGHT = windowSize.height

//default nav bar height value for connect me
const bottomNavBarHeight = 50
let bottomBlurNavBarHeight
//Ios responsive calculation for blur effect, we dont use blur effect on android
switch (WINDOW_HEIGHT) {
  case iPhoneXHeight:
    bottomBlurNavBarHeight = 82
    break
  default:
    bottomBlurNavBarHeight = 48
}

export const measurements = {
  bottomNavBarHeight,
  bottomBlurNavBarHeight,
}
