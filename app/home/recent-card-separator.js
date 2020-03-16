// @flow
import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

export const RecentCardSeparator = () => {
  return (
    <View style={styles.container}>
      <View style={styles.lineSection}>
        <View style={styles.line} />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.text}>Recent</Text>
      </View>
      <View style={styles.lineSection}>
        <View style={styles.line} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 22,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
  },
  lineSection: {
    flex: 1,
    justifyContent: 'center',
  },
  textSection: {
    height: '100%',
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    height: 1,
    width: '100%',
    backgroundColor: '#A5A5A5',
  },
  text: {
    fontFamily: 'Lato',
    color: '#A5A5A5',
    fontWeight: 'normal',
    fontSize: 14,
  },
})
