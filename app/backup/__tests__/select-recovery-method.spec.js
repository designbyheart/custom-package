// @flow
import React from 'react'
import renderer from 'react-test-renderer'
import { SelectRecoveryMethod } from '../select-recovery-method'
import { getNavigation } from '../../../__mocks__/static-data'
import { selectRecoveryMethodRoute } from '../../common'

describe('<SelectRecoveryMethod />', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),

    state: {
      params: {
        initialRoute: selectRecoveryMethodRoute,
      },
    },
  }

  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <SelectRecoveryMethod
          navigation={navigation}
          hydrateCloudBackup={jest.fn()}
          hasVerifiedRecoveryPhrase={jest.fn()}
          generateBackupFile={jest.fn()}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
