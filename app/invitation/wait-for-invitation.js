// @flow
import React, { PureComponent } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Container, CustomView, CustomText, Loader } from '../components'
import { OFFSET_3X, OFFSET_4X } from '../common/styles'
import { waitForInvitationRoute } from '../common'

const WaitForInvitation = () => {
  return (
    <Container center style={[styles.expiredTokenContainer]}>
      <Loader />
    </Container>
  )
}

export const waitForInvitationScreen = {
  routeName: waitForInvitationRoute,
  screen: WaitForInvitation,
}

const styles = StyleSheet.create({
  expiredTokenContainer: {
    paddingTop: OFFSET_3X,
  },
})
