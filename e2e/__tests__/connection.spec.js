// @flow

describe('Connection via QR Code', () => {
  it('User should be able to establish connection via scanning QR code', () => {
    //   await device.launchApp({ permissions: { camera: 'YES' } })
    //   await element(by.id(PIN_CODE_INPUT_BOX)).replaceText(TEST_PASS_CODE)
    //   await expect(element(by.id(USER_AVATAR))).toBeVisible()
    //   await element(by.id(HOME_CONTAINER)).swipe('left')
    //   await element(by.id(QR_CODE_INPUT_ENV_SWITCH)).replaceText(
    //     JSON.stringify({
    //       url: QR_CODE_ENV_SWITCH_URL,
    //       name: 'Development',
    //     })
    //   )
    //   await element(
    //     by
    //       .label(QR_CODE_NATIVE_ALERT_SWITCH_TEXT)
    //       .and(by.type(NATIVE_ALERT_TYPE()))
    //   ).tap()
    //   await expect(element(by.id(HOME_CONTAINER))).toBeVisible()
    //   await element(
    //     by.label(OK_TEXT_ALERT).and(by.type(NATIVE_ALERT_TYPE()))
    //   ).tap()
  })
})

// make sure app is in unlocked state before calling this method
// export const addConnections = async (noOfConnectionsToAdd = 1) => {
//   let connections = []
//   for (i = 0; i < noOfConnectionsToAdd; i++) {
//     {
//       let [
//         token,
//         invitationId,
//         fetchingInvitation,
//         invitationUrl,
//       ] = await getInvitation()
//       connections.push([token, invitationId, fetchingInvitation, invitationUrl])
//       await device.relaunchApp({
//         url: invitationUrl,
//       })
//       await unLockApp()

//       await waitFor(element(by.id(INVITATION_ACCEPT)))
//         .toBeVisible()
//         .withTimeout(15000)
//       await element(by.id(INVITATION_ACCEPT)).tap()

//       await waitFor(element(by.id(PIN_CODE_INPUT_BOX).and(by.text(''))))
//         .toBeVisible()
//         .withTimeout(15000)
//       await element(by.id(PIN_CODE_INPUT_BOX).and(by.text(''))).replaceText(
//         TEST_PASS_CODE
//       )
//       await waitFor(element(by.id(INVITATION_SUCCESS_MODAL_CONTINUE)))
//         .toBeVisible()
//         .withTimeout(50000)
//       await element(by.id(INVITATION_SUCCESS_MODAL_CONTINUE)).tap()
//     }
//   }
//   return connections
// }
