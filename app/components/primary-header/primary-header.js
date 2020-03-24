// @flow
import React, { PureComponent } from 'react'
import SvgCustomIcon from '../svg-custom-icon'
import { UnreadMessagesBadge } from '../'
import { View, TouchableOpacity, Text } from 'react-native'
import { BlurView } from 'react-native-blur'

import { styles } from './styles'
import { grey, isiPhone5 } from '../../common/styles/constant'

import type { PrimaryHeaderProps } from './type-primary-header'

class PrimaryHeader extends PureComponent<PrimaryHeaderProps, void> {
  render() {
    const {
      container,
      labelSection,
      iconsSection,
      label,
      icon,
      svgIcon,
      labelNotHome,
    } = styles
    const { headline } = this.props

    return (
      <View style={container}>
        <View style={iconsSection}>
          <TouchableOpacity
            testID="burger-menu"
            style={icon}
            onPress={this.props.navigation && this.props.navigation.openDrawer}
          >
            <SvgCustomIcon
              name="BurgerMenu"
              width={isiPhone5 ? 32 : 36}
              height={isiPhone5 ? 32 : 36}
              fill={grey}
              style={svgIcon}
            />
          </TouchableOpacity>
          {headline !== 'Home' && (
            <UnreadMessagesBadge absolutePosition={true} />
          )}
        </View>
        <View style={labelSection}>
          <Text style={headline === 'Home' ? label : labelNotHome}>
            {headline}
          </Text>
          {headline === 'Home' && <UnreadMessagesBadge />}
        </View>
      </View>
    )
  }
}

export { PrimaryHeader }
