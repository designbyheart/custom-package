// @flow
import React from 'react'
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  Text,
} from 'react-native'
import {
  createStackNavigator,
  TabBarBottom,
  createTabNavigator,
  createDrawerNavigator,
  SafeAreaView,
  DrawerItems,
} from 'react-navigation'
import DeviceInfo from 'react-native-device-info'
import AboutApp from './about-app/about-app'
import MyConnectionsScreen from './my-connections/my-connections'
import HomeScreen from './home/home'
import SplashScreenView from './start-up/splash-screen'
import Settings from './settings/settings'
import ExpiredTokenScreen from './expired-token/expired-token'
import QRCodeScanner from './qr-code/qr-code'
import LockSelectionScreen from './lock/lock-selection'
import SendLogsScreen from './send-logs/send-logs'
import QuestionScreen from './question/question-screen'
import TxnAuthorAgreementScreen from './txn-author-agreement/txn-author-agreement-screen'
import LockEnterPinScreen from './lock/lock-enter-pin-code'
import LockTouchIdSetupScreen from './lock/lock-fingerprint-setup'
import LockPinCodeSetupScreen from './lock/lock-pin-code-setup'
import LockSetupSuccessScreen from './lock/lock-setup-success'
import LockEnterFingerprintScreen from './lock/lock-enter-fingerprint'
import ClaimOffer from './claim-offer/claim-offer'
import ClaimOfferModal from './connection-details/components/claim-offer-modal'
import ProofRequestModal from './connection-details/components/proof-request-modal'
import Modal from './connection-details/components/modal'
import ModalContentProofShared from './connection-details/components/modal-content-proof-shared'
import InvitationScreen from './invitation/invitation'
import ConnectionHistoryNavigator from './connection-history/connection-history-navigator'
import SwitchEnvironmentScreen from './switch-environment/switch-environment'
import LockAuthorization from './lock/lock-authorization'
import WaitForInvitationScreen from './invitation/wait-for-invitation'
import Wallet from './wallet/wallet'
import GenerateRecoveryPhrase from './backup/generate-phrase'
import VerifyRecoveryPhrase from './backup/verify-phrase'
import ExportBackupFile from './backup/export-backup'
import SelectRecoveryMethod from './backup/select-recovery-method'
import CloudBackup from './backup/cloud-backup'
import BackupComplete from './backup/backup-complete'
import BackupErrorScreen from './backup/backup-error'
import WalletTabs from './wallet/wallet-tabs'
import SelectRestoreMethod from './restore/select-restore-method'
import CloudRestoreModal from './cloud-restore/cloud-restore-modal'
import CloudRestore from './cloud-restore/cloud-restore'
import { Icon, CustomView, UserAvatar, CustomText, Avatar } from './components'
import ConnectionHistNavigator from './connection-details/connection-details-navigator'
import {
  splashScreenRoute,
  homeRoute,
  connectionHistoryRoute,
  expiredTokenRoute,
  lockEnterPinRoute,
  lockSelectionRoute,
  lockPinSetupRoute,
  lockTouchIdSetupRoute,
  lockSetupSuccessRoute,
  lockEnterFingerprintRoute,
  claimOfferRoute,
  claimOfferNewRoute,
  settingsTabRoute,
  qrCodeScannerTabRoute,
  proofRequestRoute,
  proofRequestNewRoute,
  invitationRoute,
  switchEnvironmentRoute,
  lockAuthorizationRoute,
  waitForInvitationRoute,
  walletRoute,
  aboutAppRoute,
  designStyleGuideRoute,
  walletTabSendDetailsRoute,
  eulaRoute,
  genRecoveryPhraseRoute,
  verifyRecoveryPhraseRoute,
  exportBackupFileRoute,
  selectRecoveryMethodRoute,
  backupCompleteRoute,
  restoreRoute,
  restoreWaitRoute,
  restorePassphraseRoute,
  backupErrorRoute,
  sendLogsRoute,
  questionRoute,
  txnAuthorAgreementRoute,
  connectionsDrawerRoute,
  credentialsTabRoute,
  discoverTabRoute,
  settingsRoute,
  connectionHistRoute,
  modalContentProofShared,
  modalScreenRoute,
  cloudBackupRoute,
  selectRestoreMethodRoute,
  cloudRestoreRoute,
  cloudRestoreModalRoute,
  openIdConnectRoute,
  settingsDrawerRoute,
  homeDrawerRoute,
} from './common/'
import type { ImageSource } from './common/type-common'
import { color, font } from './common/styles'
import WalletTabSendDetails from './wallet/wallet-tab-send-details'
import EulaScreen from './eula/eula'
import RestoreStartScreen from './restore/restore'
import RestoreWaitScreen from './restore/restore-wait'
import RestorePassphrase from './restore/restore-passphrase'
import { checkIfAnimationToUse } from './bridge/react-native-cxs/RNCxs'
import SvgCustomIcon from './components/svg-custom-icon'
import {
  TAB_CONNECTIONS_TITLE,
  TAB_CREDENTIALS_TITLE,
  TAB_DISCOVER_TITLE,
  TAB_MENU_TITLE,
  TAB_SCAN_TITLE,
} from './type-navigator'
import { measurements } from './common/styles/measurements'
import {
  atlantis,
  mediumGray,
  darkGray2,
  isIphoneX,
  isIphoneXR,
  cmGrey5,
  whiteSolid,
  whiteTransparent,
  isiPhone5,
  unreadMessagesBadgeSizes,
} from '../app/common/styles/constant'
import {
  modalTransitionConfig,
  cardTransitionConfig,
  getResponderDistance,
} from './transition'
import OpenIdConnectScreen from '../app/open-id-connect/open-id-connect-screen'
import SettingsTab from './settings/settings-tab'
import VersionNumber from 'react-native-version-number'
import { UnreadMessagesBadge } from './components'

