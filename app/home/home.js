// @flow
import React, { Component } from 'react'
import {
  StyleSheet,
  Platform,
  View,
  Text,
  FlatList,
  AppState,
} from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase'
import { BlurView } from 'react-native-blur'

import type { Store } from '../store/type-store'
import type { HomeProps, HomeState, Item } from './type-home'
import type { Connection } from '../store/type-connection-store'
import type { ReactNavigation } from '../common/type-common'

import {
  newConnectionSeen,
  notificationCardSwipedUp,
  notificationCardPressed,
} from '../connection-history/connection-history-store'
import { PrimaryHeader } from '../components'
import { ConnectionCard } from './connection-card/connection-card'
import { createStackNavigator, NavigationActions } from 'react-navigation'
import { homeRoute } from '../common'
import { getConnections } from '../store/connections-store'
import { connectionHistRoute } from '../common/route-constants'
import { getUnseenMessages } from '../store/store-selector'
import { scale } from 'react-native-size-matters'
import { size } from './../components/icon'
import { externalStyles } from './styles'
import { NewConnectionInstructions } from './new-connection-instructions'
import { getEnvironmentName } from '../store/config-store'
import { SERVER_ENVIRONMENT } from '../store/type-config-store'
import { withStatusBar } from '../components/status-bar/status-bar'
import { bindActionCreators } from 'redux'

import { NotificationCard } from '../components/notification-card/notification-card'

export class DashboardScreen extends Component<HomeProps, HomeState> {
  static navigationOptions = ({ navigation }: ReactNavigation) => ({
    header: null,
  })

