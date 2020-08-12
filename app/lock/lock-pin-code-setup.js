// @flow
import React, { PureComponent } from 'react'
import { StyleSheet, Keyboard, Platform, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type { LockPinSetupState, LockPinCodeSetupProps } from './type-lock'
import type { ReactNavigation } from '../common/type-common'

import {
  Container,
  CustomText,
  CustomButton,
  CustomView,
  PinCodeBox,
  Icon,
  CustomHeader,
  FlatHeader,
} from '../components'
import {
  lockSelectionRoute,
  lockPinSetupHomeRoute,
  lockSetupSuccessRoute,
  settingsTabRoute,
  lockEnterPinRoute,
  lockPinSetupRoute,
  settingsDrawerRoute,
} from '../common'
import {
  color,
  mediumGray,
  OFFSET_1X,
  OFFSET_2X,
  OFFSET_6X,
  OFFSET_7X,
  font,
} from '../common/styles'
import { setPinAction, enableTouchIdAction } from './lock-store'
import { PIN_SETUP_STATE } from './type-lock'
import { tertiaryHeaderStyles } from '../components/layout/header-styles'
import { headerNavigationOptions } from '../navigation/navigation-header-config'

const styles = StyleSheet.create({
  headerLeft: {
    width: OFFSET_2X,
  },
  title: {
    marginTop: OFFSET_6X,
    marginBottom: OFFSET_7X,
  },
  titleText: {
    lineHeight: 28,
    letterSpacing: 0.5,
    paddingHorizontal: OFFSET_1X,
  },
})

const ReEnterPinFailText = (
  <CustomText style={[styles.titleText]} center h4 bg="tertiary" tertiary thick>
    Your passcodes do not match, please start over.
  </CustomText>
)

export class LockPinSetup extends PureComponent<
  LockPinCodeSetupProps,
  LockPinSetupState
> {
  state: LockPinSetupState = {
    pinSetupState: PIN_SETUP_STATE.INITIAL,
    enteredPin: null,
    pinReEnterSuccessPin: null,
    keyboardHidden: false,
    showCustomKeyboard: false,
  }

  pinCodeBox = null
  keyboardDidHideListener = null
  keyboardDidShowListener = null

  setPinSetupStateToInitial = () => {
    this.setState({ pinSetupState: PIN_SETUP_STATE.INITIAL })
  }

  setPinSetupStateToInitialDelayed = () => {
    setTimeout(this.setPinSetupStateToInitial, 1000)
  }

  onPinSetup = (pin: string) => {
    this.props.setPinAction(pin)
    this.props.route &&
    this.props.route.params &&
    this.props.route.params.existingPin === true
      ? this.props.navigation.navigate(lockSetupSuccessRoute, {
          changePin: true,
        })
      : this.props.navigation.navigate(lockSetupSuccessRoute)
  }

  onTouchIdSetup = () => {
    this.props.enableTouchIdAction()
  }

  onPinReEnterFail = () => {
    this.setState({
      pinSetupState: PIN_SETUP_STATE.REENTER_FAIL,
      enteredPin: null,
    })
    this.pinCodeBox && this.pinCodeBox.clear()
    this.setPinSetupStateToInitialDelayed()
  }

  onPinReEnterSuccess = (pin: string) => {
    this.pinCodeBox && this.pinCodeBox.hideKeyboard()
    this.setState({
      pinSetupState: PIN_SETUP_STATE.REENTER_SUCCESS,
      pinReEnterSuccessPin: pin,
    })
  }

  onKeyboardHide = (status: boolean, event: any = null) => {
    if (this.state.keyboardHidden !== status) {
      this.setState({
        keyboardHidden: status,
        showCustomKeyboard: false,
      })
    } else {
      if (
        status === false &&
        event &&
        event.endCoordinates.height < 100 &&
        !this.state.keyboardHidden &&
        Platform.OS === 'ios'
      ) {
        this.setState({
          showCustomKeyboard: true,
        })
      } else {
        this.setState({
          showCustomKeyboard: false,
        })
      }
    }
  }

  onFirstPinEnter = (enteredPin: string) => {
    this.setState({
      pinSetupState: PIN_SETUP_STATE.REENTER,
      enteredPin,
    })
    this.pinCodeBox && this.pinCodeBox.clear()
  }

  onPinComplete = (pin: string) => {
    if (this.state.enteredPin) {
      // if we found a entered pin, that means user is re-entering pin
      if (this.state.enteredPin === pin) {
        this.onPinReEnterSuccess(pin)
      } else {
        this.onPinReEnterFail()
      }
    } else {
      // this is the first time user has entered pin
      this.onFirstPinEnter(pin)
    }
  }

  componentDidMount() {
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        this.onKeyboardHide(true)
      }
    )
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        this.onKeyboardHide(false, e)
      }
    )
  }

  componentDidUpdate(prevProps: LockPinCodeSetupProps) {
    if (
      this.state.keyboardHidden &&
      this.state.pinSetupState === PIN_SETUP_STATE.REENTER_SUCCESS &&
      this.props.navigation.isFocused()
    ) {
      const pin = this.state.pinReEnterSuccessPin || ''
      this.onPinSetup(pin)
    }
    if (this.props.navigation.isFocused()) {
      if (!this.keyboardDidHideListener && !this.keyboardDidShowListener) {
        this.keyboardDidHideListener = Keyboard.addListener(
          'keyboardDidHide',
          () => {
            this.onKeyboardHide(true)
          }
        )
        this.keyboardDidShowListener = Keyboard.addListener(
          'keyboardDidShow',
          (e) => {
            this.onKeyboardHide(false, e)
          }
        )
      }
    } else {
      if (this.state.pinSetupState === PIN_SETUP_STATE.REENTER_SUCCESS) {
        this.setState({
          pinSetupState: PIN_SETUP_STATE.INITIAL,
          pinReEnterSuccessPin: null,
          keyboardHidden: false,
        })
      }
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove()
  }

  render() {
    const { pinSetupState } = this.state
    const passCodeSetupText =
      this.props.route &&
      this.props.route.params &&
      this.props.route.params.touchIdActive === true
        ? 'Set up a passcode in case Biometrics fails'
        : 'Set up a passcode'

    const EnterPinText = (
      <CustomText
        style={[styles.titleText]}
        center
        h4
        bg="tertiary"
        tertiary
        thick
      >
        {this.props.route &&
        this.props.route.params &&
        this.props.route.params.existingPin === true
          ? 'Set up a new passcode'
          : passCodeSetupText}
      </CustomText>
    )
    const ReEnterPinText = (
      <CustomText
        style={[styles.titleText]}
        center
        h4
        bg="tertiary"
        tertiary
        thick
      >
        {this.props.route &&
        this.props.route.params &&
        this.props.route.params.existingPin === true
          ? 'Re-enter new passcode'
          : 'Re-enter passcode'}
      </CustomText>
    )

    return (
      <Container tertiary>
        <CustomView style={[styles.title]}>
          {pinSetupState === PIN_SETUP_STATE.INITIAL && EnterPinText}
          {pinSetupState === PIN_SETUP_STATE.REENTER && ReEnterPinText}
          {pinSetupState === PIN_SETUP_STATE.REENTER_SUCCESS && ReEnterPinText}
          {pinSetupState === PIN_SETUP_STATE.REENTER_FAIL && ReEnterPinFailText}
        </CustomView>
        <CustomView center>
          <PinCodeBox
            ref={(pinCodeBox) => {
              this.pinCodeBox = pinCodeBox
            }}
            onPinComplete={this.onPinComplete}
            enableCustomKeyboard={this.state.showCustomKeyboard}
          />
        </CustomView>
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setPinAction,
      enableTouchIdAction,
    },
    dispatch
  )

export const lockPinSetupScreen = {
  routeName: lockPinSetupRoute,
  screen: connect(null, mapDispatchToProps)(LockPinSetup),
  options: {
    ...headerNavigationOptions({
      title: 'App Security',
    }),
  },
}
