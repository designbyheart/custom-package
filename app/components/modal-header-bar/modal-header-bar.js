// @flow

// packages
import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { moderateScale, verticalScale } from 'react-native-size-matters'

// components
import SvgCustomIcon from '../../components/svg-custom-icon'
import type { ModalHeaderBarProps } from './type-modal-header-bar'

// styles
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'

export const ModalHeaderBar = ({
  onPress,
  headerTitle,
  dismissIconType,
}: ModalHeaderBarProps) => {
  const iconOrientationStyle =
    dismissIconType === 'CloseIcon'
      ? styles.svgIconStyleRight
      : styles.svgIconStyleLeft
  const iconScale = moderateScale(dismissIconType === 'CloseIcon' ? 16 : 24)

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{headerTitle}</Text>
      {dismissIconType && (
        <TouchableOpacity onPress={onPress} style={iconOrientationStyle}>
          <SvgCustomIcon
            width={iconScale}
            height={iconScale}
            fill={colors.cmWhite}
            name={dismissIconType}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: verticalScale(fontSizes.size3),
    fontFamily,
  },
  svgIconStyleRight: { position: 'absolute', right: 14, top: 55 },
  svgIconStyleLeft: { position: 'absolute', left: 14, top: 55 },
})