if (__DEV__) {
  require('../tools/reactotron-config')
}

const { width } = Dimensions.get('screen')

export const styles = StyleSheet.create({
  tabBarContainer: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: cmGrey5,
    backgroundColor: Platform.OS === 'ios' ? whiteTransparent : whiteSolid,
    position: 'absolute',
    bottom: 0,
    height: measurements.bottomNavBarHeight,
    width: '100%',
    zIndex: 100,
  },
  icon: {
    marginBottom: isIphoneX ? 5 : 2,
  },
  tabBarTitle: {
    fontSize: font.size.XXXS,
    fontWeight: 'bold',
    marginBottom: isIphoneX ? 0 : isIphoneXR ? 25 : 8,
  },
  menuIconStyle: {
    paddingTop: 10,
  },
  iphoneXMenuIconStyle: {
    paddingTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  drawerOuterContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: Platform.OS === 'ios' ? (isiPhone5 ? 14 : 20) : 0,
    borderBottomRightRadius: Platform.OS === 'ios' ? (isiPhone5 ? 14 : 20) : 0,
  },
  drawerHeader: {
    width: '100%',
    height: 190,
    justifyContent: 'space-evenly',
    paddingLeft: 20,
  },
  drawerFooterContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerFooter: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  evernymIconImage: {
    width: isiPhone5 ? 26 : 32,
    height: isiPhone5 ? 26 : 32,
    marginLeft: 20,
    marginRight: 10,
  },
  evernymIconTextContainer: {
    height: isiPhone5 ? 26 : 32,
  },
  evernymIconLogoText: {
    height: '50%',
    justifyContent: 'flex-start',
  },
  evernymIconBuildText: {
    height: '50%',
    justifyContent: 'flex-end',
  },
  text: {
    fontFamily: 'Lato',
    fontSize: isiPhone5 ? 10 : 12,
    color: mediumGray,
    fontWeight: 'bold',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  labelText: {
    fontFamily: 'Lato',
    fontSize: isiPhone5 ? 15 : 17,
    fontWeight: '500',
    color: mediumGray,
  },
  labelTextFocusedColor: {
    color: color.bg.twelfth.color,
  },
  customGreenBadgeContainer: {
    width: unreadMessagesBadgeSizes.height,
    height: unreadMessagesBadgeSizes.height,
    borderRadius: unreadMessagesBadgeSizes.height / 2,
    backgroundColor: atlantis,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: isiPhone5 ? 120 : 175,
  },
})

