// @flow
import React from 'react'
import { Text, View, Image, StyleSheet, ActivityIndicator } from 'react-native'

import type { RecentCardProps } from './type-recent-card'

const renderIndicatorOrImage = (status: string, logoUrl: string) => {
  if (status === 'PENDING') return <ActivityIndicator size="small" />
  return <Image source={{ uri: logoUrl }} style={styles.issuerLogo} />
}

export const RecentCard = (props: RecentCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconSection}>
        {renderIndicatorOrImage(props.status, props.logoUrl)}
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
    height: 48,
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
    width: 52,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  issuerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.5,
  },
  textMessage: {
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'Lato',
    color: '#A5A5A5',
  },
  textIssuer: {
    fontSize: 11,
    fontWeight: 'normal',
    fontFamily: 'Lato',
    color: '#A5A5A5',
  },
  textDate: {
    fontSize: 9,
    fontWeight: 'normal',
    fontFamily: 'Lato',
    fontStyle: 'italic',
    color: '#A5A5A5',
  },
})
