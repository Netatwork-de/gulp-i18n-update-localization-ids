
const path = require('path');
const Vinyl = require('vinyl');

const basePath = path.resolve(__dirname, '../data');

module.exports = (name, contents) => new Vinyl({
    base: basePath,
    path: path.join(basePath, name),
    contents: Buffer.from(contents)
});
