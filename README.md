# agnoStack - Example Custom Integration Provider 🚀

This repository contains the Example implementation of the agnoStack Custom Integration Provider.

---

## Prerequisites/Tools

- pnpm (or similar package manager)
- Node.js (v22 or higher)
- AWS SAM (`brew install aws-sam-cli`)
- nvm (optional)

### OPTIONAL (if using nvm)
```bash
nvm install
```

## Install repo dependencies

```bash
pnpm install
```

## Generate new keypair

Run `pnpm run generate-keypair` (executes the `generate-keypair.js` script) to create a new keypair for your setup.

Capture the values for `PUBLIC_KEY` as `PRIVATE_KEY` from the generated output to use in step below.

NOTE: You will also need the generated `PUBLIC_KEY` value to enter into agnoStack in the Custom Integration Provider settings into the "`Public Key`" field.


# AWS Deployment

## Environment Variables Reference

| Variable | AWS Service | Path |
|----------|-------------|------|
| `PUBLIC_KEY` | SSM Parameter Store | `/agnostack-custom-integration-example/PUBLIC_KEY` |
| `SHARED_SECRET` | SSM Parameter Store | `/agnostack-custom-integration-example/SHARED_SECRET` |
| `PRIVATE_KEY` | Secrets Manager | `/agnostack-custom-integration-example/SECURE` |

## Add initial parameters to AWS SSM (Parameter Store)

### OPTIONAL (if AWS CLI is not installed)
```bash
brew install aws-sam-cli
```

Execute the following commands to add parameters to AWS SSM (Parameter Store) - or can manually add via AWS Console:

```bash
aws ssm put-parameter \
  --name "/agnostack-custom-integration-example/PUBLIC_KEY" \
  --value "XXXXXXXXX" \
  --type "String" \
  --overwrite
```

In addition to the above, you will need to add a TEMPORARY  `SHARED_SECRET` parameter to AWS SSM (Parameter Store) as well (we will update this value below after you have completed the agnoStack Custom Integration Provider configuration).

```bash
aws ssm put-parameter \
  --name "/agnostack-custom-integration-example/SHARED_SECRET" \
  --value "TEMP" \
  --type "String" \
  --overwrite
```

## Add SECRET parameter to AWS Secrets Manager

Execute the following commands to populate a `SECURE` parameter within AWS Secrets Manager - or can manually add via AWS Console:

Be sure to enter the `PRIVATE_KEY` values in the JSON format shown below from the earlier step above.

```bash
aws secretsmanager create-secret \
  --name "/agnostack-custom-integration-example/SECURE" \
  --secret-string '{ "PRIVATE_KEY": "XXXXXXXXX" }'
```

## Deploy

This will generate a CloudFormation template and deploy the Lambda function to AWS and return a `URL` to access the Lambda function for use within the agnoStack Custom Integration Provider settings.

```bash
pnpm release:prod
```

## agnoStack Custom Integration Provider Configuration

Use this `URL` from the step above within in the agnoStack Custom Integration Provider settings along with your `PUBLIC_KEY` from the earlier step.

agnoStack will generate a `SHARED_SECRET` for you to use within the Custom Integration Provider settings. Click the copy button to copy the `SHARED_SECRET` and capture it locally for later use.

Continue through the agnoStack configuration screens and click "Activate" to save your configuration.

## Update parameters in AWS SSM (Parameter Store)

Populate the `SHARED_SECRET` parameter in AWS SSM (Parameter Store) with the real value from the step above generate by agnoStack (replacing `XXXXXXXXX` below).

```bash
aws ssm put-parameter \
  --name "/agnostack-custom-integration-example/SHARED_SECRET" \
  --value "XXXXXXXXX" \
  --type "String" \
  --overwrite
```

## Redeploy the app to ensure the latest AWS SSM parameter values are referenced by the Lambda function(s)

```bash
pnpm release:prod
```

NOTE: any time you update an AWS SSM parameter and/or Secrets Manager parameter, you must redeploy to ensure the latest values are referenced.

---

# Local Development

## Configure local environment variables

Copy `.env.local.example` and rename as `.env.local`. Ensure required environment variables from the example file are present.

```bash
PUBLIC_KEY: obtained from `pnpm run generate-keypair` above

PRIVATE_KEY: obtain from `pnpm run generate-keypair` above

SHARED_SECRET: obtain from agnoStack configuraiton panel (Custom Integration Provider settings)
```

## Run the local development server

```bash
pnpm watch
```

NOTE: this will run your local project via SAM offline AND also generate an ngrok URL that you can then enter into agnoStack in the Custom Integration Provider settings in the "`API Path`" field.

---

## REPOSITORY & CODE USAGE

This repository is provided for reference purposes only and is intended to help customers and partners integrate with agnoStack.

It is not a supported SDK and does not grant rights to agnoStack trademarks, branding, or proprietary services.

Use of this code is permitted only in connection with an agnoStack integration.
See the LICENSE file for full terms.
