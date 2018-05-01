'use strict';

var _ = require('lodash'),
  Promise = require('bluebird'),
  urljoin = require('url-join'),
  fs = Promise.promisifyAll(require('fs'));

var getPostUpdated = function (post) {
  return post.updated.toDate();
};

var common = {
  setItemLastUpdate: function (item) {
    var posts = item.posts.toArray();
    item.updated = _.maxBy(posts, getPostUpdated).updated.toDate();
    return item;
  },
  getFileContent: function (filePath) {
    return fs.readFileAsync(filePath, {encoding: 'utf8'});
  },
  isDefined: _.negate(_.isUndefined),

  /**
   * Obtains a list of localized index pages.
   */
  getIndexPages: function (config) {
    if (!_.get(config, 'sitemap.index_i18n')) {
      return [{
        url: config.url
      }];
    }

    var languages = _.castArray(config.language)
      .filter(function (language) {
        // Hexo provides `default` language which hasn't any sense for us
        return language !== 'default';
      });
    return _.map(languages, function (language) {
      return {
        url: urljoin(config.url, language) + '/'
      };
    });
  },

  getIndexSitemapFilename: function (config) {
    if (config.sitemap && config.sitemap.path) {
      return config.sitemap.path;
    }
    return (config.root + 'sitemap.xml');
  }
};

module.exports = common;
