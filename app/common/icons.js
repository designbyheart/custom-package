// @flow
import React from 'react'
import { Icon } from 'react-native-eva-icons'
import { colors } from './styles/constant'
import { moderateScale } from 'react-native-size-matters'

type IconProps = {
  width?: number,
  height?: number,
  color?: string,
  style?: any,
}

type CommonIconProps = {
  name: string,
} & IconProps

export const HOME_ICON = 'home-outline'
export const CONNECTIONS_ICON = 'people-outline'
export const CREDENTIALS_ICON = 'home-outline'
export const SETTINGS_ICON = 'settings-2-outline'

export const CAMERA_ICON = 'camera-outline'
export const CHECK_MARK_ICON = 'checkmark-circle-2-outline'
export const HOME_MENU_ICON = 'menu-outline'
export const ANDROID_BACK_ARROW_ICON = 'arrow-back-outline'
export const IOS_BACK_ARROW_ICON = 'arrow-ios-back-outline'
export const MORE_ICON = 'more-vertical-outline'
export const DELETE_ICON = 'trash-2-outline'
export const CLOSE_ICON = 'close-outline'

// common icon class is implemented to set default values (except name) for icons
// in that case we should only set icon name and get an icon with default color and size
export const EvaIcon = (props: CommonIconProps) => {
  const { name, width, height, color, style } = props

  return (
    <Icon
      name={name}
      width={width ? width : moderateScale(22)}
      height={height ? height : moderateScale(22)}
      fill={color ? color : colors.cmGray2}
      style={style}
    />
  )
}
