var path = require('path'),
    ejs = require('ejs'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs'));

var googleFriendlySitemap = function (locals) {
    "use strict"

    var config = this.config,
        viewPath = path.join(__dirname, '../views/'),
        readFileOptions = {
            encoding: 'utf8'
        },

        postInSitemap = function (post) {
            return post.sitemap !== false && post.published;
        },

        setItemLastUpdate = function (item) {
            item.updated = _.max(item.posts.toArray(), function (post) {
                return post.updated.toDate();
            }).updated.toDate();
            return item;
        },

        lastUpdatedPost,
        lastUpdatedPage,
        lastUpdatedCategory,
        lastUpdatedTag,

        filePaths = [
            {
                template: 'sitemapXsl.ejs',
                filename: 'sitemap.xsl',
                isInIndexSitemap: false
            }
        ];

    var addPosts = function () {
        if (locals.posts.length === 0) {
            return;
        }
        var posts = _(locals.posts.toArray())
            .filter(postInSitemap)
            .sortByOrder('updated', false)
            .value();

        lastUpdatedPost = _.chain(posts).first().get('updated').value();

        filePaths.push({
            template: 'post-sitemap.ejs',
            filename: 'post-sitemap.xml',
            items: posts,
            lastModification: lastUpdatedPost,
            isInIndexSitemap: true
        });
    };


    var addPages = function () {
        if (locals.pages.length === 0) {
            return;
        }
        var pages = _(locals.pages.toArray())
            .reject({sitemap: false})
            .sortByOrder('updated', false)
            .value();

        lastUpdatedPage = _.chain(pages).first().get('updated').value();

        filePaths.push({
            template: 'page-sitemap.ejs',
            filename: 'page-sitemap.xml',
            items: pages,
            lastModification: lastUpdatedPage,
            isInIndexSitemap: true
        });
    };

    var addCategories = function () {
        if (locals.categories.length === 0) {
            return;
        }
        var categories = _(locals.categories.toArray())
            .map(setItemLastUpdate)
            .sortByOrder('updated')
            .value();

        lastUpdatedCategory = _.chain(categories).first().get('updated').value();

        filePaths.push({
            template: 'category-sitemap.ejs',
            filename: 'category-sitemap.xml',
            items: categories,
            lastModification: lastUpdatedCategory,
            isInIndexSitemap: true
        });
    };

    var addTags = function () {
        if (locals.tags.length === 0) {
            return;
        }
        var tags = _(locals.tags.toArray())
            .map(setItemLastUpdate)
            .sortByOrder('updated')
            .value();

        lastUpdatedTag = _.chain(tags).first().get('updated').value();

        filePaths.push({
            template: 'tag-sitemap.ejs',
            filename: 'tag-sitemap.xml',
            items: tags,
            lastModification: lastUpdatedTag,
            isInIndexSitemap: true
        });
    };

    var getIndexSitemapItem = function (item) {
        return {
            url: config.url + '/' + item.filename,
            lastModification: item.lastModification
        };
    };

    var getFileContent = function (filePath) {
        return fs.readFileAsync(filePath, readFileOptions);
    };

    var getCompiledContent = function (data, filePath, templateContent) {
        var compiledTemplate = ejs.compile(templateContent, {
                filename: filePath
            }),
            xml = compiledTemplate({
                config: config,
                items: data.items
            });

        return {
            path: data.filename,
            data: xml
        };
    };

    var getSitemap = function (sitemap) {
        var filePath = path.join(viewPath, sitemap.template);
        //return getCompiledContent(item, filePath);
        return Promise.join(
            sitemap,
            filePath,
            getFileContent(filePath),
            getCompiledContent);
    };

    addPosts();
    addPages();
    addCategories();
    addTags();

    var indexSitemapItems = _.chain(filePaths)
        .filter('isInIndexSitemap')
        .map(getIndexSitemapItem)
        .value();

    filePaths.push(
        {
            template: 'index-sitemap.ejs',
            filename: 'index-sitemap.xml',
            items: indexSitemapItems
        });

    return Promise.map(filePaths, getSitemap);
};

module.exports = googleFriendlySitemap;
