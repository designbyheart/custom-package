// @flow
import React from 'react'
import { View } from 'react-native'

// We don't need to type check external library
// and we don't need types for mock test stub
class MockView extends React.Component<any, void> {
  render() {
    return <View {...this.props}>{this.props.children}</View>
  }
}

export default MockView
