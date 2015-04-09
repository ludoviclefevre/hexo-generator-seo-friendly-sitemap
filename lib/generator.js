var ejs = require('ejs'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    Promise = require('bluebird'),
    indexSitemapFilePath = path.join(__dirname, '../views/index-sitemap.ejs'),
    sitemapFilePath = path.join(__dirname, '../views/sitemap.ejs');

var sitemap = function (locals) {
    var config = this.config,
        posts = [].concat(locals.posts.toArray(), locals.pages.toArray())
            .filter(function (post) {
                return post.sitemap !== false;
            })
            .sort(function (a, b) {
                return b.updated - a.updated;
            });

    /*
    var getIndexSitemapData = function(templateContent) {
        var template = ejs.compile(templateContent),
            xml = template({
                indexes: [{
                  url: config.url + 'post-sitemap.xml',

                }

                ],
                posts: posts
            }),
            result = {
                path: 'sitemap.xml',
                data: xml
            };
        return result;
    };

    var getPostSitemapData = function(templateContent) {
        var sitemapTmpl = ejs.compile(templateContent),
            xml = sitemapTmpl({
                config: config,
                posts: posts
            }),
            result = {
                path: 'post-sitemap.xml',
                data: xml
            };
        return result;
    };

    var getIndexSitemap = function() {
        return fs.readFileAsync(indexSitemapFilePath).then(getIndexSitemapData);
    };

    var getPostSitemap = function() {
        return fs.readFileAsync(sitemapFilePath).then(getPostSitemapData);
    };

    Promise.props({
        indexSitemap: getIndexSitemap(),
        postSitemap: getPostSitemap(),
        tweets: getTweets()
    }).then(function(result) {
        console.log(result.tweets, result.pictures, result.comments);
    })
    */

    return new Promise(function (resolve, reject) {
        fs.readFileAsync(indexSitemapFilePath).then(function (err, content) {
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
