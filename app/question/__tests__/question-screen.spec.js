// @flow

import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import merge from 'lodash.merge'

import type { GenericObject } from '../../common/type-common'

import {
  getNavigation,
  senderName1,
  senderLogoUrl,
} from '../../../__mocks__/static-data'
import { Question } from '../question-screen'
import {
  mockQuestionReceivedState,
  mockQuestionPayload2,
} from '../../../__mocks__/data/question-store-mock-data'
import {
  QUESTION_STATUS,
  TEXT_IGNORE,
  TEXT_OK,
  TEXT_SUBMIT,
} from '../type-question'

describe('<QuestionScreen />', () => {
  it('should match idle state snapshot', () => {
    const { component } = setup()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match success snapshot', () => {
    const { component } = setup({
      status: QUESTION_STATUS.SEND_ANSWER_SUCCESS_TILL_CLOUD_AGENT,
    })
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match loading snapshot', () => {
    const { component } = setup({
      status: QUESTION_STATUS.SEND_ANSWER_IN_PROGRESS,
    })
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match error snapshot', () => {
    const { component } = setup({
      status: QUESTION_STATUS.SEND_ANSWER_FAIL_TILL_CLOUD_AGENT,
    })
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should goBack if cancel button is pressed', () => {
    const { component, props } = setup({
      status: QUESTION_STATUS.SEEN,
    })
    const cancelButton = component.root.findByProps({ title: TEXT_IGNORE })
    cancelButton.props.onPress()
    expect(props.navigation.goBack).toHaveBeenCalledTimes(1)
  })

  it('should goBack if submit button is pressed and user is already in success state', () => {
    const { component, props } = setup({
      status: QUESTION_STATUS.SEND_ANSWER_SUCCESS_TILL_CLOUD_AGENT,
    })
    const okButton = component.root.findByProps({ title: TEXT_OK })
    okButton.props.onPress()
    expect(props.navigation.goBack).toHaveBeenCalledTimes(1)
  })

  it('should raise sendAnswerToQuestion if submit button is pressed', () => {
    const { component, props } = setup({
      status: QUESTION_STATUS.SEEN,
    })
    const submitButton = component.root.findByProps({ title: TEXT_SUBMIT })
    submitButton.props.onPress()
    expect(props.sendAnswerToQuestion).toHaveBeenCalledTimes(1)
    expect(props.sendAnswerToQuestion).toHaveBeenCalledWith(
      mockQuestionPayload2.uid,
      component.getInstance().state.response
    )
  })

  it('success button should be disabled if no answer is selected', () => {
    const { component, props } = setup({
      status: QUESTION_STATUS.SEEN,
    })
    const submitButton = component.root.findByProps({ title: TEXT_SUBMIT })
    expect(submitButton.props.disabled).toBe(true)
  })

  it('should match invalid data', () => {
    const props = getProps()
    const { component } = setup({
      payload: {
        ...props.question.payload,
        valid_responses: null,
      },
    })
    expect(component.toJSON()).toMatchSnapshot()
  })

  function getProps(extraProps: ?GenericObject = {}) {
    return {
      updateQuestionStatus: jest.fn(),
      sendAnswerToQuestion: jest.fn(),
      question: merge(
        {},
        mockQuestionReceivedState.data[mockQuestionPayload2.uid],
        extraProps
      ),
      senderLogoUrl: { uri: senderLogoUrl },
      senderName: senderName1,
      navigation: {
        ...getNavigation(),
      },
    }
  }

  function setup(extraProps: ?GenericObject = {}) {
    const props = getProps(extraProps)
    const component = renderer.create(<Question {...props} />)

    return { component, props }
  }
})
