var ejs = require('ejs'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    Promise = require('bluebird'),
    indexSitemapFilePath = path.join(__dirname, '../views/sitemap_index.ejs');

var sitemap = function (locals) {
    var config = this.config,
        posts = [].concat(locals.posts.toArray(), locals.pages.toArray())
            .filter(function (post) {
                return post.sitemap !== false;
            })
            .sort(function (a, b) {
                return b.updated - a.updated;
            });

    return new Promise(function (resolve, reject) {
        fs.readFileAsync(indexSitemapFilePath, 'utf8', function (err, content) {
            if (err) {
                return reject(err);
            }
            var sitemapTmpl = ejs.compile(content),
                xml = sitemapTmpl({
                    config: config,
                    posts: posts
                }),
                result = {
                    path: 'sitemap.xml',
                    data: xml
                };
            resolve(result);
        });
    });
};

module.exports = sitemap;
