// @flow

import React, { Component } from 'react'
import {
  StyleSheet,
  Image,
  NativeModules,
  View,
  ScrollView,
  Text,
  Button,
  Platform,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createStackNavigator } from 'react-navigation'

import type { QuestionProps, QuestionStatus } from './type-question'
import type { Store } from '../store/type-store'
import type { ComponentStatus, ReactNavigation } from '../common/type-common'

import {
  Container,
  CustomView,
  CustomHeader,
  Icon,
  CustomText,
} from '../components'
import {
  color,
  OFFSET_1X,
  OFFSET_2X,
  OFFSET_6X,
  OFFSET_7X,
  dimGray,
  lightGray,
  grey,
} from '../common/styles'
import { questionRoute } from '../common/route-constants'
import { Loader } from '../components'
import { QUESTION_STATUS } from './type-question'
import { updateQuestionStatus, sendAnswerToQuestion } from './question-store'

export class Question extends Component<QuestionProps, void> {
  static goBack(navigation: any) {
    navigation.goBack(null)
  }

  static answer(navigation: any) {}

  static navigationOptions = ({ navigation }) => ({
    header: (
      <CustomHeader
        backgroundColor={color.bg.tertiary.color}
        outerContainerStyles={{ borderBottomWidth: 0 }}
      >
        <Icon
          testID={'question-close-icon'}
          iconStyle={[styles.headerLeft]}
          src={require('../images/icon_close.png')}
          resizeMode="contain"
          onPress={() => Question.goBack(navigation)}
          small
        />
        <Icon
          testID={'question-submit-icon'}
          iconStyle={[styles.headerRight]}
          src={require('../images/iconRArrow.png')}
          resizeMode="contain"
          onPress={() => Question.answer(navigation)}
          small
        />
        <CustomText bg="tertiary" tertiary transparentBg semiBold />
        <CustomView />
      </CustomHeader>
    ),
    swipeEnabled: false,
  })

  render() {
    return (
      <Container tertiary>
        <CustomView center>
          <CustomText bg="secondary" secondary transparentBg semiBold>
            Answer this question...
          </CustomText>
        </CustomView>
      </Container>
    )
  }

  componentDidMount() {}
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

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

const styles = StyleSheet.create({
  headerLeft: {
    width: OFFSET_2X,
  },
  headerRight: {
    width: OFFSET_2X,
  },
  inputBox: {
    backgroundColor: lightGray,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 18,
    borderColor: grey,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    height: height * 0.4,
    width: width * 0.8,
  },
})

const mapStateToProps = (state: Store, { navigation }: ReactNavigation) => {
  const uid: string | null = navigation.getParam('uid', null)
  if (!uid) {
    return {}
  }

  return {
    question: state.question.data[uid],
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

export const QuestionStack = createStackNavigator({
  [questionRoute]: {
    screen: connect(mapStateToProps)(Question),
  },
})

export default QuestionStack
