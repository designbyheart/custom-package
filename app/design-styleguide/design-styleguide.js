// @flow
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { ModalButtons } from '../components/buttons/modal-buttons'
import { buttonGreen } from '../common/styles/constant'
import { CustomText } from '../components'

class DesignStyleguide extends Component<void, void> {
  render() {
    return (
      <View>
        <View>
          <CustomText style={styles.title}>Modal Buttons</CustomText>
          <ModalButtons
            onIgnore={() => {}}
            onPress={() => {}}
            disableAccept={false}
            payTokenValue={0}
            colorBackground={buttonGreen}
            leftBtnText={'Ignore'}
            rightBtnText={'Accept'}
          />
        </View>
      </View>
    )
  }
}

export default DesignStyleguide

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
  },
})
