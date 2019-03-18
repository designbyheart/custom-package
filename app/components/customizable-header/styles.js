import { StyleSheet } from 'react-native'

import { color, font } from '../../common/styles/constant'

export const styles = StyleSheet.create({
  commonHeaderContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  primaryHeaderContainer: {
    height: 120,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryHeaderTextSection: {
    width: '50%',
    height: '100%',
  },
  primaryHeaderIconSection: {
    width: '50%',
    height: '100%',
    flexDirection: 'row-reverse',
  },
  primaryHeaderText: {
    fontFamily: 'Lato',
    fontWeight: 'bold',
    fontSize: 26,
    marginTop: 73,
    marginLeft: 16,
    color: '#505050',
  },
  primaryHeaderIcon: {
    marginTop: 74,
    marginRight: 6,
  },
  connectionDetailsHeaderContainer: {
    height: 136,
  },
  credentialDetailsHeaderContainer: {
    height: 175,
  },
})

export const primaryHeaderContainer = StyleSheet.flatten([
  styles.commonHeaderContainer,
  styles.primaryHeaderContainer,
])

export const connectionDetailsHeaderContainer = StyleSheet.flatten([
  styles.commonHeaderContainer,
  styles.connectionDetailsHeaderContainer,
])

export const credentialDetailsHeaderContainer = StyleSheet.flatten([
  styles.commonHeader,
  styles.credentialDetailsHeaderContainer,
])
