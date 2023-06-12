import {SSMClient, GetParametersCommand} from '@aws-sdk/client-ssm'

export type ParamValue = {
  name: string
  value: string
  secret: boolean
}

export const getValues = async (
  paramsObj: Record<string, string>
): Promise<ParamValue[]> => {
  const client = new SSMClient({})
  const input = {
    Names: Object.values(paramsObj),
    WithDecryption: true
  }
  const command = new GetParametersCommand(input)
  const response = await client.send(command)
  const params = response.Parameters
  const values: ParamValue[] = []
  if (!params) return values
  const envVars = Object.keys(paramsObj)
  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    if (!param.Value) continue
    values.push({
      name: envVars[i],
      value: param.Value,
      secret: param.Type === 'SecureString'
    })
  }
  return values
}

// { // GetParametersResult
//   Parameters: [ // ParameterList
//     { // Parameter
//       Name: 'STRING_VALUE',
//       Type: 'String' || 'StringList' || 'SecureString',
//       Value: 'STRING_VALUE',
//       Version: Number('long'),
//       Selector: 'STRING_VALUE',
//       SourceResult: 'STRING_VALUE',
//       LastModifiedDate: new Date('TIMESTAMP'),
//       ARN: 'STRING_VALUE',
//       DataType: 'STRING_VALUE',
//     },
//   ],
//   InvalidParameters: [ // ParameterNameList
//     'STRING_VALUE',
//   ],
// };
