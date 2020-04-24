// @flow

import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from 'react-navigation'

import {
  selectRecoveryMethodRoute,
  exportBackupFileRoute,
  settingsRoute,
  cloudBackupRoute,
} from '../common'
import { withStatusBar } from '../components/status-bar/status-bar'
import type {
  ReactNavigationBackup,
  SelectRecoveryMethodProps,
} from './type-backup'

import {
  Container,
  CustomView,
  CustomText,
  Icon,
  CustomButton,
  CustomHeader,
} from '../components'
import { color } from '../common/styles/constant'
import styles from './styles'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  hasVerifiedRecoveryPhrase,
  generateBackupFile,
} from '../backup/backup-store'
import { safeSet, secureSet, walletSet } from '../services/storage'
import { HAS_VERIFIED_RECOVERY_PHRASE } from './type-backup'
const closeImage = require('../images/icon-Close.png')
const backup = require('../images/upload13x.png')
const download = require('../images/download3x.png')

export class SelectRecoveryMethod extends Component<
  // ReactNavigationBackup,
  SelectRecoveryMethodProps,
  void
> {
  static navigationOptions = ({
    navigation: { navigate, state: { params } },
  }: ReactNavigationBackup) => ({
    header: (
      <CustomHeader
        backgroundColor={color.bg.fifth.color}
        largeHeader
        flatHeader
      >
        <CustomView style={[styles.headerSpacer]} />
        <CustomView style={[styles.headerSpacer]}>
          <Icon
            mediumLarge
            onPress={() => navigate(settingsRoute)}
            iconStyle={[styles.headerIcon]}
            src={closeImage}
          />
        </CustomView>
      </CustomHeader>
    ),
    gesturesEnabled: false,
  })

  componentDidMount() {
    this.props.hasVerifiedRecoveryPhrase()
    walletSet(HAS_VERIFIED_RECOVERY_PHRASE, 'true')
    safeSet(HAS_VERIFIED_RECOVERY_PHRASE, 'true')
  }

  backup = () => {
    this.props.generateBackupFile()
    const { initialRoute } = this.props.navigation.state.params
    this.props.navigation.navigate(exportBackupFileRoute, {
      initialRoute,
    })
  }
  cloudBackup = () => {
    this.props.navigation.navigate(cloudBackupRoute, {
      fromToggleAction: false,
    })
  }
  render() {
    return (
      <Container style={[styles.selectRecoveryMethod]}>
        <CustomView center>
          <CustomText transparentBg center style={[styles.backuptitle]}>
            Select your backup method
          </CustomText>
        </CustomView>
        <Container spaceBetween style={[styles.selectContainer]}>
          <CustomView
            onPress={this.cloudBackup}
            spaceAround
            center
            style={[styles.selectMethod, { backgroundColor: '#86B93B' }]}
          >
            <Icon iconStyle={[{ marginBottom: 10 }]} mediumLarge src={backup} />
            <CustomText center transparentBg style={[styles.title2]}>
              Cloud Backup
            </CustomText>
            <CustomText
              size="14"
              center
              transparentBg
              style={{ color: 'white' }}
            >
              Store an encrypted, anonymous backup of Connect.Me in the Evernym
              Cloud. You will need your Recovery Phrase and a fresh Connect.Me
              installation to restore.
            </CustomText>
          </CustomView>
          <CustomView center>
            <CustomText primary transparentBg center style={[styles.title1]}>
              or
            </CustomText>
          </CustomView>
          <CustomView
            onPress={this.backup}
            spaceAround
            secondary
            center
            style={[styles.selectMethod]}
          >
            <Icon
              mediumLarge
              iconStyle={[{ marginBottom: 10 }]}
              src={download}
            />
            <CustomText transparentBg center style={[styles.title2]}>
              Downloaded .zip Backup
            </CustomText>
            <CustomText
              size="14"
              transparentBg
              center
              style={[{ color: 'white' }]}
            >
              Manually choose where to store your backup file. You will need
              your Recovery Phrase, a fresh install of Connect.Me and your
              backup .zip file on the device you wish to restore to.
            </CustomText>
          </CustomView>
        </Container>
      </Container>
    )
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
  [selectRecoveryMethodRoute]: {
    screen: withStatusBar({ color: 'white' })(
      connect(null, mapDispatchToProps)(SelectRecoveryMethod)
    ),
  },
})
