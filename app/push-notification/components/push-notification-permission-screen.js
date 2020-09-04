// @flow
import messaging from '@react-native-firebase/messaging'
import React, { Component, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  AppState,
} from 'react-native'
import {
  pushNotificationPermissionRoute,
  invitationRoute,
} from '../../common/route-constants'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'
import { allowPushNotifications } from '../push-notification-store'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type { Store } from '../../store/type-store'
import type {
  PushNotificationPermissionProps,
  PushNotificationPermissionState,
} from './type-push-notification-permission'

class PushNotificationPermission extends Component<
  PushNotificationPermissionProps,
  PushNotificationPermissionState
> {
  state = {
    appState: AppState.currentState,
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.isAllowedPushNotification !==
        prevProps.isAllowedPushNotification &&
      this.props.isAllowedPushNotification === true
    ) {
      this.props.navigation.navigate(invitationRoute, {
        senderDID: this.props.route.params.senderDID,
      })
    }
  }

  handleAppStateChange = async (nextAppState) => {
    if (
      this.state.appState &&
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      const authorizationStatus = await messaging().hasPermission()

      if (!!authorizationStatus) {
        this.props.navigation.navigate(invitationRoute, {
          senderDID: this.props.route.params.senderDID,
        })
      } else return
    }
    this.setState({ appState: nextAppState })
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  openSettings = async () => {
    await Linking.openSettings()
  }

  renderInformationText = () => {
    if (
      this.props.isAllowedPushNotification === null ||
      this.props.isAllowedPushNotification === true
    ) {
      return (
        <Text style={styles.informationText}>
          Forming your first connection requires push notification permissions.
          Please accept the prompt that follows.
        </Text>
      )
    } else if (this.props.isAllowedPushNotification === false) {
      return (
        <Text style={styles.informationText}>
          Forming your first connection requires push notification permissions.
          Please go to your device settings and enable push notifications for
          Connect.Me.
        </Text>
      )
    }
  }

  renderWarningText = () => {
    if (this.props.isAllowedPushNotification === false) {
      return (
        <Text style={styles.warningText}>
          You have disabled push notifications.
        </Text>
      )
    } else return <Text style={styles.warningText}></Text>
  }

  renderCorrectButton = () => {
    if (
      this.props.isAllowedPushNotification === null ||
      this.props.isAllowedPushNotification === true
    ) {
      return (
        <TouchableOpacity
          style={styles.greenButton}
          onPress={this.props.allowPushNotifications}
        >
          <Text style={styles.greenButtonText}>Allow Push Notifications</Text>
        </TouchableOpacity>
      )
    } else if (this.props.isAllowedPushNotification === false)
      return (
        <TouchableOpacity
          style={styles.greenButton}
          onPress={this.openSettings}
        >
          <Text style={styles.greenButtonText}>Settings</Text>
        </TouchableOpacity>
      )
  }

  closeModal = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.textSection}>
          <Text style={styles.headline}>Push Notifications Needed</Text>
          {this.renderWarningText()}
          {this.renderInformationText()}
        </View>
        <View style={styles.imageSection}>
          <Image
            style={styles.image}
            source={require('../../images/iphoneX.png')}
          />
          <View style={styles.buttonsSection}>
            <TouchableOpacity
              style={styles.redButton}
              onPress={this.closeModal}
            >
              <Text style={styles.redButtonText}>Cancel</Text>
            </TouchableOpacity>
            {this.renderCorrectButton()}
          </View>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: Store) => {
  return {
    isAllowedPushNotification:
      state.pushNotification && state.pushNotification.isAllowed,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      allowPushNotifications,
    },
    dispatch
  )

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    width: '100%',
    height: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: moderateScale(20),
    paddingRight: moderateScale(20),
  },
  imageSection: {
    width: '100%',
    height: '65%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  image: {
    position: 'absolute',
    bottom: -verticalScale(50),
  },
  headline: {
    fontFamily: fontFamily,
    fontSize: moderateScale(fontSizes.size2),
    color: colors.cmGray2,
    fontWeight: '700',
  },
  informationText: {
    fontFamily: fontFamily,
    fontSize: moderateScale(fontSizes.size3),
    color: colors.cmGray1,
    fontWeight: '700',
    marginBottom: -moderateScale(50),
    flexWrap: 'wrap',
  },
  warningText: {
    fontFamily: fontFamily,
    fontSize: moderateScale(fontSizes.size3),
    color: colors.cmRed,
    fontWeight: '700',
    marginBottom: moderateScale(10),
    marginTop: moderateScale(10),
  },
  greenButton: {
    backgroundColor: colors.cmGreen1,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(56),
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
  },
  buttonsSection: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '40%',
    bottom: 0,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: colors.cmWhite,
  },
  greenButtonText: {
    fontFamily: fontFamily,
    fontSize: moderateScale(fontSizes.size4),
    color: colors.cmWhite,
    fontWeight: 'bold',
  },
  redButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(56),
    borderRadius: 5,
    borderColor: colors.cmRed,
    borderWidth: 1,
    marginBottom: 8,
    width: '100%',
  },
  redButtonText: {
    fontFamily: fontFamily,
    fontSize: moderateScale(fontSizes.size4),
    color: colors.cmRed,
    fontWeight: 'bold',
  },
})

export const pushNotificationPermissionScreen = {
  routeName: pushNotificationPermissionRoute,
  screen: connect(
    mapStateToProps,
    mapDispatchToProps
  )(PushNotificationPermission),
}
