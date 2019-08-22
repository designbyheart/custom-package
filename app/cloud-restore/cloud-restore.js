// @flow

import React, { Component } from 'react'
import { Dimensions, Keyboard } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type {
  VerifyRecoveryPhraseProps,
  VerifyRecoveryPhraseState,
  ReactNavigationBackup,
} from '../backup/type-backup'
import type { Store } from '../store/type-store'

import { CustomView, Icon, CustomHeader } from '../components'
import {
  cloudRestoreModalRoute,
  exportBackupFileRoute,
  selectRecoveryMethodRoute,
  cloudRestoreRoute,
  selectRestoreMethodRoute,
} from '../common'
import { color } from '../common/styles/constant'
import styles from '../backup/styles'
import {
  VERIFY_BACK_TEST_ID,
  VERIFY_CLOSE_TEST_ID,
  VERIFY_CONTAINER_TEST_ID,
  VERIFY_INPUT_PLACEHOLDER,
} from '../backup/backup-constants'
import { PASSPHRASE_SALT_STORAGE_KEY } from '../common/secure-storage-constants'
import { pinHash as generateKey } from '../lock/pin-hash'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import EnterPassphrase from '../components/backup-restore-passphrase/backup-restore-passphrase'
import { getBackupPassphrase } from '../store/store-selector'
import { withStatusBar } from '../components/status-bar/status-bar'
import { submitPassphrase, resetError } from './cloud-restore-store'

const transparentBands = require('../images/transparentBands2.png')
const backImage = require('../images/icon_backArrow_white.png')
const closeImage = require('../images/iconClose.png')

export class CloudRestore extends Component<
  VerifyRecoveryPhraseProps,
  VerifyRecoveryPhraseState
> {
  state = {
    error: false,
  }

  static navigationOptions = ({
    navigation: { goBack, navigate, state },
  }: ReactNavigationBackup) => ({
    header: (
      <CustomHeader
        backgroundColor={color.bg.twelfth.color}
        largeHeader
        flatHeader
      >
        <CustomView style={[styles.headerSpacer]}>
          <Icon
            medium
            onPress={() => navigate(selectRestoreMethodRoute)}
            testID={VERIFY_BACK_TEST_ID}
            iconStyle={[styles.headerBackIcon]}
            src={backImage}
          />
        </CustomView>

        <CustomView style={[styles.headerSpacer]}>
          <Icon
            medium
            onPress={() => navigate(selectRestoreMethodRoute)}
            testID={VERIFY_CLOSE_TEST_ID}
            iconStyle={[styles.headerIcon]}
            src={closeImage}
          />
        </CustomView>
      </CustomHeader>
    ),
    gesturesEnabled: false,
  })

  verifyRecoveryPhrase = async (passphrase: string) => {
    // IMPORTANT: Because of the way that event.nativeEvent works, the nativeEvent property
    // of event will be null if you invoke event.nativeEvent after the await calls below
    const passphraseFromUser = passphrase
    //////////////////////////////////////////////////////////////////////////////////////////////

    this.props.submitPassphrase(passphraseFromUser)
    this.props.navigation.navigate(cloudRestoreModalRoute)
    Keyboard.dismiss()
  }

  componentWillUnmount = () => {
    this.setState({ error: false })
    // reset error on cloudRestore
    this.props.resetError()
  }

  render() {
    // TODO: Add error UI when that is designed
    return (
      <EnterPassphrase
        testID={VERIFY_CONTAINER_TEST_ID}
        placeholder={VERIFY_INPUT_PLACEHOLDER}
        onSubmit={this.verifyRecoveryPhrase}
        errorState={this.props.error}
        isCloudRestoreAttempt={true}
      />
    )
  }
}

const mapStateToProps = (state: Store) => {
  return {
    recoveryPassphrase: getBackupPassphrase(state),
    error: state.cloudRestore.error,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators({ submitPassphrase, resetError }, dispatch)

export default createStackNavigator({
  [cloudRestoreRoute]: {
    screen: withStatusBar({ color: color.bg.twelfth.color })(
      connect(mapStateToProps, mapDispatchToProps)(CloudRestore)
    ),
  },
})
