// @flow
import React, { Component } from 'react'
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
  Dimensions,
} from 'react-native'
import * as RNLocalize from 'react-native-localize'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { Apptentive } from 'apptentive-react-native'
import moment from 'moment'
import { ListItem } from 'react-native-elements'
import get from 'lodash.get'

import {
  UserAvatar,
  CustomText,
  Icon,
  Avatar,
  PrimaryHeader,
  CameraButton,
} from '../components'
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
  qrCodeScannerTabRoute,
  lockAuthorizationHomeRoute,
  lockPinSetupRoute,
} from '../common/route-constants'
import ToggleSwitch from 'react-native-flip-toggle-button'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { colors, fontFamily, fontSizes } from '../common/styles/constant'
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
} from '../my-connections/my-connections-constants'
import type { Store } from '../store/type-store'
import type { SettingsProps, SettingsState } from './type-settings'
import type { ImageSource, ReactNavigation } from '../common/type-common'
import { selectUserAvatar } from '../store/user/user-store'
import {
  exportBackup,
  generateBackupFile,
  generateRecoveryPhrase,
} from '../backup/backup-store'
import {
  setAutoCloudBackupEnabled,
  cloudBackupFailure,
  viewedWalletError,
} from '../backup/backup-actions'

import { WalletBalance } from '../wallet/wallet-balance'
import {
  getWalletBalance,
  getAutoCloudBackupEnabled,
  getHasVerifiedRecoveryPhrase,
} from '../store/store-selector'
import SvgCustomIcon from '../components/svg-setting-icons'
import { withStatusBar } from '../components/status-bar/status-bar'
import {
  CLOUD_BACKUP_LOADING,
  CLOUD_BACKUP_FAILURE,
  AUTO_CLOUD_BACKUP_ENABLED,
  WALLET_BACKUP_FAILURE,
  WALLET_BACKUP_FAILURE_VIEWED,
} from '../backup/type-backup'
import { secureSet, walletSet, safeSet } from '../services/storage'
import { addPendingRedirection } from '../lock/lock-store'
import { cloudBackupStart } from '../backup/backup-store'
import { newConnectionSeen } from '../connection-history/connection-history-store'
import { setupApptentive } from '../feedback'
import { customLogger } from '../store/custom-logger'
import { getConnections } from '../store/connections-store'
import type { Connection } from '../store/type-connection-store'
import { NotificationCard } from '../in-app-notification/in-app-notification-card'

// Use this variable to show/hide token amount
// if we just comment out code, then we need to adjust other styles as well
const hideTokenScreen = true

// Hate to put below logic for height and padding calculations here.
// Ideally, these things should automatically adjusted by flex
// but, when we redesigned settings view, we used View with absolute
// positioning. In absolute positioning, we gave explicit height as well
// and since we gave explicit heights, then we need to adjust other
// elements to give padding similar to height, so other elements can be
// positioned fine as well.
// And now we have to show token balance in settings view, so we need to
// take token height as well into consideration for height and padding
let headerHeight = verticalScale(90)
if (!hideTokenScreen) {
  headerHeight += moderateScale(40)
}
let listTopPadding = headerHeight + verticalScale(2)

const style = StyleSheet.create({
  secondaryContainer: {
    backgroundColor: colors.cmGray5,
  },
  userAvatarContainer: {
    height: headerHeight,
    width: '100%',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    backgroundColor: colors.cmWhite,
    shadowColor: colors.cmBlack,
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
  listContainer: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    backgroundColor: colors.cmGray5,
    padding: 0,
  },
  listItemContainer: {
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderBottomColor: colors.cmGray4,
    backgroundColor: colors.cmGray5,
    minHeight: verticalScale(52),
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: moderateScale(10),
  },
  titleStyle: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: 'bold',
    color: colors.cmGray2,
  },
  walletNotBackedUpTitleStyle: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: 'bold',
    color: colors.cmRed,
  },
  subtitleStyle: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size8),
    color: colors.cmGray2,
  },
  walletNotBackedUpSubtitleStyle: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size8),
    color: colors.cmRed,
  },
  subtitleFail: {
    color: colors.cmRed,
  },
  avatarStyle: { backgroundColor: colors.cmGray5, padding: moderateScale(5) },
  username: {
    fontSize: verticalScale(fontSizes.size4),
    padding: '3%',
  },
  tokenText: {
    fontSize: verticalScale(fontSizes.size8),
    paddingTop: moderateScale(5),
    paddingBottom: moderateScale(5),
    textAlign: 'center',
  },
  editIcon: {
    width: EDIT_ICON_DIMENSIONS,
    height: EDIT_ICON_DIMENSIONS,
  },
  labelImage: {
    marginRight: moderateScale(10),
  },
  floatTokenAmount: {
    color: colors.cmGray1,
    paddingHorizontal: moderateScale(8),
  },
  backupTimeSubtitleStyle: {
    marginLeft: moderateScale(10),
    color: colors.cmGray2,
    fontFamily: fontFamily,
  },
  subtitleColor: {
    color: colors.cmGray2,
    fontFamily: fontFamily,
  },
  onfidoIcon: {
    width: verticalScale(24),
    height: verticalScale(24),
    marginHorizontal: moderateScale(10),
  },
})

