// @flow
import { StyleSheet, Platform } from 'react-native'

import { color, font } from '../../common/styles/constant'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    height: 120,
    width: '100%',
    flexDirection: 'row',
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  labelSection: {
    width: '50%',
    height: '100%',
  },
  iconsSection: {
    width: '50%',
    height: '100%',
    flexDirection: 'row-reverse',
  },
  label: {
    fontFamily: 'Lato',
    fontWeight: 'bold',
    fontSize: 26,
    marginTop: 73,
    marginLeft: 16,
    color: '#505050',
  },
  icon: {
    marginTop: 74,
    marginRight: 6,
  },
  blur: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: 120,
  },
})

export { styles }
