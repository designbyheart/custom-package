// @flow
import messaging from '@react-native-firebase/messaging'
import React, { Component } from 'react'
import { Alert, Platform, PermissionsAndroid, AppState } from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { detox } from 'react-native-dotenv'

import { Container, QRScanner } from '../components'
import {
  color,
  barStyleLight,
  barStyleDark,
  whiteSmokeSecondary,
} from '../common/styles/constant'
import { invitationReceived } from '../invitation/invitation-store'
import {
  PENDING_CONNECTION_REQUEST_CODE,
  QR_CODE_SENDER_DID,
  QR_CODE_SENDER_VERIFICATION_KEY,
  QR_CODE_LOGO_URL,
  QR_CODE_REQUEST_ID,
  QR_CODE_SENDER_NAME,
  QR_CODE_TARGET_NAME,
  QR_CODE_SENDER_DETAIL,
  QR_CODE_SENDER_KEY_DELEGATION,
  QR_CODE_DELEGATION_DID,
  QR_CODE_DELEGATION_KEY,
  QR_CODE_DELEGATION_SIGNATURE,
  QR_CODE_SENDER_AGENCY,
  QR_CODE_SENDER_AGENCY_DID,
  QR_CODE_SENDER_AGENCY_KEY,
  QR_CODE_SENDER_AGENCY_ENDPOINT,
  QR_CODE_SENDER_PUBLIC_DID,
  QR_CODE_VERSION,
} from '../api/api-constants'
import {
  invitationRoute,
  qrCodeScannerTabRoute,
  homeRoute,
  homeDrawerRoute,
  myConnectionsRoute,
  connectionHistRoute,
  openIdConnectRoute,
  proofRequestRoute,
  pushNotificationPermissionRoute,
} from '../common/'

import type {
  QrCodeShortInvite,
  OIDCAuthenticationRequest,
} from '../components/qr-scanner/type-qr-scanner'
import type { Store } from '../store/type-store'
import type {
  InvitationPayload,
  AriesConnectionInvite,
  AriesOutOfBandInvite,
  AriesServiceEntry,
} from '../invitation/type-invitation'
import type {
  QRCodeScannerScreenState,
  QRCodeScannerScreenProps,
} from './type-qr-code'
import type { QrCodeEphemeralProofRequest } from '../proof-request/type-proof-request'
import { CONNECTION_INVITE_TYPES } from '../invitation/type-invitation'

import {
  MESSAGE_NO_CAMERA_PERMISSION,
  MESSAGE_ALLOW_CAMERA_PERMISSION,
  MESSAGE_RESET_CONNECT_ME,
  MESSAGE_RESET_DETAILS,
} from './type-qr-code'
import { changeEnvironmentUrl } from '../store/config-store'
import { captureError } from '../services/error/error-handler'
import { getAllPublicDid } from '../store/store-selector'
import { withStatusBar } from '../components/status-bar/status-bar'
import {
  openIdConnectUpdateStatus,
  OPEN_ID_CONNECT_STATE,
} from '../open-id-connect/open-id-connect-actions'
import { ID } from '../common/type-common'
import { proofRequestReceived } from '../proof-request/proof-request-store'