export class Settings extends Component<SettingsProps, SettingsState> {
  state = {
    walletBackupModalVisible: false,
    disableTouchIdSwitch: false,
  }

  onAuthSuccess = () => {
    this.props.navigation.push(lockPinSetupRoute, {
      existingPin: true,
    })
  }

  onChangePinClick = () => {
    const { navigation } = this.props
    navigation.navigate(lockAuthorizationHomeRoute, {
      onSuccess: this.onAuthSuccess,
    })
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
    else if (minutes >= 60) return 'An hour ago'
    else if (minutes >= 5) return `${minutes} minutes ago`
    else if (minutes >= 2) return 'A few minutes ago'
    else return 'Just now'
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
    const locales = RNLocalize.getLocales()
    let showComingSoonAlert = false

    if (locales.length > 0) {
      const countryCode = locales[0].countryCode
      if (['US', 'GB', 'CA'].includes(countryCode)) {
        this.props.navigation.navigate(onfidoRoute, {})
      } else {
        showComingSoonAlert = true
      }
    } else {
      showComingSoonAlert = true
    }

    if (showComingSoonAlert) {
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

  openStyleGuide = () => {
    this.props.navigation.navigate(designStyleGuideRoute, {})
  }

  openTokenScreen = () => {
    this.props.navigation.navigate(walletRoute)
  }

  openFeedback = () => {
    try {
      Apptentive.presentMessageCenter()
    } catch (e) {
      customLogger.log(e)
    }
  }

  static navigationOptions = {
    header: null,
  }

  // renderAvatarWithSource = (avatarSource: number | ImageSource) => {
  //   let medium = isIphoneXR || isIphoneX
  //   return <Avatar medium={medium} small={!medium} round src={avatarSource} />
  // }

  hideWalletPopupModal = () => {
    this.setState({
      walletBackupModalVisible: false,
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps: SettingsProps) {
    if (
      !this.props.hasViewedWalletError &&
      this.props.cloudBackupError !== null &&
      (this.props.currentScreen === 'Settings' ||
        nextProps.currentScreen === 'Settings')
    ) {
      this.props.viewedWalletError(true)
    }
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

  componentDidMount() {
    setupApptentive().catch((e) => {
      customLogger.log(e)
    })
  }

  getLastBackupTitle = () => {
    return this.getLastBackupTime()
  }

  getLastBackupTime() {
    // return this.props.connectionsUpdated === false || this.props.autoCloudBackupEnabled? (
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
    } else if (
      this.props.cloudBackupStatus === CLOUD_BACKUP_FAILURE ||
      this.props.cloudBackupStatus === WALLET_BACKUP_FAILURE
    ) {
      return (
        <CustomText
          transparentBg
          h7
          bold
          style={[style.backupTimeSubtitleStyle, style.subtitleFail]}
        >
          {this.props.cloudBackupStatus === CLOUD_BACKUP_FAILURE
            ? 'Backup failed. Tap to retry'
            : 'Backup failed, size limit exceeded'}
        </CustomText>
      )
    } else return this.getLastCloudBackupTime()
  }

  getLastCloudBackupTime() {
    // return this.props.lastSuccessfulCloudBackup === 'error' ? (
    return this.props.cloudBackupError === WALLET_BACKUP_FAILURE ? (
      'Backup failed, size limit exceeded'
    ) : // ) : this.props.lastSuccessfulCloudBackup === 'Failed to create backup: Timed out in push notifications' ? (
    this.props.cloudBackupStatus === CLOUD_BACKUP_FAILURE ? (
      'Backup failed. Tap to retry'
    ) : this.props.lastSuccessfulCloudBackup !== '' ? (
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
    if (
      this.props.cloudBackupStatus === CLOUD_BACKUP_FAILURE ||
      this.props.cloudBackupStatus === WALLET_BACKUP_FAILURE ||
      this.props.cloudBackupError === WALLET_BACKUP_FAILURE
    ) {
      this.props.cloudBackupStart()
      return
    }
    const {
      navigation: { navigate, state, goBack },
    } = this.props
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
    } else {
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
      cloudBackupError,
    } = this.props
    const hasBackupError = cloudBackupError === WALLET_BACKUP_FAILURE
    const hasCloudBackupFailed =
      this.props.cloudBackupStatus === WALLET_BACKUP_FAILURE ||
      this.props.cloudBackupStatus === CLOUD_BACKUP_FAILURE ||
      cloudBackupError === WALLET_BACKUP_FAILURE

    const userAvatar = (
      <CustomView center style={[style.userAvatarContainer]}>
        <CustomView verticalSpace>
          <UserAvatar testID={USER_AVATAR_TEST_ID} userCanChange>
            {/* {this.renderAvatarWithSource} */}
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
          trackColor={{ true: colors.cmGreen1 }}
          onValueChange={this.onChangeTouchId}
          value={this.props.touchIdActive}
        />
      ) : (
        <ToggleSwitch
          onToggle={this.onChangeTouchId}
          value={this.props.touchIdActive}
          buttonWidth={moderateScale(55)}
          buttonHeight={moderateScale(30)}
          buttonRadius={moderateScale(30)}
          sliderWidth={moderateScale(28)}
          sliderHeight={moderateScale(28)}
          sliderRadius={moderateScale(58)}
          buttonOnColor={colors.cmGreen1}
          buttonOffColor={colors.cmGray4}
          sliderOnColor={colors.cmWhite}
          sliderOffColor={colors.cmWhite}
        />
      )
    const cloudToggleSwitch =
      Platform.OS === 'ios' ? (
        <Switch
          disabled={this.state.disableTouchIdSwitch}
          trackColor={{ true: colors.cmGreen1 }}
          onValueChange={this.toggleAutoCloudBackupEnabled}
          value={this.props.autoCloudBackupEnabled}
        />
      ) : (
        <ToggleSwitch
          isOn={true}
          onToggle={this.toggleAutoCloudBackupEnabled}
          value={this.props.autoCloudBackupEnabled}
          buttonWidth={moderateScale(55)}
          buttonHeight={moderateScale(30)}
          buttonRadius={moderateScale(30)}
          sliderWidth={moderateScale(28)}
          sliderHeight={moderateScale(28)}
          sliderRadius={moderateScale(58)}
          buttonOnColor={colors.cmGreen1}
          buttonOffColor={colors.cmGray4}
          sliderOnColor={colors.cmWhite}
          sliderOffColor={colors.cmWhite}
        />
      )

    const settingsItemList = [
      {
        id: 1,
        title: this.renderBackupTitleText(),
        subtitle: this.getLastBackupTitle(),
        avatar: (
          <SvgCustomIcon
            fill={
              this.props.connectionsUpdated && !this.props.isAutoBackupEnabled
                ? // || (this.props.connectionsUpdated && this.props.isAutoBackupEnabled && hasCloudBackupFailed)
                  colors.cmRed
                : colors.cmGray2
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
        avatar: (
          <SvgCustomIcon
            fill={hasCloudBackupFailed ? colors.cmRed : colors.cmGray2}
            name="CloudBackup"
          />
        ),
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
        avatar: <SvgCustomIcon fill={colors.cmGray2} name="Biometrics" />,
        rightIcon: toggleSwitch,
        onPress: this.onChangeTouchId,
      },
      {
        id: 4,
        title: 'Passcode',
        subtitle: 'View/Change your Connect.Me passcode',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon
              name="Passcode"
              fill={colors.cmGray2}
              width={verticalScale(32)}
              height={verticalScale(19)}
            />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill={colors.cmGray3}
            width={verticalScale(8)}
            height={verticalScale(9)}
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
              fill={colors.cmGray2}
              width={verticalScale(27)}
              height={verticalScale(27)}
            />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill={colors.cmGray3}
            width={verticalScale(8)}
            height={verticalScale(9)}
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
            <SvgCustomIcon
              name="Chat"
              fill={colors.cmGray2}
              width={verticalScale(27)}
              height={verticalScale(27)}
            />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill={colors.cmGray3}
            width={verticalScale(8)}
            height={verticalScale(9)}
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
            <SvgCustomIcon
              name="About"
              fill={colors.cmGray2}
              width={verticalScale(27)}
              height={verticalScale(27)}
            />
          </View>
        ),
        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill={colors.cmGray3}
            width={verticalScale(8)}
            height={verticalScale(9)}
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
            fill={colors.cmGray3}
            width={verticalScale(8)}
            height={verticalScale(9)}
          />
        ),
        onPress: this.openOnfido,
      },
    ]
    if (__DEV__ === true) {
      settingsItemList.push({
        id: 9,
        title: 'Design styleguide',
        subtitle: 'Development only',
        avatar: (
          <View style={styles.avatarView}>
            <SvgCustomIcon
              name="About"
              fill={colors.cmGray2}
              width={verticalScale(27)}
              height={verticalScale(27)}
            />
          </View>
        ),

        rightIcon: (
          <SvgCustomIcon
            name="ListItemArrow"
            fill={colors.cmGray3}
            width={verticalScale(8)}
            height={verticalScale(9)}
          />
        ),
        onPress: this.openStyleGuide,
      })
    }

    return (
      <Container>
        <NotificationCard />

        <CustomView
          style={[style.secondaryContainer]}
          tertiary
          testID="settings-container"
          accessible={true}
          accessibilityLabel="settings-container"
        >
          <ScrollView>
            <CustomView
              style={[
                style.secondaryContainer,
                style.listContainer,
                {
                  height: Dimensions.get('window').height,
                  paddingTop: listTopPadding,
                  paddingBottom: moderateScale(50),
                },
              ]}
            >
              {settingsItemList.map((item, index) => {
                // disable manual backup as well. Remove below line to enable manual backup in ConnectMe
                if (index === 0) {
                  return
                }

                if (!this.props.isCloudBackupEnabled) {
                  if (index === 1) {
                    // if cloud backup is not enabled, then we hide cloud backup option
                    return
                  }
                }
                if ((index === 1 || index === 4) && !hasVerifiedRecoveryPhrase)
                  return
                return (
                  <ListItem
                    containerStyle={[style.listItemContainer]}
                    titleStyle={[
                      (this.props.connectionsUpdated &&
                        item.id === 1 &&
                        !this.props.isAutoBackupEnabled) ||
                      (item.id === 2 && hasCloudBackupFailed)
                        ? style.walletNotBackedUpTitleStyle
                        : style.titleStyle,
                    ]}
                    subtitleStyle={[
                      (this.props.connectionsUpdated &&
                        item.id === 1 &&
                        !this.props.isAutoBackupEnabled) ||
                      (item.id === 2 && hasBackupError)
                        ? // && this.props.lastSuccessfulCloudBackup === 'error'
                          style.walletNotBackedUpSubtitleStyle
                        : style.subtitleStyle,
                    ]}
                    key={index}
                    title={item && item.title}
                    subtitle={item && item.subtitle}
                    leftAvatar={item && item.avatar}
                    rightIcon={
                      item.rightIcon !== ''
                        ? item.rightIcon
                        : { name: 'chevron-right' }
                    }
                    onPress={item && item.onPress}
                  />
                )
              })}
            </CustomView>
          </ScrollView>
          <PrimaryHeader headline="Settings" />
        </CustomView>
        <CameraButton
          onPress={() => this.props.navigation.navigate(qrCodeScannerTabRoute)}
        />
      </Container>
    )
  }
}

const mapStateToProps = (state: Store) => ({
  status: state.backup.status,
  cloudBackupError: state.backup.cloudBackupError,
  touchIdActive: state.lock.isTouchIdEnabled,
  walletBackup: state.wallet.backup,
  currentScreen: state.route.currentScreen,
  timeStamp: state.route.timeStamp,
  lastSuccessfulBackup: state.backup && state.backup.lastSuccessfulBackup,
  lastSuccessfulCloudBackup:
    state.backup && state.backup.lastSuccessfulCloudBackup,
  autoCloudBackupEnabled: state.backup.autoCloudBackupEnabled,
  cloudBackupStatus: state.backup.cloudBackupStatus,
  hasViewedWalletError: state.backup.hasViewedWalletError,
  connectionsUpdated:
    state.history.data && state.history.data.connectionsUpdated,
  walletBalance: getWalletBalance(state),
  hasVerifiedRecoveryPhrase: getHasVerifiedRecoveryPhrase(state),
  isCloudBackupEnabled: false,
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      cloudBackupFailure,
      selectUserAvatar,
      setAutoCloudBackupEnabled,
      exportBackup,
      generateBackupFile,
      addPendingRedirection,
      generateRecoveryPhrase,
      viewedWalletError,
      cloudBackupStart,
    },
    dispatch
  )

export const SettingsScreen = withStatusBar()(
  connect(mapStateToProps, mapDispatchToProps)(Settings)
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: colors.cmWhite,
  },
  subtitleColor: {
    color: colors.cmGray2,
    fontFamily: fontFamily,
  },
  backupTimeSubtitleStyle: {
    marginLeft: moderateScale(10),
    color: colors.cmGray2,
    fontFamily: fontFamily,
  },
  onfidoIcon: {
    width: verticalScale(22),
    height: verticalScale(22),
  },
  avatarView: {
    width: moderateScale(40),
    alignItems: 'center',
  },
})

export const tokenAmountSize = (tokenAmountLength: number): number => {
  // this resizing logic is different than wallet tabs header
  switch (true) {
    case tokenAmountLength < 16:
      return verticalScale(26)
    case tokenAmountLength < 20:
      return verticalScale(20)
    default:
      return verticalScale(19)
  }
}
