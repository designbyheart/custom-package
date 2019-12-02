// @flow
import React from 'react'
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native'
import {
  createStackNavigator,
  TabBarBottom,
  createTabNavigator,
  SafeAreaView,
} from 'react-navigation'
import DeviceInfo from 'react-native-device-info'
import AboutApp from './about-app/about-app'
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
import ProofRequestScreen from './proof-request/proof-request'
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
import { Icon, CustomView } from './components'
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
  homeTabRoute,
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
  connectionsTabRoute,
  credentialsTabRoute,
  discoverTabRoute,
  menuTabRoute,
  connectionHistRoute,
  modalContentProofShared,
  modalScreenRoute,
  cloudBackupRoute,
  selectRestoreMethodRoute,
  cloudRestoreRoute,
  cloudRestoreModalRoute,
  openIdConnectRoute,
} from './common/'
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
  whiteTransparent,
  whiteSolid,
  cmGrey5,
  isIphoneX,
  isIphoneXR,
} from '../app/common/styles/constant'
import {
  modalTransitionConfig,
  cardTransitionConfig,
  getResponderDistance,
} from './transition'
import OpenIdConnectScreen from '../app/open-id-connect/open-id-connect-screen'
import SettingsTab from './settings/settings-tab'

if (__DEV__) {
  require('../tools/reactotron-config')
}

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
})

const Tabs = createTabNavigator(
  {
    [connectionsTabRoute]: {
      screen: HomeScreen,
      navigationOptions: {
        title: TAB_CONNECTIONS_TITLE,
        tabBarTestIDProps: {
          testID: 'tab-bar-home-icon',
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: `Go to ${TAB_CONNECTIONS_TITLE}`,
        },
        tabBarIcon: ({ focused }) => {
          return (
            <View style={styles.icon}>
              <SvgCustomIcon
                name="Connections"
                fill={focused ? color.actions.font.tenth : color.actions.sixth}
              />
            </View>
          )
        },
      },
    },
    //   [credentialsTabRoute]: {
    //     screen: Settings,
    //     navigationOptions: {
    //       title: TAB_CREDENTIALS_TITLE,
    //       tabBarTestIDProps: {
    //         testID: 'tab-bar-settings-icon',
    //         accessible: true,
    //         accessibilityRole: "button",
    //         accessibilityLabel: `Go to ${TAB_CREDENTIALS_TITLE}`,
    //       },
    //       tabBarIcon: ({ focused }) => {
    //         if (focused) {
    //           return <SvgCustomIcon name="CredentialsOn" />
    //         }
    //         return <SvgCustomIcon name="Credentials" />
    //       },
    //     },
    //   },
    //   [discoverTabRoute]: {
    //     screen: Settings,
    //     navigationOptions: {
    //       title: TAB_DISCOVER_TITLE,
    //       tabBarTestIDProps: {
    //         testID: 'tab-bar-qrcode-icon',
    //         accessible: true,
    //         accessibilityRole: "button",
    //         accessibilityLabel: `Go to ${TAB_DISCOVER_TITLE}`,
    //       },
    //       tabBarIcon: ({ focused }) => {
    //         return (
    //           <SvgCustomIcon
    //             name="Discover"
    //             fill={focused ? color.actions.font.seventh : color.actions.sixth}
    //           />
    //         )
    //       },
    //     },
    //  },
    [qrCodeScannerTabRoute]: {
      screen: QRCodeScanner,
      navigationOptions: {
        title: TAB_SCAN_TITLE,
        tabBarTestIDProps: {
          testID: 'tab-bar-qrcode-icon',
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: `Go to ${TAB_SCAN_TITLE}`,
        },
        tabBarVisible: false,
        tabBarIcon: ({ focused }) => {
          if (focused) {
            return (
              <View style={styles.icon}>
                <SvgCustomIcon
                  name="ScanOn"
                  fill={
                    focused ? color.actions.font.tenth : color.actions.sixth
                  }
                />
              </View>
            )
          }
          return (
            <View style={styles.icon}>
              <SvgCustomIcon
                name="Scan"
                fill={focused ? color.actions.font.tenth : color.actions.sixth}
              />
            </View>
          )
        },
      },
    },
    [menuTabRoute]: {
      screen: Settings,
      navigationOptions: {
        title: TAB_MENU_TITLE,
        tabBarTestIDProps: {
          testID: 'tab-bar-settings-icon',
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: `Go to ${TAB_MENU_TITLE}`,
        },
        tabBarIcon: ({ focused }) => {
          return <SettingsTab focused={focused} />
        },
      },
    },
  },
  {
    animationEnabled: true,
    swipeEnabled: true,
    lazy: true,
    initialRouteName: connectionsTabRoute,
    order: [
      connectionsTabRoute,
      // credentialsTabRoute,
      // discoverTabRoute,
      qrCodeScannerTabRoute,
      menuTabRoute,
    ],
    tabBarOptions: {
      style: [styles.tabBarContainer],
      labelStyle: [styles.tabBarTitle],
      activeTintColor: color.actions.font.tenth,
      inactiveTintColor: color.actions.sixth,
    },
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
  }
)

const CardStack = createStackNavigator(
  {
    [splashScreenRoute]: {
      screen: SplashScreenView,
    },
    [homeRoute]: {
      screen: Tabs,
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
