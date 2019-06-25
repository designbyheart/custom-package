// @flow
import type { GenericObject } from '../common/type-common'

export const NEW_CONNECTION_SUCCESS = 'NEW_CONNECTION_SUCCESS'

export const saveNewConnectionSuccess = (connection: GenericObject) => ({
  type: NEW_CONNECTION_SUCCESS,
  connection,
})
