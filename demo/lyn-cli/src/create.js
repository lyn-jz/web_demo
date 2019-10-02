const axios = require('axios');
const ora = require('ora'); // 加载提示
const inquirer = require('inquirer'); // 交互式命令行工具
const path = require('path');
const fs = require('fs');
const { downloadFileDirectory } = require('./constants.js');

const { promisify } = require('util'); // 将异步api转换为promise
let downloadGitRepo = require('download-git-repo');
downloadGitRepo = promisify(downloadGitRepo);
let ncp = require('ncp');
ncp = promisify(ncp);
const MetalSmith = require('metalsmith');
let { render } = require('consolidate').ejs;
render = promisify(render);

const fetchLoading = (fn, msg) => async (...arg) => {
	const spinner = ora(msg);
	spinner.start();
	let res = await fn(...arg);
	spinner.succeed();
	return res;
};

const fetchRepoList = async () => {
	const { data } = await axios.get('https://api.github.com/users/lyn-cli/repos');
	return data;
};

const fetchTagList = async (repo) => {
	const { data } = await axios.get(`https://api.github.com/repos/lyn-cli/${repo}/tags`);
	return data;
};

const download = async (repo, tag) => {
	let api = `lyn-cli/${repo}`;
	if (tag) {
		api += `#${tag}`;
	}
	const dest = `${downloadFileDirectory}\/${repo}`;
	await downloadGitRepo(api, dest);
	return dest;
}

module.exports = async (projectName) => {
	let repos = await fetchLoading(fetchRepoList, 'loading repo list...')();
	repos = repos.map(item => item.name);
	const { repo } = await inquirer.prompt({
		name: 'repo',
		type: 'list',
		message: 'please choice repo template to create project',
		choices: repos
	});

	let tags = await fetchLoading(fetchTagList, 'loading repo list...')(repo);
	tags = tags.map(item => item.name);
	const { tag } = await inquirer.prompt({
		name: 'tag',
		type: 'list',
		message: 'please choice repo template to create project',
		choices: tags
	});

	let target = await fetchLoading(download, 'download repo...')(repo, tag);

	// 简单模板，直接拷贝
	if (!fs.existsSync(path.join(target, 'ask.js'))) {
		await ncp(target, path.resolve(projectName));
	} else {
		await new Promise((resolve, reject) => {
			MetalSmith(__dirname)
				.source(target)
				.destination(path.resolve(projectName))
				.use(async (files, metal, done) => {
					const result = await inquirer.prompt(require(path.join(target,
					'ask.js')));
					const meta = metal.metadata();
					Object.assign(meta, result);
					delete files['ask.js'];
					done();
				})
				.use((files, metal, done) => {
					Reflect.ownKeys(files).forEach(async (file) => {
						if (file.includes('js') || file.includes('json')) {
							let content = files[file].contents.toString();
							if (content.includes('<%')) {
								content = await render(content, metal.metadata());
								files[file].contents = Buffer.from(content);
							}
						}
					})
					console.log(metal.metadata());
					 done()
				})
				.build((err) => {
					if (err) {
						reject();
					} else {
						resolve();
					}
				});
		});
			
	}

	// 复杂模板

}