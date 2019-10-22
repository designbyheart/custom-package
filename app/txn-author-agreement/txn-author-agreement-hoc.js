// @flow
import * as React from 'react'
import { Component } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import hoistNonReactStatic from 'hoist-non-react-statics'
import { getAlreadySignedAgreement } from '../store/store-selector'
import type { Store } from '../store/type-store'

/**
 * This HOC is written as High order function because
 * we want to maintain forward compatibility with react hooks
 * and cause minimum API change once we migrate to hooks
 */

// NOTE: Don't use this HOC if wrapped component is exposing `refs`
export function withTAA() {
  // Element type "any" is defined here
  // because this is a legit use case where we can pass any type of
  // React Element to wrap it inside withStatusBar
  return function(WrappedComponent: any) {
    // "any" is a legit type here as well, with same explanation as above
    class WithTAA extends Component<any, void> {
      // Once we have migrated to 0.59, then we would rewrite this HOC with hooks
      // that should remove class property, and different lifecycle events

      componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.alreadySignedAgreement) {
          this.closeTAA()
        }
      }

      closeTAA = () => {
        this.props.navigation.goBack(null)
      }

      render() {
        return <WrappedComponent {...this.props} />
      }
    }

    WithTAA.displayName = `WithTAA(${getDisplayName(WrappedComponent)})`
    hoistNonReactStatic(WithTAA, WrappedComponent)

    // As of now, this component does not handle forwarding refs
    // once we upgrade to React 16.3 or higher, than we can use React.forwardRef

    const mapStateToProps = (state: Store) => {
      return {
        alreadySignedAgreement: getAlreadySignedAgreement(state),
      }
    }

    return connect(mapStateToProps)(WithTAA)
  }
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
