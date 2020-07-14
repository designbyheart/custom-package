// @flow
import React, { useCallback, useEffect, useState } from 'react'

import type { RequestProps } from './type-request'

import { Container } from '../layout/container'
import RequestDetail from './request-detail'
import FooterActions from '../footer-actions/footer-actions'

export const Request = ({
  title,
  onAction,
  invitationError,
  message,
  senderLogoUrl,
  senderName,
  testID,
}: RequestProps) => {
  const [disableActions, setDisableActions] = useState(false)

  const onAccept = useCallback(() => {
    setDisableActions(true)
    // Move these values to enum, we are not doing it now because of TODO in type file
    onAction('accepted')
  }, [])

  const onDecline = useCallback(() => {
    setDisableActions(true)
    // Move these values to enum, we are not doing it now because of TODO in type file
    onAction('rejected')
  }, [])

  useEffect(() => {
    // When Accept invitation errors out we are re-enabling accept button. Giving user the option to retry.
    if (invitationError) {
      setDisableActions(false)
    }
  }, [invitationError])

  return (
    <Container testID="request-container">
      <Container fifth>
        <RequestDetail
          title={title}
          message={message}
          senderLogoUrl={senderLogoUrl}
          senderName={senderName}
          testID={testID}
        />
      </Container>
      <FooterActions
        disableAccept={disableActions}
        disableDeny={disableActions}
        onAccept={onAccept}
        onDecline={onDecline}
        logoUrl={senderLogoUrl}
        testID={testID}
        useColorPicker={true}
      />
    </Container>
  )
}
