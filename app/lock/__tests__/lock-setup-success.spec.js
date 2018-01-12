// @flow
import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { LockSetupSuccess } from '../lock-setup-success'
import { lockSetupSuccessRoute } from '../../common'

describe('<LockSetupSuccess />', () => {
  const getProps = (isFetchingInvitation = false) => ({
    isFetchingInvitation,
    navigation: {
      state: {},
      navigate: jest.fn(),
    },
  })
  const options = {
    createNodeMock: element => {
      return {
        clear: () => {
          cleared = true
        },
      }
    },
  }
  let component
  let props

  it('should render Lock setup success Screen', () => {
    props = getProps(false)
    component = renderer.create(<LockSetupSuccess {...props} />, options)
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should display Loading while fetching the invitation', () => {
    props = getProps(true)
    component = renderer.create(<LockSetupSuccess {...props} />, options)
    expect(component.toJSON()).toMatchSnapshot()
  })
})