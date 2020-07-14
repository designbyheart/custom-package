// @flow
import React, { Component } from 'react'
import SvgCustomIcon from '../../components/svg-custom-icon'
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { deleteConnectionAction } from '../../store/connections-store'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getUserAvatarSource } from '../../store/store-selector'
import type { Store } from '../../store/type-store'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import {
  colors,
  fontFamily,
  fontSizes,
  font,
} from '../../common/styles/constant'
import { DefaultLogo } from '../../components/default-logo/default-logo'

const defaultAvatar = require('../../images/UserAvatar.png')
// TODO: Fix the <any, void> to be the correct types for props and state
class MoreOptions extends Component<any, void> {
  onDeleteConnection = (senderDID) => {
    this.props.deleteConnectionAction(senderDID)
    this.props.navigation.goBack(null)
  }
  render() {
    const {
      route: { params },
    } = this.props
    let avatarSource = this.props.userAvatarSource || defaultAvatar

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeScreenWrapper}
          onPress={this.props.moreOptionsClose}
        />
        <View style={styles.smallSquare} />
        <View style={styles.contentWrapper}>
          <View style={styles.row}>
            {typeof params.image === 'string' ? (
              <Image style={styles.image} source={{ uri: params.image }} />
            ) : (
              <View style={{ marginRight: 5 }}>
                <DefaultLogo
                  text={params.senderName[0]}
                  size={moderateScale(24)}
                  fontSize={12}
                />
              </View>
            )}
            <Text style={styles.text}>did: {params.senderDID}</Text>
          </View>
          <View style={styles.row}>
            <Image style={styles.image} source={avatarSource} />
            <Text style={styles.text}>did: {params.identifier}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => this.onDeleteConnection(params.senderDID)}
          >
            <SvgCustomIcon
              name="TrashCan"
              fill={colors.cmBlue}
              width={moderateScale(24)}
              height={moderateScale(24)}
            />
            <Text style={styles.buttonText}>Delete Connection</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.closeButtonWrapper}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={this.props.moreOptionsClose}
          >
            <SvgCustomIcon
              name="CloseIcon"
              fill={colors.cmGray2}
              width={moderateScale(12)}
              height={moderateScale(12)}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}
const mapStateToProps = (state: Store) => ({
  userAvatarSource: getUserAvatarSource(state.user.avatarName),
})
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ deleteConnectionAction }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(MoreOptions)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    paddingTop: verticalScale(40),
    zIndex: 999,
    alignItems: 'flex-end',
    width: '100%',
    paddingLeft: '2%',
    paddingRight: '2%',
    height: Dimensions.get('screen').height,
  },
  closeScreenWrapper: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  smallSquare: {
    position: 'relative',
    backgroundColor: colors.cmWhite,
    width: moderateScale(40),
    height: moderateScale(40),
    shadowColor: colors.cmBlack,
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 8,
  },
  closeButtonWrapper: {
    position: 'absolute',
    zIndex: 999,
    width: moderateScale(40),
    height: moderateScale(40),
    top: moderateScale(40),
    right: '2%',
    elevation: 8,
  },
  closeButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    backgroundColor: colors.cmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
  },
  contentWrapper: {
    position: 'relative',
    backgroundColor: 'white',
    padding: moderateScale(12),
    shadowColor: colors.cmBlack,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: moderateScale(12),
  },
  image: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: 12,
    marginRight: 5,
  },
  text: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: verticalScale(fontSizes.size5),
    color: colors.cmGray2,
    fontFamily: fontFamily,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  trashCanIcon: {
    width: moderateScale(19),
    height: moderateScale(24),
    marginRight: moderateScale(8),
    marginLeft: moderateScale(3),
  },
  buttonText: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: verticalScale(fontSizes.size5),
    color: colors.cmBlue,
    fontFamily: fontFamily,
  },
})
