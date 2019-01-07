// @flow

import React, { PureComponent } from 'react'
import { StyleSheet, Linking, Alert, ScrollView, StatusBar } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type { Store } from '../store/type-store'
import type {
  OnfidoProps,
  OnfidoProcessStatus,
  OnfidoConnectionStatus,
} from './type-onfido'

import {
  Container,
  CustomText,
  CustomView,
  CustomButton,
  Loader,
} from '../components'
import { launchOnfidoSDK, resetOnfidoStatues } from './onfido-store'
import { white, color, toryBlue, barStyleDark } from '../common/styles'
import {
  onfidoProcessStatus,
  onfidoConnectionStatus,
  TEXT_ONFIDO_SUCCESS_FIRST_PARAGRAPH,
  TEXT_ONFIDO_SUCCESS_TITLE,
  TEXT_ONFIDO_SUCCESS_SECOND_PARAGRAPH,
  TEXT_ONFIDO_DEFAULT,
  TEXT_ONFIDO_YES,
  TEXT_ONFIDO_OK,
  TEXT_ONFIDO_I_ACCEPT,
  TEXT_ONFIDO_ID,
  TEXT_ONFIDO_TNC_FIRST_PARAGRAPH,
  TEXT_ONFIDO_TNC_SECOND_1,
  TEXT_ONFIDO_TNC_SECOND_2,
  TEXT_ONFIDO_TNC_SECOND_3,
} from './type-onfido'
import { connectionsTabRoute, connectionHistoryDetailsRoute } from '../common'

