// @flow

import React from 'react'
import { Text, StyleSheet, Platform } from 'react-native'
import { font, color } from '../../common/styles'

export const HeaderTitle = ({ title }: { title: string }) => {
  return <Text style={headerTitleStyle.title}>{title}</Text>
}

export const headerTitleStyle = StyleSheet.create({
  title: {
    fontSize: font.size.M,
    fontFamily: font.family,
    color: color.bg.tertiary.font.tertiary,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },
})
