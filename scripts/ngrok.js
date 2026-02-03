/* eslint-disable no-param-reassign, import/no-extraneous-dependencies */
const chalk = require('chalk')
const ngrok = require('ngrok')

const { parseEnvData } = require('@agnostack/env')

const getNgrok = async (_addr = 8000, props) => {
  const { params } = parseEnvData()

  const addr = params.port || params.PORT || _addr // port or network address
  const subdomain = params.NGROK_SUBDOMAIN || params.SUBDOMAIN

  const url = await ngrok.connect({
    ...subdomain && { subdomain },
    proto: 'http', // http|tcp|tls, defaults to http
    addr,
    ...props,
    ...params,
  })

  return { url, addr }
}

module.exports = getNgrok

if (require.main === module) {
  // NOTE: this can be run direct with node /scripts/ngrok.js --port=12345
  getNgrok().then(({ url, addr }) => {
    console.log(`${chalk.yellowBright('ngrok')} - ${chalk.cyan('info')} - [HTTP] server ready (${chalk.yellow(addr)}): ${chalk.yellow(url)} 🚀🚀`)
  })
}
