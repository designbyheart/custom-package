// @flow
import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { captureError } from '../services/error/error-handler'
import { Request, Container } from '../components'
import { homeRoute } from '../common'
import { ResponseType } from '../components/request/type-request'
import { sendInvitationResponse, invitationRejected } from './invitation-store'
import ConnectionSuccessModal from '../authentication/connection-success-modal'
import type { Store } from '../store/type-store'
import type { ResponseTypes } from '../components/request/type-request'
import type { InvitationProps, InvitationState } from './type-invitation'
import type { ReactNavigation } from '../common/type-common'

export class Invitation extends PureComponent<
  void,
  InvitationProps,
  InvitationState
> {
  state = {
    isSuccessModalVisible: false,
  }

  _showModal = () => this.setState({ isSuccessModalVisible: true })

  _hideModal = () => this.setState({ isSuccessModalVisible: false })

  onSuccessModalContinue = () => {
    this._hideModal()
    this.props.navigation.navigate(homeRoute)
  }

  onAction = (response: ResponseTypes) => {
    const { payload } = this.props.invitation
    if (payload) {
      if (response === ResponseType.accepted) {
        this.props.sendInvitationResponse({
          response,
          senderDID: payload.senderDID,
        })
      } else if (response === ResponseType.rejected) {
        this.props.invitationRejected(payload.senderDID)
        this.props.navigation.navigate(homeRoute)
      }
    }
  }

  componentWillReceiveProps(nextProps: InvitationProps) {
    if (nextProps.invitation.payload !== this.props.invitation.payload) {
      // a new invitation was received
      this._hideModal()
    } else {
      if (nextProps.invitation.isFetching === false) {
        if (nextProps.invitation.error) {
          // TODO:KS we got error from API response, what to do now
          if (nextProps.invitation.error != this.props.invitation.error) {
            // TODO: captureError should only accept Error object or only json
            // as of now it would fail for JSON objects, as we are using
            // captureException of Sentry which is supposed to take only Error object
            // captureError(nextProps.invitation.error, this.props.showErrorAlerts)
          }
        } else {
          // api response was successful, but now we have to check
          // if user accepted or declined the request
          if (nextProps.invitation.status === ResponseType.accepted) {
            this._showModal()
          }
        }
      } else {
        // TODO:KS show loading indicator, API request was sent
      }
    }
  }

  render() {
    const { payload } = this.props.invitation

    let senderName = ''
    let title = 'Hi'
    let message = 'You have received a connection request'
    let senderLogoUrl = undefined

    if (payload) {
      senderName = payload.senderName
      title = `Hi ${payload.targetName}`
      message = `${senderName} wants to connect with you.`
      senderLogoUrl = payload.senderLogoUrl
    }

    return (
      <Container>
        <Request
          title={title}
          message={message}
          senderLogoUrl={senderLogoUrl}
          onAction={this.onAction}
          testID={'invitation'}
          showErrorAlerts={this.props.showErrorAlerts}
        />
        <ConnectionSuccessModal
          isModalVisible={this.state.isSuccessModalVisible}
          showConnectionSuccessModal={this.onSuccessModalContinue}
          name={senderName}
          logoUrl={senderLogoUrl}
        />
      </Container>
    )
  }
}

const mapStateToProps = (state: Store, { navigation }: ReactNavigation) => {
  const senderDID = navigation.state ? navigation.state.params.senderDID : ''

  return {
    invitation: state.invitation[senderDID],
    showErrorAlerts: state.config.showErrorAlerts,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators({ sendInvitationResponse, invitationRejected }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Invitation)
