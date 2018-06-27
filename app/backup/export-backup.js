// @flow

import React, { PureComponent } from 'react'
import { Platform, Image, Dimensions, View } from 'react-native'
import { StackNavigator } from 'react-navigation'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  Container,
  CustomView,
  CustomText,
  Icon,
  CustomButton,
} from '../components'
import { exportBackupFileRoute, backupCompleteRoute } from '../common'
import { SHORT_DEVICE, VERY_SHORT_DEVICE } from '../common/styles'
import { color } from '../common/styles/constant'
import type { ExportBackupFileProps } from './type-backup'
import styles from './styles'
import { walletBackupShare } from '../wallet/wallet-store'
import type { Store } from '../store/type-store'
import {
  EXPORT_BACKUP_BACK_TEST_ID,
  EXPORT_BACKUP_CLOSE_TEST_ID,
  EXPORT_BACKUP_SUBMIT_BUTTON_TEST_ID,
  EXPORT_BACKUP_BUTTON_TITLE,
} from './backup-constants'

const { height } = Dimensions.get('window')
const transparentBands = require('../images/transparentBands.png')
const backImage = require('../images/icon_backArrow_white.png')
const closeImage = require('../images/iconClose.png')
const encryptedFile = require('../images/encryptedFile.png')

export class ExportBackupFile extends PureComponent<
  ExportBackupFileProps,
  void
> {
  parseFilePath = (path: string) => {
    if (path) {
      const beginning = path.lastIndexOf('/') + 1
      const end = path.length

      return path.slice(beginning, end)
    }

    return 'backup.zip'
  }

  componentDidUpdate(prevProps: ExportBackupFileProps) {
    const { navigation: { navigate, state, goBack } } = this.props
    if (
      prevProps.backupStatus !== 'SUCCESS' &&
      this.props.backupStatus === 'SUCCESS'
    ) {
      goBack(null)
      navigate(backupCompleteRoute, {
        initialRoute: state.params.initialRoute,
      })
    }
  }

  encryptAndBackup = () => {
    const { backupPath } = this.props

    this.props.walletBackupShare(backupPath)
  }

  static navigationOptions = ({ navigation: { goBack, navigate, state } }) => ({
    headerLeft: (
      <CustomView style={[styles.headerSpacer]}>
        <Icon
          medium
          onPress={() => goBack(null)}
          testID={EXPORT_BACKUP_BACK_TEST_ID}
          iconStyle={[styles.headerBackIcon]}
          src={backImage}
        />
      </CustomView>
    ),
    headerRight: (
      <CustomView style={[styles.headerSpacer]}>
        <Icon
          medium
          onPress={() => navigate(state.params.initialRoute)}
          testID={EXPORT_BACKUP_CLOSE_TEST_ID}
          iconStyle={[styles.headerIcon]}
          src={closeImage}
        />
      </CustomView>
    ),
    headerStyle: {
      backgroundColor: color.bg.thirteenth.color,
      borderBottomWidth: 0,
      shadowOpacity: 0,
      shadowOffset: {
        height: 0,
      },
      shadowRadius: 0,
      borderBottomWidth: 0,
      elevation: 0,
    },
    gesturesEnabled: true,
  })

  render() {
    return (
      <Container style={[styles.exportBackup]} safeArea>
        <Image source={transparentBands} style={[styles.backgroundImage]} />
        <Container style={[styles.wrapper]}>
          <CustomView center>
            <CustomText transparentBg center style={[styles.exportBackupTitle]}>
              Export Your Encrypted Backup File
            </CustomText>
          </CustomView>
          <CustomView
            center
            verticalSpace={height > VERY_SHORT_DEVICE ? true : false}
          >
            <CustomText
              center
              transparentBg
              style={[styles.exportBackupMainText]}
            >
              You will need your recovery phrase to unlock this backup file.
            </CustomText>
          </CustomView>
          <CustomView
            center
            verticalSpace={height > VERY_SHORT_DEVICE ? true : false}
          >
            <CustomText
              center
              transparentBg
              style={[styles.exportBackupMainText]}
            >
              Don’t worry, only you can decrypt the backup with your recovery
              phrase.
            </CustomText>
          </CustomView>

          <CustomView center style={[styles.lockIconImage]}>
            <Image source={encryptedFile} style={[styles.imageIcon]} />
          </CustomView>
          <CustomView center>
            <CustomText center transparentBg style={[styles.exportBackupFile]}>
              {this.parseFilePath(this.props.backupPath)}
            </CustomText>
          </CustomView>
        </Container>

        <CustomView>
          <CustomView center>
            <CustomText
              center
              transparentBg
              bold
              style={[styles.exportBackupSmallMessage]}
            >
              This backup contains all your data in Connect.Me. Store it
              somewhere safe.
            </CustomText>
          </CustomView>
          <CustomButton
            large={height > SHORT_DEVICE ? true : false}
            onPress={this.encryptAndBackup}
            testID={EXPORT_BACKUP_SUBMIT_BUTTON_TEST_ID}
            style={[styles.submitButton]}
            customColor={{
              color: color.bg.thirteenth.color,
              fontWeight: '600',
              fontSize: 18,
            }}
            title={EXPORT_BACKUP_BUTTON_TITLE}
          />
        </CustomView>
      </Container>
    )
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators({ walletBackupShare }, dispatch)

const mapStateToProps = (state: Store) => {
  return {
    backupStatus: state.wallet.backup.status,
    backupPath: state.wallet.backup.backupPath,
  }
}

export default StackNavigator({
  [exportBackupFileRoute]: {
    screen: connect(mapStateToProps, mapDispatchToProps)(ExportBackupFile),
  },
})