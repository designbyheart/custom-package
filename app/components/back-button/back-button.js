// @flow

import React, { useCallback } from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SvgCustomIcon } from '../svg-custom-icon'
import { mediumGray } from '../../common/styles'

export const BackButton = () => {
  const navigation = useNavigation()
  const onPress = useCallback(() => {
    navigation.goBack()
  }, [])

  return (
    <TouchableOpacity
      testID="back-button-component"
      onPress={onPress}
      hitSlop={hitSlop}
    >
      <SvgCustomIcon name="Arrow" fill={mediumGray} />
    </TouchableOpacity>
  )
}

const hitSlop = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
}
