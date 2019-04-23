// @flow

import React from 'react'
import { Dimensions } from 'react-native'

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
import { isSmallWidthDevice } from '../../common/styles'

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
      <CustomView safeArea>
        <CustomView
          bg="tertiary"
          row
          style={[questionStyles.questionActionContainer]}
        >
          {shouldRenderIgnoreButton && (
            <Container style={[questionStyles.buttonSpacing]}>
              <CustomButton
                {...questionActionButtonDefaultProps}
                twelfth
                style={[
                  questionStyles.actionButton,
                  questionStyles.cancelButton,
                ]}
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
                style={[
                  questionStyles.actionButton,
                  questionStyles.submitButton,
                ]}
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
      </CustomView>
    )
  }
}

function QuestionResponseButtons(props: QuestionResponseButtonsProps) {
  const { responses, onPress } = props

  if (responses.length === 0 || responses.length > 2) {
    return null
  }

  // as per requirements, we need to render responses in reverse order
  // so that first response in array is at bottom which is closer
  // to user's thumb.
  // below we are slicing first, because `reverse` modifies the original array
  // and since we are getting this array in props, we don't want to modify props
  // so first, we create a copy of passed array and then reverse it
  const reversedResponses = responses.slice().reverse()
  // Also, only first (or last in reversed array) response in array
  // is supposed to look green (primary button)
  // and all other responses needs to look secondary
  const lastItemIndex = reversedResponses.length - 1
  // if we have only single response, then we need some more business logic
  // as per our requirement, see <QuestionResponseButton /> render method
  // for more logic
  const isSingleResponse = reversedResponses.length === 1

  return reversedResponses.map((response: QuestionResponse, index: number) => (
    <QuestionResponseButton
      response={response}
      key={response.nonce}
      onPress={onPress}
      isPrimaryResponse={index === lastItemIndex}
      isSingleResponse={isSingleResponse}
    />
  ))
}

class QuestionResponseButton extends React.PureComponent<
  QuestionResponseButtonProps,
  void
> {
  render() {
    const { response, isPrimaryResponse, isSingleResponse } = this.props

    // We need to show only one line of text on action buttons
    // Normally, we should have used react-native's numberOfLines prop
    // but since we are using an external library for Buttons
    // and this version is bit older, in newer versions we can specify
    // numberOfLines prop for Button component
    // So, for now just using substring on response text
    // Also, if there is only a single response
    // then we need to show half text limit on button, because in single response
    // buttons are placed side by side and has less width
    // TODO: Upgrade react-native-elements and use numberOfLines prop
    const buttonText = isSingleResponse
      ? ellipsis(response.text, Math.floor(getResponseButtonsTextLimit() / 2))
      : ellipsis(response.text, getResponseButtonsTextLimit())

    return (
      <CustomView
        style={[isSingleResponse ? {} : questionStyles.responseButton]}
      >
        <CustomButton
          {...questionActionButtonDefaultProps}
          eleventh={isPrimaryResponse}
          twelfth={!isPrimaryResponse}
          style={[
            questionStyles.actionButton,
            isPrimaryResponse
              ? questionStyles.submitButton
              : questionStyles.cancelButton,
          ]}
          title={buttonText}
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

function ellipsis(text: string, maxLength: number) {
  const stringLargerThanMaxLength = text.length > maxLength
  const trimmedText = text.substring(
    0,
    stringLargerThanMaxLength ? maxLength - 3 : maxLength
  )
  return stringLargerThanMaxLength ? trimmedText + '...' : trimmedText
}

function getResponseButtonsTextLimit() {
  const responseTextLimit = 40
  return isSmallWidthDevice ? responseTextLimit - 5 : responseTextLimit
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
  isPrimaryResponse: boolean,
  isSingleResponse: boolean,
}
