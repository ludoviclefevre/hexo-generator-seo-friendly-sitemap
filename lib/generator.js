'use strict';

var path = require('path'),
    ejs = require('ejs'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    beautify = require('pretty-data').pd,
    common = require('./common');

var seoFriendlySitemap = function (locals) {

    var config = this.config,
        viewPath = path.join(__dirname, '..', 'views'),
        posts = require('./post')(locals),
        pages = require('./page')(locals),
        categories = require('./category')(locals),
        tags = require('./tag')(locals),
        xsl = require('./xsl')(locals),
        indexSitemap = require('./indexSitemap')(locals, config),
        sitemaps = [];

    var getCompiledContent = function (data, templateFilePath, templateContent) {
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
    };

    var renderSitemap = function (sitemap) {
        if (!sitemap) {
            return;
        }
        var templateFilePath = path.join(viewPath, sitemap.template);
        return Promise.join(
            sitemap,
            templateFilePath,
            common.getFileContent(templateFilePath),
            getCompiledContent);
    };

    sitemaps.push(posts.get());
    sitemaps.push(pages.get());
    sitemaps.push(categories.get());
    sitemaps.push(tags.get());
    sitemaps.push(xsl.get());
    sitemaps.push(indexSitemap.get(sitemaps));

    return Promise.all(sitemaps)
        .filter(common.isDefined)
        .map(renderSitemap);
};

module.exports = seoFriendlySitemap;
