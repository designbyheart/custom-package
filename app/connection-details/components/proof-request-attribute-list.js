// @flow

// packages
import React, { Component } from 'react'
import {
  Text,
  View,
  TextInput,
  Platform,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native'
import Carousel from 'react-native-snap-carousel'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import debounce from 'lodash.debounce'
import { verticalScale, moderateScale } from 'react-native-size-matters'

// types
import type {
  ProofRequestAttributeListState,
  ProofRequestAttributeListAndHeaderProps,
} from '../../proof-request/type-proof-request'
import type { Attribute } from '../../push-notification/type-push-notification'
import type { ReactNavigation } from '../../common/type-common'

// constants
import {
  customValuesRoute,
  attributeValueRoute,
} from '../../common/route-constants'
import { BLANK_ATTRIBUTE_DATA_TEXT, DISSATISFIED_ATTRIBUTE_DATA_TEXT } from '../type-connection-details'

// components
import SvgCustomIcon from '../../components/svg-setting-icons'
import { ModalHeader } from './modal-header'

// styles
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'

// utils
import { generateStateForMissingAttributes, isInvalidValues } from '../utils'
import { Avatar } from '../../components'
import { renderAttachmentIcon } from './modal-content'
import { ALERT_ICON, ARROW_FORWARD_ICON, EvaIcon, PHOTO_ATTACHMENT_ICON } from '../../common/icons'
import Icon from '../../components/icon'

const screenWidth = Dimensions.get('window').width
const sliderWidth = screenWidth - screenWidth * 0.1

class ProofRequestAttributeList extends Component<
  ProofRequestAttributeListAndHeaderProps & ReactNavigation,
  ProofRequestAttributeListState
> {
  constructor(
    props: ProofRequestAttributeListAndHeaderProps & ReactNavigation
  ) {
    super(props)
    this.canEnableGenerateProof = debounce(
      this.canEnableGenerateProof.bind(this),
      250
    )
  }

  UNSAFE_componentWillReceiveProps(
    nextProps: ProofRequestAttributeListAndHeaderProps
  ) {
    if (this.props.missingAttributes !== nextProps.missingAttributes) {
      // once we know that there are missing attributes
      // then we generate state variable for each of them
      // because we will show user some input boxes and need to capture values
      // that user fills in them, also we need to enable generate proof button
      // once all the missing attributes are filled in by user
      this.setState(
        generateStateForMissingAttributes(nextProps.missingAttributes)
      )
    }
  }

  // this form is needed to fix flow error
  // because methods of a class are by default covariant
  // so we need an invariance to tell method signature
  canEnableGenerateProof = function () {
    const isInvalid = isInvalidValues(this.props.missingAttributes, this.state)
    this.props.canEnablePrimaryAction(!isInvalid, this.state)
  }

  onTextChange = (text: string, name: string) => {
    this.setState(
      {
        [name]: text,
      },
      this.canEnableGenerateProof
    )
  }

  onSwipe = (item: Attribute) => {
    this.props.updateSelectedClaims(item)
  }

  keyExtractor = ({ label }: Attribute, index: number) => `${label}${index}`

  handleCustomValuesNavigation = (label: string, adjustedLabel: string) => {
    const {
      navigation: { navigate },
    } = this.props
    const { onTextChange } = this

    return navigate(customValuesRoute, {
      label,
      onTextChange,
      labelValue: this.state?.[adjustedLabel],
    })
  }

  handleAttributeValuesNavigation = (label: string, adjustedLabel: string) => {
    const {
      navigation: { navigate },
    } = this.props
    const { onTextChange } = this

    return navigate(attributeValueRoute, {
      label,
      onTextChange,
      labelValue: this.state?.[adjustedLabel],
    })
  }

  // once we are going to render multiple values
  // then we have to render view for each pair in values and
  // collect them into one wrapping view
  renderValues = ({ item, index }: any) => {
    let logoUrl

    const views = Object.keys(item.values).map((label, keyIndex) => {
      const adjustedLabel = item.label.toLocaleLowerCase()
      const testID = 'proof-request-attribute-item'

      const value = item.values[label]
      const isDataEmptyString = value === ''

      if (!logoUrl) {
        logoUrl =
          value || isDataEmptyString
            ? item.claimUuid &&
              this.props.claimMap &&
              this.props.claimMap[item.claimUuid] &&
              this.props.claimMap[item.claimUuid].logoUrl
              ? { uri: this.props.claimMap[item.claimUuid].logoUrl }
              : this.props.userAvatarSource ||
                require('../../images/UserAvatar.png')
            : null
      }

      const selfAttestedAttribute = adjustedLabel in this.props.missingAttributes && !value && !item.dissatisfied
      const dissatisfiedAttribute = !value && item.dissatisfied

      const {
        handleCustomValuesNavigation,
        handleAttributeValuesNavigation,
      } = this
      return (
        <View key={`${index}_${keyIndex}`} style={styles.textAvatarWrapper}>
          <View style={styles.textInnerWrapper}>
            {selfAttestedAttribute ? ( // attribute can be self attested
                <View style={styles.wrapper}>
                  <Text style={styles.title}>{label}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleCustomValuesNavigation(label, adjustedLabel)
                    }
                  >
                    <TextInput
                      style={styles.contentInput}
                      defaultValue={
                        value
                          ? value
                          : this.state?.[adjustedLabel]
                          ? this.state?.[adjustedLabel] : '-'
                      }
                      autoCorrect={false}
                      blurOnSubmit={true}
                      clearButtonMode="always"
                      numberOfLines={3}
                      multiline={true}
                      maxLength={200}
                      placeholder={`Enter ${label}`}
                      returnKeyType="done"
                      testID={`${testID}-input-${adjustedLabel}`}
                      accessible={true}
                      accessibilityLabel={`${testID}-input-${adjustedLabel}`}
                      underlineColorAndroid="transparent"
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>
                </View>
              ) :
              dissatisfiedAttribute ? ( // attribute cannot be fulfilled
                  <View>
                    <Text style={styles.title}>{label}</Text>
                    <Text style={styles.dissatisfiedAttribute}>
                      {DISSATISFIED_ATTRIBUTE_DATA_TEXT}
                    </Text>
                  </View>
                ):  // If data is empty string, show the BLANK text in gray instead
              isDataEmptyString ? (
                <View>
                  <Text style={styles.title}>{label}</Text>
                    <Text style={styles.contentGray}>
                      {BLANK_ATTRIBUTE_DATA_TEXT}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <View style={styles.textAvatarWrapper}>
                      <View style={styles.textInnerWrapper}>
                        {renderAttachmentIcon(
                          label,
                          value,
                          item.claimUuid || '',
                          item.claimUuid || '',
                        )}
                      </View>
                      {
                        keyIndex === 0 &&
                        <View style={styles.avatarWrapper}>
                          <Icon
                            medium
                            round
                            resizeMode="cover"
                            src={logoUrl}
                          />
                        </View>
                      }
                    </View>
                  </View>
                )}
          </View>
          {
            !dissatisfiedAttribute && keyIndex === 0 &&
            <View style={styles.iconWrapper}>
              <EvaIcon
                name={ARROW_FORWARD_ICON}
                fill={colors.cmBlack}
              />
            </View>
          }
          {
            dissatisfiedAttribute && keyIndex === 0 &&
            <View style={styles.iconWrapper}>
              <EvaIcon
                name={ALERT_ICON}
                color={colors.cmRed}
              />
            </View>
          }
        </View>
      )
    })

    return (
      <View key={index} style={styles.wrapper}>
        <View>{views}</View>
      </View>
    )
  }

  renderItem = ({ item }: any) => {
    // convert item to array of item
    let items = item

    if (!Array.isArray(items)) {
      items = [items]
    }

    return (
      <Carousel
        layout={'default'}
        sliderWidth={sliderWidth}
        itemWidth={sliderWidth}
        onSnapToItem={(swipeIndex) => this.onSwipe(items[swipeIndex])}
        data={items}
        loop={true}
        renderItem={(data) => this.renderValues(data)}
      />
    )
  }

  render() {
    const attributes: Array<Attribute> = this.props.list
    const {
      institutionalName,
      credentialName,
      credentialText,
      imageUrl,
      colorBackground,
    } = this.props

    return (
      <KeyboardAwareFlatList
        scrollEnabled
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        style={styles.keyboardFlatList}
        data={attributes}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
        extraData={this.props}
        extraScrollHeight={Platform.OS === 'ios' ? 170 : null}
        ListHeaderComponent={() => (
          <ModalHeader
            {...{
              institutionalName,
              credentialName,
              credentialText,
              imageUrl,
              colorBackground,
            }}
          />
        )}
      />
    )
  }
}

