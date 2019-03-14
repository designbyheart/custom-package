// @flow

import { Dimensions, PixelRatio, Platform } from 'react-native'

const windowSize = Dimensions.get('window')
const WINDOW_WIDTH = windowSize.width
const WINDOW_HEIGHT = windowSize.height

//default values for connect me
const bottomNavBarHeight = 50
//const bottomBlurNavBarHeight = 48;
let bottomBlurNavBarHeight
switch (WINDOW_HEIGHT) {
  case 812:
    bottomBlurNavBarHeight = 82
    break
  default:
    bottomBlurNavBarHeight = 48
}

export default {
  WINDOW_WIDTH: WINDOW_WIDTH,
  WINDOW_HEIGHT: WINDOW_HEIGHT,
  bottomNavBarHeight,
  bottomBlurNavBarHeight,
}
