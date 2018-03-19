import React from 'react'
import { StyleSheet } from 'react-native'
import { Button } from 'react-native-elements'
import { color, font } from '../common/styles/constant'
import empty from '../common/empty'

const getButtonProps = type => ({
  backgroundColor: color.actions[type],
  color: color.actions.font[type],
  textAlign: 'center',
})

const CustomButton = props => {
  const {
    primary,
    secondary,
    tertiary,
    quaternary,
    fifth,
    dangerous,
    medium,
    customColor = {},
    disabled,
  } = props
  const buttonStyles = props.style || empty
  const style = [medium ? styles.mediumVerticalPadding : null, ...buttonStyles]

  const buttonType = primary
    ? 'sixth'
    : secondary
      ? 'secondary'
      : tertiary
        ? 'tertiary'
        : quaternary ? 'quaternary' : dangerous ? 'dangerous' : 'fifth'
  const buttonProps = { ...getButtonProps(buttonType), ...customColor }
  // when button is disabled, we want to apply same color that is
  // generated while picking up the color from image
  const disabledStyles = [
    { backgroundColor: customColor.backgroundColor || color.actions.none },
    styles.disabled,
  ]

  return (
    <Button
      {...props}
      {...buttonProps}
      buttonStyle={style}
      containerViewStyle={styles.buttonContainer}
      disabledStyle={disabledStyles}
    />
  )
}

export default CustomButton

const styles = StyleSheet.create({
  buttonContainer: {
    marginRight: 0,
    marginLeft: 0,
  },
  mediumVerticalPadding: {
    paddingVertical: 17,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontWeight: '600',
    fontSize: font.size.M,
  },
})
