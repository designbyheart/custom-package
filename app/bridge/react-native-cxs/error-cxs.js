// @flow
export const CONNECTION_ALREADY_EXISTS = '1062'
export const CREDENTIAL_DEFINITION_NOT_FOUND = '1036'
export const SCHEMA_NOT_FOUND = '1040'
export const INVALID_CREDENTIAL_OFFER = '1043'

export const CONNECTION_ALREADY_EXISTS_MESSAGE =
  'The connection invitation has already been accepted. ' +
  'Please, request a new invitation to establish a connection.'

export const CREDENTIAL_DEFINITION_NOT_FOUND_MESSAGE = 'Definition for offered Credential not found on the network application is connected to.'

export const SCHEMA_NOT_FOUND_MESSAGE = 'Schema for offered Credential not found on the network application is connected to.'

export const INVALID_CREDENTIAL_OFFER_MESSAGE = 'Offered Credential does not match to its schema definition.'
