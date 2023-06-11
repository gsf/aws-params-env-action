import {setSecret, exportVariable} from '@actions/core'
import {RetrievedParam} from './get-params'

export const setEnv = (params: RetrievedParam[]) => {
  for (const param of params) {
    if (param.secret) {
      setSecret(param.value)
    }
    exportVariable(param.name, param.value)
  }
}
