// @flow
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { ModalButtons } from '../components/buttons/modal-buttons'
import CredentialPriceInfo from '../components/labels/credential-price-info'
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
            rightBtnText={'Read and Sign TAA'}
            buttonsWrapperStyles={{
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <CredentialPriceInfo price={'0.000043'} />
          </ModalButtons>
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
