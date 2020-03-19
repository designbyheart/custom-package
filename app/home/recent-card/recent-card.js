// @flow
import React from 'react'
import { Text, View, Image, StyleSheet, ActivityIndicator } from 'react-native'
import {
  mediumGray,
  white,
  font,
  recentCardSizes,
  isiPhone5,
} from '../../common/styles/constant'

import type { RecentCardProps } from './type-recent-card'

const renderPlaceholderIfNoImage = (character: string) => (
  <View style={styles.placeholderIfNoImage}>
    <Text style={styles.placeholderTextIfNoImage}>{character}</Text>
  </View>
)

const renderIndicatorOrImage = (
  status: string,
  logoUrl: string,
  issuerName: string
) => {
  if (status === 'PENDING') return <ActivityIndicator size="small" />
  return typeof logoUrl === 'string' ? (
    <Image source={{ uri: logoUrl }} style={styles.issuerLogo} />
  ) : (
    renderPlaceholderIfNoImage(issuerName[0])
  )
}

export const RecentCard = (props: RecentCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconSection}>
        {renderIndicatorOrImage(props.status, props.logoUrl, props.issuerName)}
      </View>
      <View style={styles.textSection}>
        <View style={styles.textMessageSection}>
          <Text
            style={styles.textMessage}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {props.statusMessage}
          </Text>
        </View>
        <View style={styles.textIssuerSection}>
          <Text
            style={styles.textIssuer}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {props.issuerName}
          </Text>
        </View>
      </View>
      <View style={styles.textDateSection}>
        <Text style={styles.textDate}>{props.timestamp}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: recentCardSizes.height,
    marginLeft: 20,
    marginRight: 20,
  },
  iconSection: {
    height: '100%',
    width: 40,
    justifyContent: 'center',
  },
  textSection: {
    flex: 1,
  },
  textMessageSection: {
    flex: 2,
    justifyContent: 'flex-end',
  },
  textIssuerSection: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  textDateSection: {
    height: '100%',
    width: isiPhone5 ? 48 : 52,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  issuerLogo: {
    width: recentCardSizes.logoSize,
    height: recentCardSizes.logoSize,
    borderRadius: recentCardSizes.logoSize / 2,
    opacity: 0.5,
  },
  textMessage: {
    fontSize: isiPhone5 ? font.size.XS1 : font.size.PREFIX,
    fontWeight: 'normal',
    fontFamily: font.family,
    color: mediumGray,
  },
  textIssuer: {
    fontSize: isiPhone5 ? font.size.XXXS : font.size.XXS,
    fontWeight: 'normal',
    fontFamily: font.family,
    color: mediumGray,
  },
  textDate: {
    fontSize: isiPhone5 ? font.size.XXXXXS : font.size.XXXXS,
    fontWeight: 'normal',
    fontFamily: font.family,
    fontStyle: 'italic',
    color: mediumGray,
  },
  placeholderIfNoImage: {
    width: recentCardSizes.logoSize,
    height: recentCardSizes.logoSize,
    borderRadius: recentCardSizes.logoSize / 2,
    backgroundColor: mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTextIfNoImage: {
    fontFamily: font.family,
    fontSize: isiPhone5 ? font.size.S : font.size.M,
    fontWeight: 'bold',
    color: white,
  },
})
