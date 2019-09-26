// @flow

import React from 'react'
import { StyleSheet } from 'react-native'

import { CustomView } from '../../layout/custom-view'
import Loader from '../../loader/loader'

export function BottomUpSliderLoader() {
  return (
    <CustomView bg="tertiary" center style={[styles.loaderContainer]}>
      <Loader type="dark" showMessage={true} message={'Sending...'} />
    </CustomView>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    minHeight: '20%',
  },
})
