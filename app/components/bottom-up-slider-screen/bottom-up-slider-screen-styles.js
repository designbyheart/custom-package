// @flow

import React from 'react'
import { StyleSheet, Platform, Dimensions } from 'react-native'
import {
  blackTransparent,
  OFFSET_2X,
  cmGrey5,
  OFFSET_3X,
  OFFSET_1X,
  cmGrey4,
  font,
  cmGrey1,
  white,
  cmGrey2,
  caribbeanGreen,
  darkGray2,
  color,
} from '../../common/styles'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerHandleContainer: {
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  headerHandlebar: {
    width: 51,
    height: 6,
    borderRadius: 6,
    backgroundColor: cmGrey5,
  },
  mainContainer: {
    backgroundColor: blackTransparent,
  },
  screenContainer: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: color.bg.tertiary.color,
  },
})
