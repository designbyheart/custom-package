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
import { bindActionCreators } from 'redux'
import { BlurView } from '@react-native-community/blur'
import Snackbar from 'react-native-snackbar'
import PushNotificationIOS from '@react-native-community/push-notification-ios'

import type { Store } from '../store/type-store'
import type {
  MyConnectionsProps,
  MyConnectionsState,
  Item,
} from './type-my-connections'
import type { Connection } from '../store/type-connection-store'
import type { ReactNavigation } from '../common/type-common'

import { newConnectionSeen } from '../connection-history/connection-history-store'
import { PrimaryHeader, CameraButton } from '../components'
import { ConnectionCard } from './connection-card/connection-card'
import { qrCodeScannerTabRoute } from '../common'
import { getConnections } from '../store/connections-store'
import { connectionHistRoute } from '../common/route-constants'
import { getUnseenMessages } from '../store/store-selector'
import { externalStyles } from './styles'
import { HomeInstructions } from '../home/home-instructions/home-instructions'
import {
  getEnvironmentName,
  getUnacknowledgedMessages,
} from '../store/config-store'
import {
  SERVER_ENVIRONMENT,
  GET_MESSAGES_LOADING,
} from '../store/type-config-store'
import { withStatusBar } from '../components/status-bar/status-bar'
import SvgCustomIcon from '../components/svg-custom-icon'
import { NotificationCard } from '../in-app-notification/in-app-notification-card'
import { colors, fontFamily } from '../common/styles/constant'

export class MyConnections extends Component<
  MyConnectionsProps,
  MyConnectionsState
> {
  componentDidUpdate(prevProps: MyConnectionsProps) {
    const noUnSeenMessages =
      prevProps.unSeenMessagesCount && !this.props.unSeenMessagesCount

    if (noUnSeenMessages) {
      if (Platform.OS === 'ios') {
        // Sets the current badge number on the app icon to zero. iOS only for now.
        PushNotificationIOS.setApplicationIconBadgeNumber(0)
      }
    }

    if (
      prevProps.snackError !== this.props.snackError &&
      this.props.snackError
    ) {
      Snackbar.dismiss()
      Snackbar.show({
        text: this.props.snackError,
        backgroundColor: colors.cmRed,
        duration: Snackbar.LENGTH_LONG,
      })
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
      outerContainer,
    } = externalStyles

    return (
      <View style={outerContainer}>
        <NotificationCard />

        <View
          style={container}
          testID="my-connections-container"
          accessible={true}
          accessibilityLabel="my-connections-container"
        >
          {this.props.hasNoConnection && (
            <HomeInstructions
              headline="You now have a digital wallet!"
              title="Want to see how it works?"
              prodNetworkText="We have setup an optional tutorial site for you to go through
            using this Connect.Me app. To start this process, go to
            try.connect.me in a desktop browser and click Start Tutorial."
              devNetworkText="We see you are not on the live network. Get with an Evernym team
            member to help you use Connect.Me!"
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
            onRefresh={this.onRefresh}
            refreshing={
              this.props.messageDownloadStatus === GET_MESSAGES_LOADING
            }
          />
        </View>
        <PrimaryHeader headline="My Connections" />
        <CameraButton
          onPress={() => this.props.navigation.navigate(qrCodeScannerTabRoute)}
        />
      </View>
    )
  }

  onRefresh = () => {
    this.props.getUnacknowledgedMessages()
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
    messageDownloadStatus: state.config.messageDownloadStatus,
    snackError: state.config.snackError,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onNewConnectionSeen: newConnectionSeen,
      getUnacknowledgedMessages,
    },
    dispatch
  )

export const MyConnectionsScreen = withStatusBar()(
  connect(mapStateToProps, mapDispatchToProps)(MyConnections)
)
