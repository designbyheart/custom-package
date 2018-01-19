// @flow
import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { LockAuthorization } from '../lock-authorization'
import { getNavigation, getStore } from '../../../__mocks__/static-data'

describe('<LockAuthorization />', () => {
  function getProps() {
    return {
      onSuccess: jest.fn(),
      onFail: jest.fn(),
      navigation: {
        ...getNavigation({ onSuccess: jest.fn(), onFail: jest.fn() }),
      },
    }
  }

  let component
  let props
  let store
  let componentInstance

  beforeEach(() => {
    props = getProps()
    store = getStore()
    component = renderer.create(
      <Provider store={store}>
        <LockAuthorization {...props} />
      </Provider>
    )
    componentInstance = component.getInstance()._reactInternalInstance.child
      .stateNode
  })

  it('should match snapshot', () => {
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('go back and call success onSuccess', () => {
    componentInstance.onSuccess()
    expect(props.navigation.goBack).toHaveBeenCalled()
    // Ignoring flow error inside test, we need to create type
    // that understand return type for navigation props
    expect(
      props.navigation.state &&
        props.navigation.state.params &&
        // $FlowFixMe
        props.navigation.state.params.onSuccess
    ).toHaveBeenCalled()
  })

  it('go back and call fail for onFail', () => {
    componentInstance.onClose()
    expect(props.navigation.goBack).toHaveBeenCalled()
    expect(
      // $FlowFixMe
      props.navigation.state && props.navigation.state.params.onFail
    ).toHaveBeenCalled()
  })
})