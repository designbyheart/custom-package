// @flow
import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { BigNumber } from 'bignumber.js'
import { scale } from 'react-native-size-matters'

import { maroonRed } from '../../common/styles'
import { orange, whiteSolid } from '../../common/styles/constant'
import SvgCustomIcon from '../../components/svg-setting-icons'
import { CustomText } from '../../components'

const CredentialPriceInfo = ({ price }: { price: string }) => {
  const priceAmount = new BigNumber(price)

  const isBigNumberPrice = priceAmount.toString().length > 15
  return priceAmount > 0 ? (
    <View
      style={[
        styles.priceContainer,
        { flexDirection: isBigNumberPrice ? 'column' : 'row' },
      ]}
    >
      <CustomText transparentBg style={[styles.text]}>
        This Credential Costs
      </CustomText>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: isBigNumberPrice ? 'flex-start' : 'flex-end',
        }}
      >
        <SvgCustomIcon
          fill={whiteSolid}
          name="PaymentToken"
          height={'30'}
          width={'30'}
        />
        <CustomText transparentBg style={[styles.text, styles.largeText]}>
          {priceAmount.toFixed().toString()}
        </CustomText>
      </View>
    </View>
  ) : (
    <View />
  )
}

export default CredentialPriceInfo

const styles = StyleSheet.create({
  priceContainer: {
    backgroundColor: orange,
    maxWidth: '100%',
    justifyContent: 'space-between',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 5,
  },
  text: {
    fontSize: scale(15),
    color: whiteSolid,
    padding: 15,
    paddingBottom: 8,
    paddingTop: 5,
  },
  icon: {
    marginRight: 5,
    resizeMode: 'contain',
    height: 25,
    marginTop: 6,
  },
  largeText: {
    fontSize: scale(17),
    marginLeft: 5,
    textAlign: 'right',
    paddingLeft: 5,
    paddingTop: 4,
  },
})
