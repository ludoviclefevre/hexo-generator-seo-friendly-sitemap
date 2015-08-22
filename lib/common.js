'use strict';

var _ = require('lodash');
var moment = require('moment');

var common = {
    setItemLastUpdate: function (item) {
        if (!item.posts || item.posts.length === 0) {
            item.updated = moment.utc([2015, 0, 1, 8]).toDate();
            return item;
        }
        item.updated = _.max(item.posts.toArray(), function (post) {
            return post.updated.toDate();
        }).updated.toDate();
        return item;
    }
};

module.exports = common;
