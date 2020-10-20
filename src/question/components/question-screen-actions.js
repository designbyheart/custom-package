// @flow

import React, { useCallback } from 'react'

import type { QuestionResponse, QuestionStoreMessage } from '../type-question'

import { CustomView, CustomButton } from '../../components'
import { TEXT_SUBMIT, TEXT_TRY_AGAIN, TEXT_OK } from '../type-question'
import { getScreenStatus } from '../question-store'
import {
  questionActionButtonDefaultProps,
  questionStyles,
  disabledStyle,
} from '../question-screen-style'

import { isSmallWidthDevice } from '../../common/styles'

export const QuestionActions = ({
  question,
  selectedResponse,
  onSelectResponseAndSubmit,
  onSubmit,
}: QuestionActionProps) => {
  const testID = 'question-action'

  if (!question) {
    return null
  }
  const { valid_responses: responses } = question.payload

  let submitButtonTitle = TEXT_SUBMIT

  const { error, success, idle } = getScreenStatus(
    question ? question.status : undefined
  )
  if (error) {
    submitButtonTitle = TEXT_TRY_AGAIN
  }

  if (success) {
    submitButtonTitle = TEXT_OK
  }
  // if screen status is success or error, we need to enable submit button
  // if status is idle, then user needs to first select an answer
  // and only after that submit button is enabled
  const isSubmitDisabled = success || error ? false : !selectedResponse

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
      onPress={onSelectResponseAndSubmit}
    />
  )

  return (
    <CustomView style={[questionStyles.actionWrapper]}>
      <CustomView style={questionStyles.actionButtonContainer}>
        {shouldRenderSubmitButton ? (
          <CustomButton
            {...questionActionButtonDefaultProps}
            eleventh
            style={[questionStyles.actionButton, questionStyles.submitButton]}
            title={submitButtonTitle}
            disabled={isSubmitDisabled}
            testID={`${testID}-submit`}
            onPress={onSubmit}
            customColor={disabledStyle}
          />
        ) : (
          responseButtons
        )}
      </CustomView>
    </CustomView>
  )
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

  return (
    <CustomView>
      {reversedResponses.map((response: QuestionResponse, index: number) => (
        <QuestionResponseButton
          response={response}
          key={response.nonce}
          onPress={onPress}
          isPrimaryResponse={index === lastItemIndex}
          isSingleResponse={isSingleResponse}
        />
      ))}
    </CustomView>
  )
}

const QuestionResponseButton = ({
  response,
  isPrimaryResponse,
  isSingleResponse,
  onPress,
}: QuestionResponseButtonProps) => {
  const onResponse = useCallback(() => {
    onPress(response)
  }, [])
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
      style={[
        questionStyles.actionButtonContainer,
        isPrimaryResponse
          ? questionStyles.submitButton
          : questionStyles.cancelButton,
      ]}
    >
      <CustomButton
        {...questionActionButtonDefaultProps}
        eleventh={isPrimaryResponse}
        twelfth={!isPrimaryResponse}
        style={[
          questionStyles.actionButton,
          isPrimaryResponse && questionStyles.submitButton,
        ]}
        title={buttonText}
        testID={`${response.nonce ? response.nonce : response.text}-submit`}
        onPress={onResponse}
        titleStyle={isPrimaryResponse ? {} : questionStyles.cancelBtnColor}
      />
    </CustomView>
  )
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
  onSelectResponseAndSubmit: (response: QuestionResponse) => void,
  question?: QuestionStoreMessage,
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
