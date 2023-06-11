import {getInput, error, setSecret, exportVariable, info} from "@actions/core"
import {SSMClient, GetParametersCommand} from "@aws-sdk/client-ssm"

export const getParams = async (paramsObj: Record<string, string>) => {
  const client = new SSMClient({})
  const input = {
    Names: Object.values(paramsObj),
    WithDecryption: true,
  }
  const command = new GetParametersCommand(input)
  const response = await client.send(command)
  const params = response.Parameters
  if (!params) return
  const envVars = Object.keys(paramsObj)
  for (var i=0; i < params.length; i++) {
    const param = params[i]
    const value = param.Value
    if (!value) continue
    if (param.Type == 'SecureString') {
      setSecret(value)
    }
    exportVariable(envVars[i], value)
  }
}

// { // GetParametersResult
//   Parameters: [ // ParameterList
//     { // Parameter
//       Name: "STRING_VALUE",
//       Type: "String" || "StringList" || "SecureString",
//       Value: "STRING_VALUE",
//       Version: Number("long"),
//       Selector: "STRING_VALUE",
//       SourceResult: "STRING_VALUE",
//       LastModifiedDate: new Date("TIMESTAMP"),
//       ARN: "STRING_VALUE",
//       DataType: "STRING_VALUE",
//     },
//   ],
//   InvalidParameters: [ // ParameterNameList
//     "STRING_VALUE",
//   ],
// };

