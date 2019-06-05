// @flow
import { createStackNavigator } from 'react-navigation'

import {
  connectionHistDetailsRoute,
  connectionHistRoute,
  homeRoute,
} from '../common/route-constants'
import ConnectionDetails from './connection-details'
import { ConnectionDetailsNav } from './components/connection-details-nav'
import Home from '../home/home'

export default createStackNavigator(
  {
    [connectionHistRoute]: {
      screen: ConnectionDetails,
    },
  },
  {
    headerMode: 'none',
  }
)
