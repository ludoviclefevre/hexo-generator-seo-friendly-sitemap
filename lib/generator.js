'use strict';

var path = require('path'),
    ejs = require('ejs'),
    _ = require('lodash'),
    moment = require('moment'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    beautify = require('pretty-data').pd,

    seoFriendlySitemap = function (locals) {

        var config = this.config,
            viewPath = path.join(__dirname, '../views/'),
            posts = require('./post')(locals),
            pages = require('./page')(locals),
            categories = require('./category')(locals),
            tags = require('./tag')(locals),
            xsl = require('./xsl')(locals),

            readFileOptions = {
                encoding: 'utf8'
            },

            filePaths = [],

            getIndexSitemapFilename = function (config) {
                if (config.sitemap && config.sitemap.path) {
                    return config.sitemap.path;
                }
                return 'sitemap.xml';
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
                    }),
                    beautifiedContent = beautify.xml(xml);

                return {
                    path: data.filename,
                    data: xml
                };
            },

            getSitemap = function (sitemap) {
                if (!sitemap) {
                    return;
                }
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
            };

        filePaths.push(posts.get());
        filePaths.push(pages.get());
        filePaths.push(categories.get());
        filePaths.push(tags.get());
        addIndexSitemap();
        filePaths.push(xsl.get());

        _.remove(filePaths, _.isUndefined);
        return Promise.map(filePaths, getSitemap);
    };

module.exports = seoFriendlySitemap;
