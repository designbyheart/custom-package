// @flow
import React, { PureComponent } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import debounce from 'lodash.debounce'
import { moderateScale, verticalScale } from 'react-native-size-matters'
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'
import { CustomText } from '../../components'
import SvgCustomIcon from '../../components/svg-custom-icon'

type BottomButtonProps = {
  colorBackground: string,
  debounceButtonPress: (event: any) => void,
  disableAccept: boolean,
  bottomBtnText: string,
  svgIcon: any,
}

type TopButtonProps = {
  topBtnText: string,
  onIgnore: (event: any) => void,
}

// TODO: Fix the any type
type ModalButtonProps = {
  containerStyles?: any,
  children?: any,
  primaryActionValue: (event: any) => void,
  onPress: (event: any) => void,
} & BottomButtonProps &
  TopButtonProps

class ModalButtons extends PureComponent<any, ModalButtonProps> {
  constructor(props: ModalButtonProps) {
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
      disableAccept = false,
      colorBackground,
      topBtnText,
      bottomBtnText,
      containerStyles,
      children,
      svgIcon,
    } = this.props
    const { container } = styles
    const { debounceButtonPress } = this

    return (
      <View style={[container, containerStyles]}>
        {children}
        {topBtnText && (
          <TopButton
            {...{
              topBtnText,
              onIgnore,
            }}
          />
        )}
        <BottomButton
          {...{
            disableAccept,
            bottomBtnText,
            debounceButtonPress,
            svgIcon,
            colorBackground,
          }}
        />
      </View>
    )
  }
}

const TopButton = ({ topBtnText, onIgnore }: TopButtonProps) => {
  const { buttonIgnore, ignoreTextStyle, buttonParentWrapper } = styles

  return (
    <TouchableOpacity onPress={onIgnore}>
      <View
        style={[
          buttonParentWrapper,
          buttonIgnore,
          { marginBottom: moderateScale(16) },
        ]}
      >
        <CustomText errorText h4 transparentBg demiBold style={ignoreTextStyle}>
          {topBtnText}
        </CustomText>
      </View>
    </TouchableOpacity>
  )
}

const BottomButton = ({
  debounceButtonPress,
  disableAccept,
  bottomBtnText,
  svgIcon,
  colorBackground,
}: BottomButtonProps) => {
  const {
    buttonAccept,
    acceptTextStyle,
    buttonParentWrapper,
    svgIconStyles,
  } = styles

  return (
    <TouchableOpacity disabled={disableAccept} onPress={debounceButtonPress}>
      <View
        style={[
          buttonParentWrapper,
          buttonAccept,
          {
            backgroundColor: colorBackground,
            opacity: disableAccept ? 0.4 : 1,
          },
        ]}
      >
        <CustomText h4 transparentBg thick center style={acceptTextStyle}>
          {bottomBtnText}
        </CustomText>
        {svgIcon && <SvgCustomIcon style={svgIconStyles} name={svgIcon} />}
      </View>
    </TouchableOpacity>
  )
}

export { ModalButtons }

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cmWhite,
    width: '100%',
    maxWidth: '100%',
    padding: moderateScale(15),
    paddingBottom: moderateScale(1),
    flexDirection: 'column',
  },
  buttonParentWrapper: {
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonIgnore: {
    borderWidth: 1,
    borderColor: colors.cmRed,
    padding: moderateScale(17),
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '35%',
  },
  buttonAccept: {
    borderRadius: 5,
    padding: moderateScale(17),
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '35%',
  },
  ignoreTextStyle: {
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: '700',
    color: colors.cmRed,
    fontFamily: fontFamily,
  },
  acceptTextStyle: {
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
  svgIconStyles: { position: 'absolute', right: 10 },
})
