// @flow

// this page displays a webview with our terms and conditions
// you should get the url value and title from constants
// on click accept take user to lock selection screen

import React, { useState, useCallback, useMemo } from 'react'
import { Alert, View, StyleSheet } from 'react-native'
import WebView from 'react-native-webview'

import type {
  CustomError,
  ReactNavigation,
  ReduxConnect,
} from '../common/type-common'
import { TermsAndConditionsTitle } from '../common/privacyTNC-constants'
import { Container, FooterActions } from '../components'
import {
  eulaRoute,
  homeRoute,
} from '../common'
import { eulaAccept } from './eula-store'
import { EULA_URL, localEulaSource } from './type-eula'
import { OrangeLoader } from '../components/loader-gif/loader-gif'
import { connect } from 'react-redux'
import { Header } from '../components'

export const EulaScreen = ({
  dispatch,
  navigation,
  route,
}: ReactNavigation & ReduxConnect) => {
  const [error, setError] = useState<CustomError | null>(null)
  const onReject = useCallback(() => {
    Alert.alert(
      'Alert',
      'You will not be able to use the application without accepting Terms and Conditions'
    )
  }, [])

  const onAccept = useCallback(() => {
    dispatch(eulaAccept(true))
    // if we have to enable choice for restore and start fresh screen, then redirect user to restoreRoute instead of homeRoute
    navigation.navigate(homeRoute)
  }, [])

  const renderLoader = useCallback(() => Loader, [])
  const renderError = useCallback(() => emptyError, [])
  const webViewUri = error ? localEulaSource : EULA_URL
  const source = useMemo(() => ({ uri: webViewUri }), [webViewUri])

  return (
    <Container fifth>
      <WebView
        source={source}
        startInLoadingState={true}
        renderLoading={renderLoader}
        onError={setError}
        renderError={renderError}
        automaticallyAdjustContentInsets={false}
      />
      <FooterActions
        onAccept={onAccept}
        onDecline={onReject}
        denyTitle="Decline"
        acceptTitle="Accept"
        testID="eula"
      />
    </Container>
  )
}

export const eulaScreen = {
  routeName: eulaRoute,
  screen: connect()(EulaScreen),
}
const style = StyleSheet.create({
  loaderContainer: {
    flex: 1,
  },
})
const Loader = <View style={style.loaderContainer}>{OrangeLoader}</View>
const emptyError = <View />
