// @flow
import DeviceInfo from 'react-native-device-info'
import { Dimensions, Platform } from 'react-native'
import { isIphoneX, isIphoneXR } from './constant'

const windowSize = Dimensions.get('screen')
const WINDOW_HEIGHT = windowSize.height
const connectionDetailsNav = 175

const deviceModel = DeviceInfo.getModel()

let bottomNavBarHeight
let bottomBlurNavBarHeight
let settingsHeader

if (isIphoneXR) {
  bottomNavBarHeight = 84
  bottomBlurNavBarHeight = 64
} else if (isIphoneX) {
  bottomNavBarHeight = 60
  bottomBlurNavBarHeight = 59
} else {
  bottomNavBarHeight = 60
  bottomBlurNavBarHeight = 59
}

if (isIphoneXR || isIphoneX) {
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
