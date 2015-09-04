'use strict';

var _ = require('lodash');

var postInSitemap = function (post) {
    return (post.sitemap !== false && post.published);
};

var post = function (locals) {
    var get = function () {
        if (locals.posts.length === 0) {
            return;
        }
        var posts = _(locals.posts.toArray())
            .filter(postInSitemap)
            .sortByOrder('updated', false)
            .value();

        var lastUpdatedPost = _.chain(posts)
            .first()
            .get('updated')
            .value();

        return {
            template: 'post-sitemap.ejs',
            filename: 'post-sitemap.xml',
            data: {
                items: posts
            },
            lastModification: lastUpdatedPost,
            isInIndexSitemap: true
        };
    };

    return {
        get: get
    };
};

module.exports = post;
