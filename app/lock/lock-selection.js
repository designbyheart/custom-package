// @flow
import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Alert,
  Platform,
  Switch,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ToggleSwitch from 'react-native-flip-toggle-button'
import { verticalScale, moderateScale } from 'react-native-size-matters'
import type { Store } from '../store/type-store'
import { Container, CustomText, CustomView } from '../components'
import { SvgCustomIcon } from '../components/svg-custom-icon'
import {
  lockPinSetupRoute,
  lockTouchIdSetupRoute,
  switchEnvironmentRoute,
  lockSelectionRoute,
  eulaRoute,
} from '../common/'
import type { LockSelectionProps } from './type-lock'
import {
  OFFSET_1X,
  OFFSET_2X,
  OFFSET_3X,
  OFFSET_5X,
  OFFSET_7X,
  color,
  isiPhone5,
  PIN_CODE_BORDER_BOTTOM,
  mantis,
  lightWhite,
  white,
  colors,
  fontFamily,
  grey,
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
import { Header } from '../components'
import { headerOptionsWithNoBack } from '../navigation/navigation-header-config'

const { width } = Dimensions.get('screen')
export class LockSelection extends Component<LockSelectionProps, *> {
  constructor(props: LockSelectionProps) {
    super(props)
    this.state = {
      devMode: false,
    }
  }

  goTouchIdSetup = () => {
    if (this.props.navigation.isFocused()) {
      this.props.navigation.navigate(lockTouchIdSetupRoute, {
        fromSetup: true,
      })
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
      <Container tertiary>
        <Header
          navigation={this.props.navigation}
          route={this.props.route}
          transparent={true}
        />
       <Container tertiary style={[style.pinSelectionContainer]}>
         <CustomView center>
           <SvgCustomIcon
             name="ConnectMe"
             width={moderateScale(218.54)}
             height={moderateScale(28)}
             fill={colors.cmGray2}
           />
         </CustomView>
         <CustomText
           center
           h4
           bg="tertiary"
           style={[style.title]}
           tertiary
           thick
         >
           Biometrics are faster.
         </CustomText>
         <CustomView
           testID="lock-selection-or-text"
           onLongPress={this._onLongPressButton}
           onPress={this._onTextPressButton}
           debounceAction={false}
         ></CustomView>
         <CustomView
           center
           style={[style.image]}
           onPress={this._onTextPressButton}
           onLongPress={this._onLongPressButton}
           debounceAction={false}
         >
           <Image source={require('../images/biometricsGroup.png')} />
         </CustomView>
         <CustomText bg="tertiary" tertiary style={[style.message]}>
           You can use your face or finger to unlock this app. Your passcode will
           still be required if biometrics fail.
         </CustomText>
         <TouchableOpacity onPress={this.goTouchIdSetup} style={[style.button]}>
           <CustomText center h4 transparentBg thick>
             Use biometrics
           </CustomText>
         </TouchableOpacity>
         <CustomText
           center
           style={[style.noThanks]}
           bg="tertiary"
           tertiary
           h5
           bold
           onPress={() => this.props.navigation.navigate(eulaRoute)}
         >
           No thanks
         </CustomText>
         <CustomView tertiary style={[style.devSwitchContainer]}>
           <CustomView tertiary row spaceBetween>
             <CustomView tertiary style={[style.devSwitchText]}>
               <CustomText bg="tertiary" tertiary h5 bold>
                 Use Staging Net
               </CustomText>
               <CustomText bg="tertiary" tertiary h7>
                 An alternative network for app developers
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
         </CustomView>
       </Container>
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
}

const style = StyleSheet.create({
  pinSelectionContainer: {
    paddingBottom: isiPhone5 ? OFFSET_1X / 2 : OFFSET_1X,
    paddingHorizontal: OFFSET_2X,
    flexDirection: 'column',
  },
  devSwitchContainer: {
    marginHorizontal: OFFSET_3X,
    marginTop: moderateScale(OFFSET_2X),
  },
  devSwitchText: {
    alignSelf: 'center',
  },
  title: {
    fontFamily,
    fontStyle: 'normal',
    fontWeight: 'bold',
    lineHeight: moderateScale(31),
    marginTop: verticalScale(49.26),
    marginBottom: verticalScale(60),
    paddingHorizontal: OFFSET_2X,
    textAlign: 'center',
  },
  message: {
    fontSize: moderateScale(17),
    lineHeight: moderateScale(22),
  },
  button: {
    borderRadius: 5,
    marginTop: verticalScale(50),
    marginBottom: verticalScale(17.5),
    backgroundColor: colors.cmGreen1,
    width: width - OFFSET_2X * 2,
    padding: moderateScale(17),
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: grey,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowRadius: 5,
    shadowOpacity: 0.3,
    elevation: 7,
  },
  noThanks: {
    color: colors.cmGreen1,
    lineHeight: moderateScale(34),
  },
  image: {
    marginBottom: verticalScale(50),
  },
})
