// @flow
import React, { Component } from 'react'
import { StyleSheet, Platform, View, Text, FlatList } from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase'
import { BlurView } from 'react-native-blur'

import type { Store } from '../store/type-store'
import type { HomeProps } from './type-home'
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

export class DashboardScreen extends Component<HomeProps> {
  static navigationOptions = ({ navigation }: ReactNavigation) => ({
    header: null,
  })

  componentDidUpdate(prevProps: HomeProps) {
    const noUnSeenMessages =
      Object.keys(prevProps.unSeenMessages).length &&
      !Object.keys(this.props.unSeenMessages).length
    if (noUnSeenMessages) {
      firebase.notifications().setBadge(0)
    }
  }

  keyExtractor = (item: Object) => item.index

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
    const {
      environmentName,
      connections: { data, hydrated },
      unSeenMessages,
      history,
    } = this.props
    // type casting from Array<mixed> to any and then to what we need
    // because flow Array<mixed> can't be directly type casted as of now
    const receivedConnections: Connection[] = (getConnections(data): any)
    const newConnections = receivedConnections
      .map((connection, index) => {
        return {
          ...connection,
          index,
          date:
            history.data &&
            history.data.connections &&
            history.data.connections[connection.senderDID] &&
            history.data.connections[connection.senderDID].data &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ] &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ].timestamp,
          status:
            history.data &&
            history.data.connections &&
            history.data.connections[connection.senderDID] &&
            history.data.connections[connection.senderDID].data &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ] &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ].status,
          questionTitle:
            history.data &&
            history.data.connections &&
            history.data.connections[connection.senderDID] &&
            history.data.connections[connection.senderDID].data &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ] &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ].name,
          credentialName:
            history.data &&
            history.data.connections &&
            history.data.connections[connection.senderDID] &&
            history.data.connections[connection.senderDID].data &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ] &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ].name,
          type:
            history.data &&
            history.data.connections &&
            history.data.connections[connection.senderDID] &&
            history.data.connections[connection.senderDID].data &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ] &&
            history.data.connections[connection.senderDID].data[
              history.data.connections[connection.senderDID].data.length - 1
            ].type,
          newBadge:
            history.data &&
            history.data.connections &&
            history.data.connections[connection.senderDID] &&
            history.data.connections[connection.senderDID].newBadge,
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

    const hasNoConnection = hydrated ? newConnections.length === 0 : false
    const isCorrectStatus =
      (newConnections[0] && newConnections[0].status === 'PROOF RECEIVED') ||
      (newConnections[0] && newConnections[0].status === 'QUESTION_RECEIVED') ||
      (newConnections[0] && newConnections[0].status === 'CLAIM OFFER RECEIVED')
    return (
      <View style={outerContainer}>
        <PrimaryHeader headline="Connections" />
        {this.props.shouldShowNotification &&
          isCorrectStatus && (
            <NotificationCard
              image={newConnections[0].logoUrl}
              status={newConnections[0].status}
              senderName={newConnections[0].senderName}
              credentialName={newConnections[0].credentialName}
              question={newConnections[0].questionTitle}
              senderDID={newConnections[0].senderDID}
              newBadge={newConnections[0].newBadge}
              notificationCardSwipedUp={this.props.notificationCardSwipedUp}
              onNotificationCardPress={this.onNotificationCardPress}
            />
          )}
        <View style={container} testID="home-container">
          {hasNoConnection && (
            <NewConnectionInstructions
              usingProductionNetwork={
                environmentName === SERVER_ENVIRONMENT.PROD
              }
            />
          )}
          <FlatList
            keyExtractor={this.keyExtractor}
            style={flatListContainer}
            contentContainerStyle={flatListInnerContainer}
            data={newConnections}
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
  let unSeenMessages = getUnseenMessages(state)
  return {
    connections: state.connections,
    unSeenMessages,
    history: state.history,
    environmentName: getEnvironmentName(state.config),
    shouldShowNotification:
      state.history.data && state.history.data.shouldShowNotification,
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
