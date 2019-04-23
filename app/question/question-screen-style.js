// @flow

import React from 'react'
import { StyleSheet, Platform, Dimensions } from 'react-native'
import {
  blackTransparent,
  OFFSET_2X,
  cmGrey5,
  OFFSET_3X,
  OFFSET_1X,
  cmGrey4,
  font,
  cmGrey1,
  white,
  cmGrey2,
  caribbeanGreen,
  darkGray2,
} from '../common/styles'

const QUESTION_SENDER_LOGO_DIMENSION = 32
const questionScreenSpacing = '5%'

export const questionStyles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerHandleContainer: {
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  headerHandlebar: {
    width: 51,
    height: 6,
    borderRadius: 6,
    backgroundColor: cmGrey5,
  },
  mainContainer: {
    backgroundColor: blackTransparent,
  },
  screenContainer: {
    borderRadius: 8,
    paddingLeft: questionScreenSpacing,
    paddingRight: questionScreenSpacing,
  },
  questionSenderContainer: {
    minHeight: 64,
    maxHeight: 90,
  },
  questionSenderLogo: {
    width: QUESTION_SENDER_LOGO_DIMENSION,
    height: QUESTION_SENDER_LOGO_DIMENSION,
    borderRadius: QUESTION_SENDER_LOGO_DIMENSION / 2,
    borderWidth: 1,
  },
  questionSenderName: {
    marginLeft: questionScreenSpacing,
  },
  questionTitle: {
    marginBottom: OFFSET_1X,
  },
  questionText: {
    marginBottom: OFFSET_3X,
  },
  questionResponsesContainer: {
    maxHeight: getQuestionResponsesHeight(),
  },
  questionResponsesContainerSingleResponse: {
    maxHeight: getQuestionResponsesHeight(true),
  },
  questionResponseRadio: {
    borderWidth: 0,
    backgroundColor: cmGrey4,
  },
  questionResponseRadioWrapper: {
    marginLeft: '5%',
  },
  questionResponseRadioLabel: {
    fontFamily: font.family,
    fontSize: font.size.M,
    color: cmGrey1,
    fontWeight: 'bold',
  },
  questionResponseRadioLabelWrapper: {
    marginLeft: 16,
  },
  questionRadioStyle: {
    marginBottom: 16,
  },
  questionActionContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: '3%',
  },
  buttonSpacing: {
    marginRight: '3%',
  },
  actionButton: {
    borderRadius: 5,
    borderWidth: 1,
  },
  cancelButton: {
    borderColor: darkGray2,
  },
  submitButton: {
    borderColor: caribbeanGreen,
  },
  feedbackIcon: {
    width: 150,
    height: 150,
  },
  responseButton: {
    marginTop: OFFSET_1X,
  },
  questionLoaderContainer: {
    minHeight: '20%',
    marginVertical: '10%',
  },
  questionErrorContainer: {
    marginVertical: '10%',
  },
  questionSuccessContainer: {
    marginVertical: '10%',
  },
})

export const questionActionButtonDefaultProps = {
  fontSize: font.size.M,
  fontWeight: 'bold',
  fontFamily: font.family,
}

export const disabledStyle = {
  backgroundColor: caribbeanGreen,
}

function getQuestionResponsesHeight(singleResponse: ?boolean) {
  const { height } = Dimensions.get('window')
  const headerHeight = height * 10 / 100
  const bottomActionsHeight = height * (singleResponse ? 10 : 20) / 100
  const senderDetailsHeight = 100
  const titleHeight = 100

  return (
    height -
    headerHeight -
    bottomActionsHeight -
    senderDetailsHeight -
    titleHeight
  )
}
