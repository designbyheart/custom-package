// @flow

// packages
import React, { useCallback, useState } from 'react'
import { View, Platform, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native'
import { verticalScale, moderateScale } from 'react-native-size-matters'

// constants
import { attributeValueRoute } from '../../common/route-constants'

// components
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { ModalHeaderBar } from '../../components/modal-header-bar/modal-header-bar'

// types
import type { ReactNavigation } from '../../common/type-common'

// styles
import { colors, fontSizes, fontFamily } from '../../common/styles/constant'
import { Avatar } from '../../components'
import { DefaultLogo } from '../../components/default-logo/default-logo'
import { CHECKMARK_ICON, EvaIcon } from '../../common/icons'
import { DataRenderer, getFileExtensionName, renderAttachmentIcon } from './modal-content'
import { isSelected, keyExtractor, prepareCredentials } from './attributes-values'

const AttributeValues = ({
                           navigation: { goBack },
                           route: { params },
                         }: ReactNavigation) => {
  const [selectedValueIndex, setSelectedValueIndex] = useState(params.items.findIndex(
    (item: Object) => isSelected(item, params.selectedClaims),
  ))
  const [data, _] = useState(prepareCredentials(params.items, params.claimMap))

  const hideModal = useCallback(() => {
    goBack(null)
  }, [])

  const onDone = useCallback(() => {
    const selectedValue = params.items[selectedValueIndex]
    params.updateSelectedClaims(selectedValue)
    goBack(null)
  }, [selectedValueIndex])

  const renderItem = ({ item, index }: { item: Object, index: number }) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() =>
            setSelectedValueIndex(index)
          }
        >
          <View style={styles.itemContainer}>
            <View style={styles.avatarSection}>
              {typeof item.logoUrl === 'string' ? (
                <Avatar
                  radius={18}
                  src={{ uri: item.logoUrl }}
                />
              ) : (
                <DefaultLogo text={item.senderName} size={32} fontSize={17}/>
              )}
            </View>
            <View style={styles.infoSection}>
              <View style={styles.infoSectionTopRow}>
                <Text
                  style={styles.credentialNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {
                    item.label.toLowerCase().endsWith('_link') ?
                      `${getFileExtensionName(JSON.parse(item.data)['mime-type'])} file` :
                      item.data
                  }
                </Text>
              </View>
              <View style={styles.infoSectionBottomRow}>
                <View style={styles.attributesSection}>
                  <Text
                    style={styles.attributesText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.credentialName}
                  </Text>
                </View>
              </View>
              {item.label.toLowerCase().endsWith('_link') &&
              <View style={styles.attachmentWrapper}>
                <DataRenderer {...{
                  label: item.label,
                  data: item.data,
                  uid: item.claimUuid || '',
                  remotePairwiseDID: item.claimUuid || '',
                }} />
              </View>
              }
            </View>
            {index === selectedValueIndex && (
              <View style={styles.iconWrapper}>
                <EvaIcon
                  name={CHECKMARK_ICON}
                  color={colors.cmBlack}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      <View style={styles.modalWrapper}>
        <View style={styles.descriptionWrapper}>
          <Text style={styles.labelText}>{params?.label || 'Attribute'}</Text>
          <Text style={styles.descriptionTitle}>{params.items.length} sources</Text>
        </View>
        <View style={styles.customValuesWrapper}>
          <FlatList
            keyExtractor={keyExtractor}
            style={styles.container}
            data={data}
            renderItem={renderItem}
          />
        </View>
      </View>
      <ModalButtons
        onPress={onDone}
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
    paddingVertical: moderateScale(16),
  },
  descriptionTitle: {
    color: colors.cmGray1,
    fontSize: verticalScale(fontSizes.size6),
    fontWeight: '300',
    fontFamily: fontFamily,
    lineHeight: verticalScale(17),
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
    fontFamily: fontFamily,
    marginVertical: verticalScale(6),
    lineHeight: verticalScale(20),
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.cmWhite,
  },
  itemContainer: {
    width: '100%',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.cmGray5,
    paddingVertical: moderateScale(12),
  },
  avatarSection: {
    alignItems: 'flex-start',
  },
  infoSection: {
    flex: 1,
  },
  infoSectionTopRow: {
    flex: 1,
    flexDirection: 'row',
    height: verticalScale(20),
  },
  infoSectionBottomRow: {
    flex: 1,
    height: verticalScale(17),
  },
  attributesSection: {
    width: '96%',
    height: '100%',
  },
  credentialNameText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size4),
    fontWeight: 'bold',
    color: colors.cmGray1,
  },
  credentialNameWrapper: {
    paddingBottom: moderateScale(0),
  },
  attributesText: {
    fontFamily: fontFamily,
    fontSize: verticalScale(fontSizes.size6),
    color: colors.cmGray2,
  },
  content: {
    fontSize: verticalScale(fontSizes.size4),
    fontWeight: '700',
    color: '#505050',
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
  },
  iconWrapper: {
    marginTop: verticalScale(8),
  },
  attachmentWrapper: {
    marginTop: verticalScale(16),
  },
})
