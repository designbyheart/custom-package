// @flow

// this page displays a webview with our terms and conditions
// you should get the url value and title from constants
// on click accept take user to lock selection screen

import React, { Component } from 'react'
import { WebView, Alert, View } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type { EulaScreenState } from './type-eula'
import type { CustomError, ReactNavigation } from '../common/type-common'
import type { Store } from '../store/type-store'

import { tertiaryHeaderStyles } from '../components/layout/header-styles'
import {
  CustomText,
  Container,
  FooterActions,
  CustomHeader,
} from '../components'
import { eulaRoute, restoreRoute, lockSelectionRoute } from '../common'
import { eulaAccept } from './eula-store'
import { EULA_URL, localEulaSource } from './type-eula'
import { color } from '../common/styles/constant'
import { LoaderGif } from '../components/loader-gif/loader-gif'
import { withStatusBar } from '../components/status-bar/status-bar'

export class EulaScreen extends Component<*, EulaScreenState> {
  state = {
    error: null,
  }

  static navigationOptions = ({ navigation }: ReactNavigation) => ({
    header: (
      <CustomHeader
        backgroundColor={color.bg.tertiary.color}
        flatHeader
        centerComponent={
          <CustomText bg="tertiary" tertiary transparentBg semiBold>
            Terms and Conditions
          </CustomText>
        }
      />
    ),
    swipeEnabled: false,
  })

  onReject = () => {
    Alert.alert(
      'Alert',
      'You will not be able to use the application without accepting Terms and Conditions'
    )
  }

  onError = (error: CustomError) => {
    if (error) {
      this.setState({ error })
    }
  }

  onAccept = () => {
    this.props.eulaAccept(true)
    // if we have to enable choice for restore and start fresh screen, then redirect user to restoreRoute instead of lockSelectionRoute
    this.props.navigation.navigate(lockSelectionRoute)
  }

  render() {
    const webViewUri = this.state.error ? localEulaSource : EULA_URL

    return (
      <Container fifth>
        <WebView
          source={{ uri: webViewUri }}
          startInLoadingState={true}
          renderLoading={() => LoaderGif}
          onError={this.onError}
          renderError={() => <View />}
        />
        <FooterActions
          onAccept={this.onAccept}
          onDecline={this.onReject}
          denyTitle="Decline"
          acceptTitle="Accept"
          testID="eula"
        />
      </Container>
    )
  }
}

const mapStateToProps = ({ eula }: Store) => ({
  eula,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      eulaAccept,
    },
    dispatch
  )

export default createStackNavigator({
  [eulaRoute]: {
    screen: withStatusBar()(
      connect(mapStateToProps, mapDispatchToProps)(EulaScreen)
    ),
  },
})
