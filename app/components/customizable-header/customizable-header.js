import React, { Component } from 'react'
import { Platform, View, Text, TouchableOpacity } from 'react-native'

import SvgCustomIcon from '../svg-custom-icon'

import {
  styles,
  primaryHeaderContainer,
  connectionDetailsHeaderContainer,
  credentialDetailsHeaderContainer,
} from './styles'

class CustomizableHeader extends Component {
  renderHeader = () => {
    const { headerType } = this.props
    const {
      primaryHeaderTextSection,
      primaryHeaderIconSection,
      primaryHeaderText,
      primaryHeaderIcon,
    } = styles

    if (headerType === 'primary') {
      return (
        <View style={primaryHeaderContainer}>
          <View style={primaryHeaderTextSection}>
            <Text style={primaryHeaderText}>Connections</Text>
          </View>
          <View style={primaryHeaderIconSection}>
            <TouchableOpacity style={primaryHeaderIcon}>
              <SvgCustomIcon name="Add" fill="#777777" />
            </TouchableOpacity>
            <TouchableOpacity style={[primaryHeaderIcon, { marginRight: -6 }]}>
              <SvgCustomIcon name="Search" fill="#777777" />
            </TouchableOpacity>
          </View>
        </View>
      )
    } else if (headerType === 'connections') {
      return <View style={connectionDetailsHeaderContainer} />
    } else if (headerType === 'credentials') {
      return <View style={credentialDetailsHeaderContainer} />
    }
  }

  render() {
    return this.renderHeader()
  }
}

export default CustomizableHeader
