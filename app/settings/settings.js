// @flow
import React, { PureComponent } from 'react'
import {
  Alert,
  Text,
  Switch,
  StyleSheet,
  NativeModules,
  Platform,
  ScrollView,
  FlatList,
  Image,
  Button,
  View,
} from 'react-native'
import { measurements } from '../common/styles/measurements'
import { BlurView } from 'react-native-blur'
import { createStackNavigator } from 'react-navigation'
import BackupWallet from './backup-wallet'
import {
  UserAvatar,
  CustomText,
  Icon,
  Avatar,
  CustomHeader,
} from '../components'
import { CustomList, CustomView, Container } from '../components/layout'
import {
  settingsRoute,
  lockEnterPinRoute,
  lockTouchIdSetupRoute,
  aboutAppRoute,
  onfidoRoute,
  privacyTNCRoute,
  genRecoveryPhraseRoute,
  walletRoute,
} from '../common/route-constants'
import ToggleSwitch from 'react-native-flip-toggle-button'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  white,
  mantis,
  OFFSET_1X,
  color,
  grey,
  isIphoneX,
  responsiveHorizontalPadding,
  isBiggerThanVeryShortDevice,
  HAIRLINE_WIDTH,
  font,
  lightDarkGray,
  lightWhite,
  gainsBoro,
} from '../common/styles/constant'
import {
  EDIT_ICON_DIMENSIONS,
  PASS_CODE_ASTERISK_TOP_OFFSET,
  PASS_CODE_ASTERISK_TEST_ID,
  PASS_CODE_TEST_ID,
  TOUCH_ID_TEST_ID,
  USERNAME_TEST_ID,
  CHAT_TEST_ID,
  USER_AVATAR_TEST_ID,
  BACKUP_DATA_WALLET,
  ABOUT_APP_TEST_ID,
  ONFIDO_TEST_ID,
} from './settings-constant'
import type { Store } from '../store/type-store'
import type { SettingsProps, SettingsState } from './type-settings'
import { tertiaryHeaderStyles } from '../components/layout/header-styles'
import type { ImageSource, ReactNavigation } from '../common/type-common'
import { selectUserAvatar } from '../store/user/user-store'
import { Apptentive } from 'apptentive-react-native'
//import WalletBackupSuccessModal from '../backup/wallet-backup-success-modal'
import AboutApp from '../about-app/about-app'
import Onfido from '../onfido/onfido'
import { PrivacyTNC } from '../privacy-tnc/privacy-tnc-screen'
import { WalletBalance } from '../wallet/wallet-balance'
import { size } from '../components/icon'
import { isBiggerThanShortDevice } from '../common/styles/constant'
import { Dimensions } from 'react-native'
import { scale } from 'react-native-size-matters'
import { darkGray } from '../common/styles/constant'
import { List } from 'react-native-elements'

import get from 'lodash.get'
import { getWalletBalance } from '../store/store-selector'
import CustomDate from '../components/custom-date/custom-date'
import { matterhornSecondary } from '../common/styles/constant'
import { tokenAmountSize } from '../home/home'

import { SettingsHeader } from '../components/settings/settings-header'
import SvgCustomIcon from '../components/svg-setting-icons'
import { ListItemSettings } from '../components/settings/list-Item-settings'
import { withStatusBar } from '../components/status-bar/status-bar'
import { formatNumbers } from '../components/text'

const { width, height } = Dimensions.get('window')

export class Settings extends PureComponent<SettingsProps, SettingsState> {
  state = {
    walletBackupModalVisible: false,
    disableTouchIdSwitch: false,
  }
  onChangePinClick = () => {
    const { navigation } = this.props
    if (navigation.isFocused()) {
      navigation.push &&
        navigation.push(lockEnterPinRoute, {
          existingPin: true,
        })
    }
  }

  onChangeTouchId = (switchState: boolean) => {
    const { navigation } = this.props
    // when the navigation from settings is done by touching the Switch, then the touch id enables with weird behaviour
    // reason for the behaviour: the onChangeTouchId function is being invoked twice making to navigate twice.
    // solution: the if condition will check for the current state of the switch and compares with the actual state of the switch
    // this confirms to make the onChangeTouchId function to invoke only once at all the times
    if (this.props.touchIdActive !== switchState && navigation.isFocused()) {
      navigation.push &&
        navigation.push(lockTouchIdSetupRoute, {
          fromSettings: true,
        })
    }
  }
  onBackup = () => {
    const { navigation: { navigate, state, goBack } } = this.props
    // If no there is no route, then default to Settings
    const initialRoute = get(state, 'routeName', settingsRoute)
    navigate(genRecoveryPhraseRoute, {
      initialRoute,
      hideBtn: true,
    })
  }
  onRecoveryPhrase = () => {
    const { navigation: { navigate, state, goBack } } = this.props
    // If no there is no route, then default to Settings
    const initialRoute = get(state, 'routeName', settingsRoute)
    navigate(genRecoveryPhraseRoute, {
      initialRoute,
      hideBtn: false,
    })
  }

