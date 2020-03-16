// @flow
import React from 'react'
import { TouchableOpacity, StyleSheet, Text, Platform } from 'react-native'
import SvgCustomIcon from '../svg-custom-icon'
import type { CameraButtonProps } from './type-camera-button'

export const CameraButton = (props: CameraButtonProps) => {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
      <SvgCustomIcon name="Camera" width={26} height={26} fill={'#777'} />
      <Text style={styles.text}>Scan</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 8 : 0,
    zIndex: 1000,
    bottom: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: '#777',
  },
})
