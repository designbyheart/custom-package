/**
 * @jest-environment node
 */

// @flow

import { element, by, waitFor } from 'detox'
import { getText } from 'detox-getprops'

describe('Backup test suite', () => {
  it.skip('Case 1: positive backup tests', async () => {
    // can use testID instead
    // await waitFor(element(by.text('Settings'))).toBeVisible().withTimeout(5000)
    // await element(by.text('Settings')).tap()
    await waitFor(element(by.id('tab-bar-settings-icon')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.id('tab-bar-settings-icon')).tap()

    await waitFor(element(by.text('Create a Backup')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.text('Create a Backup')).tap()
    // issue with list item with testID
    // await waitFor(element(by.id('settings-backup-data-wallet'))).toBeVisible().withTimeout(5000)
    // await element(by.id('settings-backup-data-wallet')).tap()

    await waitFor(element(by.id('show-recovery-passphrase')))
      .toBeVisible()
      .withTimeout(5000)
    const phrase = await getText(element(by.id('show-recovery-passphrase')))
    console.log(phrase)

    await waitFor(element(by.id('submit-recovery-passphrase')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.id('submit-recovery-passphrase')).tap()

    await waitFor(element(by.id('verify-passphrase-container-text-input')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.id('verify-passphrase-container-text-input')).typeText(
      phrase + '\n'
    )

    await waitFor(element(by.text('Downloaded .zip Backup')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.text('Downloaded .zip Backup')).tap()

    await waitFor(element(by.id('export-encrypted-backup')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.id('export-encrypted-backup')).tap()

    await waitFor(element(by.type('_UIPopoverControllerActionView')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.type('_UIPopoverControllerActionView')).tap()

    await waitFor(element(by.id('backup-complete-submit-button')))
      .toBeVisible()
      .withTimeout(5000)
    await element(by.id('backup-complete-submit-button')).tap()
  })

  it.skip('Case 2: negative backup test', async () => {})
})
