// @flow
import React from 'react'
import { Image, StyleSheet, Platform, Text } from 'react-native'
import { isBiggerThanShortDevice } from '../../../common/styles'

import { CustomView, Container } from '../../layout/'
import { BottomUpSliderText } from './bottom-up-slider-screen-text'
import { scale } from 'react-native-size-matters'

export function BottomUpSliderContentHeaderDetail(props: {
  source: number | { uri: string } | string,
  senderName: string,
  headerInfo: string,
  headerTitle: string,
}) {
  return (
    <CustomView column style={[styles.contentHeaderContainer]}>
      <CustomView row center>
        <CustomView>
          <Image
            style={[styles.headerLogo]}
            source={props.source}
            resizeMode="cover"
          />
        </CustomView>
        <Container style={[styles.headerName]}>
          <BottomUpSliderText style={[styles.headerNameText]} numberOfLines={1}>
            {props.senderName}
          </BottomUpSliderText>
          <Text
            style={[
              styles.slideHeaderUpAboutText,
              {
                fontSize: infoSize(
                  props.headerInfo ? props.headerInfo.length : 0
                ),
              },
            ]}
          >
            {props.headerInfo}
          </Text>
        </Container>
        {/* need room for cred/certificate icon here */}
      </CustomView>
      <Text
        style={[
          styles.slideHeaderUpText,
          {
            fontSize: headerNameText(
              props.headerTitle ? props.headerTitle.length : 0
            ),
          },
        ]}
        numberOfLines={1}
      >
        {props.headerTitle}
      </Text>
    </CustomView>
  )
}

const infoSize = (wordLength: number): number => {
  // return isBiggerThanShortDevice ? scale(14),
  switch (true) {
    case wordLength < 25:
      return scale(14)
    default:
      return scale(10)
  }
}
const headerTitleSize = (wordLength: number): number => {
  switch (true) {
    case wordLength < 20:
      return scale(22)
    case wordLength < 25:
      return scale(18)
    case wordLength < 30:
      return scale(16)
    default:
      return scale(14)
  }
}

const headerNameText = (wordLength: number): number => {
  switch (true) {
    case wordLength < 19:
      return scale(22)
    case wordLength < 23:
      return scale(18)
    case wordLength < 27:
      return scale(16)
    default:
      return scale(14)
  }
}

const HEADER_LOGO_DIMENSION = 32
const headerSpacing = '5%'

const styles = StyleSheet.create({
  contentHeaderContainer: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: 'white',
    height: isBiggerThanShortDevice ? 112 : 96,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    zIndex: 200,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  headerLogo: {
    width: HEADER_LOGO_DIMENSION,
    height: HEADER_LOGO_DIMENSION,
    borderRadius: HEADER_LOGO_DIMENSION / 2,
    borderWidth: 1,
  },
  headerName: {
    marginLeft: headerSpacing,
  },
  headerNameText: {
    fontSize: 17,
    fontWeight: '700',
  },
  slideHeaderUpText: {
    color: '#505050',
    fontWeight: '600',
  },
  slideHeaderUpAboutText: {
    color: '#777777',
    fontSize: isBiggerThanShortDevice ? 14 : 10,
  },
})
