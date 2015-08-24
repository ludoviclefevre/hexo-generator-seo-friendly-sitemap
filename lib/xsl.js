'use strict';

var xsl = function () {
    var get = function () {
        return {
            template: 'sitemapXsl.ejs',
            filename: 'sitemap.xsl',
            isInIndexSitemap: false
        };
    };

    return {
        get: get
    };
};

module.exports = xsl;
