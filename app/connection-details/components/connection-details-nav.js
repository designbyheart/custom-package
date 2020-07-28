// @flow
import React, { PureComponent } from 'react'
import SvgCustomIcon from '../../components/svg-custom-icon'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { scale, verticalScale, moderateScale } from 'react-native-size-matters'
import { colors, fontFamily, fontSizes } from '../../common/styles/constant'
import { DefaultLogo } from '../../components/default-logo/default-logo'

// TODO: Fix the <any, void> to be the correct types for props and state
class ConnectionDetailsNav extends PureComponent<any, void> {
  render() {
    const { params } = this.props.route

    return (
      <View style={styles.container}>
        <View style={styles.buttonBackWrapper}>
          <TouchableOpacity testID="back-arrow-touchable" onPress={this.goBack}>
            <SvgCustomIcon
              name="ChevronLeft"
              fill={colors.cmGray2}
              width={moderateScale(24)}
              height={moderateScale(36)}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.iconAndNameWrapper}>
          <View style={styles.headerImageOuterWrapper}>
            {typeof params.image === 'string' ? (
              <View style={styles.headerImageWrapper}>
                <Image
                  style={styles.headerIcon}
                  source={{ uri: params.image }}
                  resizeMode={'cover'}
                />
              </View>
            ) : (
              <DefaultLogo
                text={params.senderName[0]}
                size={moderateScale(32)}
                fontSize={17}
              />
            )}
          </View>
          <View style={styles.headerTitleWrapper}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {params.senderName}
            </Text>
          </View>
        </View>
        <View style={styles.buttonMoreOptionsWrapper}>
          <TouchableOpacity onPress={this.props.moreOptionsOpen}>
            <SvgCustomIcon
              name="ThreeDots"
              fill={colors.cmGray2}
              width={moderateScale(24)}
              height={moderateScale(24)}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  goBack = () => {
    const {
      navigation,
      route: { params },
    } = this.props
    this.props.newConnectionSeen(params.senderDID)
    const backRedirectRoute = this.props.route.params?.backRedirectRoute
    if (backRedirectRoute) {
      navigation.navigate(backRedirectRoute)
    } else {
      navigation.goBack(null)
    }
  }
}

export { ConnectionDetailsNav }

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    zIndex: 999,
    flexDirection: 'row',
    height: verticalScale(90),
    width: '100%',
    backgroundColor: colors.cmWhite,
    shadowColor: colors.cmBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  buttonBackWrapper: {
    height: '100%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: verticalScale(7),
  },
  iconAndNameWrapper: {
    width: '70%',
    height: '100%',
    flexDirection: 'row',
  },
  headerImageWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: 20,
  },
  headerIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: verticalScale(fontSizes.size5),
    textAlign: 'center',
    color: colors.cmGray1,
    fontFamily: fontFamily,
  },
  buttonMoreOptionsWrapper: {
    height: '100%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: moderateScale(15),
  },
  headerImageOuterWrapper: {
    height: '100%',
    width: '13%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: moderateScale(14),
  },
  headerTitleWrapper: {
    height: '100%',
    width: '88%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: moderateScale(20),
    paddingLeft: moderateScale(10),
  },
})
