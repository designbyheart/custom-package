// @flow
import React from 'react'
import renderer from 'react-test-renderer'
import 'react-native'

import { getNavigation } from '../../../../__mocks__/static-data'
import { NewBannerCard } from '../new-banner-card'
import { claimOfferRoute } from '../../../common'

describe('<NewBannerCard />', () => {
  const navigation = getNavigation()

  it('should render NewBannerCard component and match snapshot', () => {
    const component = renderer
      .create(
        <NewBannerCard
          navigation={navigation}
          navigationRoute={claimOfferRoute}
          timestamp="2020-03-15T15:57:54+01:00"
          logoUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjimxZbcvZzPcPvHd_y7f0tc5d8QoC9DOPecb8JTOChmS1IoDq"
          uid="MGEwNzg"
          issuerName="Evernym QA-RC"
        />
      )
      .toJSON()
    expect(component).toMatchSnapshot()
  })
})
