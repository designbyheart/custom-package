// @flow
import React, { PureComponent } from 'react'
import { StyleSheet, FlatList, View, Text } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { BorderSeparator } from '../../components/connection-details/border-separator'
import { Icon } from '../index'
import { getUserAvatarSource } from '../../store/store-selector'
import type { CustomListProps, Item } from './type-custom-list'
import type { Store } from '../../store/type-store'

export class CustomListProofRequest extends PureComponent<
  CustomListProps,
  void
> {
  keyExtractor = ({ label }: Item, index: number) => `${label}${index}`

  renderListType1Item = ({ item, index }: { item: Item, index: number }) => {
    // if item is an array then take first element of item
    // as we only need single item
    if (Array.isArray(item)) {
      item = item[0]
    }

    const logoUrl = item.data
      ? item.claimUuid &&
        this.props.claimMap &&
        this.props.claimMap[item.claimUuid] &&
        this.props.claimMap[item.claimUuid].logoUrl
        ? { uri: this.props.claimMap[item.claimUuid].logoUrl }
        : this.props.avatarSource || require('../../images/UserAvatar.png')
      : null

    return (
      <View key={index} style={styles.wrapper}>
        <View style={styles.textAvatarWrapper}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>{item.label}</Text>
            <Text style={styles.content}>{item.data}</Text>
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
  }

  render() {
    const items: Item[] = this.props.items
    return (
      <FlatList
        style={styles.keyboardFlatList}
        data={items}
        keyExtractor={this.keyExtractor}
        ItemSeparatorComponent={BorderSeparator}
        ListFooterComponent={BorderSeparator}
        renderItem={this.renderListType1Item}
      />
    )
  }
}

const mapStateToProps = (state: Store) => ({
  avatarSource: getUserAvatarSource(state.user.avatarName),
})

export default connect(mapStateToProps)(CustomListProofRequest)

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#f2f2f2',
    width: '100%',
    position: 'relative',
    paddingTop: 12,
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
  content: {
    fontSize: 17,
    fontWeight: '400',
    color: '#505050',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Lato',
    paddingBottom: 12,
  },
  textAvatarWrapper: {
    width: '98.5%',
    flexDirection: 'row',
  },
  textWrapper: {
    width: '85%',
  },
  avatarWrapper: {
    marginTop: -10,
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardFlatList: {
    marginLeft: '5%',
    marginRight: '5%',
  },
})
