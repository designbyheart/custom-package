// @flow

import React, { Component, PureComponent } from 'react'
import {
  StatusBar,
  Platform,
  ScrollView,
  Image,
  LayoutAnimation,
  UIManager,
  Animated,
  Dimensions,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createStackNavigator } from 'react-navigation'
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button'
import LottieView from 'lottie-react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

import type {
  QuestionScreenProps,
  QuestionStatus,
  QuestionResponse,
  QuestionScreenState,
  QuestionStoreMessage,
} from './type-question'
import type { Store } from '../store/type-store'
import type {
  ComponentStatus,
  ReactNavigation,
  CustomError,
} from '../common/type-common'
import type { Connection } from '../store/type-connection-store'

import { Container, CustomView, CustomText, CustomButton } from '../components'
import { questionRoute } from '../common/route-constants'
import { Loader } from '../components'
import {
  QUESTION_STATUS,
  TEXT_IGNORE,
  TEXT_SUBMIT,
  TEXT_CANCEL,
  TEXT_TRY_AGAIN,
  TEXT_OK,
} from './type-question'
import {
  updateQuestionStatus,
  sendAnswerToQuestion,
  getScreenStatus,
  getQuestionValidity,
} from './question-store'
import {
  transparentHeaderStyle,
  noBorderNoShadowHeaderStyle,
} from '../components/layout/header-styles'
import { QuestionScreenHeader } from './components/question-screen-header'
import {
  questionStyles,
  questionActionButtonDefaultProps,
  disabledStyle,
} from './question-screen-style'
import {
  barStyleLight,
  cmGrey4,
  caribbeanGreen,
  blackTransparent,
  color,
} from '../common/styles'
import { getConnectionByUserDid, getConnection } from '../store/store-selector'
import { QuestionActions } from './components/question-screen-actions'
import { checkIfAnimationToUse } from '../bridge/react-native-cxs/RNCxs'
import { QuestionExternalLinks } from './components/question-external-links'

const { height } = Dimensions.get('window')

export class Question extends PureComponent<
  QuestionScreenProps,
  QuestionScreenState
