// @flow
import { StyleSheet, Platform, PixelRatio, Dimensions } from 'react-native'

import {
  primaryHeaderHeight,
  grey,
  isiPhone5,
} from '../../common/styles/constant'

// original in icon{} and label{} marginTop was 73 and height was 120, thus the 47 to keep
// subtracting 47 from containerHeight keeps it relative to what is was.
const marginTop = isiPhone5
  ? primaryHeaderHeight - 42
  : primaryHeaderHeight - 47
const { width } = Dimensions.get('screen')

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    height: primaryHeaderHeight,
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
    width: width * 0.8,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconsSection: {
    width: width * 0.2,
    height: '100%',
  },
  svgIcon: {
    marginLeft: isiPhone5 ? 15 : 20,
  },
  label: {
    fontFamily: 'Lato',
    fontWeight: 'bold',
    fontSize: isiPhone5 ? 20 : 26,
    marginTop: isiPhone5 ? marginTop + 3 : marginTop,
    color: grey,
    marginLeft: isiPhone5 ? 14 : 20,
  },
  labelNotHome: {
    fontFamily: 'Lato',
    fontWeight: 'bold',
    fontSize: isiPhone5 ? 20 : 26,
    marginTop: isiPhone5 ? marginTop + 3 : marginTop,
    color: grey,
    marginRight: width * 0.2,
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
