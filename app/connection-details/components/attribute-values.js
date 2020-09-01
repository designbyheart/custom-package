// @flow

// packages
import React, { useCallback } from 'react'
import { View, Platform, StyleSheet, TextInput, Text } from 'react-native'
import { verticalScale, moderateScale } from 'react-native-size-matters'

// constants
import { attributeValueRoute } from '../../common/route-constants'

// components
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { ModalHeaderBar } from '../../components/modal-header-bar/modal-header-bar'

// types
import type { ReactNavigation } from '../../common/type-common'

// styles
import { colors, fontSizes } from '../../common/styles/constant'

const AttributeValues = ({
  navigation: { goBack },
  route: { params },
}: ReactNavigation) => {
  const hideModal = useCallback(() => {
    goBack(null)
  }, [])
  return (
    <>
      <View style={styles.modalWrapper}>
        <View style={styles.descriptionWrapper}>
          <Text style={styles.labelText}>{params?.label || 'Attribute'}</Text>
          <Text style={styles.descriptionTitle}>3 sources</Text>
        </View>
        <View style={styles.customValuesWrapper}></View>
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

export const AttributeValuesScreen = {
  routeName: attributeValueRoute,
  screen: AttributeValues,
}

AttributeValuesScreen.screen.navigationOptions = ({
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
      headerTitle={isFocused() ? 'Select Attribute Value' : ''}
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
    fontSize: verticalScale(fontSizes.size7),
    fontWeight: '300',
    marginBottom: moderateScale(16),
  },
  modalWrapper: {
    flex: 1,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  labelText: {
    fontSize: verticalScale(fontSizes.size4),
    fontWeight: '700',
    color: colors.cmGray1,
  },
})
