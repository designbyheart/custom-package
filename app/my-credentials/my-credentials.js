// @flow
import React, { Component } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'
import { verticalScale, moderateScale } from 'react-native-size-matters'
import type { Store } from '../store/type-store'
import type { ReactNavigation } from '../common/type-common'
import type { MyCredentialsProps, Item } from './type-my-credentials'
import type { ClaimOfferPayload } from '../claim-offer/type-claim-offer'
import { PrimaryHeader, CameraButton } from '../components'
import { CredentialCard } from './credential-card/credential-card'
import { myCredentialsRoute, qrCodeScannerTabRoute } from '../common'
import { colors, fontFamily, fontSizes } from '../common/styles/constant'
import { withStatusBar } from '../components/status-bar/status-bar'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

export class MyCredentials extends Component<MyCredentialsProps, void> {
  keyExtractor = (item: Object) => item.claimUuid.toString()

  renderItem = ({ item }: { item: Object }) => {
    const { logoUrl, credentialName, date, attributesCount, claimUuid } = item
    return (
      <CredentialCard
        credentialName={credentialName}
        image={logoUrl}
        claimUuid={claimUuid}
        date={date}
        attributesCount={attributesCount}
      />
    )
  }
  render() {
    const { claimMap, offers } = this.props

    const offersData: Array<ClaimOfferPayload> = Object.keys(offers).map(
      (uid) => offers[uid]
    )
    const credentials: Array<Item> = []
    Object.keys(claimMap).forEach((uid) => {
      const claimData = claimMap[uid]
      const offerData = offersData.find(
        (offer) => offer.remotePairwiseDID === claimData.senderDID
      )
      if (offerData) {
        credentials.push({
          claimUuid: claimData.senderDID,
          credentialName: offerData.data.name,
          date: claimData.issueDate,
          attributesCount: offerData.data.revealedAttributes.length,
          logoUrl: claimData.logoUrl,
        })
      }
    })
    credentials.sort((a, b) => a.credentialName.localeCompare(b.credentialName))

    return (
      <View style={styles.outerContainer}>
        <View style={styles.container} testID="my-credentials-container">
          <FlatList
            keyExtractor={this.keyExtractor}
            style={styles.flatListContainer}
            contentContainerStyle={styles.flatListInnerContainer}
            data={credentials}
            renderItem={this.renderItem}
          ></FlatList>
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
  const claimMap = state.claim.claimMap
  const { claimOffer } = state

  const { vcxSerializedClaimOffers: serializedOffers, ...offers } = claimOffer

  return {
    claimMap,
    offers,
  }
}

export const myCredentialsScreen = {
  routeName: myCredentialsRoute,
  screen: connect(mapStateToProps)(MyCredentials),
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cmWhite,
  },
  flatListContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cmWhite,
  },
  flatListInnerContainer: {
    paddingTop: verticalScale(90),
  },
  textInner: {
    width: '100%',
    height: moderateScale(70),
  },
  content: {
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: '400',
    color: colors.cmGray1,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
  },
})
