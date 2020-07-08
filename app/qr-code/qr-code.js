// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { RNCamera } from 'react-native-camera'
import Permissions from 'react-native-permissions'
import { Alert, Platform, PermissionsAndroid, AppState } from 'react-native'
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
  connectionHistRoute,
  openIdConnectRoute,
  proofRequestRoute,
} from '../common/'

import type {
  QrCodeShortInvite,
  OIDCAuthenticationRequest,
} from '../components/qr-scanner/type-qr-scanner'
import type { Store } from '../store/type-store'
import type {
  InvitationPayload,
  AriesConnectionInvite,
} from '../invitation/type-invitation'
import type {
  QRCodeScannerScreenState,
  QRCodeScannerScreenProps,
} from './type-qr-code'
import type { QrCodeEphemeralProofRequest } from '../proof-request/type-proof-request'

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
    isCameraAuthorized: false,
    isCameraEnabled: false,
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
      navigation.navigate(connectionHistRoute, params)

      return
    }

    this.props.invitationReceived(invitation)
    // Apparently navigation.push can be null, and hence we are protecting
    // against null fn call, so if push is not available, navigate is
    // guaranteed to be available
    const navigationFn = navigation.push || navigation.navigate
    navigationFn(invitationRoute, {
      senderDID: invitation.payload.senderDID,
    })
  }

  onClose = () => {
    this.props.navigation.goBack(null)
    this.setState({ isCameraEnabled: false })
  }

  allowCameraPermissionAcknowledged = () => {
    this.props.navigation.goBack()
  }

  setHasCameraAccessPermission = () => {
    this.setState({ isCameraAuthorized: true })
  }

  setNoCameraAccessPermission = () => {
    Alert.alert(MESSAGE_NO_CAMERA_PERMISSION, MESSAGE_ALLOW_CAMERA_PERMISSION, [
      { text: 'OK', onPress: this.allowCameraPermissionAcknowledged },
    ])
    this.setState({ isCameraAuthorized: false })
  }

  checkCameraAuthorization = () => {
    if (Platform.OS === 'ios') {
      Permissions.request('camera').then(response => {
        if (response === 'authorized') {
          this.setHasCameraAccessPermission()
        } else {
          this.setNoCameraAccessPermission()
        }
      })
    } else {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'App Camera Permission',
        message:
          'App needs access to your camera ' +
          'so you can scan QR codes and form connections.',
      })
        .then(result => {
          if (result === 'granted') {
            this.setHasCameraAccessPermission()
          } else {
            this.setNoCameraAccessPermission()
          }
        })
        .catch(this.setNoCameraAccessPermission)
    }
  }

  componentWillReceiveProps(nextProps: QRCodeScannerScreenProps) {
    if (
      nextProps.currentScreen !== this.props.currentScreen &&
      nextProps.currentScreen === qrCodeScannerTabRoute
    ) {
      // whenever user navigates to this screen, we have to check permission
      // every time, although we should have this logic in componentDidMount
      // but in the router (react navigation) that we are using
      // it caches a component and does not unmount it, and hence
      // componentDidMount is not called every time user comes to this screen
      // so, the option we have now is to use one of other life cycle events
      // such as `cwrp` or `cdu`, we are `cwrp` to check the status every time
      // also, we check status only on the basis of screen switching
      // and only check status if user is redirecting to QrCodeScanScreen
      if (nextProps.navigation.isFocused()) {
        this.setState({ isCameraEnabled: true })
      }

      if (Platform.OS === 'android') {
        this.permissionCheckIntervalId = setInterval(() => {
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
            .then(result => {
              if (result) {
                this.checkCameraAuthorization()
                this.permissionCheckIntervalId &&
                  clearInterval(this.permissionCheckIntervalId)
              } else {
                if (!this.checkPermission) {
                  this.checkCameraAuthorization()
                }
                this.checkPermission = true
              }
            })
            .catch(err => {
              captureError(err)
            })
        }, 1000)
      } else {
        this.checkCameraAuthorization()
      }
    } else {
      this.permissionCheckIntervalId &&
        clearInterval(this.permissionCheckIntervalId)
      this.checkPermission = false
    }
  }

  componentDidMount() {
    if (this.props.navigation.isFocused()) {
      // when this component is mounted first time, `cwrp` will not be called
      // so for the first time mount as well we need to check camera permission
      this.checkCameraAuthorization()
    }

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

  _handleAppStateChange = nextAppState => {
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
      //Till the time camera authorization is checked
      //empty black screen will be returned
      //so that it doesn't look odd
      <Container dark collapsable={true} testID="qr-code-tab-container">
        {this.state.isCameraAuthorized &&
        this.state.isCameraEnabled &&
        this.props.currentScreen === qrCodeScannerTabRoute ? (
          <QRScanner
            onRead={this.onRead}
            onClose={this.onClose}
            onInvitationUrl={this.onInvitationUrl}
            onOIDCAuthenticationRequest={this.onOIDCAuthenticationRequest}
            onAriesConnectionInviteRead={this.onAriesConnectionInviteRead}
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
      // TODO:KS Need to discuss with architects to know how to fulfill this requirement
      senderLogoUrl: null,
      senderVerificationKey: payload.recipientKeys[0],
      targetName: payload.label || 'Unknown',
      senderDetail: {
        name: payload.label || 'Unknown',
        agentKeyDlgProof: senderAgentKeyDelegationProof,
        DID: payload.recipientKeys[0],
        logoUrl: null,
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
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      invitationReceived,
      changeEnvironmentUrl,
      openIdConnectUpdateStatus,
      proofRequestReceived,
    },
    dispatch
  )

export default withStatusBar({ color: color.bg.sixth.color })(
  connect(mapStateToProps, mapDispatchToProps)(QRCodeScannerScreen)
)
