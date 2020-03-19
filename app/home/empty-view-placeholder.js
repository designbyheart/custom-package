// @flow
import React from 'react'
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'
import {
  mediumGray,
  font,
  primaryHeaderHeight,
  isiPhone5,
} from '../common/styles/constant'

const checkmarkImage = require('../images/homeCheckmark.png')
const { height } = Dimensions.get('screen')

export const EmptyViewPlaceholder = () => {
  return (
    <View style={styles.container}>
      <Image style={styles.checkmarkImage} source={checkmarkImage} />
      <Text style={styles.infoText}>No new notifications.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingTop: isiPhone5 ? 30 : 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkImage: {
    width: isiPhone5 ? 80 : 100,
    height: isiPhone5 ? 80 : 100,
  },
  infoText: {
    fontFamily: font.family,
    fontSize: isiPhone5 ? font.size.M : font.size.ML,
    fontWeight: '500',
    color: mediumGray,
    marginTop: isiPhone5 ? 50 : 70,
  },
})
