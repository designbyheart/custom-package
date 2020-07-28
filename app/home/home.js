// @flow
import React, { Component } from 'react'
import moment from 'moment'
import firebase from 'react-native-firebase'
import {
  StyleSheet,
  Platform,
  View,
  Text,
  FlatList,
  Dimensions,
} from 'react-native'
import { bindActionCreators } from 'redux'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { connect } from 'react-redux'
import Snackbar from 'react-native-snackbar'

import type { Store } from '../store/type-store'
import type { HomeProps } from './type-home'
import type { Connection } from '../store/type-connection-store'
import type { ReactNavigation } from '../common/type-common'

import { HISTORY_EVENT_STATUS } from '../connection-history/type-connection-history'
import { PrimaryHeader, CameraButton } from '../components'
import {
  homeRoute,
  qrCodeScannerTabRoute,
  proofRequestRoute,
  claimOfferRoute,
  questionRoute,
} from '../common'
import { getConnections } from '../store/connections-store'
import { NewConnectionInstructions } from '../my-connections/new-connection-instructions'
import {
  getEnvironmentName,
  getUnacknowledgedMessages,
} from '../store/config-store'
import {
  SERVER_ENVIRONMENT,
  GET_MESSAGES_LOADING,
} from '../store/type-config-store'
import { colors, fontFamily } from '../common/styles/constant'
import { NewBannerCard } from './new-banner-card/new-banner-card'
import { RecentCard } from './recent-card/recent-card'
import { RecentCardSeparator } from './recent-card-separator'
import { EmptyViewPlaceholder } from './empty-view-placeholder'
import { venetianRed } from '../common/styles'
import {
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
} from '../claim-offer/type-claim-offer'
import { UPDATE_ATTRIBUTE_CLAIM, ERROR_SEND_PROOF } from '../proof/type-proof'

export class HomeScreen extends Component<HomeProps, void> {
  static navigationOptions = ({ navigation }: ReactNavigation) => ({
    header: null,
  })

  formatTimestamp = (timestamp: string) => {
    const now = moment().valueOf()
    var formattedTimestamp = moment(timestamp).valueOf()
    let minutes = Math.floor((now - formattedTimestamp) / 1000 / 60)

    if (minutes > 7 * 24 * 60) {
      return moment(timestamp).format('DD MMMM YYYY')
    } else if (minutes >= 2 * 24 * 60) {
      return moment(timestamp).format('dddd')
    } else if (minutes >= 24 * 60) {
      return 'Yesterday'
    } else if (minutes >= 120) return `${Math.floor(minutes / 60)} hours ago`
    else if (minutes >= 60) return `1 hour ago`
    else if (minutes >= 2) return `${minutes} minutes ago`
    else if (minutes >= 1) return '1 minute ago'
    else return 'Just now'
  }

  keyExtractor = (item: Object) => item.timestamp

  renderNewBannerCard = (item: Object) => {
    const issuerName =
      (item.originalPayload &&
        item.originalPayload.payload &&
        item.originalPayload.payload.issuer &&
        item.originalPayload.payload.issuer.name) ||
      (item.originalPayload &&
        item.originalPayload.payload &&
        item.originalPayload.payload.requester &&
        item.originalPayload.payload.requester.name) ||
      (item.data && item.data.remoteName)
    const formattedTimestamp = this.formatTimestamp(item.timestamp)
    const logoUrl =
      this.props.mappedDidToLogoAndName &&
      this.props.mappedDidToLogoAndName[item.remoteDid] &&
      this.props.mappedDidToLogoAndName[item.remoteDid].logoUrl

    let navigationRoute = ''
    if (item.status === HISTORY_EVENT_STATUS.CLAIM_OFFER_RECEIVED)
      navigationRoute = claimOfferRoute
    else if (item.status === HISTORY_EVENT_STATUS.PROOF_REQUEST_RECEIVED)
      navigationRoute = proofRequestRoute
    else if (item.status === HISTORY_EVENT_STATUS.QUESTION_RECEIVED)
      navigationRoute = questionRoute

    return (
      <NewBannerCard
        navigation={this.props.navigation}
        navigationRoute={navigationRoute}
        timestamp={formattedTimestamp}
        logoUrl={logoUrl}
        uid={item.originalPayload.payloadInfo.uid}
        issuerName={issuerName}
      />
    )
  }

