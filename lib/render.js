'use strict';

var path = require('path'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    ejs = require('ejs'),
    beautify = require('pretty-data').pd,
    common = require('./common');

var render = function (locals, config) {
    var viewPath = path.join(__dirname, '..', 'views');

    var getCompiledContent = function (data, templateFilePath, templateContent) {
        var compiledTemplate = ejs.compile(templateContent, {
                filename: templateFilePath
            }),
            xml = compiledTemplate({
                config: config,
                items: data.items
            });

        if (config.beautify) {
            xml = beautify.xml(xml);
        }

        return {
            path: data.filename,
            data: xml
        };
    };

    var renderSitemaps = function (sitemap) {
        var templateFilePath = path.join(viewPath, sitemap.template);
        return Promise.join(
            sitemap,
            templateFilePath,
            common.getFileContent(templateFilePath),
            getCompiledContent);
    };

    return renderSitemaps;
};

module.exports = render;
