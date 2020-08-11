// @flow

import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { NewCredentialInstructions } from '../new-credential-instructions'

describe('<NewCredentialInstructions />', () => {
  it('should match snapshot', () => {
    const component = renderer.create(
      <NewCredentialInstructions usingProductionNetwork={true} />
    )
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot for test network', () => {
    const component = renderer.create(
      <NewCredentialInstructions usingProductionNetwork={false} />
    )
    expect(component.toJSON()).toMatchSnapshot()
  })
})