  renderRecentCard = (item: Object) => {
    const status = item.status
    const action = item.name
    const issuerName =
      this.props.mappedDidToLogoAndName &&
      this.props.mappedDidToLogoAndName[item.remoteDid] &&
      this.props.mappedDidToLogoAndName[item.remoteDid].issuerName
    const logoUrl =
      this.props.mappedDidToLogoAndName &&
      this.props.mappedDidToLogoAndName[item.remoteDid] &&
      this.props.mappedDidToLogoAndName[item.remoteDid].logoUrl
    const formattedTimestamp = this.formatTimestamp(item.timestamp)

    let statusMessage = ''
    if (status === HISTORY_EVENT_STATUS.NEW_CONNECTION_SUCCESS)
      statusMessage = `You connected with "${issuerName}".`
    else if (status === HISTORY_EVENT_STATUS.CLAIM_STORAGE_SUCCESS)
      statusMessage = `You have been issued a "${action}".`
    else if (status === HISTORY_EVENT_STATUS.SEND_PROOF_SUCCESS)
      statusMessage = `You shared "${action}".`
    else if (status === HISTORY_EVENT_STATUS.UPDATE_QUESTION_ANSWER)
      statusMessage = `${action}.`
    else if (
      status === HISTORY_EVENT_STATUS.DENY_PROOF_REQUEST_SUCCESS ||
      status === HISTORY_EVENT_STATUS.DENY_CLAIM_OFFER_SUCCESS
    )
      statusMessage = `You rejected "${action}".`
    else if (
      status === HISTORY_EVENT_STATUS.DENY_PROOF_REQUEST ||
      status === HISTORY_EVENT_STATUS.DENY_CLAIM_OFFER
    )
      statusMessage = `Rejecting "${action}"`
    else if (
      status === HISTORY_EVENT_STATUS.DENY_PROOF_REQUEST_FAIL ||
      status === HISTORY_EVENT_STATUS.DENY_CLAIM_OFFER_FAIL
    )
      statusMessage = `Failed to reject "${action}"`
    else if (
      status === HISTORY_EVENT_STATUS.SEND_CLAIM_REQUEST_SUCCESS ||
      status === HISTORY_EVENT_STATUS.CLAIM_OFFER_ACCEPTED
    )
      statusMessage = `"${action}" will be issued to you shortly.`
    else if (
      status === SEND_CLAIM_REQUEST_FAIL ||
      status === PAID_CREDENTIAL_REQUEST_FAIL
    )
      statusMessage = `Failed to accept "${action}"`
    else if (status === UPDATE_ATTRIBUTE_CLAIM) statusMessage = `Sending...`
    else if (status === ERROR_SEND_PROOF)
      statusMessage = `Failed to send "${action}"`

    return (
      <RecentCard
        status={status}
        timestamp={formattedTimestamp}
        statusMessage={statusMessage}
        issuerName={issuerName}
        logoUrl={logoUrl}
        item={item}
      />
    )
  }

  renderEmptyListPlaceholder = () => <EmptyViewPlaceholder />

  render() {
    return (
      <View style={styles.outerContainer}>
        <View
          style={styles.container}
          testID="home-container"
          accessible={true}
          accessibilityLabel="home-container"
        >
          {this.props.hasNoConnection && (
            <NewConnectionInstructions
              usingProductionNetwork={
                this.props.environmentName === SERVER_ENVIRONMENT.PROD
              }
            />
          )}
          <View style={styles.checkmarkContainer}>
            <FlatList
              keyExtractor={this.keyExtractor}
              style={styles.newBadgeFlatListContainer}
              contentContainerStyle={styles.newBadgeFlatListInnerContainer}
              data={this.props.newBannerConnections}
              renderItem={({ item }) => this.renderNewBannerCard(item)}
              ListEmptyComponent={this.renderEmptyListPlaceholder}
              onRefresh={this.onRefresh}
              refreshing={
                this.props.messageDownloadStatus === GET_MESSAGES_LOADING
              }
            />
          </View>

          <RecentCardSeparator />

          <View style={styles.recentFlatListContainer}>
            <FlatList
              keyExtractor={this.keyExtractor}
              contentContainerStyle={styles.recentFlatListInnerContainer}
              data={this.props.recentConnections}
              renderItem={({ item }) => this.renderRecentCard(item)}
            />
          </View>
        </View>
        <PrimaryHeader headline="Home" navigation={this.props.navigation} />
        <CameraButton
          onPress={() => this.props.navigation.navigate(qrCodeScannerTabRoute)}
        />
      </View>
    )
  }

