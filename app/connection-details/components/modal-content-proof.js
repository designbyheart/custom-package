// @flow
import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from 'react-native'
import { ModalButtons } from '../../components/buttons/modal-buttons'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Container,
  CustomView,
  CustomButton,
  CustomText,
  Avatar,
  Icon,
  ConnectionTheme,
  ClaimProofHeader,
  Separator,
  FooterActions,
  UserAvatar,
  headerStyles,
} from '../../components'
import { BorderSeparator } from '../../components/connection-details/border-separator'
import type {
  ProofRequestProps,
  AdditionalProofDataPayload,
  ProofRequestAttributeListState,
  MissingAttributes,
  ProofRequestState,
  ProofRequestAttributeListProp,
  SelfAttestedAttributes,
} from '../../proof-request/type-proof-request'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import debounce from 'lodash.debounce'
import Swiper from 'react-native-swiper'
import {
  rejectProofRequest,
  acceptProofRequest,
  ignoreProofRequest,
  proofRequestShown,
  proofRequestShowStart,
  denyProofRequest,
} from '../../proof-request/proof-request-store'
import {
  getConnectionLogoUrl,
  getUserAvatarSource,
} from '../../store/store-selector'
import { ERROR_CODE_MISSING_ATTRIBUTE } from '../../proof/type-proof'
import {
  PRIMARY_ACTION_SEND,
  PRIMARY_ACTION_GENERATE_PROOF,
  SECONDARY_ACTION_IGNORE,
  MESSAGE_MISSING_ATTRIBUTES_DESCRIPTION,
  MESSAGE_MISSING_ATTRIBUTES_TITLE,
  MESSAGE_ERROR_PROOF_GENERATION_TITLE,
  MESSAGE_ERROR_PROOF_GENERATION_DESCRIPTION,
  PROOF_STATUS,
  MESSAGE_ERROR_DISSATISFIED_ATTRIBUTES_TITLE,
  MESSAGE_ERROR_DISSATISFIED_ATTRIBUTES_DESCRIPTION,
} from '../../proof-request/type-proof-request'
import { newConnectionSeen } from '../../connection-history/connection-history-store'
import {
  userSelfAttestedAttributes,
  updateAttributeClaim,
  getProof,
} from '../../proof/proof-store'
import { brown } from 'color-name'
import type {
  GenericObject,
  GenericStringObject,
  CustomError,
} from '../../common/type-common'
import type { Attribute } from '../../push-notification/type-push-notification'
import type { Store } from '../../store/type-store'

export function generateStateForMissingAttributes(
  missingAttributes: MissingAttributes | {}
) {
  return Object.keys(missingAttributes).reduce(
    (acc, attributeName) => ({
      ...acc,
      [attributeName]: '',
    }),
    {}
  )
}

export function isInvalidValues(
  missingAttributes: MissingAttributes | {},
  userFilledValues: GenericObject
): boolean {
  return Object.keys(missingAttributes).some(attributeName => {
    const userFilledValue = userFilledValues[attributeName]

    if (!userFilledValue) {
      return true
    }

    const adjustedUserFilledValue = userFilledValue.trim()

    if (!adjustedUserFilledValue) {
      return true
    }

    return false
  })
}

class ProofRequestAttributeList extends Component<
  ProofRequestAttributeListProp,
  ProofRequestAttributeListState
