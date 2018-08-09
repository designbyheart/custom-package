// @flow
import React, { PureComponent } from 'react'
import { StyleSheet, Platform } from 'react-native'
import { CustomView, Icon, CustomText, CustomButton } from '../components'
import {
  OFFSET_1X,
  OFFSET_2X,
  OFFSET_3X,
  OFFSET_6X,
  OFFSET_7X,
  color,
  HAIRLINE_WIDTH,
} from '../common/styles/constant'
import Modal from 'react-native-modal'

type PaymentFailureModalProps = {
  isModalVisible: boolean,
  testID: string,
  onClose: (event: any) => void,
  onRetry: (event: any) => void,
  connectionName: string,
}

export default class PaymentFailureModal extends PureComponent<
  PaymentFailureModalProps,
  void
> {
  render() {
    const { testID } = this.props
    return (
      <Modal
        backdropOpacity={0.5}
        isVisible={this.props.isModalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationOutTiming={100}
      >
        <CustomView fifth shadow style={[styles.container]}>
          <CustomView spaceBetween style={[styles.innerContainer]}>
            <Icon
              iconStyle={[{ margin: 10 }]}
              src={require('../images/alertInfo.png')}
              extraLarge
              center
              resizeMode="contain"
              testID={`${testID}-modal-header-icon`}
            />
            <CustomText
              h5
              center
              tertiary
              bg="tertiary"
              transparentBg
              style={[styles.message]}
              demiBold
              testID={`${testID}-modal-title`}
            >
              {'Payment Failure'}
            </CustomText>
            <CustomText
              h5
              center
              tertiary
              bg="tertiary"
              transparentBg
              style={[styles.message]}
              demiBold
              testID={`${testID}-modal-content`}
            >
              {`Something went wrong trying to pay ${
                this.props.connectionName
              }. Please try again.`}
            </CustomText>
          </CustomView>
          <CustomView row spaceAround>
            <CustomButton
              fifth
              onPress={this.props.onClose}
              title={'Cancel'}
              testID={`${testID}-modal-cancel`}
              textStyle={{ fontWeight: 'bold' }}
            />
            <CustomButton
              fifth
              onPress={this.props.onRetry}
              title={'Retry'}
              testID={`${testID}-modal-retry`}
              textStyle={{ fontWeight: 'bold' }}
            />
          </CustomView>
        </CustomView>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: OFFSET_3X,
  },
  innerContainer: {
    ...Platform.select({
      ios: {
        borderBottomColor: color.bg.fifth.font.tertiary,
        borderBottomWidth: HAIRLINE_WIDTH,
      },
      android: {
        borderBottomColor: color.bg.fifth.font.secondary,
        borderBottomWidth: 1,
      },
    }),
    padding: OFFSET_2X,
  },
  message: {
    marginBottom: OFFSET_1X / 2,
  },
})
