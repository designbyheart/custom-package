// @flow
import React, { Component, PureComponent } from 'react'
import EnterPassphrase from '../components/backup-restore-passphrase/backup-restore-passphrase'
import { StackNavigator } from 'react-navigation'
import { color } from '../common/styles/constant'
import { restorePassphraseRoute } from '../common'
import { Alert } from 'react-native'

export class RestorePassphrase extends Component<*, void> {
  static navigationOptions = {
    headerStyle: {
      backgroundColor: color.bg.twelfth.color,
      borderBottomWidth: 0,
      elevation: 0,
    },
    gesturesEnabled: false,
  }

  submitPhrase = () => {}
  textPhraseInput = (txt: string) => {}
  render() {
    const filename =
      this.props.navigation.state.params &&
      this.props.navigation.state.params.filename
    return (
      <EnterPassphrase
        testID={'restore-encrypt-phrase'}
        onSubmit={this.submitPhrase}
        onChangeText={this.textPhraseInput}
        placeholder={'Enter recovery phrase here'}
        filename={filename}
      />
    )
  }
}

export default StackNavigator({
  [restorePassphraseRoute]: {
    screen: RestorePassphrase,
  },
})
