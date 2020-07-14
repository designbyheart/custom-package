// @flow
import React, { PureComponent } from 'react'

import type { RequestDetailProps } from './type-request'

import { Container } from '../layout/container'
import { CustomView } from '../layout/custom-view'
import CustomText from '../text'
import { RequestDetailText } from './request-detail-text'
import RequestDetailAvatars from './request-detail-avatars'

export default class RequestDetail extends PureComponent<
  RequestDetailProps,
  void
> {
  render() {
    const { testID } = this.props
    return (
      <Container useNativeDriver hCenter testID={`${testID}-text-container`}>
        <Container bottom testID={`${testID}-text-message-container`}>
          <RequestDetailText
            title={this.props.title}
            message={this.props.message}
            testID={testID}
          />
        </Container>
        <Container testID={`${testID}-text-container-avatars`}>
          <RequestDetailAvatars
            senderName={this.props.senderName}
            senderLogoUrl={this.props.senderLogoUrl}
          />
        </Container>
      </Container>
    )
  }
}
