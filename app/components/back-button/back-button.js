// @flow

import React, { useCallback } from 'react'
import { TouchableOpacity, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { moderateScale } from 'react-native-size-matters'
import {
  EvaIcon,
  ANDROID_BACK_ARROW_ICON,
  IOS_BACK_ARROW_ICON,
} from '../../common/icons'

export const BackButton = () => {
  const navigation = useNavigation()
  const onPress = useCallback(() => {
    navigation.goBack()
  }, [])
  const iOS = Platform.OS === 'ios'
  return (
    <TouchableOpacity
      testID="back-button-component"
      onPress={onPress}
      hitSlop={hitSlop}
    >
      <EvaIcon
        name={iOS ? IOS_BACK_ARROW_ICON : ANDROID_BACK_ARROW_ICON}
        width={moderateScale(32)}
        height={moderateScale(32)}
      />
    </TouchableOpacity>
  )
}

const hitSlop = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
}
