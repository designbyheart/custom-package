// @flow
import React, { Component, PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native'
import { Container, CustomView, CustomText } from '../index'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { color } from '../../common/styles/constant'
import {
  isBiggerThanShortDevice,
  errorBoxVerifyPassphraseContainer,
  inputBoxVerifyPassphraseHeight,
  dangerBannerHeight,
} from '../../common/styles/constant'
import type { BackupRestorePassphraseProps } from './type-backup-restore-passphrase'
import ErrorBanner from '../banner/banner-danger'
import { baseUrls, changeEnvironment } from '../../store/config-store'
import type { Store } from '../../store/type-store'

export class BackupRestorePassphrase extends PureComponent<
  BackupRestorePassphraseProps,
  void
> {
  submitPhrase = (event: any) => {
    let passphrase = event.nativeEvent.text.trim()
    if (passphrase.startsWith('::')) {
      const selectedEnv = passphrase.substring(2, passphrase.indexOf('::', 3))
      passphrase = passphrase.substring(passphrase.indexOf('::', 3) + 2)

      this.props.changeEnvironment(
        baseUrls[selectedEnv].agencyUrl,
        baseUrls[selectedEnv].agencyDID,
        baseUrls[selectedEnv].agencyVerificationKey,
        baseUrls[selectedEnv].poolConfig,
        baseUrls[selectedEnv].paymentMethod
      )
    }
    this.props.onSubmit(passphrase)
  }

  render() {
    const {
      isCloudRestoreAttempt,
      filename,
      testID,
      placeholder,
      errorState,
    } = this.props
    return (
      <Container
        testID={`${testID}-container`}
        style={[styles.verifyMainContainer]}
        onPress={Keyboard.dismiss}
        safeArea
      >
        <Image
          source={require('../../images/transparentBands2.png')}
          style={[styles.backgroundImageVerify]}
        />
        <KeyboardAwareScrollView extraHeight={50}>
          <Container testID={`${testID}-inputbox`}>
            <CustomView center>
              {filename || isCloudRestoreAttempt ? (
                <CustomView center>
                  <Image
                    source={require('../../images/encryptedFileGreen.png')}
                  />
                  <CustomText center transparentBg h5 style={[styles.filename]}>
                    {filename}
                  </CustomText>
                </CustomView>
              ) : (
                <CustomText transparentBg center style={[styles.title]}>
                  Verify your Recovery Phrase
                </CustomText>
              )}
            </CustomView>
            <CustomView center>
              <CustomText
                center
                transparentBg
                h5
                style={[styles.verifyMainText]}
              >
                {filename || isCloudRestoreAttempt
                  ? 'Enter the Recovery Phrase you used to create this backup.'
                  : 'To verify that you have copied down your recovery phrase correctly, please enter it below.'}
              </CustomText>
            </CustomView>
            {errorState ? (
              <ErrorBanner
                bannerTitle={'Recovery Phrase does not match!'}
                bannerSubtext={'Try entering it again or go back and verify'}
                style={[styles.dangerBannerBox]}
                testID={'verify-passphrase-error-banner'}
              />
            ) : null}
            <TextInput
              autoCapitalize="none"
              testID={`${testID}-text-input`}
              accessible={true}
              accessibilityLabel={`${testID}-text-input`}
              autoFocus={true}
              onSubmitEditing={this.submitPhrase}
              style={[styles.inputBox]}
              placeholder={placeholder}
              placeholderTextColor="white"
              autoCorrect={false}
              underlineColorAndroid="transparent"
              multiline={Platform.OS === 'ios' ? true : false}
              clearButtonMode="always"
              returnKeyType="done"
              returnKeyLabel="done"
              numberOfLines={1}
            />
          </Container>
        </KeyboardAwareScrollView>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  verifyMainContainer: {
    flex: 1,
    backgroundColor: color.bg.twelfth.color,
  },
  backgroundImageVerify: {
    flex: 1,
    position: 'absolute',
  },
  filename: {
    fontWeight: 'bold',
  },
  title: {
    fontWeight: '600',
    lineHeight: 27,
    fontSize: 22,
    marginBottom: 20,
    width: '100%',
  },
  verifyMainText: {
    paddingHorizontal: 20,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
    marginTop: isBiggerThanShortDevice ? 40 : 20,
    marginBottom: isBiggerThanShortDevice ? 40 : 20,
  },
  inputBox: {
    marginBottom: 24,
    marginRight: 20,
    marginLeft: 20,
    height: inputBoxVerifyPassphraseHeight,
    backgroundColor: 'rgba(0,0,0,0.33)',
    color: 'white',
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 20,
    fontStyle: 'italic',
  },
  dangerBannerBox: {
    marginLeft: 20,
    marginRight: 20,
    height: dangerBannerHeight,
  },
})

const mapStateToProps = (state: Store) => {
  return {}
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      changeEnvironment,
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(
  BackupRestorePassphrase
)
