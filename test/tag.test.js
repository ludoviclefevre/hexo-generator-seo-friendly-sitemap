const Hexo = require('hexo'),
  moment = require('moment'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  tag = require('../lib/tag')

const instanciateHexo = function(tag) {
  const hexo = new Hexo(__dirname, { silent: true })
  hexo.config.sitemap = {
    path: 'sitemap.xml'
  }
  if (tag !== undefined) {
    hexo.config.sitemap.tag = tag
  }
  hexo.config.permalink = ':title'
  hexo.init()
  return Promise.resolve(hexo)
}

const insertPosts = function(hexo) {
  const Post = hexo.model('Post')
  const mockedPosts = [
    { source: 'foo', slug: 'foo', path: 'foo', updated: moment.utc([2015, 0, 1, 8]).toDate() },
    { source: 'bar', slug: 'bar', path: 'bar', updated: moment.utc([2015, 0, 2, 14]).toDate() },
    { source: 'baz', slug: 'baz', path: 'baz', updated: moment.utc([2015, 0, 3, 16]).toDate() }
  ]
  return [hexo, Post.insert(mockedPosts)]
}

const setPostTag = function(hexo, posts) {
  const post = posts[1]
  return [hexo, post.setTags(['Tag1'])]
}

const getHexoLocalsAndConfig = function(hexo) {
  return Promise.resolve([hexo.locals.toObject(), hexo.config])
}

describe('SEO-friendly sitemap generator', function() {
  const applyTag = function(args) {
    return tag.apply(null, args)
  }

  it('should not generate sitemap tag file if no tags are mentioned in posts', function() {
    const checkAssertions = function(result) {
      expect(result).toBeUndefined()
    }

    return instanciateHexo()
      .then(getHexoLocalsAndConfig)
      .then(applyTag)
      .call('get')
      .then(checkAssertions)
  })

  it('should generate sitemap tag data', function() {
    const checkAssertions = function(result) {
      expect(typeof result).toBe('object')
      expect(moment(result.lastModification).isSame(moment.utc([2015, 0, 2, 14]))).toBeTruthy()
      expect(Array.isArray(result.data.items)).toBe(true)
      expect(result.data.items).toHaveLength(1)
      expect(_.some(result.data.items, { name: 'Tag1' })).toBeTruthy()
    }

    return instanciateHexo()
      .then(insertPosts)
      .spread(setPostTag)
      .spread(getHexoLocalsAndConfig)
      .then(applyTag)
      .call('get')
      .then(checkAssertions)
  })

  it('should not generate sitemap tag file if config.sitemap.tag set to false', function() {
    const checkAssertions = function(result) {
      expect(result).toBeUndefined()
    }

    return instanciateHexo(false)
      .then(insertPosts)
      .spread(setPostTag)
      .spread(getHexoLocalsAndConfig)
      .then(applyTag)
      .call('get')
      .then(checkAssertions)
  })
})
