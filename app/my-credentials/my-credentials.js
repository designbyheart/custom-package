// @flow
import React, { Component } from 'react'
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
} from 'react-native'
import { verticalScale, moderateScale, scale } from 'react-native-size-matters'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import type { Store } from '../store/type-store'
import type { ReactNavigation } from '../common/type-common'
import type { MyCredentialsProps, CredentialItem } from './type-my-credentials'
import type { ClaimOfferPayload } from '../claim-offer/type-claim-offer'
import type { Attribute } from '../push-notification/type-push-notification'

import { PrimaryHeader, CameraButton } from '../components'
import { CredentialCard } from './credential-card/credential-card'
import { HomeInstructions } from '../home/home-instructions/home-instructions'
import { myCredentialsRoute, qrCodeScannerTabRoute } from '../common'
import { colors, fontFamily, fontSizes } from '../common/styles/constant'
import { withStatusBar } from '../components/status-bar/status-bar'
import { credentialDetailsRoute } from '../common/route-constants'
import { SERVER_ENVIRONMENT } from '../store/type-config-store'
import { getEnvironmentName } from '../store/config-store'
import {
  CLAIM_OFFER_STATUS,
  CLAIM_REQUEST_STATUS,
} from '../claim-offer/type-claim-offer'
import { SwipeListView } from 'react-native-swipe-list-view'
import { deleteClaim } from '../claim/claim-store'
import {
  MESSAGE_DELETE_CLAIM_DESCRIPTION,
  MESSAGE_DELETE_CLAIM_TITLE,
} from './type-my-credentials'

class MyCredentialsComponent extends Component<MyCredentialsProps, void> {
  keyExtractor = (item: Object) => item.claimOfferUuid.toString()

  onDelete = (item: Object) => {
    setTimeout(() => {
      Alert.alert(
        MESSAGE_DELETE_CLAIM_TITLE,
        MESSAGE_DELETE_CLAIM_DESCRIPTION,
        [
          {
            text: 'Cancel',
          },
          {
            text: 'Delete',
            onPress: () => {
              this.props.deleteClaim(item.claimOfferUuid)
            },
          },
        ],
        { cancelable: false }
      )
    }, 300)
  }

  renderItem = ({ item }: { item: Object }) => {
    const {
      logoUrl,
      credentialName,
      issuerName,
      date,
      attributes,
      claimUuid,
      remoteDid,
      uid,
    } = item
    return (
      <TouchableHighlight style={styles.rowFront}>
        <CredentialCard
          onPress={() =>
            this.onCardPress(
              credentialName,
              issuerName,
              date,
              attributes,
              logoUrl,
              claimUuid,
              remoteDid,
              uid
            )
          }
          credentialName={credentialName}
          image={logoUrl}
          date={date}
          attributesCount={attributes.length}
        />
      </TouchableHighlight>
    )
  }

  onCardPress = (
    credentialName: string,
    issuerName: string,
    date: number,
    attributes: Array<Attribute>,
    logoUrl: string,
    claimUuid: string,
    remoteDid: string,
    uid: string
  ) => {
    this.props.navigation.navigate(credentialDetailsRoute, {
      credentialName,
      issuerName,
      date,
      attributes,
      logoUrl,
      claimUuid,
      remoteDid,
      uid,
    })
  }

  renderHiddenItem = (data: Object) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => this.onDelete(data.item)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  )

  render() {
    const { offers } = this.props

    const credentials: Array<CredentialItem> = []
    Object.keys(offers).forEach((uid) => {
      const offer: ClaimOfferPayload = offers[uid]
      if (
        offer.claimRequestStatus === CLAIM_REQUEST_STATUS.CLAIM_REQUEST_SUCCESS
      ) {
        credentials.push({
          claimOfferUuid: offer.uid,
          credentialName: offer.data.name,
          issuerName: offer.issuer.name,
          date: offer.issueDate,
          attributes: offer.data.revealedAttributes,
          logoUrl: offer.senderLogoUrl,
          remoteDid: offer.remotePairwiseDID,
          uid: uid,
        })
      }
    })

    credentials.sort((a, b) => a.credentialName.localeCompare(b.credentialName))

    const hasNoCredentials = credentials.length == 0

    return (
      <View style={styles.outerContainer}>
        <View style={styles.container} testID="my-credentials-container">
          {hasNoCredentials && (
            <HomeInstructions
              headline="No Credentials yet!"
              title="Want to see how this app works?"
              prodNetworkText="Go through the tutorial at www.try.connect.me.
              Connect.Me is for collecting digital Credentials. They will appear here."
              devNetworkText="Connect.Me is for collecting digital Credentials. They will appear here."
              usingProductionNetwork={
                this.props.environmentName === SERVER_ENVIRONMENT.PROD
              }
            />
          )}

          <SwipeListView
            keyExtractor={this.keyExtractor}
            contentContainerStyle={styles.flatListInnerContainer}
            data={credentials}
            renderItem={this.renderItem}
            renderHiddenItem={this.renderHiddenItem}
            rightOpenValue={-100}
          />
        </View>
        <PrimaryHeader headline="My Credentials" />
        <CameraButton
          onPress={() => this.props.navigation.navigate(qrCodeScannerTabRoute)}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: Store) => {
  const {
    vcxSerializedClaimOffers: serializedOffers,
    ...offers
  } = state.claimOffer

  return {
    offers,
    environmentName: getEnvironmentName(state.config),
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ deleteClaim }, dispatch)

export const MyCredentials = connect(
  mapStateToProps,
  mapDispatchToProps
)(MyCredentialsComponent)

export const myCredentialsScreen = {
  routeName: myCredentialsRoute,
  screen: MyCredentials,
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.cmWhite,
  },
  flatListInnerContainer: {
    paddingTop: verticalScale(90),
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: colors.cmWhite,
    justifyContent: 'center',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: colors.cmWhite,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  deleteButton: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    backgroundColor: colors.cmRed,
    right: 0,
  },
  deleteButtonText: {
    color: colors.cmWhite,
    alignItems: 'center',
    fontFamily: fontFamily,
    fontSize: scale(12),
  },
})
