//@flow
import RNFetchBlob from 'react-native-fetch-blob'
import uniqueId from 'react-native-unique-id'
import { setVcxLogger } from '../bridge/react-native-cxs/RNCxs'

export const CUSTOM_LOG_UTILS = {
  fs: RNFetchBlob.fs,
  MAX_ALLOWED_FILE_BYTES: 10000000,
  alsoLogToConsole: process.env.NODE_ENV !== 'test' && __DEV__,
}

export const customLogger = {
  recordBuffer: [],
  vcxLogFile: null,
  initOnlyOnce: false,
  log: function(...allArgs: any[]) {
    //console.log(JSON.stringify(allArgs))
    //this.addRecord({ fname: 'log', args: allArgs })
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.log.apply(null, allArgs)
    }
  },
  error: function(...allArgs: any[]) {
    //this.addRecord({ fname: 'error', args: allArgs })
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.error.apply(null, allArgs)
    }
  },
  assert: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.assert.apply(null, allArgs)
    }
  },
  clear: function(...allArgs: any[]) {
    //this.addRecord({ fname: 'clear', args: allArgs })
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.clear.apply(null, allArgs)
    }
  },
  count: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.count.apply(null, allArgs)
    }
  },
  debug: function(...allArgs: any[]) {
    //this.addRecord({ fname: 'debug', args: allArgs })
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.debug.apply(null, allArgs)
    }
  },
  dir: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.dir.apply(null, allArgs)
    }
  },
  dirxml: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.dirxml.apply(null, allArgs)
    }
  },
  group: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.group.apply(null, allArgs)
    }
  },
  groupCollapsed: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.groupCollapsed.apply(null, allArgs)
    }
  },
  groupEnd: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.groupEnd.apply(null, allArgs)
    }
  },
  info: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.info.apply(null, allArgs)
    }
  },
  table: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.table.apply(null, allArgs)
    }
  },
  time: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.time.apply(null, allArgs)
    }
  },
  timeEnd: function(...allArgs: any[]) {
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.timeEnd.apply(null, allArgs)
    }
  },
  trace: function(...allArgs: any[]) {
    //this.addRecord({ fname: 'trace', args: allArgs })
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.trace.apply(null, allArgs)
    }
  },
  warn: function(...allArgs: any[]) {
    //this.addRecord({ fname: 'warn', args: allArgs })
    if (CUSTOM_LOG_UTILS.alsoLogToConsole) {
      console.warn.apply(null, allArgs)
    }
  },

  captureException: function(error: Error) {
    this.log(error.toString())
  },

  setVcxLogFile: function(logFile: string) {
    this.vcxLogFile = logFile
  },

  getVcxLogFile: function() {
    return this.vcxLogFile
  },

  init: function() {
    if (!this.initOnlyOnce) {
      // invoke the RNIndy.setVcxLogger function
      this.initOnlyOnce = true
      uniqueId()
        .then(uniqueIdent => {
          console.log('The app unique id is: ', uniqueIdent)
          // setVcxLogger(uniqueIdent, CUSTOM_LOG_UTILS.MAX_ALLOWED_FILE_BYTES)
          //   .then(logFilePath => {
          //     this.setVcxLogFile(logFilePath)
          //     console.log('Setting vcx log file to: ', logFilePath)
          //   })
          //   .catch(error => {
          //     console.error('Error setting vcx log file: ', error)
          //   })
        })
        .catch(error => {
          console.error('Error getting unique id in redux store: ', error)
        })
    }
  },

  addRecord: function(record: any) {
    // write the logging record to the debug file
    const rotatingLog = this.getVcxLogFile()
    if (rotatingLog) {
      CUSTOM_LOG_UTILS.fs
        .exists(rotatingLog)
        .then(exists => {
          if (exists) {
            if (this.recordBuffer.length) {
              for (let i = 0; i < this.recordBuffer.length; ++i) {
                this.writeToLog(rotatingLog, this.recordBuffer[i])
              }
              this.recordBuffer.length = 0
            }
            this.writeToLog(rotatingLog, record)
          } else {
            this.addRecordToBuffer(record, rotatingLog)
          }
        })
        .catch(() => {
          //console.log('Error when checking if file exists: ', rotatingLog)
        })
    } else {
      this.addRecordToBuffer(record, rotatingLog)
    }
  },

  addRecordToBuffer: function(record: any, rotatingLog: string) {
    if (this.recordBuffer.length <= 0 && !this.initOnlyOnce) {
      // This logic MUST ensure that this.init() is only invoked ONCE
      this.init()
    }
    this.recordBuffer.push(record)
  },

  writeToLog: function(rotatingLog: string, record: any) {
    const recordAsString = JSON.stringify(record)

    // if (recordAsString.indexOf('%c prev state') === -1) {
    //   CUSTOM_LOG_UTILS.fs
    //     .writeStream(
    //       rotatingLog,
    //       // encoding, should be one of `base64`, `utf8`, `ascii`
    //       'utf8',
    //       // should data append to existing content ?
    //       true
    //     )
    //     .then(ofstream => {
    //       ofstream.write('[' + new Date().toString() + '] :: ')
    //       ofstream.write(recordAsString)
    //       ofstream.write('\n')
    //       ofstream.close()
    //     })
    // }
  },

  clearRecords: function() {},

  getRecords: function() {},
}