  state = {
    appState: AppState.currentState,
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  componentDidUpdate(prevProps: HomeProps) {
    const noUnSeenMessages =
      Object.keys(prevProps.unSeenMessages).length &&
      !Object.keys(this.props.unSeenMessages).length
    if (noUnSeenMessages) {
      firebase.notifications().setBadge(0)
    }
  }

  handleAppStateChange = (nextAppState: string) => {
    if (
      this.state.appState &&
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.props.newConnections &&
      this.props.newConnections[this.props.newConnections.length - 1] &&
      this.props.shouldShowNotification && // <== This is a problem. Not sure why this evaluates to false in this place here.
        // Another flag is shouldOpenModalFromNotification, which is used in connection-details.
        this.props.navigation.navigate(connectionHistRoute, {
          senderName: this.props.newConnections[
            this.props.newConnections.length - 1
          ].senderName,
          image: this.props.newConnections[this.props.newConnections.length - 1]
            .logoUrl,
          senderDID: this.props.newConnections[
            this.props.newConnections.length - 1
          ].senderDID,
        })
    }
    this.setState({ appState: nextAppState })
  }

  keyExtractor = (item: Object) => item.index.toString()

  onCardPress = (senderName: string, image: ?string, senderDID: string) => {
    this.props.navigation.navigate(connectionHistRoute, {
      senderName,
      image,
      senderDID,
    })
  }

  onNotificationCardPress = (
    senderName: string,
    image: ?string,
    senderDID: string
  ) => {
    this.props.notificationCardPressed()
    this.props.navigation.navigate(connectionHistRoute, {
      senderName,
      image,
      senderDID,
    })
  }

  renderItem = ({ item }: { item: Object }) => {
    const {
      senderName,
      logoUrl,
      senderDID,
      questionTitle,
      status,
      type,
      credentialName,
      date,
      newBadge,
    } = item

    return (
      <ConnectionCard
        onPress={() => {
          this.onCardPress(senderName, logoUrl, senderDID)
        }}
        onNewConnectionSeen={this.props.onNewConnectionSeen}
        image={logoUrl}
        status={status}
        senderName={senderName}
        type={type}
        credentialName={credentialName}
        date={date}
        question={questionTitle}
        newBadge={newBadge}
        senderDID={senderDID}
      />
    )
  }

  render() {
    const {
      container,
      flatListContainer,
      flatListInnerContainer,
      blurContainer,
      outerContainer,
    } = externalStyles

    return (
      <View style={outerContainer}>
        <PrimaryHeader headline="Connections" />
        {this.props.shouldShowNotification &&
          this.props.isCorrectStatus && (
            <NotificationCard
              image={
                this.props.newConnections &&
                this.props.newConnections[0].logoUrl
              }
              status={this.props.newConnections[0].status}
              senderName={this.props.newConnections[0].senderName}
              credentialName={this.props.newConnections[0].credentialName}
              question={this.props.newConnections[0].questionTitle}
              senderDID={this.props.newConnections[0].senderDID}
              newBadge={this.props.newConnections[0].newBadge}
              notificationCardSwipedUp={this.props.notificationCardSwipedUp}
              onNotificationCardPress={this.onNotificationCardPress}
            />
          )}
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
            style={flatListContainer}
            contentContainerStyle={flatListInnerContainer}
            data={this.props.newConnections}
            renderItem={this.renderItem}
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: Store) => {
  // when ever there is change in claimOffer state and proof request state
  // getUnseenMessages selector will return updated data
  // type casting from Array<mixed> to any and then to what we need
  // because flow Array<mixed> can't be directly type casted as of now
  const receivedConnections: Connection[] = (getConnections(
    state.connections.data
  ): any)
  const newConnections = receivedConnections
    .map((connection, index) => {
      return {
        ...connection,
        index,
        date:
          state.history.data &&
          state.history.data.connections &&
          state.history.data.connections[connection.senderDID] &&
          state.history.data.connections[connection.senderDID].data &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ] &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ].timestamp,
        status:
          state.history.data &&
          state.history.data.connections &&
          state.history.data.connections[connection.senderDID] &&
          state.history.data.connections[connection.senderDID].data &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ] &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ].status,
        questionTitle:
          state.history.data &&
          state.history.data.connections &&
          state.history.data.connections[connection.senderDID] &&
          state.history.data.connections[connection.senderDID].data &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ] &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ].name,
        credentialName:
          state.history.data &&
          state.history.data.connections &&
          state.history.data.connections[connection.senderDID] &&
          state.history.data.connections[connection.senderDID].data &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ] &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ].name,
        type:
          state.history.data &&
          state.history.data.connections &&
          state.history.data.connections[connection.senderDID] &&
          state.history.data.connections[connection.senderDID].data &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ] &&
          state.history.data.connections[connection.senderDID].data[
            state.history.data.connections[connection.senderDID].data.length - 1
          ].type,
        newBadge:
          state.history.data &&
          state.history.data.connections &&
          state.history.data.connections[connection.senderDID] &&
          state.history.data.connections[connection.senderDID].newBadge,
        senderDID: connection.senderDID,
      }
    })
    .sort((a, b) => {
      if (!b.date) {
        return 0
      }
      let bTimestamp = new Date(b.date).getTime()
      if (!a.date) {
        return 0
      }
      let aTimestamp = new Date(a.date).getTime()
      return bTimestamp - aTimestamp
    })

  const hasNoConnection = state.connections.hydrated
    ? newConnections.length === 0
    : false
  const isCorrectStatus =
    (newConnections[0] && newConnections[0].status === 'PROOF RECEIVED') ||
    (newConnections[0] && newConnections[0].status === 'QUESTION_RECEIVED') ||
    (newConnections[0] && newConnections[0].status === 'CLAIM OFFER RECEIVED')

  let unSeenMessages = getUnseenMessages(state)
  return {
    connections: state.connections,
    unSeenMessages,
    history: state.history,
    environmentName: getEnvironmentName(state.config),
    shouldShowNotification:
      state.history.data && state.history.data.shouldShowNotification,
    isCorrectStatus,
    hasNoConnection,
    newConnections,
    shouldOpenModalFromNotification:
      state.history.data && state.history.data.shouldOpenModalFromNotification,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onNewConnectionSeen: newConnectionSeen,
      notificationCardSwipedUp: notificationCardSwipedUp,
      notificationCardPressed,
    },
    dispatch
  )

export default createStackNavigator({
  [homeRoute]: {
    screen: withStatusBar()(
      connect(mapStateToProps, mapDispatchToProps)(DashboardScreen)
    ),
  },
})

export const tokenAmountSize = (tokenAmountLength: number): number => {
  // this resizing logic is different than wallet tabs header
  switch (true) {
    case tokenAmountLength < 16:
      return scale(26)
    case tokenAmountLength < 20:
      return scale(20)
    default:
      return scale(19)
  }
}
