// @flow
import * as React from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  LayoutAnimation,
} from 'react-native'
import { connect } from 'react-redux'
import { SwipeRow } from 'react-native-swipe-list-view'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import {
  colors,
  font,
  fontFamily,
  fontSizes,
} from '../../common/styles/constant'
import { isiPhone5 } from '../../common/styles'

import type { RecentCardProps } from './type-recent-card'
import {
  CLAIM_OFFER_ACCEPTED,
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
  DENY_CLAIM_OFFER,
  DENY_CLAIM_OFFER_FAIL,
} from '../../claim-offer/type-claim-offer'
import { bindActionCreators } from 'redux'
import {
  acceptClaimOffer,
  denyClaimOffer,
} from '../../claim-offer/claim-offer-store'
import {
  UPDATE_ATTRIBUTE_CLAIM,
  ERROR_SEND_PROOF,
} from '../../proof/type-proof'
import { reTrySendProof } from '../../proof/proof-store'
import { deleteHistoryEvent } from '../../connection-history/connection-history-store'
import { safeGet, safeSet } from '../../services/storage'
import {
  DENY_PROOF_REQUEST_FAIL,
  DENY_PROOF_REQUEST,
  PROOF_REQUEST_ACCEPTED,
} from '../../proof-request/type-proof-request'
import { denyProofRequest } from '../../proof-request/proof-request-store'
import { DefaultLogo } from '../../components/default-logo/default-logo'
import { INVITATION_ACCEPTED } from '../../invitation/type-invitation'
import { CONNECTION_FAIL } from '../../store/type-connection-store'
import { sendInvitationResponse } from '../../invitation/invitation-store'
import { ResponseType } from '../../components/request/type-request'
import { deleteConnectionAction } from '../../store/connections-store'

class RecentCardComponent extends React.Component<RecentCardProps, void> {
  render() {
    const props = this.props
    const isRetryCard = getRetryStatus(props.item)
    const isLoading = getLoadingStatus(props.status)

    const cardContent = (
      <View style={styles.container}>
        <View style={styles.iconSection}>
          {renderImageOrText(props.logoUrl, props.issuerName)}
        </View>
        <View style={styles.textSection}>
          <View style={styles.textMessageSection}>
            <Text
              style={
                isRetryCard
                  ? [styles.textMessage, styles.retryText]
                  : styles.textMessage
              }
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {props.statusMessage}
            </Text>
          </View>
          <View style={styles.textIssuerSection}>
            <Text
              style={
                isRetryCard
                  ? [styles.textIssuer, styles.retryText]
                  : styles.textIssuer
              }
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {props.issuerName}
            </Text>
          </View>
        </View>
        <View style={styles.textDateSection}>
          {isRetryCard ? (
            <Text style={[styles.textDate, styles.retryText]}>
              Tap to retry
            </Text>
          ) : isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.textDate}>{props.timestamp}</Text>
          )}
        </View>
      </View>
    )

    if (isRetryCard) {
      const onRetry = getRetryFunction(props)
      const onDeleteExtra = getDeleteFunction(props)
      return (
        <SwipeableRetry
          onDelete={() => this.onDelete(onDeleteExtra)}
          onRetry={onRetry}
        >
          {cardContent}
        </SwipeableRetry>
      )
    }

    return cardContent
  }

  onDelete = (onDeleteExtraFunc: function) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    this.props.deleteHistoryEvent(this.props.item)
    onDeleteExtraFunc()
  }
}

const renderImageOrText = (logoUrl: string, issuerName: string) => {
  return typeof logoUrl === 'string' ? (
    <Image source={{ uri: logoUrl }} style={styles.issuerLogo} />
  ) : (
    <DefaultLogo
      text={issuerName}
      size={moderateScale(30)}
      fontSize={isiPhone5 ? font.size.S : font.size.M}
    />
  )
}

class SwipeableRetry extends React.PureComponent<
  { onDelete: () => void, onRetry: () => void, children: React.Element<any> },
  { showPreview: boolean }
> {
  state = {
    showPreview: false,
  }

  render() {
    const { onDelete, onRetry, children } = this.props
    const { showPreview } = this.state

    // show preview to user for deleting only 2 times in app lifetime
    return (
      <SwipeRow
        disableRightSwipe={true}
        preview={showPreview}
        rightOpenValue={-scale(100)}
      >
        <TouchableWithoutFeedback onPress={onDelete}>
          <View style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onRetry}>
          {children}
        </TouchableWithoutFeedback>
      </SwipeRow>
    )
  }

  async componentDidMount() {
    try {
      const DELETE_MESSAGE_PREVIEW_COUNT = 'DELETE_MESSAGE_PREVIEW_COUNT'
      const previewCount: string | null = await safeGet(
        DELETE_MESSAGE_PREVIEW_COUNT
      )
      const previewCounter = parseInt(previewCount, 10)
      // if count is not zero or null
      if (!previewCount || isNaN(previewCounter)) {
        this.setState({ showPreview: true })
        // user has never seen delete button preview
        // set count that user has seen it once
        await safeSet(DELETE_MESSAGE_PREVIEW_COUNT, '1')
        return
      }

      if (previewCounter < 3) {
        this.setState({ showPreview: true })
        await safeSet(DELETE_MESSAGE_PREVIEW_COUNT, `${previewCounter + 1}`)
        return
      }
    } catch (e) {}
  }
}

