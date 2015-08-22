'use strict';

var _ = require('lodash'),
    common = require('./common');

var isInPosts = function (tag) {
    return (tag.posts.length > 0);
};

var tag = function (locals) {
    var get = function () {
        if (locals.tags.length === 0) {
            return;
        }
        var tags = _(locals.tags.toArray())
            .map(common.setItemLastUpdate)
            .filter(isInPosts)
            .sortByOrder('updated')
            .value();

        var lastUpdatedTag = _.chain(tags)
            .first()
            .get('updated')
            .value();

        return {
            template: 'tag-sitemap.ejs',
            filename: 'tag-sitemap.xml',
            items: tags,
            lastModification: lastUpdatedTag,
            isInIndexSitemap: true
        };
    };

    return {
        get: get
    };
};

module.exports = tag;
