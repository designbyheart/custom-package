// @flow
import React, { Component } from 'react'
import { View, StatusBar, Alert } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import isUrl from 'validator/lib/isURL'

import { ID, TYPE } from '../common/type-common'
import type { Store } from '../store/type-store'
import type { ResponseTypes } from '../components/request/type-request'
import type {
  AriesConnectionInvite,
  AriesConnectionInvitePayload,
  AriesOutOfBandInvite,
  InvitationProps,
  InvitationNavigation,
} from './type-invitation'

import { CONNECTION_INVITE_TYPES } from './type-invitation'
import { captureError } from '../services/error/error-handler'
import { schemaValidator } from '../services/schema-validator'
import {
  Container,
  CustomModal,
  Loader,
  CustomText,
  CustomView,
} from '../components'
import { homeRoute, noop, invitationRoute } from '../common'
import { OFFSET_1X } from '../common/styles'
import { ResponseType } from '../components/request/type-request'
import { sendInvitationResponse, invitationRejected } from './invitation-store'
import { smsPendingInvitationSeen } from '../sms-pending-invitation/sms-pending-invitation-store'
import { SMSPendingInvitationStatus } from '../sms-pending-invitation/type-sms-pending-invitation'
import { barStyleDark, color } from '../common/styles/constant'
import {
  ERROR_ALREADY_EXIST,
  ERROR_INVITATION_RESPONSE_FAILED,
  ERROR_ALREADY_EXIST_TITLE,
} from '../api/api-constants'
import { Request } from '../components/request/request'

export class Invitation extends Component<InvitationProps, void> {
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
          <Loader type="dark" showMessage={true} message={'Connecting...'} />
        </Container>
      )
    }

    return (
      <Container>
        <Request
          title={title}
          message={message}
          senderLogoUrl={senderLogoUrl}
          onAction={this.onAction}
          testID={'invitation'}
          invitationError={invitation ? invitation.error : undefined}
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
    if (!currentProps.invitation) {
      return false
    }

    const { error, payload } = currentProps.invitation

    const isDuplicateConnection = error
      ? error.code === ERROR_ALREADY_EXIST.code
      : false

    const errorMessage =
      isDuplicateConnection && error && payload
        ? `${error.message}${payload.senderName}`
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

export function isValidAriesV1InviteData(
  payload: any,
  original: string
): false | AriesConnectionInvite {
  if (!schemaValidator.validate(ariesConnectionInviteQrSchema, payload)) {
    return false
  }

  if (!isUrl(payload.serviceEndpoint)) {
    return false
  }

  return {
    original,
    payload,
    type: CONNECTION_INVITE_TYPES.ARIES_V1_QR,
    version: '1.0',
  }
}

const ariesConnectionInviteQrSchema = {
  type: 'object',
  properties: {
    [ID]: { type: 'string' },
    [TYPE]: { type: 'string' },
    label: { type: ['null', 'string'] },
    recipientKeys: {
      type: 'array',
      items: [{ type: 'string' }],
      minItems: 1,
    },
    routingKeys: {
      type: ['null', 'array'],
      items: [{ type: 'string' }],
      minItems: 0,
    },
    serviceEndpoint: { type: 'string' },
  },
  required: [ID, TYPE, 'recipientKeys', 'serviceEndpoint'],
}

export function isValidAriesOutOfBandInviteData(
  invite: any
): false | AriesOutOfBandInvite {
  if (!schemaValidator.validate(ariesOutOfBandInviteSchema, invite)) {
    return false
  }

  if (
    !invite.service.every(
      (serviceEntry) =>
        typeof serviceEntry === 'string' ||
        (typeof serviceEntry === 'object' &&
          isUrl(serviceEntry.serviceEndpoint))
    )
  ) {
    return false
  }

  return invite
}

const ariesOutOfBandInviteSchema = {
  type: 'object',
  properties: {
    [ID]: { type: 'string' },
    [TYPE]: { type: 'string' },
    label: { type: ['null', 'string'] },
    goal_code: { type: ['null', 'string'] },
    goal: { type: ['null', 'string'] },
    handshake_protocols: {
      type: 'array',
      items: [{ type: 'string' }],
    },
    'request~attach': {
      type: 'array',
      items: [
        {
          type: 'object',
          properties: {
            [ID]: { type: 'string' },
            'mime-type': { type: 'string' },
            data: {
              type: 'object',
              anyOf: [
                { properties: { json: { type: 'string' } } },
                { properties: { base64: { type: 'string' } } },
              ],
              minProperties: 1,
            },
          },
          required: [ID, 'mime-type', 'data'],
        },
      ],
    },
    service: {
      type: 'array',
      items: {
        anyOf: [
          { type: 'string' },
          {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              recipientKeys: {
                type: 'array',
                items: [{ type: 'string' }],
                minItems: 1,
              },
              routingKeys: {
                type: ['null', 'array'],
                items: [{ type: 'string' }],
                minItems: 0,
              },
              serviceEndpoint: { type: 'string' },
            },
            required: ['id', 'type', 'recipientKeys', 'serviceEndpoint'],
          },
        ],
      },
      minItems: 1,
    },
  },
  anyOf: [
    {
      required: ['handshake_protocols'],
    },
    {
      required: ['request~attach'],
    },
  ],
  required: [ID, TYPE, 'service'],
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

const mapStateToProps = (
  state: Store,
  { route: { params } }: InvitationNavigation
) => {
  const senderDID = params ? params.senderDID : ''
  const smsToken = params ? params.token : null
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

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    { sendInvitationResponse, invitationRejected, smsPendingInvitationSeen },
    dispatch
  )

export const invitationScreen = {
  routeName: invitationRoute,
  screen: connect(mapStateToProps, mapDispatchToProps)(Invitation),
}