export const reTryActions = [
  CONNECTION_FAIL,
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
  ERROR_SEND_PROOF,
  DENY_PROOF_REQUEST_FAIL,
  // DENY_CLAIM_OFFER_FAIL, --> Uncomment this when we have vcx deny claim offer functions in place.
]

function getRetryStatus(event: *): boolean {
  return reTryActions.includes(event.action)
}

const loadingActions = [
  'PENDING',
  INVITATION_ACCEPTED,
  CLAIM_OFFER_ACCEPTED,
  PROOF_REQUEST_ACCEPTED,
  UPDATE_ATTRIBUTE_CLAIM,
  DENY_PROOF_REQUEST,
  DENY_CLAIM_OFFER,
]
function getLoadingStatus(status: string) {
  return loadingActions.includes(status)
}

// TODO:KS Memoize this function
function getRetryFunction({
  item: event,
  sendInvitationResponse,
  acceptClaimOffer,
  reTrySendProof,
  denyProofRequest,
  denyClaimOffer,
}: *): () => void {
  if (event.action === CONNECTION_FAIL) {
    return () => {
      sendInvitationResponse({
        response: ResponseType.accepted,
        senderDID: event.remoteDid,
      })
    }
  }

  if (
    event.action === SEND_CLAIM_REQUEST_FAIL ||
    event.action === PAID_CREDENTIAL_REQUEST_FAIL
  ) {
    return () => {
      acceptClaimOffer(
        event.originalPayload.uid,
        event.originalPayload.remoteDid
      )
    }
  }

  if (event.action === ERROR_SEND_PROOF) {
    return () => {
      reTrySendProof(
        event.originalPayload.selfAttestedAttributes,
        event.originalPayload
      )
    }
  }

  if (event.action === DENY_PROOF_REQUEST_FAIL) {
    return () => {
      denyProofRequest(event.originalPayload.uid)
    }
  }

  if (event.action === DENY_CLAIM_OFFER_FAIL) {
    return () => {
      denyClaimOffer(event.originalPayload.uid)
    }
  }

  return () => {}
}

function getDeleteFunction({
  item: event,
  deleteConnectionAction,
}: *): () => void {
  if (event.action === CONNECTION_FAIL) {
    return () => {
      deleteConnectionAction(event.remoteDid)
    }
  }

  return () => {}
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      sendInvitationResponse,
      deleteConnectionAction,
      acceptClaimOffer,
      reTrySendProof,
      deleteHistoryEvent,
      denyProofRequest,
      denyClaimOffer,
    },
    dispatch
  )

export const RecentCard = connect(null, mapDispatchToProps)(RecentCardComponent)

const commonCardStyles = {
  height: verticalScale(40),
  marginLeft: moderateScale(20),
  marginRight: moderateScale(20),
}
const styles = StyleSheet.create({
  messageContainer: { flex: 1 },
  container: {
    backgroundColor: colors.cmWhite,
    flexDirection: 'row',
    ...commonCardStyles,
  },
  iconSection: {
    height: '100%',
    width: 40,
    justifyContent: 'center',
  },
  textSection: {
    flex: 1,
  },
  textMessageSection: {
    flex: 2,
    justifyContent: 'flex-end',
  },
  textIssuerSection: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  textDateSection: {
    height: '100%',
    width: moderateScale(48),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  issuerLogo: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(30) / 2,
    opacity: 0.5,
  },
  textMessage: {
    fontSize: verticalScale(fontSizes.size8),
    fontWeight: 'normal',
    fontFamily: fontFamily,
    color: colors.cmGray3,
  },
  textIssuer: {
    fontSize: verticalScale(fontSizes.size10),
    fontWeight: 'normal',
    fontFamily: fontFamily,
    color: colors.cmGray3,
  },
  textDate: {
    fontSize: verticalScale(fontSizes.size11),
    fontWeight: 'normal',
    fontFamily: fontFamily,
    fontStyle: 'italic',
    color: colors.cmGray3,
  },
  placeholderIfNoImage: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(30) / 2,
    backgroundColor: colors.cmGray3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTextIfNoImage: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size7),
    fontWeight: 'bold',
    color: colors.cmWhite,
  },
  retryText: {
    color: colors.cmRed,
    marginRight: scale(3),
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.cmRed,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    ...commonCardStyles,
  },
  deleteButtonText: {
    color: colors.cmWhite,
    alignItems: 'center',
    marginRight: scale(30),
    fontFamily: fontFamily,
    fontSize: scale(12),
  },
})
