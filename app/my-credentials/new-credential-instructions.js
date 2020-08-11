// @flow

import React, { PureComponent } from 'react'
import {
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Text,
  View,
} from 'react-native'
import Snackbar from 'react-native-snackbar'

import { scale, verticalScale, moderateScale } from 'react-native-size-matters'

import type { NewCredentialInstructionsProps } from './type-my-credentials'
import { colors, fontFamily } from '../common/styles/constant'

export class NewCredentialInstructions extends PureComponent<
  NewCredentialInstructionsProps,
  void
> {
  render() {
    const { usingProductionNetwork } = this.props
    return (
      <ImageBackground
        source={require('../images/connection-items-placeholder.png')}
        style={styles.backgroundImage}
      >
        <View style={[styles.contentContainer]}>
          <View>
            <Image
              source={require('../images/CredentialGraphic.png')}
              resizeMode="contain"
              style={styles.image}
            />
            <Text style={[styles.headline]}>
              No Credentials yet!
            </Text>
            <Text style={[styles.title]}>Want to see how this app works?</Text>
            {usingProductionNetwork && (
              <Text style={[styles.text]}>
                Go through the tutorial at www.try.connect.me. 
                Connect.Me is for collecting digital Credentials. They will appear here.
              </Text>
            )}
            {!usingProductionNetwork && (
              <Text style={[styles.text]}>
                Connect.Me is for collecting digital Credentials. They will appear here.
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>
    )
  }

  openTryConnectMe = () => {
    Linking.openURL('https://try.connect.me').catch(() => {
      Snackbar.show({
        text:
          'Could not open Tutorial website. No capable browser found to open it.',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: colors.cmRed,
        textColor: colors.cmWhite,
      })
    })
  }
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: moderateScale(90, 2.5),
    alignSelf: 'center',
  },
  headline: {
    fontSize: moderateScale(20, 0.1),
    color: colors.cmOrange,
    marginVertical: moderateScale(5),
    fontFamily: fontFamily,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  title: {
    fontSize: moderateScale(17, 0.1),
    marginVertical: moderateScale(5),
    color: colors.cmGray1,
    textAlign: 'center',
  },
  text: {
    fontSize: moderateScale(15, 0.1),
    marginVertical: moderateScale(5),
    marginHorizontal: '5%',
    color: colors.cmGray1,
    textAlign: 'center',
  },
})
