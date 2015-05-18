var merge = require('utils-merge'),
    path = require('path'),

    config = hexo.config.sitemap = merge({
        path: 'sitemap.xml'
    }, hexo.config.sitemap);

if (!path.extname(config.path)) {
    config.path += '.xml';
}

hexo.extend.generator.register('sitemap', require('./lib/generator'));
