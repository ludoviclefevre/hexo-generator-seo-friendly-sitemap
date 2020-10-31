const _ = require('lodash')
const urljoin = require('url-join')

const postInSitemap = function(post) {
  return post.sitemap !== false && post.published
}

const post = function(locals, config) {
  const get = function() {
    if (locals.posts.length === 0) {
      return
    }
    const posts = _(locals.posts.toArray())
      .filter(postInSitemap)
      .orderBy('updated', 'desc')
      .value()

    let sitemaps = []
    if (config.sitemap.urlLimit > 0) {
      const chunk = _.chunk(posts, config.sitemap.urlLimit)
      sitemaps = _.map(chunk, (chunkPosts, index) => {
        const lastUpdatedPost = _.chain(chunkPosts)
          .first()
          .get('updated')
          .value()
        return {
          template: 'post-sitemap.ejs',
          filename: `post-sitemap-${index + 1}.xml`,
          data: {
            items: chunkPosts,
            urljoin
          },
          lastModification: lastUpdatedPost,
          isInIndexSitemap: true
        }
      })
    } else {
      const lastUpdatedPost = _.chain(posts)
        .first()
        .get('updated')
        .value()
      sitemaps.push({
        template: 'post-sitemap.ejs',
        filename: 'post-sitemap.xml',
        data: {
          items: posts,
          urljoin
        },
        lastModification: lastUpdatedPost,
        isInIndexSitemap: true
      })
    }

    return sitemaps
  }

  return {
    get: get
  }
}

module.exports = post
