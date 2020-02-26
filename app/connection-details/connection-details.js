// @flow
import React, { Component } from 'react'
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
import {
  updateStatusBarTheme,
  sendConnectionRedirect,
} from '../../app/store/connections-store'
import { newConnectionSeen } from '../../app/connection-history/connection-history-store'
import { BlurView } from 'react-native-blur'
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
import { withStatusBar } from '../components/status-bar/status-bar'
import { isIphoneX, isIphoneXR } from '../common/styles/constant'
import { DENY_PROOF_REQUEST_SUCCESS } from '../proof-request/type-proof-request'
import { proofRequestRoute, claimOfferRoute, questionRoute } from '../common'
import { MESSAGE_TYPE } from '../api/api-constants'

let ScreenWidth = Dimensions.get('window').width

class ConnectionDetails extends Component<
  ConnectionHistoryProps,
  ConnectionHistoryState
> {
  state = {
    hideMoreOptions: true,
    moveMoreOptions: new Animated.Value(ScreenWidth),
    newMessageLine: false,
  }

  flatList = null

  componentDidMount() {
    this.props.updateStatusBarTheme(this.props.activeConnectionThemePrimary)
    this.navigateToModal()

    // since componentDidMount is always getting called when navigating to this screen
    // the check if snack bar should be displayed can be done in componentDidMount
    if (this.props.navigation.getParam('showExistingConnectionSnack')) {
      this.showSnackBar()
      this.props.sendConnectionRedirect(
        this.props.navigation.getParam('qrCodeInvitationPayload'),
        {
          senderDID: this.props.navigation.getParam('senderDID'),
          identifier: this.props.navigation.getParam('identifier'),
        }
      )
    }
  }

  navigateToModal = () => {
    const notificationOpenOptions = this.props.navigation.getParam(
      'notificationOpenOptions'
    )
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

    const messageType = this.props.navigation.getParam('messageType')
    const uid = this.props.navigation.getParam('uid')

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
    } else if (item.action === 'PENDING') {
      return (
        <ConnectionPending
          date={formattedTime}
          title={item.name}
          content={'ISSUING - PLEASE WAIT'}
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
          imageUrl={this.props.navigation.state.params.image}
          institutialName={this.props.navigation.state.params.senderName}
          colorBackground={this.props.activeConnectionThemePrimary}
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
          showButtons={true}
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
          navigation={this.props.navigation}
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
    } else if (item.action === DENY_PROOF_REQUEST_SUCCESS) {
      return (
        <QuestionViewCard
          messageDate={formattedTime}
          uid={item.data.uid}
          requestStatus={'YOU DENIED'}
          requestAction={'"' + item.name + '"'}
          navigation={this.props.navigation}
        />
      )
    }
  }

  showSnackBar = () => {
    const showExistingConnectionSnack =
      this.props.navigation.getParam('showExistingConnectionSnack') || false
    if (showExistingConnectionSnack) {
      Snackbar.show({
        title: CONNECTION_ALREADY_EXIST,
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
      this.flatList && this.flatList.scrollToEnd({ animated: true })
    }, 300)
  }

  render() {
    if (this.props.navigation.state) {
      const {
        senderName,
        image,
        senderDID,
        identifier,
      } = this.props.navigation.state.params
      const {
        activeConnectionThemePrimary,
        activeConnectionThemeSecondary,
        connectionHistory,
      } = this.props
      const testID = 'connection-history'
      const logoUri = image
        ? { uri: image }
        : require('../images/cb_evernym.png')

      // if (this.state.newMessageLine) {
      //   const slackLine = <NewMessageBreakLine key={arrayUI.length} />
      //   arrayUI.splice(1, 0, slackLine)
      // }

      return (
        <View style={styles.container}>
          <ConnectionDetailsNav
            newConnectionSeen={this.props.newConnectionSeen}
            navigation={this.props.navigation}
            moreOptionsOpen={this.moreOptionsOpen}
            colorBackground={activeConnectionThemePrimary}
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
              />
            )}
          </Animated.View>
          <FlatList
            ref={ref => {
              this.flatList = ref
            }}
            keyExtractor={this.keyExtractor}
            style={styles.flatListContainer}
            contentContainerStyle={styles.flatListInnerContainer}
            data={connectionHistory}
            renderItem={this.renderItem}
            onContentSizeChange={this.scrollToEnd}
          />
          {Platform.OS === 'ios' ? (
            <BlurView
              style={styles.absoluteTop}
              blurType="light"
              blurAmount={8}
            />
          ) : null}
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
    props.navigation.state
      ? state.history.data.connections[props.navigation.state.params.senderDID]
          .data
      : []
  connectionHistory = connectionHistory.slice()

  const themeForLogo = getConnectionTheme(
    state,
    props.navigation.state ? props.navigation.state.params.image : ''
  )

  return {
    activeConnectionThemePrimary: themeForLogo.primary,
    activeConnectionThemeSecondary: themeForLogo.secondary,
    connectionHistory: connectionHistory,
    claimMap: state.claim.claimMap,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updateStatusBarTheme,
      newConnectionSeen,
      sendConnectionRedirect,
    },
    dispatch
  )

export default withStatusBar()(
  connect(mapStateToProps, mapDispatchToProps)(ConnectionDetails)
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  flatListContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  flatListInnerContainer: {
    paddingTop: isIphoneX || isIphoneXR ? 91 : 67,
  },
  moreOptionsWrapper: {
    position: 'absolute',
    width: ScreenWidth,
    zIndex: 999,
    elevation: 16,
    height: measurements.WINDOW_HEIGHT,
  },
  absoluteTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: measurements.connectionDetailsBlurNav,
  },
})
