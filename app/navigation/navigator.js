// @flow
import * as React from 'react'
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  Text,
} from 'react-native'
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack'
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer'
import DeviceInfo from 'react-native-device-info'
import VersionNumber from 'react-native-version-number'
import { SafeAreaView } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
// $FlowFixMe Not sure how this can be fixed. Maybe we can add type definition
import { createNativeStackNavigator } from 'react-native-screens/native-stack'

import type { ImageSource } from '../common/type-common'

import { aboutAppScreen } from '../about-app/about-app'
import { homeScreen } from '../home/home'
import { MyConnectionsScreen } from '../my-connections/my-connections'
import { splashScreenScreen } from '../start-up/splash-screen'
import { SettingsScreen } from '../settings/settings'
import { expiredTokenScreen } from '../expired-token/expired-token'
import { qrCodeScannerScreen } from '../qr-code/qr-code'
import { lockSelectionScreen } from '../lock/lock-selection'
import { sendLogsScreen } from '../send-logs/send-logs'
import { questionScreen } from '../question/question-screen'
import { txnAuthorAgreementScreen } from '../txn-author-agreement/txn-author-agreement-screen'
import { lockEnterPinScreen } from '../lock/lock-enter-pin-code'
import { lockTouchIdSetupScreen } from '../lock/lock-fingerprint-setup'
import { lockPinSetupScreen } from '../lock/lock-pin-code-setup'
import { lockSetupSuccessScreen } from '../lock/lock-setup-success'
import { lockEnterFingerprintScreen } from '../lock/lock-enter-fingerprint'
import { claimOfferScreen } from '../connection-details/components/claim-offer-modal'
import { proofRequestScreen } from '../connection-details/components/proof-request-modal'
import { fulfilledMessageScreen } from '../connection-details/components/modal'
import { proofScreen } from '../connection-details/components/modal-content-proof-shared'
import { invitationScreen } from '../invitation/invitation'
import { switchEnvironmentScreen } from '../switch-environment/switch-environment'
import { lockAuthorizationScreen } from '../lock/lock-authorization'
import { waitForInvitationScreen } from '../invitation/wait-for-invitation'
import { walletScreen } from '../wallet/wallet'
import { generateRecoveryPhraseScreen } from '../backup/generate-phrase'
import { verifyRecoveryPhraseScreen } from '../backup/verify-phrase'
import { exportBackupFileScreen } from '../backup/export-backup'
import { selectRecoveryMethodScreen } from '../backup/select-recovery-method'
import { cloudBackupScreen } from '../backup/cloud-backup'
import { backupCompleteScreen } from '../backup/backup-complete'
import { backupErrorScreen } from '../backup/backup-error'
import { selectRestoreMethodScreen } from '../restore/select-restore-method'
import { cloudRestoreModalScreen } from '../cloud-restore/cloud-restore-modal'
import { cloudRestoreScreen } from '../cloud-restore/cloud-restore'
import { restoreStartScreen } from '../restore/restore'
import { eulaScreen } from '../eula/eula'
import { restoreWaitRouteScreen } from '../restore/restore-wait'
import { openIdConnectScreen } from '../open-id-connect/open-id-connect-screen'
import { designStyleGuideScreen } from '../design-styleguide/design-styleguide'
import { onfidoScreen } from '../onfido/onfido'
import { restorePassphraseScreen } from '../restore/restore-passphrase'
import { privacyTNCScreen } from '../privacy-tnc/privacy-tnc-screen'
import { connectionHistoryScreen } from '../connection-details/connection-details'
import {
  splashScreenRoute,
  homeRoute,
  walletTabSendDetailsRoute,
  connectionsDrawerRoute,
  homeDrawerRoute,
  settingsDrawerRoute,
} from '../common'
import { walletTabsScreen } from '../wallet/wallet-tab-send-details'
import { checkIfAnimationToUse } from '../bridge/react-native-cxs/RNCxs'
import SvgCustomIcon from '../components/svg-custom-icon'
import { colors, fontFamily, fontSizes } from '../common/styles/constant'
import {
  Icon,
  CustomView,
  UserAvatar,
  CustomText,
  Avatar,
  UnreadMessagesBadge,
} from '../components'
import { unreadMessageContainerCommonStyle } from '../components/unread-messages-badge/unread-messages-badge'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'

enableScreens()

const { width } = Dimensions.get('screen')

export const styles = StyleSheet.create({
  icon: {
    marginBottom: verticalScale(2),
  },
  drawerOuterContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: verticalScale(14),
    borderBottomRightRadius: verticalScale(14),
  },
  drawerHeader: {
    width: '100%',
    height: moderateScale(180),
    justifyContent: 'space-evenly',
    paddingLeft: moderateScale(20),
  },
  drawerFooterContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerFooter: {
    width: '100%',
    height: moderateScale(50),
    flexDirection: 'row',
    alignItems: 'center',
  },
  evernymIconImage: {
    width: verticalScale(26),
    height: verticalScale(26),
    marginLeft: moderateScale(20),
    marginRight: moderateScale(10),
  },
  evernymIconTextContainer: {
    height: verticalScale(26),
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
    fontFamily: fontFamily,
    fontSize: verticalScale(10),
    color: colors.cmGray3,
    fontWeight: 'bold',
  },
  labelContainer: {
    flexDirection: 'row',
  },
  labelText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(15),
    fontWeight: '500',
    color: colors.cmGray3,
  },
  labelTextFocusedColor: {
    color: colors.cmGreen1,
  },
  customGreenBadgeContainer: {
    ...unreadMessageContainerCommonStyle,
    marginLeft: verticalScale(135),
  },
})

