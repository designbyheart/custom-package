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
} from './type-backup'
import type { Store } from '../store/type-store'

import { HAS_VERIFIED_RECOVERY_PHRASE } from './type-backup'
import { CustomView, Icon, CustomHeader } from '../components'
import {
  verifyRecoveryPhraseRoute,
  exportBackupFileRoute,
  selectRecoveryMethodRoute,
} from '../common'
import { color } from '../common/styles/constant'
import styles from './styles'
import {
  VERIFY_BACK_TEST_ID,
  VERIFY_CLOSE_TEST_ID,
  VERIFY_CONTAINER_TEST_ID,
  VERIFY_INPUT_PLACEHOLDER,
} from './backup-constants'
import { PASSPHRASE_SALT_STORAGE_KEY } from '../common/secure-storage-constants'
import { pinHash as generateKey } from '../lock/pin-hash'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import VerifyPhrase from '../components/backup-restore-passphrase/backup-restore-passphrase'
import { getBackupPassphrase } from '../store/store-selector'
import { withStatusBar } from '../components/status-bar/status-bar'
import {
  hasVerifiedRecoveryPhrase,
  generateBackupFile,
} from '../backup/backup-store'
import { safeSet, walletSet } from '../services/storage'

const transparentBands = require('../images/transparentBands2.png')
const backImage = require('../images/icon_backArrow_white.png')
const closeImage = require('../images/iconClose.png')

export class VerifyRecoveryPhrase extends Component<
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
            onPress={() => goBack(null)}
            testID={VERIFY_BACK_TEST_ID}
            iconStyle={[styles.headerBackIcon]}
            src={backImage}
          />
        </CustomView>
      </CustomHeader>
    ),
    gesturesEnabled: false,
  })

  verifyRecoveryPhrase = async (passphrase: string) => {
    const cleanedPassphrase = passphrase
      .replace(/\s\s+/g, ' ')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .toLowerCase()
      .trim()
    const { recoveryPassphrase } = this.props
    const { initialRoute } = this.props.navigation.state.params

    const hashedPassphrase: string | null = await generateKey(
      cleanedPassphrase,
      this.props.recoveryPassphrase.salt
    )

    if (recoveryPassphrase.hash === hashedPassphrase) {
      if (this.props.isCloudBackupEnabled) {
        this.props.navigation.navigate(selectRecoveryMethodRoute, {
          initialRoute,
        })
      } else {
        this.props.hasVerifiedRecoveryPhrase()
        this.props.generateBackupFile()
        try {
          walletSet(HAS_VERIFIED_RECOVERY_PHRASE, 'true')
          safeSet(HAS_VERIFIED_RECOVERY_PHRASE, 'true')
        } catch (e) {
        } finally {
          this.props.navigation.navigate(exportBackupFileRoute, {
            initialRoute,
          })
        }
      }
      this.setState({ error: false })
    } else {
      this.setState({ error: true })
    }

    Keyboard.dismiss()
  }

  componentWillUnmount = () => {
    this.setState({ error: false })
  }

  render() {
    // TODO: Add error UI when that is designed
    return (
      <VerifyPhrase
        testID={VERIFY_CONTAINER_TEST_ID}
        placeholder={VERIFY_INPUT_PLACEHOLDER}
        onSubmit={this.verifyRecoveryPhrase}
        errorState={this.state.error}
      />
    )
  }
}

const mapStateToProps = (state: Store) => {
  return {
    recoveryPassphrase: getBackupPassphrase(state),
    isCloudBackupEnabled: false,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      hasVerifiedRecoveryPhrase,
      generateBackupFile,
    },
    dispatch
  )

export default createStackNavigator({
  [verifyRecoveryPhraseRoute]: {
    screen: withStatusBar({ color: color.bg.twelfth.color })(
      connect(mapStateToProps, mapDispatchToProps)(VerifyRecoveryPhrase)
    ),
  },
})
