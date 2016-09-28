'use strict';

var stripIndent = function (str) {
  return str.replace(/^\s+/mg, '');
};

var removeEmptyLines = function (str) {
  var newStr = stripIndent(str);
  return newStr.replace(/(\r\n|\n|\r)/gm, '');
};

module.exports = {
  removeEmptyLines: removeEmptyLines
};
