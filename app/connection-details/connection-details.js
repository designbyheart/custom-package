// @flow
import * as React from 'react'
import { Component } from 'react'
import {
  View,
  FlatList,
  Dimensions,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native'
import { ConnectionDetailsNav } from './components/connection-details-nav'
import { CredentialCard } from '../components/connection-details/credential-card'
import { ConnectionCard } from '../components/connection-details/connection-card'
import { NewMessageBreakLine } from '../components/connection-details/new-message-break-line'
import MoreOptions from './components/more-options'
import { ConnectionPending } from '../components/connection-details/connection-pending'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import {
  updateStatusBarTheme,
  sendConnectionRedirect,
  sendConnectionReuse,
} from '../../app/store/connections-store'
import { newConnectionSeen } from '../../app/connection-history/connection-history-store'
import Snackbar from 'react-native-snackbar'
import { measurements } from '../../app/common/styles/measurements'
import { connect } from 'react-redux'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import { QuestionCard } from '../components/connection-details/question-card'
import { QuestionViewCard } from '../components/connection-details/question-view-card'
import type { Store } from '../store/type-store'
import type {
  ConnectionHistoryProps,
  ConnectionHistoryState,
  ConnectionHistoryEvent,
  ConnectionHistoryNavigation,
} from './type-connection-details'
import { CONNECTION_ALREADY_EXIST } from './type-connection-details'
import { getConnection, getConnectionTheme } from '../store/store-selector'
import { colors } from '../common/styles/constant'
import {
  DENY_PROOF_REQUEST_SUCCESS,
  DENY_PROOF_REQUEST_FAIL,
  DENY_PROOF_REQUEST,
} from '../proof-request/type-proof-request'
import {
  proofRequestRoute,
  claimOfferRoute,
  questionRoute,
  connectionHistRoute,
} from '../common'
import { MESSAGE_TYPE } from '../api/api-constants'
import {
  CLAIM_OFFER_ACCEPTED,
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
  DENY_CLAIM_OFFER,
  DENY_CLAIM_OFFER_FAIL,
  DENY_CLAIM_OFFER_SUCCESS,
} from '../claim-offer/type-claim-offer'
import { UPDATE_ATTRIBUTE_CLAIM, ERROR_SEND_PROOF } from '../proof/type-proof'
import { DELETE_CLAIM_SUCCESS } from '../claim/type-claim'
import { CONNECTION_INVITE_TYPES } from '../invitation/type-invitation'
import type { AriesOutOfBandInvite } from '../invitation/type-invitation'

let ScreenWidth = Dimensions.get('window').width

export class ConnectionDetails extends Component<ConnectionHistoryProps,
  ConnectionHistoryState> {
  state = {
    hideMoreOptions: true,
    moveMoreOptions: new Animated.Value(ScreenWidth),
    newMessageLine: false,
  }

  flatList = React.createRef<FlatList<any>>()

  componentDidMount() {
    this.props.updateStatusBarTheme(this.props.activeConnectionThemePrimary)
    this.navigateToModal()

    // since componentDidMount is always getting called when navigating to this screen
    // the check if snack bar should be displayed can be done in componentDidMount
    if (this.props.route.params.showExistingConnectionSnack) {
      this.showSnackBar()

      const invite = this.props.route.params.qrCodeInvitationPayload

      if (invite.type === CONNECTION_INVITE_TYPES.ARIES_V1_QR) {
        this.props.sendConnectionRedirect(invite, {
          senderDID: this.props.route.params.senderDID,
          identifier: this.props.route.params.identifier,
        })
      } else if (invite.type === CONNECTION_INVITE_TYPES.ARIES_OUT_OF_BAND) {
        if (!invite.originalObject) {
          return
        }

        this.props.sendConnectionReuse(
          ((invite.originalObject: any): AriesOutOfBandInvite),
          {
            senderDID: this.props.route.params.senderDID,
          }
        )
      }
    }
  }

  navigateToModal = () => {
    const notificationOpenOptions = this.props.route.params
      .notificationOpenOptions
    if (
      !notificationOpenOptions ||
      !notificationOpenOptions.openMessageDirectly
    ) {
      // the param 'notificationOpenOptions' helps us decide if we need to open
      // modal of clicked message directly
      // if we don't get any options or if openMessageDirectly is false
      // then we just return from here
      return
    }

    // If we reach here, then we have param indicating that we need open
    // a message. Now, we need to know what is messageId and messageType
    // so that we can open correct modal

    const messageType = this.props.route.params.messageType
    const uid = this.props.route.params.uid

    if (messageType && uid) {
      switch (messageType) {
        case MESSAGE_TYPE.CLAIM_OFFER:
          this.props.navigation.navigate(claimOfferRoute, { uid })
          break

        case MESSAGE_TYPE.PROOF_REQUEST:
          this.props.navigation.navigate(proofRequestRoute, { uid })
          break

        case MESSAGE_TYPE.QUESTION:
          this.props.navigation.navigate(questionRoute, { uid })
          break
      }
    }
  }

  keyExtractor = (item: Object) => item.timestamp

  renderItem = ({ item }: { item: Object }) => {
    const formattedDate = moment(item.timestamp)
      .format('DD MMM YYYY')
      .toUpperCase()
    const formattedTime =
      formattedDate + ' | ' + moment(item.timestamp).format('h:mm A')

    if (item.action === 'CONNECTED') {
      return (
        <CredentialCard
          messageDate={formattedTime}
          messageTitle={'Added Connection'}
          messageContent={'You added ' + item.name + ' as a Connection'}
          showButtons={false}
        />
      )
    } else if (item.action === ERROR_SEND_PROOF) {
      return (
        <ConnectionCard
          messageDate={formattedTime}
          headerText={item.name}
          infoType={'FAILED TO SEND'}
          infoDate={formattedTime}
          noOfAttributes={item.data.length}
          buttonText={'RETRY'}
          showBadge={false}
          colorBackground={colors.cmRed}
          uid={item.originalPayload.uid}
          proof={true}
          navigation={this.props.navigation}
          claimMap={this.props.claimMap}
          data={item}
          type={item.action}
        />
      )
    } else if (item.action === 'SHARED') {
      return (
        <ConnectionCard
          messageDate={formattedTime}
          headerText={item.name}
          infoType={'SHARED'}
          infoDate={formattedTime}
          noOfAttributes={item.data.length}
          buttonText={'VIEW REQUEST DETAILS'}
          showBadge={false}
          colorBackground={this.props.activeConnectionThemePrimary}
          uid={item.originalPayload.uid}
          proof={true}
          navigation={this.props.navigation}
          claimMap={this.props.claimMap}
          data={item.data}
          type={item.action}
        />
      )
    } else if (item.action === 'PROOF RECEIVED') {
      let attributesText = ''
      item.data.map((dataItem, attrIndex) => {
        attributesText +=
          dataItem.label + (attrIndex < item.data.length - 1 ? ', ' : '')
      })
      return (
        <CredentialCard
          messageDate={formattedTime}
          uid={item.originalPayload.payloadInfo.uid}
          messageTitle={
            item.originalPayload.payload.requester.name +
            ' wants you to share the following:'
          }
          messageContent={attributesText}
          showButtons={true}
          navigation={this.props.navigation}
          proof={true}
          colorBackground={this.props.activeConnectionThemePrimary}
        />
      )
    } else if (item.action === UPDATE_ATTRIBUTE_CLAIM) {
      return (
        <ConnectionPending
          date={formattedTime}
          title={item.name}
          content={'SENDING - PLEASE WAIT'}
        />
      )
    } else if (
      item.action === 'PENDING' ||
      item.action === CLAIM_OFFER_ACCEPTED
    ) {
      return (
        <ConnectionPending
          date={formattedTime}
          title={item.name}
          content={'ISSUING - PLEASE WAIT'}
        />
      )
    } else if (
      item.action === SEND_CLAIM_REQUEST_FAIL ||
      item.action === PAID_CREDENTIAL_REQUEST_FAIL
    ) {
      return (
        <ConnectionCard
          messageDate={formattedTime}
          headerText={item.name}
          infoType={'FAILED TO ACCEPT'}
          infoDate={formattedDate}
          noOfAttributes={item.data.length}
          buttonText={'RETRY'}
          showBadge={false}
          colorBackground={colors.cmRed}
          navigation={this.props.navigation}
          received={true}
          data={item}
          imageUrl={this.props.route.params.image}
          institutionalName={this.props.route.params.senderName}
          colorBackground={colors.cmRed}
          secondColorBackground={colors.cmRed}
        />
      )
    } else if (item.action === 'RECEIVED') {
      return (
        <ConnectionCard
          messageDate={formattedTime}
          headerText={item.name}
          infoType={'ACCEPTED CREDENTIAL'}
          infoDate={formattedDate}
          noOfAttributes={item.data.length}
          buttonText={'VIEW CREDENTIAL'}
          showBadge={true}
          colorBackground={this.props.activeConnectionThemePrimary}
          navigation={this.props.navigation}
          received={true}
          data={item}
          imageUrl={this.props.route.params.image}
          institutionalName={this.props.route.params.senderName}
          secondColorBackground={this.props.activeConnectionThemeSecondary}
        />
      )
    } else if (item.action === 'QUESTION_RECEIVED') {
      return (
        <QuestionCard
          messageDate={formattedTime}
          uid={item.data.uid}
          messageTitle={item.data.messageTitle}
          messageContent={item.data.messageText}
          navigation={this.props.navigation}
          colorBackground={this.props.activeConnectionThemePrimary}
        />
      )
    } else if (item.action === 'UPDATE_QUESTION_ANSWER') {
      return (
        <QuestionViewCard
          messageDate={formattedTime}
          uid={item.data.uid}
          requestStatus={'YOU ANSWERED'}
          requestAction={'"' + item.data.answer.text + '"'}
        />
      )
    } else if (item.action === 'CLAIM OFFER RECEIVED') {
      return (
        <CredentialCard
          messageDate={formattedTime}
          messageTitle={'New Credential Offer'}
          messageContent={item.name}
          showButtons={true}
          uid={item.originalPayload.payloadInfo.uid}
          navigation={this.props.navigation}
          colorBackground={this.props.activeConnectionThemePrimary}
        />
      )
    } else if (
      item.action === DENY_PROOF_REQUEST_SUCCESS ||
      item.action === DENY_CLAIM_OFFER_SUCCESS
    ) {
      return (
        <QuestionViewCard
          messageDate={formattedTime}
          uid={item.data.uid}
          requestStatus={'YOU REJECTED'}
          requestAction={'"' + item.name + '"'}
          navigation={this.props.navigation}
        />
      )
    } else if (
      item.action === DENY_PROOF_REQUEST ||
      item.action === DENY_CLAIM_OFFER
    ) {
      return (
        <ConnectionPending
          date={formattedTime}
          title={item.name}
          content={'REJECTING - PLEASE WAIT'}
        />
      )
    } else if (
      item.action === DENY_PROOF_REQUEST_FAIL ||
      item.action === DENY_CLAIM_OFFER_FAIL
    ) {
      return (
        <ConnectionCard
          messageDate={formattedTime}
          headerText={item.name}
          infoType={'FAILED TO REJECT'}
          infoDate={formattedDate}
          buttonText={'RETRY'}
          showBadge={false}
          colorBackground={colors.cmRed}
          navigation={this.props.navigation}
          received={true}
          data={item}
          imageUrl={this.props.navigation.state.params.image}
          institutialName={this.props.navigation.state.params.senderName}
          colorBackground={colors.cmRed}
          secondColorBackground={colors.cmRed}
        />
      )
    } else if (item.action === 'DELETED') {
      return (
        <CredentialCard
          messageDate={formattedTime}
          messageTitle={'Deleted Credential'}
          messageContent={'You deleted the credential "' + item.name + '"'}
          showButtons={false}
        />
      )
    }

    return null
  }

  showSnackBar = () => {
    const showExistingConnectionSnack =
      this.props.route.params?.showExistingConnectionSnack || false
    if (showExistingConnectionSnack) {
      Snackbar.show({
        text: CONNECTION_ALREADY_EXIST,
        duration: Snackbar.LENGTH_LONG,
      })
    }
  }

  moreOptionsClose = () => {
    Animated.timing(this.state.moveMoreOptions, {
      toValue: ScreenWidth,
      duration: 1,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ hideMoreOptions: true })
    })
  }

  moreOptionsOpen = () => {
    this.setState(
      { hideMoreOptions: false },
      Animated.timing(this.state.moveMoreOptions, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }).start()
    )
  }

  scrollToEnd = () => {
    setTimeout(() => {
      this.flatList.current &&
      this.flatList.current.scrollToEnd({ animated: true })
    }, 300)
  }

  render() {
    if (this.props.route) {
      const {
        senderName,
        image,
        senderDID,
        identifier,
      } = this.props.route.params
      const {
        activeConnectionThemePrimary,
        activeConnectionThemeSecondary,
        connectionHistory,
      } = this.props
      const testID = 'connection-history'
      const logoUri = image
        ? { uri: image }
        : require('../images/cb_evernym.png')

      return (
        <View style={styles.container}>
          <ConnectionDetailsNav
            newConnectionSeen={this.props.newConnectionSeen}
            navigation={this.props.navigation}
            moreOptionsOpen={this.moreOptionsOpen}
            colorBackground={activeConnectionThemePrimary}
            route={this.props.route}
          />
          <Animated.View
            style={[
              styles.moreOptionsWrapper,
              { transform: [{ translateX: this.state.moveMoreOptions }] },
            ]}
          >
            {!this.state.hideMoreOptions && (
              <MoreOptions
                navigation={this.props.navigation}
                moreOptionsClose={this.moreOptionsClose}
                route={this.props.route}
              />
            )}
          </Animated.View>
          <FlatList
            ref={this.flatList}
            keyExtractor={this.keyExtractor}
            style={styles.flatListContainer}
            contentContainerStyle={styles.flatListInnerContainer}
            data={connectionHistory}
            renderItem={this.renderItem}
            onContentSizeChange={this.scrollToEnd}
          />
        </View>
      )
    } else {
      return null
    }
  }
}

const mapStateToProps = (state: Store, props: ConnectionHistoryNavigation) => {
  let connectionHistory: ConnectionHistoryEvent[] =
    state.history &&
    state.history.data &&
    state.history.data.connections &&
    props.route
      ? state.history.data.connections[props.route.params.senderDID].data
      : []
  connectionHistory = connectionHistory.slice()

  const themeForLogo = getConnectionTheme(
    state,
    props.route ? props.route.params.image : ''
  )

  return {
    activeConnectionThemePrimary: themeForLogo.primary,
    activeConnectionThemeSecondary: themeForLogo.secondary,
    connectionHistory: connectionHistory,
    claimMap: state.claim.claimMap,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateStatusBarTheme,
      newConnectionSeen,
      sendConnectionRedirect,
      sendConnectionReuse,
    },
    dispatch
  )

export const connectionHistoryScreen = {
  routeName: connectionHistRoute,
  screen: connect(mapStateToProps, mapDispatchToProps)(ConnectionDetails),
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  moreOptionsWrapper: {
    position: 'absolute',
    width: ScreenWidth,
    zIndex: 999,
    elevation: 8,
    height: Dimensions.get('screen').height - verticalScale(40),
  },
})