  onRefresh = () => {
    this.props.getUnacknowledgedMessages()
  }

  componentDidUpdate(prevProps: HomeProps) {
    if (
      prevProps.snackError !== this.props.snackError &&
      this.props.snackError
    ) {
      Snackbar.dismiss()
      Snackbar.show({
        text: this.props.snackError,
        backgroundColor: venetianRed,
        fontFamily: fontFamily,
        duration: Snackbar.LENGTH_LONG,
      })
    }
  }
}

const mapStateToProps = (state: Store) => {
  const isNewConnection = (status: string) => {
    if (
      status === HISTORY_EVENT_STATUS.CLAIM_OFFER_RECEIVED ||
      status === HISTORY_EVENT_STATUS.PROOF_REQUEST_RECEIVED ||
      status === HISTORY_EVENT_STATUS.QUESTION_RECEIVED
    ) {
      return true
    } else return false
  }

  // TODO: Replace this with flatMap when we update flow-bin
  const customFlat = (array: Array<Array<Object>>) => [].concat(...array)

  const receivedConnections: Connection[] = (getConnections(
    state.connections.data
  ): any)

  // Once the credential is accepted or proof is shared, that object does not contain logoUrl and issuerName
  // so we need to store them here.
  const mappedDidToLogoAndName = {}
  receivedConnections.map((connection) => {
    mappedDidToLogoAndName[connection.senderDID] = {
      logoUrl: connection.logoUrl,
      issuerName: connection.senderName,
    }
  })

  // TODO: Replace this with flatMap when we update flow-bin
  const placeholderArray = []
  const connections = receivedConnections.map((connection, index) => {
    placeholderArray.push(
      (state.history.data &&
        state.history.data.connections &&
        state.history.data.connections[connection.senderDID] &&
        state.history.data.connections[connection.senderDID].data) ||
        []
    )
  })

  const flattenPlaceholderArray = customFlat(placeholderArray).sort((a, b) => {
    if (!b.timestamp) {
      return 0
    }
    let bTimestamp = new Date(b.timestamp).getTime()
    if (!a.timestamp) {
      return 0
    }
    let aTimestamp = new Date(a.timestamp).getTime()
    return bTimestamp - aTimestamp
  })

  // Sorts the newest actions to be on top
  const newBannerConnections = []
  const recentConnections = []
  flattenPlaceholderArray.map((connection) => {
    if (isNewConnection(connection.status)) {
      newBannerConnections.push(connection)
    } else recentConnections.push(connection)
  })

  const hasNoConnection = state.connections.hydrated
    ? connections.length === 0
    : false

  return {
    environmentName: getEnvironmentName(state.config),
    hasNoConnection,
    newBannerConnections,
    recentConnections,
    mappedDidToLogoAndName,
    messageDownloadStatus: state.config.messageDownloadStatus,
    snackError: state.config.snackError,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getUnacknowledgedMessages,
    },
    dispatch
  )

export const homeScreen = {
  routeName: homeRoute,
  screen: connect(mapStateToProps, mapDispatchToProps)(HomeScreen),
}

const { height } = Dimensions.get('screen')

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cmWhite,
  },
  checkmarkContainer: {
    width: '100%',
    height: '60%',
  },
  newBadgeFlatListContainer: {
    marginTop: verticalScale(90),
  },
  newBadgeFlatListInnerContainer: {
    paddingBottom: moderateScale(20, 0.2),
    paddingTop: moderateScale(18, 0.1),
  },
  recentFlatListContainer: {
    flex: 1,
  },
  recentFlatListInnerContainer: {
    paddingBottom: moderateScale(70, 0.12),
    paddingTop: moderateScale(10, 0.28),
  },
})
