// @flow
import React from 'react'

import type { ReactNavigation } from '../../common/type-common'

import { Container, CustomView } from '../../components'
import { questionStyles } from '../question-screen-style'

export class QuestionScreenHeader extends React.Component<
  QuestionScreenHeaderProps,
  void
> {
  render() {
    return (
      <Container row style={[questionStyles.headerContainer]}>
        <ViewCloser {...this.props} />
        <HeaderHandlebar />
        <ViewCloser {...this.props} />
      </Container>
    )
  }
}

// this component is used to close screen, when user taps on header
export const ViewCloser = (props: QuestionScreenHeaderProps) => (
  <Container onPress={props.onCancel} />
)

export const HeaderHandlebar = () => (
  <CustomView style={[questionStyles.headerHandleContainer]}>
    <CustomView style={[questionStyles.headerHandlebar]} />
  </CustomView>
)

type QuestionScreenHeaderProps = {
  onCancel: () => void,
}
