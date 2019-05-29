// @flow
import React from 'react'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ModalButton extends React.Component<any, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  render() {
    const { onClose } = this.props

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: this.props.colorBackground },
        ]}
      >
        <View style={styles.innerWrapper}>
          <TouchableOpacity style={styles.buttonClose} onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export { ModalButton }

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 15,
    paddingBottom: 45,
  },
  innerWrapper: {
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonClose: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  close: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Lato',
  },
})