export function convertQrCodeToInvitation(qrCode: QrCodeShortInvite) {
  const qrSenderDetail = qrCode[QR_CODE_SENDER_DETAIL]
  const qrSenderAgency = qrCode[QR_CODE_SENDER_AGENCY]
  const senderDetail = {
    name: qrSenderDetail[QR_CODE_SENDER_NAME],
    agentKeyDlgProof: {
      agentDID:
        qrSenderDetail[QR_CODE_SENDER_KEY_DELEGATION][QR_CODE_DELEGATION_DID],
      agentDelegatedKey:
        qrSenderDetail[QR_CODE_SENDER_KEY_DELEGATION][QR_CODE_DELEGATION_KEY],
      signature:
        qrSenderDetail[QR_CODE_SENDER_KEY_DELEGATION][
          QR_CODE_DELEGATION_SIGNATURE
        ],
    },
    DID: qrSenderDetail[QR_CODE_SENDER_DID],
    logoUrl: qrSenderDetail[QR_CODE_LOGO_URL],
    verKey: qrSenderDetail[QR_CODE_SENDER_VERIFICATION_KEY],
    publicDID: qrSenderDetail[QR_CODE_SENDER_PUBLIC_DID],
  }

  const senderAgencyDetail = {
    DID: qrSenderAgency[QR_CODE_SENDER_AGENCY_DID],
    verKey: qrSenderAgency[QR_CODE_SENDER_AGENCY_KEY],
    endpoint: qrSenderAgency[QR_CODE_SENDER_AGENCY_ENDPOINT],
  }

  return {
    senderEndpoint: senderAgencyDetail.endpoint,
    requestId: qrCode[QR_CODE_REQUEST_ID],
    senderAgentKeyDelegationProof: senderDetail.agentKeyDlgProof,
    senderName: senderDetail.name,
    senderDID: senderDetail.DID,
    senderLogoUrl: senderDetail.logoUrl,
    senderVerificationKey: senderDetail.verKey,
    targetName: qrCode[QR_CODE_TARGET_NAME],
    senderDetail,
    senderAgencyDetail,
    version: qrCode[QR_CODE_VERSION],
  }
}

export class QRCodeScannerScreen extends Component<
  QRCodeScannerScreenProps,
  QRCodeScannerScreenState