  openAboutApp = () => {
    if (this.props.navigation.isFocused()) {
      this.props.navigation.navigate(aboutAppRoute, {})
    }
  }

  openOnfido = () => {
    let localeInfo = ''
    if (Platform.OS === 'android') {
      localeInfo = NativeModules.I18nManager.localeIdentifier
    } else {
      localeInfo = NativeModules.SettingsManager.settings.AppleLocale
    }
    const countryCodde = localeInfo.split('_')[1]
    if (['US', 'GB', 'CA'].includes(countryCodde)) {
      this.props.navigation.navigate(onfidoRoute, {})
    } else {
      Alert.alert(
        'Coming Soon',
        'The Onfido digital credential feature is not yet available in your region',
        [{ text: 'OK' }],
        {
          cancelable: false,
        }
      )
    }
  }
  openTokenScreen = () => {
    this.props.navigation.navigate(walletRoute)
  }

  openFeedback = () => {
    Apptentive.presentMessageCenter()
  }

  static navigationOptions = {
    header: null,
  }

  renderAvatarWithSource = (avatarSource: number | ImageSource) => (
    <Avatar medium round src={avatarSource} />
  )

  hideWalletPopupModal = () => {
    this.setState({
      walletBackupModalVisible: false,
    })
  }

  componentWillReceiveProps(nextProps: SettingsProps) {
    if (
      this.props.currentScreen === nextProps.currentScreen &&
      nextProps.currentScreen === settingsRoute &&
      this.props.timeStamp !== nextProps.timeStamp
    ) {
      this.setState({ disableTouchIdSwitch: false })
    } else if (
      nextProps.currentScreen === lockTouchIdSetupRoute &&
      this.props.currentScreen === settingsRoute
    ) {
      // if user has left settings screen and navigated to lockTouchIdSetup screen
      this.setState({ disableTouchIdSwitch: true })
    }
    if (
      nextProps.walletBackup.status !== this.props.walletBackup.status &&
      nextProps.walletBackup.status === 'SUCCESS'
    ) {
      this.setState({
        walletBackupModalVisible: true,
      })
    }
  }

  getLastBackupTime() {
    return this.props.lastSuccessfulBackup !== '' ? (
      <CustomText
        transparentBg
        h7
        bold
        style={[styles.backupTimeSubtitleStyle]}
      >
        Last backup was{' '}
        <CustomDate transparentBg h7 bold style={[styles.subtitleColor]}>
          {this.props.lastSuccessfulBackup}
        </CustomDate>
      </CustomText>
    ) : (
      'Please create backup now!'
    )
  }