> {
  _translateY = new Animated.Value(0)

  constructor(props: QuestionScreenProps) {
    super(props)
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true)
  }

  static navigationOptions = ({ navigation }) => ({
    header: null,
  })

  state = {
    response: null,
  }

  render() {
    const { question } = this.props

    const validationError: null | CustomError = getQuestionValidity(
      question && question.payload
    )
    const { success, error, loading, idle }: ComponentStatus = getScreenStatus(
      question.status
    )
    const transform = this._getTransform(this._translateY)
    const opacity = this._getOpacity(this._translateY)

    return (
      <Animated.View
        style={[
          questionStyles.container,
          questionStyles.mainContainer,
          {
            opacity,
          },
        ]}
      >
        <Animated.View style={[questionStyles.container, { transform }]}>
          <Container style={[questionStyles.headerContainer]}>
            <PanGestureHandler
              onGestureEvent={this._onPanGestureEvent}
              onHandlerStateChange={this._onHandlerStateChange}
            >
              <Animated.View style={[questionStyles.container]}>
                <QuestionScreenHeader navigation={this.props.navigation} />
              </Animated.View>
            </PanGestureHandler>
          </Container>
          {/*
              if we get validation error then render validation error code
              and nothing else should be rendered
             */}
          {validationError != null && (
            <CustomView center style={[questionStyles.screenContainer]}>
              <QuestionScreenText size="h5">
                {`Invalid data. Validation error code: ${validationError.code}`}
              </QuestionScreenText>
            </CustomView>
          )}
          {/*
              if there is no validation error, render data from question payload
            */}
          {validationError == null && (
            <Animated.View style={[questionStyles.screenContainer]}>
              <QuestionSenderDetail
                source={this.props.senderLogoUrl}
                senderName={this.props.senderName}
              />
              {/*
                if component status is idle (user hasn't taken any action yet),
                then render question details
              */}
              {idle && (
                <QuestionDetails
                  question={question}
                  selectedResponse={this.state.response}
                  onResponseSelect={this.onResponseSelect}
                />
              )}
              {loading && <QuestionLoader />}
              {success && (
                <QuestionSuccess afterSuccessShown={this.afterSuccessShown} />
              )}
              {error && <QuestionError />}
              {/*
                We need to show action buttons all the time except when screen 
                is in loading state
              */}
              {!loading && (
                <QuestionActions
                  selectedResponse={this.state.response}
                  onSubmit={this.onSubmit}
                  onCancel={this.onCancel}
                  onSelectResponseAndSubmit={this.onSelectResponseAndSubmit}
                  question={this.props.question}
                />
              )}
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    )
  }

  componentDidMount() {
    StatusBar.setBarStyle(barStyleLight, true)
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(blackTransparent, true)
    }

    if (this.props.question) {
      this.props.updateQuestionStatus(
        this.props.question.payload.uid,
        QUESTION_STATUS.SEEN
      )
    }
  }

  onResponseSelect = (responseIndex: number) => {
    if (
      !this.props.question ||
      !this.props.question.payload.valid_responses ||
      this.props.question.payload.valid_responses.length === 0
    ) {
      return
    }

    this.setState({
      response: this.props.question.payload.valid_responses[responseIndex],
    })
  }

  onSubmit = () => {
    if (!this.props.question) {
      return
    }

    // if user is already in success state, then just close screen
    const { success }: ComponentStatus = getScreenStatus(
      this.props.question.status
    )
    if (success) {
      this.props.navigation.goBack(null)
      return
    }

    // since height of screen would be changed because view would move
    // from idle state, to loading which would have lesser height
    // and from loading to success or error which would have more height
    // we don't want abrupt jumps and want smooth animation for
    // whole question screen height changes
    if (!checkIfAnimationToUse()) {
      // there are some old devices which just does not have RAM and cpu
      // to support animations, so we disable animation for those old devices
      // so that at least app doesn't get stuck and functions smoothly
      // without any lag to user input and navigation
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }
    this.props.sendAnswerToQuestion(
      this.props.question.payload.uid,
      this.state.response
    )
  }

  onSelectResponseAndSubmit = (response: QuestionResponse) => {
    this.setState(
      {
        response,
      },
      () => {
        this.onSubmit()
      }
    )
  }

  onCancel = () => {
    this.props.navigation.goBack(null)
  }

  _onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationY: this._translateY,
        },
      },
    ],
    {
      useNativeDriver: true,
    }
  )

  _onHandlerStateChange = event => {
    const { state, velocityY, translationY } = event.nativeEvent
    if (state === State.END) {
      const minimumDistanceToClose = 150
      if (velocityY > 60 || translationY > minimumDistanceToClose) {
        this.onCancel()
        return
      }

      Animated.spring(this._translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start()
    }
  }

  _getTransform = translateY => [{ translateY }]

  _getOpacity = translateY =>
    translateY.interpolate({
      inputRange: [0, height],
      outputRange: [1, 0.2],
      extrapolate: 'clamp',
    })

  // this a common pattern when we want to be sure that we are not running
  // actions after a component is unmounted
  // in our case, user can close modal either by pressing "okay" or clicking outside
  // so we need to be sure that we are not running code after this component
  // is unmounted from react-native tree
  isUnmounted = false

  componentWillUnmount() {
    this.isUnmounted = true
  }

  afterSuccessShown = () => {
    // auto close after success is shown to user
    setTimeout(() => {
      if (!this.isUnmounted) {
        this.onCancel()
      }
    }, 200)
  }
}

function QuestionSenderDetail(props: {
  source: number | { uri: string },
  senderName: string,
}) {
  return (
    <CustomView row style={[questionStyles.questionSenderContainer]} center>
      <CustomView>
        <Image
          style={[questionStyles.questionSenderLogo]}
          source={props.source}
          resizeMode="cover"
        />
      </CustomView>
      <Container style={[questionStyles.questionSenderName]}>
        <QuestionScreenText size="h5" numberOfLines={2}>
          {props.senderName}
        </QuestionScreenText>
      </Container>
    </CustomView>
  )
}

function QuestionDetails(props: {
  question: QuestionStoreMessage,
  selectedResponse: ?QuestionResponse,
  onResponseSelect: (responseIndex: number) => void,
}) {
  const { question, selectedResponse, onResponseSelect } = props
  const isSingleResponse = question.payload.valid_responses.length === 1

  return (
    <CustomView>
      <QuestionTitle title={question.payload.messageTitle} />
      <ScrollView
        style={[
          isSingleResponse
            ? questionStyles.questionResponsesContainerSingleResponse
            : questionStyles.questionResponsesContainer,
        ]}
      >
        <QuestionText text={question.payload.messageText} />
        <QuestionResponses
          responses={question.payload.valid_responses}
          selectedResponse={selectedResponse}
          onResponseSelect={onResponseSelect}
        />
        <QuestionExternalLinks externalLinks={question.payload.externalLinks} />
      </ScrollView>
    </CustomView>
  )
}

function QuestionTitle(props: { title: string }) {
  return (
    <CustomView style={[questionStyles.questionTitle]}>
      <QuestionScreenText size="h3b" numberOfLines={2}>
        {props.title}
      </QuestionScreenText>
    </CustomView>
  )
}

