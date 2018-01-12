// @flow
import React, { PureComponent } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Container, CustomView, CustomText, Separator, Icon } from '../index'
import { OFFSET_1X, OFFSET_3X } from '../../common/styles'
import type { CustomListProps, Item } from './type-custom-list'

export default class CustomList extends PureComponent<
  void,
  CustomListProps,
  void
> {
  keyExtractor = (_: any, index: number) => index

  renderListType1Item = ({ item, index }: { item: Item, index: string }) => {
    if (this.props.type === 'center') {
      return (
        <CustomView fifth row horizontalSpace doubleVerticalSpace>
          <CustomView fifth right style={[styles.itemLabel]}>
            <CustomText
              h7
              uppercase
              semiBold
              bg="tertiary"
              transparentBg
              style={[styles.labelText]}
              testID={`custom-list-label-${index}`}
            >
              {item.label}
            </CustomText>
          </CustomView>
          <CustomView fifth left style={[styles.itemValue]}>
            <CustomText
              h6
              demiBold
              bg="tertiary"
              transparentBg
              testID={`custom-list-data-${index}`}
            >
              {item.data}
            </CustomText>
          </CustomView>
        </CustomView>
      )
    } else {
      return (
        <Container fifth style={[styles.list]} row>
          <Container fifth verticalSpace>
            <CustomView fifth style={[styles.list2Label]}>
              <CustomText
                h7
                uppercase
                semiBold
                bg="tertiary"
                transparentBg
                style={[styles.list2LabelText]}
                testID={`custom-list-label-${index}`}
              >
                {item.label}
              </CustomText>
            </CustomView>
            <CustomView fifth>
              <CustomText
                h6
                demiBold
                bg="tertiary"
                transparentBg
                testID={`custom-list-data-${index}`}
              >
                {item.data}
              </CustomText>
            </CustomView>
          </Container>
          <Icon
            center
            medium
            round
            resizeMode="cover"
            src={require('../../images/cb_evernym.png')}
          />
        </Container>
      )
    }
  }

  render() {
    const items: Array<Item> = this.props.items
    return (
      <Container fifth>
        <FlatList
          data={items}
          ItemSeparatorComponent={Separator}
          keyExtractor={this.keyExtractor}
          ListFooterComponent={Separator}
          renderItem={this.renderListType1Item}
        />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: OFFSET_3X / 2,
  },
  itemLabel: {
    flex: 4,
    paddingRight: OFFSET_3X / 2,
  },
  labelText: {
    lineHeight: 19,
  },
  itemValue: {
    flex: 6,
  },
  list2LabelText: {
    paddingVertical: 2,
  },
})