const evernymSquareIcon = require('../images/evernym_square.png')

const versionNumber = VersionNumber

const renderAvatarWithSource = (avatarSource: number | ImageSource) => {
  return <Avatar medium round src={avatarSource} />
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
        width={verticalScale(136)}
        height={verticalScale(18)}
        fill={colors.cmGray3}
      />
      <UserAvatar userCanChange>{renderAvatarWithSource}</UserAvatar>
    </View>
    <DrawerItemList {...props} />
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

const Drawer = createDrawerNavigator()
const drawerContentOptions = {
  activeTintColor: colors.cmGreen1,
  inactiveTintColor: colors.cmGray2,
}
const drawerStyle = {
  width: verticalScale(0.75 * width),
  backgroundColor: 'transparent',
}
const drawerItemIcon = (title: string) => ({ color }) => (
  <SvgCustomIcon
    name={title}
    width={verticalScale(22)}
    height={verticalScale(22)}
    fill={color}
  />
)
const drawerItemLabel = (
  title: string,
  extraComponent?: React.Node = null
) => ({ focused, tintColor }) => (
  <View style={styles.labelContainer}>
    <Text style={[styles.labelText, focused && styles.labelTextFocusedColor]}>
      {title}
    </Text>
    {extraComponent}
  </View>
)
const homeDrawerItemOptions = {
  drawerIcon: drawerItemIcon('Home'),
  drawerLabel: drawerItemLabel(
    'Home',
    <UnreadMessagesBadge
      customContainerStyle={styles.customGreenBadgeContainer}
    />
  ),
}
const connectionDrawerItemOptions = {
  drawerIcon: drawerItemIcon('Connections'),
  drawerLabel: drawerItemLabel('My Connections'),
}
const settingsDrawerItemOptions = {
  drawerIcon: drawerItemIcon('Settings'),
  drawerLabel: drawerItemLabel('Settings'),
}
function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={drawerComponent}
      drawerContentOptions={drawerContentOptions}
      drawerStyle={drawerStyle}
    >
      <Drawer.Screen
        name={homeDrawerRoute}
        component={homeScreen.screen}
        options={homeDrawerItemOptions}
      />
      <Drawer.Screen
        name={connectionsDrawerRoute}
        component={MyConnectionsScreen}
        options={connectionDrawerItemOptions}
      />
      <Drawer.Screen
        name={settingsDrawerRoute}
        component={SettingsScreen}
        options={settingsDrawerItemOptions}
      />
    </Drawer.Navigator>
  )
}
const CardStack = createNativeStackNavigator()
const cardStackOptions = {
  // we are using headerShown property instead of headerMode: 'none'
  // to hide header from screen
  // because, headerShown does not remove header altogether
  // and we can customize headers inside screens that needs it
  // and we won't need to make any nested stack navigator
  // this would give us performance benefit that we won't need too many
  // nested navigators and simple screen should be able to work
  // if we want to have inside any of the screens added above
  // then we can add headerShown true in the options of screen
  // and add header using header: () => <Header /> property
  // of navigationOptions
  headerShown: false,
}
function CardStackScreen() {
  return (
    <CardStack.Navigator
      initialRouteName={splashScreenRoute}
      screenOptions={cardStackOptions}
    >
      <CardStack.Screen
        name={homeRoute}
        component={AppDrawer}
        options={{ gestureEnabled: false }}
      />
      <CardStack.Screen
        name={privacyTNCScreen.routeName}
        component={privacyTNCScreen.screen}
        options={privacyTNCScreen.options}
      />
      <CardStack.Screen
        name={designStyleGuideScreen.routeName}
        component={designStyleGuideScreen.screen}
        options={designStyleGuideScreen.options}
      />
      <CardStack.Screen
        name={restoreWaitRouteScreen.routeName}
        component={restoreWaitRouteScreen.screen}
      />
      <CardStack.Screen
        name={restoreStartScreen.routeName}
        component={restoreStartScreen.screen}
      />
      <CardStack.Screen
        name={waitForInvitationScreen.routeName}
        component={waitForInvitationScreen.screen}
      />
      <CardStack.Screen
        name={switchEnvironmentScreen.routeName}
        component={switchEnvironmentScreen.screen}
      />
      <CardStack.Screen
        name={lockEnterFingerprintScreen.routeName}
        component={lockEnterFingerprintScreen.screen}
      />
      <CardStack.Screen
        name={lockAuthorizationScreen.routeName}
        component={lockAuthorizationScreen.screen}
        options={lockAuthorizationScreen.options}
      />
      <CardStack.Screen
        name={lockSetupSuccessScreen.routeName}
        component={lockSetupSuccessScreen.screen}
      />
      <CardStack.Screen
        name={lockTouchIdSetupScreen.routeName}
        component={lockTouchIdSetupScreen.screen}
      />
      <CardStack.Screen
        name={invitationScreen.routeName}
        component={invitationScreen.screen}
      />
      <CardStack.Screen
        name={lockSelectionScreen.routeName}
        component={lockSelectionScreen.screen}
        options={lockSelectionScreen.options}
      />
      <CardStack.Screen
        name={expiredTokenScreen.routeName}
        component={expiredTokenScreen.screen}
      />
      <CardStack.Screen
        name={splashScreenScreen.routeName}
        component={splashScreenScreen.screen}
      />
      <CardStack.Screen
        name={qrCodeScannerScreen.routeName}
        component={qrCodeScannerScreen.screen}
      />
      <CardStack.Screen
        name={lockPinSetupScreen.routeName}
        component={lockPinSetupScreen.screen}
        options={lockPinSetupScreen.options}
      />
      <CardStack.Screen
        name={aboutAppScreen.routeName}
        component={aboutAppScreen.screen}
        options={aboutAppScreen.options}
      />
      <CardStack.Screen
        name={onfidoScreen.routeName}
        component={onfidoScreen.screen}
        options={onfidoScreen.options}
      />
      <CardStack.Screen
        name={backupCompleteScreen.routeName}
        component={backupCompleteScreen.screen}
      />
      <CardStack.Screen
        name={backupErrorScreen.routeName}
        component={backupErrorScreen.screen}
      />
      <CardStack.Screen
        name={exportBackupFileScreen.routeName}
        component={exportBackupFileScreen.screen}
      />
      <CardStack.Screen
        name={generateRecoveryPhraseScreen.routeName}
        component={generateRecoveryPhraseScreen.screen}
      />
      <CardStack.Screen
        name={selectRecoveryMethodScreen.routeName}
        component={selectRecoveryMethodScreen.screen}
      />
      <CardStack.Screen
        name={verifyRecoveryPhraseScreen.routeName}
        component={verifyRecoveryPhraseScreen.screen}
      />
      <CardStack.Screen
        name={cloudRestoreScreen.routeName}
        component={cloudRestoreScreen.screen}
      />
      <CardStack.Screen
        name={connectionHistoryScreen.routeName}
        component={connectionHistoryScreen.screen}
      />
      <CardStack.Screen
        name={eulaScreen.routeName}
        component={eulaScreen.screen}
        options={eulaScreen.options}
      />
      <CardStack.Screen
        name={lockEnterPinScreen.routeName}
        component={lockEnterPinScreen.screen}
      />
      <CardStack.Screen
        name={restorePassphraseScreen.routeName}
        component={restorePassphraseScreen.screen}
      />
      <CardStack.Screen
        name={selectRestoreMethodScreen.routeName}
        component={selectRestoreMethodScreen.screen}
      />
      <CardStack.Screen
        name={sendLogsScreen.routeName}
        component={sendLogsScreen.screen}
        options={sendLogsScreen.options}
      />
    </CardStack.Navigator>
  )
}

