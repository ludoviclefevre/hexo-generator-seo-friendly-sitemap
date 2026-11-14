/* eslint-env jest */
const common = require('../lib/common')

describe('SEO-friendly sitemap generator: lowercase URLs (issue #21)', function() {
  it('lowercases the URL by default', function() {
    expect(common.lowerCaseLoc('http://yoursite.com/Page-Title/', {})).toBe('http://yoursite.com/page-title/')
  })

  it('lowercases when the sitemap config has no lowercase_urls option', function() {
    expect(common.lowerCaseLoc('http://yoursite.com/Foo', { sitemap: { path: 'sitemap.xml' } })).toBe(
      'http://yoursite.com/foo'
    )
  })

  it('keeps the original case when lowercase_urls is false', function() {
    const config = { sitemap: { lowercase_urls: false } }

    expect(common.lowerCaseLoc('http://yoursite.com/Page-Title/', config)).toBe('http://yoursite.com/Page-Title/')
  })

  it('leaves already lowercase URLs unchanged', function() {
    expect(common.lowerCaseLoc('http://yoursite.com/foo/', {})).toBe('http://yoursite.com/foo/')
  })
})
