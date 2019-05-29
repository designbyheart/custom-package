// @flow
import React from 'react'
import { View, StyleSheet } from 'react-native'

// TODO: Fix the <any, void> to be the correct types for props and state
class Border extends React.Component<any, void> {
  render() {
    const dotBlackStyle = [
      styles.dotBlack,
      { backgroundColor: this.props.borderColor },
    ]
    return (
      <View style={styles.container}>
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
        <View style={dotBlackStyle} />
        <View style={styles.dotWhite} />
      </View>
    )
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
})
