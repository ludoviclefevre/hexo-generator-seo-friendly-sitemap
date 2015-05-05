var ejs = require('ejs'),
    path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    viewPath = path.join(__dirname, '../views/'),
    indexSitemapFilePath = path.join(viewPath, 'index-sitemap.ejs'),
    postSitemapFilePath = path.join(viewPath, 'post-sitemap.ejs'),
    pageSitemapFilePath = path.join(viewPath, 'page-sitemap.ejs'),
    categorySitemapFilePath = path.join(viewPath, 'category-sitemap.ejs'),
    tagSitemapFilePath = path.join(viewPath, 'tag-sitemap.ejs'),
    readFileOptions = {
        encoding: 'utf8'
    };

var googleFriendlySitemap = function (locals) {
    var config = this.config,
        posts = locals.posts.toArray()
            .filter(function (post) {
                return post.sitemap !== false && post.published;
            })
            .sort(function (a, b) {
                return b.updated - a.updated;
            }),
        pages = locals.pages.toArray()
            .filter(function (page) {
                return page.sitemap !== false;
            })
            .sort(function (a, b) {
                return b.updated - a.updated;
            }),
        categories = locals.categories,
        tags = [];

    var getIndexSitemapData = function (templateContent) {
        var lastUpdated = _.first(posts).updated,
            template = ejs.compile(templateContent, {
                compileDebug: true,
                filename: indexSitemapFilePath
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
                        url: config.url + '/category-sitemap.xml',
                        lastModification: lastUpdated

                    }, {
                        url: config.url + '/tag-sitemap.xml',
                        lastModification: lastUpdated
                    }
                ]
            }),

            result = {
                path: 'index-sitemap.xml',
                data: xml
            };
        return result;
    };

    var getPostSitemapData = function (templateContent) {
        var sitemapTmpl = ejs.compile(templateContent, {
                compileDebug: true,
                filename: postSitemapFilePath
            }),
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

    var getPageSitemapData = function (templateContent) {
        var sitemapTmpl = ejs.compile(templateContent, {
                compileDebug: true,
                filename: pageSitemapFilePath
            }),
            xml = sitemapTmpl({
                config: config,
                pages: pages
            }),
            result = {
                path: 'page-sitemap.xml',
                data: xml
            };
        return result;
    };

    var getCategorySitemapData = function (templateContent) {
        var sitemapTmpl = ejs.compile(templateContent, {
                compileDebug: true,
                filename: categorySitemapFilePath
            }),
            xml = sitemapTmpl({
                config: config,
                categories: categories
            }),
            result = {
                path: 'category-sitemap.xml',
                data: xml
            };
        return result;
    };

    var getTagSitemapData = function (templateContent) {
        var sitemapTmpl = ejs.compile(templateContent, {
                compileDebug: true,
                filename: tagSitemapFilePath
            }),
            xml = sitemapTmpl({
                config: config,
                tags: tags
            }),
            result = {
                path: 'tag-sitemap.xml',
                data: xml
            };
        return result;
    };

    var getIndexSitemap = function () {
        return fs.readFileAsync(indexSitemapFilePath, readFileOptions)
            .then(getIndexSitemapData);
    };

    var getPostSitemap = function () {
        return fs.readFileAsync(postSitemapFilePath, readFileOptions)
            .then(getPostSitemapData);
    };

    var getPageSitemap = function () {
        return fs.readFileAsync(pageSitemapFilePath, readFileOptions)
            .then(getPageSitemapData);
    };

    var getTemplateContent = function(filePath) {
        return fs.readFileAsync(filePath, readFileOptions)
    };

    var setCategoryLastUpdate = function(category) {

        category.posts.toArray()
            .sort(function (a, b) {
                return b.updated - a.updated;
            })
            .get(0)
            .then(function(post){
                category.lastUpdated = post.updated;
            })


        category.lastUpdated = _.max(category.posts.toArray(), function(post) {
            console.log(category);
            console.log(post);
            post.toDate();
        });
    };

    var getCategorySitemap = function () {
        return categories.forEach(setCategoryLastUpdate)
            .then(function() {
                return getTemplateContent(categorySitemapFilePath);
            })
            .then(getCategorySitemapData);
    };

    var getTagSitemap = function () {
        return fs.readFileAsync(tagSitemapFilePath, readFileOptions)
            .then(getTagSitemapData);
    };

    return Promise.all([
        getIndexSitemap(),
        getPostSitemap(),
        getPageSitemap(),
        getCategorySitemap(),
        getTagSitemap()
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

module.exports = googleFriendlySitemap;
