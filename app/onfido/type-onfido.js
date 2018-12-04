// @flow

import type { CustomError, ReactNavigation } from '../common/type-common'

export const onfidoProcessStatus = {
  IDLE: 'IDLE',
  START_NO_CONNECTION: 'START_NO_CONNECTION',
  APPLICANT_ID_API_ERROR: 'APPLICANT_ID_API_ERROR',
  APPLICANT_ID_FETCHING: 'APPLICANT_ID_FETCHING',
  APPLICANT_ID_SUCCESS: 'APPLICANT_ID_SUCCESS',
  SDK_ERROR: 'SDK_ERROR',
  SDK_SUCCESS: 'SDK_SUCCESS',
  CHECK_UUID_FETCHING: 'CHECK_UUID_FETCHING',
  CHECK_UUID_ERROR: 'CHECK_UUID_ERROR',
  CHECK_UUID_SUCCESS: 'CHECK_UUID_SUCCESS',
  CONNECTION_DETAIL_FETCHING: 'CONNECTION_DETAIL_FETCHING',
  CONNECTION_DETAIL_FETCH_SUCCESS: 'CONNECTION_DETAIL_FETCH_SUCCESS',
  CONNECTION_DETAIL_FETCH_ERROR: 'CONNECTION_DETAIL_FETCH_ERROR',
  CONNECTION_DETAIL_INVALID_ERROR: 'CONNECTION_DETAIL_INVALID_ERROR',
  CHECK_UUID_CONNECTION_DONE: 'CHECK_UUID_CONNECTION_DONE',
}
export type OnfidoProcessStatus = $Keys<typeof onfidoProcessStatus>

export type OnfidoProps = {
  status: OnfidoProcessStatus,
  error: ?CustomError,
  launchOnfidoSDK: () => LaunchOnfidoSDKAction,
} & ReactNavigation

export type OnfidoStore = {
  status: OnfidoProcessStatus,
  applicantId: ?string,
  error: ?CustomError,
  onfidoDid: ?string,
}

export const UPDATE_ONFIDO_PROCESS_STATUS = 'UPDATE_ONFIDO_PROCESS_STATUS'
export type UpdateOnfidoProcessStatusAction = {
  type: typeof UPDATE_ONFIDO_PROCESS_STATUS,
  status: OnfidoProcessStatus,
}

export const LAUNCH_ONFIDO_SDK = 'LAUNCH_ONFIDO_SDK'
export type LaunchOnfidoSDKAction = {
  type: typeof LAUNCH_ONFIDO_SDK,
}

export const HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS =
  'HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS'
export type HydrateApplicantIdAction = {
  type: typeof HYDRATE_ONFIDO_APPLICANT_ID_SUCCESS,
  applicantId: string,
}

export const UPDATE_ONFIDO_APPLICANT_ID = 'UPDATE_ONFIDO_APPLICANT_ID'
export type UpdateOnfidoApplicantIdAction = {
  type: typeof UPDATE_ONFIDO_APPLICANT_ID,
  applicantId: string,
}

export const ONFIDO_CONNECTION_ESTABLISHED = 'ONFIDO_CONNECTION_ESTABLISHED'
export type OnfidoConnectionEstablishedAction = {
  type: typeof ONFIDO_CONNECTION_ESTABLISHED,
  onfidoDid: string,
}

export const HYDRATE_ONFIDO_DID_SUCCESS = 'HYDRATE_ONFIDO_DID_SUCCESS'
export type HydrateOnfidoDidSuccessAction = {
  type: typeof HYDRATE_ONFIDO_DID_SUCCESS,
  onfidoDid: string,
}

export const REMOVE_ONFIDO_DID = 'REMOVE_ONFIDO_DID'
export type RemoveOnfidoDidAction = {
  type: typeof REMOVE_ONFIDO_DID,
}

export const GET_APPLICANT_ID = 'GET_APPLICANT_ID'
export type GetApplicantIdAction = {
  type: typeof GET_APPLICANT_ID,
}

export type OnfidoStoreAction =
  | LaunchOnfidoSDKAction
  | UpdateOnfidoProcessStatusAction
  | HydrateApplicantIdAction
  | UpdateOnfidoApplicantIdAction
  | OnfidoConnectionEstablishedAction
  | HydrateOnfidoDidSuccessAction
  | RemoveOnfidoDidAction
  | GetApplicantIdAction

export const ERROR_ONFIDO_APPLICANT_ID_API = (message: string) => ({
  code: 'ON-001',
  message: `${message}`,
})

export const ERROR_ONFIDO_SDK = (message: string) => ({
  code: 'ON-002',
  message,
})

export const ERROR_CONNECTION_DETAIL_INVALID = (message: string) => ({
  code: 'ON-003',
  message: `Invalid connection details returned by onfido: ${message}`,
})

export const ERROR_MESSAGE_NO_APPLICANT_ID = 'Could not get Onfido applicant id'