> {
  constructor(props: ProofRequestAttributeListProp) {
    super(props)
    this.canEnableGenerateProof = debounce(
      this.canEnableGenerateProof.bind(this),
      250
    )
  }

  componentWillReceiveProps(nextProps: ProofRequestAttributeListProp) {
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
  canEnableGenerateProof = function() {
    const isInvalid = isInvalidValues(this.props.missingAttributes, this.state)
    this.props.canEnablePrimaryAction(!isInvalid, this.state)
  }

  onTextChange = (e, name: string) => {
    const { text } = e.nativeEvent
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

  renderItem = ({ item, index }) => {
    // convert item to array of item
    let items = item
    if (!Array.isArray(items)) {
      items = [items]
    }

    return (
      <Swiper
        showsButtons={false}
        showsPagination={false}
        height={69}
        onIndexChanged={swipeIndex => this.onSwipe(items[swipeIndex])}
      >
        {items.map((item, itemIndex) => {
          const adjustedLabel = item.label.toLocaleLowerCase()
          const testID = 'proof-request-attribute-item'
          const logoUrl = item.data
            ? item.claimUuid &&
              this.props.claimMap &&
              this.props.claimMap[item.claimUuid] &&
              this.props.claimMap[item.claimUuid].logoUrl
              ? { uri: this.props.claimMap[item.claimUuid].logoUrl }
              : this.props.userAvatarSource ||
                require('../../images/UserAvatar.png')
            : null
          const showInputBox =
            adjustedLabel in this.props.missingAttributes && !item.data

          return (
            <View key={itemIndex} style={styles.wrapper}>
              <Text style={styles.title}>{item.label}</Text>
              <View style={styles.textAvatarWrapper}>
                <View style={styles.textWrapper}>
                  {showInputBox ? (
                    <TextInput
                      style={styles.content}
                      autoCorrect={false}
                      blurOnSubmit={true}
                      clearButtonMode="always"
                      numberOfLines={3}
                      multiline={true}
                      maxLength={200}
                      placeholder={`Enter ${item.label}`}
                      returnKeyType="done"
                      testID={`${testID}-input-${adjustedLabel}`}
                      accessible={true}
                      accessibilityLabel={`${testID}-input-${adjustedLabel}`}
                      onChange={e => this.onTextChange(e, adjustedLabel)}
                      editable={!this.props.disableUserInputs}
                      underlineColorAndroid="transparent"
                    />
                  ) : (
                    <Text style={styles.titleFilledValues}>{item.data}</Text>
                  )}
                </View>
                <View style={styles.avatarWrapper}>
                  <Icon
                    medium
                    round
                    resizeMode="cover"
                    src={logoUrl}
                    testID={`proof-requester-logo-${index}`}
                  />
                </View>
              </View>
            </View>
          )
        })}
      </Swiper>
    )
  }

  render() {
    const attributes: Array<Attribute> = this.props.list
    return (
      <KeyboardAwareFlatList
        scrollEnabled
        enableOnAndroid
        style={styles.keyboardFlatList}
        data={attributes}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
        extraData={this.props}
        extraScrollHeight={Platform.OS === 'ios' ? 170 : null}
        ItemSeparatorComponent={BorderSeparator}
        ListFooterComponent={BorderSeparator}
      />
    )
  }
}

export function convertUserFilledValuesToSelfAttested(
  userFilledValues: GenericStringObject,
  missingAttributes: MissingAttributes | {}
): SelfAttestedAttributes {
  return Object.keys(missingAttributes).reduce((acc, name) => {
    return {
      ...acc,
      [name]: {
        name,
        data: userFilledValues[name],
        key: missingAttributes[name].key,
      },
    }
  }, {})
}

export function getPrimaryActionText(
  missingAttributes: MissingAttributes | {},
  generateProofClicked: boolean
) {
  if (generateProofClicked) {
    return PRIMARY_ACTION_SEND
  }

  return Object.keys(missingAttributes).length > 0
    ? PRIMARY_ACTION_GENERATE_PROOF
    : PRIMARY_ACTION_SEND
}

export const isPropEmpty = (prop: string) => (
  data: GenericObject | Array<Attribute>
) => {
  if (Array.isArray(data)) {
    return data.some(missingData)
  }
  return !data[prop]
}

export const missingData = isPropEmpty('data')

export function enablePrimaryAction(
  missingAttributes: MissingAttributes | {},
  generateProofClicked: boolean,
  allMissingAttributesFilled: boolean,
  error: ?CustomError,
  requestedAttributes: Attribute[]
) {
  // we need to decide on whether to enable Send/Generate-Proof button

  if (error) {
    return false
  }

  const missingCount = Object.keys(missingAttributes).length
  if (missingCount > 0) {
    if (allMissingAttributesFilled === false) {
      return false
    }

    if (generateProofClicked === false) {
      return true
    }
  }

  const isMissingData = requestedAttributes.some(missingData)
  if (isMissingData) {
    return false
  }

  return true
}

export function hasMissingAttributes(
  missingAttributes: MissingAttributes | {}
) {
  return Object.keys(missingAttributes).length > 0
}

export function getMissingAttributeNames(
  missingAttributes: MissingAttributes | {}
) {
  return Object.keys(missingAttributes).join(', ')
}

class ModalContentProof extends Component<
  ProofRequestProps,
  ProofRequestState
> {
  constructor(props) {
    super(props)
    if (this.props.uid) {
      props.proofRequestShowStart(this.props.uid)
    }
    this.state = {
      allMissingAttributesFilled: false,
      generateProofClicked: false,
      selfAttestedAttributes: {},
      disableUserInputs: false,
      selectedClaims: {},
      disableSendButton: false,
    }
    this.onSend = this.onSend.bind(this)
  }
  convertUserFilledValuesToSelfAttested(
    userFilledValues: GenericStringObject,
    missingAttributes: MissingAttributes | {}
  ): SelfAttestedAttributes {
    return Object.keys(missingAttributes).reduce((acc, name) => {
      return {
        ...acc,
        [name]: {
          name,
          data: userFilledValues[name],
          key: missingAttributes[name].key,
        },
      }
    }, {})
  }

  componentDidUpdate() {
    if (this.props.dissatisfiedAttributes.length > 0) {
      Alert.alert(
        MESSAGE_ERROR_DISSATISFIED_ATTRIBUTES_TITLE,
        MESSAGE_ERROR_DISSATISFIED_ATTRIBUTES_DESCRIPTION(
          this.props.dissatisfiedAttributes,
          this.props.name
        ),
        [
          {
            text: 'Ignore',
            onPress: this.onIgnore,
          },
          {
            text: 'Reject',
            onPress: this.onDeny,
          },
        ],
        { cancelable: false }
      )
    }
  }

  componentWillReceiveProps(nextProps: ProofRequestProps) {
    if (
      this.props.missingAttributes !== nextProps.missingAttributes &&
      hasMissingAttributes(nextProps.missingAttributes)
    ) {
      Alert.alert(
        MESSAGE_MISSING_ATTRIBUTES_TITLE,
        MESSAGE_MISSING_ATTRIBUTES_DESCRIPTION(nextProps.name)
      )
    }

    if (
      (this.props.proofGenerationError !== nextProps.proofGenerationError &&
        nextProps.proofGenerationError) ||
      nextProps.proofStatus === PROOF_STATUS.SEND_PROOF_FAIL
    ) {
      setTimeout(() => {
        Alert.alert(
          MESSAGE_ERROR_PROOF_GENERATION_TITLE,
          MESSAGE_ERROR_PROOF_GENERATION_DESCRIPTION,
          [
            {
              text: 'Ok',
              onPress: () => {
                this.setState({
                  disableSendButton: false,
                })
              },
            },
          ],
          { cancelable: false }
        )
      }, 300)
    }

    if (
      this.props.errorProofSendData !== nextProps.errorProofSendData &&
      nextProps.errorProofSendData
    ) {
      setTimeout(() => {
        Alert.alert(
          MESSAGE_ERROR_PROOF_GENERATION_TITLE,
          MESSAGE_ERROR_PROOF_GENERATION_DESCRIPTION,
          [
            {
              text: 'Retry',
              onPress: () => {
                this.onRetry()
              },
            },
            {
              text: 'Cancel',
              onPress: () => {
                this.onIgnore()
              },
            },
          ],
          { cancelable: false }
        )
      }, 300)
    }
    if (
      this.props.data &&
      this.props.data.requestedAttributes !== nextProps.data.requestedAttributes
    ) {
      const selectedClaims = nextProps.data.requestedAttributes.reduce(
        (acc, item) => {
          const items = { ...acc }
          if (Array.isArray(item)) {
            if (item[0].claimUuid) {
              items[`${item[0].key}`] = [
                item[0].claimUuid,
                true,
                item[0].cred_info,
              ]
            }
          }
          return items
        },
        {}
      )
      this.setState({ selectedClaims })
    }
  }

  updateSelectedClaims = (item: Attribute) => {
    if (this.state.selectedClaims && item && item.key) {
      const selectedClaims = {
        ...this.state.selectedClaims,
        [`${item.key}`]: [item.claimUuid, true, item.cred_info],
      }
      this.setState({ selectedClaims })
    }
  }

  canEnablePrimaryAction = (
    canEnable: boolean,
    selfAttestedAttributes: GenericStringObject
  ) => {
    this.setState({
      allMissingAttributesFilled: canEnable,
      selfAttestedAttributes,
    })
  }
  updateFirstTimeClaim() {
    const selectedClaims = this.props.data.requestedAttributes.reduce(
      (acc, item) => {
        const items = { ...acc }
        if (Array.isArray(item)) {
          if (item[0].claimUuid) {
            items[`${item[0].key}`] = [
              item[0].claimUuid,
              true,
              item[0].cred_info,
            ]
          }
        }
        return items
      },
      {}
    )
    this.setState({ selectedClaims })
  }

  componentDidMount() {
    this.props.proofRequestShown(this.props.uid)
    this.props.getProof(this.props.uid)
  }

  onIgnore = () => {
    this.props.newConnectionSeen(this.props.remotePairwiseDID)
    this.props.ignoreProofRequest(this.props.uid)
    this.props.hideModal()
  }

  onReject = () => {
    this.props.rejectProofRequest(this.props.uid)
    this.props.hideModal()
  }

  onRetry = () => {
    this.props.updateAttributeClaim(this.props.uid, this.state.selectedClaims)
  }

  onDeny = () => {
    this.props.denyProofRequest(this.props.uid)
    this.props.hideModal()
  }

  onSend = () => {
    if (
      this.state.generateProofClicked ||
      !hasMissingAttributes(this.props.missingAttributes)
    ) {
      // if we don't find any missing attributes then
      // user will never see generate proof button and we don't need to wait for
      // generate proof button to be clicked after all attributes are filled
      // this.props.getProof(this.props.uid)
      this.setState({
        disableSendButton: true,
      })
      this.props.newConnectionSeen(this.props.remotePairwiseDID)
      this.props.updateAttributeClaim(this.props.uid, this.state.selectedClaims)
      this.props.hideModal()
    } else {
      this.setState({
        generateProofClicked: true,
        disableUserInputs: true,
        disableSendButton: false,
      })

      this.props.userSelfAttestedAttributes(
        convertUserFilledValuesToSelfAttested(
          this.state.selfAttestedAttributes,
          this.props.missingAttributes
        ),
        this.props.uid
      )
    }
  }

  render() {
    const {
      data,
      name,
      uid,
      isValid,
      proofStatus,
      remotePairwiseDID,
      logoUrl,
      claimMap,
      missingAttributes,
      proofGenerationError,
    } = this.props

    const primaryActionText = getPrimaryActionText(
      this.props.missingAttributes,
      this.state.generateProofClicked
    )
    const enablePrimaryActionStatus = enablePrimaryAction(
      this.props.missingAttributes,
      this.state.generateProofClicked,
      this.state.allMissingAttributesFilled,
      proofGenerationError,
      this.props.data.requestedAttributes
    )

    return (
      <View style={styles.outerModalWrapper}>
        <View style={styles.innerModalWrapper}>
          <ProofRequestAttributeList
            list={this.props.data.requestedAttributes}
            claimMap={this.props.claimMap}
            missingAttributes={this.props.missingAttributes}
            canEnablePrimaryAction={this.canEnablePrimaryAction}
            disableUserInputs={this.state.disableUserInputs}
            userAvatarSource={this.props.userAvatarSource}
            updateSelectedClaims={this.updateSelectedClaims}
          />
        </View>
        <ModalButtons
          onPress={() => this.onSend()}
          onIgnore={() => this.onIgnore()}
          colorBackground={this.props.colorBackground}
          secondColorBackground={this.props.secondColorBackground}
          leftBtnText={'Ignore'}
          rightBtnText={primaryActionText}
          disableAccept={
            !enablePrimaryActionStatus || this.state.disableSendButton
          }
        />
      </View>
    )
  }
}

const mapStateToProps = (state: Store, mergeProps) => {
  const { proofRequest } = state
  const uid = mergeProps.uid
  const proofRequestData = proofRequest[uid] || {}
  const {
    data,
    requester = {},
    proofStatus,
    remotePairwiseDID,
    missingAttributes = {},
    dissatisfiedAttributes = [],
  } = proofRequestData
  const { name } = requester
  const isValid = proofRequestData && data && data.requestedAttributes
  const proofGenerationError = state.proof[uid] ? state.proof[uid].error : null
  const errorProofSendData =
    state.proof[uid] && state.proof[uid].proofData
      ? state.proof[uid].proofData.error
      : null
  return {
    isValid,
    data,
    logoUrl: getConnectionLogoUrl(state, remotePairwiseDID),
    name,
    uid,
    proofStatus,
    proofGenerationError,
    claimMap: state.claim.claimMap,
    missingAttributes,
    userAvatarSource: getUserAvatarSource(state.user.avatarName),
    errorProofSendData,
    remotePairwiseDID,
    dissatisfiedAttributes,
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      proofRequestShown,
      acceptProofRequest,
      ignoreProofRequest,
      rejectProofRequest,
      updateAttributeClaim,
      getProof,
      userSelfAttestedAttributes,
      proofRequestShowStart,
      newConnectionSeen,
      denyProofRequest,
    },
    dispatch
  )
export default connect(mapStateToProps, mapDispatchToProps)(ModalContentProof)

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    width: '100%',
    paddingTop: 12,
    position: 'relative',
  },
  textAvatarWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  textWrapper: {
    width: '85%',
    paddingBottom: 10,
  },
  avatarWrapper: {
    marginTop: -15,
    width: '15%',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a5a5a5',
    width: '100%',
    textAlign: 'left',
    marginBottom: 2,
    fontFamily: 'Lato',
  },
  titleFilledValues: {
    fontSize: 14,
    fontWeight: '700',
    color: '#505050',
    width: '100%',
    textAlign: 'left',
    marginBottom: 2,
    fontFamily: 'Lato',
  },
  content: {
    fontSize: 17,
    fontWeight: '400',
    color: '#505050',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
    paddingBottom: 12,
  },
  outerModalWrapper: {
    width: '100%',
    flex: 1,
  },
  innerModalWrapper: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  keyboardFlatList: {
    paddingLeft: '5%',
    paddingRight: '5%',
  },
})