const evernymSquareIcon = require('./images/evernym-square.png')

const versionNumber = VersionNumber

const renderAvatarWithSource = (avatarSource: number | ImageSource) => {
  let medium = isIphoneXR || isIphoneX
  return <Avatar medium={medium} small={!medium} round src={avatarSource} />
}

const drawerComponent = (props: Object) => (
  <SafeAreaView
    style={styles.drawerOuterContainer}
    testID="menu-container"
    accessible={true}
    accessibilityLabel="menu-container"
  >
    <View style={styles.drawerHeader}>
      <SvgCustomIcon
        testID="connect-me-banner"
        accessible={true}
        accessibilityLabel="connect-me-banner"
        name="ConnectMe"
        width={isiPhone5 ? 136 : 152}
        height={isiPhone5 ? 18 : 20}
        fill={darkGray2}
      />
      <UserAvatar userCanChange>{renderAvatarWithSource}</UserAvatar>
    </View>
    <DrawerItems {...props} />
    <View style={styles.drawerFooterContainer}>
      <View style={styles.drawerFooter}>
        <Image source={evernymSquareIcon} style={styles.evernymIconImage} />
        <View style={styles.evernymIconTextContainer}>
          <View style={styles.evernymIconLogoText}>
            <Text style={styles.text}>built by Evernym Inc.</Text>
          </View>
          <View style={styles.evernymIconBuildText}>
            <Text style={styles.text}>
              Version {versionNumber.appVersion}.{versionNumber.buildVersion}
            </Text>
          </View>
        </View>
      </View>
    </View>
  </SafeAreaView>
)

const Drawer = createDrawerNavigator(
  {
    [homeDrawerRoute]: {
      screen: HomeScreen,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <SvgCustomIcon
            name="Home"
            width={isiPhone5 ? 22 : 24}
            height={isiPhone5 ? 22 : 24}
            fill={tintColor}
          />
        ),
        drawerLabel: ({ focused, tintColor }) => (
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.labelText,
                focused && styles.labelTextFocusedColor,
              ]}
            >
              Home
            </Text>
            <UnreadMessagesBadge
              customContainerStyle={styles.customGreenBadgeContainer}
            />
          </View>
        ),
      },
    },
    [connectionsDrawerRoute]: {
      screen: MyConnectionsScreen,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <SvgCustomIcon
            name="Connections"
            width={isiPhone5 ? 22 : 24}
            height={isiPhone5 ? 22 : 24}
            fill={tintColor}
          />
        ),
        drawerLabel: ({ focused, tintColor }) => (
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.labelText,
                focused && styles.labelTextFocusedColor,
              ]}
            >
              My Connections
            </Text>
          </View>
        ),
      },
    },
    [settingsDrawerRoute]: {
      screen: Settings,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <SvgCustomIcon
            name="Settings"
            width={isiPhone5 ? 22 : 24}
            height={isiPhone5 ? 22 : 24}
            fill={tintColor}
          />
        ),
        drawerLabel: ({ focused, tintColor }) => (
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.labelText,
                focused && styles.labelTextFocusedColor,
              ]}
            >
              Settings
            </Text>
          </View>
        ),
      },
    },
  },
  {
    contentComponent: drawerComponent,
    drawerBackgroundColor: 'transparent',
    drawerWidth: isiPhone5 ? width * 0.8 : width * 0.85,
    contentOptions: {
      activeTintColor: color.bg.twelfth.color,
      inactiveTintColor: '#777',
    },
  }
)

