// @flow

import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import merge from 'lodash.merge'

import { OpenIdConnectScreen } from '../open-id-connect-screen'
import { getNavigation, mockConnection1 } from '../../../__mocks__/static-data'
import { mockOpenIdConnectRequest1 } from '../../../__mocks__/data/open-id-connect-mock-data'
import { OPEN_ID_CONNECT_STATE } from '../open-id-connect-actions'

describe('<OpenIdConnectScreen />', () => {
  it('should match in progress state', () => {
    // create deep copy of open id request
    const mockOpenIdConnectRequest = merge({}, mockOpenIdConnectRequest1)
    // set state to progress
    mockOpenIdConnectRequest.state = OPEN_ID_CONNECT_STATE.YES_SEND_IN_PROGRESS

    const { component } = setup(mockOpenIdConnectRequest)
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match in success state', () => {
    // create deep copy of open id request
    const mockOpenIdConnectRequest = merge({}, mockOpenIdConnectRequest1)
    // set state to success
    mockOpenIdConnectRequest.state = OPEN_ID_CONNECT_STATE.YES_SEND_SUCCESS

    const { component } = setup(mockOpenIdConnectRequest)
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match in fail state', () => {
    // create deep copy of open id request
    const mockOpenIdConnectRequest = merge({}, mockOpenIdConnectRequest1)
    // set state to fail
    mockOpenIdConnectRequest.state = OPEN_ID_CONNECT_STATE.YES_SEND_FAIL

    const { component } = setup(mockOpenIdConnectRequest)
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match in received state', () => {
    const { component } = setup()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match in signature verification failed', () => {
    // create deep copy of open id request
    const mockOpenIdConnectRequestNoSignature = merge(
      {},
      mockOpenIdConnectRequest1
    )
    // remove signature so that signature verification fails
    mockOpenIdConnectRequestNoSignature.oidcAuthenticationRequest.jwtAuthenticationRequest.encodedSignature = null

    const { component } = setup(mockOpenIdConnectRequestNoSignature)
    expect(component.toJSON()).toMatchSnapshot()
  })

  function getProps(extraProps: ?Object = {}) {
    return {
      request: merge({}, mockOpenIdConnectRequest1, extraProps),
      connection: mockConnection1,
      navigation: {
        ...getNavigation(),
      },
      dispatch: jest.fn(),
      route: {
        params: {
          oidcAuthenticationRequest:
            mockOpenIdConnectRequest1.oidcAuthenticationRequest,
        },
      },
    }
  }

  function setup(extraProps: ?Object = {}) {
    const props = getProps(extraProps)
    const component = renderer.create(<OpenIdConnectScreen {...props} />)

    return { component, props }
  }
})
