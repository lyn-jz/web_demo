const { version } = require('../package.json');
const downloadFileDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template`;

module.exports = {
	version,
	downloadFileDirectory
}