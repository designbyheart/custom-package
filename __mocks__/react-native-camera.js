// @flow
import React from 'react'

export class RNCamera extends React.Component<any, any> {
  static Constants = {
    Aspect: {},
    BarCodeType: {},
    Type: { back: 'back', front: 'front' },
    CaptureMode: {},
    CaptureTarget: {},
    CaptureQuality: {},
    Orientation: {},
    FlashMode: {},
    TorchMode: {},
  }

  render() {
    return this.props.children
  }
}

export default RNCamera
