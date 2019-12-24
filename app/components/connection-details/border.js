// @flow
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'

// TODO: Fix the <any, void> to be the correct types for props and state
class Border extends Component<any, void> {
  shouldComponentUpdate() {
    return false
  }

  renderDashes = () => {
    const dotBlackStyle = [
      styles.dotBlack,
      { backgroundColor: this.props.borderColor },
    ]

    const renderedDashes = []
    for (let i = 0; i < 48; i++) {
      renderedDashes.push(
        <View key={i} style={styles.twoDotsContainer}>
          <View style={dotBlackStyle} />
          <View style={styles.dotWhite} />
        </View>
      )
    }

    return renderedDashes
  }

  render() {
    return <View style={styles.container}>{this.renderDashes()}</View>
  }
}
export { Border }

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  dotBlack: {
    backgroundColor: '#f2f2f2',
    width: 7,
    height: 1,
  },
  dotWhite: {
    backgroundColor: 'transparent',
    width: 5,
    height: 1,
  },
  twoDotsContainer: {
    width: 12,
    height: 1,
    flexDirection: 'row',
  },
})
