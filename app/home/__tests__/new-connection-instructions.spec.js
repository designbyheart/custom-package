// @flow

import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { NewConnectionInstructions } from '../new-connection-instructions'

describe('<NewConnectionInstructions />', () => {
  it('should match snapshot', () => {
    const component = renderer.create(<NewConnectionInstructions />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
