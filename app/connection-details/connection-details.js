// @flow
import React, { Component } from 'react'
import {
  Text,
  View,
  Button,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native'
import { ConnectionDetailsNav } from './components/connection-details-nav'
import { CredentialCard } from '../components/connection-details/credential-card'
import { ConnectionCard } from '../components/connection-details/connection-card'
import { NewMessageBreakLine } from '../components/connection-details/new-message-break-line'
import MoreOptions from './components/more-options'
import { ConnectionRequestCard } from '../components/connection-details/connection-request-card'
import { ConnectionPending } from '../components/connection-details/connection-pending'
import Modal from './components/modal'
import { updateStatusBarTheme } from '../../app/store/connections-store'
import { BlurView } from 'react-native-blur'
import Snackbar from 'react-native-snackbar'

import { measurements } from '../../app/common/styles/measurements'

import { connect } from 'react-redux'
import moment from 'moment'
import groupBy from 'lodash.groupby'
import { bindActionCreators } from 'redux'
import { QuestionCard } from '../components/connection-details/question-card'
import { QuestionViewCard } from '../components/connection-details/question-view-card'

import type { Store } from '../store/type-store'
import type {
  ConnectionHistoryProps,
  ConnectionHistoryState,
  ConnectionHistoryEvent,
} from './type-connection-details'

import { CONNECTION_ALREADY_EXIST } from './type-connection-details'

import type { ReactNavigation } from '../common/type-common'
import { getConnection, getConnectionTheme } from '../store/store-selector'

let ScreenHeight = Dimensions.get('window').height
let ScreenWidth = Dimensions.get('window').width

class ConnectionDetails extends Component<
  ConnectionHistoryProps,
  ConnectionHistoryState
> {
  scrollView: any = {}

  state = {
    moveMoreOptions: new Animated.Value(ScreenWidth),
    fadeInOut: new Animated.Value(0),
    moveModal: new Animated.Value(ScreenHeight),
    moveModalHeight: new Animated.Value(ScreenHeight),
    positionValue: new Animated.Value(0),
    modalDataOrder: 0,
    disableTaps: false,
    newMessageLine: false,
  }

  componentDidUpdate(prevProps: ConnectionHistoryProps) {
    if (Platform.OS === 'android') {
      // TODO: Refactor this code sometime later so that this code executes
      // only when this screen comes in focus and not on every component update
      true
    }
    // check if connection history updated with new params
    const oldShowSnack = prevProps.navigation.getParam(
      'showExistingConnectionSnack',
      false
    )
    const newShowSnack = this.props.navigation.getParam(
      'showExistingConnectionSnack',
      false
    )
    if (oldShowSnack !== newShowSnack && newShowSnack === true) {
      this.showSnackBar()
    }

    let currentHistArr: Array<any> = Object.values(this.props.connectionHistory)
    let previousHistArr: Array<any> = Object.values(prevProps.connectionHistory)
    let pendingCell = false

    currentHistArr.forEach(function(value, index) {
      value.forEach(function(value, index) {
        if (value.action === 'PENDING') {
          pendingCell = true
        }
      })
    })
    if (!pendingCell) {
      if (currentHistArr[0].length > previousHistArr[0].length) {
        this.setState({
          newMessageLine: true,
        })
      }
    }
  }

  showSnackBar = () => {
    const showExistingConnectionSnack = this.props.navigation.getParam(
      'showExistingConnectionSnack',
      false
    )
    if (showExistingConnectionSnack) {
      Snackbar.show({
        title: CONNECTION_ALREADY_EXIST,
        duration: Snackbar.LENGTH_LONG,
      })
    }
  }
  componentDidMount() {
    this.props.updateStatusBarTheme(this.props.activeConnectionThemePrimary)
    this.showSnackBar()
  }

  updatePosition = value => {
    Animated.timing(this.state.positionValue, {
      toValue: value,
      duration: 1,
      useNativeDriver: true,
    }).start()
  }

  moreOptionsClose = () => {
    Animated.timing(this.state.moveMoreOptions, {
      toValue: ScreenWidth,
      duration: 1,
      useNativeDriver: true,
    }).start()
  }
  moreOptionsOpen = () => {
    Animated.timing(this.state.moveMoreOptions, {
      toValue: 0,
      duration: 1,
      useNativeDriver: true,
    }).start()
  }
  showModal = order => {
    this.setState({ modalDataOrder: order })
    Animated.parallel([
      Animated.timing(this.state.moveModal, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.fadeInOut, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.moveModalHeight, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }
  hideModal = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(this.state.fadeInOut, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.moveModalHeight, {
          toValue: ScreenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(this.state.moveModal, {
        toValue: ScreenHeight,
        duration: 1,
        useNativeDriver: true,
      }),
    ]).start()
  }

  render() {
    let arrayUI = []

    let modalData = []

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

      const historySenderDIDs = Object.keys(connectionHistory)
      const historyList = historySenderDIDs.map((sdid, didIndex) => {
        //items in history list
        const historyItems = connectionHistory[sdid].map(
          (histForDid, historyIndex) => {
            if (histForDid.action === 'CONNECTED') {
              const connected = (
                <CredentialCard
                  key={historyIndex}
                  messageDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  messageTitle={'Added Connection'}
                  order={historyIndex}
                  messageContent={
                    'You added ' + histForDid.name + ' as a Connection'
                  }
                  showButtons={false}
                />
              )
              arrayUI.push(connected)
            }

            if (histForDid.action === 'SHARED') {
              const shared = (
                <ConnectionCard
                  key={historyIndex}
                  order={historyIndex}
                  messageDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  headerText={histForDid.name}
                  infoType={'SHARED'}
                  infoDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  noOfAttributes={histForDid.data.length}
                  buttonText={'VIEW REQUEST DETAILS'}
                  showBadge={false}
                  showModal={this.showModal}
                  colorBackground={activeConnectionThemePrimary}
                />
              )
              modalData.push(histForDid)
              arrayUI.push(shared)
            }
            if (histForDid.action === 'PROOF RECEIVED') {
              let attributesText = ''
              histForDid.data.map((item, attrIndex) => {
                attributesText +=
                  item.label +
                  (attrIndex < histForDid.data.length - 1 ? ', ' : '')
              })
              const proof = (
                <CredentialCard
                  key={historyIndex}
                  messageDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  uid={histForDid.originalPayload.payloadInfo.uid}
                  messageTitle={
                    histForDid.originalPayload.payload.requester.name +
                    ' wants you to share the following:'
                  }
                  order={historyIndex}
                  messageContent={attributesText}
                  showButtons={true}
                  showModal={this.showModal}
                  navigation={this.props.navigation}
                  proof={true}
                  colorBackground={activeConnectionThemePrimary}
                />
              )
              modalData.push(histForDid)
              arrayUI.push(proof)
            }

            if (histForDid.action === 'PENDING') {
              const pending = (
                <ConnectionPending
                  date={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  key={historyIndex}
                  title={histForDid.name}
                  content={'ISSUING - PLEASE WAIT'}
                />
              )
              modalData.push(histForDid)
              arrayUI.push(pending)
            }

            if (histForDid.action === 'RECEIVED') {
              const received = (
                <ConnectionCard
                  key={historyIndex}
                  messageDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  order={historyIndex}
                  headerText={histForDid.name}
                  infoType={'ACCEPTED CREDENTIAL'}
                  infoDate={moment(histForDid.timestamp)
                    .format('DD MMM YYYY')
                    .toUpperCase()}
                  noOfAttributes={histForDid.data.length}
                  buttonText={'VIEW CREDENTIAL'}
                  showBadge={true}
                  showModal={this.showModal}
                  colorBackground={activeConnectionThemePrimary}
                />
              )
              modalData.push(histForDid)
              arrayUI.push(received)
            }
            if (histForDid.action === 'QUESTION_RECEIVED') {
              const questionReceived = (
                <QuestionCard
                  key={historyIndex}
                  messageDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  uid={histForDid.data.uid}
                  messageTitle={histForDid.data.messageTitle}
                  order={historyIndex}
                  messageContent={histForDid.data.messageText}
                  showButtons={true}
                  navigation={this.props.navigation}
                  colorBackground={activeConnectionThemePrimary}
                />
              )
              modalData.push(histForDid)
              arrayUI.push(questionReceived)
            }
            if (histForDid.action === 'UPDATE_QUESTION_ANSWER') {
              const updateQuestionAnswer = (
                <QuestionViewCard
                  key={historyIndex}
                  order={historyIndex}
                  messageDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  uid={histForDid.data.uid}
                  requestStatus={'YOU ANSWERED'}
                  requestAction={'"' + histForDid.data.answer.text + '"'}
                  //buttonText={'VIEW'}
                  navigation={this.props.navigation}
                />
              )
              modalData.push(histForDid)
              arrayUI.push(updateQuestionAnswer)
            }

            if (histForDid.action === 'CLAIM OFFER RECEIVED') {
              const claimOfferReceived = (
                <CredentialCard
                  key={historyIndex}
                  messageDate={
                    moment(histForDid.timestamp)
                      .format('DD MMM YYYY')
                      .toUpperCase() +
                    ' | ' +
                    moment(histForDid.timestamp).format('h:mm A')
                  }
                  messageTitle={'New Credential Offer'}
                  order={historyIndex}
                  messageContent={histForDid.name}
                  showButtons={true}
                  showModal={this.showModal}
                  uid={histForDid.originalPayload.payloadInfo.uid}
                  navigation={this.props.navigation}
                  colorBackground={activeConnectionThemePrimary}
                />
              )
              modalData.push(histForDid)
              arrayUI.push(claimOfferReceived)
            }
          }
        )

        if (this.state.newMessageLine) {
          const slackLine = <NewMessageBreakLine />
          arrayUI.splice(1, 0, slackLine)
        }
      })

      return (
        <SafeAreaView style={styles.safeAreaContainer}>
          <View style={styles.container}>
            <ConnectionDetailsNav
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
              <MoreOptions
                navigation={this.props.navigation}
                moreOptionsClose={this.moreOptionsClose}
              />
            </Animated.View>

            <ScrollView
              style={styles.scrollView}
              ref={ref => (this.scrollView = ref)}
              onContentSizeChange={(contentWidth, contentHeight) => {
                this.scrollView.scrollToEnd({ animated: true })
              }}
            >
              <View style={styles.helperWrapper} />
              {arrayUI.reverse()}
            </ScrollView>
            {Platform.OS === 'ios' ? (
              <BlurView
                style={styles.absoluteTop}
                blurType="light"
                blurAmount={8}
              />
            ) : null}
            <Animated.View
              style={[
                styles.outerModalWrapper,
                {
                  transform: [{ translateY: this.state.moveModal }],
                  opacity: this.state.fadeInOut,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.innerModalWrapper,
                  { transform: [{ translateY: this.state.moveModalHeight }] },
                ]}
              >
                {modalData[this.state.modalDataOrder] ? (
                  <Modal
                    hideModal={this.hideModal}
                    updatePosition={this.updatePosition}
                    data={modalData[this.state.modalDataOrder]}
                    imageUrl={this.props.navigation.state.params.image}
                    institutialName={
                      this.props.navigation.state.params.senderName
                    }
                    colorBackground={activeConnectionThemePrimary}
                    secondColorBackground={activeConnectionThemeSecondary}
                  />
                ) : null}
              </Animated.View>
            </Animated.View>
          </View>
        </SafeAreaView>
      )
    } else {
      return null
    }
  }
}

const mapStateToProps = (state: Store, props: ReactNavigation) => {
  let connectionHistory: ConnectionHistoryEvent[] =
    state.history.data && props.navigation.state
      ? state.history.data[props.navigation.state.params.senderDID]
      : []

  const themeForLogo = getConnectionTheme(
    state,
    props.navigation.state ? props.navigation.state.params.image : ''
  )

  return {
    activeConnectionThemePrimary: themeForLogo.primary,
    activeConnectionThemeSecondary: themeForLogo.secondary,
    connectionHistory: groupBy(
      connectionHistory.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      }),
      history => moment(history.timestamp).format('MMMM YYYY')
    ),
    claimMap: state.claim.claimMap,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators({ updateStatusBarTheme }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionDetails)

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    // position: 'relative',
  },
  moreOptionsWrapper: {
    position: 'absolute',
    width: ScreenWidth,
    zIndex: 999,
    elevation: 16,
    // top: 0,
    height: measurements.WINDOW_HEIGHT,
    // right: this.state.moveMoreOptions,
  },
  helperWrapper: {
    height: 170,
  },
  outerModalWrapper: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: ScreenWidth,
    height: ScreenHeight,
    position: 'absolute',
    // top: this.state.moveModal,
    // left: 0,
    zIndex: 999,
    elevation: 20,
  },
  innerModalWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingTop: this.state.moveModalHeight,
  },
  absoluteTop: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: measurements.connectionDetailsNav,
  },
  absoluteBottom: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 102,
  },
  scrollView: {
    flex: 1,
    paddingTop: 5,
    borderColor: 'red',
    width: '100%',
    backgroundColor: 'white',
  },
})
