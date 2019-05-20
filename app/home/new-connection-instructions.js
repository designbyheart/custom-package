// @flow

import React, { PureComponent } from 'react'
import {
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native'
import Snackbar from 'react-native-snackbar'

import { Container, CustomView, CustomText, CustomButton } from '../components'
import {
  OFFSET_3X,
  OFFSET_2X,
  OFFSET_1X,
  cmGrey1,
  white,
  verticalBreakpoint,
  venetianRed,
} from '../common/styles'

const { extraSmall, small, medium, large } = verticalBreakpoint

export class NewConnectionInstructions extends PureComponent<{}> {
  render() {
    return (
      <ImageBackground
        source={require('../images/connection-items-placeholder.png')}
        style={styles.backgroundImage}
      >
        <Container center style={[styles.contentContainer]}>
          <CustomView center>
            <Image
              source={require('../images/CredentialGraphic.png')}
              resizeMode="contain"
              style={
                extraSmall ? styles.credentialSmallCard : styles.emptyStyle
              }
            />
            <CustomText transparentBg size="h3b" bold style={[styles.headline]}>
              You now have a digital wallet!
            </CustomText>
            <CustomText transparentBg bold size="h5" style={[styles.title]}>
              Want to see how it works?
            </CustomText>
            <CustomText transparentBg size="h6" style={[styles.text]}>
              We have setup an optional tutorial site for you to go through
              using this Connect.Me app. To start this process, go to{' '}
              <CustomText
                transparentBg
                size="h6"
                style={[styles.link]}
                onPress={this.openTryConnectMe}
              >
                try.connect.me
              </CustomText>{' '}
              in a desktop browser, or click the button below!
            </CustomText>
            <CustomView center style={[styles.buttonContainer]}>
              <CustomButton
                title="Start Tutorial"
                style={[styles.startTutorialButton]}
                customColor={buttonColor}
                onPress={this.openTryConnectMe}
              />
            </CustomView>
          </CustomView>
        </Container>
      </ImageBackground>
    )
  }

  openTryConnectMe = () => {
    Linking.openURL('https://try.connect.me').catch(() => {
      Snackbar.show({
        title:
          'Could not open Tutorial website. No capable browser found to open it.',
        duration: Snackbar.LENGTH_LONG,
        backgroundColor: venetianRed,
        color: white,
      })
    })
  }
}

const buttonColor = {
  color: white,
  fontWeight: '600',
  fontSize: 18,
}

// we just want an approx height because we want to push images and empty view
// just a little bit down, and on smaller devices as well it would be
// help in jamming down view
const approxHeaderHeight = 64
const verticalSpacing1X = small ? OFFSET_1X / 2 : OFFSET_1X

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    marginTop: small ? approxHeaderHeight : 0,
  },
  credentialCard: {
    marginBottom: verticalSpacing1X,
  },
  credentialSmallCard: {
    height: 90,
  },
  headline: {
    color: '#EB9B2D',
    marginVertical: verticalSpacing1X,
    textAlign: 'center',
  },
  title: {
    marginVertical: verticalSpacing1X,
    color: cmGrey1,
  },
  text: {
    marginVertical: verticalSpacing1X,
    marginHorizontal: '5%',
    color: cmGrey1,
    textAlign: 'center',
  },
  link: {
    color: '#EB9B2D',
  },
  buttonContainer: {
    marginTop: small ? '2%' : medium ? '5%' : '10%',
  },
  startTutorialButton: {
    borderRadius: 5,
    backgroundColor: '#86B93B',
    marginHorizontal: '6%',
  },
  // creating empty style so that Image component does not re-render
  // every time, because we would be passing "{}", and hence a new object
  // would be created every time, and hence equality operator
  // would see it as different prop and hence it would render again
  // by using this emptyStyle we are making sure that it does re-render
  // just because of new object every time due to styles being empty
  emptyStyle: {},
})
