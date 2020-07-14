// @flow
import React, { Component } from 'react'
import {
  Image,
  View,
  StyleSheet,
  TouchableHighlight,
  Alert,
  Keyboard,
  Platform,
  Switch,
} from 'react-native'
import { connect } from 'react-redux'
import { select } from 'redux-saga/effects'
import { bindActionCreators } from 'redux'
import ToggleSwitch from 'react-native-flip-toggle-button'
import type { Store } from '../store/type-store'
import { Container, CustomText, CustomView } from '../components'
import {
  lockPinSetupRoute,
  lockTouchIdSetupRoute,
  switchEnvironmentRoute,
  lockSelectionRoute,
} from '../common/'
import type { LockSelectionProps } from './type-lock'
import {
  OFFSET_1X,
  OFFSET_2X,
  OFFSET_3X,
  OFFSET_5X,
  OFFSET_6X,
  OFFSET_7X,
  color,
  isiPhone5,
  PIN_CODE_BORDER_BOTTOM,
  mantis,
  lightWhite,
  white,
} from '../common/styles/constant'
import {
  switchErrorAlerts,
  changeEnvironment,
  baseUrls,
  defaultEnvironment,
} from '../store/config-store'
import {
  disableDevMode,
  longPressedInLockSelectionScreen,
  pressedOnOrInLockSelectionScreen,
} from './lock-store'
import { safeToDownloadSmsInvitation } from '../sms-pending-invitation/sms-pending-invitation-store'
import { SERVER_ENVIRONMENT } from '../store/type-config-store'
import { headerOptionsWithNoBack } from '../navigation/navigation-header-config'

export class LockSelection extends Component<LockSelectionProps, *> {
  constructor(props: LockSelectionProps) {
    super(props)
    this.state = {
      devMode: false,
    }
  }

  goTouchIdSetup = () => {
    if (this.props.navigation.isFocused()) {
      this.props.navigation.navigate(lockTouchIdSetupRoute)
      this.props.safeToDownloadSmsInvitation()
    }
  }

  goPinCodeSetup = () => {
    this.props.navigation.navigate(lockPinSetupRoute)
    this.props.safeToDownloadSmsInvitation()
  }

  _onLongPressButton = () => {
    this.props.longPressedInLockSelectionScreen()
  }

  _onTextPressButton = () => {
    this.props.pressedOnOrInLockSelectionScreen()
  }

  onDevModeChange = (switchState: boolean) => {
    if (this.state.devMode !== switchState) {
      this.setState({ devMode: switchState }, () => {
        const env = this.state.devMode
          ? baseUrls[SERVER_ENVIRONMENT.DEMO]
          : baseUrls[defaultEnvironment]
        this.props.changeEnvironment(
          env.agencyUrl,
          env.agencyDID,
          env.agencyVerificationKey,
          env.poolConfig,
          env.paymentMethod
        )
      })
    }
  }

