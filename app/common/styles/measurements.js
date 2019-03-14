// @flow

import { Dimensions, PixelRatio, Platform } from 'react-native'
import { iPhoneXHeight } from './constant'

const windowSize = Dimensions.get('window')
const WINDOW_WIDTH = windowSize.width
const WINDOW_HEIGHT = windowSize.height

//default values for connect me
const bottomNavBarHeight = 50
let bottomBlurNavBarHeight
switch (WINDOW_HEIGHT) {
  case iPhoneXHeight:
    bottomBlurNavBarHeight = 82
    break
  default:
    bottomBlurNavBarHeight = 48
}

export const measurements = {
  WINDOW_WIDTH: WINDOW_WIDTH,
  WINDOW_HEIGHT: WINDOW_HEIGHT,
  bottomNavBarHeight,
  bottomBlurNavBarHeight,
}
