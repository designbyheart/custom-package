// @flow
import React from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import debounce from 'lodash.debounce'
import { scale } from 'react-native-size-matters'
import CredentialPriceInfo from '../labels/credential-price-info'
import { shadeColor } from '../../utilities/color'
import { lightGray, whiteSolid } from '../../common/styles/constant'
import { CustomText } from '../../components'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ModalButtons extends React.Component<any, {}> {
  constructor(props: any) {
    super(props)
  }

  debounceButtonPress = debounce(
    event => {
      const { primaryActionValue, onPress } = this.props
      if (primaryActionValue) {
        onPress(primaryActionValue)
        return
      }
      if (onPress) {
        onPress(event)
      }
    },
    600,
    { leading: true, trailing: false }
  )

  render() {
    const {
      onIgnore,
      onPress,
      disableAccept = false,
      colorBackground,
      secondColorBackground,
      leftBtnText,
      rightBtnText,
      containerStyles,
      children,
      buttonsWrapperStyles,
    } = this.props

    const { width: screenWidth } = Dimensions.get('window')

    let themeType = colorBackground
    if (disableAccept) {
      const colorsWithoutOpacity = this.props.colorBackground.split(',', 3)
      colorsWithoutOpacity.push('0.4)')
      themeType = colorsWithoutOpacity.join(',')
    }

    return (
      <View style={[styles.container, containerStyles]}>
        {children}
        <View
          style={[
            styles.innerWrapper,
            buttonsWrapperStyles,
            // screenWidth <= 450 && styles.fullWidth,
          ]}
        >
          {leftBtnText && (
            <TouchableOpacity
              style={[
                styles.buttonIgnore,
                {
                  backgroundColor:
                    secondColorBackground || shadeColor(colorBackground, 60),
                },
                // screenWidth <= 450 && styles.fullIgnore,
              ]}
              onPress={onIgnore}
            >
              <CustomText h4 transparentBg thick style={styles.ignore}>
                {leftBtnText}
              </CustomText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.buttonAccept, { backgroundColor: themeType }]}
            disabled={disableAccept}
            onPress={this.debounceButtonPress}
          >
            <View style={{ opacity: disableAccept ? 0.4 : 1 }}>
              <CustomText h4 transparentBg thick center>
                {rightBtnText}
              </CustomText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export { ModalButtons }

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: '100%',
    maxWidth: '100%',
    padding: 15,
    paddingBottom: 45,
    flexDirection: 'column',
  },
  innerWrapper: {
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonIgnore: {
    padding: 17.5,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightGray,
    minWidth: '35%',
  },
  ignore: {
    fontSize: 17,
    fontSize: scale(17),
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Lato',
    color: whiteSolid,
  },
  buttonAccept: {
    flex: 1,
    padding: 17.5,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accept: {
    fontSize: 17,
    fontSize: scale(17),
    fontWeight: '700',
    color: '#fff',
    color: whiteSolid,
    fontFamily: 'Lato',
  },
  fullWidth: {
    flexDirection: 'column',
  },
  fullIgnore: {
    width: '100%',
  },
})