  render() {
    const { walletBalance } = this.props

    const toggleSwitch =
      Platform.OS === 'ios' ? (
        <Switch
          disabled={this.state.disableTouchIdSwitch}
          trackColor={{ true: mantis }}
          onValueChange={this.onChangeTouchId}
          value={this.props.touchIdActive}
        />
      ) : (
        <ToggleSwitch
          onToggle={this.onChangeTouchId}
          value={this.props.touchIdActive}
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
      )

    const settingsItemList = [
      //{
      //   id: 1,
      //   title: 'Download A Backup',
      //   // subtitle: this.getLastBackupTime(),
      //   subtitle: 'Choise where to save a .zip backup file',
      //   avatar: (
      //     <View style={{ width: 40, alignItems: 'center' }}>
      //       <SvgCustomIcon name="Backup" fill="#777" width="24" height="24" />
      //     </View>
      //   ),
      //   // rightIcon: <SvgCustomIcon name="ListItemArrow" fill="#A5A5A5" width="8" height="10" />,
      //   rightIcon: 'spinner',
      //   onPress: this.onBackup,
      // },
      // {
      //   id: 2,
      //   title: 'Automatic Cloud Backups',
      //   subtitle: 'Last backup: Just now',
      //   avatar: (
      //     <View style={{ width: 40, alignItems: 'center' }}>
      //       <SvgCustomIcon
      //         name="CloudBackup"
      //         fill="#777"
      //         width="32"
      //         height="22"
      //       />
      //     </View>
      //   ),
      //   rightIcon: <Switch />,
      //   onPress: null,
      // },
      {
        id: 1,
        title: 'Backup Data',
        subtitle: this.getLastBackupTime(),
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon name="Backup" fill="#777" width="24" height="24" />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill="#A5A5A5"
            width="8"
            height="10"
          />
        ),
        onPress: this.onBackup,
      },
      {
        id: 2,
        title: 'Secure With Biometrics',
        subtitle: 'Unlock Connect.Me with your face or finger',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon
              name="Biometrics"
              fill="#777"
              width="24"
              height="27"
            />
          </View>
        ),
        rightIcon: toggleSwitch,
        onPress: this.onChangeTouchId,
      },
      {
        id: 3,
        title: 'Passcode',
        subtitle: 'View/Change your Connect.Me passcode',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon name="Passcode" fill="#777" width="32" height="19" />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill="#A5A5A5"
            width="8"
            height="10"
          />
        ),
        onPress: this.onChangePinClick,
      },
      {
        id: 4,
        title: 'Recovery Phrase',
        subtitle: 'View your Recovery Phrase',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon name="Recovery" fill="#777" width="19" height="29" />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill="#A5A5A5"
            width="8"
            height="10"
          />
        ),
        onPress: this.onRecoveryPhrase,
      },
      {
        id: 5,
        title: 'Chat With Us',
        subtitle: 'Tell us what you think of Connect.Me',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon name="Chat" fill="#777" width="27" height="27" />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill="#A5A5A5"
            width="8"
            height="10"
          />
        ),
        onPress: this.openFeedback,
      },
      {
        id: 6,
        title: 'About',
        subtitle: 'Legal, Version, and Network Information',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon name="About" fill="#777" width="27" height="27" />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill="#A5A5A5"
            width="8"
            height="10"
          />
        ),
        onPress: this.openAboutApp,
      },
      {
        id: 7,
        title: 'Get your ID verified by Onfido',
        subtitle: 'ONFIDO',
        avatar: (
          <View style={styles.avatarView}>
            <Image
              style={styles.onfidoIcon}
              source={require('../images/onfido-logo.png')}
            />
          </View>
        ),

        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill="#A5A5A5"
            width="8"
            height="10"
          />
        ),
        onPress: this.openOnfido,
      },
    ]

    return (
      <View style={styles.container}>
        <SettingsHeader
          // tokenScreen={() => this.openTokenScreen()}
          balance={formatNumbers(walletBalance)}
        />
        <ListItemSettings list={settingsItemList} />
        {Platform.OS === 'ios' ? (
          <BlurView
            style={styles.blurContainer}
            blurType="light"
            blurAmount={8}
          />
        ) : null}
      </View>
    )
  }
}

const mapStateToProps = (state: Store) => ({
  touchIdActive: state.lock.isTouchIdEnabled,
  walletBackup: state.wallet.backup,
  currentScreen: state.route.currentScreen,
  timeStamp: state.route.timeStamp,
  lastSuccessfulBackup: state.backup.lastSuccessfulBackup,
  walletBalance: getWalletBalance(state),
})

const mapDispatchToProps = dispatch =>
  bindActionCreators({ selectUserAvatar }, dispatch)

export const SettingStack: any = createStackNavigator({
  [settingsRoute]: {
    screen: withStatusBar()(
      connect(mapStateToProps, mapDispatchToProps)(Settings)
    ),
  },
  [aboutAppRoute]: {
    screen: AboutApp,
  },
  [onfidoRoute]: {
    screen: Onfido,
  },
  [privacyTNCRoute]: {
    screen: PrivacyTNC,
  },
})

SettingStack.navigationOptions = ({ navigation }: ReactNavigation) => {
  let tabBarVisible = true
  let swipeEnabled = true
  if (navigation.state.index > 0) {
    tabBarVisible = false
    swipeEnabled = false
  }
  return {
    tabBarVisible,
    swipeEnabled,
  }
}

export default SettingStack

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  blurContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: measurements.bottomBlurNavBarHeight,
  },
  subtitleColor: {
    color: grey,
    fontFamily: font.family,
  },
  backupTimeSubtitleStyle: {
    marginLeft: 10,
    color: grey,
    fontFamily: font.family,
  },
  onfidoIcon: {
    width: 27,
    height: 27,
  },
  avatarView: {
    width: 40,
    alignItems: 'center',
  },
})
