const chalk = require('chalk')

const { generateStorableKeyPairs } = require('@agnostack/verifyd')

if (require.main === module) {
  generateStorableKeyPairs().then((keyPair) => {
    console.log(`${chalk.yellowBright('generate-keypair')} - ${chalk.cyan('info')} - ${chalk.yellow('PUBLIC_KEY')}=${keyPair.publicKey}`)
    console.log(`${chalk.yellowBright('generate-keypair')} - ${chalk.cyan('info')} - ${chalk.yellow('PRIVATE_KEY')}=${keyPair.privateKey}`)
  })
}
