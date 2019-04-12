// @flow

import React, { Component, PureComponent } from 'react'
import { StatusBar, Platform, ScrollView, Image } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createStackNavigator } from 'react-navigation'
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button'
import LottieView from 'lottie-react-native'

import type {
  QuestionScreenProps,
  QuestionStatus,
  QuestionResponse,
  QuestionScreenState,
  QuestionActionProps,
  QuestionStoreMessage,
} from './type-question'
import type { Store } from '../store/type-store'
import type { ComponentStatus, ReactNavigation } from '../common/type-common'
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
import { updateQuestionStatus, sendAnswerToQuestion } from './question-store'
import {
  transparentHeaderStyle,
  noBorderNoShadowHeaderStyle,
} from '../components/layout/header-styles'
import { QuestionScreenHeader } from './question-screen-header'
import {
  questionStyles,
  questionActionButtonDefaultProps,
  disabledStyle,
} from './question-screen-style'
import { barStyleLight, cmGrey4, caribbeanGreen } from '../common/styles'
import { getConnectionByUserDid, getConnection } from '../store/store-selector'

export class Question extends PureComponent<
  QuestionScreenProps,
  QuestionScreenState
> {
  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      ...transparentHeaderStyle,
      ...noBorderNoShadowHeaderStyle,
    },
    header: <QuestionScreenHeader navigation={navigation} />,
  })

  state = {
    response: null,
  }

  render() {
    const { question } = this.props
    if (!question) {
      return (
        <Container
          center
          bg="tertiary"
          style={[questionStyles.screenContainer]}
        >
          <QuestionScreenText size="h5">
            Invalid data passed in Question
          </QuestionScreenText>
        </Container>
      )
    }

    const { success, error, loading, idle }: ComponentStatus = getScreenStatus(
      question.status
    )

    return (
      <Container bg="tertiary" style={[questionStyles.screenContainer]}>
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
        {loading && (
          <Loader type="dark" showMessage={true} message={'Sending...'} />
        )}
        {success && <QuestionSuccess />}
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
            question={this.props.question}
          />
        )}
      </Container>
    )
  }

  componentDidMount() {
    StatusBar.setBarStyle(barStyleLight, true)
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

    this.props.sendAnswerToQuestion(
      this.props.question.payload.uid,
      this.state.response
    )
  }

  onCancel = () => {
    this.props.navigation.goBack(null)
  }
}

function getScreenStatus(questionStatus: QuestionStatus): ComponentStatus {
  const errorStates = [
    QUESTION_STATUS.SEND_ANSWER_FAIL_TILL_CLOUD_AGENT,
    QUESTION_STATUS.SEND_ANSWER_FAIL_END_TO_END,
  ]
  const error = errorStates.indexOf(questionStatus) > -1

  const successStates = [
    QUESTION_STATUS.SEND_ANSWER_SUCCESS_TILL_CLOUD_AGENT,
    QUESTION_STATUS.SEND_ANSWER_SUCCESS_END_TO_END,
  ]
  const success = successStates.indexOf(questionStatus) > -1

  const loadingStates = [QUESTION_STATUS.SEND_ANSWER_IN_PROGRESS]
  const loading = loadingStates.indexOf(questionStatus) > -1

  // if neither success, nor error or not loading, then idle to be true
  const idle = !error && !success && !loading ? true : false

  return {
    loading,
    success,
    error,
    idle,
  }
}

function QuestionSenderDetail(props: {
  source: number | { uri: string },
  senderName: string,
}) {
  return (
    <CustomView
      bg="tertiary"
      row
      style={[questionStyles.questionSenderContainer]}
      center
    >
      <CustomView>
        <Image
          style={[questionStyles.questionSenderLogo]}
          source={props.source}
          resizeMode="cover"
        />
      </CustomView>
      <Container style={[questionStyles.questionSenderName]}>
        <QuestionScreenText size="h5">{props.senderName}</QuestionScreenText>
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

  return (
    <Container bg="tertiary">
      <QuestionTitle title={question.payload.messageTitle} />
      <ScrollView>
        <QuestionText text={question.payload.messageText} />
        <QuestionResponses
          responses={question.payload.valid_responses}
          selectedResponse={selectedResponse}
          onResponseSelect={onResponseSelect}
        />
      </ScrollView>
    </Container>
  )
}

function QuestionTitle(props: { title: string }) {
  return (
    <CustomView style={[questionStyles.questionTitle]}>
      <QuestionScreenText size="h3b">{props.title}</QuestionScreenText>
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
  if (!responses) {
    return null
  }

  return (
    <RadioForm animation={true}>
      {responses.map((response, i) => {
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

class QuestionActions extends React.Component<QuestionActionProps, void> {
  render() {
    const testID = 'question-action'
    let cancelButtonTitle = TEXT_IGNORE
    let submitButtonTitle = TEXT_SUBMIT

    const { error, success } = getScreenStatus(this.props.question.status)
    if (error) {
      cancelButtonTitle = TEXT_CANCEL
      submitButtonTitle = TEXT_TRY_AGAIN
    }

    if (success) {
      submitButtonTitle = TEXT_OK
    }
    // if screen status is success or error, we need to enable submit button
    // if status is idle, then user needs to first select an answer
    // and only after that submit button is enabled
    const isSubmitDisabled =
      success || error ? false : !this.props.selectedResponse

    return (
      <CustomView
        bg="tertiary"
        row
        safeArea
        style={[questionStyles.questionActionContainer]}
      >
        {/* if user response is successfully submitted, then we don't need cancel button*/}
        {!success && (
          <Container style={[questionStyles.buttonSpacing]}>
            <CustomButton
              {...questionActionButtonDefaultProps}
              twelfth
              style={[questionStyles.actionButton, questionStyles.cancelButton]}
              title={cancelButtonTitle}
              testID={`${testID}-cancel`}
              onPress={this.props.onCancel}
            />
          </Container>
        )}
        <Container>
          <CustomButton
            {...questionActionButtonDefaultProps}
            eleventh
            style={[questionStyles.actionButton, questionStyles.submitButton]}
            title={submitButtonTitle}
            disabled={isSubmitDisabled}
            testID={`${testID}-submit`}
            onPress={this.props.onSubmit}
            customColor={disabledStyle}
          />
        </Container>
      </CustomView>
    )
  }
}

function QuestionError() {
  return (
    <Container bg="tertiary" center>
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
    </Container>
  )
}

function QuestionSuccess() {
  return (
    <Container bg="tertiary" center>
      <CustomView>
        <LottieView
          source={require('../images/green-tick-lottie.json')}
          autoPlay
          loop={false}
          style={questionStyles.feedbackIcon}
        />
      </CustomView>
      <QuestionScreenText size="h4" bold={false}>
        Sent
      </QuestionScreenText>
    </Container>
  )
}

function QuestionScreenText(props) {
  return (
    <CustomText bg="tertiary" color="primary" bold {...props}>
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
    connection.length > 0 ? connection[0].logoUrl : { uri: '' }
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
  }
)

export default QuestionStack
