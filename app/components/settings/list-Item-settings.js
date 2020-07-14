// @flow
import React, { PureComponent } from 'react'
import { StyleSheet, ScrollView, View, Image } from 'react-native'
import { ListItem } from 'react-native-elements'
import { font } from '../../common/styles/constant'

class ListItemSettings extends PureComponent<any, any> {
  render() {
    return (
      <ScrollView bounces={false}>
        <View style={style.listContainer}>
          {this.props.list.map((item, index) => {
            return (
              <ListItem
                containerStyle={[style.listItemContainer]}
                titleStyle={[style.titleStyle]}
                subtitleStyle={[style.subtitleStyle]}
                key={index}
                title={item.title}
                subtitle={item.subtitle}
                leftAvatar={item.avatar}
                rightIcon={
                  item.rightIcon === 'spinner' ? (
                    <View>
                      <Image
                        style={style.spinner}
                        source={require('../../images/loadingSpinner.gif')}
                      />
                    </View>
                  ) : (
                    item.rightIcon
                  )
                }
                // hideChevron={item.rightIcon === 'spinner'}
                onPress={item.onPress}
              />
            )
          })}
        </View>
      </ScrollView>
    )
  }
}
export { ListItemSettings }

const style = StyleSheet.create({
  listContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#fff',
    marginTop: 0,
    paddingBottom: 60,
  },
  listItemContainer: {
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderBottomColor: '#f2f2f2',
    minHeight: 64,
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 15,
  },
  titleStyle: {
    fontFamily: 'Lato',
    fontSize: 17,
    color: '#505050',
    fontWeight: '500',
  },
  subtitleStyle: {
    fontFamily: 'Lato',
    fontWeight: '500',
    fontSize: 11,
    color: '#777',
  },
  spinner: {
    width: 60,
    height: 60,
    marginRight: -10,
  },
})
