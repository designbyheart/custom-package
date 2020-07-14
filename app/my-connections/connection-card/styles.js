// @flow
import { StyleSheet, Platform } from 'react-native'
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'

const styles = StyleSheet.create({
  animatedContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: '100%',
    height: moderateScale(90, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    height: moderateScale(80, 0.25),
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.cmGray5,
  },
  initialsContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cmGray5,
  },
  initialsText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: 'bold',
    color: colors.cmGray1,
  },
  newCardContainer: {
    backgroundColor: colors.cmGreen3,
  },
  avatarSection: {
    height: '100%',
    width: 64,
    paddingTop: 16,
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
  },
  infoSectionTopRow: {
    flex: 1,
    flexDirection: 'row',
    height: '50%',
  },
  infoSectionBottomRow: {
    flex: 1,
    height: '50%',
  },
  companyNameSection: {
    width: '68%',
    height: '100%',
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(2),
  },
  descriptionSection: {
    width: '96%',
    height: '100%',
    paddingTop: verticalScale(2),
  },
  dateButtonSection: {
    width: '32%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dateSection: {
    width: '70%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  buttonSection: {
    height: '50%',
    width: '30%',
    justifyContent: 'flex-end',
  },
  companyNameText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: 'bold',
    color: colors.cmGray1,
  },
  descriptionText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size8),
    color: colors.cmGray2,
  },
  dateText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size9),
    color: colors.cmGray3,
    marginBottom: 5,
  },
  newButtonSection: {
    height: '100%',
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  newLabel: {
    width: moderateScale(64),
    height: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cmGreen1,
    marginBottom: 5,
  },
  newLabelText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size9),
    fontWeight: '500',
    color: colors.cmWhite,
  },
  outerContainer: {
    position: 'absolute',
    zIndex: 1000,
    width: '100%',
    height: moderateScale(90, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export { styles }
