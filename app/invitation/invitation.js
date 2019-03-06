// @flow
import React, { PureComponent } from 'react'
import { View, StatusBar, Alert } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { captureError } from '../services/error/error-handler'
import {
  Request,
  Container,
  CustomModal,
  Loader,
  CustomText,
  CustomView,
} from '../components'
import { homeRoute, noop } from '../common'
import { OFFSET_1X } from '../common/styles'
import { ResponseType } from '../components/request/type-request'
import { sendInvitationResponse, invitationRejected } from './invitation-store'
import type { Store } from '../store/type-store'
import type { ResponseTypes } from '../components/request/type-request'
import type { InvitationProps } from './type-invitation'
import type { ReactNavigation } from '../common/type-common'
import { smsPendingInvitationSeen } from '../sms-pending-invitation/sms-pending-invitation-store'
import { SMSPendingInvitationStatus } from '../sms-pending-invitation/type-sms-pending-invitation'
import { NavigationActions } from 'react-navigation'
import { barStyleDark, color } from '../common/styles/constant'
import {
  ERROR_ALREADY_EXIST,
  ERROR_INVITATION_RESPONSE_FAILED,
  ERROR_ALREADY_EXIST_TITLE,
} from '../api/api-constants'

export class Invitation extends PureComponent<InvitationProps, void> {
  render() {
    const { invitation, showErrorAlerts, navigation } = this.props

    const {
      isValid,
      senderName,
      title,
      message,
      senderLogoUrl,
    } = isValidInvitation(this.props.invitation)

    if (!isValid) {
      return <Container />
    }

    if (isLoading(this.props)) {
      return (
        <Container center fifth>
          <StatusBar
            barStyle={barStyleDark}
            animated={true}
            backgroundColor={color.bg.fifth.color}
          />
          <Loader type="dark" showMessage={true} message={'Connecting...'} />
        </Container>
      )
    }

    return (
      <Container>
        <StatusBar
          barStyle={barStyleDark}
          animated={true}
          backgroundColor={color.bg.fifth.color}
        />
        <Request
          title={title}
          message={message}
          senderLogoUrl={senderLogoUrl}
          onAction={this.onAction}
          testID={'invitation'}
          navigation={navigation}
          showErrorAlerts={showErrorAlerts}
          invitationError={invitation.error}
          senderName={senderName}
        />
      </Container>
    )
  }

  componentDidMount() {
    if (this.props.isSmsInvitationNotSeen) {
      this.props.smsPendingInvitationSeen(this.props.smsToken)
    }
  }

  componentDidUpdate(prevProps: InvitationProps) {
    if (isError(prevProps, this.props)) {
      this.handleError(this.props)
    } else if (isSuccess(prevProps, this.props)) {
      this.navigate()
    }
  }

  handleError(currentProps: InvitationProps) {
    const isDuplicateConnection =
      currentProps.invitation.error.code === ERROR_ALREADY_EXIST.code
    const errorMessage = isDuplicateConnection
      ? `${currentProps.invitation.error.message}${
          currentProps.invitation.payload.senderName
        }`
      : ERROR_INVITATION_RESPONSE_FAILED
    const okAction = isDuplicateConnection
      ? this.onDuplicateConnectionError
      : noop
    const errorTitle = isDuplicateConnection ? ERROR_ALREADY_EXIST_TITLE : null

    Alert.alert(errorTitle, errorMessage, [{ text: 'Ok', onPress: okAction }], {
      cancelable: false,
    })
  }

  onDuplicateConnectionError = () => {
    this.onAction(ResponseType.rejected)
  }

  navigate = () => {
    this.props.navigation.navigate(homeRoute)
  }

  onAction = (response: ResponseTypes) => {
    const { invitation } = this.props
    if (invitation) {
      const { payload } = invitation
      if (payload) {
        if (response === ResponseType.accepted) {
          this.props.sendInvitationResponse({
            response,
            senderDID: payload.senderDID,
          })
        } else if (response === ResponseType.rejected) {
          this.props.invitationRejected(payload.senderDID)
          this.navigate()
        }
      } else {
        this.navigate()
      }
    }
  }
}

function isError(prevProps: InvitationProps, currentProps: InvitationProps) {
  // invitation could be null
  if (prevProps.invitation && currentProps.invitation) {
    // we are assuming that invitation will have error
    // only after user has taken some action
    // so prevProps and currentProps would be used to decide if error occurs
    // after user has taken action
    return (
      currentProps.invitation.isFetching === false &&
      currentProps.invitation.error &&
      currentProps.invitation.error !== prevProps.invitation.error
    )
  }

  return false
}

function isSuccess(prevProps: InvitationProps, currentProps: InvitationProps) {
  if (prevProps.invitation && currentProps.invitation) {
    return (
      currentProps.invitation.isFetching === false &&
      currentProps.invitation.isFetching !== prevProps.invitation.isFetching &&
      currentProps.invitation.status === ResponseType.accepted
    )
  }
}

function isLoading(currentProps: InvitationProps) {
  return currentProps.invitation && currentProps.invitation.isFetching
}

function isValidInvitation(
  invitation: $PropertyType<InvitationProps, 'invitation'>
) {
  let senderName = 'Anonymous'
  let title = 'Hi'
  let message = 'Anonymous wants to connect with you.'

  if (invitation && invitation.payload) {
    const { payload } = invitation
    senderName = payload.senderName || senderName
    title = payload.targetName ? `Hi ${payload.targetName}` : title
    message = `${senderName} wants to connect with you.`
    return {
      isValid: true,
      senderName,
      title,
      message,
      senderLogoUrl: payload.senderLogoUrl,
    }
  }

  return {
    isValid: false,
    senderName,
    title,
    message,
    senderLogoUrl: undefined,
  }
}

const mapStateToProps = (state: Store, { navigation }: ReactNavigation) => {
  const senderDID = navigation.state ? navigation.state.params.senderDID : ''
  const smsToken = navigation.state ? navigation.state.params.token : null
  const isSmsInvitationNotSeen =
    smsToken &&
    state.smsPendingInvitation[smsToken] &&
    state.smsPendingInvitation[smsToken].status !==
      SMSPendingInvitationStatus.SEEN

  return {
    invitation: state.invitation[senderDID],
    showErrorAlerts: state.config.showErrorAlerts,
    smsToken,
    isSmsInvitationNotSeen,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    { sendInvitationResponse, invitationRejected, smsPendingInvitationSeen },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(Invitation)
