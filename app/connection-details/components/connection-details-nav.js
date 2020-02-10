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
import { measurements } from '../../../app/common/styles/measurements'

// TODO: Fix the <any, void> to be the correct types for props and state
class ConnectionDetailsNav extends PureComponent<any, void> {
  render() {
    const { navigation } = this.props
    const { key, params } = this.props.navigation.state

    return (
      <View style={styles.container}>
        <View style={styles.buttonBackWrapper}>
          <TouchableOpacity onPress={this.goBack}>
            <SvgCustomIcon
              name="ChevronLeft"
              fill={'#777777'}
              width={24}
              height={36}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.iconAndNameWrapper}>
          <View style={styles.headerImageOuterWrapper}>
            <View style={styles.headerImageWrapper}>
              <Image
                style={styles.headerIcon}
                source={{ uri: params.image }}
                resizeMode={'cover'}
              />
            </View>
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
              fill={'#777777'}
              width={24}
              height={24}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  goBack = () => {
    const { navigation } = this.props
    const { params } = this.props.navigation.state
    this.props.newConnectionSeen(params.senderDID)
    const backRedirectRoute = this.props.navigation.getParam(
      'backRedirectRoute',
      null
    )
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
    height: measurements.connectionDetailsNav,
    width: '100%',
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : '#fff',
    shadowColor: '#000',
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
    paddingBottom: 7,
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
    width: 32,
    height: 32,
    borderRadius: 20,
  },
  headerIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
    color: '#505050',
    fontFamily: 'Lato',
  },
  buttonMoreOptionsWrapper: {
    height: '100%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 17,
  },
  headerImageOuterWrapper: {
    height: '100%',
    width: '13%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 14,
  },
  headerTitleWrapper: {
    height: '100%',
    width: '88%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingLeft: 10,
  },
})
