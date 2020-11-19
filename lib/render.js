const path = require('path'),
  Promise = require('bluebird'),
  ejs = require('ejs'),
  beautify = require('pretty-data').pd,
  common = require('./common'),
  url = require('url')

const render = function(locals, config) {
  const viewPath = path.join(__dirname, '..', 'views')

  const getCompiledContent = function(info, templateFilePath, templateContent) {
    const compiledTemplate = ejs.compile(templateContent, {
        filename: templateFilePath
      }),
      xml = compiledTemplate({
        config: config,
        data: info.data,
        url: url
      })

    if (config.sitemap.beautify) {
      xml = beautify.xml(xml)
    }

    return {
      path: info.filename,
      data: xml
    }
  }

  const renderSitemaps = function(sitemap) {
    if (!sitemap.template) return
    const templateFilePath = path.join(viewPath, sitemap.template)
    return Promise.join(sitemap, templateFilePath, common.getFileContent(templateFilePath), getCompiledContent)
  }

  return renderSitemaps
}

module.exports = render
