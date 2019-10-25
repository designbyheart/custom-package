// @flow
import React from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { scale } from 'react-native-size-matters'

import {
  mediumGray,
  cardBorder,
  whisper,
  yellowSea,
  whiteSolid,
  darkGray,
} from '../../common/styles'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import type { TokenFeesData } from '../type-claim-offer'
import { CustomText } from '../../components/'

type CredentialCostInfoProps = {
  feesData: TokenFeesData,
  payTokenValue: string,
  backgroundColor: string,
  onConfirmAndPay: () => void,
  onCancel: () => void,
}

const CredentialCostInfo = (props: CredentialCostInfoProps) => {
  const {
    feesData,
    payTokenValue,
    backgroundColor,
    onCancel,
    onConfirmAndPay,
  } = props
  const costsData = [
    {
      label: 'Transaction Fee',
      key: 'fees',
      value: feesData.fees,
    },
    {
      label: 'Credential Cost',
      key: 'payTokenValue',
      value: payTokenValue || 0,
    },
    { label: 'Total', key: 'total', value: feesData.total || 0 },
  ]

  const renderCostCell = ({ item, index }) => {
    const { totalLabel, totalValue, labelText, valueText } = styles
    return (
      <View style={styles.cell} key={item.label}>
        <CustomText style={[labelText, index === 2 && totalLabel]}>
          {item && item.label}
        </CustomText>
        <CustomText style={[valueText, index === 2 && totalValue]}>
          {item && item.value}
        </CustomText>
      </View>
    )
  }

  const borderSeparator = ({ leadingItem }) => {
    const { key } = leadingItem
    return (
      <View
        style={[
          styles.borderSeparator,
          key === 'payTokenValue' && styles.borderTotalSeparator,
        ]}
      />
    )
  }

  const keyExtractor = item => `${item.label}`

  return (
    <View style={styles.costContainer}>
      <CustomText style={styles.noteMessage}>
        Please confirm. Once tokens are transferred, it cannot be undone.
      </CustomText>
      <FlatList
        data={costsData}
        style={styles.costTable}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={borderSeparator}
        renderItem={renderCostCell}
      />
      <View style={styles.buttonsContainer}>
        <ModalButtons
          onIgnore={onCancel}
          onPress={onConfirmAndPay}
          disableAccept={false}
          colorBackground={backgroundColor}
          leftBtnText={'Cancel'}
          rightBtnText={'Confirm and Pay'}
        />
      </View>
    </View>
  )
}

export default CredentialCostInfo

const textStyle = {
  color: darkGray,
  lineHeight: 20,
}

const styles = StyleSheet.create({
  costContainer: { flex: 1, backgroundColor: cardBorder },
  costTable: {
    maxWidth: '90%',
    marginLeft: '5%',
    height: 'auto',
  },
  noteMessage: {
    padding: 20,
    color: mediumGray,
    textAlign: 'center',
    fontSize: scale(15),
    maxWidth: '90%',
    marginLeft: '5%',
    marginTop: 15,
    marginBottom: 5,
  },
  cell: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: whiteSolid,
  },
  valueText: {
    ...textStyle,
    fontSize: scale(17),
    color: yellowSea,
    textAlign: 'right',
  },
  labelText: {
    fontWeight: 'bold',
    fontSize: scale(14),
  },
  borderSeparator: {
    backgroundColor: whisper,
    width: '100%',
    height: 1,
  },
  borderTotalSeparator: {
    backgroundColor: yellowSea,
    width: '100%',
    height: 2,
  },
  totalLabel: {
    fontSize: scale(19),
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: scale(22),
    lineHeight: 22,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  buttonsContainer: {
    flex: 1,
  },
})
