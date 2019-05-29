// @flow
import React from 'react'
import { Text, Image, View, StyleSheet, TouchableOpacity } from 'react-native'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ConnectionPending extends React.Component<any, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.date}>{this.props.date}</Text>
        <View style={styles.innerWrapper}>
          <View style={styles.spinerWrapper}>
            <Image
              style={styles.spiner}
              source={require('../../images/componentsDetails/spiner.gif')}
            />
            <View style={styles.absolute} />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>{this.props.title}</Text>
            <Text style={styles.content}>{this.props.content}</Text>
          </View>
        </View>
      </View>
    )
  }
}

export { ConnectionPending }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '86%',
    marginLeft: '7%',
    paddingTop: 15,
    paddingBottom: 15,
  },
  innerWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#f2f2f2',
    borderRadius: 3,
    width: '100%',
    padding: 12,
  },
  date: {
    color: '#777',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'left',
    fontFamily: 'Lato',
    paddingBottom: 8,
  },
  spinerWrapper: {
    position: 'relative',
  },
  spiner: {
    width: 24,
    height: 24,
  },
  absolute: {
    width: 14,
    height: 14,
    backgroundColor: 'white',
    borderRadius: 7,
    position: 'absolute',
  },
  spinerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    paddingLeft: 12,
    flex: 1,
  },
  title: {
    color: '#505050',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'left',
    marginBottom: 4,
    fontFamily: 'Lato',
  },
  content: {
    color: '#777',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'left',
    fontFamily: 'Lato',
  },
})
