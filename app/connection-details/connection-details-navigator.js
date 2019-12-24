// @flow
import { createStackNavigator } from 'react-navigation'

import { connectionHistRoute } from '../common/route-constants'
import ConnectionDetails from './connection-details'

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
