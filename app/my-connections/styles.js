// @flow
import { StyleSheet } from 'react-native'
import { measurements } from '../common/styles/measurements'
import { primaryHeaderHeight } from '../common/styles/constant'

const externalStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  flatListContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    marginTop: primaryHeaderHeight,
  },
  flatListInnerContainer: {
    paddingBottom: 170,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: primaryHeaderHeight,
  },
})

export { externalStyles }