const ModalStack = createStackNavigator()
const modalStackOptions = {
  headerShown: false,
  gestureEnabled: true,
  animationEnabled: !checkIfAnimationToUse(),
  ...TransitionPresets.ModalPresentationIOS,
}
export function ConnectMeAppNavigator() {
  return (
    <ModalStack.Navigator mode="modal" screenOptions={modalStackOptions}>
      <ModalStack.Screen name="CardStack" component={CardStackScreen} />
      <ModalStack.Screen
        name={claimOfferScreen.routeName}
        component={claimOfferScreen.screen}
      />
      <ModalStack.Screen
        name={cloudBackupScreen.routeName}
        component={cloudBackupScreen.screen}
      />
      <ModalStack.Screen
        name={cloudRestoreModalScreen.routeName}
        component={cloudRestoreModalScreen.screen}
      />
      <ModalStack.Screen
        name={proofScreen.routeName}
        component={proofScreen.screen}
      />
      <ModalStack.Screen
        name={fulfilledMessageScreen.routeName}
        component={fulfilledMessageScreen.screen}
      />
      <ModalStack.Screen
        name={openIdConnectScreen.routeName}
        component={openIdConnectScreen.screen}
      />
      <ModalStack.Screen
        name={proofRequestScreen.routeName}
        component={proofRequestScreen.screen}
      />
      <ModalStack.Screen
        name={questionScreen.routeName}
        component={questionScreen.screen}
      />
      <ModalStack.Screen
        name={txnAuthorAgreementScreen.routeName}
        component={txnAuthorAgreementScreen.screen}
      />
      <ModalStack.Screen
        name={walletScreen.routeName}
        component={walletScreen.screen}
      />
      <ModalStack.Screen
        name={walletTabsScreen.routeName}
        component={walletTabsScreen.screen}
      />
    </ModalStack.Navigator>
  )
}
