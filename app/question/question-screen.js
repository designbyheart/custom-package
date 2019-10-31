// @flow

import React, { Component, PureComponent } from 'react'
import {
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
  QuestionScreenNavigation,
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
  questionStyles as defaultQuestionStyles,
  questionActionButtonDefaultProps,
  disabledStyle,
} from './question-screen-style'
import {
  barStyleLight,
  cmGrey4,
  caribbeanGreen,
  blackTransparent,
  color,
  black,
} from '../common/styles'
import { getConnectionByUserDid, getConnection } from '../store/store-selector'
import { QuestionActions } from './components/question-screen-actions'
import { checkIfAnimationToUse } from '../bridge/react-native-cxs/RNCxs'
import { QuestionExternalLinks } from './components/question-external-links'
import { withStatusBar } from '../components/status-bar/status-bar'
import { customLogger } from '../store/custom-logger'

const { height } = Dimensions.get('window')

export class Question extends PureComponent<
  QuestionScreenProps,
  QuestionScreenState
> {
  _translateY = new Animated.Value(0)

  static defaultProps = {
    useIgnoreButton: true,
  }

  constructor(props: QuestionScreenProps) {
    super(props)
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true)
  }

  static navigationOptions = ({ navigation }: { navigation: any }) => ({
    header: null,
  })

  state = {
    response: null,
  }

  render() {
    const { question } = this.props

    let questionStyles = this.props.questionStyles
    if (!questionStyles) {
      questionStyles = defaultQuestionStyles
    }

    const validationError: null | CustomError = getQuestionValidity(
      question && question.payload
    )
    const { success, error, loading, idle }: ComponentStatus = getScreenStatus(
      question ? question.status : undefined
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
                <QuestionScreenHeader
                  onCancel={!loading && !success ? this.onCancel : this.noop}
                />
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
                questionStyles={questionStyles}
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
                  questionStyles={questionStyles}
                />
              )}
              {loading && <QuestionLoader questionStyles={questionStyles} />}
              {success && (
                <QuestionSuccess
                  afterSuccessShown={this.afterSuccessShown}
                  questionStyles={questionStyles}
                />
              )}
              {error && <QuestionError questionStyles={questionStyles} />}
              {/*
                We need to show action buttons all the time except when screen
                is in loading state
              */}
              {!loading &&
                !success && (
                  <QuestionActions
                    selectedResponse={this.state.response}
                    onSubmit={this.onSubmit}
                    onCancel={this.onCancel}
                    onSelectResponseAndSubmit={this.onSelectResponseAndSubmit}
                    question={this.props.question}
                    useIgnoreButton={this.props.useIgnoreButton}
                  />
                )}
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    )
  }

  componentDidMount() {
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

    if (
      this.props.question &&
      this.props.question.payload.uid &&
      this.state.response
    ) {
      this.props.sendAnswerToQuestion(
        this.props.question.payload.uid,
        this.state.response
      )
    } else {
      customLogger.log(
        'called onSubmit for question response without either uid or selecting response'
      )
    }
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
    !this.isUnmounted &&
      !this.isCloseTriggered &&
      this.props.navigation.goBack(null)
    this.isCloseTriggered = true
  }

  noop = () => {
    // this function is supposed to do nothing
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
  // this variable is just to ensure that on slow devices
  // if user clicks on gray area and component was already scheduled to close
  // by auto close, or by user clicking on okay button and then auto-close trigger
  // we want to make sure that close is triggered by either action
  // and we don't want to run close again in any case
  isCloseTriggered = false

  componentWillUnmount() {
    this.isUnmounted = true
  }

  afterSuccessShown = () => {
    // auto close after success is shown to user
    this.onCancel()
  }
}

function QuestionSenderDetail(props: {
  source: number | { uri: string },
  senderName: string,
  questionStyles: any,
}) {
  return (
    <CustomView
      row
      style={[props.questionStyles.questionSenderContainer]}
      center
    >
      <CustomView>
        <Image
          style={[props.questionStyles.questionSenderLogo]}
          source={props.source}
          resizeMode="cover"
        />
      </CustomView>
      <Container style={[props.questionStyles.questionSenderName]}>
        <QuestionScreenText size="h5" numberOfLines={2}>
          {props.senderName}
        </QuestionScreenText>
      </Container>
    </CustomView>
  )
}

function QuestionDetails(props: {
  question?: QuestionStoreMessage,
  selectedResponse: ?QuestionResponse,
  onResponseSelect: (responseIndex: number) => void,
  questionStyles: any,
}) {
  const { question, selectedResponse, onResponseSelect, questionStyles } = props
  if (!question) {
    return null
  }

  const isSingleResponse = question.payload.valid_responses.length === 1

  return (
    <CustomView>
      <QuestionTitle
        title={question.payload.messageTitle}
        questionStyles={questionStyles}
      />
      <ScrollView
        style={[
          isSingleResponse
            ? questionStyles.questionResponsesContainerSingleResponse
            : questionStyles.questionResponsesContainer,
        ]}
      >
        <QuestionText
          text={question.payload.messageText}
          questionStyles={questionStyles}
        />
        <QuestionResponses
          responses={question.payload.valid_responses}
          selectedResponse={selectedResponse}
          onResponseSelect={onResponseSelect}
          questionStyles={questionStyles}
        />
        <QuestionExternalLinks externalLinks={question.payload.externalLinks} />
      </ScrollView>
    </CustomView>
  )
}

function QuestionTitle(props: { title: string, questionStyles: any }) {
  return (
    <CustomView style={[props.questionStyles.questionTitle]}>
      <QuestionScreenText size="h3b" numberOfLines={2}>
        {props.title}
      </QuestionScreenText>
    </CustomView>
  )
}

function QuestionText(props: { text: ?string, questionStyles: any }) {
  if (!props.text) {
    return null
  }

  return (
    <QuestionScreenText
      bold={false}
      size="h5"
      style={[props.questionStyles.questionText]}
    >
      {props.text}
    </QuestionScreenText>
  )
}

function QuestionResponses(props: {
  responses: ?Array<QuestionResponse>,
  selectedResponse: ?QuestionResponse,
  onResponseSelect: (responseIndex: number) => void,
  questionStyles: any,
}) {
  const { responses = [], selectedResponse, questionStyles } = props
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

function QuestionError(props: { questionStyles: any }) {
  const { questionStyles } = props
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

function QuestionSuccess(props: {
  afterSuccessShown: () => void,
  questionStyles: any,
}) {
  const { questionStyles } = props
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
          speed={1.5}
        />
      </CustomView>
      <QuestionScreenText size="h4" bold={false}>
        Sent
      </QuestionScreenText>
    </CustomView>
  )
}

function QuestionLoader(props: { questionStyles: any }) {
  const { questionStyles } = props
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

const mapStateToProps = (
  state: Store,
  { navigation }: QuestionScreenNavigation
) => {
  const uid: ?string = navigation.getParam('uid') || null
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
      screen: withStatusBar({ color: black })(
        connect(mapStateToProps, mapDispatchToProps)(Question)
      ),
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
