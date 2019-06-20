// @flow
import React, { PureComponent } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Container, CustomView, CustomText, Loader } from '../components'
import { OFFSET_3X, OFFSET_4X } from '../common/styles'
import { withStatusBar } from '../components/status-bar/status-bar'

class WaitForInvitation extends PureComponent<void, void> {
  render() {
    return (
      <Container center style={[styles.expiredTokenContainer]}>
        <Loader />
      </Container>
    )
  }
}

export default withStatusBar()(WaitForInvitation)

const styles = StyleSheet.create({
  expiredTokenContainer: {
    paddingTop: OFFSET_3X,
  },
  textContainer: {
    paddingTop: OFFSET_3X,
  },
  sorryText: {
    paddingVertical: OFFSET_4X,
  },
})
