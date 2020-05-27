// @flow
import * as React from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  LayoutAnimation,
} from 'react-native'
import { connect } from 'react-redux'
import { SwipeRow } from 'react-native-swipe-list-view'
import {
  mediumGray,
  white,
  font,
  recentCardSizes,
  isiPhone5,
  cmRed,
  whiteSolid,
} from '../../common/styles/constant'

import type { RecentCardProps } from './type-recent-card'
import {
  CLAIM_OFFER_ACCEPTED,
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
} from '../../claim-offer/type-claim-offer'
import { bindActionCreators } from 'redux'
import { acceptClaimOffer } from '../../claim-offer/claim-offer-store'
import {
  UPDATE_ATTRIBUTE_CLAIM,
  ERROR_SEND_PROOF,
} from '../../proof/type-proof'
import { reTrySendProof } from '../../proof/proof-store'
import { deleteHistoryEvent } from '../../connection-history/connection-history-store'
import { scale } from 'react-native-size-matters'
import { safeGet, safeSet } from '../../services/storage'
import {
  DENY_PROOF_REQUEST_FAIL,
  DENY_PROOF_REQUEST,
} from '../../proof-request/type-proof-request'
import { denyProofRequest } from '../../proof-request/proof-request-store'

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
      return (
        <SwipeableRetry onDelete={this.onDelete} onRetry={onRetry}>
          {cardContent}
        </SwipeableRetry>
      )
    }

    return cardContent
  }

  onDelete = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    this.props.deleteHistoryEvent(this.props.item)
  }
}

const renderPlaceholderIfNoImage = (character: string) => (
  <View style={styles.placeholderIfNoImage}>
    <Text style={styles.placeholderTextIfNoImage}>{character}</Text>
  </View>
)

const renderImageOrText = (logoUrl: string, issuerName: string) => {
  return typeof logoUrl === 'string' ? (
    <Image source={{ uri: logoUrl }} style={styles.issuerLogo} />
  ) : (
    renderPlaceholderIfNoImage(issuerName[0])
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
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
  ERROR_SEND_PROOF,
  DENY_PROOF_REQUEST_FAIL,
]

function getRetryStatus(event: *): boolean {
  return reTryActions.includes(event.action)
}

const loadingActions = [
  'PENDING',
  CLAIM_OFFER_ACCEPTED,
  UPDATE_ATTRIBUTE_CLAIM,
  DENY_PROOF_REQUEST,
]
function getLoadingStatus(status: string) {
  return loadingActions.includes(status)
}

// TODO:KS Memoize this function
function getRetryFunction({
  item: event,
  acceptClaimOffer,
  reTrySendProof,
  denyProofRequest,
}: *): () => void {
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

  return () => {}
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      acceptClaimOffer,
      reTrySendProof,
      deleteHistoryEvent,
      denyProofRequest,
    },
    dispatch
  )

export const RecentCard = connect(null, mapDispatchToProps)(RecentCardComponent)

const commonCardStyles = {
  height: recentCardSizes.height,
  marginLeft: 20,
  marginRight: 20,
}
const styles = StyleSheet.create({
  messageContainer: { flex: 1 },
  container: {
    backgroundColor: whiteSolid,
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
    width: isiPhone5 ? 48 : 52,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  issuerLogo: {
    width: recentCardSizes.logoSize,
    height: recentCardSizes.logoSize,
    borderRadius: recentCardSizes.logoSize / 2,
    opacity: 0.5,
  },
  textMessage: {
    fontSize: isiPhone5 ? font.size.XS1 : font.size.PREFIX,
    fontWeight: 'normal',
    fontFamily: font.family,
    color: mediumGray,
  },
  textIssuer: {
    fontSize: isiPhone5 ? font.size.XXXS : font.size.XXS,
    fontWeight: 'normal',
    fontFamily: font.family,
    color: mediumGray,
  },
  textDate: {
    fontSize: isiPhone5 ? font.size.XXXXXS : font.size.XXXXS,
    fontWeight: 'normal',
    fontFamily: font.family,
    fontStyle: 'italic',
    color: mediumGray,
  },
  placeholderIfNoImage: {
    width: recentCardSizes.logoSize,
    height: recentCardSizes.logoSize,
    borderRadius: recentCardSizes.logoSize / 2,
    backgroundColor: mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTextIfNoImage: {
    fontFamily: font.family,
    fontSize: isiPhone5 ? font.size.S : font.size.M,
    fontWeight: 'bold',
    color: white,
  },
  retryText: {
    color: cmRed,
    marginRight: scale(3),
  },
  deleteButton: {
    flex: 1,
    backgroundColor: cmRed,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    ...commonCardStyles,
  },
  deleteButtonText: {
    color: whiteSolid,
    alignItems: 'center',
    marginRight: scale(30),
    fontFamily: font.family,
    fontSize: scale(font.size.XS),
  },
})
