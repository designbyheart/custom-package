// @flow

import React, { PureComponent } from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import type { Store } from '../store/type-store'
import type { OnfidoProps, OnfidoProcessStatus } from './type-onfido'

import {
  Container,
  CustomText,
  CustomView,
  CustomButton,
  Loader,
} from '../components'
import { launchOnfidoSDK } from './onfido-store'
import { white } from '../common/styles'
import { onfidoProcessStatus } from './type-onfido'
import { connectionsTabRoute } from '../common'

const LoaderVisibleOnfidoStates = [
  onfidoProcessStatus.APPLICANT_ID_FETCHING,
  onfidoProcessStatus.APPLICANT_ID_SUCCESS,
  onfidoProcessStatus.CHECK_UUID_FETCHING,
  onfidoProcessStatus.CHECK_UUID_SUCCESS,
  onfidoProcessStatus.CONNECTION_DETAIL_FETCHING,
  onfidoProcessStatus.CONNECTION_DETAIL_FETCH_SUCCESS,
  onfidoProcessStatus.SDK_SUCCESS,
]

export class Onfido extends PureComponent<OnfidoProps, void> {
  static navigationOptions = {
    header: null,
  }

  getDescriptionText = (
    status: OnfidoProcessStatus
  ): {
    descriptionText: string,
    yesActionText?: string,
    ignoreActionText?: string,
  } => {
    switch (status) {
      case onfidoProcessStatus.APPLICANT_ID_API_ERROR:
        return {
          descriptionText:
            'Onfido faced an error while trying to start process. Try again?',
        }

      // TODO:KS Handle case where connection establishment fails
      case onfidoProcessStatus.SDK_ERROR:
      case onfidoProcessStatus.CHECK_UUID_ERROR:
      case onfidoProcessStatus.CONNECTION_DETAIL_FETCH_ERROR:
      case onfidoProcessStatus.CONNECTION_DETAIL_INVALID_ERROR:
        return {
          descriptionText:
            'Onfido could not complete processing your identity document. Try again?',
        }

      default:
        return {
          descriptionText:
            'Onfido would give you a digital copy of your identity documents. Would you like to continue?',
        }
    }
  }

  componentDidUpdate(prevProps: OnfidoProps) {
    if (
      this.props.status !== prevProps.status &&
      this.props.status === onfidoProcessStatus.CHECK_UUID_CONNECTION_DONE
    ) {
      this.props.navigation.goBack()
      this.props.navigation.navigate(connectionsTabRoute)
    }
  }

  render() {
    const {
      descriptionText,
      yesActionText = 'Yes',
      ignoreActionText = 'Ignore',
    } = this.getDescriptionText(this.props.status)

    if (LoaderVisibleOnfidoStates.indexOf(this.props.status) > -1) {
      return (
        <Container tertiary>
          <Loader showMessage={true} />
        </Container>
      )
    }

    // TODO:KS Handle case where connection establishment fails
    return (
      <Container tertiary>
        <Container center horizontalSpace>
          <CustomText bg="tertiary" h4 center>
            {descriptionText}
          </CustomText>
        </Container>
        <CustomView row safeArea>
          <Container>
            <CustomButton
              testID="onfido-ignore"
              title={ignoreActionText}
              dangerous
              medium
              fontWeight="600"
              onPress={() => this.props.navigation.goBack(null)}
            />
          </Container>
          <Container>
            <CustomButton
              testID="onfido-yes"
              title={yesActionText}
              tertiary
              medium
              fontWeight="600"
              onPress={this.props.launchOnfidoSDK}
              style={[styles.buttonStyle]}
            />
          </Container>
        </CustomView>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  buttonStyle: {
    borderLeftColor: white,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
})

const mapStateToProps = (state: Store) => ({
  status: state.onfido.status,
})

const mapDispatchToProps = dispatch =>
  bindActionCreators({ launchOnfidoSDK }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Onfido)
