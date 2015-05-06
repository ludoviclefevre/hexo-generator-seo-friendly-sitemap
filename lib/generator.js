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
        tags = locals.tags;

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

    var getCategorySitemapData = function (updatedCategories, templateContent) {
        var sitemapTmpl = ejs.compile(templateContent, {
                filename: categorySitemapFilePath
            }),
            xml = sitemapTmpl({
                config: config,
                categories: updatedCategories
            }),
            result = {
                path: 'category-sitemap.xml',
                data: xml
            };
        return result;
    };

    var getTagSitemapData = function (updatedTags, templateContent) {
        var sitemapTmpl = ejs.compile(templateContent, {
                filename: tagSitemapFilePath
            }),
            xml = sitemapTmpl({
                config: config,
                tags: updatedTags
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

    var getTemplateContent = function (filePath) {
        return fs.readFileAsync(filePath, readFileOptions)
    };

    var setItemLastUpdate = function (item) {
        item.lastUpdated = _.max(item.posts.toArray(), function (post) {
            return post.updated.toDate();
        }).updated.toDate();
        return item;
    };

    var getCategorySitemap = function () {
        var updatedCategories = _.map(categories.toArray(), setItemLastUpdate),
            templateContent = getTemplateContent(categorySitemapFilePath);

        return Promise.join(updatedCategories, templateContent, getCategorySitemapData);
    };

    var getTagSitemap = function () {
        var updatedTags = _.map(tags.toArray(), setItemLastUpdate),
            templateContent = getTemplateContent(tagSitemapFilePath);

        return Promise.join(updatedTags, templateContent, getTagSitemapData);
    };

    return Promise.all([
        getIndexSitemap(),
        getPostSitemap(),
        getPageSitemap(),
        getCategorySitemap(),
        getTagSitemap()
    ]);
};

module.exports = googleFriendlySitemap;
