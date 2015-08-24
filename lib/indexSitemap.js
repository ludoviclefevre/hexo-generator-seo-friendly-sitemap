'use strict';

var _ = require('lodash');

var indexSitemap = function (locals, config) {
    var get = function (filePaths) {
        var indexSitemapItems = _.chain(filePaths)
            .filter('isInIndexSitemap')
            .map(getIndexSitemapItem)
            .value();

        filePaths.push({
            template: 'index-sitemap.ejs',
            filename: getIndexSitemapFilename(),
            items: indexSitemapItems
        });
        return filePaths;
    };

    var getIndexSitemapItem = function (item) {
        return {
            url: config.url + '/' + item.filename,
            lastModification: item.lastModification
        };
    };

    var getIndexSitemapFilename = function () {
        if (config.sitemap && config.sitemap.path) {
            return config.sitemap.path;
        }
        return 'sitemap.xml';
    };

    return {
        get: get
    };
};

module.exports = indexSitemap;

