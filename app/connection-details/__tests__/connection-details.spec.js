// @flow
import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import ConnectionDetails from '../connection-details'
import {
  getStore,
  senderLogoUrl,
  claimMap,
  activeConnectionThemePrimary,
  getNavigation,
} from '../../../__mocks__/static-data'

describe('<ConnectionDetails />', () => {
  const store = getStore()
  function props(senderdid: string) {
    return {
      navigation: {
        state: {
          params: {
            senderDID: senderdid,
            senderName: 'jim',
            image: 'https://robothash.com/logo.png',
          },
        },
        getParam: jest.fn(),
      },
    }
  }

  it('should ConnectionDetails render CONNECTED properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ConnectionDetails {...props('senderDID3')} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })

  it('should ConnectionDetails render SHARED properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ConnectionDetails {...props('senderDID4')} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })

  it('should ConnectionDetails render PENDING properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ConnectionDetails {...props('senderDID5')} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })

  it('should ConnectionDetails render PROOF RECEIVED properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ConnectionDetails {...props('senderDID6')} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })

  it('should ConnectionDetails render RECEIVED properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ConnectionDetails {...props('senderDID7')} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })

  it('should ConnectionDetails render CLAIM OFFER RECEIVED properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ConnectionDetails {...props('senderDID8')} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })
})
