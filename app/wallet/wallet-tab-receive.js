// @flow

// component to render inside token screen, receive tab
// we have to design this tab content by assuming that
// we would get a list of payment addresses and for now we would take first item out of it
// and that first item would be displayed
import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  Button,
  ScrollView,
  Alert,
} from 'react-native'
import { Container } from '../components/layout/container'
import { CustomView } from '../components/layout/custom-view'
import CustomText from '../components/text'
import CustomButton from '../components/button'
import { color } from '../common/styles/constant'

import { walletAddressess } from '../../__mocks__/static-data'
import type { WalletTabReceiveProps } from './type-wallet'

export default class WalletTabReceive extends Component<
  WalletTabReceiveProps,
  void
> {
  render() {
    return (
      <Container>
        <Container>
          <CustomView style={[styles.container]}>
            <ScrollView scrollEnabled={walletAddressess.length > 1}>
              <CustomText
                h6
                bold
                center
                proText
                transparentBg
                quinaryText
                style={[styles.heading]}
              >
                YOUR SOVRIN TOKEN PAYMENT ADDRESS IS:
              </CustomText>
              {walletAddressess.map((walletAddress, index) => {
                return (
                  <CustomText
                    proText
                    center
                    transparentBg
                    borderColor
                    primary
                    key={walletAddress}
                    style={[styles.paymentAddress]}
                  >
                    {walletAddress}
                  </CustomText>
                )
              })}
            </ScrollView>
          </CustomView>
        </Container>
        <CustomView safeArea style={[styles.alignItemsCenter]}>
          <CustomButton
            testID="token-copy-to-clipboard-label"
            style={[styles.copyButton]}
            primary
            title="Copy Address To Clipboard"
          />
        </CustomView>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 38,
  },
  heading: {
    lineHeight: 18,
    letterSpacing: -0.38,
    marginBottom: 20,
  },
  paymentAddress: {
    marginTop: 5,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 13,
    paddingRight: 13,
    marginLeft: 19,
    marginRight: 19,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.45,
  },
  alignItemsCenter: {
    marginBottom: 6,
    marginLeft: '5%',
    marginRight: '5%',
  },
  copyButton: {
    width: '100%',
    borderRadius: 5,
    backgroundColor: color.bg.eighth.color,
  },
})