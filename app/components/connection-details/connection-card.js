// @flow
import React, { PureComponent } from 'react'
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import SvgCustomIcon from '../../components/svg-custom-icon'
import CredentialPriceInfo from '../../components/labels/credential-price-info'
import { Border } from '../../components/connection-details/border'
import {
  proofRequestRoute,
  claimOfferRoute,
  modalContentProofShared,
  modalScreenRoute,
} from '../../common'
import {
  SEND_CLAIM_REQUEST_FAIL,
  PAID_CREDENTIAL_REQUEST_FAIL,
} from '../../claim-offer/type-claim-offer'
import { acceptClaimOffer } from '../../claim-offer/claim-offer-store'
import { reTrySendProof } from '../../proof/proof-store'
import { ERROR_SEND_PROOF } from '../../proof/type-proof'

// TODO: Fix the <any, {}> to be the correct types for props and state
class ConnectionCardComponent extends PureComponent<any, {}> {
  updateAndShowModal = () => {
    const { data: event } = this.props
    if (
      event.action === SEND_CLAIM_REQUEST_FAIL ||
      event.action === PAID_CREDENTIAL_REQUEST_FAIL
    ) {
      this.props.acceptClaimOffer(
        event.originalPayload.uid,
        event.originalPayload.remoteDid
      )
      return
    }

    if (event.action === ERROR_SEND_PROOF) {
      this.props.reTrySendProof(
        event.originalPayload.selfAttestedAttributes,
        event.originalPayload
      )
      return
    }

    if (this.props.proof) {
      this.props.navigation.navigate(modalContentProofShared, {
        uid: this.props.uid,
        data: this.props.data,
        claimMap: this.props.claimMap,
      })
    } else {
      this.props.navigation.navigate(modalScreenRoute, {
        data: this.props.data,
        imageUrl: this.props.imageUrl,
        institutialName: this.props.institutialName,
        colorBackground: this.props.colorBackground,
        secondColorBackground: this.props.secondColorBackground,
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.messageDate}>{this.props.messageDate}</Text>
        <View style={styles.innerWrapper}>
          {this.props.payTokenValue && (
            <CredentialPriceInfo
              isPaid={true}
              price={this.props.payTokenValue}
            />
          )}
          <View style={styles.innerWrapperPadding}>
            <View style={styles.top}>
              <View
                style={[
                  styles.badge,
                  { display: this.props.showBadge ? 'flex' : 'none' },
                ]}
              >
                <View style={styles.iconWrapper}>
                  <SvgCustomIcon
                    name="CheckmarkBadge"
                    fill={'#505050'}
                    width={22}
                    height={33}
                  />
                </View>
              </View>
              <View style={styles.headerWrapper}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>{this.props.headerText}</Text>
                </View>
                <View style={styles.infoWrapper}>
                  <Text style={styles.infoType}>{this.props.infoType}</Text>
                  <Text style={styles.infoDate}>{this.props.infoDate}</Text>
                </View>
              </View>
            </View>
            <Border borderColor={'#eaeaea'} />
            <View style={styles.bottom}>
              <View style={styles.attributesWrapper}>
                <Text style={styles.attributesText}>
                  {this.props.noOfAttributes}
                </Text>
                <Text style={styles.attributesText}> Attributes</Text>
              </View>
              <TouchableOpacity
                onPress={this.updateAndShowModal}
                style={styles.button}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: this.props.colorBackground },
                  ]}
                >
                  {this.props.buttonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.helperView} />
      </View>
    )
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      acceptClaimOffer,
      reTrySendProof,
    },
    dispatch
  )

export const ConnectionCard = connect(null, mapDispatchToProps)(
  ConnectionCardComponent
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingLeft: '7%',
    paddingRight: '7%',
    paddingTop: 15,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  innerWrapper: {
    marginTop: 15,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: Platform.OS === 'android' ? 4 : 0,
    marginBottom: 15,
    borderRadius: 6,
  },
  innerWrapperPadding: {
    padding: 15,
  },
  messageDate: {
    color: '#777',
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingBottom: 15,
  },
  badge: {
    height: 38,
    width: 35,
  },
  badgeImage: {
    width: 23,
    height: 34.5,
  },
  headerWrapper: {
    flex: 1,
  },
  header: {
    width: '100%',
  },
  headerText: {
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '700',
    color: '#505050',
    fontFamily: 'Lato',
  },
  infoWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    paddingTop: 4,
  },
  infoType: {
    textAlign: 'left',
    fontSize: 11,
    fontWeight: '500',
    color: '#777777',
    flex: 1,
    fontFamily: 'Lato',
    lineHeight: 13,
  },
  infoDate: {
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '500',
    color: '#505050',
    fontFamily: 'Lato',
  },
  bottom: {
    width: '100%',
    paddingTop: 15,
    backgroundColor: 'white',
  },
  attributesWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  attributesText: {
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '400',
    color: '#505050',
    fontFamily: 'Lato',
  },
  button: {
    backgroundColor: 'transparent',
    padding: 8,
    paddingRight: 25,
    marginLeft: -8,
    marginBottom: -8,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Lato',
  },
  iconWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  helperView: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    width: '100%',
    paddingTop: 15,
  },
})