export default ProofRequestAttributeList

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.cmWhite,
    paddingTop: moderateScale(12),
    ...Platform.select({
      ios: {
        borderBottomColor: colors.cmGray5,
        borderBottomWidth: StyleSheet.hairlineWidth,
      },
      android: {
        borderBottomColor: colors.cmGray5,
        borderBottomWidth: 1,
      },
    }),
  },
  textAvatarWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  textInnerWrapper: {
    width: '85%',
  },
  iconWrapper: {
    marginTop: moderateScale(16),
  },
  title: {
    fontSize: verticalScale(fontSizes.size7),
    fontWeight: '400',
    color: colors.cmGray3,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
  },
  contentInput: {
    fontSize: verticalScale(fontSizes.size5),
    height: 48,
    fontWeight: '700',
    color: colors.cmGray1,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
  },
  content: {
    fontSize: verticalScale(fontSizes.size5),
    marginBottom: moderateScale(12),
    fontWeight: '400',
    color: colors.cmGray1,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
  },
  contentGray: {
    fontSize: verticalScale(fontSizes.size5),
    marginTop: moderateScale(10),
    marginBottom: moderateScale(6),
    fontWeight: '400',
    color: colors.cmGray1,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
  },
  dissatisfiedAttribute: {
    fontSize: verticalScale(fontSizes.size4),
    marginTop: moderateScale(4),
    marginBottom: moderateScale(6),
    fontWeight: '700',
    color: colors.cmRed,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
  },
  keyboardFlatList: {
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  avatarWrapper: {
    width: '15%',
    paddingTop: moderateScale(10),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
})
