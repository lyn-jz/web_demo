require.context = (directory, useSubdirectories = false, regExp = /^\.\\/) => {
  regExp = process.platform === 'darwin' ? /^\.\// : regExp;
  const fs = require('fs');
  const path = require('path');
  const baseURL = path.join(__dirname, directory);
  const context = (file) => {
    const data = fs.readFileSync(path.join(baseURL, file), {
      encoding: 'utf8'
    });
    if(/.js$/.test(file)){
      return eval(data);
    }
    return data;
  };
  context.resolve = (key) => {
    return `.\\${path.relative(process.cwd(), path.join(__dirname, key))}`;
  }
  context.keys = () => {
    function getKeys(dir){
      let res = fs.readdirSync(path.join(baseURL, dir)).reduce((acc, key) => {
        const url = `.\\${path.join(dir, key)}`;
        const stats = fs.statSync(path.join(baseURL, dir, key));
        if (stats.isDirectory()) {
          if (useSubdirectories) {
            acc = acc.concat(getKeys(url));
          }
        } else if (regExp.test(url)){
          acc.push(url);
        }
        return acc;
      }, []);
      return res;
    }
    return getKeys('.\\');
  }
  context.id = `.\\${path.relative(process.cwd(), __dirname)} sync ${regExp}`;
  return context;
}
const context = require.context('./test', true, /.js$/);
console.log('id:', context.id); // id: .\require.context sync / .js$ /
console.log('keys:', context.keys()); // keys: Array(3)[".\sub\test11.js", ".\test1.js", ".\test2.js"]
context.keys().map(val => {
  console.log(context.resolve(val), context(val));
});
//  .\require.context\sub\test11.js { name: "test11" }
//  .\require.context\test1.js { name: "test1" }
//  .\require.context\test2.js { name: "test2" }

