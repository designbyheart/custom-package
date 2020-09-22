// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'

import type { RequestDetailTextProps } from './type-request'

import { CustomView } from '../layout/custom-view'
import CustomText from '../text'
import { OFFSET_1X, OFFSET_3X } from '../../common/styles'

export const RequestDetailText = (props: RequestDetailTextProps) => {
  const { testID } = props
  return (
    <View
      testID={`${testID}-text-container-animation`}
      accessible={true}
      accessibilityLabel={`${testID}-text-container-animation`}
    >
      <CustomView center testID={`${testID}-text-container-message-title`}>
        <CustomText
          testID={`${testID}-text-title`}
          h4
          center
          thick
          bg="fifth"
          style={[styles.textTitle]}
          testID={`${testID}-text-container-title`}
        >
          {props.title}
        </CustomText>
        <CustomText
          h5
          center
          bold
          bg="fifth"
          style={[styles.textMessage]}
          testID={`${testID}-text-container-message`}
        >
          {props.message}
        </CustomText>
      </CustomView>
    </View>
  )
}

const styles = StyleSheet.create({
  textMessage: {
    margin: OFFSET_1X,
  },
  textTitle: {
    marginVertical: OFFSET_1X,
    marginHorizontal: OFFSET_3X,
    lineHeight: OFFSET_3X,
  },
})
