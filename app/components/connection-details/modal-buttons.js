// @flow
import React from 'react'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import debounce from 'lodash.debounce'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ModalButtons extends React.Component<any, {}> {
  constructor(props: any) {
    super(props)
  }
  debounceButtonPress = debounce(
    event => {
      if (this.props.onPress) {
        this.props.onPress(event)
      }
    },
    600,
    { leading: true, trailing: false }
  )

  render() {
    const { onIgnore, onPress, disableAccept = false } = this.props

    let themeType = this.props.colorBackground
    if (disableAccept) {
      const colorsWithoutOpacity = this.props.colorBackground.split(',', 3)
      colorsWithoutOpacity.push('0.4)')
      themeType = colorsWithoutOpacity.join(',')
    }

    return (
      <View style={styles.container}>
        <View style={styles.innerWrapper}>
          <TouchableOpacity
            style={[
              styles.buttonIgnore,
              { backgroundColor: this.props.secondColorBackground },
            ]}
            onPress={this.props.onIgnore}
          >
            <Text style={styles.ignore}>{this.props.leftBtnText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonAccept, { backgroundColor: themeType }]}
            disabled={disableAccept}
            onPress={() => {
              this.debounceButtonPress()
            }}
          >
            <View style={{ opacity: disableAccept ? 0.4 : 1 }}>
              <Text style={styles.accept}>{this.props.rightBtnText}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export { ModalButtons }

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
    width: '100%',
    padding: 15,
    paddingBottom: 45,
  },
  innerWrapper: {
    borderRadius: 5,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonIgnore: {
    padding: 17.5,
    paddingLeft: 30,
    paddingRight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#194779',
  },
  ignore: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Lato',
  },
  buttonAccept: {
    flex: 1,
    padding: 17.5,
    paddingLeft: 30,
    paddingRight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accept: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Lato',
  },
})