  render() {
    return (
      <Container tertiary style={[style.pinSelectionContainer]}>
        <CustomView style={[style.messageText]}>
          <CustomText h5 bg="tertiary" tertiary bold center>
            This application must be protected by Biometrics or a passcode at
            all times.
          </CustomText>
        </CustomView>
        <Container spaceAround>
          <CustomView
            center
            fifth
            shadowNoOffset
            testID="touch-id-selection"
            style={[style.touchIdPinContainer]}
            onPress={this.goTouchIdSetup}
            onLongPress={this._onLongPressButton}
          >
            <Image
              style={style.fingerPrintIcon}
              source={require('../images/icon_fingerPrint.png')}
            />
            <CustomText
              h5
              semiBold
              center
              tertiary
              transparentBg
              testID="use-touch-id-text"
              onPress={this.goTouchIdSetup}
              onLongPress={this._onLongPressButton}
            >
              Use Biometrics
            </CustomText>
          </CustomView>
          <CustomView
            testID="lock-selection-or-text"
            onLongPress={this._onLongPressButton}
            onPress={this._onTextPressButton}
            debounceAction={false}
          >
            <CustomText h4 bg="tertiary" tertiary transparentBg thick center>
              or
            </CustomText>
          </CustomView>
          <CustomView
            fifth
            shadowNoOffset
            testID="pin-code-selection"
            style={[style.touchIdPinContainer]}
            onPress={this.goPinCodeSetup}
            onLongPress={this._onLongPressButton}
          >
            <CustomView row center style={[style.pinContainer]}>
              <CustomView style={[style.pin]}>
                <CustomText h4 thick center bg="fifth">
                  1
                </CustomText>
              </CustomView>
              <CustomView style={[style.pin]}>
                <CustomText h4 thick center bg="fifth">
                  2
                </CustomText>
              </CustomView>
              <CustomView style={[style.pin]}>
                <CustomText h4 thick center bg="fifth">
                  3
                </CustomText>
              </CustomView>
              <CustomView style={[style.pin]}>
                <CustomText h4 thick center bg="fifth">
                  4
                </CustomText>
              </CustomView>
              <CustomView style={[style.pin]}>
                <CustomText h4 thick center bg="fifth">
                  5
                </CustomText>
              </CustomView>
              <CustomView style={[style.pin]}>
                <CustomText h4 thick center bg="fifth">
                  6
                </CustomText>
              </CustomView>
            </CustomView>
            <CustomText
              h5
              semiBold
              center
              tertiary
              transparentBg
              style={[style.usePinText]}
              onPress={this.goPinCodeSetup}
              testID="use-pass-code-text"
              onLongPress={this._onLongPressButton}
            >
              Use Passcode
            </CustomText>
          </CustomView>
        </Container>
        <CustomView tertiary style={[style.devSwitchContainer]}>
          <CustomView tertiary row spaceBetween>
            <CustomView tertiary style={[style.devSwitchText]}>
              <CustomText bg="tertiary" tertiary h5 bold>
                Use Staging Net
              </CustomText>
            </CustomView>
            <CustomView tertiary>
              {Platform.OS === 'ios' ? (
                <Switch
                  trackColor={{ true: mantis }}
                  onValueChange={this.onDevModeChange}
                  value={this.state.devMode}
                />
              ) : (
                <ToggleSwitch
                  onToggle={this.onDevModeChange}
                  value={this.state.devMode}
                  buttonWidth={55}
                  buttonHeight={30}
                  buttonRadius={30}
                  sliderWidth={28}
                  sliderHeight={28}
                  sliderRadius={58}
                  buttonOnColor={mantis}
                  buttonOffColor={lightWhite}
                  sliderOnColor={white}
                  sliderOffColor={white}
                />
              )}
            </CustomView>
          </CustomView>
          <CustomView tertiary verticalSpace>
            <CustomText bg="tertiary" tertiary h6>
              (An alternative network for app developers)
            </CustomText>
          </CustomView>
        </CustomView>
      </Container>
    )
  }

  componentDidUpdate(prevProps: LockSelectionProps) {
    if (
      prevProps.showDevMode !== this.props.showDevMode &&
      this.props.showDevMode
    ) {
      Alert.alert(
        'Developer Mode',
        'you are enabling developer mode and it will delete all existing data. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => this.props.disableDevMode(),
          },
          {
            text: 'OK',
            onPress: () =>
              this.props.navigation.navigate(switchEnvironmentRoute),
          },
        ]
      )
    }
  }
}

const mapStateToProps = ({ lock }: Store) => {
  return {
    showDevMode: lock.showDevMode,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      switchErrorAlerts,
      longPressedInLockSelectionScreen,
      pressedOnOrInLockSelectionScreen,
      disableDevMode,
      safeToDownloadSmsInvitation,
      changeEnvironment,
    },
    dispatch
  )

export const lockSelectionScreen = {
  routeName: lockSelectionRoute,
  screen: connect(mapStateToProps, mapDispatchToProps)(LockSelection),
  options: headerOptionsWithNoBack({
    title: 'Choose how to unlock App',
  }),
}

const style = StyleSheet.create({
  pinSelectionContainer: {
    paddingTop: OFFSET_3X,
    paddingBottom: isiPhone5 ? OFFSET_1X / 2 : OFFSET_1X,
    paddingHorizontal: OFFSET_2X,
  },
  messageText: {
    paddingHorizontal: isiPhone5 ? 0 : OFFSET_5X / 2,
    paddingBottom: isiPhone5 ? OFFSET_3X / 2 : OFFSET_7X / 2,
  },
  touchIdPinContainer: {
    paddingTop: OFFSET_1X / 2,
    paddingHorizontal: OFFSET_2X,
    paddingBottom: OFFSET_2X,
    borderRadius: 13,
    marginHorizontal: OFFSET_3X,
  },
  fingerPrintIcon: {
    marginVertical: OFFSET_3X / 2,
    height: 60,
    width: 60,
  },
  pinContainer: {
    marginVertical: OFFSET_3X,
    marginBottom: OFFSET_5X / 2,
  },
  pin: {
    borderBottomColor: color.bg.fifth.font.primary,
    borderBottomWidth: PIN_CODE_BORDER_BOTTOM,
    marginRight: OFFSET_1X / 2,
    paddingHorizontal: OFFSET_1X / 2,
    paddingBottom: OFFSET_1X,
  },
  usePinText: {
    lineHeight: 22,
    paddingBottom: OFFSET_1X / 2,
  },
  devSwitchContainer: {
    marginHorizontal: OFFSET_3X,
    marginTop: OFFSET_2X,
  },
  devSwitchText: {
    alignSelf: 'center',
  },
})
