// @flow
import React from 'react'
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native'

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
    height: height * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkImage: {
    width: 100,
    height: 100,
  },
  infoText: {
    fontFamily: 'Lato',
    fontSize: 19,
    fontWeight: '500',
    color: '#A5A5A5',
    marginTop: 70,
  },
})
