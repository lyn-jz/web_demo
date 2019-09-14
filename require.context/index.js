require.context = (directory, useSubdirectories = false, regExp = /^\.\\/) => {
  regExp = process.platform === 'darwin' ? /^\.\// : regExp;
  const fs = require('fs');
  const path = require('path');
  const absoluteURL = path.join(__dirname, directory);
  const relativeURL = path.relative(process.cwd(), __dirname);
  const map = {};
  (function getMap(dir) {
    fs.readdirSync(path.join(absoluteURL, dir)).map((file) => {
      const url = `.\\${path.join(dir, file)}`;
      const stats = fs.statSync(path.join(absoluteURL, dir, file));
      if (stats.isDirectory()) {
        if (useSubdirectories) {
          getMap(url);
        }
      } else if (regExp.test(url)) {
        map[url] = `.\\${path.join(relativeURL, file)}`;
      }
    });
  })('.\\');
  const context = (file) => {
    const data = fs.readFileSync(path.join(absoluteURL, file), {
      encoding: 'utf8'
    });
    if(/.js$/.test(file)){
      return eval(data);
    }
    return data;
  };
  context.resolve = (file) => {
    return map[file];
  }
  context.keys = () => {
    return Object.keys(map);
  }
  context.id = `.\\${relativeURL} sync ${regExp}`;
  // context.map = map;
  return context;
}
const context = require.context('./test', true, /\.js$/);
console.log('id:', context.id);
// id: .\require.context sync / .js$ /
console.log('keys:', context.keys());
// keys: Array(3)[".\sub\test11.js", ".\test1.js", ".\test2.js"]
// console.log('map:', context.map);
context.keys().map(val => {
  console.log(context.resolve(val), context(val));
});
//  .\require.context\sub\test11.js { name: "test11" }
//  .\require.context\test1.js { name: "test1" }
//  .\require.context\test2.js { name: "test2" }

