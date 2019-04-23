// @flow
import React, { Component } from 'react'
import SvgCustomIcon from '../svg-custom-icon'
import { Platform, View, TouchableOpacity, Text } from 'react-native'
import { CustomHeader, CustomView, CustomText } from '../'
import { BlurView } from 'react-native-blur'
import type { PrimaryHeaderProps } from './type-primary-header'

import { styles } from './styles'
import { grey } from '../../common/styles/constant'

class PrimaryHeader extends Component<PrimaryHeaderProps, void> {
  renderBlurForIos = () => {
    const { blur } = styles

    if (Platform.OS === 'ios') {
      return <BlurView style={blur} blurType="light" blurAmount={8} />
    } else return null
  }

  render() {
    const { container, labelSection, iconsSection, label, icon } = styles
    const { headline } = this.props

    return (
      <View style={container}>
        {this.renderBlurForIos()}
        <View style={labelSection}>
          <Text style={label}>{headline}</Text>
        </View>
        {/* We won’t use this for now. <View style={iconsSection}>
         <TouchableOpacity style={icon}>
           <SvgCustomIcon name=“Add” fill={grey} />
         </TouchableOpacity>
         <TouchableOpacity style={icon}>
           <SvgCustomIcon name=“Search” fill={grey} />
         </TouchableOpacity>
       </View> */}
      </View>
    )
  }
}

export { PrimaryHeader }
