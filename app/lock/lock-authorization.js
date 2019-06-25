// @flow
/**
 * Intend to verify user actions
 * we will ask authorize user for some actions in app
 * either by asking for TouchId or asking user to enter pin code
 * we will ask for authorization while accepting invitation
 * accepting claim offer, sharing proof for now
 */
import React, { PureComponent } from 'react'
import { StyleSheet } from 'react-native'
import type {
  LockAuthorizationProps,
  LockAuthorizationNavigation,
} from './type-lock'

import LockEnter from './lock-enter'
import { Icon } from '../components'
import { CustomView, CustomHeader } from '../components'
import { OFFSET_2X, color } from '../common/styles'
import { tertiaryHeaderStyles } from '../components/layout/header-styles'
import { lockAuthorizationHomeRoute } from '../common'
import { createStackNavigator } from 'react-navigation'
import { withStatusBar } from '../components/status-bar/status-bar'

const styles = StyleSheet.create({
  headerLeft: {
    width: OFFSET_2X,
  },
})

export class LockAuthorization extends PureComponent<
  LockAuthorizationProps,
  void
> {
  static navigationOptions = ({ navigation }: LockAuthorizationNavigation) => ({
    header: (
      <CustomHeader flatHeader backgroundColor={color.bg.tertiary.color}>
        <CustomView>
          <Icon
            small
            testID={'back-arrow'}
            iconStyle={[styles.headerLeft]}
            src={require('../images/icon_backArrow.png')}
            resizeMode="contain"
            onPress={() => {
              navigation.goBack(null)
              const { params } = navigation.state
              params && params.onAvoid && params.onAvoid()
            }}
          />
        </CustomView>
      </CustomHeader>
    ),
  })

  onSuccess = () => {
    const { navigation } = this.props
    navigation.goBack(null)
    setTimeout(() => {
      const { params } = navigation.state
      params && params.onSuccess && params.onSuccess()
    })
  }

  onClose = () => {
    const { navigation } = this.props
    navigation.goBack(null)
    setTimeout(() => {
      const { params } = navigation.state
      params && params.onAvoid && params.onAvoid()
    })
  }

  render() {
    return <LockEnter onSuccess={this.onSuccess} />
  }
}

export default createStackNavigator({
  [lockAuthorizationHomeRoute]: {
    screen: withStatusBar()(LockAuthorization),
  },
})