> {
  state = {
    appState: AppState.currentState,
    isCameraEnabled: true,
  }

  permissionCheckIntervalId: ?IntervalID = undefined
  checkPermission = false

  onRead = (qrCode: QrCodeShortInvite) => {
    if (this.props.currentScreen === qrCodeScannerTabRoute) {
      const invitation = {
        payload: convertQrCodeToInvitation(qrCode),
      }
      this.checkExistingConnectionAndRedirect(invitation)
    }
  }

  // Please do not remove below commented lines
  // We will want to have environment switcher from QR code
  // sometime in future

  // onAllowSwitchEnvironment = (url: EnvironmentSwitchUrlQrCode) => {
  //   this.props.changeEnvironmentUrl(url.url)
  //   this.props.navigation.goBack(null)
  // }

  // onEnvironmentSwitchUrl = (url: EnvironmentSwitchUrlQrCode) => {
  //   if (this.props.currentScreen === qrCodeScannerTabRoute) {
  //     Alert.alert(MESSAGE_RESET_CONNECT_ME, MESSAGE_RESET_DETAILS(url.name), [
  //       { text: 'Cancel' },
  //       {
  //         text: 'Switch',
  //         onPress: () => this.onAllowSwitchEnvironment(url),
  //       },
  //     ])
  //   }
  // }

  onInvitationUrl = (payload: InvitationPayload) => {
    if (this.props.currentScreen === qrCodeScannerTabRoute) {
      this.checkExistingConnectionAndRedirect({ payload })
    }
  }

  getAuthorizationStatus = async () => {
    const authorizationStatus = await messaging().hasPermission()

    return !!authorizationStatus
  }

  checkExistingConnectionAndRedirect = (invitation: {
    payload: InvitationPayload,
  }) => {
    const { navigation } = this.props
    // check if we got public DID in invitation
    // if we have public DID, then check if connection already exist
    // if connection exist, then redirect to connection history
    // and show Snack bar stating that connection already exist
    // otherwise redirect to invitation screen
    const { publicDID = '' } = invitation.payload.senderDetail
    const connectionAlreadyExist = publicDID in this.props.publicDIDs

    if (connectionAlreadyExist) {
      const {
        senderDID,
        senderName,
        identifier,
        logoUrl: image,
      } = this.props.publicDIDs[publicDID]
      const params = {
        senderDID,
        senderName,
        image,
        identifier,
        backRedirectRoute: homeRoute,
        showExistingConnectionSnack: true,
        qrCodeInvitationPayload: invitation.payload,
      }
      navigation.navigate(homeRoute, {
        screen: homeDrawerRoute,
        params: params,
      })

      return
    }

    this.props.invitationReceived(invitation)
    // Apparently navigation.push can be null, and hence we are protecting
    // against null fn call, so if push is not available, navigate is
    // guaranteed to be available
    const navigationFn = navigation.push || navigation.navigate
    if (Platform.OS === 'ios') {
      if (this.getAuthorizationStatus() && this.props.historyData) {
        navigationFn(invitationRoute, {
          senderDID: invitation.payload.senderDID,
        })
      } else {
        navigationFn(pushNotificationPermissionRoute, {
          senderDID: invitation.payload.senderDID,
        })
      }
    } else
      navigationFn(invitationRoute, {
        senderDID: invitation.payload.senderDID,
      })
  }

  onClose = () => {
    this.props.navigation.goBack(null)
  }

  componentDidMount() {
    if (detox === 'yes') {
      setTimeout(async () => {
        try {
          // get invitation from server running inside detox test
          const invitation = await (await fetch('http://localhost:1337')).json()
          this.onRead(invitation)
        } catch (e) {
          console.log('error')
        }
      })
    }

    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState &&
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.setState({ isCameraEnabled: true })
    } else if (
      this.state.appState &&
      nextAppState.match(/inactive|background/) &&
      this.state.appState === 'active'
    ) {
      this.setState({ isCameraEnabled: false })
    }
    this.setState({ appState: nextAppState })
  }

  render() {
    return (
      <Container dark collapsable={true} testID="qr-code-tab-container">
        {this.state.isCameraEnabled && this.props.navigation.isFocused() ? (
          <QRScanner
            onRead={this.onRead}
            onClose={this.onClose}
            onInvitationUrl={this.onInvitationUrl}
            onOIDCAuthenticationRequest={this.onOIDCAuthenticationRequest}
            onAriesConnectionInviteRead={this.onAriesConnectionInviteRead}
            onAriesOutOfBandInviteRead={this.onAriesOutOfBandInviteRead}
            onEphemeralProofRequest={this.onEphemeralProofRequest}
          />
        ) : null}
      </Container>
    )
  }

  onOIDCAuthenticationRequest = (
    oidcAuthenticationRequest: OIDCAuthenticationRequest
  ) => {
    this.props.openIdConnectUpdateStatus(
      oidcAuthenticationRequest,
      OPEN_ID_CONNECT_STATE.REQUEST_RECEIVED
    )
    this.props.navigation.navigate(openIdConnectRoute, {
      oidcAuthenticationRequest,
    })
  }

  onAriesConnectionInviteRead = (
    ariesConnectionInvite: AriesConnectionInvite
  ) => {
    const { payload, original } = ariesConnectionInvite

    const senderAgentKeyDelegationProof = {
      agentDID: payload.recipientKeys[0],
      agentDelegatedKey: payload.recipientKeys[0],
      signature: '<no-signature-supplied>',
    }

    const invitation = {
      senderEndpoint: payload.serviceEndpoint,
      requestId: payload[ID],
      senderAgentKeyDelegationProof,
      senderName: payload.label || 'Unknown',
      senderDID: payload.recipientKeys[0],
      senderLogoUrl: payload.profileUrl || null,
      senderVerificationKey: payload.recipientKeys[0],
      targetName: payload.label || 'Unknown',
      senderDetail: {
        name: payload.label || 'Unknown',
        agentKeyDlgProof: senderAgentKeyDelegationProof,
        DID: payload.recipientKeys[0],
        logoUrl: payload.profileUrl || null,
        verKey: payload.recipientKeys[0],
        publicDID: payload.recipientKeys[0],
      },
      senderAgencyDetail: {
        DID: payload.recipientKeys[0],
        verKey: payload.recipientKeys[1],
        endpoint: payload.serviceEndpoint,
      },
      version: '1.0',
      original,
    }

    this.checkExistingConnectionAndRedirect({ payload: invitation })
  }

  onAriesOutOfBandInviteRead = (invite: AriesOutOfBandInvite) => {
    const payload = invite

    const serviceEntry = payload.service
      ? ((payload.service.find(
          (serviceEntry) => typeof serviceEntry === 'object'
        ): any): AriesServiceEntry)
      : null
    if (!serviceEntry) {
      this.props.navigation.goBack(null)

      Alert.alert(
        'Unsupported or invalid invitation format',
        'Failed to establish connection.'
      )
      return
    }

    const publicDID = serviceEntry.recipientKeys[0]
    const connectionAlreadyExist = publicDID in this.props.publicDIDs

    if (
      (!payload.handshake_protocols || !payload.handshake_protocols.length) &&
      (!payload['request~attach'] || !payload['request~attach'].length)
    ) {
      this.props.navigation.goBack(null)

      Alert.alert('Invalid invitation', 'Failed to establish connection.')
      return
    } else if (
      payload.handshake_protocols &&
      payload.handshake_protocols.length &&
      (!payload['request~attach'] || !payload['request~attach'].length)
    ) {
      // Call create_connection_with_outofband_invitation function to process invite.
      // Complete connection with regular flow.
      // UI: show invite and follow reglar connection steps.

      const senderAgentKeyDelegationProof = {
        agentDID: serviceEntry.recipientKeys[0],
        agentDelegatedKey: serviceEntry.recipientKeys[0],
        signature: '<no-signature-supplied>',
      }

      const invitation = {
        senderEndpoint: serviceEntry.serviceEndpoint,
        requestId: payload[ID],
        senderAgentKeyDelegationProof,
        senderName: payload.label || 'Unknown',
        senderDID: serviceEntry.recipientKeys[0],
        senderLogoUrl: payload.profileUrl || null,
        senderVerificationKey: serviceEntry.recipientKeys[0],
        targetName: payload.label || 'Unknown',
        senderDetail: {
          name: payload.label || 'Unknown',
          agentKeyDlgProof: senderAgentKeyDelegationProof,
          DID: serviceEntry.recipientKeys[0],
          logoUrl: payload.profileUrl || null,
          verKey: serviceEntry.recipientKeys[0],
          publicDID: serviceEntry.recipientKeys[0],
        },
        senderAgencyDetail: {
          DID: serviceEntry.recipientKeys[0],
          verKey: serviceEntry.recipientKeys[1],
          endpoint: serviceEntry.serviceEndpoint,
        },
        type: CONNECTION_INVITE_TYPES.ARIES_OUT_OF_BAND,
        version: '1.0',
        original: JSON.stringify(invite),
        originalObject: invite,
      }

      this.checkExistingConnectionAndRedirect({ payload: invitation })
    } else {
      // Implement this case
      this.props.navigation.goBack(null)
      Alert.alert('Invalid invitation', 'Failed to establish connection.')
      return
    }
  }

  onEphemeralProofRequest = (
    ephemeralProofRequest: QrCodeEphemeralProofRequest
  ) => {
    const uid = ephemeralProofRequest.ephemeralProofRequest['@id']
    this.props.proofRequestReceived(ephemeralProofRequest.proofRequestPayload, {
      uid,
      remotePairwiseDID:
        ephemeralProofRequest.ephemeralProofRequest['~service']
          .recipientKeys[0],
      senderLogoUrl: null,
    })
    this.props.navigation.navigate(proofRequestRoute, {
      uid,
    })
  }
}

const mapStateToProps = (state: Store) => ({
  currentScreen: state.route.currentScreen,
  publicDIDs: getAllPublicDid(state.connections),
  historyData: state.history && state.history.data,
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      invitationReceived,
      changeEnvironmentUrl,
      openIdConnectUpdateStatus,
      proofRequestReceived,
    },
    dispatch
  )

export const qrCodeScannerScreen = {
  routeName: qrCodeScannerTabRoute,
  screen: withStatusBar({ color: color.bg.sixth.color })(
    connect(mapStateToProps, mapDispatchToProps)(QRCodeScannerScreen)
  ),
}
