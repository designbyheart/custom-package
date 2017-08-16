import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import UserInfoAvatarSection from '../user-info-avatar-section'

function props() {
  return {
    sendUserInfo: jest.fn(),
    config: {
      isHydrated: true,
      isAlreadyInstalled: false,
      agencyUrl: 'https://agency.evernym.com',
      callCenterUrl: 'https://cua.culedger.com',
    },
  }
}

describe('user avatar section info', () => {
  it('should render properly', () => {
    const component = renderer.create(<UserInfoAvatarSection {...props} />)
    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
