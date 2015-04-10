var ejs = require('ejs'),
    path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    indexSitemapFilePath = path.join(__dirname, '../views/index-sitemap.ejs'),
    sitemapFilePath = path.join(__dirname, '../views/sitemap.ejs');

var sitemap = function (locals) {
        var config = this.config,
            posts = locals.posts.toArray()
                .filter(function (post) {
                    return post.sitemap !== false;
                })
                .sort(function (a, b) {
                    return b.updated - a.updated;
                }),
            pages = locals.pages.toArray()
                .filter(function (post) {
                    return post.sitemap !== false;
                })
                .sort(function (a, b) {
                    return b.updated - a.updated;
                });


        var getIndexSitemapData = function (templateContent) {
            var lastUpdated = _.first(posts).updated,
                template = ejs.compile(templateContent, {
                    compileDebug: true
                }),
                xml = template({
                    items: [{
                        url: config.url + '/post-sitemap.xml',
                        lastModification: lastUpdated
                    },
                        {
                            url: config.url + '/page-sitemap.xml',
                            lastModification: lastUpdated

                        }, {
                            url: config.url + '/page-sitemap.xml',
                            lastModification: lastUpdated

                        }, {
                            url: config
                                .
                                url + '/page-sitemap.xml',
                            lastModification: lastUpdated
                        }
                    ]

                }),

                result = {
                    path: 'post-sitemap.xml',
                    data: xml
                };
            return result;
        };

        var getPostSitemapData = function (templateContent) {
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

        var getIndexSitemap = function () {
            return fs.readFileAsync(indexSitemapFilePath)
                .then(getIndexSitemapData);
        };

        var getPostSitemap = function () {
            return fs.readFileAsync(sitemapFilePath)
                .then(getPostSitemapData);
        };

        /*
        return getIndexSitemap()
            .then(getPostSitemap);
            */

        return Promise.all([
            getIndexSitemap()
            //getPostSitemap()
        ]);

        /*
        Promise.props({
            indexSitemap: getIndexSitemap(),
            postSitemap: getPostSitemap(),
            tweets: getTweets()
        }).then(function (result) {
            console.log(result.tweets, result.pictures, result.comments);
        });

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
        */
    };

module.exports = sitemap;
