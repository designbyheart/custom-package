// @flow
import React from 'react'
import renderer from 'react-test-renderer'
import { CloudBackup } from '../cloud-backup'
import { getNavigation } from '../../../__mocks__/static-data'
import { cloudBackupRoute } from '../../common'

describe('<CloudBackup />', () => {
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
        initialRoute: cloudBackupRoute,
      },
      index: 1,
      key: 'Some Key',
      routeName: 'Route Name',
      routes: [],
    },
    addListener: jest.fn(),
    dangerouslyGetParent: jest.fn(),
    dispatch: jest.fn(),
    getParam: jest.fn(),
    isFocused: jest.fn(),
    setParams: jest.fn(),
  }

  const restoreStore = {
    status: 'ZIP_FILE_SELECTED',
    error: {
      code: 'Error Code',
      message: 'Error Message',
    },
    restoreFile: {
      fileName: 'File Name',
      fileSize: 100,
      type: 'File Type',
      uri: 'uri',
    },
  }

  function props() {
    return {
      navigation: navigation,
      resetCloudBackupStatus: jest.fn(),
      cloudBackup: jest.fn(),
      cloudBackupStatus: jest.fn(),
      error: 'error message',
      message: 'message',
      restore: restoreStore,
      route: 'restoreWaitRoute',
      saveFileToAppDirectory: jest.fn(),
      setAutoCloudBackupEnabled: jest.fn(),
      updateStatusBarTheme: jest.fn(),
      connectionHistoryBackedUp: jest.fn(),
    }
  }

  it('should match snapshot', () => {
    const tree = renderer.create(<CloudBackup {...props()} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})