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

import type { NewConnectionInstructionsProps } from './type-my-connections'
import { colors, fontFamily } from '../common/styles/constant'

export class NewConnectionInstructions extends PureComponent<
  NewConnectionInstructionsProps,
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
              You now have a digital wallet!
            </Text>
            <Text style={[styles.title]}>Want to see how it works?</Text>
            {usingProductionNetwork && (
              <Text style={[styles.text]}>
                We have setup an optional tutorial site for you to go through
                using this Connect.Me app. To start this process, go to
                try.connect.me in a desktop browser and click Start Tutorial.
              </Text>
            )}
            {!usingProductionNetwork && (
              <Text style={[styles.text]}>
                We see you are not on the live network. Get with an Evernym team
                member to help you use Connect.Me!
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
