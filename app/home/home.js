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
import { connect } from 'react-redux'
import Snackbar from 'react-native-snackbar'
import { BlurView } from 'react-native-blur'

import type { Store } from '../store/type-store'
import type { HomeProps } from './type-home'
import type { Connection } from '../store/type-connection-store'
import type { ReactNavigation } from '../common/type-common'

import { HISTORY_EVENT_STATUS } from '../connection-history/type-connection-history'
import { PrimaryHeader, CameraButton } from '../components'
import { createStackNavigator } from 'react-navigation'
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
import { withStatusBar } from '../components/status-bar/status-bar'
import {
  primaryHeaderHeight,
  white,
  newBannerCardSizes,
  isiPhone5,
} from '../common/styles/constant'
import { NewBannerCard } from './new-banner-card/new-banner-card'
import { RecentCard } from './recent-card/recent-card'
import { RecentCardSeparator } from './recent-card-separator'
import { EmptyViewPlaceholder } from './empty-view-placeholder'
import { venetianRed } from '../common/styles'

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
        logoUrl={item.originalPayload.payloadInfo.senderLogoUrl}
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
    else if (status === HISTORY_EVENT_STATUS.DENY_PROOF_REQUEST_SUCCESS)
      statusMessage = `You denied "${action}".`
    else if (status === HISTORY_EVENT_STATUS.SEND_CLAIM_REQUEST_SUCCESS)
      statusMessage = `"${action}" will be issued to you shortly.`

    return (
      <RecentCard
        status={status}
        timestamp={formattedTimestamp}
        statusMessage={statusMessage}
        issuerName={issuerName}
        logoUrl={logoUrl}
      />
    )
  }

  renderEmptyListPlaceholder = () => <EmptyViewPlaceholder />

  renderBlurForIos = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView
          style={styles.blurContainer}
          blurType="light"
          blurAmount={8}
        />
      )
    } else return null
  }

  // This function replaces flexGrow style property we had before.
  // FlexGrow is not able to work properly when combined with FlatList
  // and its content container.
  applyCorrectStylesForNewBadgeFlatList = () => {
    if (this.props.newBannerConnections.length === 0)
      return styles.checkmarkContainer
    else if (this.props.newBannerConnections.length === 1)
      return styles.newBadgeFlatListContainer1
    else if (this.props.newBannerConnections.length === 2)
      return styles.newBadgeFlatListContainer2
    else if (this.props.newBannerConnections.length === 3)
      return styles.newBadgeFlatListContainer3
    else if (this.props.newBannerConnections.length >= 4)
      return styles.newBadgeFlatListContainer4
  }

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
          <View style={this.applyCorrectStylesForNewBadgeFlatList()}>
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
        {this.renderBlurForIos()}
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
        title: this.props.snackError,
        backgroundColor: venetianRed,
        fontFamily: 'Lato',
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

  // This customFlat function already flattens out only the objects based on the actions,
  // and those objects are then unshifted to newBannerConnections and recentConnections,
  // which is by default sorted based on the most recent ones, so not sure if we need sort
  // based on date or something else scrambles the recentConnections array
  // Custom flatten function to avoid flow error for missing flat/flatMap in flow-bin
  // TODO: Replace this with flatMap when we update flow-bin
  const customFlat = (array: Array<Array<Object>>) => [].concat(...array)

  const receivedConnections: Connection[] = (getConnections(
    state.connections.data
  ): any)

  // Once the credential is accepted or prood is shared, that object does not contain logoUrl and issuerName
  // so we need to store them here.
  const mappedDidToLogoAndName = {}
  receivedConnections.map(connection => {
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

  const flattenPlaceholderArray = customFlat(placeholderArray)

  // Sorts the newest actions to be on top
  const newBannerConnections = []
  const recentConnections = []
  flattenPlaceholderArray.map(connection => {
    if (isNewConnection(connection.status)) {
      newBannerConnections.unshift(connection)
    } else recentConnections.unshift(connection)
  })
  recentConnections.sort((a, b) => {
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

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getUnacknowledgedMessages,
    },
    dispatch
  )

export default createStackNavigator({
  [homeRoute]: {
    screen: withStatusBar()(
      connect(mapStateToProps, mapDispatchToProps)(HomeScreen)
    ),
  },
})

const { height } = Dimensions.get('screen')
const growHeightBase = newBannerCardSizes.height
const growDistanceBase = newBannerCardSizes.distance
const growPaddingBase = 50 // 25 pixels padding from the top header and the bottom list

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: white,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: primaryHeaderHeight,
  },
  checkmarkContainer: {
    width: '100%',
    height: height * 0.6,
  },
  newBadgeFlatListContainer: {
    marginTop: primaryHeaderHeight + 20,
  },
  newBadgeFlatListContainer1: {
    width: '100%',
    height: primaryHeaderHeight + growHeightBase + growPaddingBase,
  },
  newBadgeFlatListContainer2: {
    width: '100%',
    height:
      primaryHeaderHeight +
      growHeightBase * 2 +
      growPaddingBase +
      growDistanceBase,
  },
  newBadgeFlatListContainer3: {
    width: '100%',
    height:
      primaryHeaderHeight +
      growHeightBase * 3 +
      growPaddingBase +
      growDistanceBase * 2,
  },
  newBadgeFlatListContainer4: {
    width: '100%',
    height:
      primaryHeaderHeight +
      growHeightBase * 4 +
      growPaddingBase +
      growDistanceBase * 3,
  },
  newBadgeFlatListInnerContainer: {
    paddingBottom: 25,
  },
  recentFlatListContainer: {
    flex: 1,
  },
  recentFlatListInnerContainer: {
    paddingBottom: 80,
    paddingTop: isiPhone5 ? 10 : 14,
  },
})
