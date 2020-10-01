// @flow

// packages
import React, { Component } from 'react'
import {
  Text,
  View,
  TextInput,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import debounce from 'lodash.debounce'
import { verticalScale, moderateScale } from 'react-native-size-matters'

// types
import type {
  ProofRequestAttributeListState,
  ProofRequestAttributeListAndHeaderProps,
} from '../../proof-request/type-proof-request'
import type { Attribute } from '../../push-notification/type-push-notification'
import type {
  ReactNavigation,
  RequestedAttrsJson,
} from '../../common/type-common'

// constants
import {
  customValuesRoute,
  attributeValueRoute,
} from '../../common/route-constants'
import {
  BLANK_ATTRIBUTE_DATA_TEXT,
  DISSATISFIED_ATTRIBUTE_DATA_TEXT,
} from '../type-connection-details'

// components
import { ModalHeader } from './modal-header'

// styles
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'

// utils
import { generateStateForMissingAttributes, isInvalidValues } from '../utils'
import { renderAttachmentIcon } from './modal-content'
import { ALERT_ICON, ARROW_FORWARD_ICON, EvaIcon } from '../../common/icons'
import Icon from '../../components/icon'
import { attributesValueRoute } from '../../common'
import { isSelected } from './attributes-values'
import { DefaultLogo } from '../../components/default-logo/default-logo'
import { REQUESTED_ATTRIBUTE_TYPE } from '../../proof-request/type-proof-request'

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
        generateStateForMissingAttributes(nextProps.missingAttributes),
      )
    }
  }

  // this form is needed to fix flow error
  // because methods of a class are by default covariant
  // so we need an invariance to tell method signature
  canEnableGenerateProof = function() {
    const isInvalid = isInvalidValues(this.props.missingAttributes, this.state)
    this.props.canEnablePrimaryAction(!isInvalid)
  }

  onTextChange = (text: string, name: string, key: string) => {
    this.props.updateAttributesFilledByUser({
      label: name,
      value: text,
      key: key,
    })

    this.setState(
      {
        [name]: text,
      },
      this.canEnableGenerateProof
    )
  }

  keyExtractor = (_: Attribute, index: number) => `${index}`

  handleCustomValuesNavigation = (label: string, adjustedLabel: string, key: string) => {
    const {
      navigation: { navigate },
    } = this.props
    const { onTextChange } = this

    return navigate(customValuesRoute, {
      label,
      onTextChange,
      labelValue: this.state?.[adjustedLabel],
      key,
      navigate,
    })
  }

  handleAttributeValuesNavigation = (label: string, items: any, attributesFilledFromCredential: RequestedAttrsJson) => {
    const {
      navigation: { navigate },
    } = this.props
    const { onTextChange } = this

    if (!items[0]) {
      return
    }

    const keys = Object.keys(items[0].values)
    if (keys.length === 1) {
      return navigate(attributeValueRoute, {
        label: keys.join(),
        onTextChange,
        items,
        attributesFilledFromCredential,
        claimMap: this.props.claimMap,
        updateAttributesFilledFromCredentials: this.props.updateAttributesFilledFromCredentials,
        onCustomValueSet: this.onTextChange,
      })
    } else {
      return navigate(attributesValueRoute, {
        label: keys.join(),
        sender: this.props.institutionalName,
        onTextChange,
        items,
        attributesFilledFromCredential,
        claimMap: this.props.claimMap,
        updateAttributesFilledFromCredentials: this.props.updateAttributesFilledFromCredentials,
      })
    }
  }

  renderFilledAttribute = ({ item, index }: any, attributesFilledFromCredential: RequestedAttrsJson, attributesFilledByUser: any) => {
    let logoUrl

    const items = item
    const attribute = items[0]

    let views

    const {
      handleAttributeValuesNavigation,
    } = this

    if (attributesFilledFromCredential[attribute.key]) {
      const selectedItem = items.find((item) => isSelected(item, attributesFilledFromCredential))

      views = Object.keys(selectedItem.values).map((label, keyIndex) => {
        const value = selectedItem.values[label]
        const isDataEmptyString = value === ''

        let claim = selectedItem.claimUuid &&
          this.props.claimMap &&
          this.props.claimMap[selectedItem.claimUuid] || {}

        if (!logoUrl) {
          logoUrl =
            claim.logoUrl
              ? { uri: claim.logoUrl }
              : null
        }

        return (
          <View key={`${index}_${keyIndex}`} style={styles.textAvatarWrapper}>
            <View style={styles.textInnerWrapper}>
              {// If data is empty string, show the BLANK text in gray instead
                isDataEmptyString ? (
                  <View>
                    <Text style={styles.title}>{label}</Text>
                    <Text style={styles.contentGray}>
                      {BLANK_ATTRIBUTE_DATA_TEXT}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      onPress={() =>
                        handleAttributeValuesNavigation(label, items, attributesFilledFromCredential)
                      }
                    >
                      <View style={styles.textAvatarWrapper}>
                        <View style={styles.textInnerWrapper}>
                          {renderAttachmentIcon(
                            label,
                            value,
                            selectedItem.claimUuid || '',
                            selectedItem.claimUuid || '',
                          )}
                        </View>
                        {
                          keyIndex === 0 &&
                          <View style={styles.avatarWrapper}>
                            {
                              logoUrl ?
                                <Icon
                                  medium
                                  round
                                  resizeMode="cover"
                                  src={logoUrl}
                                /> :
                                claim && claim.senderName &&
                                <DefaultLogo text={claim.senderName} size={30} fontSize={18}/>
                            }
                          </View>
                        }
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
            {
              keyIndex === 0 &&
              <View style={styles.iconWrapper}>
                <EvaIcon name={ARROW_FORWARD_ICON} fill={colors.cmBlack}/>
              </View>
            }
          </View>
        )
      })
    } else {
      const value = attributesFilledByUser[attribute.key]
      views = (
        <View style={styles.textAvatarWrapper}>
          <View style={styles.textInnerWrapper}>
            <View>
              <TouchableOpacity
                onPress={() =>
                  handleAttributeValuesNavigation(attribute.label, items, attributesFilledFromCredential)
                }
              >
                <View style={styles.textAvatarWrapper}>
                  <View style={styles.textInnerWrapper}>
                    {renderAttachmentIcon(
                      attribute.label,
                      value,
                      attribute.claimUuid || '',
                      attribute.claimUuid || '',
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.iconWrapper}>
            <EvaIcon name={ARROW_FORWARD_ICON} fill={colors.cmBlack}/>
          </View>
        </View>
      )
    }

    return (
      <View key={index} style={styles.wrapper}>
        <View>{views}</View>
      </View>
    )
  }

  renderSelfAttestedAttribute = ({ attribute, index }: any) => {
    const views = Object.keys(attribute.values).map((label, keyIndex) => {
      const adjustedLabel = label.toLocaleLowerCase()
      const testID = 'proof-request-attribute-item'
      const value = attribute.values[label]

      const { handleCustomValuesNavigation } = this
      return (
        <View key={`${index}_${keyIndex}`} style={styles.textAvatarWrapper}>
          <View style={styles.textInnerWrapper}>
            <View style={styles.wrapper}>
              <Text style={styles.title}>{label}</Text>
              <TouchableOpacity
                onPress={() =>
                  handleCustomValuesNavigation(label, adjustedLabel, attribute.key)
                }
              >
                <TextInput
                  style={styles.contentInput}
                  defaultValue={
                    value
                      ? value
                      : this.state?.[adjustedLabel]
                      ? this.state?.[adjustedLabel]
                      : '-'
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
          </View>
          {keyIndex === 0 && (
            <View style={styles.iconWrapper}>
              <EvaIcon name={ARROW_FORWARD_ICON} fill={colors.cmBlack} />
            </View>
          )}
        </View>
      )
    })

    return (
      <View key={index} style={styles.wrapper}>
        <View>{views}</View>
      </View>
    )
  }

  renderDissatisfiedAttribute = ({ attribute, index }: any) => {
    const views = Object.keys(attribute.values).map((label, keyIndex) => {
      return (
        <View key={`${index}_${keyIndex}`} style={styles.textAvatarWrapper}>
          <View style={styles.textInnerWrapper}>
            <View>
              <Text style={styles.title}>{label}</Text>
              <Text style={styles.dissatisfiedAttribute}>
                {DISSATISFIED_ATTRIBUTE_DATA_TEXT}
              </Text>
            </View>
          </View>
          {keyIndex === 0 && (
            <View style={styles.iconWrapper}>
              <EvaIcon name={ALERT_ICON} color={colors.cmRed} />
            </View>
          )}
        </View>
      )
    })

    return (
      <View key={index} style={styles.wrapper}>
        <View>{views}</View>
      </View>
    )
  }

  // once we are going to render multiple values
  // then we have to render view for each pair in values and
  // collect them into one wrapping view
  renderValues = ({ item, index }: any, attributesFilledFromCredential: RequestedAttrsJson, attributesFilledByUser: any) => {
    const items = item

    if (!items[0]) {
      return <View />
    }

    const attribute = items[0]

    if (attribute.type === REQUESTED_ATTRIBUTE_TYPE.FILLED) {
      return this.renderFilledAttribute({ item, index }, attributesFilledFromCredential, attributesFilledByUser)
    } else if (attribute.type === REQUESTED_ATTRIBUTE_TYPE.SELF_ATTESTED) {
      return this.renderSelfAttestedAttribute({ attribute, index })
    } else if (attribute.type === REQUESTED_ATTRIBUTE_TYPE.DISSATISFIED) {
      return this.renderDissatisfiedAttribute({ attribute, index })
    } else {
      return <View/>
    }
  }

  render() {
    const attributes: Array<Attribute> = this.props.list

    const {
      institutionalName,
      credentialName,
      credentialText,
      imageUrl,
      colorBackground,
      attributesFilledFromCredential,
      attributesFilledByUser,
    } = this.props

    return (
      <KeyboardAwareFlatList
        scrollEnabled
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        style={styles.keyboardFlatList}
        data={attributes}
        keyExtractor={this.keyExtractor}
        renderItem={(item) => this.renderValues(item, attributesFilledFromCredential, attributesFilledByUser)}
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
    width: '90%',
  },
  iconWrapper: {
    marginTop: moderateScale(16),
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: verticalScale(fontSizes.size6),
    fontWeight: '400',
    color: colors.cmGray3,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
    lineHeight: verticalScale(17),
  },
  contentInput: {
    padding: 0,
    fontSize: verticalScale(fontSizes.size3),
    height: verticalScale(32),
    fontWeight: '700',
    color: colors.cmGray1,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
    lineHeight: verticalScale(23),
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
    fontSize: verticalScale(fontSizes.size3),
    marginTop: moderateScale(4),
    marginBottom: moderateScale(6),
    fontWeight: '700',
    color: colors.cmRed,
    width: '100%',
    textAlign: 'left',
    fontFamily: fontFamily,
    lineHeight: verticalScale(23),
  },
  keyboardFlatList: {
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  avatarWrapper: {
    paddingTop: moderateScale(10),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
})
