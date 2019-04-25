// @flow
import React, { PureComponent, Component } from 'react'
import {
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  View,
  Text,
  FlatList,
} from 'react-native'
import { connect } from 'react-redux'
import firebase from 'react-native-firebase'
import {
  Container,
  CustomView,
  Icon,
  UserAvatar,
  CustomText,
  CustomHeader,
  Loader,
  PrimaryHeader,
} from '../components'
import { ConnectionCard } from './connection-card/connection-card'
import { createStackNavigator } from 'react-navigation'
import {
  color,
  barStyleDark,
  OFFSET_3X,
  OFFSET_2X,
  isBiggerThanShortDevice,
  isIphoneX,
  isBiggerThanVeryShortDevice,
  whiteSmokeSecondary,
  responsiveHorizontalPadding,
} from '../common/styles'
import { primaryHeaderStyles } from '../components/layout/header-styles'
import { homeRoute, walletRoute } from '../common'
import { getConnections } from '../store/connections-store'
import type { Store } from '../store/type-store'
import type { HomeProps, HomeState } from './type-home'
import { connectionHistoryRoute } from '../common/route-constants'
import {
  FEEDBACK_TEST_ID,
  SOVRINTOKEN_TEST_ID,
  SOVRINTOKEN_AMOUNT_TEST_ID,
  HOW_IT_WORKS,
  ON_COMPUTER,
  GO_TO_FABER,
  USE_TUTORIAL,
} from './home-constants'
import { Apptentive } from 'apptentive-react-native'
import WalletBalance from '../wallet/wallet-balance'
import type { Connection } from '../store/type-connection-store'
import Banner from '../components/banner/banner'
import { NavigationActions } from 'react-navigation'
import { getUnseenMessages } from '../store/store-selector'
import { scale } from 'react-native-size-matters'
import { size } from './../components/icon'
import { externalStyles } from './styles'
const { width, height } = Dimensions.get('window')
export class DashboardScreen extends PureComponent<HomeProps, HomeState> {
  static navigationOptions = ({ navigation }) => ({
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
    this.props.navigation.navigate(connectionHistoryRoute, {
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
      showBadge,
    } = item

    return (
      <ConnectionCard
        onPress={() =>
          this.onCardPress(senderName, logoUrl, senderDID, identifier)
        }
        identifier={identifier}
        image={logoUrl}
        status={status}
        senderName={senderName}
        type={type}
        credentialName={credentialName}
        date={date}
        question={questionTitle}
        showBadge={showBadge}
      />
    )
  }
  render() {
    const {
      container,
      flatListContainer,
      flatListInnerContainer,
    } = externalStyles
    const {
      connections: { data, hydrated },
      unSeenMessages,
      history,
    } = this.props
    // type casting from Array<mixed> to any and then to what we need
    // because flow Array<mixed> can't be directly type casted as of now
    const receivedConnections: Connection[] = (getConnections(data): any)
    const connectionsCheck =
      receivedConnections && receivedConnections.length > 0
    const connections = receivedConnections
      .map((connection, index) => {
        let showBadge =
          unSeenMessages[connection.senderDID] &&
          unSeenMessages[connection.senderDID].length > 0
            ? true
            : false
        return {
          ...connection,
          index,
          showBadge,
          date:
            history.data &&
            history.data[connection.senderDID] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ].timestamp,
          status:
            history.data &&
            history.data[connection.senderDID] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ].status,
          questionTitle:
            history.data &&
            history.data[connection.senderDID] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ].name,
          credentialName:
            history.data &&
            history.data[connection.senderDID] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ].name,
          type:
            history.data &&
            history.data[connection.senderDID] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ] &&
            history.data[connection.senderDID][
              history.data[connection.senderDID].length - 1
            ].type,
        }
      })
      .sort((a, b) => {
        let bTimestamp = new Date(b.date).getTime()
        let aTimestamp = new Date(a.date).getTime()
        return bTimestamp - aTimestamp
      })
    return (
      <View style={container}>
        <FlatList
          keyExtractor={this.keyExtractor}
          style={flatListContainer}
          contentContainerStyle={flatListInnerContainer}
          data={connections}
          renderItem={this.renderItem}
        />
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
  }
}
export default createStackNavigator({
  [homeRoute]: {
    screen: connect(mapStateToProps)(DashboardScreen),
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
