// @flow
import React from 'react'
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
class ConnectionDetailsNav extends React.Component<any, void> {
  render() {
    const { navigation } = this.props
    const { key, params } = this.props.navigation.state

    return (
      <View style={styles.container}>
        <View style={styles.buttonsWrapper}>
          <TouchableOpacity onPress={this.goBack} style={styles.buttonBack}>
            <SvgCustomIcon
              name="ChevronLeft"
              fill={'#777777'}
              width={24}
              height={36}
            />
          </TouchableOpacity>
          <View style={styles.iconAndNameWrapper}>
            <View style={styles.headerImageWrapper}>
              <Image
                style={styles.headerIcon}
                source={{ uri: params.image }}
                resizeMode={'cover'}
              />
            </View>
            <Text style={styles.headerTitle}>{params.senderName}</Text>
          </View>
          <TouchableOpacity
            style={styles.buttonMoreOptions}
            onPress={this.props.moreOptionsOpen}
          >
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
    justifyContent: 'center',
    alignItems: 'flex-end',
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
  buttonsWrapper: {
    height: 70,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonBack: {
    marginTop: 5,
    marginLeft: 15,
  },
  iconAndNameWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerImageWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  headerIcon: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
    color: '#505050',
    fontFamily: 'Lato',
  },
  buttonMoreOptions: {
    marginRight: 15,
  },
})
