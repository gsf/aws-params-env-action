# AWS Parameter Store Environment Variables

The `aws-params-env-action` sets workflow environment variables from values in AWS SSM Parameter Store. Parameters of type SecureString are masked.

## Prerequisites

To use this action, you must have AWS credentials and region configured in the action environment. This can be done by using the [configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) step, for example, or by running the action on a self-hosted runner in AWS with an instance profile with the necessary permissions for AWS SSM Parameter Store.

## Usage

Add a step to your workflow like this:

```
- name: Set env vars from AWS params
  uses: gsf/aws-params-env-action@v1
  with:
    params: |
      VAR1=/aws/parameter/a
      ENV_VAR2=/param/b
      SECRET_X=/secret/param/x
```

All steps in the workflow following this step will then have VAR1, ENV_VAR2, and SECRET_X variables in the environment. If SECRET_X is a parameter of type SecureString then it will be masked. This essentially replaces the verbosity and manual masking of a step like this:

```
- name: Set env vars
  run: |
    shopt -s expand_aliases # https://github.com/actions/toolkit/issues/766#issuecomment-928305811
    alias param="aws ssm get-parameter --output text --query Parameter.Value --with-decryption --name"

    parameter_a="$(param /aws/parameter/a)"
    echo "VAR1=$parameter_a" >> "$GITHUB_ENV"

    param_b="$(param /param/b)"
    echo "ENV_VAR2=$param_b" >> "$GITHUB_ENV"

    secret_x="$(param /secret/param/x)"
    echo "::add-mask::$secret_x"
    echo "SECRET_X=$secret_x" >> "$GITHUB_ENV"
```
