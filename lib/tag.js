'use strict';

var _ = require('lodash');
var common = require('./common');

var filterEmptyTags = function (tag) {
    if (!tag.posts || tag.posts.length === 0) {
        return false;
    }
    return true;
};

var tag = function (locals) {
    var get = function () {
        if (locals.tags.length === 0) {
            return;
        }
        var tags = _(locals.tags.toArray())
            .map(common.setItemLastUpdate)
            .filter(filterEmptyTags)
            .sortByOrder('updated')
            .value();

        var lastUpdatedTag = _.chain(tags).first().get('updated').value();

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
