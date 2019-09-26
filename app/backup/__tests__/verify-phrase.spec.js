// @flow

import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { VerifyRecoveryPhrase } from '../verify-phrase'
import { getNavigation, getStore } from '../../../__mocks__/static-data'
import { settingsRoute } from '../../common'

describe('<VerifyRecoveryPhrase />', () => {
  const recoveryPassphrase = 'hello some passphrase'

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
    getParam: jest.fn(),
    state: {
      params: {
        recoveryPassphrase,
        initialRoute: settingsRoute,
      },
    },
  }

  const mockStoreData = getStore()

  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <Provider store={mockStoreData}>
          <VerifyRecoveryPhrase
            recoveryPassphrase={{
              phrase: recoveryPassphrase,
              salt: 'salt',
              hash: 'hash',
            }}
            navigation={navigation}
            hydrateCloudBackup={jest.fn()}
            submitPassphrase={() => {}}
            restoreStatus={() => {}}
            resetError={() => {}}
            error={false}
            status="none"
          />
        </Provider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
