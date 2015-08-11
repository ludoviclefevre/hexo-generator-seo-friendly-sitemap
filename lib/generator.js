'use strict';

var path = require('path'),
    ejs = require('ejs'),
    _ = require('lodash'),
    moment = require('moment'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),

    seoFriendlySitemap = function (locals) {

        var config = this.config,
            viewPath = path.join(__dirname, '../views/'),
            readFileOptions = {
                encoding: 'utf8'
            },

            postInSitemap = function (post) {
                return post.sitemap !== false && post.published;
            },

            setItemLastUpdate = function (item) {
                if(!item.posts || item.posts.length===0) {
                    item.updated = moment.utc([2015, 0, 1, 8]).toDate();
                    return item;
                }
                item.updated = _.max(item.posts.toArray(), function (post) {
                    return post.updated.toDate();
                }).updated.toDate();
                return item;
            },

            lastUpdatedPost,
            lastUpdatedPage,
            lastUpdatedCategory,
            lastUpdatedTag,

            filePaths = [],

            getIndexSitemapFilename = function (config) {
                if (config.sitemap && config.sitemap.path) {
                    return config.sitemap.path;
                }
                return 'sitemap.xml';
            },

            addPosts = function () {
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
            },


            addPages = function () {
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
            },

            addCategories = function () {
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
            },

            addTags = function () {
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
            },

            getIndexSitemapItem = function (item) {
                return {
                    url: config.url + '/' + item.filename,
                    lastModification: item.lastModification
                };
            },

            getFileContent = function (filePath) {
                return fs.readFileAsync(filePath, readFileOptions);
            },

            getCompiledContent = function (data, templateFilePath, templateContent) {
                var compiledTemplate = ejs.compile(templateContent, {
                        filename: templateFilePath
                    }),
                    xml = compiledTemplate({
                        config: config,
                        items: data.items
                    });

                return {
                    path: data.filename,
                    data: xml
                };
            },

            getSitemap = function (sitemap) {
                var templateFilePath = path.join(viewPath, sitemap.template);
                return Promise.join(
                    sitemap,
                    templateFilePath,
                    getFileContent(templateFilePath),
                    getCompiledContent);
            },

            addIndexSitemap = function () {
                if (filePaths.length === 0) {
                    return;
                }
                var indexSitemapItems = _.chain(filePaths)
                    .filter('isInIndexSitemap')
                    .map(getIndexSitemapItem)
                    .value();

                filePaths.push(
                    {
                        template: 'index-sitemap.ejs',
                        filename: getIndexSitemapFilename(config),
                        items: indexSitemapItems
                    });
            },

            addXSL = function () {
                if (filePaths.length === 0) {
                    return;
                }
                filePaths.push(
                    {
                        template: 'sitemapXsl.ejs',
                        filename: 'sitemap.xsl',
                        isInIndexSitemap: false
                    }
                );
            };

        addPosts();
        addPages();
        addCategories();
        addTags();
        addIndexSitemap();
        addXSL();

        return Promise.map(filePaths, getSitemap);
    };

module.exports = seoFriendlySitemap;
