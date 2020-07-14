// @flow
import React from 'react'
import SvgCustomIcon from '../svg-custom-icon'
import { TouchableOpacity, StyleSheet, Text, Platform } from 'react-native'
import { colors, fontFamily } from '../../common/styles/constant'
import { verticalScale, moderateScale } from 'react-native-size-matters'

import type { CameraButtonProps } from './type-camera-button'

export const CameraButton = (props: CameraButtonProps) => {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
      <SvgCustomIcon
        name="Camera"
        width={moderateScale(22)}
        height={moderateScale(22)}
        fill={colors.cmGray2}
      />
      <Text style={styles.text}>Scan</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: moderateScale(42, 3),
    height: moderateScale(42, 3),
    borderRadius: 30,
    backgroundColor: colors.cmWhite,
    position: 'absolute',
    shadowColor: colors.cmBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 8 : 0,
    zIndex: 1000,
    bottom: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily,
    fontSize: moderateScale(9, 0.1),
    color: colors.cmGray2,
  },
})
