// @flow
import React from 'react'
import SvgCustomIcon from '../../components/svg-custom-icon'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { measurements } from '../../../app/common/styles/measurements'

// TODO: Fix the <any, void> to be the correct types for props and state
class ConnectionDetailsNav extends React.Component<any, void> {
  render() {
    const { navigation } = this.props
    const { key, params } = this.props.navigation.state

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.goBack} style={styles.buttonBack}>
          <SvgCustomIcon name="Arrow" fill={'#777777'} width={24} height={22} />
        </TouchableOpacity>
        <View style={styles.iconAndName}>
          <View style={styles.headerWrapper}>
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
    zIndex: 899,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: measurements.connectionDetailsNav,
    paddingTop: 50,
    width: '100%',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 15,
    elevation: 15,
  },
  buttonBack: {
    paddingLeft: 15,
  },
  iconAndName: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    height: '100%',
  },
  headerWrapper: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    marginTop: -5,
    borderRadius: 32,
  },
  headerIcon: {
    flex: 1,
    width: 64,
    height: 64,
  },
  headerTitle: {
    marginTop: 20,
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
    color: '#505050',
    fontFamily: 'Lato',
  },
  buttonMoreOptions: {
    paddingRight: 15,
    width: 40,
    alignItems: 'flex-end',
  },
  backImage: {
    width: 25,
    height: 21.5,
  },
  optionImage: {
    width: 4.5,
    height: 21,
  },
})
