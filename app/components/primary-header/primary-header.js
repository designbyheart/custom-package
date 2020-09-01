// @flow
import React, { useCallback } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import type { PrimaryHeaderProps } from './type-primary-header'

import { EvaIcon, HOME_MENU_ICON } from '../../common/icons'
import UnreadMessagesBadge from '../unread-messages-badge/unread-messages-badge'
import { styles } from './styles'
import { moderateScale } from 'react-native-size-matters'

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
          <EvaIcon
            name={HOME_MENU_ICON}
            width={moderateScale(32)}
            height={moderateScale(32)}
            style={styles.menuIcon}
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
