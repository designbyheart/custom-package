// @flow

import React from 'react'

import type { QuestionResponse, QuestionStoreMessage } from '../type-question'

import { CustomView, Container, CustomButton } from '../../components'
import {
  TEXT_IGNORE,
  TEXT_SUBMIT,
  TEXT_CANCEL,
  TEXT_TRY_AGAIN,
  TEXT_OK,
} from '../type-question'
import { getScreenStatus } from '../question-store'
import {
  questionActionButtonDefaultProps,
  questionStyles,
  disabledStyle,
} from '../question-screen-style'

export class QuestionActions extends React.Component<
  QuestionActionProps,
  void
> {
  render() {
    const testID = 'question-action'
    const { question, selectedResponse } = this.props
    const { valid_responses: responses } = question.payload
    let cancelButtonTitle = TEXT_IGNORE
    let submitButtonTitle = TEXT_SUBMIT

    const { error, success, idle } = getScreenStatus(question.status)
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
    const isSubmitDisabled = success || error ? false : !selectedResponse

    // as per our requirement from product team
    // If there is one response, then we need to render that one response
    // as a button, and add another button of our own that would be Ignore button
    // Also, if user is not in success state, then also we need to show Ignore button
    const shouldRenderIgnoreButton = idle
      ? responses.length === 1 || responses.length > 2
      : !success
    // If there are more than two responses, then we need to render
    // our own buttons (submit and cancel)
    const shouldRenderSubmitButton = idle ? responses.length > 2 : true
    // we need to render responses as buttons, so user can just press a button
    // to select the response for question
    // If a question has two valid responses
    // then those two responses would be rendered as buttons in screen
    // and user can tap on either button to send that particular response
    const responseButtons = (
      <QuestionResponseButtons
        responses={responses}
        onPress={this.props.onSelectResponseAndSubmit}
      />
    )

    return (
      <CustomView
        bg="tertiary"
        row
        safeArea
        style={[questionStyles.questionActionContainer]}
      >
        {shouldRenderIgnoreButton && (
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
          {shouldRenderSubmitButton ? (
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
          ) : (
            responseButtons
          )}
        </Container>
      </CustomView>
    )
  }
}

function QuestionResponseButtons(props: QuestionResponseButtonsProps) {
  const { responses, onPress } = props

  if (responses.length === 0 || responses.length > 2) {
    return null
  }

  return responses.map(response => (
    <QuestionResponseButton
      response={response}
      key={response.nonce}
      onPress={onPress}
    />
  ))
}

class QuestionResponseButton extends React.PureComponent<
  QuestionResponseButtonProps,
  void
> {
  render() {
    const { response } = this.props
    return (
      <CustomView style={[questionStyles.responseButton]}>
        <CustomButton
          {...questionActionButtonDefaultProps}
          eleventh
          style={[questionStyles.actionButton, questionStyles.submitButton]}
          title={response.text}
          testID={`${response.nonce}-submit`}
          onPress={this.onPress}
        />
      </CustomView>
    )
  }

  onPress = () => {
    this.props.onPress(this.props.response)
  }
}

export type QuestionActionProps = {
  selectedResponse: ?QuestionResponse,
  onSubmit: () => void,
  onCancel: () => void,
  onSelectResponseAndSubmit: (response: QuestionResponse) => void,
  question: QuestionStoreMessage,
}

type QuestionResponseButtonsProps = {
  responses: Array<QuestionResponse>,
  onPress: (response: QuestionResponse) => void,
}

type QuestionResponseButtonProps = {
  response: QuestionResponse,
  onPress: (response: QuestionResponse) => void,
}
