// @flow
import React, { PureComponent } from 'react'
import {
  Animated,
  StyleSheet,
  Platform,
  View,
  Text,
  FlatList,
} from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase'
import { BlurView } from 'react-native-blur'

import type { Store } from '../store/type-store'
import type { HomeProps } from './type-home'
import type { Connection } from '../store/type-connection-store'
import type { ReactNavigation } from '../common/type-common'

import { newConnectionSeen } from '../connection-history/connection-history-store'
import { PrimaryHeader } from '../components'
import { ConnectionCard } from './connection-card/connection-card'
import { createStackNavigator } from 'react-navigation'
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

export class DashboardScreen extends PureComponent<HomeProps> {
  static navigationOptions = ({ navigation }: ReactNavigation) => ({
    header: <PrimaryHeader headline="Connections" />,
  })

  componentDidUpdate(prevProps: HomeProps) {
    const noUnSeenMessages =
      Object.keys(prevProps.unSeenMessages).length &&
      !Object.keys(this.props.unSeenMessages).length
    if (noUnSeenMessages) {
      firebase.notifications().setBadge(0)
    }
  }

  keyExtractor = (item: Object) => item.identifier

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
      identifier,
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
          this.onCardPress(senderName, logoUrl, senderDID, identifier)
        }}
        onNewConnectionSeen={this.props.onNewConnectionSeen}
        identifier={identifier}
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
    const connections = receivedConnections
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

    const hasNoConnection = hydrated ? connections.length === 0 : false
    return (
      <View style={container}>
        {hasNoConnection && (
          <NewConnectionInstructions
            usingProductionNetwork={environmentName === SERVER_ENVIRONMENT.PROD}
          />
        )}
        <FlatList
          keyExtractor={this.keyExtractor}
          style={flatListContainer}
          contentContainerStyle={flatListInnerContainer}
          data={connections}
          renderItem={this.renderItem}
        />
        {Platform.OS === 'ios' ? (
          <BlurView style={blurContainer} blurType="light" blurAmount={8} />
        ) : null}
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
