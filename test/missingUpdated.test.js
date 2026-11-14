/* eslint-env jest */
/* eslint-env jest */
const moment = require('moment')
const common = require('../lib/common')
const post = require('../lib/post')
const page = require('../lib/page')
const category = require('../lib/category')
const tag = require('../lib/tag')

// Posts with Hexo's updated_option: 'empty' have no `updated` field (issue #41)
const toArray = function(items) {
  return { length: items.length, toArray: () => items }
}

const config = { url: 'http://yoursite.com', sitemap: { urlLimit: 0 } }

describe('SEO-friendly sitemap generator: posts without updated (issue #41)', function() {
  it('lastModified falls back to date when updated is missing', function() {
    const date = moment.utc([2015, 0, 1, 8])

    expect(common.lastModified({ date: date })).toBe(date)
    expect(common.lastModified({ date: date, updated: undefined })).toBe(date)
  })

  it('lastModified prefers updated when present', function() {
    const date = moment.utc([2015, 0, 1, 8])
    const updated = moment.utc([2015, 0, 5, 8])

    expect(common.lastModified({ date: date, updated: updated })).toBe(updated)
  })

  it('lastModified returns undefined for no item', function() {
    expect(common.lastModified(undefined)).toBeUndefined()
  })

  it('post sitemap uses date as lastmod and sorts by it when updated is missing', function() {
    const older = { published: true, path: 'older', date: moment.utc([2015, 0, 1]), photos: [] }
    const newer = { published: true, path: 'newer', date: moment.utc([2015, 0, 9]), photos: [] }
    const locals = { posts: toArray([older, newer]) }

    const sitemaps = post(locals, config).get()

    expect(sitemaps).toHaveLength(1)
    expect(sitemaps[0].data.items.map(p => p.path)).toEqual(['newer', 'older'])
    expect(sitemaps[0].lastModification).toEqual(newer.date)
  })

  it('post sitemap keeps updated when it is present', function() {
    const updated = moment.utc([2015, 1, 1])
    const item = { published: true, path: 'a', date: moment.utc([2015, 0, 1]), updated: updated, photos: [] }
    const locals = { posts: toArray([item]) }

    expect(post(locals, config).get()[0].lastModification).toEqual(updated)
  })

  it('page sitemap uses date when updated is missing', function() {
    const date = moment.utc([2014, 11, 10])
    const locals = { pages: toArray([{ layout: 'page', path: 'about', date: date }]) }

    const sitemap = page(locals, config).get()

    expect(sitemap.lastModification).toEqual(date)
  })

  it('category sitemap uses the last post date when updated is missing', function() {
    const date = moment.utc([2015, 2, 3])
    const cat = {
      name: 'Cat1',
      posts: toArray([{ date: date }]),
      permalink: 'http://yoursite.com/categories/cat1/'
    }
    const locals = { categories: toArray([cat]) }

    const sitemap = category(locals, config).get()

    expect(sitemap.data.items[0].updated).toEqual(date.toDate())
    expect(sitemap.lastModification).toEqual(date.toDate())
  })

  it('tag sitemap uses the last post date when updated is missing', function() {
    const date = moment.utc([2015, 2, 4])
    const t = {
      name: 'Tag1',
      posts: toArray([{ date: date }]),
      permalink: 'http://yoursite.com/tags/tag1/'
    }
    const locals = { tags: toArray([t]) }

    const sitemap = tag(locals, config).get()

    expect(sitemap.data.items[0].updated).toEqual(date.toDate())
  })
})
