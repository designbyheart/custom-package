// @flow
import React, { PureComponent } from 'react'
import { Text, View } from 'react-native'
import type { DefaultLogoProps } from './type-default-logo'
import { grey, white, fontFamily } from '../../common/styles'

export class DefaultLogo extends PureComponent<DefaultLogoProps, void> {
  render() {
    const { text, size, fontSize, shadow } = this.props

    const customStyles = {
      container: {
        ...styles.defaultContainer,
        width: size,
        height: size,
        borderRadius: size / 2,
        ...(shadow ? styles.shadow : {}),
      },
      text: {
        ...styles.defaultText,
        fontSize: fontSize,
      },
    }

    return (
      <View style={customStyles.container}>
        <Text style={customStyles.text}>
          {text ? text[0].toUpperCase() : ''}
        </Text>
      </View>
    )
  }
}

const styles = {
  defaultContainer: {
    backgroundColor: grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    elevation: 3,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  defaultText: {
    fontFamily: fontFamily,
    fontWeight: 'bold',
    color: white,
  },
}
