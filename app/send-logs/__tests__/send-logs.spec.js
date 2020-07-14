// @flow

import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { SendLogs } from '../send-logs'
import { getStore } from '../../../__mocks__/static-data'
import { getNavigation } from '../../../__mocks__/static-data'

import type {} from '../type-send-logs'

describe('send logs screen', () => {
  const props = {
    navigation: getNavigation(),
    environmentName: 'DEMO',
    logIsEncrypted: false,
    route: {},
  }

  it('should render properly and snapshot should match', () => {
    const tree = renderer.create(<SendLogs {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
