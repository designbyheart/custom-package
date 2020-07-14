// @flow
import React, { PureComponent } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import debounce from 'lodash.debounce'
import { scale, moderateScale, verticalScale } from 'react-native-size-matters'
import CredentialPriceInfo from '../labels/credential-price-info'
import { shadeColor } from '../../utilities/color'
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'
import { CustomText } from '../../components'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ModalButtons extends PureComponent<any, {}> {
  constructor(props: any) {
    super(props)
  }

  debounceButtonPress = debounce(
    (event) => {
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
        <View style={[styles.innerWrapper, buttonsWrapperStyles]}>
          {leftBtnText && (
            <TouchableOpacity
              style={[
                styles.buttonIgnore,
                {
                  backgroundColor:
                    secondColorBackground || shadeColor(colorBackground, 60),
                },
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
    padding: moderateScale(15),
    paddingBottom: moderateScale(45),
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
    padding: moderateScale(17),
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cmGray4,
    minWidth: '35%',
  },
  ignore: {
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: '700',
    color: colors.cmWhite,
    fontFamily: fontFamily,
  },
  buttonAccept: {
    flex: 1,
    padding: moderateScale(17),
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  accept: {
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: '700',
    color: colors.cmWhite,
    fontFamily: fontFamily,
  },
  fullWidth: {
    flexDirection: 'column',
  },
  fullIgnore: {
    width: '100%',
  },
})
