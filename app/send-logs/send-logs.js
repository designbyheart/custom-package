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
import type { SendLogsProps } from './type-send-logs'
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
import { homeRoute, sendLogsRoute } from '../common/route-constants'
import Mailer from 'react-native-mail'
import { customLogger } from '../store/custom-logger'
import { Loader } from '../components'
import { getLogEncryptionStatus } from '../store/store-selector'
import {
  UPDATE_LOG_ISENCRYPTED,
  ENCRYPT_LOG_FILE,
} from '../send-logs/type-send-logs'
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

export class SendLogs extends PureComponent<SendLogsProps, void> {
  constructor(props: SendLogsProps) {
    super(props)
  }

  componentDidMount() {
    store.dispatch({
      type: ENCRYPT_LOG_FILE,
    })
  }

  //static emailMessageBody = ''

  static handleEmail = () => {
    const logFile = customLogger.getEncryptedVcxLogFile()
    Mailer.mail(
      {
        subject: 'ConnectMe Application Log: ' + logFile,
        recipients: ['cmsupport@evernym.com'],
        body: '',
        isHTML: false,
        attachment: {
          path: logFile, // The absolute path of the file from which to read data.
          type: 'text', // Mime Type: jpg, png, doc, ppt, html, pdf, csv, vcard, json, zip, text, mp3, wav, aiff, flac, ogg, xls
          name: logFile, // Optional: Custom filename for attachment
        },
      },
      (error, event) => {
        const sentButton = {
          text: 'OK',
          onPress: () => {
            //customLogger.log('SENT: ConnectMe Logs via Email')
          },
        }
        const cancelButton = {
          text: 'OK',
          onPress: () => {
            //customLogger.log('CANCELLED: ConnectMe Logs NOT sent via Email')
          },
        }
        const notAvailableMsg =
          'Unable to send error report. Sending error logs requires you to be signed into at least one email account on the default mail app which came with the phone out of the factory (the "native" mail app). Please sign into an email account from the default email app that came with the phone out of the factory and try again.'
        const cancelSendMsg = 'You did not send error logs to Evernym.'
        let alertMsg = event
        let alertButton = cancelButton
        if ('not_available' === error) {
          alertMsg = notAvailableMsg
        } else if ('cancelled' === event) {
          alertMsg = cancelSendMsg
        } else if ('sent' === event) {
          alertMsg = 'Sent'
          alertButton = sentButton
        }

        Alert.alert('', alertMsg, [alertButton], { cancelable: true })
      }
    )
  }

  static goBack(navigation: any) {
    //Alert.alert('NOT sending logs')
    navigation.goBack(null)
    setTimeout(() => {
      store.dispatch({
        type: UPDATE_LOG_ISENCRYPTED,
        logIsEncrypted: false,
      })
    }, 3000)
  }

  static sendLogs(navigation: any) {
    //Alert.alert('sending logs from file: ' + String(customLogger.getVcxLogFile()))
    SendLogs.handleEmail()
    SendLogs.goBack(navigation)
  }

  static navigationOptions = ({ navigation }) => ({
    header: (
      <CustomHeader
        backgroundColor={color.bg.tertiary.color}
        outerContainerStyles={{ borderBottomWidth: 0 }}
      >
        <Icon
          testID={'send-logs-close-icon'}
          iconStyle={[styles.headerLeft]}
          src={require('../images/icon_close.png')}
          resizeMode="contain"
          onPress={() => SendLogs.goBack(navigation)}
          small
        />
        <Icon
          testID={'send-logs-send-icon'}
          iconStyle={[styles.headerRight]}
          src={require('../images/iconRArrow.png')}
          resizeMode="contain"
          onPress={() => SendLogs.sendLogs(navigation)}
          small
        />
        <CustomText bg="tertiary" tertiary transparentBg semiBold />
        <CustomView />
      </CustomHeader>
    ),
    swipeEnabled: false,
  })

  render() {
    return this.props.logIsEncrypted ? (
      <Container tertiary>
        <CustomView center>
          <CustomText bg="secondary" secondary transparentBg semiBold>
            Send error logs to cmsupport@evernym.com ?
          </CustomText>
        </CustomView>
      </Container>
    ) : (
      // Show spinner until the log file is encrypted...
      <Container center>
        <Loader message="Encrypting log..." />
      </Container>
    )
  }
}

const mapStateToProps = (state: Store) => {
  return {
    logIsEncrypted: getLogEncryptionStatus(state),
  }
}

export const SendLogsStack = createStackNavigator({
  [sendLogsRoute]: {
    screen: connect(mapStateToProps)(SendLogs),
  },
})

export default SendLogsStack
