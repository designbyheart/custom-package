// @flow
import React, { PureComponent, useCallback } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import type { PrimaryHeaderProps } from './type-primary-header'

import { SvgCustomIcon } from '../svg-custom-icon'
import UnreadMessagesBadge from '../unread-messages-badge/unread-messages-badge'
import { styles } from './styles'
import { colors } from '../../common/styles/constant'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'

export const PrimaryHeader = ({ headline }: PrimaryHeaderProps) => {
  const navigation = useNavigation()
  const toggleDrawer = useCallback(() => {
    navigation.toggleDrawer()
  }, [])

  return (
    <View style={styles.container}>
      <View
        accessible={true}
        accessibilityLabel="burger-menu"
        style={styles.iconSection}
      >
        <TouchableOpacity testID="burger-menu" onPress={toggleDrawer}>
          <SvgCustomIcon
            name="BurgerMenu"
            width={moderateScale(32)}
            height={moderateScale(32)}
            fill={colors.cmGray2}
            style={styles.svgIcon}
          />
        </TouchableOpacity>
        {headline !== 'Home' && <UnreadMessagesBadge absolutePosition={true} />}
      </View>
      <View style={styles.labelSection}>
        <Text style={styles.label}>{headline}</Text>
        {headline === 'Home' && <UnreadMessagesBadge />}
      </View>
    </View>
  )
}
