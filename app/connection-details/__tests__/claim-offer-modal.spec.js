// @flow
import React, { PureComponent } from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { Animated } from 'react-native'
import ClaimOfferModal from '../components/claim-offer-modal'
import {
  getStore,
  senderLogoUrl,
  claimMap,
  activeConnectionThemePrimary,
} from '../../../__mocks__/static-data'

describe('<ClaimOfferModal />', () => {
  const store = getStore()
  function props() {
    return {
      navigation: {
        state: {
          params: {
            uid: 'claimOfferUid',
          },
        },
      },
      runAnimation: false,
    }
  }

  it('should ClaimOfferModal render properly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <ClaimOfferModal {...props()} />
      </Provider>
    )
    expect(component).toMatchSnapshot()
  })
})
