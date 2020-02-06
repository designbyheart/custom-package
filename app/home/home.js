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

import { newConnectionSeen } from '../connection-history/connection-history-store'
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

import { NotificationCard } from '../in-app-notification/in-app-notification-card'

export class DashboardScreen extends Component<HomeProps, HomeState> {
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

  keyExtractor = (item: Object) => item.index.toString()

  onCardPress = (
    senderName: string,
    image: ?string,
    senderDID: string,
    identifier: string
  ) => {
    this.props.navigation.navigate(connectionHistRoute, {
      senderName,
      image,
      senderDID,
      identifier,
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
      identifier,
    } = item

    return (
      <ConnectionCard
        onPress={() => {
          this.onCardPress(senderName, logoUrl, senderDID, identifier)
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

        <NotificationCard />

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
            data={this.props.connections}
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
  const connections = receivedConnections
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
    ? connections.length === 0
    : false

  let unSeenMessagesCount = Object.keys(getUnseenMessages(state)).length

  return {
    unSeenMessagesCount,
    environmentName: getEnvironmentName(state.config),
    hasNoConnection,
    connections,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onNewConnectionSeen: newConnectionSeen,
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
