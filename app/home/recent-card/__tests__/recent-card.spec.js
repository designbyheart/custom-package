// @flow
import React from 'react'
import renderer from 'react-test-renderer'
import 'react-native'

import { RecentCard } from '../recent-card'

describe('<RecentCard />', () => {
  it('should render RecentCard component and match snapshot', () => {
    const component = renderer
      .create(
        <RecentCard
          timestamp="2020-03-15T15:57:54+01:00"
          statusMessage="You have been issued a 'Name'."
          issuerName="Evernym QA-RC"
          logoUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjimxZbcvZzPcPvHd_y7f0tc5d8QoC9DOPecb8JTOChmS1IoDq"
          status="CONNECTED"
        />
      )
      .toJSON()
    expect(component).toMatchSnapshot()
  })
})
