// @flow
import React, { PureComponent } from 'react'
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native'
import { scale } from 'react-native-size-matters'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import SvgCustomIcon from '../../components/svg-setting-icons'
import { mediumGray } from '../../common/styles'
import { CustomText } from '../../components'
import { atlantis, cmRed, cardBorder } from '../../common/styles/constant'

import type {
  PaymentTransactionInfoProps,
  TokenFeesData,
} from '../type-claim-offer'
import CredentialCostInfo from './credential-cost-info'

const statusMessages = {
  IN_PROGRESS: 'Getting transaction fees...',
  SENDING_PAID_CREDENTIAL_REQUEST: 'Sending payment request...',
  INSUFFICIENT_BALANCE:
    'You do not have enough tokens to purchase this credential.',
  NOT_POSSIBLE: 'You do not have enough tokens to purchase this credential.',
  ERROR: 'There was a problem getting transaction fees',
  SUCCESS:
    'Tokens transffered successfully. You should receive your credential shortly.',
}

class PaymentTransactionInfo extends PureComponent<
  PaymentTransactionInfoProps,
  void
> {
  render() {
    const {
      shouldShow = false,
      status,
      feesData,
      backgroundColor,
      children,
    } = this.props
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {(status === 'IN_PROGRESS' ||
            status === 'SENDING_PAID_CREDENTIAL_REQUEST') && (
            // TODO: We need to decide which loader we are going to use
            <ActivityIndicator
              size="large"
              color={mediumGray}
              hidesWhenStopped
            />
          )}
          <CustomText style={styles.statusText} multiline>
            {statusMessages[status]}
          </CustomText>
          {status !== 'IN_PROGRESS' &&
            status !== 'SENDING_PAID_CREDENTIAL_REQUEST' && (
              <View style={styles.iconContainer}>
                <SvgCustomIcon
                  name={status === 'SUCCESS' ? 'SuccessCheckmark' : 'ErrorFace'}
                  width={'40'}
                  height={'40'}
                  fill={status === 'SUCCESS' ? atlantis : cmRed}
                />
              </View>
            )}
          {children}
        </View>
      </View>
    )
  }
}

export default PaymentTransactionInfo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: '100%',
    paddingTop: 20,
    backgroundColor: cardBorder,
    justifyContent: 'flex-start',
  },
  content: {
    marginLeft: '10%',
    flex: 1,
    maxWidth: '80%',
  },
  statusText: {
    color: mediumGray,
    textAlign: 'center',
    marginTop: 40,
    fontSize: scale(15),
  },
  iconContainer: {
    width: '100%',
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
})
