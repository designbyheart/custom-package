// @flow
import 'react-native-gesture-handler'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import {
  AppRegistry,
  BackHandler,
  ToastAndroid,
  Platform,
  UIManager,
  StatusBar,
} from 'react-native'
import { detox } from 'react-native-dotenv'
import { enableScreens } from 'react-native-screens'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { CommonActions, NavigationContainer } from '@react-navigation/native'
import { useScreens } from 'react-native-screens'

import store from './store'
import { ROUTE_UPDATE } from './store/route-store'
import { getStatusBarTheme } from './store/store-selector'
import { Container } from './components'
import { PushNotification } from './push-notification'
import DeepLink from './deep-link'
import { colors } from './common/styles/constant'
import { ConnectMeAppNavigator } from './navigation/navigator'
import { sendLogsRoute } from './common'

import type { AppProps } from './type-app'
import type {
  NavigationState,
  NavigationParams,
  NavigationRoute,
} from './common/type-common'
import AppStatus from './app-status/app-status'
import RNShake from 'react-native-shake'
import Offline from './offline/offline'

if (Platform.Version < 29) {
  // enable react-native-screens
  // TODO:KS Investigate why enableScreens break modals on Android
  // we can't tap anything on screen after modal is opened, but modal renders fine
  // Disable react-native-screens for android 10 and 11 (API level 29 and 30)
  //useScreens()
}

if (detox === 'yes') {
  // we are disabling flow check only because this line will come into effect
  // only in detox tests, for all other builds we will not come inside this IF
  // $FlowFixMe
  console.disableYellowBox = true
}

// enable layout animation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export class ConnectMeApp extends Component<AppProps, void> {
  currentRouteKey: string = ''
  currentRoute: string = ''
  navigatorRef = React.createRef<NavigationContainer>()
  currentRouteParams:
    | {
        onAvoid?: () => void,
        existingPin?: boolean,
        [key: string]: mixed,
      }
    | null
    | typeof undefined = null
  exitTimeout: number = 0

  componentDidMount() {
    RNShake.addEventListener('ShakeEvent', () => {
      if (this.currentRoute !== sendLogsRoute) {
        this.navigateToRoute(sendLogsRoute)
      }
    })
  }

  componentWillUnmount() {
    RNShake.removeEventListener('ShakeEvent', () => {})
  }

  // gets the current screen from navigation state
  getCurrentRoute = (navigationState: NavigationState) => {
    const route: NavigationRoute = navigationState.routes[navigationState.index]

    // dive into nested navigators
    if (route.state) {
      return this.getCurrentRoute(route.state)
    }

    return route
  }

  navigationChangeHandler = (navigationState: NavigationState) => {
    const { name, key, params } = this.navigatorRef.current
      ? this.navigatorRef.current.getCurrentRoute(navigationState)
      : {}
    const currentScreen = name

    this.currentRoute = name
    this.currentRouteKey = key
    this.currentRouteParams = params

    store.dispatch({
      type: ROUTE_UPDATE,
      currentScreen,
    })
  }

  navigateToRoute = (name: string, params: NavigationParams = {}) => {
    const navigateAction = CommonActions.navigate({
      name,
      params,
    })
    this.navigatorRef.current &&
      this.navigatorRef.current.dispatch(navigateAction)
  }

  render() {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <Container>
            <StatusBar
              backgroundColor={colors.cmWhite}
              barStyle="dark-content"
            />
            <PushNotification navigateToRoute={this.navigateToRoute} />
            <DeepLink />
            <AppStatus />
            <NavigationContainer
              ref={this.navigatorRef}
              onStateChange={this.navigationChangeHandler}
            >
              <ConnectMeAppNavigator />
            </NavigationContainer>
            <Offline overlay />
          </Container>
        </SafeAreaProvider>
      </Provider>
    )
  }
}

AppRegistry.registerComponent('ConnectMe', () => ConnectMeApp)
