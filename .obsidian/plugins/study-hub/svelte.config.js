const sveltePreprocess = require('svelte-preprocess');
const path = require('path');

module.exports = {
    preprocess: sveltePreprocess({
        typescript: {
            tsconfigFile: path.join(__dirname, 'tsconfig.json')
        }
    })
};
