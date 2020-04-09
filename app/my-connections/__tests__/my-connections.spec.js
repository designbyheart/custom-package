// @flow
import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'

import { MyConnectionsScreen } from '../my-connections'
import {
  SERVER_ENVIRONMENT,
  GET_MESSAGES_SUCCESS,
} from '../../store/type-config-store'

import {
  getNavigation,
  getStore,
  myPairWiseConnectionDetails,
  vcxSerializedConnection,
} from '../../../__mocks__/static-data'

function props(claimOfferStatus, noConnections) {
  let connectionsData = {
    '3nj819kkjywdppuje79': {
      identifier: '3nj819kkjywdppuje79',
      name: 'Test Connection',
      senderDID: '70075yyojywdppuje79',
      senderEndpoint: '34.216.340.155:3000',
      size: 100,
      logoUrl: 'https://logourl.com/logo.png',
      vcxSerializedConnection,
      publicDID: null,
      ...myPairWiseConnectionDetails,
    },
  }

  if (noConnections) {
    connectionsData = {}
  }

  return {
    navigation: getNavigation(),
    unSeenMessagesCount: 0,
    environmentName: SERVER_ENVIRONMENT.PROD,
    onNewConnectionSeen: jest.fn(),
    getUnacknowledgedMessages: jest.fn(),
    messageDownloadStatus: GET_MESSAGES_SUCCESS,
    snackError: null,
    connections: [
      {
        logoUrl: '',
        status: '',
        senderName: '',
        credentialName: '',
        date: '',
        index: new Number(1),
        newBadge: true,
        questionTitle: '',
        senderDID: '',
        type: '',
      },
    ],
    hasNoConnection: true,
  }
}

describe('<MyConnectionsScreen />', () => {
  const store = getStore()

  jest.useFakeTimers()
  // TODO:KS These tests are not useful at all
  // this functionality has been removed a long time ago
  // and since these tests are just snapshot tests
  // we did not remove tests and updated snapshots
  // we should remove these tests and write tests
  // that tests functionality of home screen
  it('should render MyConnections and redirect user to claim offer modal', () => {
    const myConnectionsProps = props(false, true)
    const wrapper = renderer
      .create(
        <Provider store={store}>
          <MyConnectionsScreen {...myConnectionsProps} />
        </Provider>
      )
      .toJSON()
    expect(wrapper).toMatchSnapshot()
  })

  it('should render MyConnections and show introductory text', () => {
    const myConnectionsProps = props(false, false)
    myConnectionsProps.connections = []
    const wrapper = renderer
      .create(
        <Provider store={store}>
          <MyConnectionsScreen {...myConnectionsProps} />
        </Provider>
      )
      .toJSON()
    expect(wrapper).toMatchSnapshot()
  })
})
