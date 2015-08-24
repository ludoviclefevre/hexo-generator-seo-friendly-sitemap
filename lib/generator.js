'use strict';

var Promise = require('bluebird'),
    common = require('./common');

var seoFriendlySitemap = function (locals) {
    var config = this.config,
        posts = require('./post')(locals),
        pages = require('./page')(locals),
        categories = require('./category')(locals),
        tags = require('./tag')(locals),
        xsl = require('./xsl')(locals),
        indexSitemap = require('./indexSitemap')(locals, config),
        render = require('./render')(locals, config),
        sitemaps = [
            posts.get(),
            pages.get(),
            categories.get(),
            tags.get(),
            xsl.get()
        ];

    return Promise.all(sitemaps)
        .filter(common.isDefined)
        .then(indexSitemap.get)
        .map(render);
};

module.exports = seoFriendlySitemap;
