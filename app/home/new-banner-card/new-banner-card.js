// @flow
import React from 'react'
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native'
import {
  atlantis,
  atlantisOpacity,
  darkGray,
  grey,
  mediumGray,
  white,
  font,
  newBannerCardSizes,
  isiPhone5,
} from '../../common/styles/constant'

import type { NewBannerCardProps } from './type-new-banner-card'
import { DefaultLogo } from '../../components/default-logo/default-logo'

export const NewBannerCard = (props: NewBannerCardProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        props.navigation.navigate(props.navigationRoute, { uid: props.uid })
      }
    >
      <View style={styles.iconSection}>
        {typeof props.logoUrl === 'string' ? (
          <Image source={{ uri: props.logoUrl }} style={styles.issuerLogo} />
        ) : (
          <DefaultLogo
            text={params.issuerName[0]}
            size={newBannerCardSizes.logoSize}
            fontSize={isiPhone5 ? font.size.M : font.size.ML}
          />
        )}
      </View>
      <View style={styles.textSection}>
        <View style={styles.textIssuerSection}>
          <Text
            style={styles.issuerText}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {props.issuerName}
          </Text>
        </View>
        <View style={styles.textMessageSection}>
          <Text style={styles.newMessageText}>NEW MESSAGE - TAP TO OPEN</Text>
        </View>
      </View>
      <View style={styles.textDateSection}>
        <Text style={styles.dateText}>{props.timestamp}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: atlantisOpacity,
    borderWidth: 1,
    borderColor: atlantis,
    height: newBannerCardSizes.height,
    marginLeft: newBannerCardSizes.distance,
    marginRight: newBannerCardSizes.distance,
    marginTop: newBannerCardSizes.distance,
    borderRadius: 8,
  },
  iconSection: {
    height: '100%',
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    flex: 1,
  },
  textIssuerSection: {
    flex: 2,
    justifyContent: 'flex-end',
  },
  textMessageSection: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  textDateSection: {
    height: '100%',
    width: 65,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  issuerText: {
    fontFamily: font.family,
    fontSize: isiPhone5 ? font.size.S : font.size.M,
    fontWeight: 'bold',
    color: darkGray,
    marginBottom: 3,
  },
  newMessageText: {
    fontFamily: font.family,
    fontSize: isiPhone5 ? font.size.XXS : font.size.XS1,
    fontWeight: 'bold',
    color: darkGray,
    marginTop: 3,
  },
  issuerLogo: {
    width: newBannerCardSizes.logoSize,
    height: newBannerCardSizes.logoSize,
    borderRadius: newBannerCardSizes.logoSize / 2,
  },
  dateText: {
    fontFamily: font.family,
    fontWeight: '500',
    fontSize: isiPhone5 ? font.size.XXXXS : font.size.XXXS,
    fontStyle: 'italic',
    color: darkGray,
    marginTop: 8,
    marginRight: 8,
  },
})
