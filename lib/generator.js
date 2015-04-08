var ejs = require('ejs'),
    path = require('path'),
    fs = require('fs'),
    sitemapSrc = path.join(__dirname, '../views/sitemap.ejs'),
    sitemapTmpl = ejs.compile(fs.readFileSync(sitemapSrc, 'utf8'));

var sitemap = function (locals) {
    var config = this.config;

    var posts = [].concat(locals.posts.toArray(), locals.pages.toArray())
        .filter(function (post) {
            return post.sitemap !== false;
        })
        .sort(function (a, b) {
            return b.updated - a.updated;
        });

    var xml = sitemapTmpl({
        config: config,
        posts: posts
    });

    return {
        path: config.sitemap.path,
        data: xml
    };
};

module.exports = sitemap;
