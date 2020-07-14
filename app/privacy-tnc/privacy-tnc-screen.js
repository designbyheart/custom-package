// @flow
import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'

import type { PrivacyTNCProps, PrivacyTNCState } from './type-privacy-tnc'
import type { CustomError, ReactNavigation } from '../common/type-common'

import {
  TermsAndConditionsTitle,
  TermsAndConditionUrl,
  PrivacyPolicyTitle,
  PrivacyPolicyUrl,
  localPrivacyPolicySource,
} from '../common/privacyTNC-constants'
import { OrangeLoader } from '../components/loader-gif/loader-gif'
import { localEulaSource } from '../eula/type-eula'
import { privacyTNCRoute } from '../common'
import { headerNavigationOptions } from '../navigation/navigation-header-config'

export class PrivacyTNC extends PureComponent<
  PrivacyTNCProps,
  PrivacyTNCState
> {
  static INFO_TYPE = {
    PRIVACY: { url: PrivacyPolicyUrl, title: PrivacyPolicyTitle },
    TNC: { url: TermsAndConditionUrl, title: TermsAndConditionsTitle },
  }

  state = {
    error: null,
  }

  onError = (error: CustomError) => {
    this.setState({ error })
  }

  render() {
    let webViewUri =
      this.props.route.params?.url ?? PrivacyTNC.INFO_TYPE.PRIVACY.url
    const isTNC = webViewUri === PrivacyTNC.INFO_TYPE.TNC.url

    if (this.state.error) {
      webViewUri = isTNC ? localEulaSource : localPrivacyPolicySource
    }

    return (
      <WebView
        source={{ uri: webViewUri }}
        startInLoadingState={true}
        renderLoading={renderLoader}
        onError={this.onError}
        renderError={renderError}
      />
    )
  }
}

function renderLoader() {
  return <View style={styles.container}>{OrangeLoader}</View>
}

function renderError() {
  return <View />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export const privacyTNCScreen = {
  routeName: privacyTNCRoute,
  screen: PrivacyTNC,
  options({ navigation, route }: *) {
    return headerNavigationOptions({ title: route.params.title })
  },
}
