// @flow
import React, { Component } from 'react'
import { StyleSheet, Platform, View, Text, FlatList } from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase'
import { BlurView } from 'react-native-blur'
import moment from 'moment'

import type { Store } from '../store/type-store'
import type { HomeProps } from './type-home'
import type { Connection } from '../store/type-connection-store'
import type { ReactNavigation } from '../common/type-common'

import { newConnectionSeen } from '../connection-history/connection-history-store'
import { PrimaryHeader, CameraButton } from '../components'
import { createStackNavigator, NavigationActions } from 'react-navigation'
import {
  homeRoute,
  qrCodeScannerTabRoute,
  proofRequestRoute,
  claimOfferRoute,
  questionRoute,
} from '../common'
import { getConnections } from '../store/connections-store'
import { getUnseenMessages } from '../store/store-selector'
import { scale } from 'react-native-size-matters'
import { size } from '../components/icon'
import { NewConnectionInstructions } from '../my-connections/new-connection-instructions'
import { getEnvironmentName } from '../store/config-store'
import { SERVER_ENVIRONMENT } from '../store/type-config-store'
import { withStatusBar } from '../components/status-bar/status-bar'
import { bindActionCreators } from 'redux'
import { measurements } from '../common/styles/measurements'
import { primaryHeaderHeight } from '../common/styles/constant'
import { NewBannerCard } from './new-banner-card/new-banner-card'
import { RecentCard } from './recent-card/recent-card'
import { RecentCardSeparator } from './recent-card-separator'
import { EmptyViewPlaceholder } from './empty-view-placeholder'

export class HomeScreen extends Component<HomeProps, void> {
  static navigationOptions = ({ navigation }: ReactNavigation) => ({
    header: null,
  })

  componentDidUpdate(prevProps: HomeProps) {
    const noUnSeenMessages =
      prevProps.unSeenMessagesCount && !this.props.unSeenMessagesCount

    if (noUnSeenMessages) {
      firebase.notifications().setBadge(0)
    }
  }

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
    if (item.status === 'CLAIM OFFER RECEIVED')
      navigationRoute = claimOfferRoute
    else if (item.status === 'PROOF RECEIVED')
      navigationRoute = proofRequestRoute
    else if (item.status === 'QUESTION_RECEIVED')
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
    if (status === 'CONNECTED')
      statusMessage = `You connected with "${issuerName}".`
    else if (status === 'RECEIVED')
      statusMessage = `You have been issued a "${action}".`
    else if (status === 'SHARED') statusMessage = `You shared "${action}".`
    else if (status === 'UPDATE_QUESTION_ANSWER')
      statusMessage = `You answered "${action}".`
    else if (status === 'DENY_PROOF_REQUEST_SUCCESS')
      statusMessage = `You denied "${action}".`
    else if (status === 'PENDING')
      statusMessage = `"${action}" will be issued to you shortly...`

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

  render() {
    const {
      container,
      newBannerFlatListContainer,
      recentCardFlatListInnerContainer,
      outerContainer,
      recentCardFlatListContainer,
      newBannerCardFlatListInnerContainer,
      checkmarkFlatListContainer,
      newBannerCardFlatListInnerContainerMaxHeight,
    } = styles

    return (
      <View style={outerContainer}>
        <View style={container} testID="home-container">
          {this.props.hasNoConnection && (
            <NewConnectionInstructions
              usingProductionNetwork={
                this.props.environmentName === SERVER_ENVIRONMENT.PROD
              }
            />
          )}
          <FlatList
            keyExtractor={this.keyExtractor}
            ListEmptyComponent={this.renderEmptyListPlaceholder}
            style={
              this.props.newBannerConnections.length > 0
                ? newBannerFlatListContainer
                : checkmarkFlatListContainer
            }
            contentContainerStyle={
              this.props.newBannerConnections.length < 4
                ? newBannerCardFlatListInnerContainer
                : newBannerCardFlatListInnerContainerMaxHeight
            }
            data={this.props.newBannerConnections}
            renderItem={({ item }) => this.renderNewBannerCard(item)}
          />

          <RecentCardSeparator />

          <FlatList
            keyExtractor={this.keyExtractor}
            style={recentCardFlatListContainer}
            contentContainerStyle={recentCardFlatListInnerContainer}
            data={this.props.recentConnections}
            renderItem={({ item }) => this.renderRecentCard(item)}
          />
        </View>
        {this.renderBlurForIos()}
        <PrimaryHeader headline="Home" navigation={this.props.navigation} />
        <CameraButton
          onPress={() => this.props.navigation.navigate(qrCodeScannerTabRoute)}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: Store) => {
  const isNewConnection = (status: string) => {
    if (
      status === 'CLAIM OFFER RECEIVED' ||
      status === 'PROOF RECEIVED' ||
      status === 'QUESTION_RECEIVED'
    ) {
      return true
    } else return false
  }

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

  const hasNoConnection = state.connections.hydrated
    ? connections.length === 0
    : false

  let unSeenMessagesCount = Object.keys(getUnseenMessages(state)).length

  return {
    unSeenMessagesCount,
    environmentName: getEnvironmentName(state.config),
    hasNoConnection,
    newBannerConnections,
    recentConnections,
    mappedDidToLogoAndName,
  }
}

export default createStackNavigator({
  [homeRoute]: {
    screen: withStatusBar()(connect(mapStateToProps, null)(HomeScreen)),
  },
})

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  newBannerFlatListContainer: {
    flexGrow: 0,
    backgroundColor: '#fff',
    paddingTop: primaryHeaderHeight + 12,
  },
  checkmarkFlatListContainer: {
    flexGrow: 0,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: primaryHeaderHeight,
  },
  recentCardFlatListContainer: {
    width: '100%',
    minHeight: '35%',
    backgroundColor: '#fff',
  },
  recentCardFlatListInnerContainer: {
    paddingBottom: 120,
    paddingTop: 20,
  },
  newBannerCardFlatListInnerContainer: {
    paddingBottom: 25,
  },
  newBannerCardFlatListInnerContainerMaxHeight: {
    paddingBottom: '40%',
  },
})