const CardStack = createStackNavigator(
  {
    [qrCodeScannerTabRoute]: {
      screen: QRCodeScanner,
    },
    [splashScreenRoute]: {
      screen: SplashScreenView,
    },
    [homeRoute]: {
      screen: Drawer,
    },
    [expiredTokenRoute]: {
      screen: ExpiredTokenScreen,
    },
    [invitationRoute]: {
      screen: InvitationScreen,
    },
    [lockSelectionRoute]: {
      screen: LockSelectionScreen,
    },
    [sendLogsRoute]: {
      screen: SendLogsScreen,
    },
    [lockEnterPinRoute]: {
      screen: LockEnterPinScreen,
    },
    [lockPinSetupRoute]: {
      screen: LockPinCodeSetupScreen,
    },
    [lockTouchIdSetupRoute]: {
      screen: LockTouchIdSetupScreen,
    },
    [lockSetupSuccessRoute]: {
      screen: LockSetupSuccessScreen,
    },
    [lockEnterFingerprintRoute]: {
      screen: LockEnterFingerprintScreen,
    },
    [switchEnvironmentRoute]: {
      screen: SwitchEnvironmentScreen,
    },
    [waitForInvitationRoute]: {
      screen: WaitForInvitationScreen,
    },
    [eulaRoute]: {
      screen: EulaScreen,
    },
    [restoreRoute]: {
      screen: RestoreStartScreen,
    },
    [selectRestoreMethodRoute]: {
      screen: SelectRestoreMethod,
    },
    [cloudRestoreRoute]: {
      screen: CloudRestore,
    },
    [restorePassphraseRoute]: {
      screen: RestorePassphrase,
    },
    [restoreWaitRoute]: {
      screen: RestoreWaitScreen,
    },
    [backupErrorRoute]: { screen: BackupErrorScreen },
    [genRecoveryPhraseRoute]: { screen: GenerateRecoveryPhrase },
    [verifyRecoveryPhraseRoute]: { screen: VerifyRecoveryPhrase },
    [exportBackupFileRoute]: { screen: ExportBackupFile },
    [selectRecoveryMethodRoute]: { screen: SelectRecoveryMethod },

    [backupCompleteRoute]: { screen: BackupComplete },
    [connectionHistRoute]: {
      screen: ConnectionHistNavigator,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: splashScreenRoute,
    transitionConfig: cardTransitionConfig,
    navigationOptions: {
      gesturesEnabled: false,
    },
  }
)

// TODO:KS create a custom navigator to track page changes
// for flows to support deep link, etc.
const ConnectMeAppNavigator = createStackNavigator(
  {
    CardStack: { screen: CardStack },
    [claimOfferRoute]: { screen: ClaimOfferModal },
    [lockAuthorizationRoute]: { screen: LockAuthorization },
    [proofRequestRoute]: {
      screen: ProofRequestModal,
    },
    [modalScreenRoute]: {
      screen: Modal,
    },
    [modalContentProofShared]: {
      screen: ModalContentProofShared,
    },
    [connectionHistoryRoute]: {
      screen: ConnectionHistoryNavigator,
    },
    [cloudRestoreModalRoute]: {
      screen: CloudRestoreModal,
    },

    [walletRoute]: { screen: Wallet },
    [walletTabSendDetailsRoute]: {
      screen: WalletTabSendDetails,
    },
    [questionRoute]: {
      screen: QuestionScreen,
    },
    [txnAuthorAgreementRoute]: {
      screen: TxnAuthorAgreementScreen,
    },
    [cloudBackupRoute]: { screen: CloudBackup },
    [openIdConnectRoute]: { screen: OpenIdConnectScreen },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    transitionConfig: modalTransitionConfig,
    cardStyle: {
      backgroundColor: 'transparent',
    },
    navigationOptions: {
      gesturesEnabled: true,
    },
  }
)

let navigator = ConnectMeAppNavigator

// Temporary disabled
// Reason:
// Ref to ConnectMeAppNavigator on App component was not working as expected

if (__DEV__) {
  // Tried to extend console interface, but it didn't work
  // need to fix, so ignoring error for now
  // `FlowFixMe`
  // navigator = console.tron.overlay(navigator)
}

export default navigator
