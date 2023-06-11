import {getInput, error, setSecret, exportVariable, info} from '@actions/core'
import {mockClient} from 'aws-sdk-client-mock'
import {SSMClient, GetParametersCommand} from '@aws-sdk/client-ssm'
import {wait} from '../src/wait'
import {parseParams} from '../src/parse-params'
import {getParams} from '../src/get-params'
import {setEnv} from '../src/set-env'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test, jest} from '@jest/globals'

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  var delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_MILLISECONDS'] = '500'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})

test('parse input params', () => {
  const params = `
    VARIABLE1=/good/variable
    VARIABLE2=/another/good/variable
    SECRET1=/good/secret
  `
  const parsed = {
    VARIABLE1: '/good/variable',
    VARIABLE2: '/another/good/variable',
    SECRET1: '/good/secret'
  }
  expect(parseParams(params)).toStrictEqual(parsed)
})

const client = mockClient(SSMClient)

test('get param values from AWS', async () => {
  client.on(GetParametersCommand).resolves({
    Parameters: [
      {
        Name: '/a/variable',
        Type: 'String',
        Value: 'variable a value'
      },
      {
        Name: '/b/variable',
        Type: 'String',
        Value: 'variable b value'
      },
      {
        Name: '/a/secret',
        Type: 'SecureString',
        Value: 'secret a value'
      }
    ]
  })
  const parsed = {
    VARIABLE_A: '/a/variable',
    VARIABLE_B: '/b/variable',
    SECRET_A: '/a/secret'
  }
  const retrieved = await getParams(parsed)
  const expected = [
    {
      name: 'VARIABLE_A',
      value: 'variable a value',
      secret: false
    },
    {
      name: 'VARIABLE_B',
      value: 'variable b value',
      secret: false
    },
    {
      name: 'SECRET_A',
      value: 'secret a value',
      secret: true
    }
  ]
  expect(retrieved).toStrictEqual(expected)
})

jest.mock('@actions/core')
const mockedExportVariable = jest.mocked(exportVariable)
const mockedSetSecret = jest.mocked(setSecret)

test('set environment variables', () => {
  const retrievedParams = [
    {
      name: 'VARIABLE_A',
      value: 'variable a value',
      secret: false
    },
    {
      name: 'VARIABLE_B',
      value: 'variable b value',
      secret: false
    },
    {
      name: 'SECRET_A',
      value: 'secret a value',
      secret: true
    }
  ]
  setEnv(retrievedParams)
  expect(mockedExportVariable.mock.calls).toHaveLength(3)
  expect(mockedExportVariable.mock.calls[0][0]).toBe('VARIABLE_A')
  expect(mockedExportVariable.mock.calls[0][1]).toBe('variable a value')
  expect(mockedExportVariable.mock.calls[1][0]).toBe('VARIABLE_B')
  expect(mockedExportVariable.mock.calls[1][1]).toBe('variable b value')
  expect(mockedExportVariable.mock.calls[2][0]).toBe('SECRET_A')
  expect(mockedExportVariable.mock.calls[2][1]).toBe('secret a value')
  expect(mockedSetSecret.mock.calls).toHaveLength(1)
  expect(mockedSetSecret.mock.calls[0][0]).toBe('secret a value')
})
