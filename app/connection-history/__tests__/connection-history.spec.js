// @flow
import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { ConnectionHistory } from '../connection-history'
import { color } from '../../common/styles'
import {
  getStore,
  getNavigation,
  mockConnection1,
  connectionHistory,
  activeConnectionThemePrimary,
  activeConnectionThemeSecondary,
} from '../../../__mocks__/static-data'

describe('<ConnectionHistory />', () => {
  const store = getStore()

  function getProps() {
    return {
      navigation: getNavigation({
        image: 'https://test.com/image.png',
        senderName: 'Evernym',
      }),
      activeConnectionThemePrimary,
      activeConnectionThemeSecondary,
      connectionHistory,
      connection: mockConnection1,
      claimMap: undefined,
      updateStatusBarTheme: () => {},
      deleteConnectionAction: jest.fn(),
      goToUIScreen: jest.fn(),
    }
  }

  it('should ConnectionHistory render properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ConnectionHistory {...getProps()} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })
})
