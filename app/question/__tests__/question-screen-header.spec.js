// @flow

import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'

import { QuestionScreenHeader, ViewCloser } from '../question-screen-header'
import { getNavigation } from '../../../__mocks__/static-data'
import { Container } from '../../components'

describe('<QuestionScreenHeader />', () => {
  function getProps() {
    return {
      ...getNavigation(),
    }
  }

  it('should match snapshot', () => {
    const props = getProps()
    const tree = renderer
      .create(<QuestionScreenHeader navigation={props} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('click on header should trigger goBack on screen', () => {
    const props = getProps()
    const component = renderer.create(
      <QuestionScreenHeader navigation={props} />
    )
    const componentViewCloser = component.root.findAllByType(ViewCloser)
    componentViewCloser.map(viewCloser => {
      const container = viewCloser.findByType(Container)
      container.props.onPress()
    })
    expect(props.goBack).toHaveBeenCalledTimes(componentViewCloser.length)
  })
})
