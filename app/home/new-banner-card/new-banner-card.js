// @flow
import React from 'react'
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native'

import type { NewBannerCardProps } from './type-new-banner-card'

export const NewBannerCard = (props: NewBannerCardProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        props.navigation.navigate(props.navigationRoute, { uid: props.uid })
      }
    >
      <View style={styles.iconSection}>
        <Image source={{ uri: props.logoUrl }} style={styles.issuerLogo} />
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
    backgroundColor: 'rgba(134, 185, 59, 0.15)',
    borderWidth: 1,
    borderColor: '#86B93B',
    height: 80,
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 8,
    marginTop: 8,
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
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#505050',
    marginBottom: 3,
  },
  newMessageText: {
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#505050',
    marginTop: 3,
  },
  issuerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dateText: {
    fontFamily: 'Lato',
    fontWeight: '500',
    fontSize: 10,
    fontStyle: 'italic',
    color: '#505050',
    marginTop: 8,
    marginRight: 8,
  },
})
