// @flow
import React from 'react'
import 'react-native'
import { Alert } from 'react-native'
import renderer from 'react-test-renderer'
import { RNCamera } from 'react-native-camera'
import { qrCodeScannerTabRoute, invitationRoute } from '../../common/'
import { QRCodeScannerScreen, convertQrCodeToInvitation } from '../qr-code'
import {
  getNavigation,
  qrData,
  environmentSwitchQrCodeData,
  validQrCodeEnvironmentSwitchUrl,
} from '../../../__mocks__/static-data'

describe('<QRScannerScreen />', () => {
  function getProps() {
    return {
      navigation: getNavigation(),
      route: {},
      invitationReceived: jest.fn(),
      currentScreen: qrCodeScannerTabRoute,
      changeEnvironmentUrl: jest.fn(),
      enableCamera: jest.fn(),
      isCameraEnabled: true,
      publicDIDs: {},
      openIdConnectUpdateStatus: jest.fn(),
      proofRequestReceived: jest.fn(),
    }
  }

  function setup() {
    const props = getProps()
    const component = renderer.create(<QRCodeScannerScreen {...props} />)
    const instance: QRCodeScannerScreen = component.getInstance()

    return { props, component, instance }
  }

  it('should match snapshot', () => {
    const { instance, component } = setup()
    instance.setState({ isCameraEnabled: true })

    let tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('match snapshot when camera is not authorized', () => {
    const { component } = setup()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should convert qr code to invitation', () => {
    expect(convertQrCodeToInvitation(qrData)).toMatchSnapshot()
  })

  it('should redirect user to invitation screen on success read', () => {
    const {
      instance,
      component,
      props: { invitationReceived, navigation },
    } = setup()

    instance.onRead(qrData)
    expect(invitationReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: convertQrCodeToInvitation(qrData),
      })
    )
    expect(navigation.push).toHaveBeenCalledWith(invitationRoute, {
      senderDID: qrData.s.d,
    })
  })

  it('should navigate back to home if qr code scanner is closed', () => {
    const { instance, component, props } = setup()
    instance.onClose()
    expect(props.navigation.goBack).toHaveBeenCalledWith(null)
  })

  it('check camera permission screen is updated', () => {
    const { instance, props, component } = setup()

    const updatedComponent = (
      <QRCodeScannerScreen
        {...props}
        {...{ currentScreen: qrCodeScannerTabRoute }}
      />
    )

    // component.update(updatedComponent)
  })

  // skipping this test because as of now this code is commented and not used
  xit(`show alert if environment switch url is scanned,
      trigger action when Switch is clicked,
      and redirect to home tab`, () => {
    const {
      instance,
      component,
      props: {
        changeEnvironmentUrl,
        navigation: { navigate, goBack },
      },
    } = setup()
    const alertSpy = jest.spyOn(Alert, 'alert')

    //instance.onEnvironmentSwitchUrl(environmentSwitchQrCodeData)
    expect(alertSpy).toHaveBeenCalled()

    const switchButton = alertSpy.mock.calls[0][2][1]
    // click switch button
    switchButton.onPress()

    expect(changeEnvironmentUrl).toHaveBeenCalledWith(
      validQrCodeEnvironmentSwitchUrl
    )

    expect(goBack).toHaveBeenCalledWith(null)

    alertSpy.mockReset()
    alertSpy.mockRestore()
  })
})
