const _ = require('lodash'),
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs'))

// `updated` is missing when Hexo's updated_option is 'empty' (issue #41); fall back to `date`
const lastModified = function(item) {
  if (!item) {
    return undefined
  }
  return item.updated || item.date
}

const getPostUpdated = function(post) {
  return lastModified(post).toDate()
}

const common = {
  setItemLastUpdate: function(item) {
    const posts = item.posts.toArray()
    item.updated = _.maxBy(posts, getPostUpdated)
    item.updated = lastModified(item.updated).toDate()
    return item
  },
  getFileContent: function(filePath) {
    return fs.readFileAsync(filePath, { encoding: 'utf8' })
  },
  isDefined: _.negate(_.isUndefined),
  lastModified: lastModified,
  getIndexSitemapFilename: function(config) {
    if (config.sitemap && config.sitemap.path) {
      return config.sitemap.path
    }
    return config.root + 'sitemap.xml'
  }
}

module.exports = common
