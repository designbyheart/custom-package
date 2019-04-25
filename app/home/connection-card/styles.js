// @flow
import { StyleSheet, Platform } from 'react-native'
import { color } from '../../common/styles/constant'

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: color.border.primary,
  },
  initialsContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border.primary,
  },
  initialsText: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    color: color.textColor.darkgray,
  },
  newCardContainer: {
    backgroundColor: color.bg.sixteenth.color,
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
  },
  descriptionSection: {
    width: '96%',
    height: '100%',
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
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    color: color.textColor.darkgray,
  },
  descriptionText: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: color.textColor.grey,
  },
  dateText: {
    fontFamily: 'Lato',
    fontSize: 11,
    color: color.textColor.mediumGray,
    marginBottom: 5,
  },
  newButtonSection: {
    height: '100%',
    width: '30%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  newLabel: {
    width: 64,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.bg.twelfth.color,
    marginBottom: 5,
  },
  newLabelText: {
    fontFamily: 'Lato',
    fontSize: 11,
    fontWeight: '500',
    color: color.bg.primary.font.primary,
  },
})

export { styles }
