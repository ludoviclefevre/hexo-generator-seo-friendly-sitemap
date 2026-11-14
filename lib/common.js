const _ = require('lodash'),
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs'))

const getPostUpdated = function(post) {
  return post.updated.toDate()
}

const common = {
  setItemLastUpdate: function(item) {
    const posts = item.posts.toArray()
    item.updated = _.maxBy(posts, getPostUpdated).updated.toDate()
    return item
  },
  getFileContent: function(filePath) {
    return fs.readFileAsync(filePath, { encoding: 'utf8' })
  },
  isDefined: _.negate(_.isUndefined),
  // URLs in sitemaps are lowercased by default (issue #21); set sitemap.lowercase_urls: false to keep the original case
  lowerCaseLoc: function(loc, config) {
    if (config.sitemap && config.sitemap.lowercase_urls === false) {
      return loc
    }
    return loc.toLowerCase()
  },
  getIndexSitemapFilename: function(config) {
    if (config.sitemap && config.sitemap.path) {
      return config.sitemap.path
    }
    return config.root + 'sitemap.xml'
  }
}

module.exports = common
