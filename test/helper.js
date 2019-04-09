const stripIndent = function(str) {
  return str.replace(/^\s+/gm, '')
}

const removeEmptyLines = function(str) {
  var newStr = stripIndent(str)
  return newStr.replace(/(\r\n|\n|\r)/gm, '')
}

module.exports = {
  removeEmptyLines
}
