// @flow

// packages
import React, { useCallback } from 'react'
import { View, Platform, StyleSheet, TextInput, Text } from 'react-native'
import { verticalScale, moderateScale } from 'react-native-size-matters'

// constants
import { customValuesRoute } from '../../common/route-constants'

// components
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { ModalHeaderBar } from '../../components/modal-header-bar/modal-header-bar'

// types
import type { ReactNavigation } from '../../common/type-common'

// styles
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'

const CustomValues = ({
  navigation: { goBack },
  route: { params },
}: ReactNavigation) => {
  const hideModal = useCallback(() => {
    goBack(null)
  }, [])
  const adjustedLabel = params.label.toLocaleLowerCase()

  return (
    <>
      <View style={styles.modalWrapper}>
        <View style={styles.descriptionWrapper}>
          <Text style={styles.descriptionTitle}>
            Please provide values for the following attributes
          </Text>
        </View>
        <Text style={styles.labelText}>{params?.label || 'Attribute'}</Text>
        <View style={styles.customValuesWrapper}>
          <TextInput
            onChange={(e) => params.onTextChange(e, adjustedLabel)}
            placeholder="Please type..."
            defaultValue={params?.labelValue ? params?.labelValue : ''}
            style={styles.contentInput}
          />
        </View>
      </View>
      <ModalButtons
        onPress={() => goBack(null)}
        onIgnore={hideModal}
        topBtnText="Cancel"
        bottomBtnText="Done"
        disableAccept={false}
        colorBackground={colors.cmGreen1}
        numberOfLines={3}
        multiline={true}
        maxLength={200}
      />
    </>
  )
}

export const CustomValuesScreen = {
  routeName: customValuesRoute,
  screen: CustomValues,
}

CustomValuesScreen.screen.navigationOptions = ({
  navigation: { goBack, isFocused },
}) => ({
  safeAreaInsets: { top: 85 },
  cardStyle: {
    marginLeft: '2.5%',
    marginRight: '2.5%',
    marginBottom: '4%',
    borderRadius: 10,
    backgroundColor: colors.cmWhite,
  },
  cardOverlay: () => (
    <ModalHeaderBar
      headerTitle={isFocused() ? 'Custom Values' : ''}
      dismissIconType={isFocused() ? 'Arrow' : null}
      onPress={() => goBack(null)}
    />
  ),
})

const styles = StyleSheet.create({
  customValuesWrapper: {
    flex: 1,
  },
  descriptionWrapper: {
    ...Platform.select({
      ios: {
        borderBottomColor: colors.cmGray1,
        borderBottomWidth: 1,
      },
      android: {
        borderBottomColor: colors.cmGray1,
        borderBottomWidth: 1,
      },
    }),
    marginBottom: moderateScale(16),
    marginTop: moderateScale(16),
  },
  descriptionTitle: {
    color: colors.cmGray1,
    fontSize: verticalScale(fontSizes.size8),
    fontWeight: '300',
    marginBottom: moderateScale(16),
    textAlign: 'center',
  },
  contentInput: {
    fontSize: verticalScale(fontSizes.size5),
    height: 48,
    fontWeight: '400',
    color: colors.cmGray2,
    width: '100%',
    textAlign: 'left',
    paddingLeft: 10,
    fontFamily: fontFamily,
    borderTopColor: colors.cmGray3,
    borderTopWidth: 1,
    borderRightColor: colors.cmGray3,
    borderRightWidth: 1,
    borderBottomColor: colors.cmGray3,
    borderBottomWidth: 1,
    borderLeftColor: colors.cmGray3,
    borderLeftWidth: 1,
    borderRadius: 5,
  },
  modalWrapper: {
    flex: 1,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  labelText: {
    marginBottom: moderateScale(8),
  },
})
