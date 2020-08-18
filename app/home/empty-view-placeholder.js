// @flow
import React from 'react'
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import { colors, fontFamily, fontSizes } from '../common/styles/constant'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'

import { EvaIcon, CHECK_MARK_ICON } from '../common/icons'

const checkmarkImage = require('../images/homeCheckmark.png')
const { height } = Dimensions.get('screen')

export const EmptyViewPlaceholder = () => {
  return (
    <View style={styles.container}>
      <EvaIcon
        name={CHECK_MARK_ICON}
        width={moderateScale(100)}
        height={moderateScale(100)}
        color={colors.cmGray5}
      />
      <Text style={styles.infoText}>No new notifications.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingTop: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkImage: {
    width: verticalScale(80),
    height: verticalScale(80),
  },
  infoText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size4),
    fontWeight: '500',
    color: colors.cmGray3,
    marginTop: verticalScale(50),
  },
})
