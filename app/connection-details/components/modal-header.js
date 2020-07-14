// @flow
import React, { useMemo } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { CheckmarkBadge } from '../../components/connection-details/checkmark-badge'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { colors, fontSizes, fontFamily } from '../../common/styles/constant'
import { DefaultLogo } from '../../components/default-logo/default-logo'

type ModalHeaderProps = {
  institutionalName: string,
  credentialName: string,
  credentialText: string,
  imageUrl: string,
  colorBackground: string,
}

export const ModalHeader = ({
  institutionalName,
  credentialName,
  credentialText,
  imageUrl,
  colorBackground,
}: ModalHeaderProps) => {
  const source = useMemo(() => ({ uri: imageUrl }), [imageUrl])

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.imageSection}>
          <Image style={styles.image} source={source} resizeMode="cover" />
        </View>
        <View style={styles.issuerAndInfoSection}>
          <Text style={styles.issuerNameText}>{institutionalName}</Text>
          <Text style={styles.infoText}>{credentialText}</Text>
        </View>
        <View style={styles.checkmarkSection}>
          <CheckmarkBadge color={colorBackground} />
        </View>
      </View>
      <View style={styles.bottomSection}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.credentialProofQuestionText}
        >
          {credentialName}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cmWhite,
    flexDirection: 'column',
    width: '100%',
    height: moderateScale(105),
    shadowColor: colors.cmBlack,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  topSection: {
    flexDirection: 'row',
    height: '50%',
    width: '100%',
  },
  imageSection: {
    height: '100%',
    width: moderateScale(64),
    paddingTop: moderateScale(16),
    paddingLeft: moderateScale(16),
  },
  issuerAndInfoSection: {
    flex: 1,
    paddingTop: moderateScale(10),
  },
  checkmarkSection: {
    height: '100%',
    width: moderateScale(64),
    alignItems: 'flex-end',
    paddingRight: moderateScale(16),
    paddingTop: moderateScale(16),
  },
  issuerNameText: {
    fontSize: verticalScale(fontSizes.size5),
    fontWeight: '700',
    color: colors.cmGray1,
    fontFamily: fontFamily,
  },
  infoText: {
    fontSize: verticalScale(fontSizes.size7),
    fontWeight: '400',
    color: colors.cmGray2,
    fontFamily: fontFamily,
  },
  image: {
    width: moderateScale(32),
    height: moderateScale(32),
  },
  bottomSection: {
    height: '50%',
    width: '100%',
    paddingLeft: moderateScale(16),
    paddingRight: moderateScale(16),
    justifyContent: 'center',
  },
  credentialProofQuestionText: {
    fontSize: verticalScale(fontSizes.size3),
    fontWeight: '400',
    color: colors.cmGray1,
    fontFamily: fontFamily,
    marginBottom: moderateScale(4),
  },
})
