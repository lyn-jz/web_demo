const program = require('commander');

const { version } = require('./constants.js');
const path = require('path');

const mapActions = {
	create: {
		alias: 'c', // 命令别名
		description: 'create a project', // 命令描述
		examples: [
			'lyn-cli create <project-name>'
		]
	},
	config: {
		alias: 'conf',
		description: 'config project variable',
		examples:[
			'lyn-cli config set <key> <value>',
			'lyn-cli config get <key>'
		]
	},
	'*': {
		alias: '',
		description: 'command not found',
		examples: []
	}
}

Reflect.ownKeys(mapActions).forEach(action => {
	program
		.command(action)
		.alias(mapActions[action].alias)
		.description(mapActions[action].description)
		.action(() => {
			if(action === '*') {
				console.log(mapActions[action].description)
			} else {
				// console.log(action);
				require(path.resolve(__dirname, action))(...process.argv.slice(3));
			}
		});
})

// 监听help
program.on('--help', () => {
	console.log('\nExamples:');

	Reflect.ownKeys(mapActions).forEach(action => {
			mapActions[action].examples.forEach(example => {
				console.log(`  ${example}`);
			});
	})
});

// 解析参数，--help，version
program.version(version).parse(process.argv);

