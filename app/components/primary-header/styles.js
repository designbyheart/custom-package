// @flow
import { StyleSheet, Platform, PixelRatio } from 'react-native'

import { isBiggerThanVeryShortDevice } from '../../common/styles/constant'

const containerHeight = isBiggerThanVeryShortDevice ? 100 : 90

// original in icon{} and label{} marginTop was 73 and height was 120, thus the 47 to keep
// subtracting 47 from containerHeight keeps it relative to what is was.
const marginTop = containerHeight - 47

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    height: containerHeight,
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
    width: '75%',
    height: '100%',
  },
  iconsSection: {
    width: '25%',
    height: '100%',
    flexDirection: 'row-reverse',
  },
  label: {
    fontFamily: 'Lato',
    fontWeight: 'bold',
    fontSize: 26,
    marginTop,
    marginLeft: 16,
    color: '#505050',
  },
  icon: {
    marginTop,
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
