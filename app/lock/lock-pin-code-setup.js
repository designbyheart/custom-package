// @flow
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
  lockPinSetupRoute,
  lockSelectionRoute,
  lockSetupSuccessRoute,
} from '../common'
import type { ReactNavigation } from '../common/type-common'
import { headerNavigationOptions } from '../navigation/navigation-header-config'
import { Container, CustomText, PinCodeBox, CustomView } from '../components'
import SvgCustomIcon from '../components/svg-custom-icon'
import { setPinAction } from './lock-store'
import { PIN_SETUP_STATE } from './type-lock'
import { Keyboard, StyleSheet, Platform } from 'react-native'
import { colors, OFFSET_2X, fontFamily } from '../common/styles'
import { moderateScale, scale, verticalScale } from 'react-native-size-matters'
import { Header } from '../components'

let keyboardDidHideListener
let keyboardDidShowListener

export function LockPinSetup(props: ReactNavigation) {
  const { navigation, route } = props
  const dispatch = useDispatch()
  const [pinSetupState, setPinSetupState] = useState(PIN_SETUP_STATE.INITIAL)
  const [failedPin, setFailedPin] = useState(false)
  const [enteredPin, setEnteredPin] = useState(null)
  const [confirmedPin, setConfirmedPin] = useState(null)
  const [keyboardHidden, setKeyboardHidden] = useState(false)
  const [showCustomKeyboard, setShowCustomKeyboard] = useState(false)
  const pinCodeBox = useRef<any>()
  const existingPin = route && route.params && route.params.existingPin === true
  const enterPasscodeText = existingPin
    ? 'Create new passcode'
    : 'Set a passcode to secure this app'
  const handleKeyboardChange = useCallback((status, event) => {
    if (keyboardHidden !== status) {
      setKeyboardHidden(status)
      setShowCustomKeyboard(false)
      return
    }
    const shouldShowCustomKeyboard =
      status === false &&
      event &&
      event.endCoordinates.height < 100 &&
      !keyboardHidden &&
      Platform.OS === 'ios'

    setShowCustomKeyboard(shouldShowCustomKeyboard)
  })

  const handlePinComplete = useCallback((pin: string) => {
    if (!enteredPin) {
      setEnteredPin(pin)
      setPinSetupState(PIN_SETUP_STATE.REENTER)
      setFailedPin(false)
      pinCodeBox.current.clear()
      return
    }
    if (enteredPin !== pin) {
      // handle error state
      setEnteredPin(null)
      setPinSetupState(PIN_SETUP_STATE.REENTER_FAIL)
      setFailedPin(true)
      pinCodeBox.current.clear()
      setTimeout(() => setPinSetupState(PIN_SETUP_STATE.INITIAL), 1000)
      return
    }
    pinCodeBox.current.hideKeyboard()
    setConfirmedPin(pin)
    setPinSetupState(PIN_SETUP_STATE.REENTER_SUCCESS)
    setFailedPin(false)
  })

  useEffect(() => {
    keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      handleKeyboardChange(true)
    })
    keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        handleKeyboardChange(false, event)
      }
    )
    return () => {
      keyboardDidShowListener && keyboardDidShowListener.remove()
      keyboardDidHideListener && keyboardDidHideListener.remove()
    }
  }, [])

  useEffect(() => {
    if (
      keyboardHidden &&
      pinSetupState === PIN_SETUP_STATE.REENTER_SUCCESS &&
      navigation.isFocused()
    ) {
      dispatch(setPinAction(confirmedPin || ''))
      existingPin
        ? navigation.navigate(lockSetupSuccessRoute, {
            changePin: true,
          })
        : navigation.navigate(lockSelectionRoute)
    }
  }, [keyboardHidden, pinSetupState])

  return (
    <Container tertiary>
      <Header
        navigation={props.navigation}
        route={props.route}
        transparent={true}
      />
      <CustomView center>
        <SvgCustomIcon
          name="ConnectMe"
          width={moderateScale(218.54)}
          height={moderateScale(28)}
          fill={colors.cmGray2}
        />
      </CustomView>
      <CustomText center h4 bg="tertiary" style={[styles.title]} tertiary thick>
        {`${enteredPin ? 'Re-enter passcode' : enterPasscodeText}`}
      </CustomText>
      <CustomText center bg="tertiary" tertiary style={[styles.message]}>
        {failedPin && 'Your passcodes do not match'}
      </CustomText>
      <CustomView center>
        <PinCodeBox
          ref={pinCodeBox}
          onPinComplete={handlePinComplete}
          enableCustomKeyboard={showCustomKeyboard}
        />
      </CustomView>
    </Container>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily,
    fontSize: 26,
    fontStyle: 'normal',
    lineHeight: 31,
    minHeight: verticalScale(62),
    marginTop: verticalScale(40),
    marginBottom: verticalScale(40),
    paddingHorizontal: OFFSET_2X,
    textAlign: 'center',
  },
  message: {
    height: scale(20),
    marginBottom: scale(12),
    fontFamily,
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 20,
    justifyContent: 'center',
    color: colors.cmRed,
  },
})

export const lockPinSetupScreen = {
  routeName: lockPinSetupRoute,
  screen: LockPinSetup,
}
