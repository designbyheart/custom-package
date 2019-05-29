// @flow
import React from 'react'
import {
  Text,
  View,
  Button,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native'

let ScreenWidth = Dimensions.get('window').width

// TODO: Fix the <any, void> to be the correct types for props and state
class NewMessageBreakLine extends React.Component<any, void> {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.border} />
        <View style={styles.textWrapper}>
          <Text style={styles.text}>New Messages</Text>
        </View>
      </View>
    )
  }
}

export { NewMessageBreakLine }

const styles = StyleSheet.create({
  container: {
    width: ScreenWidth,
    height: 26,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'white',
    marginTop: -15,
    marginBottom: -15,
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 45,
  },
  scrollView: {
    flex: 1,
    // borderWidth: 1,
    borderColor: 'red',
    width: '100%',
    backgroundColor: 'white',
  },
  border: {
    width: '100%',
    height: 1,
    backgroundColor: '#CE0B24',
    position: 'absolute',
  },
  textWrapper: {
    height: '100%',
    width: 88,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '7%',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CE0B24',
  },
})
