// @flow

import React from 'react'

import { mediumGray, font, color } from '../common/styles'
import { BackButton } from '../components/back-button/back-button'
import {
  HeaderTitle,
  headerTitleStyle,
} from '../components/header-title/header-title'

// TODO: DA check if this code is still required after headers update
export const headerNavigationOptions = ({
  title,
  ...rest
}: {
  title: string,
}) => {
  return {
    headerShown: false,
    headerTitleAlign: 'center',
    headerCenter: () => {
      return <HeaderTitle title={title} />
    },
    headerLeft: () => {
      return <BackButton />
    },
    headerHideShadow: false,
    ...rest,
  }
}

// TODO: DA check if this code is still required after headers update
export const headerOptionsWithNoBack = ({
  title,
  headerShown = true,
}: {
  title: string,
  headerShown?: boolean,
}) => ({
  title,
  gestureEnabled: false,
  headerHideBackButton: true,
  headerTitleStyle: headerTitleStyle.title,
  headerHideShadow: true,
  headerShown,
})
