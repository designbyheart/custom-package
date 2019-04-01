// @flow

import React, { PureComponent } from 'react'
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
import type { QuestionProps } from './type-question'
import type { Store } from '../store/type-store'
import { connect } from 'react-redux'
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
import { bindActionCreators } from 'redux'
import { selectUserAvatar } from '../store/user/user-store'
import { createStackNavigator, NavigationActions } from 'react-navigation'
import { homeRoute, questionRoute } from '../common/route-constants'
import Mailer from 'react-native-mail'
import { customLogger } from '../store/custom-logger'
import { Loader } from '../components'
import store from '../store'

const width = Dimensions.get('window').width //full width
const height = Dimensions.get('window').height //full height

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

export class Question extends PureComponent<QuestionProps, void> {
  constructor(props: QuestionProps) {
    super(props)
  }

  componentDidMount() {}

  static goBack(navigation: any) {
    //Alert.alert('Cancelling question')
    navigation.goBack(null)
    // setTimeout(() => {
    //   store.dispatch({
    //     type: UPDATE_LOG_ISENCRYPTED,
    //     logIsEncrypted: false,
    //   })
    // }, 3000)
  }

  static answer(navigation: any) {
    //Alert.alert('sending logs from file: ' + String(customLogger.getVcxLogFile()))
    //Question.handleEmail()
    //Question.goBack(navigation)
  }

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
}

const mapStateToProps = (state: Store) => {
  return {}
}

export const QuestionStack = createStackNavigator({
  [questionRoute]: {
    screen: connect(mapStateToProps)(Question),
  },
})

export default QuestionStack
