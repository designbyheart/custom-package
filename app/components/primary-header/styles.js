// @flow
import { StyleSheet, Platform } from 'react-native'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'

import { colors, fontFamily } from '../../common/styles/constant'

// original in icon{} and label{} marginTop was 73 and height was 120, thus the 47 to keep
// subtracting 47 from containerHeight keeps it relative to what is was.

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    height: verticalScale(90),
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.cmWhite,
    shadowColor: colors.cmBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  labelSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: moderateScale(15),
    width: '85%',
  },
  menuIcon: {
    marginLeft: moderateScale(15),
  },
  label: {
    fontFamily: fontFamily,
    fontWeight: 'bold',
    fontSize: moderateScale(22),
    marginLeft: moderateScale(-50),
    color: colors.cmGray2,
  },
  iconSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: moderateScale(10),
    width: '15%',
  },
})

export { styles }