export class Onfido extends PureComponent<OnfidoProps, void> {
  static navigationOptions = {
    headerStyle: {
      backgroundColor: color.bg.tertiary.color,
      borderBottomWidth: 0,
      borderBottomColor: color.bg.tertiary.color,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: color.actions.ninth,
  }

  onAction = () => {
    if (isSuccess(this.props.status, this.props.connectionStatus)) {
      this.props.navigation.goBack()
      this.props.navigation.navigate(connectionsTabRoute)
      return
    }

    return this.props.launchOnfidoSDK()
  }

  componentDidMount() {
    this.props.resetOnfidoStatues()
  }

  render() {
    const { status, connectionStatus } = this.props

    if (isLoaderVisible(status, connectionStatus)) {
      return (
        <Container tertiary>
          <Loader showMessage={true} />
        </Container>
      )
    }

    return (
      <Container tertiary>
        <StatusBar
          barStyle={barStyleDark}
          animated={true}
          backgroundColor={color.bg.tertiary.color}
        />
        <Container center horizontalSpace>
          {hasError(status, connectionStatus) ? (
            <OnfidoError status={status} connectionStatus={connectionStatus} />
          ) : isSuccess(status, connectionStatus) ? (
            <OnfidoSuccess />
          ) : (
            <OnfidoDefault />
          )}
        </Container>
        <CustomView row safeArea>
          <Container>
            <CustomButton
              testID="onfido-yes"
              title={getActionButtonText(status, connectionStatus)}
              ninth
              medium
              fontWeight="600"
              onPress={this.onAction}
              style={[styles.buttonStyle]}
            />
          </Container>
        </CustomView>
      </Container>
    )
  }
}

const LoaderVisibleOnfidoStates = [
  onfidoProcessStatus.APPLICANT_ID_FETCHING,
  onfidoProcessStatus.APPLICANT_ID_SUCCESS,
  onfidoProcessStatus.CHECK_UUID_FETCHING,
  onfidoProcessStatus.SDK_SUCCESS,
]

const LoaderVisibleOnfidoConnectionStates = [
  onfidoConnectionStatus.CONNECTION_DETAIL_FETCHING,
  onfidoConnectionStatus.CONNECTION_IN_PROGRESS,
]

function isLoaderVisible(
  status: OnfidoProcessStatus,
  connectionStatus: OnfidoConnectionStatus
) {
  return (
    LoaderVisibleOnfidoStates.includes(status) ||
    LoaderVisibleOnfidoConnectionStates.includes(connectionStatus)
  )
}

const onfidoErrorStates = [
  onfidoProcessStatus.APPLICANT_ID_API_ERROR,
  onfidoProcessStatus.SDK_ERROR,
  onfidoProcessStatus.CHECK_UUID_ERROR,
]

const onfidoConnectionErrorStates = [
  onfidoConnectionStatus.CONNECTION_DETAIL_FETCH_ERROR,
  onfidoConnectionStatus.CONNECTION_DETAIL_INVALID_ERROR,
  onfidoConnectionStatus.CONNECTION_FAIL,
]

function OnfidoError(props: {
  status: OnfidoProcessStatus,
  connectionStatus: OnfidoConnectionStatus,
}) {
  let errorText = getErrorText(props.status)
  if (!errorText) {
    errorText = getErrorConnectionText(props.connectionStatus)
  }

  if (!errorText) {
    return null
  }

  return (
    <CustomText bg="tertiary" h4 center>
      {errorText}
    </CustomText>
  )
}

function hasError(
  status: OnfidoProcessStatus,
  connectionStatus: OnfidoConnectionStatus
) {
  return (
    onfidoErrorStates.includes(status) ||
    onfidoConnectionErrorStates.includes(connectionStatus)
  )
}

function getErrorText(status: OnfidoProcessStatus) {
  switch (status) {
    case onfidoProcessStatus.APPLICANT_ID_API_ERROR:
      return 'Onfido faced an error while trying to start process. Try again?'

    case onfidoProcessStatus.SDK_ERROR:
    case onfidoProcessStatus.CHECK_UUID_ERROR:
      return 'Onfido could not complete processing your identity document. Try again?'

    default:
      return null
  }
}

function getErrorConnectionText(connectionStatus: OnfidoConnectionStatus) {
  switch (connectionStatus) {
    case onfidoConnectionStatus.CONNECTION_DETAIL_FETCH_ERROR:
    case onfidoConnectionStatus.CONNECTION_DETAIL_INVALID_ERROR:
    case onfidoConnectionStatus.CONNECTION_FAIL:
      return 'Error establishing Sovrin connection with Onfido. Try again?'

    default:
      return null
  }
}

function isSuccess(
  status: OnfidoProcessStatus,
  connectionStatus: OnfidoConnectionStatus
) {
  return (
    connectionStatus === onfidoConnectionStatus.CONNECTION_SUCCESS &&
    status === onfidoProcessStatus.CHECK_UUID_SUCCESS
  )
}

const OnfidoSuccess = () => (
  <CustomView>
    <CustomText bg="tertiary" h3a center>
      {TEXT_ONFIDO_SUCCESS_TITLE}
    </CustomText>
    <CustomText bg="tertiary" h4 center style={[styles.successTextStyle]}>
      {TEXT_ONFIDO_SUCCESS_FIRST_PARAGRAPH}
    </CustomText>
    <CustomText bg="tertiary" h4 center>
      {TEXT_ONFIDO_SUCCESS_SECOND_PARAGRAPH}
    </CustomText>
  </CustomView>
)

const openUrl = (url: string) => () => {
  Linking.openURL(url).catch(() => {
    Alert.alert(
      'Could not open URL',
      'Could not find a browser app which can open this URL.'
    )
  })
}

const OnfidoTNC = () => (
  <CustomText
    h6
    style={[styles.webLink]}
    bg="tertiary"
    onPress={openUrl('https://onfido.com/termsofuse/')}
  >
    Onfido Terms of Service
  </CustomText>
)

const OnfidoPrivacy = () => (
  <CustomText
    h6
    style={[styles.webLink]}
    bg="tertiary"
    onPress={openUrl('https://onfido.com/privacy/')}
  >
    Onfido Privacy Policy
  </CustomText>
)

const OnfidoDefault = () => (
  <ScrollView>
    <CustomText bg="tertiary" h3a>
      {TEXT_ONFIDO_ID}
    </CustomText>
    <CustomText bg="tertiary" h6 style={[styles.onfidoTnC]}>
      {TEXT_ONFIDO_TNC_FIRST_PARAGRAPH}
    </CustomText>
    <CustomText bg="tertiary" h6 style={[styles.onfidoTnC]}>
      {TEXT_ONFIDO_TNC_SECOND_1}
      <OnfidoTNC />
      {TEXT_ONFIDO_TNC_SECOND_2}
      <OnfidoPrivacy />
      {TEXT_ONFIDO_TNC_SECOND_3}
    </CustomText>
  </ScrollView>
)

function getActionButtonText(
  status: OnfidoProcessStatus,
  connectionStatus: OnfidoConnectionStatus
) {
  return hasError(status, connectionStatus)
    ? TEXT_ONFIDO_YES
    : isSuccess(status, connectionStatus)
      ? TEXT_ONFIDO_OK
      : TEXT_ONFIDO_I_ACCEPT
}

const styles = StyleSheet.create({
  buttonStyle: {
    borderLeftColor: white,
    borderLeftWidth: StyleSheet.hairlineWidth,
    marginHorizontal: '5%',
    marginBottom: 15,
  },
  successTextStyle: {
    marginVertical: 15,
  },
  webLink: {
    color: toryBlue,
    textDecorationLine: 'underline',
  },
  onfidoTnC: {
    marginTop: 15,
    lineHeight: 25,
  },
})

const mapStateToProps = (state: Store) => ({
  status: state.onfido.status,
  connectionStatus: state.onfido.onfidoConnectionStatus,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators({ launchOnfidoSDK, resetOnfidoStatues }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Onfido)
