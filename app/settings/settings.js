// @flow
import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  Alert,
  Text,
  Switch,
  StyleSheet,
  NativeModules,
  Platform,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
} from 'react-native'
import { measurements } from '../common/styles/measurements'
import { BlurView } from 'react-native-blur'
import { createStackNavigator } from 'react-navigation'
import { UserAvatar, CustomText, Icon, Avatar } from '../components'
import { CustomView, Container } from '../components/layout'
import {
  cloudBackupRoute,
  settingsRoute,
  lockEnterPinRoute,
  lockTouchIdSetupRoute,
  aboutAppRoute,
  designStyleGuideRoute,
  onfidoRoute,
  privacyTNCRoute,
  genRecoveryPhraseRoute,
  walletRoute,
  exportBackupFileRoute,
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
  maroonRed,
  font,
  lightDarkGray,
  lightWhite,
  gainsBoro,
  isIphoneX,
  isIphoneXR,
  isiPhone5,
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
import {
  SOVRIN_TOKEN_AMOUNT_TEST_ID,
  SOVRIN_TOKEN_TEST_ID,
} from '../home/home-constants'
import type { Store } from '../store/type-store'
import type { SettingsProps, SettingsState } from './type-settings'
import type { ImageSource, ReactNavigation } from '../common/type-common'
import { selectUserAvatar } from '../store/user/user-store'
import {
  setAutoCloudBackupEnabled,
  exportBackup,
  generateBackupFile,
  generateRecoveryPhrase,
} from '../backup/backup-store'
import { Apptentive } from 'apptentive-react-native'
import AboutApp from '../about-app/about-app'
import DesignStyleguide from '../design-styleguide/design-styleguide'
import Onfido from '../onfido/onfido'
import { PrivacyTNC } from '../privacy-tnc/privacy-tnc-screen'
import { WalletBalance } from '../wallet/wallet-balance'
import { size } from '../components/icon'
import { Dimensions } from 'react-native'
import { darkGray } from '../common/styles/constant'
import { List, ListItem } from 'react-native-elements'

import get from 'lodash.get'
import {
  getWalletBalance,
  getAutoCloudBackupEnabled,
  getHasVerifiedRecoveryPhrase,
} from '../store/store-selector'
import { tokenAmountSize } from '../home/home'

import SvgCustomIcon from '../components/svg-setting-icons'
import { withStatusBar } from '../components/status-bar/status-bar'
import moment from 'moment'
import {
  CLOUD_BACKUP_LOADING,
  CLOUD_BACKUP_FAILURE,
  AUTO_CLOUD_BACKUP_ENABLED,
} from '../backup/type-backup'
import { secureSet, walletSet, safeSet } from '../services/storage'
import { addPendingRedirection } from '../lock/lock-store'

// Use this variable to show/hide token amount
// if we just comment out code, then we need to adjust other styles as well
const hideTokenScreen = false

// Hate to put below logic for height and padding calculations here.
// Ideally, these things should automatically adjusted by flex
// but, when we redesigned settings view, we used View with absolute
// positioning. In absolute positioning, we gave explicit height as well
// and since we gave explicit heights, then we need to adjust other
// elements to give padding similar to height, so other elements can be
// positioned fine as well.
// And now we have to show token balance in settings view, so we need to
// take token height as well into consideration for height and padding
let headerHeight = 116
if (isIphoneXR || isIphoneX) {
  headerHeight = 180
}
if (!hideTokenScreen) {
  headerHeight += 40
}
let listTopPadding = headerHeight - 20

const style = StyleSheet.create({
  secondaryContainer: {
    backgroundColor: lightDarkGray,
  },
  userAvatarContainer: {
    height: headerHeight,
    width: '100%',
    position: 'absolute',
    zIndex: 10000,
    top: 0,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  userAvatarContainerBlur: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: headerHeight,
  },
  footerBlur: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: measurements.bottomBlurNavBarHeight,
  },
  listContainer: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    backgroundColor: lightDarkGray,
    padding: 0,
  },
  listItemContainer: {
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderBottomColor: gainsBoro,
    minHeight: isiPhone5 ? 52 : 64,
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingRight: 10,
  },
  titleStyle: {
    fontFamily: font.family,
    fontSize: font.size.M1,
    fontWeight: 'bold',
    color: grey,
  },
  walletNotBackedUpTitleStyle: {
    fontFamily: font.family,
    fontSize: font.size.M1,
    fontWeight: 'bold',
    color: maroonRed,
  },
  subtitleStyle: {
    fontFamily: font.family,
    fontSize: font.size.XXS,
    color: grey,
  },
  walletNotBackedUpSubtitleStyle: {
    fontFamily: font.family,
    fontSize: font.size.XXS,
    color: maroonRed,
  },
  subtitleFail: {
    color: maroonRed,
  },
  avatarStyle: { backgroundColor: lightDarkGray, padding: 5 },
  username: {
    fontSize: font.size.ML1,
    padding: '3%',
  },
  tokenText: {
    fontSize: font.size.XXS,
    paddingTop: 5,
    paddingBottom: 5,
    textAlign: 'center',
  },
  editIcon: {
    width: EDIT_ICON_DIMENSIONS,
    height: EDIT_ICON_DIMENSIONS,
  },
  labelImage: {
    marginRight: OFFSET_1X,
  },
  floatTokenAmount: {
    color: darkGray,
    paddingHorizontal: 8,
  },
  backupTimeSubtitleStyle: {
    marginLeft: 10,
    color: grey,
    fontFamily: font.family,
  },
  subtitleColor: {
    color: grey,
    fontFamily: font.family,
  },
  onfidoIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 10,
  },
})

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

  renderBlurForIos = (style: Object) => {
    if (Platform.OS === 'ios') {
      return <BlurView style={style} blurType="light" blurAmount={8} />
    } else return null
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
  toggleAutoCloudBackupEnabled = (switchState: boolean) => {
    // popup modal to enable cloud back but no modal needed when setting automatic
    // backup to false
    // NOTE: might swtich to - this.props.navigation.navigate(cloudBackupRoute, {fromToggleAction: true, switchState})
    if (switchState) {
      this.props.navigation.navigate(cloudBackupRoute, {})
    } else {
      walletSet(AUTO_CLOUD_BACKUP_ENABLED, switchState.toString())
      safeSet(AUTO_CLOUD_BACKUP_ENABLED, switchState.toString())
      this.props.setAutoCloudBackupEnabled(switchState)
    }
  }
  formatBackupString = (date?: string) => {
    const now = moment().valueOf()
    var lastBackupDate = moment(date).valueOf()
    let minutes = Math.floor((now - lastBackupDate) / 1000 / 60)

    if (minutes >= 24 * 60) {
      return moment(date).format('h:mm a, MMMM Do YYYY')
    } else if (minutes >= 120) return `${Math.floor(minutes / 60)} hours ago`
    else if (minutes >= 60) return 'an hour ago'
    else if (minutes >= 5) return `${minutes} minutes ago`
    else if (minutes >= 2) return 'a few minutes ago'
    else return 'just now'
  }

  onBackup = () => {
    const {
      generateRecoveryPhrase,
      hasVerifiedRecoveryPhrase,
      navigation: { navigate, state, goBack },
    } = this.props
    // If no there is no route, then default to Settings
    const initialRoute = get(state, 'routeName', settingsRoute)

    //goto genRecoveryPhraseRoute if no cloudbackup or zip backup
    if (!hasVerifiedRecoveryPhrase) {
      navigate(genRecoveryPhraseRoute, {
        initialRoute,
      })
    } else {
      generateRecoveryPhrase()
      navigate(exportBackupFileRoute, {
        initialRoute,
      })
    }
  }
  viewRecoveryPhrase = () => {
    this.props.addPendingRedirection([
      { routeName: genRecoveryPhraseRoute, params: { viewOnlyMode: true } },
    ])
    const { navigation } = this.props
    if (navigation.isFocused()) {
      navigation.push && navigation.push(lockEnterPinRoute, {})
    }
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

  openStyleguide = () => {
    this.props.navigation.navigate(designStyleGuideRoute, {})
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

  renderAvatarWithSource = (avatarSource: number | ImageSource) => {
    let medium = isIphoneXR || isIphoneX
    return <Avatar medium={medium} small={!medium} round src={avatarSource} />
  }

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
  getLastBackupTitle = () => {
    return this.getLastBackupTime()
  }

  getLastBackupTime() {
    return this.props.connectionsUpdated === false ? (
      <CustomText
        transparentBg
        h7
        bold
        style={[styles.backupTimeSubtitleStyle]}
      >
        Choose where to save a .zip backup file
      </CustomText>
    ) : (
      'You have unsaved Connect.Me information'
    )
  }
  getCloudBackupSubtitle = () => {
    if (this.props.cloudBackupStatus === CLOUD_BACKUP_LOADING) {
      return 'Backing up...'
    } else if (this.props.cloudBackupStatus === CLOUD_BACKUP_FAILURE) {
      return (
        <CustomText
          transparentBg
          h7
          bold
          style={[style.backupTimeSubtitleStyle, style.subtitleFail]}
        >
          Backup failed. Tap to retry
        </CustomText>
      )
    } else return this.getLastCloudBackupTime()
  }
  getLastCloudBackupTime() {
    return this.props.lastSuccessfulCloudBackup !== '' ? (
      <CustomText transparentBg h7 bold style={[style.backupTimeSubtitleStyle]}>
        Last backup was{' '}
        <CustomText transparentBg h7 bold style={[style.subtitleColor]}>
          {this.formatBackupString(this.props.lastSuccessfulCloudBackup)}
        </CustomText>
      </CustomText>
    ) : (
      'Sync your app backup in the cloud.'
    )
  }

  onCloudBackupPressed = () => {
    const { navigation: { navigate, state, goBack } } = this.props
    navigate(cloudBackupRoute, {})
  }

  renderLastBackupText = () => {
    if (this.props.lastSuccessfulBackup !== '') {
      const lastSuccessfulBackup = this.formatBackupString(
        this.props.lastSuccessfulBackup
      )

      if (this.props.lastSuccessfulCloudBackup !== '') {
        const lastSuccessfulCloudBackup = this.formatBackupString(
          this.props.lastSuccessfulCloudBackup
        )

        if (
          moment(this.props.lastSuccessfulCloudBackup).isBefore(
            this.props.lastSuccessfulBackup
          )
        ) {
          return `Last Backup: ${lastSuccessfulBackup}`
        } else {
          return `Last Backup: ${lastSuccessfulCloudBackup}`
        }
      }
      return `Last Backup: ${lastSuccessfulBackup}`
    } else if (this.props.lastSuccessfulCloudBackup !== '') {
      const lastSuccessfulCloudBackup = this.formatBackupString(
        this.props.lastSuccessfulCloudBackup
      )

      if (this.props.lastSuccessfulBackup !== '') {
        const lastSuccessfulBackup = this.formatBackupString(
          this.props.lastSuccessfulBackup
        )

        if (
          moment(this.props.lastSuccessfulBackup).isBefore(
            this.props.lastSuccessfulCloudBackup
          )
        ) {
          return `Last Backup: ${lastSuccessfulCloudBackup}`
        } else {
          return `Last Backup: ${lastSuccessfulBackup}`
        }
      }
      return `Last Backup: ${lastSuccessfulCloudBackup}`
    } else return 'Last Backup: Never'
  }

  renderBackupTitleText = () => {
    if (
      !this.props.lastSuccessfulBackup &&
      !this.props.lastSuccessfulCloudBackup
    ) {
      return 'Create a Backup'
    } else if (this.props.connectionsUpdated) {
      return this.renderLastBackupText()
    } else if (this.props.connectionsUpdated === false) {
      return 'Manual Backup'
    }
  }

  render() {
    const {
      walletBalance,
      lastSuccessfulCloudBackup,
      lastSuccessfulBackup,
      cloudBackupStatus,
      hasVerifiedRecoveryPhrase,
    } = this.props
    const userAvatar = (
      <CustomView center style={[style.userAvatarContainer]}>
        <CustomView verticalSpace>
          <UserAvatar testID={USER_AVATAR_TEST_ID} userCanChange>
            {this.renderAvatarWithSource}
          </UserAvatar>
        </CustomView>
        {!hideTokenScreen && (
          <TouchableOpacity
            onPress={this.openTokenScreen}
            testID={SOVRIN_TOKEN_AMOUNT_TEST_ID}
          >
            <CustomView row center>
              <Icon
                small
                testID={SOVRIN_TOKEN_TEST_ID}
                src={require('../images/sovrinTokenOrange.png')}
              />
              <CustomText
                h5
                demiBold
                center
                style={[
                  style.floatTokenAmount,
                  {
                    fontSize: tokenAmountSize(
                      walletBalance ? walletBalance.length : 0
                    ),
                  },
                ]}
                transparentBg
                formatNumber
              >
                {walletBalance}
              </CustomText>
            </CustomView>
            <CustomView>
              <CustomText transparentBg darkgray style={[style.tokenText]}>
                TOKENS
              </CustomText>
            </CustomView>
          </TouchableOpacity>
        )}
      </CustomView>
    )

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
    const cloudToggleSwitch =
      Platform.OS === 'ios' ? (
        <Switch
          disabled={this.state.disableTouchIdSwitch}
          trackColor={{ true: mantis }}
          onValueChange={this.toggleAutoCloudBackupEnabled}
          value={this.props.autoCloudBackupEnabled}
        />
      ) : (
        <ToggleSwitch
          onToggle={this.toggleAutoCloudBackupEnabled}
          value={this.props.autoCloudBackupEnabled}
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
        title: this.renderBackupTitleText(),
        subtitle: this.getLastBackupTitle(),
        avatar: (
          <SvgCustomIcon
            fill={
              this.props.connectionsUpdated && !this.props.isAutoBackupEnabled
                ? maroonRed
                : '#777'
            }
            name="Backup"
          />
        ),
        rightIcon: '',
        onPress: this.onBackup,
      },
      {
        id: 2,
        title: 'Automatic Cloud Backups',
        subtitle: this.getCloudBackupSubtitle(),
        avatar: <SvgCustomIcon fill="#777" name="CloudBackup" />,
        rightIcon:
          cloudBackupStatus === CLOUD_BACKUP_LOADING ? (
            <ActivityIndicator />
          ) : (
            cloudToggleSwitch
          ),
        onPress:
          cloudBackupStatus === CLOUD_BACKUP_LOADING
            ? () => {}
            : this.onCloudBackupPressed,
      },
      {
        id: 3,
        title: 'Biometrics',
        subtitle: 'Use your finger or face to secure app',
        avatar: <SvgCustomIcon fill="#777" name="Biometrics" />,
        rightIcon: toggleSwitch,
        onPress: this.onChangeTouchId,
      },
      {
        id: 4,
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
        id: 5,
        title: 'Recovery Phrase',
        subtitle: 'View your Recovery Phrase',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon
              name="ViewPassPhrase"
              fill="#777"
              width="27"
              height="27"
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
        onPress: this.viewRecoveryPhrase,
      },
      {
        id: 6,
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
        id: 7,
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
        id: 8,
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
      __DEV__ && {
        id: 9,
        title: 'Design styleguide',
        subtitle: 'Development only',
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
        onPress: this.openStyleguide,
      },
    ]

    return (
      <Container>
        <CustomView style={[style.secondaryContainer]} tertiary>
          {userAvatar}
          <ScrollView>
            <List
              containerStyle={[
                style.secondaryContainer,
                style.listContainer,
                {
                  height: Dimensions.get('window').height,
                  paddingTop: listTopPadding,
                  paddingBottom: measurements.bottomNavBarHeight,
                },
              ]}
            >
              {settingsItemList.map((item, index) => {
                if ((index === 1 || index === 4) && !hasVerifiedRecoveryPhrase)
                  return
                return (
                  <ListItem
                    containerStyle={[style.listItemContainer]}
                    titleStyle={[
                      this.props.connectionsUpdated &&
                      item.id === 1 &&
                      !this.props.isAutoBackupEnabled
                        ? style.walletNotBackedUpTitleStyle
                        : style.titleStyle,
                    ]}
                    subtitleStyle={[
                      this.props.connectionsUpdated &&
                      item.id === 1 &&
                      !this.props.isAutoBackupEnabled
                        ? style.walletNotBackedUpSubtitleStyle
                        : style.subtitleStyle,
                    ]}
                    key={index}
                    title={item && item.title}
                    subtitle={item && item.subtitle}
                    avatarStyle={[style.avatarStyle]}
                    avatar={item && item.avatar}
                    rightIcon={
                      item.rightIcon !== ''
                        ? item.rightIcon
                        : { name: 'chevron-right' }
                    }
                    hideChevron={item && item.rightIcon === ''}
                    onPress={item && item.onPress}
                  />
                )
              })}
            </List>
          </ScrollView>
          {this.renderBlurForIos(style.userAvatarContainerBlur)}
          {this.renderBlurForIos(style.footerBlur)}
        </CustomView>
      </Container>
    )
  }
}

const mapStateToProps = (state: Store) => ({
  status: state.backup.status,
  touchIdActive: state.lock.isTouchIdEnabled,
  walletBackup: state.wallet.backup,
  currentScreen: state.route.currentScreen,
  timeStamp: state.route.timeStamp,
  lastSuccessfulBackup: state.backup && state.backup.lastSuccessfulBackup,
  lastSuccessfulCloudBackup:
    state.backup && state.backup.lastSuccessfulCloudBackup,
  autoCloudBackupEnabled: state.backup.autoCloudBackupEnabled,
  cloudBackupStatus: state.backup.cloudBackupStatus,
  connectionsUpdated:
    state.history.data && state.history.data.connectionsUpdated,
  walletBalance: getWalletBalance(state),
  hasVerifiedRecoveryPhrase: getHasVerifiedRecoveryPhrase(state),
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      selectUserAvatar,
      setAutoCloudBackupEnabled,
      exportBackup,
      generateBackupFile,
      addPendingRedirection,
      generateRecoveryPhrase,
    },
    dispatch
  )

export const SettingStack: any = createStackNavigator({
  [settingsRoute]: {
    screen: withStatusBar()(
      connect(mapStateToProps, mapDispatchToProps)(Settings)
    ),
  },
  [aboutAppRoute]: {
    screen: AboutApp,
  },
  [designStyleGuideRoute]: {
    screen: DesignStyleguide,
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
