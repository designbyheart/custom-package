// @flow
import { StyleSheet } from 'react-native'
import { measurements } from '../common/styles/measurements'
import { primaryHeaderHeight } from '../common/styles/constant'

const externalStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  flatListContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: primaryHeaderHeight,
  },
  flatListInnerContainer: {
    paddingBottom: 170,
  },
  blurContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: measurements.bottomBlurNavBarHeight,
  },
})

export { externalStyles }
