// @flow
import React from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { connect } from 'react-redux'
import {
  mediumGray,
  white,
  font,
  recentCardSizes,
  isiPhone5,
  cmRed,
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

// TODO:KS Use React.useCallback and React.useState
const RecentCardComponent = (props: RecentCardProps) => {
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
          <Text style={[styles.textDate, styles.retryText]}>Tap to retry</Text>
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
    return <TouchableOpacity onPress={onRetry}>{cardContent}</TouchableOpacity>
  }

  return cardContent
}

const reTryActions = [
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
  ERROR_SEND_PROOF,
]

function getRetryStatus(event: *): boolean {
  return reTryActions.includes(event.action)
}

const loadingActions = ['PENDING', CLAIM_OFFER_ACCEPTED, UPDATE_ATTRIBUTE_CLAIM]
function getLoadingStatus(status: string) {
  return loadingActions.includes(status)
}

// TODO:KS Memoize this function
function getRetryFunction({
  item: event,
  acceptClaimOffer,
  reTrySendProof,
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

  // TODO:KS Add handle for DENY_PROOF_REQUEST_FAIL

  return () => {}
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      acceptClaimOffer,
      reTrySendProof,
    },
    dispatch
  )

export const RecentCard = connect(null, mapDispatchToProps)(RecentCardComponent)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: recentCardSizes.height,
    marginLeft: 20,
    marginRight: 20,
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
  },
})
