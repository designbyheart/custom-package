// @flow
import React, { PureComponent } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { ImageColorPicker } from '../../components'
import { CheckmarkBadge } from '../../components/connection-details/checkmark-badge'
import { font, grey, isiPhone5, newBannerCardSizes, white } from '../../common/styles'
import { DefaultLogo } from '../../components/default-logo/default-logo'

// TODO: Fix the <any, void> to be the correct types for props and state
class ModalHeader extends PureComponent<any, void> {
  render() {
    const {
      institutialName,
      credentialName,
      credentialText,
      imageUrl,
      colorBackground,
    } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.imageSection}>
            {typeof imageUrl === 'string' ? (
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            ) :
              <DefaultLogo
                text={institutialName[0]}
                size={32}
                fontSize={21}
              />
            }
          </View>
          <View style={styles.issuerAndInfoSection}>
            <Text style={styles.issuerNameText}>{institutialName}</Text>
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
}

export { ModalHeader }

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'column',
    width: '100%',
    height: 114,
    shadowColor: '#000000',
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
    width: 64,
    paddingTop: 16,
    paddingLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issuerAndInfoSection: {
    flex: 1,
    paddingTop: 10,
  },
  checkmarkSection: {
    height: '100%',
    width: 64,
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: 16,
  },
  issuerNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#505050',
    fontFamily: 'Lato',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#777',
    fontFamily: 'Lato',
  },
  image: {
    width: 32,
    height: 32,
  },
  checkmark: {
    width: 23,
    height: 34.5,
  },
  bottomSection: {
    height: '50%',
    width: '100%',
    paddingLeft: 16,
    paddingRight: 16,
    justifyContent: 'center',
  },
  credentialProofQuestionText: {
    fontSize: 21,
    fontWeight: '400',
    color: '#505050',
    fontFamily: 'Lato',
    marginBottom: 4,
  },
})
