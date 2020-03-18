// @flow
import React from 'react'
import { Image } from 'react-native'
import { CustomView } from '../../../components/layout'
import QuestionScreenText from './question-screen-text'

const QuestionSenderDetail = (props: {
  source: number | { uri: string },
  senderName: string,
  questionStyles: any,
}) => {
  return (
    <CustomView
      row={false}
      style={props.questionStyles.questionSenderContainer}
      center
    >
      <Image
        style={[props.questionStyles.questionSenderLogo]}
        source={props.source}
        resizeMode="cover"
      />
      <QuestionScreenText size="h4b" numberOfLines={2} color={'#A5A5A5'}>
        {props.senderName}
      </QuestionScreenText>
    </CustomView>
  )
}

export default QuestionSenderDetail