function QuestionText(props: { text: ?string }) {
  if (!props.text) {
    return null
  }

  return (
    <QuestionScreenText
      bold={false}
      size="h5"
      style={[questionStyles.questionText]}
    >
      {props.text}
    </QuestionScreenText>
  )
}

function QuestionResponses(props: {
  responses: ?Array<QuestionResponse>,
  selectedResponse: ?QuestionResponse,
  onResponseSelect: (responseIndex: number) => void,
}) {
  const { responses = [], selectedResponse } = props
  if (!responses || responses.length < 3) {
    return null
  }
  // as per our requirement, we need to show max 20 responses to user
  // our product team feels that we should limit the responses
  // a question can have
  const trimmedResponses = responses.slice(0, 20)

  return (
    <RadioForm animation={true}>
      {trimmedResponses.map((response, i) => {
        const radioData = { label: response.text, value: i }
        const isSelected =
          selectedResponse && selectedResponse.nonce === response.nonce

        return (
          <RadioButton
            labelHorizontal={true}
            key={i}
            style={questionStyles.questionRadioStyle}
          >
            <RadioButtonInput
              obj={radioData}
              index={i}
              isSelected={isSelected}
              onPress={props.onResponseSelect}
              buttonInnerColor={isSelected ? caribbeanGreen : cmGrey4}
              buttonOuterColor={cmGrey4}
              buttonSize={16}
              buttonOuterSize={24}
              buttonStyle={questionStyles.questionResponseRadio}
              buttonWrapStyle={questionStyles.questionResponseRadioWrapper}
            />
            <RadioButtonLabel
              obj={radioData}
              index={i}
              labelHorizontal={true}
              onPress={props.onResponseSelect}
              labelStyle={questionStyles.questionResponseRadioLabel}
              labelWrapStyle={questionStyles.questionResponseRadioLabelWrapper}
            />
          </RadioButton>
        )
      })}
    </RadioForm>
  )
}

function QuestionError() {
  return (
    <CustomView
      bg="tertiary"
      center
      style={[questionStyles.questionErrorContainer]}
    >
      <CustomView>
        <LottieView
          source={require('../images/red-cross-lottie.json')}
          autoPlay
          loop={false}
          style={questionStyles.feedbackIcon}
        />
      </CustomView>
      <QuestionScreenText size="h4" bold={false}>
        Error occurred
      </QuestionScreenText>
    </CustomView>
  )
}

function QuestionSuccess(props: { afterSuccessShown: () => void }) {
  return (
    <CustomView
      bg="tertiary"
      center
      style={[questionStyles.questionSuccessContainer]}
    >
      <CustomView>
        <LottieView
          source={require('../images/green-tick-lottie.json')}
          autoPlay
          loop={false}
          style={questionStyles.feedbackIcon}
          onAnimationFinish={props.afterSuccessShown}
        />
      </CustomView>
      <QuestionScreenText size="h4" bold={false}>
        Sent
      </QuestionScreenText>
    </CustomView>
  )
}

function QuestionLoader() {
  return (
    <CustomView bg="tertiary" style={[questionStyles.questionLoaderContainer]}>
      <Loader type="dark" showMessage={true} message={'Sending...'} />
    </CustomView>
  )
}

function QuestionScreenText(props) {
  return (
    <CustomText
      bg={false}
      bold
      {...props}
      style={[
        { color: color.bg.tertiary.font.seventh },
        ...(props.style || []),
      ]}
    >
      {props.children}
    </CustomText>
  )
}

const mapStateToProps = (state: Store, { navigation }: ReactNavigation) => {
  const uid: string | null = navigation.getParam('uid', null)
  if (!uid) {
    return {}
  }

  const question: QuestionStoreMessage = state.question.data[uid]
  const connection: Array<Connection> = getConnection(
    state,
    question.payload.from_did
  )
  const senderLogoUrl =
    connection.length > 0 ? { uri: connection[0].logoUrl } : { uri: '' }
  const senderName = connection.length > 0 ? connection[0].senderName : ''

  return {
    question,
    senderLogoUrl,
    senderName,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updateQuestionStatus,
      sendAnswerToQuestion,
    },
    dispatch
  )

export const QuestionStack = createStackNavigator(
  {
    [questionRoute]: {
      screen: connect(mapStateToProps, mapDispatchToProps)(Question),
    },
  },
  {
    cardStyle: { backgroundColor: 'transparent' },
    transitionConfig: () => ({
      containerStyle: {
        backgroundColor: 'transparent',
      },
    }),
  }
)

export default QuestionStack
