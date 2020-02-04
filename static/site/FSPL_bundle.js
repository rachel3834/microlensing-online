(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// Expose module API:

module.exports.polynomial = require('./polynomial.js')
module.exports.linear = require('./linear.js')
module.exports.linearRegression = require('./linearRegression.js')
module.exports.step = require('./step.js')

},{"./linear.js":3,"./linearRegression.js":4,"./polynomial.js":5,"./step.js":6}],2:[function(require,module,exports){
'use strict';

/**
 * Makes argument to be an array if it's not
 *
 * @param input
 * @returns {Array}
 */

module.exports.makeItArrayIfItsNot = function (input) {
  return Object.prototype.toString.call( input ) !== '[object Array]'
    ? [input]
    : input
}

/**
 *
 * Utilizes bisection method to search an interval to which
 * point belongs to, then returns an index of left border
 * of the interval
 *
 * @param {Number} point
 * @param {Array} intervals
 * @returns {Number}
 */

module.exports.findIntervalLeftBorderIndex = function (point, intervals) {
  //If point is beyond given intervals
  if (point < intervals[0])
    return 0
  if (point > intervals[intervals.length - 1])
    return intervals.length - 1
  //If point is inside interval
  //Start searching on a full range of intervals
  var indexOfNumberToCompare 
    , leftBorderIndex = 0
    , rightBorderIndex = intervals.length - 1
  //Reduce searching range till it find an interval point belongs to using binary search
  while (rightBorderIndex - leftBorderIndex !== 1) {
    indexOfNumberToCompare = leftBorderIndex + Math.floor((rightBorderIndex - leftBorderIndex)/2)
    point >= intervals[indexOfNumberToCompare]
      ? leftBorderIndex = indexOfNumberToCompare
      : rightBorderIndex = indexOfNumberToCompare
  }
  return leftBorderIndex
}
},{}],3:[function(require,module,exports){
'use strict';

var help = require('./help')

module.exports = evaluateLinear

/**
 * Evaluates interpolating line/lines at the set of numbers
 * or at a single number for the function y=f(x)
 *
 * @param {Number|Array} pointsToEvaluate     number or set of numbers
 *                                            for which polynomial is calculated
 * @param {Array} functionValuesX             set of distinct x values
 * @param {Array} functionValuesY             set of distinct y=f(x) values
 * @returns {Array}
 */

function evaluateLinear (pointsToEvaluate, functionValuesX, functionValuesY) {
  var results = []
  pointsToEvaluate = help.makeItArrayIfItsNot(pointsToEvaluate)
  pointsToEvaluate.forEach(function (point) {
    var index = help.findIntervalLeftBorderIndex(point, functionValuesX)
    if (index == functionValuesX.length - 1)
      index--
    results.push(linearInterpolation(point, functionValuesX[index], functionValuesY[index]
      , functionValuesX[index + 1], functionValuesY[index + 1]))
  })
  return results
}

/**
 *
 * Evaluates y-value at given x point for line that passes
 * through the points (x0,y0) and (y1,y1)
 *
 * @param x
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @returns {Number}
 */

function linearInterpolation (x, x0, y0, x1, y1) {
  var a = (y1 - y0) / (x1 - x0)
  var b = -a * x0 + y0
  return a * x + b
}

},{"./help":2}],4:[function(require,module,exports){
'use strict';

module.exports = linearRegression

var help = require('./help')

/**
 * Computes Linear Regression slope, intercept, r-squared and returns
 * a function which can be used for evaluating linear regression
 * at a particular x-value
 *
 * @param functionValuesX {Array}
 * @param functionValuesY {Array}
 * @returns {Object}
 */

function linearRegression(functionValuesX, functionValuesY){
  var regression = {}
    , x = functionValuesX
    , y = functionValuesY
    , n = y.length
    , sum_x = 0
    , sum_y = 0
    , sum_xy = 0
    , sum_xx = 0
    , sum_yy = 0

  for (var i = 0; i < y.length; i++) {
    sum_x += x[i]
    sum_y += y[i]
    sum_xy += (x[i]*y[i])
    sum_xx += (x[i]*x[i])
    sum_yy += (y[i]*y[i])
  }

  regression.slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x)
  regression.intercept = (sum_y - regression.slope * sum_x)/n
  regression.rSquared = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2)
  regression.evaluate = function (pointsToEvaluate) {
    var x = help.makeItArrayIfItsNot(pointsToEvaluate)
      , result = []
      , that = this
    x.forEach(function (point) {
      result.push(that.slope*point + that.intercept)
    })
    return result
  }

  return regression
}

},{"./help":2}],5:[function(require,module,exports){
'use strict';

var help = require('./help')

module.exports = evaluatePolynomial

/**
 * Evaluates interpolating polynomial at the set of numbers
 * or at a single number for the function y=f(x)
 *
 * @param {Number|Array} pointsToEvaluate     number or set of numbers
 *                                            for which polynomial is calculated
 * @param {Array} functionValuesX             set of distinct x values
 * @param {Array} functionValuesY             set of distinct y=f(x) values
 * @returns {Array}                           interpolating polynomial
 */

 function evaluatePolynomial (pointsToEvaluate, functionValuesX, functionValuesY) {
  var results = []
  pointsToEvaluate = help.makeItArrayIfItsNot(pointsToEvaluate)
  // evaluate the interpolating polynomial for each point
  pointsToEvaluate.forEach(function (point) {
    results.push(nevillesIteratedInterpolation(point, functionValuesX, functionValuesY))
  })
  return results
}

/**
 * Neville's Iterated Interpolation algorithm implementation
 * http://en.wikipedia.org/wiki/Neville's_algorithm <- for reference
 *
 * @param {Number} x                           number for which polynomial is calculated
 * @param {Array} X                            set of distinct x values
 * @param {Array} Y                            set of distinct y=f(x) values
 * @returns {number}                           interpolating polynomial
 */

function nevillesIteratedInterpolation (x, X, Y) {
  var Q = [Y]
  for (var i = 1; i < X.length; i++) {
    Q.push([])
    for (var j = 1; j <= i; j++) {
      Q[j][i] = ((x-X[i-j])*Q[j-1][i] - (x-X[i])*Q[j-1][i-1])/( X[i] - X[i-j] )
    }
  }
  return Q[j-1][i-1]
}

},{"./help":2}],6:[function(require,module,exports){
'use strict';

var help = require('./help')

module.exports = step

/**
 * Evaluates interpolating step function at the set of numbers
 * or at a single number
 *
 * @param {Number|Array} pointsToEvaluate     number or set of numbers
 *                                            for which step is calculated
 * @param {Array} functionValuesX             set of distinct x values
 * @param {Array} functionValuesY             set of distinct y=f(x) values
 * @returns {Array}
 */

function step (pointsToEvaluate, functionValuesX, functionValuesY) {
  return help.makeItArrayIfItsNot(pointsToEvaluate).map(function (point) {
    return functionValuesY[help.findIntervalLeftBorderIndex(point, functionValuesX)]
  })
}

},{"./help":2}],7:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '4.17.4';

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /** Error message constants. */
  var CORE_ERROR_TEXT = 'Unsupported core-js use. Try https://npms.io/search?q=ponyfill.',
      FUNC_ERROR_TEXT = 'Expected a function';

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used as the maximum memoize cache size. */
  var MAX_MEMOIZE_SIZE = 500;

  /** Used as the internal argument placeholder. */
  var PLACEHOLDER = '__lodash_placeholder__';

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG = 1,
      WRAP_BIND_KEY_FLAG = 2,
      WRAP_CURRY_BOUND_FLAG = 4,
      WRAP_CURRY_FLAG = 8,
      WRAP_CURRY_RIGHT_FLAG = 16,
      WRAP_PARTIAL_FLAG = 32,
      WRAP_PARTIAL_RIGHT_FLAG = 64,
      WRAP_ARY_FLAG = 128,
      WRAP_REARG_FLAG = 256,
      WRAP_FLIP_FLAG = 512;

  /** Used as default options for `_.truncate`. */
  var DEFAULT_TRUNC_LENGTH = 30,
      DEFAULT_TRUNC_OMISSION = '...';

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 800,
      HOT_SPAN = 16;

  /** Used to indicate the type of lazy iteratees. */
  var LAZY_FILTER_FLAG = 1,
      LAZY_MAP_FLAG = 2,
      LAZY_WHILE_FLAG = 3;

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991,
      MAX_INTEGER = 1.7976931348623157e+308,
      NAN = 0 / 0;

  /** Used as references for the maximum length and index of an array. */
  var MAX_ARRAY_LENGTH = 4294967295,
      MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
      HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

  /** Used to associate wrap methods with their bit flags. */
  var wrapFlags = [
    ['ary', WRAP_ARY_FLAG],
    ['bind', WRAP_BIND_FLAG],
    ['bindKey', WRAP_BIND_KEY_FLAG],
    ['curry', WRAP_CURRY_FLAG],
    ['curryRight', WRAP_CURRY_RIGHT_FLAG],
    ['flip', WRAP_FLIP_FLAG],
    ['partial', WRAP_PARTIAL_FLAG],
    ['partialRight', WRAP_PARTIAL_RIGHT_FLAG],
    ['rearg', WRAP_REARG_FLAG]
  ];

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      asyncTag = '[object AsyncFunction]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      domExcTag = '[object DOMException]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      nullTag = '[object Null]',
      objectTag = '[object Object]',
      promiseTag = '[object Promise]',
      proxyTag = '[object Proxy]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      undefinedTag = '[object Undefined]',
      weakMapTag = '[object WeakMap]',
      weakSetTag = '[object WeakSet]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to match empty string literals in compiled template source. */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match HTML entities and HTML characters. */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
      reUnescapedHtml = /[&<>"']/g,
      reHasEscapedHtml = RegExp(reEscapedHtml.source),
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to match template delimiters. */
  var reEscape = /<%-([\s\S]+?)%>/g,
      reEvaluate = /<%([\s\S]+?)%>/g,
      reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/,
      reLeadingDot = /^\./,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
      reHasRegExpChar = RegExp(reRegExpChar.source);

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g,
      reTrimStart = /^\s+/,
      reTrimEnd = /\s+$/;

  /** Used to match wrap detail comments. */
  var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
      reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
      reSplitDetails = /,? & /;

  /** Used to match words composed of alphanumeric characters. */
  var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /**
   * Used to match
   * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /** Used to match Latin Unicode letters (excluding mathematical operators). */
  var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

  /** Used to ensure capturing order of template delimiters. */
  var reNoMatch = /($^)/;

  /** Used to match unescaped characters in compiled string literals. */
  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

  /** Used to compose unicode character classes. */
  var rsAstralRange = '\\ud800-\\udfff',
      rsComboMarksRange = '\\u0300-\\u036f',
      reComboHalfMarksRange = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange = '\\u20d0-\\u20ff',
      rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
      rsDingbatRange = '\\u2700-\\u27bf',
      rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
      rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
      rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
      rsPunctuationRange = '\\u2000-\\u206f',
      rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
      rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
      rsVarRange = '\\ufe0e\\ufe0f',
      rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

  /** Used to compose unicode capture groups. */
  var rsApos = "['\u2019]",
      rsAstral = '[' + rsAstralRange + ']',
      rsBreak = '[' + rsBreakRange + ']',
      rsCombo = '[' + rsComboRange + ']',
      rsDigits = '\\d+',
      rsDingbat = '[' + rsDingbatRange + ']',
      rsLower = '[' + rsLowerRange + ']',
      rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
      rsFitz = '\\ud83c[\\udffb-\\udfff]',
      rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
      rsNonAstral = '[^' + rsAstralRange + ']',
      rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsUpper = '[' + rsUpperRange + ']',
      rsZWJ = '\\u200d';

  /** Used to compose unicode regexes. */
  var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
      rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
      rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
      rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
      reOptMod = rsModifier + '?',
      rsOptVar = '[' + rsVarRange + ']?',
      rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
      rsOrdLower = '\\d*(?:(?:1st|2nd|3rd|(?![123])\\dth)\\b)',
      rsOrdUpper = '\\d*(?:(?:1ST|2ND|3RD|(?![123])\\dTH)\\b)',
      rsSeq = rsOptVar + reOptMod + rsOptJoin,
      rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq,
      rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

  /** Used to match apostrophes. */
  var reApos = RegExp(rsApos, 'g');

  /**
   * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
   * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
   */
  var reComboMark = RegExp(rsCombo, 'g');

  /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
  var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

  /** Used to match complex or compound words. */
  var reUnicodeWord = RegExp([
    rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
    rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
    rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
    rsUpper + '+' + rsOptContrUpper,
    rsOrdUpper,
    rsOrdLower,
    rsDigits,
    rsEmoji
  ].join('|'), 'g');

  /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
  var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

  /** Used to detect strings that need a more robust regexp to match words. */
  var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

  /** Used to assign default `context` object properties. */
  var contextProps = [
    'Array', 'Buffer', 'DataView', 'Date', 'Error', 'Float32Array', 'Float64Array',
    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Math', 'Object',
    'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'TypeError', 'Uint8Array',
    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
    '_', 'clearTimeout', 'isFinite', 'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify. */
  var templateCounter = -1;

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
  cloneableTags[boolTag] = cloneableTags[dateTag] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[setTag] =
  cloneableTags[stringTag] = cloneableTags[symbolTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;

  /** Used to map Latin Unicode letters to basic Latin letters. */
  var deburredLetters = {
    // Latin-1 Supplement block.
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss',
    // Latin Extended-A block.
    '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
    '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
    '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
    '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
    '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
    '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
    '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
    '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
    '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
    '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
    '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
    '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
    '\u0134': 'J',  '\u0135': 'j',
    '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
    '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
    '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
    '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
    '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
    '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
    '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
    '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
    '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
    '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
    '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
    '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
    '\u0163': 't',  '\u0165': 't', '\u0167': 't',
    '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
    '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
    '\u0174': 'W',  '\u0175': 'w',
    '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
    '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
    '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
    '\u0132': 'IJ', '\u0133': 'ij',
    '\u0152': 'Oe', '\u0153': 'oe',
    '\u0149': "'n", '\u017f': 's'
  };

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  /** Used to map HTML entities to characters. */
  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };

  /** Used to escape characters for inclusion in compiled string literals. */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Built-in method references without a dependency on `root`. */
  var freeParseFloat = parseFloat,
      freeParseInt = parseInt;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  /* Node.js helper references. */
  var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer,
      nodeIsDate = nodeUtil && nodeUtil.isDate,
      nodeIsMap = nodeUtil && nodeUtil.isMap,
      nodeIsRegExp = nodeUtil && nodeUtil.isRegExp,
      nodeIsSet = nodeUtil && nodeUtil.isSet,
      nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

  /*--------------------------------------------------------------------------*/

  /**
   * Adds the key-value `pair` to `map`.
   *
   * @private
   * @param {Object} map The map to modify.
   * @param {Array} pair The key-value pair to add.
   * @returns {Object} Returns `map`.
   */
  function addMapEntry(map, pair) {
    // Don't return `map.set` because it's not chainable in IE 11.
    map.set(pair[0], pair[1]);
    return map;
  }

  /**
   * Adds `value` to `set`.
   *
   * @private
   * @param {Object} set The set to modify.
   * @param {*} value The value to add.
   * @returns {Object} Returns `set`.
   */
  function addSetEntry(set, value) {
    // Don't return `set.add` because it's not chainable in IE 11.
    set.add(value);
    return set;
  }

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /**
   * A specialized version of `baseAggregator` for arrays.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} setter The function to set `accumulator` values.
   * @param {Function} iteratee The iteratee to transform keys.
   * @param {Object} accumulator The initial aggregated object.
   * @returns {Function} Returns `accumulator`.
   */
  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      var value = array[index];
      setter(accumulator, value, iteratee(value), array);
    }
    return accumulator;
  }

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * A specialized version of `_.forEachRight` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEachRight(array, iteratee) {
    var length = array == null ? 0 : array.length;

    while (length--) {
      if (iteratee(array[length], length, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * A specialized version of `_.every` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`.
   */
  function arrayEvery(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (!predicate(array[index], index, array)) {
        return false;
      }
    }
    return true;
  }

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  /**
   * A specialized version of `_.includes` for arrays without support for
   * specifying an index to search from.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */
  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }

  /**
   * This function is like `arrayIncludes` except that it accepts a comparator.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @param {Function} comparator The comparator invoked per element.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */
  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /**
   * A specialized version of `_.reduce` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the first element of `array` as
   *  the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array == null ? 0 : array.length;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  /**
   * A specialized version of `_.reduceRight` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the last element of `array` as
   *  the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduceRight(array, iteratee, accumulator, initAccum) {
    var length = array == null ? 0 : array.length;
    if (initAccum && length) {
      accumulator = array[--length];
    }
    while (length--) {
      accumulator = iteratee(accumulator, array[length], length, array);
    }
    return accumulator;
  }

  /**
   * A specialized version of `_.some` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
  function arraySome(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the size of an ASCII `string`.
   *
   * @private
   * @param {string} string The string inspect.
   * @returns {number} Returns the string size.
   */
  var asciiSize = baseProperty('length');

  /**
   * Converts an ASCII `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function asciiToArray(string) {
    return string.split('');
  }

  /**
   * Splits an ASCII `string` into an array of its words.
   *
   * @private
   * @param {string} The string to inspect.
   * @returns {Array} Returns the words of `string`.
   */
  function asciiWords(string) {
    return string.match(reAsciiWord) || [];
  }

  /**
   * The base implementation of methods like `_.findKey` and `_.findLastKey`,
   * without support for iteratee shorthands, which iterates over `collection`
   * using `eachFunc`.
   *
   * @private
   * @param {Array|Object} collection The collection to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @returns {*} Returns the found element or its key, else `undefined`.
   */
  function baseFindKey(collection, predicate, eachFunc) {
    var result;
    eachFunc(collection, function(value, key, collection) {
      if (predicate(value, key, collection)) {
        result = key;
        return false;
      }
    });
    return result;
  }

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    return value === value
      ? strictIndexOf(array, value, fromIndex)
      : baseFindIndex(array, baseIsNaN, fromIndex);
  }

  /**
   * This function is like `baseIndexOf` except that it accepts a comparator.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @param {Function} comparator The comparator invoked per element.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOfWith(array, value, fromIndex, comparator) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (comparator(array[index], value)) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.isNaN` without support for number objects.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   */
  function baseIsNaN(value) {
    return value !== value;
  }

  /**
   * The base implementation of `_.mean` and `_.meanBy` without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {number} Returns the mean.
   */
  function baseMean(array, iteratee) {
    var length = array == null ? 0 : array.length;
    return length ? (baseSum(array, iteratee) / length) : NAN;
  }

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new accessor function.
   */
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * The base implementation of `_.propertyOf` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyOf(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * The base implementation of `_.reduce` and `_.reduceRight`, without support
   * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} accumulator The initial value.
   * @param {boolean} initAccum Specify using the first or last element of
   *  `collection` as the initial value.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @returns {*} Returns the accumulated value.
   */
  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function(value, index, collection) {
      accumulator = initAccum
        ? (initAccum = false, value)
        : iteratee(accumulator, value, index, collection);
    });
    return accumulator;
  }

  /**
   * The base implementation of `_.sortBy` which uses `comparer` to define the
   * sort order of `array` and replaces criteria objects with their corresponding
   * values.
   *
   * @private
   * @param {Array} array The array to sort.
   * @param {Function} comparer The function to define sort order.
   * @returns {Array} Returns `array`.
   */
  function baseSortBy(array, comparer) {
    var length = array.length;

    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }

  /**
   * The base implementation of `_.sum` and `_.sumBy` without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {number} Returns the sum.
   */
  function baseSum(array, iteratee) {
    var result,
        index = -1,
        length = array.length;

    while (++index < length) {
      var current = iteratee(array[index]);
      if (current !== undefined) {
        result = result === undefined ? current : (result + current);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
   * of key-value pairs for `object` corresponding to the property names of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the key-value pairs.
   */
  function baseToPairs(object, props) {
    return arrayMap(props, function(key) {
      return [key, object[key]];
    });
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
  function baseValues(object, props) {
    return arrayMap(props, function(key) {
      return object[key];
    });
  }

  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function cacheHas(cache, key) {
    return cache.has(key);
  }

  /**
   * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
   * that is not found in the character symbols.
   *
   * @private
   * @param {Array} strSymbols The string symbols to inspect.
   * @param {Array} chrSymbols The character symbols to find.
   * @returns {number} Returns the index of the first unmatched string symbol.
   */
  function charsStartIndex(strSymbols, chrSymbols) {
    var index = -1,
        length = strSymbols.length;

    while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
   * that is not found in the character symbols.
   *
   * @private
   * @param {Array} strSymbols The string symbols to inspect.
   * @param {Array} chrSymbols The character symbols to find.
   * @returns {number} Returns the index of the last unmatched string symbol.
   */
  function charsEndIndex(strSymbols, chrSymbols) {
    var index = strSymbols.length;

    while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
    return index;
  }

  /**
   * Gets the number of `placeholder` occurrences in `array`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} placeholder The placeholder to search for.
   * @returns {number} Returns the placeholder count.
   */
  function countHolders(array, placeholder) {
    var length = array.length,
        result = 0;

    while (length--) {
      if (array[length] === placeholder) {
        ++result;
      }
    }
    return result;
  }

  /**
   * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
   * letters to basic Latin letters.
   *
   * @private
   * @param {string} letter The matched letter to deburr.
   * @returns {string} Returns the deburred letter.
   */
  var deburrLetter = basePropertyOf(deburredLetters);

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  var escapeHtmlChar = basePropertyOf(htmlEscapes);

  /**
   * Used by `_.template` to escape characters for inclusion in compiled string literals.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(chr) {
    return '\\' + stringEscapes[chr];
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Checks if `string` contains Unicode symbols.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {boolean} Returns `true` if a symbol is found, else `false`.
   */
  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }

  /**
   * Checks if `string` contains a word composed of Unicode symbols.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {boolean} Returns `true` if a word is found, else `false`.
   */
  function hasUnicodeWord(string) {
    return reHasUnicodeWord.test(string);
  }

  /**
   * Converts `iterator` to an array.
   *
   * @private
   * @param {Object} iterator The iterator to convert.
   * @returns {Array} Returns the converted array.
   */
  function iteratorToArray(iterator) {
    var data,
        result = [];

    while (!(data = iterator.next()).done) {
      result.push(data.value);
    }
    return result;
  }

  /**
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
   */
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  /**
   * Replaces all `placeholder` elements in `array` with an internal placeholder
   * and returns an array of their indexes.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {*} placeholder The placeholder to replace.
   * @returns {Array} Returns the new array of placeholder indexes.
   */
  function replaceHolders(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (value === placeholder || value === PLACEHOLDER) {
        array[index] = PLACEHOLDER;
        result[resIndex++] = index;
      }
    }
    return result;
  }

  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  /**
   * Converts `set` to its value-value pairs.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the value-value pairs.
   */
  function setToPairs(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = [value, value];
    });
    return result;
  }

  /**
   * A specialized version of `_.indexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * A specialized version of `_.lastIndexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function strictLastIndexOf(array, value, fromIndex) {
    var index = fromIndex + 1;
    while (index--) {
      if (array[index] === value) {
        return index;
      }
    }
    return index;
  }

  /**
   * Gets the number of symbols in `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the string size.
   */
  function stringSize(string) {
    return hasUnicode(string)
      ? unicodeSize(string)
      : asciiSize(string);
  }

  /**
   * Converts `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function stringToArray(string) {
    return hasUnicode(string)
      ? unicodeToArray(string)
      : asciiToArray(string);
  }

  /**
   * Used by `_.unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {string} chr The matched character to unescape.
   * @returns {string} Returns the unescaped character.
   */
  var unescapeHtmlChar = basePropertyOf(htmlUnescapes);

  /**
   * Gets the size of a Unicode `string`.
   *
   * @private
   * @param {string} string The string inspect.
   * @returns {number} Returns the string size.
   */
  function unicodeSize(string) {
    var result = reUnicode.lastIndex = 0;
    while (reUnicode.test(string)) {
      ++result;
    }
    return result;
  }

  /**
   * Converts a Unicode `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function unicodeToArray(string) {
    return string.match(reUnicode) || [];
  }

  /**
   * Splits a Unicode `string` into an array of its words.
   *
   * @private
   * @param {string} The string to inspect.
   * @returns {Array} Returns the words of `string`.
   */
  function unicodeWords(string) {
    return string.match(reUnicodeWord) || [];
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new pristine `lodash` function using the `context` object.
   *
   * @static
   * @memberOf _
   * @since 1.1.0
   * @category Util
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns a new `lodash` function.
   * @example
   *
   * _.mixin({ 'foo': _.constant('foo') });
   *
   * var lodash = _.runInContext();
   * lodash.mixin({ 'bar': lodash.constant('bar') });
   *
   * _.isFunction(_.foo);
   * // => true
   * _.isFunction(_.bar);
   * // => false
   *
   * lodash.isFunction(lodash.foo);
   * // => false
   * lodash.isFunction(lodash.bar);
   * // => true
   *
   * // Create a suped-up `defer` in Node.js.
   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
   */
  var runInContext = (function runInContext(context) {
    context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));

    /** Built-in constructor references. */
    var Array = context.Array,
        Date = context.Date,
        Error = context.Error,
        Function = context.Function,
        Math = context.Math,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = context['__core-js_shared__'];

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to generate unique IDs. */
    var idCounter = 0;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString.call(Object);

    /** Used to restore the original `_` reference in `_.noConflict`. */
    var oldDash = root._;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Buffer = moduleExports ? context.Buffer : undefined,
        Symbol = context.Symbol,
        Uint8Array = context.Uint8Array,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
        getPrototype = overArg(Object.getPrototypeOf, Object),
        objectCreate = Object.create,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice,
        spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined,
        symIterator = Symbol ? Symbol.iterator : undefined,
        symToStringTag = Symbol ? Symbol.toStringTag : undefined;

    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    /** Mocked built-ins. */
    var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout,
        ctxNow = Date && Date.now !== root.Date.now && Date.now,
        ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeCeil = Math.ceil,
        nativeFloor = Math.floor,
        nativeGetSymbols = Object.getOwnPropertySymbols,
        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeIsFinite = context.isFinite,
        nativeJoin = arrayProto.join,
        nativeKeys = overArg(Object.keys, Object),
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeNow = Date.now,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random,
        nativeReverse = arrayProto.reverse;

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(context, 'DataView'),
        Map = getNative(context, 'Map'),
        Promise = getNative(context, 'Promise'),
        Set = getNative(context, 'Set'),
        WeakMap = getNative(context, 'WeakMap'),
        nativeCreate = getNative(Object, 'create');

    /** Used to store function metadata. */
    var metaMap = WeakMap && new WeakMap;

    /** Used to lookup unminified function names. */
    var realNames = {};

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol ? Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps `value` to enable implicit method
     * chain sequences. Methods that operate on and return arrays, collections,
     * and functions can be chained together. Methods that retrieve a single value
     * or may return a primitive value will automatically end the chain sequence
     * and return the unwrapped value. Otherwise, the value must be unwrapped
     * with `_#value`.
     *
     * Explicit chain sequences, which must be unwrapped with `_#value`, may be
     * enabled using `_.chain`.
     *
     * The execution of chained methods is lazy, that is, it's deferred until
     * `_#value` is implicitly or explicitly called.
     *
     * Lazy evaluation allows several methods to support shortcut fusion.
     * Shortcut fusion is an optimization to merge iteratee calls; this avoids
     * the creation of intermediate arrays and can greatly reduce the number of
     * iteratee executions. Sections of a chain sequence qualify for shortcut
     * fusion if the section is applied to an array and iteratees accept only
     * one argument. The heuristic for whether a section qualifies for shortcut
     * fusion is subject to change.
     *
     * Chaining is supported in custom builds as long as the `_#value` method is
     * directly or indirectly included in the build.
     *
     * In addition to lodash methods, wrappers have `Array` and `String` methods.
     *
     * The wrapper `Array` methods are:
     * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
     *
     * The wrapper `String` methods are:
     * `replace` and `split`
     *
     * The wrapper methods that support shortcut fusion are:
     * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
     * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
     * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
     *
     * The chainable wrapper methods are:
     * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
     * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
     * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
     * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
     * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
     * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
     * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
     * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
     * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
     * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
     * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
     * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
     * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
     * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
     * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
     * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
     * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
     * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
     * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
     * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
     * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
     * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
     * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
     * `zipObject`, `zipObjectDeep`, and `zipWith`
     *
     * The wrapper methods that are **not** chainable by default are:
     * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
     * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
     * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
     * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
     * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
     * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
     * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
     * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
     * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
     * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
     * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
     * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
     * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
     * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
     * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
     * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
     * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
     * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
     * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
     * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
     * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
     * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
     * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
     * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
     * `upperFirst`, `value`, and `words`
     *
     * @name _
     * @constructor
     * @category Seq
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // Returns an unwrapped value.
     * wrapped.reduce(_.add);
     * // => 6
     *
     * // Returns a wrapped value.
     * var squares = wrapped.map(square);
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
        if (value instanceof LodashWrapper) {
          return value;
        }
        if (hasOwnProperty.call(value, '__wrapped__')) {
          return wrapperClone(value);
        }
      }
      return new LodashWrapper(value);
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    /**
     * The function whose prototype chain sequence wrappers inherit from.
     *
     * @private
     */
    function baseLodash() {
      // No operation performed.
    }

    /**
     * The base constructor for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap.
     * @param {boolean} [chainAll] Enable explicit method chain sequences.
     */
    function LodashWrapper(value, chainAll) {
      this.__wrapped__ = value;
      this.__actions__ = [];
      this.__chain__ = !!chainAll;
      this.__index__ = 0;
      this.__values__ = undefined;
    }

    /**
     * By default, the template delimiters used by lodash are like those in
     * embedded Ruby (ERB) as well as ES2015 template strings. Change the
     * following template settings to use alternative delimiters.
     *
     * @static
     * @memberOf _
     * @type {Object}
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'escape': reEscape,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'evaluate': reEvaluate,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type {RegExp}
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type {string}
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type {Object}
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type {Function}
         */
        '_': lodash
      }
    };

    // Ensure wrappers are instances of `baseLodash`.
    lodash.prototype = baseLodash.prototype;
    lodash.prototype.constructor = lodash;

    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
    LodashWrapper.prototype.constructor = LodashWrapper;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
     *
     * @private
     * @constructor
     * @param {*} value The value to wrap.
     */
    function LazyWrapper(value) {
      this.__wrapped__ = value;
      this.__actions__ = [];
      this.__dir__ = 1;
      this.__filtered__ = false;
      this.__iteratees__ = [];
      this.__takeCount__ = MAX_ARRAY_LENGTH;
      this.__views__ = [];
    }

    /**
     * Creates a clone of the lazy wrapper object.
     *
     * @private
     * @name clone
     * @memberOf LazyWrapper
     * @returns {Object} Returns the cloned `LazyWrapper` object.
     */
    function lazyClone() {
      var result = new LazyWrapper(this.__wrapped__);
      result.__actions__ = copyArray(this.__actions__);
      result.__dir__ = this.__dir__;
      result.__filtered__ = this.__filtered__;
      result.__iteratees__ = copyArray(this.__iteratees__);
      result.__takeCount__ = this.__takeCount__;
      result.__views__ = copyArray(this.__views__);
      return result;
    }

    /**
     * Reverses the direction of lazy iteration.
     *
     * @private
     * @name reverse
     * @memberOf LazyWrapper
     * @returns {Object} Returns the new reversed `LazyWrapper` object.
     */
    function lazyReverse() {
      if (this.__filtered__) {
        var result = new LazyWrapper(this);
        result.__dir__ = -1;
        result.__filtered__ = true;
      } else {
        result = this.clone();
        result.__dir__ *= -1;
      }
      return result;
    }

    /**
     * Extracts the unwrapped value from its lazy wrapper.
     *
     * @private
     * @name value
     * @memberOf LazyWrapper
     * @returns {*} Returns the unwrapped value.
     */
    function lazyValue() {
      var array = this.__wrapped__.value(),
          dir = this.__dir__,
          isArr = isArray(array),
          isRight = dir < 0,
          arrLength = isArr ? array.length : 0,
          view = getView(0, arrLength, this.__views__),
          start = view.start,
          end = view.end,
          length = end - start,
          index = isRight ? end : (start - 1),
          iteratees = this.__iteratees__,
          iterLength = iteratees.length,
          resIndex = 0,
          takeCount = nativeMin(length, this.__takeCount__);

      if (!isArr || (!isRight && arrLength == length && takeCount == length)) {
        return baseWrapperValue(array, this.__actions__);
      }
      var result = [];

      outer:
      while (length-- && resIndex < takeCount) {
        index += dir;

        var iterIndex = -1,
            value = array[index];

        while (++iterIndex < iterLength) {
          var data = iteratees[iterIndex],
              iteratee = data.iteratee,
              type = data.type,
              computed = iteratee(value);

          if (type == LAZY_MAP_FLAG) {
            value = computed;
          } else if (!computed) {
            if (type == LAZY_FILTER_FLAG) {
              continue outer;
            } else {
              break outer;
            }
          }
        }
        result[resIndex++] = value;
      }
      return result;
    }

    // Ensure `LazyWrapper` is an instance of `baseLodash`.
    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
    LazyWrapper.prototype.constructor = LazyWrapper;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /*------------------------------------------------------------------------*/

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /*------------------------------------------------------------------------*/

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /*------------------------------------------------------------------------*/

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.sample` for arrays.
     *
     * @private
     * @param {Array} array The array to sample.
     * @returns {*} Returns the random element.
     */
    function arraySample(array) {
      var length = array.length;
      return length ? array[baseRandom(0, length - 1)] : undefined;
    }

    /**
     * A specialized version of `_.sampleSize` for arrays.
     *
     * @private
     * @param {Array} array The array to sample.
     * @param {number} n The number of elements to sample.
     * @returns {Array} Returns the random elements.
     */
    function arraySampleSize(array, n) {
      return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
    }

    /**
     * A specialized version of `_.shuffle` for arrays.
     *
     * @private
     * @param {Array} array The array to shuffle.
     * @returns {Array} Returns the new shuffled array.
     */
    function arrayShuffle(array) {
      return shuffleSelf(copyArray(array));
    }

    /**
     * This function is like `assignValue` except that it doesn't assign
     * `undefined` values.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignMergeValue(object, key, value) {
      if ((value !== undefined && !eq(object[key], value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Aggregates elements of `collection` on `accumulator` with keys transformed
     * by `iteratee` and values set by `setter`.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} setter The function to set `accumulator` values.
     * @param {Function} iteratee The iteratee to transform keys.
     * @param {Object} accumulator The initial aggregated object.
     * @returns {Function} Returns `accumulator`.
     */
    function baseAggregator(collection, setter, iteratee, accumulator) {
      baseEach(collection, function(value, key, collection) {
        setter(accumulator, value, iteratee(value), collection);
      });
      return accumulator;
    }

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }

    /**
     * The base implementation of `_.assignIn` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn(source), object);
    }

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    /**
     * The base implementation of `_.at` without support for individual paths.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {string[]} paths The property paths to pick.
     * @returns {Array} Returns the picked elements.
     */
    function baseAt(object, paths) {
      var index = -1,
          length = paths.length,
          result = Array(length),
          skip = object == null;

      while (++index < length) {
        result[index] = skip ? undefined : get(object, paths[index]);
      }
      return result;
    }

    /**
     * The base implementation of `_.clamp` which doesn't coerce arguments.
     *
     * @private
     * @param {number} number The number to clamp.
     * @param {number} [lower] The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the clamped number.
     */
    function baseClamp(number, lower, upper) {
      if (number === number) {
        if (upper !== undefined) {
          number = number <= upper ? number : upper;
        }
        if (lower !== undefined) {
          number = number >= lower ? number : lower;
        }
      }
      return number;
    }

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Deep clone
     *  2 - Flatten inherited properties
     *  4 - Clone symbols
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG;

      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value),
            isFunc = tag == funcTag || tag == genTag;

        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? copySymbolsIn(value, baseAssignIn(result, value))
              : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, baseClone, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      var keysFunc = isFull
        ? (isFlat ? getAllKeysIn : getAllKeys)
        : (isFlat ? keysIn : keys);

      var props = isArr ? undefined : keysFunc(value);
      arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }

    /**
     * The base implementation of `_.conforms` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property predicates to conform to.
     * @returns {Function} Returns the new spec function.
     */
    function baseConforms(source) {
      var props = keys(source);
      return function(object) {
        return baseConformsTo(object, source, props);
      };
    }

    /**
     * The base implementation of `_.conformsTo` which accepts `props` to check.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property predicates to conform to.
     * @returns {boolean} Returns `true` if `object` conforms, else `false`.
     */
    function baseConformsTo(object, source, props) {
      var length = props.length;
      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (length--) {
        var key = props[length],
            predicate = source[key],
            value = object[key];

        if ((value === undefined && !(key in object)) || !predicate(value)) {
          return false;
        }
      }
      return true;
    }

    /**
     * The base implementation of `_.delay` and `_.defer` which accepts `args`
     * to provide to `func`.
     *
     * @private
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {Array} args The arguments to provide to `func`.
     * @returns {number|Object} Returns the timer id or timeout object.
     */
    function baseDelay(func, wait, args) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * The base implementation of methods like `_.difference` without support
     * for excluding multiple arrays or iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Array} values The values to exclude.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     */
    function baseDifference(array, values, iteratee, comparator) {
      var index = -1,
          includes = arrayIncludes,
          isCommon = true,
          length = array.length,
          result = [],
          valuesLength = values.length;

      if (!length) {
        return result;
      }
      if (iteratee) {
        values = arrayMap(values, baseUnary(iteratee));
      }
      if (comparator) {
        includes = arrayIncludesWith;
        isCommon = false;
      }
      else if (values.length >= LARGE_ARRAY_SIZE) {
        includes = cacheHas;
        isCommon = false;
        values = new SetCache(values);
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee == null ? value : iteratee(value);

        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values[valuesIndex] === computed) {
              continue outer;
            }
          }
          result.push(value);
        }
        else if (!includes(values, computed, comparator)) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEach = createBaseEach(baseForOwn);

    /**
     * The base implementation of `_.forEachRight` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEachRight = createBaseEach(baseForOwnRight, true);

    /**
     * The base implementation of `_.every` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`
     */
    function baseEvery(collection, predicate) {
      var result = true;
      baseEach(collection, function(value, index, collection) {
        result = !!predicate(value, index, collection);
        return result;
      });
      return result;
    }

    /**
     * The base implementation of methods like `_.max` and `_.min` which accepts a
     * `comparator` to determine the extremum value.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The iteratee invoked per iteration.
     * @param {Function} comparator The comparator used to compare values.
     * @returns {*} Returns the extremum value.
     */
    function baseExtremum(array, iteratee, comparator) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        var value = array[index],
            current = iteratee(value);

        if (current != null && (computed === undefined
              ? (current === current && !isSymbol(current))
              : comparator(current, computed)
            )) {
          var computed = current,
              result = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.fill` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     */
    function baseFill(array, value, start, end) {
      var length = array.length;

      start = toInteger(start);
      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = (end === undefined || end > length) ? length : toInteger(end);
      if (end < 0) {
        end += length;
      }
      end = start > end ? 0 : toLength(end);
      while (start < end) {
        array[start++] = value;
      }
      return array;
    }

    /**
     * The base implementation of `_.filter` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function(value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.flatten` with support for restricting flattening.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {number} depth The maximum recursion depth.
     * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
     * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
     * @param {Array} [result=[]] The initial result value.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
          length = array.length;

      predicate || (predicate = isFlattenable);
      result || (result = []);

      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * This function is like `baseFor` except that it iterates over properties
     * in the opposite order.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseForRight = createBaseFor(true);

    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwnRight(object, iteratee) {
      return object && baseForRight(object, iteratee, keys);
    }

    /**
     * The base implementation of `_.functions` which creates an array of
     * `object` function property names filtered from `props`.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Array} props The property names to filter.
     * @returns {Array} Returns the function names.
     */
    function baseFunctions(object, props) {
      return arrayFilter(props, function(key) {
        return isFunction(object[key]);
      });
    }

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = castPath(path, object);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * The base implementation of `_.gt` which doesn't coerce arguments.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than `other`,
     *  else `false`.
     */
    function baseGt(value, other) {
      return value > other;
    }

    /**
     * The base implementation of `_.has` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHas(object, key) {
      return object != null && hasOwnProperty.call(object, key);
    }

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    /**
     * The base implementation of `_.inRange` which doesn't coerce arguments.
     *
     * @private
     * @param {number} number The number to check.
     * @param {number} start The start of the range.
     * @param {number} end The end of the range.
     * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
     */
    function baseInRange(number, start, end) {
      return number >= nativeMin(start, end) && number < nativeMax(start, end);
    }

    /**
     * The base implementation of methods like `_.intersection`, without support
     * for iteratee shorthands, that accepts an array of arrays to inspect.
     *
     * @private
     * @param {Array} arrays The arrays to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of shared values.
     */
    function baseIntersection(arrays, iteratee, comparator) {
      var includes = comparator ? arrayIncludesWith : arrayIncludes,
          length = arrays[0].length,
          othLength = arrays.length,
          othIndex = othLength,
          caches = Array(othLength),
          maxLength = Infinity,
          result = [];

      while (othIndex--) {
        var array = arrays[othIndex];
        if (othIndex && iteratee) {
          array = arrayMap(array, baseUnary(iteratee));
        }
        maxLength = nativeMin(array.length, maxLength);
        caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
          ? new SetCache(othIndex && array)
          : undefined;
      }
      array = arrays[0];

      var index = -1,
          seen = caches[0];

      outer:
      while (++index < length && result.length < maxLength) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        value = (comparator || value !== 0) ? value : 0;
        if (!(seen
              ? cacheHas(seen, computed)
              : includes(result, computed, comparator)
            )) {
          othIndex = othLength;
          while (--othIndex) {
            var cache = caches[othIndex];
            if (!(cache
                  ? cacheHas(cache, computed)
                  : includes(arrays[othIndex], computed, comparator))
                ) {
              continue outer;
            }
          }
          if (seen) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.invert` and `_.invertBy` which inverts
     * `object` with values transformed by `iteratee` and set by `setter`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} setter The function to set `accumulator` values.
     * @param {Function} iteratee The iteratee to transform values.
     * @param {Object} accumulator The initial inverted object.
     * @returns {Function} Returns `accumulator`.
     */
    function baseInverter(object, setter, iteratee, accumulator) {
      baseForOwn(object, function(value, key, object) {
        setter(accumulator, iteratee(value), key, object);
      });
      return accumulator;
    }

    /**
     * The base implementation of `_.invoke` without support for individual
     * method arguments.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the method to invoke.
     * @param {Array} args The arguments to invoke the method with.
     * @returns {*} Returns the result of the invoked method.
     */
    function baseInvoke(object, path, args) {
      path = castPath(path, object);
      object = parent(object, path);
      var func = object == null ? object : object[toKey(last(path))];
      return func == null ? undefined : apply(func, object, args);
    }

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }

    /**
     * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
     */
    function baseIsArrayBuffer(value) {
      return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
    }

    /**
     * The base implementation of `_.isDate` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
     */
    function baseIsDate(value) {
      return isObjectLike(value) && baseGetTag(value) == dateTag;
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag : getTag(object),
          othTag = othIsArr ? arrayTag : getTag(other);

      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;

      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag;
    }

    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.isRegExp` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
     */
    function baseIsRegExp(value) {
      return isObjectLike(value) && baseGetTag(value) == regexpTag;
    }

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag;
    }

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == 'object') {
        return isArray(value)
          ? baseMatchesProperty(value[0], value[1])
          : baseMatches(value);
      }
      return property(value);
    }

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.lt` which doesn't coerce arguments.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than `other`,
     *  else `false`.
     */
    function baseLt(value, other) {
      return value < other;
    }

    /**
     * The base implementation of `_.map` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike(collection) ? Array(collection.length) : [];

      baseEach(collection, function(value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }

    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn(object, path)
          : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
      };
    }

    /**
     * The base implementation of `_.merge` without support for multiple sources.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} [customizer] The function to customize merged values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        if (isObject(srcValue)) {
          stack || (stack = new Stack);
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        }
        else {
          var newValue = customizer
            ? customizer(object[key], srcValue, (key + ''), object, source, stack)
            : undefined;

          if (newValue === undefined) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }

    /**
     * A specialized version of `baseMerge` for arrays and objects which performs
     * deep merges and tracks traversed objects enabling objects with circular
     * references to be merged.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {string} key The key of the value to merge.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} mergeFunc The function to merge values.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = object[key],
          srcValue = source[key],
          stacked = stack.get(srcValue);

      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer
        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
        : undefined;

      var isCommon = newValue === undefined;

      if (isCommon) {
        var isArr = isArray(srcValue),
            isBuff = !isArr && isBuffer(srcValue),
            isTyped = !isArr && !isBuff && isTypedArray(srcValue);

        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          }
          else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          }
          else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          }
          else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          }
          else {
            newValue = [];
          }
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          }
          else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
            newValue = initCloneObject(srcValue);
          }
        }
        else {
          isCommon = false;
        }
      }
      if (isCommon) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack['delete'](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }

    /**
     * The base implementation of `_.nth` which doesn't coerce arguments.
     *
     * @private
     * @param {Array} array The array to query.
     * @param {number} n The index of the element to return.
     * @returns {*} Returns the nth element of `array`.
     */
    function baseNth(array, n) {
      var length = array.length;
      if (!length) {
        return;
      }
      n += n < 0 ? length : 0;
      return isIndex(n, length) ? array[n] : undefined;
    }

    /**
     * The base implementation of `_.orderBy` without param guards.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
     * @param {string[]} orders The sort orders of `iteratees`.
     * @returns {Array} Returns the new sorted array.
     */
    function baseOrderBy(collection, iteratees, orders) {
      var index = -1;
      iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(getIteratee()));

      var result = baseMap(collection, function(value, key, collection) {
        var criteria = arrayMap(iteratees, function(iteratee) {
          return iteratee(value);
        });
        return { 'criteria': criteria, 'index': ++index, 'value': value };
      });

      return baseSortBy(result, function(object, other) {
        return compareMultiple(object, other, orders);
      });
    }

    /**
     * The base implementation of `_.pick` without support for individual
     * property identifiers.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} paths The property paths to pick.
     * @returns {Object} Returns the new object.
     */
    function basePick(object, paths) {
      return basePickBy(object, paths, function(value, path) {
        return hasIn(object, path);
      });
    }

    /**
     * The base implementation of  `_.pickBy` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} paths The property paths to pick.
     * @param {Function} predicate The function invoked per property.
     * @returns {Object} Returns the new object.
     */
    function basePickBy(object, paths, predicate) {
      var index = -1,
          length = paths.length,
          result = {};

      while (++index < length) {
        var path = paths[index],
            value = baseGet(object, path);

        if (predicate(value, path)) {
          baseSet(result, castPath(path, object), value);
        }
      }
      return result;
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }

    /**
     * The base implementation of `_.pullAllBy` without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns `array`.
     */
    function basePullAll(array, values, iteratee, comparator) {
      var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
          index = -1,
          length = values.length,
          seen = array;

      if (array === values) {
        values = copyArray(values);
      }
      if (iteratee) {
        seen = arrayMap(array, baseUnary(iteratee));
      }
      while (++index < length) {
        var fromIndex = 0,
            value = values[index],
            computed = iteratee ? iteratee(value) : value;

        while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
          if (seen !== array) {
            splice.call(seen, fromIndex, 1);
          }
          splice.call(array, fromIndex, 1);
        }
      }
      return array;
    }

    /**
     * The base implementation of `_.pullAt` without support for individual
     * indexes or capturing the removed elements.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {number[]} indexes The indexes of elements to remove.
     * @returns {Array} Returns `array`.
     */
    function basePullAt(array, indexes) {
      var length = array ? indexes.length : 0,
          lastIndex = length - 1;

      while (length--) {
        var index = indexes[length];
        if (length == lastIndex || index !== previous) {
          var previous = index;
          if (isIndex(index)) {
            splice.call(array, index, 1);
          } else {
            baseUnset(array, index);
          }
        }
      }
      return array;
    }

    /**
     * The base implementation of `_.random` without support for returning
     * floating-point numbers.
     *
     * @private
     * @param {number} lower The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the random number.
     */
    function baseRandom(lower, upper) {
      return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
    }

    /**
     * The base implementation of `_.range` and `_.rangeRight` which doesn't
     * coerce arguments.
     *
     * @private
     * @param {number} start The start of the range.
     * @param {number} end The end of the range.
     * @param {number} step The value to increment or decrement by.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the range of numbers.
     */
    function baseRange(start, end, step, fromRight) {
      var index = -1,
          length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
          result = Array(length);

      while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step;
      }
      return result;
    }

    /**
     * The base implementation of `_.repeat` which doesn't coerce arguments.
     *
     * @private
     * @param {string} string The string to repeat.
     * @param {number} n The number of times to repeat the string.
     * @returns {string} Returns the repeated string.
     */
    function baseRepeat(string, n) {
      var result = '';
      if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
        return result;
      }
      // Leverage the exponentiation by squaring algorithm for a faster repeat.
      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
      do {
        if (n % 2) {
          result += string;
        }
        n = nativeFloor(n / 2);
        if (n) {
          string += string;
        }
      } while (n);

      return result;
    }

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '');
    }

    /**
     * The base implementation of `_.sample`.
     *
     * @private
     * @param {Array|Object} collection The collection to sample.
     * @returns {*} Returns the random element.
     */
    function baseSample(collection) {
      return arraySample(values(collection));
    }

    /**
     * The base implementation of `_.sampleSize` without param guards.
     *
     * @private
     * @param {Array|Object} collection The collection to sample.
     * @param {number} n The number of elements to sample.
     * @returns {Array} Returns the random elements.
     */
    function baseSampleSize(collection, n) {
      var array = values(collection);
      return shuffleSelf(array, baseClamp(n, 0, array.length));
    }

    /**
     * The base implementation of `_.set`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @param {Function} [customizer] The function to customize path creation.
     * @returns {Object} Returns `object`.
     */
    function baseSet(object, path, value, customizer) {
      if (!isObject(object)) {
        return object;
      }
      path = castPath(path, object);

      var index = -1,
          length = path.length,
          lastIndex = length - 1,
          nested = object;

      while (nested != null && ++index < length) {
        var key = toKey(path[index]),
            newValue = value;

        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : undefined;
          if (newValue === undefined) {
            newValue = isObject(objValue)
              ? objValue
              : (isIndex(path[index + 1]) ? [] : {});
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }

    /**
     * The base implementation of `setData` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to associate metadata with.
     * @param {*} data The metadata.
     * @returns {Function} Returns `func`.
     */
    var baseSetData = !metaMap ? identity : function(func, data) {
      metaMap.set(func, data);
      return func;
    };

    /**
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };

    /**
     * The base implementation of `_.shuffle`.
     *
     * @private
     * @param {Array|Object} collection The collection to shuffle.
     * @returns {Array} Returns the new shuffled array.
     */
    function baseShuffle(collection) {
      return shuffleSelf(values(collection));
    }

    /**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    /**
     * The base implementation of `_.some` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function baseSome(collection, predicate) {
      var result;

      baseEach(collection, function(value, index, collection) {
        result = predicate(value, index, collection);
        return !result;
      });
      return !!result;
    }

    /**
     * The base implementation of `_.sortedIndex` and `_.sortedLastIndex` which
     * performs a binary search of `array` to determine the index at which `value`
     * should be inserted into `array` in order to maintain its sort order.
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function baseSortedIndex(array, value, retHighest) {
      var low = 0,
          high = array == null ? low : array.length;

      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
        while (low < high) {
          var mid = (low + high) >>> 1,
              computed = array[mid];

          if (computed !== null && !isSymbol(computed) &&
              (retHighest ? (computed <= value) : (computed < value))) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return high;
      }
      return baseSortedIndexBy(array, value, identity, retHighest);
    }

    /**
     * The base implementation of `_.sortedIndexBy` and `_.sortedLastIndexBy`
     * which invokes `iteratee` for `value` and each element of `array` to compute
     * their sort ranking. The iteratee is invoked with one argument; (value).
     *
     * @private
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} iteratee The iteratee invoked per element.
     * @param {boolean} [retHighest] Specify returning the highest qualified index.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     */
    function baseSortedIndexBy(array, value, iteratee, retHighest) {
      value = iteratee(value);

      var low = 0,
          high = array == null ? 0 : array.length,
          valIsNaN = value !== value,
          valIsNull = value === null,
          valIsSymbol = isSymbol(value),
          valIsUndefined = value === undefined;

      while (low < high) {
        var mid = nativeFloor((low + high) / 2),
            computed = iteratee(array[mid]),
            othIsDefined = computed !== undefined,
            othIsNull = computed === null,
            othIsReflexive = computed === computed,
            othIsSymbol = isSymbol(computed);

        if (valIsNaN) {
          var setLow = retHighest || othIsReflexive;
        } else if (valIsUndefined) {
          setLow = othIsReflexive && (retHighest || othIsDefined);
        } else if (valIsNull) {
          setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
        } else if (valIsSymbol) {
          setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
        } else if (othIsNull || othIsSymbol) {
          setLow = false;
        } else {
          setLow = retHighest ? (computed <= value) : (computed < value);
        }
        if (setLow) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return nativeMin(high, MAX_ARRAY_INDEX);
    }

    /**
     * The base implementation of `_.sortedUniq` and `_.sortedUniqBy` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     */
    function baseSortedUniq(array, iteratee) {
      var index = -1,
          length = array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        if (!index || !eq(computed, seen)) {
          var seen = computed;
          result[resIndex++] = value === 0 ? 0 : value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.toNumber` which doesn't ensure correct
     * conversions of binary, hexadecimal, or octal string values.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     */
    function baseToNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      return +value;
    }

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isArray(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return arrayMap(value, baseToString) + '';
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * The base implementation of `_.uniqBy` without support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     */
    function baseUniq(array, iteratee, comparator) {
      var index = -1,
          includes = arrayIncludes,
          length = array.length,
          isCommon = true,
          result = [],
          seen = result;

      if (comparator) {
        isCommon = false;
        includes = arrayIncludesWith;
      }
      else if (length >= LARGE_ARRAY_SIZE) {
        var set = iteratee ? null : createSet(array);
        if (set) {
          return setToArray(set);
        }
        isCommon = false;
        includes = cacheHas;
        seen = new SetCache;
      }
      else {
        seen = iteratee ? [] : result;
      }
      outer:
      while (++index < length) {
        var value = array[index],
            computed = iteratee ? iteratee(value) : value;

        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        }
        else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.unset`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The property path to unset.
     * @returns {boolean} Returns `true` if the property is deleted, else `false`.
     */
    function baseUnset(object, path) {
      path = castPath(path, object);
      object = parent(object, path);
      return object == null || delete object[toKey(last(path))];
    }

    /**
     * The base implementation of `_.update`.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to update.
     * @param {Function} updater The function to produce the updated value.
     * @param {Function} [customizer] The function to customize path creation.
     * @returns {Object} Returns `object`.
     */
    function baseUpdate(object, path, updater, customizer) {
      return baseSet(object, path, updater(baseGet(object, path)), customizer);
    }

    /**
     * The base implementation of methods like `_.dropWhile` and `_.takeWhile`
     * without support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to query.
     * @param {Function} predicate The function invoked per iteration.
     * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseWhile(array, predicate, isDrop, fromRight) {
      var length = array.length,
          index = fromRight ? length : -1;

      while ((fromRight ? index-- : ++index < length) &&
        predicate(array[index], index, array)) {}

      return isDrop
        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
    }

    /**
     * The base implementation of `wrapperValue` which returns the result of
     * performing a sequence of actions on the unwrapped `value`, where each
     * successive action is supplied the return value of the previous.
     *
     * @private
     * @param {*} value The unwrapped value.
     * @param {Array} actions Actions to perform to resolve the unwrapped value.
     * @returns {*} Returns the resolved value.
     */
    function baseWrapperValue(value, actions) {
      var result = value;
      if (result instanceof LazyWrapper) {
        result = result.value();
      }
      return arrayReduce(actions, function(result, action) {
        return action.func.apply(action.thisArg, arrayPush([result], action.args));
      }, result);
    }

    /**
     * The base implementation of methods like `_.xor`, without support for
     * iteratee shorthands, that accepts an array of arrays to inspect.
     *
     * @private
     * @param {Array} arrays The arrays to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of values.
     */
    function baseXor(arrays, iteratee, comparator) {
      var length = arrays.length;
      if (length < 2) {
        return length ? baseUniq(arrays[0]) : [];
      }
      var index = -1,
          result = Array(length);

      while (++index < length) {
        var array = arrays[index],
            othIndex = -1;

        while (++othIndex < length) {
          if (othIndex != index) {
            result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator);
          }
        }
      }
      return baseUniq(baseFlatten(result, 1), iteratee, comparator);
    }

    /**
     * This base implementation of `_.zipObject` which assigns values using `assignFunc`.
     *
     * @private
     * @param {Array} props The property identifiers.
     * @param {Array} values The property values.
     * @param {Function} assignFunc The function to assign values.
     * @returns {Object} Returns the new object.
     */
    function baseZipObject(props, values, assignFunc) {
      var index = -1,
          length = props.length,
          valsLength = values.length,
          result = {};

      while (++index < length) {
        var value = index < valsLength ? values[index] : undefined;
        assignFunc(result, props[index], value);
      }
      return result;
    }

    /**
     * Casts `value` to an empty array if it's not an array like object.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Array|Object} Returns the cast array-like object.
     */
    function castArrayLikeObject(value) {
      return isArrayLikeObject(value) ? value : [];
    }

    /**
     * Casts `value` to `identity` if it's not a function.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Function} Returns cast function.
     */
    function castFunction(value) {
      return typeof value == 'function' ? value : identity;
    }

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString(value));
    }

    /**
     * A `baseRest` alias which can be replaced with `identity` by module
     * replacement plugins.
     *
     * @private
     * @type {Function}
     * @param {Function} func The function to apply a rest parameter to.
     * @returns {Function} Returns the new function.
     */
    var castRest = baseRest;

    /**
     * Casts `array` to a slice if it's needed.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {number} start The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the cast slice.
     */
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === undefined ? length : end;
      return (!start && end >= length) ? array : baseSlice(array, start, end);
    }

    /**
     * A simple wrapper around the global [`clearTimeout`](https://mdn.io/clearTimeout).
     *
     * @private
     * @param {number|Object} id The timer id or timeout object of the timer to clear.
     */
    var clearTimeout = ctxClearTimeout || function(id) {
      return root.clearTimeout(id);
    };

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    /**
     * Creates a clone of `map`.
     *
     * @private
     * @param {Object} map The map to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned map.
     */
    function cloneMap(map, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(mapToArray(map), CLONE_DEEP_FLAG) : mapToArray(map);
      return arrayReduce(array, addMapEntry, new map.constructor);
    }

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    /**
     * Creates a clone of `set`.
     *
     * @private
     * @param {Object} set The set to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned set.
     */
    function cloneSet(set, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(setToArray(set), CLONE_DEEP_FLAG) : setToArray(set);
      return arrayReduce(array, addSetEntry, new set.constructor);
    }

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /**
     * Compares values to sort them in ascending order.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {number} Returns the sort order indicator for `value`.
     */
    function compareAscending(value, other) {
      if (value !== other) {
        var valIsDefined = value !== undefined,
            valIsNull = value === null,
            valIsReflexive = value === value,
            valIsSymbol = isSymbol(value);

        var othIsDefined = other !== undefined,
            othIsNull = other === null,
            othIsReflexive = other === other,
            othIsSymbol = isSymbol(other);

        if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
            (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
            (valIsNull && othIsDefined && othIsReflexive) ||
            (!valIsDefined && othIsReflexive) ||
            !valIsReflexive) {
          return 1;
        }
        if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
            (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
            (othIsNull && valIsDefined && valIsReflexive) ||
            (!othIsDefined && valIsReflexive) ||
            !othIsReflexive) {
          return -1;
        }
      }
      return 0;
    }

    /**
     * Used by `_.orderBy` to compare multiple properties of a value to another
     * and stable sort them.
     *
     * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
     * specify an order of "desc" for descending or "asc" for ascending sort order
     * of corresponding values.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {boolean[]|string[]} orders The order to sort by for each property.
     * @returns {number} Returns the sort order indicator for `object`.
     */
    function compareMultiple(object, other, orders) {
      var index = -1,
          objCriteria = object.criteria,
          othCriteria = other.criteria,
          length = objCriteria.length,
          ordersLength = orders.length;

      while (++index < length) {
        var result = compareAscending(objCriteria[index], othCriteria[index]);
        if (result) {
          if (index >= ordersLength) {
            return result;
          }
          var order = orders[index];
          return result * (order == 'desc' ? -1 : 1);
        }
      }
      // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
      // that causes it, under certain circumstances, to provide the same value for
      // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
      // for more details.
      //
      // This also ensures a stable sort in V8 and other engines.
      // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
      return object.index - other.index;
    }

    /**
     * Creates an array that is the composition of partially applied arguments,
     * placeholders, and provided arguments into a single array of arguments.
     *
     * @private
     * @param {Array} args The provided arguments.
     * @param {Array} partials The arguments to prepend to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @params {boolean} [isCurried] Specify composing for a curried function.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgs(args, partials, holders, isCurried) {
      var argsIndex = -1,
          argsLength = args.length,
          holdersLength = holders.length,
          leftIndex = -1,
          leftLength = partials.length,
          rangeLength = nativeMax(argsLength - holdersLength, 0),
          result = Array(leftLength + rangeLength),
          isUncurried = !isCurried;

      while (++leftIndex < leftLength) {
        result[leftIndex] = partials[leftIndex];
      }
      while (++argsIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
          result[holders[argsIndex]] = args[argsIndex];
        }
      }
      while (rangeLength--) {
        result[leftIndex++] = args[argsIndex++];
      }
      return result;
    }

    /**
     * This function is like `composeArgs` except that the arguments composition
     * is tailored for `_.partialRight`.
     *
     * @private
     * @param {Array} args The provided arguments.
     * @param {Array} partials The arguments to append to those provided.
     * @param {Array} holders The `partials` placeholder indexes.
     * @params {boolean} [isCurried] Specify composing for a curried function.
     * @returns {Array} Returns the new array of composed arguments.
     */
    function composeArgsRight(args, partials, holders, isCurried) {
      var argsIndex = -1,
          argsLength = args.length,
          holdersIndex = -1,
          holdersLength = holders.length,
          rightIndex = -1,
          rightLength = partials.length,
          rangeLength = nativeMax(argsLength - holdersLength, 0),
          result = Array(rangeLength + rightLength),
          isUncurried = !isCurried;

      while (++argsIndex < rangeLength) {
        result[argsIndex] = args[argsIndex];
      }
      var offset = argsIndex;
      while (++rightIndex < rightLength) {
        result[offset + rightIndex] = partials[rightIndex];
      }
      while (++holdersIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
          result[offset + holders[holdersIndex]] = args[argsIndex++];
        }
      }
      return result;
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }

    /**
     * Copies own symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }

    /**
     * Copies own and inherited symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }

    /**
     * Creates a function like `_.groupBy`.
     *
     * @private
     * @param {Function} setter The function to set accumulator values.
     * @param {Function} [initializer] The accumulator object initializer.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter, initializer) {
      return function(collection, iteratee) {
        var func = isArray(collection) ? arrayAggregator : baseAggregator,
            accumulator = initializer ? initializer() : {};

        return func(collection, setter, getIteratee(iteratee, 2), accumulator);
      };
    }

    /**
     * Creates a function like `_.assign`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * Creates a function that wraps `func` to invoke it with the optional `this`
     * binding of `thisArg`.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createBind(func, bitmask, thisArg) {
      var isBind = bitmask & WRAP_BIND_FLAG,
          Ctor = createCtor(func);

      function wrapper() {
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(isBind ? thisArg : this, arguments);
      }
      return wrapper;
    }

    /**
     * Creates a function like `_.lowerFirst`.
     *
     * @private
     * @param {string} methodName The name of the `String` case method to use.
     * @returns {Function} Returns the new case function.
     */
    function createCaseFirst(methodName) {
      return function(string) {
        string = toString(string);

        var strSymbols = hasUnicode(string)
          ? stringToArray(string)
          : undefined;

        var chr = strSymbols
          ? strSymbols[0]
          : string.charAt(0);

        var trailing = strSymbols
          ? castSlice(strSymbols, 1).join('')
          : string.slice(1);

        return chr[methodName]() + trailing;
      };
    }

    /**
     * Creates a function like `_.camelCase`.
     *
     * @private
     * @param {Function} callback The function to combine each word.
     * @returns {Function} Returns the new compounder function.
     */
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
      };
    }

    /**
     * Creates a function that produces an instance of `Ctor` regardless of
     * whether it was invoked as part of a `new` expression or by `call` or `apply`.
     *
     * @private
     * @param {Function} Ctor The constructor to wrap.
     * @returns {Function} Returns the new wrapped function.
     */
    function createCtor(Ctor) {
      return function() {
        // Use a `switch` statement to work with class constructors. See
        // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
        // for more details.
        var args = arguments;
        switch (args.length) {
          case 0: return new Ctor;
          case 1: return new Ctor(args[0]);
          case 2: return new Ctor(args[0], args[1]);
          case 3: return new Ctor(args[0], args[1], args[2]);
          case 4: return new Ctor(args[0], args[1], args[2], args[3]);
          case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
          case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
          case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        }
        var thisBinding = baseCreate(Ctor.prototype),
            result = Ctor.apply(thisBinding, args);

        // Mimic the constructor's `return` behavior.
        // See https://es5.github.io/#x13.2.2 for more details.
        return isObject(result) ? result : thisBinding;
      };
    }

    /**
     * Creates a function that wraps `func` to enable currying.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {number} arity The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createCurry(func, bitmask, arity) {
      var Ctor = createCtor(func);

      function wrapper() {
        var length = arguments.length,
            args = Array(length),
            index = length,
            placeholder = getHolder(wrapper);

        while (index--) {
          args[index] = arguments[index];
        }
        var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
          ? []
          : replaceHolders(args, placeholder);

        length -= holders.length;
        if (length < arity) {
          return createRecurry(
            func, bitmask, createHybrid, wrapper.placeholder, undefined,
            args, holders, undefined, undefined, arity - length);
        }
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return apply(fn, this, args);
      }
      return wrapper;
    }

    /**
     * Creates a `_.find` or `_.findLast` function.
     *
     * @private
     * @param {Function} findIndexFunc The function to find the collection index.
     * @returns {Function} Returns the new find function.
     */
    function createFind(findIndexFunc) {
      return function(collection, predicate, fromIndex) {
        var iterable = Object(collection);
        if (!isArrayLike(collection)) {
          var iteratee = getIteratee(predicate, 3);
          collection = keys(collection);
          predicate = function(key) { return iteratee(iterable[key], key, iterable); };
        }
        var index = findIndexFunc(collection, predicate, fromIndex);
        return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
      };
    }

    /**
     * Creates a `_.flow` or `_.flowRight` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new flow function.
     */
    function createFlow(fromRight) {
      return flatRest(function(funcs) {
        var length = funcs.length,
            index = length,
            prereq = LodashWrapper.prototype.thru;

        if (fromRight) {
          funcs.reverse();
        }
        while (index--) {
          var func = funcs[index];
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
            var wrapper = new LodashWrapper([], true);
          }
        }
        index = wrapper ? index : length;
        while (++index < length) {
          func = funcs[index];

          var funcName = getFuncName(func),
              data = funcName == 'wrapper' ? getData(func) : undefined;

          if (data && isLaziable(data[0]) &&
                data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) &&
                !data[4].length && data[9] == 1
              ) {
            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
          } else {
            wrapper = (func.length == 1 && isLaziable(func))
              ? wrapper[funcName]()
              : wrapper.thru(func);
          }
        }
        return function() {
          var args = arguments,
              value = args[0];

          if (wrapper && args.length == 1 && isArray(value)) {
            return wrapper.plant(value).value();
          }
          var index = 0,
              result = length ? funcs[index].apply(this, args) : value;

          while (++index < length) {
            result = funcs[index].call(this, result);
          }
          return result;
        };
      });
    }

    /**
     * Creates a function that wraps `func` to invoke it with optional `this`
     * binding of `thisArg`, partial application, and currying.
     *
     * @private
     * @param {Function|string} func The function or method name to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to prepend to those provided to
     *  the new function.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [partialsRight] The arguments to append to those provided
     *  to the new function.
     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
      var isAry = bitmask & WRAP_ARY_FLAG,
          isBind = bitmask & WRAP_BIND_FLAG,
          isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
          isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
          isFlip = bitmask & WRAP_FLIP_FLAG,
          Ctor = isBindKey ? undefined : createCtor(func);

      function wrapper() {
        var length = arguments.length,
            args = Array(length),
            index = length;

        while (index--) {
          args[index] = arguments[index];
        }
        if (isCurried) {
          var placeholder = getHolder(wrapper),
              holdersCount = countHolders(args, placeholder);
        }
        if (partials) {
          args = composeArgs(args, partials, holders, isCurried);
        }
        if (partialsRight) {
          args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
        }
        length -= holdersCount;
        if (isCurried && length < arity) {
          var newHolders = replaceHolders(args, placeholder);
          return createRecurry(
            func, bitmask, createHybrid, wrapper.placeholder, thisArg,
            args, newHolders, argPos, ary, arity - length
          );
        }
        var thisBinding = isBind ? thisArg : this,
            fn = isBindKey ? thisBinding[func] : func;

        length = args.length;
        if (argPos) {
          args = reorder(args, argPos);
        } else if (isFlip && length > 1) {
          args.reverse();
        }
        if (isAry && ary < length) {
          args.length = ary;
        }
        if (this && this !== root && this instanceof wrapper) {
          fn = Ctor || createCtor(fn);
        }
        return fn.apply(thisBinding, args);
      }
      return wrapper;
    }

    /**
     * Creates a function like `_.invertBy`.
     *
     * @private
     * @param {Function} setter The function to set accumulator values.
     * @param {Function} toIteratee The function to resolve iteratees.
     * @returns {Function} Returns the new inverter function.
     */
    function createInverter(setter, toIteratee) {
      return function(object, iteratee) {
        return baseInverter(object, setter, toIteratee(iteratee), {});
      };
    }

    /**
     * Creates a function that performs a mathematical operation on two values.
     *
     * @private
     * @param {Function} operator The function to perform the operation.
     * @param {number} [defaultValue] The value used for `undefined` arguments.
     * @returns {Function} Returns the new mathematical operation function.
     */
    function createMathOperation(operator, defaultValue) {
      return function(value, other) {
        var result;
        if (value === undefined && other === undefined) {
          return defaultValue;
        }
        if (value !== undefined) {
          result = value;
        }
        if (other !== undefined) {
          if (result === undefined) {
            return other;
          }
          if (typeof value == 'string' || typeof other == 'string') {
            value = baseToString(value);
            other = baseToString(other);
          } else {
            value = baseToNumber(value);
            other = baseToNumber(other);
          }
          result = operator(value, other);
        }
        return result;
      };
    }

    /**
     * Creates a function like `_.over`.
     *
     * @private
     * @param {Function} arrayFunc The function to iterate over iteratees.
     * @returns {Function} Returns the new over function.
     */
    function createOver(arrayFunc) {
      return flatRest(function(iteratees) {
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        return baseRest(function(args) {
          var thisArg = this;
          return arrayFunc(iteratees, function(iteratee) {
            return apply(iteratee, thisArg, args);
          });
        });
      });
    }

    /**
     * Creates the padding for `string` based on `length`. The `chars` string
     * is truncated if the number of characters exceeds `length`.
     *
     * @private
     * @param {number} length The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padding for `string`.
     */
    function createPadding(length, chars) {
      chars = chars === undefined ? ' ' : baseToString(chars);

      var charsLength = chars.length;
      if (charsLength < 2) {
        return charsLength ? baseRepeat(chars, length) : chars;
      }
      var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
      return hasUnicode(chars)
        ? castSlice(stringToArray(result), 0, length).join('')
        : result.slice(0, length);
    }

    /**
     * Creates a function that wraps `func` to invoke it with the `this` binding
     * of `thisArg` and `partials` prepended to the arguments it receives.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} partials The arguments to prepend to those provided to
     *  the new function.
     * @returns {Function} Returns the new wrapped function.
     */
    function createPartial(func, bitmask, thisArg, partials) {
      var isBind = bitmask & WRAP_BIND_FLAG,
          Ctor = createCtor(func);

      function wrapper() {
        var argsIndex = -1,
            argsLength = arguments.length,
            leftIndex = -1,
            leftLength = partials.length,
            args = Array(leftLength + argsLength),
            fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

        while (++leftIndex < leftLength) {
          args[leftIndex] = partials[leftIndex];
        }
        while (argsLength--) {
          args[leftIndex++] = arguments[++argsIndex];
        }
        return apply(fn, isBind ? thisArg : this, args);
      }
      return wrapper;
    }

    /**
     * Creates a `_.range` or `_.rangeRight` function.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new range function.
     */
    function createRange(fromRight) {
      return function(start, end, step) {
        if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
          end = step = undefined;
        }
        // Ensure the sign of `-0` is preserved.
        start = toFinite(start);
        if (end === undefined) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
        return baseRange(start, end, step, fromRight);
      };
    }

    /**
     * Creates a function that performs a relational operation on two values.
     *
     * @private
     * @param {Function} operator The function to perform the operation.
     * @returns {Function} Returns the new relational operation function.
     */
    function createRelationalOperation(operator) {
      return function(value, other) {
        if (!(typeof value == 'string' && typeof other == 'string')) {
          value = toNumber(value);
          other = toNumber(other);
        }
        return operator(value, other);
      };
    }

    /**
     * Creates a function that wraps `func` to continue currying.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @param {Function} wrapFunc The function to create the `func` wrapper.
     * @param {*} placeholder The placeholder value.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to prepend to those provided to
     *  the new function.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
      var isCurry = bitmask & WRAP_CURRY_FLAG,
          newHolders = isCurry ? holders : undefined,
          newHoldersRight = isCurry ? undefined : holders,
          newPartials = isCurry ? partials : undefined,
          newPartialsRight = isCurry ? undefined : partials;

      bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
      bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);

      if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
        bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
      }
      var newData = [
        func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
        newHoldersRight, argPos, ary, arity
      ];

      var result = wrapFunc.apply(undefined, newData);
      if (isLaziable(func)) {
        setData(result, newData);
      }
      result.placeholder = placeholder;
      return setWrapToString(result, func, bitmask);
    }

    /**
     * Creates a function like `_.round`.
     *
     * @private
     * @param {string} methodName The name of the `Math` method to use when rounding.
     * @returns {Function} Returns the new round function.
     */
    function createRound(methodName) {
      var func = Math[methodName];
      return function(number, precision) {
        number = toNumber(number);
        precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
        if (precision) {
          // Shift with exponential notation to avoid floating-point issues.
          // See [MDN](https://mdn.io/round#Examples) for more details.
          var pair = (toString(number) + 'e').split('e'),
              value = func(pair[0] + 'e' + (+pair[1] + precision));

          pair = (toString(value) + 'e').split('e');
          return +(pair[0] + 'e' + (+pair[1] - precision));
        }
        return func(number);
      };
    }

    /**
     * Creates a set object of `values`.
     *
     * @private
     * @param {Array} values The values to add to the set.
     * @returns {Object} Returns the new set.
     */
    var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
      return new Set(values);
    };

    /**
     * Creates a `_.toPairs` or `_.toPairsIn` function.
     *
     * @private
     * @param {Function} keysFunc The function to get the keys of a given object.
     * @returns {Function} Returns the new pairs function.
     */
    function createToPairs(keysFunc) {
      return function(object) {
        var tag = getTag(object);
        if (tag == mapTag) {
          return mapToArray(object);
        }
        if (tag == setTag) {
          return setToPairs(object);
        }
        return baseToPairs(object, keysFunc(object));
      };
    }

    /**
     * Creates a function that either curries or invokes `func` with optional
     * `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to wrap.
     * @param {number} bitmask The bitmask flags.
     *    1 - `_.bind`
     *    2 - `_.bindKey`
     *    4 - `_.curry` or `_.curryRight` of a bound function
     *    8 - `_.curry`
     *   16 - `_.curryRight`
     *   32 - `_.partial`
     *   64 - `_.partialRight`
     *  128 - `_.rearg`
     *  256 - `_.ary`
     *  512 - `_.flip`
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {Array} [partials] The arguments to be partially applied.
     * @param {Array} [holders] The `partials` placeholder indexes.
     * @param {Array} [argPos] The argument positions of the new function.
     * @param {number} [ary] The arity cap of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new wrapped function.
     */
    function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
      var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
      if (!isBindKey && typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var length = partials ? partials.length : 0;
      if (!length) {
        bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
        partials = holders = undefined;
      }
      ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
      arity = arity === undefined ? arity : toInteger(arity);
      length -= holders ? holders.length : 0;

      if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
        var partialsRight = partials,
            holdersRight = holders;

        partials = holders = undefined;
      }
      var data = isBindKey ? undefined : getData(func);

      var newData = [
        func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
        argPos, ary, arity
      ];

      if (data) {
        mergeData(newData, data);
      }
      func = newData[0];
      bitmask = newData[1];
      thisArg = newData[2];
      partials = newData[3];
      holders = newData[4];
      arity = newData[9] = newData[9] === undefined
        ? (isBindKey ? 0 : func.length)
        : nativeMax(newData[9] - length, 0);

      if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
        bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
      }
      if (!bitmask || bitmask == WRAP_BIND_FLAG) {
        var result = createBind(func, bitmask, thisArg);
      } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
        result = createCurry(func, bitmask, arity);
      } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
        result = createPartial(func, bitmask, thisArg, partials);
      } else {
        result = createHybrid.apply(undefined, newData);
      }
      var setter = data ? baseSetData : setData;
      return setWrapToString(setter(result, newData), func, bitmask);
    }

    /**
     * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
     * of source objects to the destination object for all destination properties
     * that resolve to `undefined`.
     *
     * @private
     * @param {*} objValue The destination value.
     * @param {*} srcValue The source value.
     * @param {string} key The key of the property to assign.
     * @param {Object} object The parent object of `objValue`.
     * @returns {*} Returns the value to assign.
     */
    function customDefaultsAssignIn(objValue, srcValue, key, object) {
      if (objValue === undefined ||
          (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        return srcValue;
      }
      return objValue;
    }

    /**
     * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
     * objects into destination objects that are passed thru.
     *
     * @private
     * @param {*} objValue The destination value.
     * @param {*} srcValue The source value.
     * @param {string} key The key of the property to merge.
     * @param {Object} object The parent object of `objValue`.
     * @param {Object} source The parent object of `srcValue`.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     * @returns {*} Returns the value to assign.
     */
    function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
      if (isObject(objValue) && isObject(srcValue)) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        stack.set(srcValue, objValue);
        baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
        stack['delete'](srcValue);
      }
      return objValue;
    }

    /**
     * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
     * objects.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {string} key The key of the property to inspect.
     * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
     */
    function customOmitClone(value) {
      return isPlainObject(value) ? undefined : value;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
        case numberTag:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    /**
     * A specialized version of `baseRest` which flattens the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @returns {Function} Returns the new function.
     */
    function flatRest(func) {
      return setToString(overRest(func, undefined, flatten), func + '');
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
    }

    /**
     * Gets metadata for `func`.
     *
     * @private
     * @param {Function} func The function to query.
     * @returns {*} Returns the metadata for `func`.
     */
    var getData = !metaMap ? noop : function(func) {
      return metaMap.get(func);
    };

    /**
     * Gets the name of `func`.
     *
     * @private
     * @param {Function} func The function to query.
     * @returns {string} Returns the function name.
     */
    function getFuncName(func) {
      var result = (func.name + ''),
          array = realNames[result],
          length = hasOwnProperty.call(realNames, result) ? array.length : 0;

      while (length--) {
        var data = array[length],
            otherFunc = data.func;
        if (otherFunc == null || otherFunc == func) {
          return data.name;
        }
      }
      return result;
    }

    /**
     * Gets the argument placeholder value for `func`.
     *
     * @private
     * @param {Function} func The function to inspect.
     * @returns {*} Returns the placeholder value.
     */
    function getHolder(func) {
      var object = hasOwnProperty.call(lodash, 'placeholder') ? lodash : func;
      return object.placeholder;
    }

    /**
     * Gets the appropriate "iteratee" function. If `_.iteratee` is customized,
     * this function returns the custom method, otherwise it returns `baseIteratee`.
     * If arguments are provided, the chosen function is invoked with them and
     * its result is returned.
     *
     * @private
     * @param {*} [value] The value to convert to an iteratee.
     * @param {number} [arity] The arity of the created iteratee.
     * @returns {Function} Returns the chosen function or its result.
     */
    function getIteratee() {
      var result = lodash.iteratee || iteratee;
      result = result === iteratee ? baseIteratee : result;
      return arguments.length ? result(arguments[0], arguments[1]) : result;
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };

    /**
     * Creates an array of the own and inherited enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (Map && getTag(new Map) != mapTag) ||
        (Promise && getTag(Promise.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    /**
     * Gets the view, applying any `transforms` to the `start` and `end` positions.
     *
     * @private
     * @param {number} start The start of the view.
     * @param {number} end The end of the view.
     * @param {Array} transforms The transformations to apply to the view.
     * @returns {Object} Returns an object containing the `start` and `end`
     *  positions of the view.
     */
    function getView(start, end, transforms) {
      var index = -1,
          length = transforms.length;

      while (++index < length) {
        var data = transforms[index],
            size = data.size;

        switch (data.type) {
          case 'drop':      start += size; break;
          case 'dropRight': end -= size; break;
          case 'take':      end = nativeMin(end, start + size); break;
          case 'takeRight': start = nativeMax(start, end - size); break;
        }
      }
      return { 'start': start, 'end': end };
    }

    /**
     * Extracts wrapper details from the `source` body comment.
     *
     * @private
     * @param {string} source The source to inspect.
     * @returns {Array} Returns the wrapper details.
     */
    function getWrapDetails(source) {
      var match = source.match(reWrapDetails);
      return match ? match[1].split(reSplitDetails) : [];
    }

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = castPath(path, object);

      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result || ++index != length) {
        return result;
      }
      length = object == null ? 0 : object.length;
      return !!length && isLength(length) && isIndex(key, length) &&
        (isArray(object) || isArguments(object));
    }

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, cloneFunc, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);

        case boolTag:
        case dateTag:
          return new Ctor(+object);

        case dataViewTag:
          return cloneDataView(object, isDeep);

        case float32Tag: case float64Tag:
        case int8Tag: case int16Tag: case int32Tag:
        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
          return cloneTypedArray(object, isDeep);

        case mapTag:
          return cloneMap(object, isDeep, cloneFunc);

        case numberTag:
        case stringTag:
          return new Ctor(object);

        case regexpTag:
          return cloneRegExp(object);

        case setTag:
          return cloneSet(object, isDeep, cloneFunc);

        case symbolTag:
          return cloneSymbol(object);
      }
    }

    /**
     * Inserts wrapper `details` in a comment at the top of the `source` body.
     *
     * @private
     * @param {string} source The source to modify.
     * @returns {Array} details The details to insert.
     * @returns {string} Returns the modified source.
     */
    function insertWrapDetails(source, details) {
      var length = details.length;
      if (!length) {
        return source;
      }
      var lastIndex = length - 1;
      details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
      details = details.join(length > 2 ? ', ' : ' ');
      return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
    }

    /**
     * Checks if `value` is a flattenable `arguments` object or array.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
     */
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) ||
        !!(spreadableSymbol && value && value[spreadableSymbol]);
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq(object[index], value);
      }
      return false;
    }

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has a lazy counterpart.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
     *  else `false`.
     */
    function isLaziable(func) {
      var funcName = getFuncName(func),
          other = lodash[funcName];

      if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
        return false;
      }
      if (func === other) {
        return true;
      }
      var data = getData(other);
      return !!data && func === data[0];
    }

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Checks if `func` is capable of being masked.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
     */
    var isMaskable = coreJsData ? isFunction : stubFalse;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

      return value === proto;
    }

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });

      var cache = result.cache;
      return result;
    }

    /**
     * Merges the function metadata of `source` into `data`.
     *
     * Merging metadata reduces the number of wrappers used to invoke a function.
     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
     * may be applied regardless of execution order. Methods like `_.ary` and
     * `_.rearg` modify function arguments, making the order in which they are
     * executed important, preventing the merging of metadata. However, we make
     * an exception for a safe combined case where curried functions have `_.ary`
     * and or `_.rearg` applied.
     *
     * @private
     * @param {Array} data The destination metadata.
     * @param {Array} source The source metadata.
     * @returns {Array} Returns `data`.
     */
    function mergeData(data, source) {
      var bitmask = data[1],
          srcBitmask = source[1],
          newBitmask = bitmask | srcBitmask,
          isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);

      var isCombo =
        ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) ||
        ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) ||
        ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));

      // Exit early if metadata can't be merged.
      if (!(isCommon || isCombo)) {
        return data;
      }
      // Use source `thisArg` if available.
      if (srcBitmask & WRAP_BIND_FLAG) {
        data[2] = source[2];
        // Set when currying a bound function.
        newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
      }
      // Compose partial arguments.
      var value = source[3];
      if (value) {
        var partials = data[3];
        data[3] = partials ? composeArgs(partials, value, source[4]) : value;
        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
      }
      // Compose partial right arguments.
      value = source[5];
      if (value) {
        partials = data[5];
        data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
      }
      // Use source `argPos` if available.
      value = source[7];
      if (value) {
        data[7] = value;
      }
      // Use source `ary` if it's smaller.
      if (srcBitmask & WRAP_ARY_FLAG) {
        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
      }
      // Use source `arity` if one is not provided.
      if (data[9] == null) {
        data[9] = source[9];
      }
      // Use source `func` and merge bitmasks.
      data[0] = source[0];
      data[1] = newBitmask;

      return data;
    }

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Gets the parent value at `path` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} path The path to get the parent value of.
     * @returns {*} Returns the parent value.
     */
    function parent(object, path) {
      return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
    }

    /**
     * Reorder `array` according to the specified indexes where the element at
     * the first index is assigned as the first element, the element at
     * the second index is assigned as the second element, and so on.
     *
     * @private
     * @param {Array} array The array to reorder.
     * @param {Array} indexes The arranged array indexes.
     * @returns {Array} Returns `array`.
     */
    function reorder(array, indexes) {
      var arrLength = array.length,
          length = nativeMin(indexes.length, arrLength),
          oldArray = copyArray(array);

      while (length--) {
        var index = indexes[length];
        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
      }
      return array;
    }

    /**
     * Sets metadata for `func`.
     *
     * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
     * period of time, it will trip its breaker and transition to an identity
     * function to avoid garbage collection pauses in V8. See
     * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
     * for more details.
     *
     * @private
     * @param {Function} func The function to associate metadata with.
     * @param {*} data The metadata.
     * @returns {Function} Returns `func`.
     */
    var setData = shortOut(baseSetData);

    /**
     * A simple wrapper around the global [`setTimeout`](https://mdn.io/setTimeout).
     *
     * @private
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @returns {number|Object} Returns the timer id or timeout object.
     */
    var setTimeout = ctxSetTimeout || function(func, wait) {
      return root.setTimeout(func, wait);
    };

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = shortOut(baseSetToString);

    /**
     * Sets the `toString` method of `wrapper` to mimic the source of `reference`
     * with wrapper details in a comment at the top of the source body.
     *
     * @private
     * @param {Function} wrapper The function to modify.
     * @param {Function} reference The reference function.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @returns {Function} Returns `wrapper`.
     */
    function setWrapToString(wrapper, reference, bitmask) {
      var source = (reference + '');
      return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
    }

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    /**
     * A specialized version of `_.shuffle` which mutates and sets the size of `array`.
     *
     * @private
     * @param {Array} array The array to shuffle.
     * @param {number} [size=array.length] The size of `array`.
     * @returns {Array} Returns `array`.
     */
    function shuffleSelf(array, size) {
      var index = -1,
          length = array.length,
          lastIndex = length - 1;

      size = size === undefined ? length : size;
      while (++index < size) {
        var rand = baseRandom(index, lastIndex),
            value = array[rand];

        array[rand] = array[index];
        array[index] = value;
      }
      array.length = size;
      return array;
    }

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (reLeadingDot.test(string)) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Updates wrapper `details` based on `bitmask` flags.
     *
     * @private
     * @returns {Array} details The details to modify.
     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
     * @returns {Array} Returns `details`.
     */
    function updateWrapDetails(details, bitmask) {
      arrayEach(wrapFlags, function(pair) {
        var value = '_.' + pair[0];
        if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
          details.push(value);
        }
      });
      return details.sort();
    }

    /**
     * Creates a clone of `wrapper`.
     *
     * @private
     * @param {Object} wrapper The wrapper to clone.
     * @returns {Object} Returns the cloned wrapper.
     */
    function wrapperClone(wrapper) {
      if (wrapper instanceof LazyWrapper) {
        return wrapper.clone();
      }
      var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
      result.__actions__ = copyArray(wrapper.__actions__);
      result.__index__  = wrapper.__index__;
      result.__values__ = wrapper.__values__;
      return result;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an array of elements split into groups the length of `size`.
     * If `array` can't be split evenly, the final chunk will be the remaining
     * elements.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to process.
     * @param {number} [size=1] The length of each chunk
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the new array of chunks.
     * @example
     *
     * _.chunk(['a', 'b', 'c', 'd'], 2);
     * // => [['a', 'b'], ['c', 'd']]
     *
     * _.chunk(['a', 'b', 'c', 'd'], 3);
     * // => [['a', 'b', 'c'], ['d']]
     */
    function chunk(array, size, guard) {
      if ((guard ? isIterateeCall(array, size, guard) : size === undefined)) {
        size = 1;
      } else {
        size = nativeMax(toInteger(size), 0);
      }
      var length = array == null ? 0 : array.length;
      if (!length || size < 1) {
        return [];
      }
      var index = 0,
          resIndex = 0,
          result = Array(nativeCeil(length / size));

      while (index < length) {
        result[resIndex++] = baseSlice(array, index, (index += size));
      }
      return result;
    }

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are falsey.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to compact.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * Creates a new array concatenating `array` with any additional arrays
     * and/or values.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to concatenate.
     * @param {...*} [values] The values to concatenate.
     * @returns {Array} Returns the new concatenated array.
     * @example
     *
     * var array = [1];
     * var other = _.concat(array, 2, [3], [[4]]);
     *
     * console.log(other);
     * // => [1, 2, 3, [4]]
     *
     * console.log(array);
     * // => [1]
     */
    function concat() {
      var length = arguments.length;
      if (!length) {
        return [];
      }
      var args = Array(length - 1),
          array = arguments[0],
          index = length;

      while (index--) {
        args[index - 1] = arguments[index];
      }
      return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
    }

    /**
     * Creates an array of `array` values not included in the other given arrays
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons. The order and references of result values are
     * determined by the first array.
     *
     * **Note:** Unlike `_.pullAll`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @see _.without, _.xor
     * @example
     *
     * _.difference([2, 1], [2, 3]);
     * // => [1]
     */
    var difference = baseRest(function(array, values) {
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
        : [];
    });

    /**
     * This method is like `_.difference` except that it accepts `iteratee` which
     * is invoked for each element of `array` and `values` to generate the criterion
     * by which they're compared. The order and references of result values are
     * determined by the first array. The iteratee is invoked with one argument:
     * (value).
     *
     * **Note:** Unlike `_.pullAllBy`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The values to exclude.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor);
     * // => [1.2]
     *
     * // The `_.property` iteratee shorthand.
     * _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x');
     * // => [{ 'x': 2 }]
     */
    var differenceBy = baseRest(function(array, values) {
      var iteratee = last(values);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
      }
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2))
        : [];
    });

    /**
     * This method is like `_.difference` except that it accepts `comparator`
     * which is invoked to compare elements of `array` to `values`. The order and
     * references of result values are determined by the first array. The comparator
     * is invoked with two arguments: (arrVal, othVal).
     *
     * **Note:** Unlike `_.pullAllWith`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...Array} [values] The values to exclude.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     *
     * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
     * // => [{ 'x': 2, 'y': 1 }]
     */
    var differenceWith = baseRest(function(array, values) {
      var comparator = last(values);
      if (isArrayLikeObject(comparator)) {
        comparator = undefined;
      }
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator)
        : [];
    });

    /**
     * Creates a slice of `array` with `n` elements dropped from the beginning.
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.drop([1, 2, 3]);
     * // => [2, 3]
     *
     * _.drop([1, 2, 3], 2);
     * // => [3]
     *
     * _.drop([1, 2, 3], 5);
     * // => []
     *
     * _.drop([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function drop(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      return baseSlice(array, n < 0 ? 0 : n, length);
    }

    /**
     * Creates a slice of `array` with `n` elements dropped from the end.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to drop.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.dropRight([1, 2, 3]);
     * // => [1, 2]
     *
     * _.dropRight([1, 2, 3], 2);
     * // => [1]
     *
     * _.dropRight([1, 2, 3], 5);
     * // => []
     *
     * _.dropRight([1, 2, 3], 0);
     * // => [1, 2, 3]
     */
    function dropRight(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      n = length - n;
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the end.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * invoked with three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.dropRightWhile(users, function(o) { return !o.active; });
     * // => objects for ['barney']
     *
     * // The `_.matches` iteratee shorthand.
     * _.dropRightWhile(users, { 'user': 'pebbles', 'active': false });
     * // => objects for ['barney', 'fred']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.dropRightWhile(users, ['active', false]);
     * // => objects for ['barney']
     *
     * // The `_.property` iteratee shorthand.
     * _.dropRightWhile(users, 'active');
     * // => objects for ['barney', 'fred', 'pebbles']
     */
    function dropRightWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), true, true)
        : [];
    }

    /**
     * Creates a slice of `array` excluding elements dropped from the beginning.
     * Elements are dropped until `predicate` returns falsey. The predicate is
     * invoked with three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.dropWhile(users, function(o) { return !o.active; });
     * // => objects for ['pebbles']
     *
     * // The `_.matches` iteratee shorthand.
     * _.dropWhile(users, { 'user': 'barney', 'active': false });
     * // => objects for ['fred', 'pebbles']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.dropWhile(users, ['active', false]);
     * // => objects for ['pebbles']
     *
     * // The `_.property` iteratee shorthand.
     * _.dropWhile(users, 'active');
     * // => objects for ['barney', 'fred', 'pebbles']
     */
    function dropWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), true)
        : [];
    }

    /**
     * Fills elements of `array` with `value` from `start` up to, but not
     * including, `end`.
     *
     * **Note:** This method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 3.2.0
     * @category Array
     * @param {Array} array The array to fill.
     * @param {*} value The value to fill `array` with.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _.fill(array, 'a');
     * console.log(array);
     * // => ['a', 'a', 'a']
     *
     * _.fill(Array(3), 2);
     * // => [2, 2, 2]
     *
     * _.fill([4, 6, 8, 10], '*', 1, 3);
     * // => [4, '*', '*', 10]
     */
    function fill(array, value, start, end) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
        start = 0;
        end = length;
      }
      return baseFill(array, value, start, end);
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.findIndex(users, function(o) { return o.user == 'barney'; });
     * // => 0
     *
     * // The `_.matches` iteratee shorthand.
     * _.findIndex(users, { 'user': 'fred', 'active': false });
     * // => 1
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findIndex(users, ['active', false]);
     * // => 0
     *
     * // The `_.property` iteratee shorthand.
     * _.findIndex(users, 'active');
     * // => 2
     */
    function findIndex(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = fromIndex == null ? 0 : toInteger(fromIndex);
      if (index < 0) {
        index = nativeMax(length + index, 0);
      }
      return baseFindIndex(array, getIteratee(predicate, 3), index);
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.findLastIndex(users, function(o) { return o.user == 'pebbles'; });
     * // => 2
     *
     * // The `_.matches` iteratee shorthand.
     * _.findLastIndex(users, { 'user': 'barney', 'active': true });
     * // => 0
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findLastIndex(users, ['active', false]);
     * // => 2
     *
     * // The `_.property` iteratee shorthand.
     * _.findLastIndex(users, 'active');
     * // => 0
     */
    function findLastIndex(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = length - 1;
      if (fromIndex !== undefined) {
        index = toInteger(fromIndex);
        index = fromIndex < 0
          ? nativeMax(length + index, 0)
          : nativeMin(index, length - 1);
      }
      return baseFindIndex(array, getIteratee(predicate, 3), index, true);
    }

    /**
     * Flattens `array` a single level deep.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to flatten.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flatten([1, [2, [3, [4]], 5]]);
     * // => [1, 2, [3, [4]], 5]
     */
    function flatten(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, 1) : [];
    }

    /**
     * Recursively flattens `array`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to flatten.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * _.flattenDeep([1, [2, [3, [4]], 5]]);
     * // => [1, 2, 3, 4, 5]
     */
    function flattenDeep(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, INFINITY) : [];
    }

    /**
     * Recursively flatten `array` up to `depth` times.
     *
     * @static
     * @memberOf _
     * @since 4.4.0
     * @category Array
     * @param {Array} array The array to flatten.
     * @param {number} [depth=1] The maximum recursion depth.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * var array = [1, [2, [3, [4]], 5]];
     *
     * _.flattenDepth(array, 1);
     * // => [1, 2, [3, [4]], 5]
     *
     * _.flattenDepth(array, 2);
     * // => [1, 2, 3, [4], 5]
     */
    function flattenDepth(array, depth) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      depth = depth === undefined ? 1 : toInteger(depth);
      return baseFlatten(array, depth);
    }

    /**
     * The inverse of `_.toPairs`; this method returns an object composed
     * from key-value `pairs`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} pairs The key-value pairs.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.fromPairs([['a', 1], ['b', 2]]);
     * // => { 'a': 1, 'b': 2 }
     */
    function fromPairs(pairs) {
      var index = -1,
          length = pairs == null ? 0 : pairs.length,
          result = {};

      while (++index < length) {
        var pair = pairs[index];
        result[pair[0]] = pair[1];
      }
      return result;
    }

    /**
     * Gets the first element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias first
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the first element of `array`.
     * @example
     *
     * _.head([1, 2, 3]);
     * // => 1
     *
     * _.head([]);
     * // => undefined
     */
    function head(array) {
      return (array && array.length) ? array[0] : undefined;
    }

    /**
     * Gets the index at which the first occurrence of `value` is found in `array`
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons. If `fromIndex` is negative, it's used as the
     * offset from the end of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.indexOf([1, 2, 1, 2], 2);
     * // => 1
     *
     * // Search from the `fromIndex`.
     * _.indexOf([1, 2, 1, 2], 2, 2);
     * // => 3
     */
    function indexOf(array, value, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = fromIndex == null ? 0 : toInteger(fromIndex);
      if (index < 0) {
        index = nativeMax(length + index, 0);
      }
      return baseIndexOf(array, value, index);
    }

    /**
     * Gets all but the last element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     */
    function initial(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseSlice(array, 0, -1) : [];
    }

    /**
     * Creates an array of unique values that are included in all given arrays
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons. The order and references of result values are
     * determined by the first array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of intersecting values.
     * @example
     *
     * _.intersection([2, 1], [2, 3]);
     * // => [2]
     */
    var intersection = baseRest(function(arrays) {
      var mapped = arrayMap(arrays, castArrayLikeObject);
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped)
        : [];
    });

    /**
     * This method is like `_.intersection` except that it accepts `iteratee`
     * which is invoked for each element of each `arrays` to generate the criterion
     * by which they're compared. The order and references of result values are
     * determined by the first array. The iteratee is invoked with one argument:
     * (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new array of intersecting values.
     * @example
     *
     * _.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor);
     * // => [2.1]
     *
     * // The `_.property` iteratee shorthand.
     * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }]
     */
    var intersectionBy = baseRest(function(arrays) {
      var iteratee = last(arrays),
          mapped = arrayMap(arrays, castArrayLikeObject);

      if (iteratee === last(mapped)) {
        iteratee = undefined;
      } else {
        mapped.pop();
      }
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, getIteratee(iteratee, 2))
        : [];
    });

    /**
     * This method is like `_.intersection` except that it accepts `comparator`
     * which is invoked to compare elements of `arrays`. The order and references
     * of result values are determined by the first array. The comparator is
     * invoked with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of intersecting values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.intersectionWith(objects, others, _.isEqual);
     * // => [{ 'x': 1, 'y': 2 }]
     */
    var intersectionWith = baseRest(function(arrays) {
      var comparator = last(arrays),
          mapped = arrayMap(arrays, castArrayLikeObject);

      comparator = typeof comparator == 'function' ? comparator : undefined;
      if (comparator) {
        mapped.pop();
      }
      return (mapped.length && mapped[0] === arrays[0])
        ? baseIntersection(mapped, undefined, comparator)
        : [];
    });

    /**
     * Converts all elements in `array` into a string separated by `separator`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to convert.
     * @param {string} [separator=','] The element separator.
     * @returns {string} Returns the joined string.
     * @example
     *
     * _.join(['a', 'b', 'c'], '~');
     * // => 'a~b~c'
     */
    function join(array, separator) {
      return array == null ? '' : nativeJoin.call(array, separator);
    }

    /**
     * Gets the last element of `array`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {*} Returns the last element of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     */
    function last(array) {
      var length = array == null ? 0 : array.length;
      return length ? array[length - 1] : undefined;
    }

    /**
     * This method is like `_.indexOf` except that it iterates over elements of
     * `array` from right to left.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 1, 2], 2);
     * // => 3
     *
     * // Search from the `fromIndex`.
     * _.lastIndexOf([1, 2, 1, 2], 2, 2);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return -1;
      }
      var index = length;
      if (fromIndex !== undefined) {
        index = toInteger(fromIndex);
        index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
      }
      return value === value
        ? strictLastIndexOf(array, value, index)
        : baseFindIndex(array, baseIsNaN, index, true);
    }

    /**
     * Gets the element at index `n` of `array`. If `n` is negative, the nth
     * element from the end is returned.
     *
     * @static
     * @memberOf _
     * @since 4.11.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=0] The index of the element to return.
     * @returns {*} Returns the nth element of `array`.
     * @example
     *
     * var array = ['a', 'b', 'c', 'd'];
     *
     * _.nth(array, 1);
     * // => 'b'
     *
     * _.nth(array, -2);
     * // => 'c';
     */
    function nth(array, n) {
      return (array && array.length) ? baseNth(array, toInteger(n)) : undefined;
    }

    /**
     * Removes all given values from `array` using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
     * to remove elements from an array by predicate.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...*} [values] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
     *
     * _.pull(array, 'a', 'c');
     * console.log(array);
     * // => ['b', 'b']
     */
    var pull = baseRest(pullAll);

    /**
     * This method is like `_.pull` except that it accepts an array of values to remove.
     *
     * **Note:** Unlike `_.difference`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
     *
     * _.pullAll(array, ['a', 'c']);
     * console.log(array);
     * // => ['b', 'b']
     */
    function pullAll(array, values) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values)
        : array;
    }

    /**
     * This method is like `_.pullAll` except that it accepts `iteratee` which is
     * invoked for each element of `array` and `values` to generate the criterion
     * by which they're compared. The iteratee is invoked with one argument: (value).
     *
     * **Note:** Unlike `_.differenceBy`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [{ 'x': 1 }, { 'x': 2 }, { 'x': 3 }, { 'x': 1 }];
     *
     * _.pullAllBy(array, [{ 'x': 1 }, { 'x': 3 }], 'x');
     * console.log(array);
     * // => [{ 'x': 2 }]
     */
    function pullAllBy(array, values, iteratee) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values, getIteratee(iteratee, 2))
        : array;
    }

    /**
     * This method is like `_.pullAll` except that it accepts `comparator` which
     * is invoked to compare elements of `array` to `values`. The comparator is
     * invoked with two arguments: (arrVal, othVal).
     *
     * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 4.6.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Array} values The values to remove.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
     *
     * _.pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
     * console.log(array);
     * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
     */
    function pullAllWith(array, values, comparator) {
      return (array && array.length && values && values.length)
        ? basePullAll(array, values, undefined, comparator)
        : array;
    }

    /**
     * Removes elements from `array` corresponding to `indexes` and returns an
     * array of removed elements.
     *
     * **Note:** Unlike `_.at`, this method mutates `array`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {...(number|number[])} [indexes] The indexes of elements to remove.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = ['a', 'b', 'c', 'd'];
     * var pulled = _.pullAt(array, [1, 3]);
     *
     * console.log(array);
     * // => ['a', 'c']
     *
     * console.log(pulled);
     * // => ['b', 'd']
     */
    var pullAt = flatRest(function(array, indexes) {
      var length = array == null ? 0 : array.length,
          result = baseAt(array, indexes);

      basePullAt(array, arrayMap(indexes, function(index) {
        return isIndex(index, length) ? +index : index;
      }).sort(compareAscending));

      return result;
    });

    /**
     * Removes all elements from `array` that `predicate` returns truthy for
     * and returns an array of the removed elements. The predicate is invoked
     * with three arguments: (value, index, array).
     *
     * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
     * to pull elements from an array by value.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4];
     * var evens = _.remove(array, function(n) {
     *   return n % 2 == 0;
     * });
     *
     * console.log(array);
     * // => [1, 3]
     *
     * console.log(evens);
     * // => [2, 4]
     */
    function remove(array, predicate) {
      var result = [];
      if (!(array && array.length)) {
        return result;
      }
      var index = -1,
          indexes = [],
          length = array.length;

      predicate = getIteratee(predicate, 3);
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result.push(value);
          indexes.push(index);
        }
      }
      basePullAt(array, indexes);
      return result;
    }

    /**
     * Reverses `array` so that the first element becomes the last, the second
     * element becomes the second to last, and so on.
     *
     * **Note:** This method mutates `array` and is based on
     * [`Array#reverse`](https://mdn.io/Array/reverse).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to modify.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _.reverse(array);
     * // => [3, 2, 1]
     *
     * console.log(array);
     * // => [3, 2, 1]
     */
    function reverse(array) {
      return array == null ? array : nativeReverse.call(array);
    }

    /**
     * Creates a slice of `array` from `start` up to, but not including, `end`.
     *
     * **Note:** This method is used instead of
     * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
     * returned.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function slice(array, start, end) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
        start = 0;
        end = length;
      }
      else {
        start = start == null ? 0 : toInteger(start);
        end = end === undefined ? length : toInteger(end);
      }
      return baseSlice(array, start, end);
    }

    /**
     * Uses a binary search to determine the lowest index at which `value`
     * should be inserted into `array` in order to maintain its sort order.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([30, 50], 40);
     * // => 1
     */
    function sortedIndex(array, value) {
      return baseSortedIndex(array, value);
    }

    /**
     * This method is like `_.sortedIndex` except that it accepts `iteratee`
     * which is invoked for `value` and each element of `array` to compute their
     * sort ranking. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * var objects = [{ 'x': 4 }, { 'x': 5 }];
     *
     * _.sortedIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
     * // => 0
     *
     * // The `_.property` iteratee shorthand.
     * _.sortedIndexBy(objects, { 'x': 4 }, 'x');
     * // => 0
     */
    function sortedIndexBy(array, value, iteratee) {
      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
    }

    /**
     * This method is like `_.indexOf` except that it performs a binary
     * search on a sorted `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.sortedIndexOf([4, 5, 5, 5, 6], 5);
     * // => 1
     */
    function sortedIndexOf(array, value) {
      var length = array == null ? 0 : array.length;
      if (length) {
        var index = baseSortedIndex(array, value);
        if (index < length && eq(array[index], value)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.sortedIndex` except that it returns the highest
     * index at which `value` should be inserted into `array` in order to
     * maintain its sort order.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedLastIndex([4, 5, 5, 5, 6], 5);
     * // => 4
     */
    function sortedLastIndex(array, value) {
      return baseSortedIndex(array, value, true);
    }

    /**
     * This method is like `_.sortedLastIndex` except that it accepts `iteratee`
     * which is invoked for `value` and each element of `array` to compute their
     * sort ranking. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The sorted array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * var objects = [{ 'x': 4 }, { 'x': 5 }];
     *
     * _.sortedLastIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
     * // => 1
     *
     * // The `_.property` iteratee shorthand.
     * _.sortedLastIndexBy(objects, { 'x': 4 }, 'x');
     * // => 1
     */
    function sortedLastIndexBy(array, value, iteratee) {
      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
    }

    /**
     * This method is like `_.lastIndexOf` except that it performs a binary
     * search on a sorted `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     * @example
     *
     * _.sortedLastIndexOf([4, 5, 5, 5, 6], 5);
     * // => 3
     */
    function sortedLastIndexOf(array, value) {
      var length = array == null ? 0 : array.length;
      if (length) {
        var index = baseSortedIndex(array, value, true) - 1;
        if (eq(array[index], value)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.uniq` except that it's designed and optimized
     * for sorted arrays.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.sortedUniq([1, 1, 2]);
     * // => [1, 2]
     */
    function sortedUniq(array) {
      return (array && array.length)
        ? baseSortedUniq(array)
        : [];
    }

    /**
     * This method is like `_.uniqBy` except that it's designed and optimized
     * for sorted arrays.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee] The iteratee invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor);
     * // => [1.1, 2.3]
     */
    function sortedUniqBy(array, iteratee) {
      return (array && array.length)
        ? baseSortedUniq(array, getIteratee(iteratee, 2))
        : [];
    }

    /**
     * Gets all but the first element of `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.tail([1, 2, 3]);
     * // => [2, 3]
     */
    function tail(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseSlice(array, 1, length) : [];
    }

    /**
     * Creates a slice of `array` with `n` elements taken from the beginning.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.take([1, 2, 3]);
     * // => [1]
     *
     * _.take([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.take([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.take([1, 2, 3], 0);
     * // => []
     */
    function take(array, n, guard) {
      if (!(array && array.length)) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      return baseSlice(array, 0, n < 0 ? 0 : n);
    }

    /**
     * Creates a slice of `array` with `n` elements taken from the end.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {number} [n=1] The number of elements to take.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * _.takeRight([1, 2, 3]);
     * // => [3]
     *
     * _.takeRight([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.takeRight([1, 2, 3], 5);
     * // => [1, 2, 3]
     *
     * _.takeRight([1, 2, 3], 0);
     * // => []
     */
    function takeRight(array, n, guard) {
      var length = array == null ? 0 : array.length;
      if (!length) {
        return [];
      }
      n = (guard || n === undefined) ? 1 : toInteger(n);
      n = length - n;
      return baseSlice(array, n < 0 ? 0 : n, length);
    }

    /**
     * Creates a slice of `array` with elements taken from the end. Elements are
     * taken until `predicate` returns falsey. The predicate is invoked with
     * three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': true },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': false }
     * ];
     *
     * _.takeRightWhile(users, function(o) { return !o.active; });
     * // => objects for ['fred', 'pebbles']
     *
     * // The `_.matches` iteratee shorthand.
     * _.takeRightWhile(users, { 'user': 'pebbles', 'active': false });
     * // => objects for ['pebbles']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.takeRightWhile(users, ['active', false]);
     * // => objects for ['fred', 'pebbles']
     *
     * // The `_.property` iteratee shorthand.
     * _.takeRightWhile(users, 'active');
     * // => []
     */
    function takeRightWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3), false, true)
        : [];
    }

    /**
     * Creates a slice of `array` with elements taken from the beginning. Elements
     * are taken until `predicate` returns falsey. The predicate is invoked with
     * three arguments: (value, index, array).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Array
     * @param {Array} array The array to query.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the slice of `array`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.takeWhile(users, function(o) { return !o.active; });
     * // => objects for ['barney', 'fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.takeWhile(users, { 'user': 'barney', 'active': false });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.takeWhile(users, ['active', false]);
     * // => objects for ['barney', 'fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.takeWhile(users, 'active');
     * // => []
     */
    function takeWhile(array, predicate) {
      return (array && array.length)
        ? baseWhile(array, getIteratee(predicate, 3))
        : [];
    }

    /**
     * Creates an array of unique values, in order, from all given arrays using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * _.union([2], [1, 2]);
     * // => [2, 1]
     */
    var union = baseRest(function(arrays) {
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
    });

    /**
     * This method is like `_.union` except that it accepts `iteratee` which is
     * invoked for each element of each `arrays` to generate the criterion by
     * which uniqueness is computed. Result values are chosen from the first
     * array in which the value occurs. The iteratee is invoked with one argument:
     * (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * _.unionBy([2.1], [1.2, 2.3], Math.floor);
     * // => [2.1, 1.2]
     *
     * // The `_.property` iteratee shorthand.
     * _.unionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    var unionBy = baseRest(function(arrays) {
      var iteratee = last(arrays);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
      }
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
    });

    /**
     * This method is like `_.union` except that it accepts `comparator` which
     * is invoked to compare elements of `arrays`. Result values are chosen from
     * the first array in which the value occurs. The comparator is invoked
     * with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of combined values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.unionWith(objects, others, _.isEqual);
     * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
     */
    var unionWith = baseRest(function(arrays) {
      var comparator = last(arrays);
      comparator = typeof comparator == 'function' ? comparator : undefined;
      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
    });

    /**
     * Creates a duplicate-free version of an array, using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons, in which only the first occurrence of each element
     * is kept. The order of result values is determined by the order they occur
     * in the array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.uniq([2, 1, 2]);
     * // => [2, 1]
     */
    function uniq(array) {
      return (array && array.length) ? baseUniq(array) : [];
    }

    /**
     * This method is like `_.uniq` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * uniqueness is computed. The order of result values is determined by the
     * order they occur in the array. The iteratee is invoked with one argument:
     * (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
     * // => [2.1, 1.2]
     *
     * // The `_.property` iteratee shorthand.
     * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniqBy(array, iteratee) {
      return (array && array.length) ? baseUniq(array, getIteratee(iteratee, 2)) : [];
    }

    /**
     * This method is like `_.uniq` except that it accepts `comparator` which
     * is invoked to compare elements of `array`. The order of result values is
     * determined by the order they occur in the array.The comparator is invoked
     * with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new duplicate free array.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.uniqWith(objects, _.isEqual);
     * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
     */
    function uniqWith(array, comparator) {
      comparator = typeof comparator == 'function' ? comparator : undefined;
      return (array && array.length) ? baseUniq(array, undefined, comparator) : [];
    }

    /**
     * This method is like `_.zip` except that it accepts an array of grouped
     * elements and creates an array regrouping the elements to their pre-zip
     * configuration.
     *
     * @static
     * @memberOf _
     * @since 1.2.0
     * @category Array
     * @param {Array} array The array of grouped elements to process.
     * @returns {Array} Returns the new array of regrouped elements.
     * @example
     *
     * var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
     * // => [['a', 1, true], ['b', 2, false]]
     *
     * _.unzip(zipped);
     * // => [['a', 'b'], [1, 2], [true, false]]
     */
    function unzip(array) {
      if (!(array && array.length)) {
        return [];
      }
      var length = 0;
      array = arrayFilter(array, function(group) {
        if (isArrayLikeObject(group)) {
          length = nativeMax(group.length, length);
          return true;
        }
      });
      return baseTimes(length, function(index) {
        return arrayMap(array, baseProperty(index));
      });
    }

    /**
     * This method is like `_.unzip` except that it accepts `iteratee` to specify
     * how regrouped values should be combined. The iteratee is invoked with the
     * elements of each group: (...group).
     *
     * @static
     * @memberOf _
     * @since 3.8.0
     * @category Array
     * @param {Array} array The array of grouped elements to process.
     * @param {Function} [iteratee=_.identity] The function to combine
     *  regrouped values.
     * @returns {Array} Returns the new array of regrouped elements.
     * @example
     *
     * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
     * // => [[1, 10, 100], [2, 20, 200]]
     *
     * _.unzipWith(zipped, _.add);
     * // => [3, 30, 300]
     */
    function unzipWith(array, iteratee) {
      if (!(array && array.length)) {
        return [];
      }
      var result = unzip(array);
      if (iteratee == null) {
        return result;
      }
      return arrayMap(result, function(group) {
        return apply(iteratee, undefined, group);
      });
    }

    /**
     * Creates an array excluding all given values using
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * **Note:** Unlike `_.pull`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {...*} [values] The values to exclude.
     * @returns {Array} Returns the new array of filtered values.
     * @see _.difference, _.xor
     * @example
     *
     * _.without([2, 1, 2, 3], 1, 2);
     * // => [3]
     */
    var without = baseRest(function(array, values) {
      return isArrayLikeObject(array)
        ? baseDifference(array, values)
        : [];
    });

    /**
     * Creates an array of unique values that is the
     * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
     * of the given arrays. The order of result values is determined by the order
     * they occur in the arrays.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @returns {Array} Returns the new array of filtered values.
     * @see _.difference, _.without
     * @example
     *
     * _.xor([2, 1], [2, 3]);
     * // => [1, 3]
     */
    var xor = baseRest(function(arrays) {
      return baseXor(arrayFilter(arrays, isArrayLikeObject));
    });

    /**
     * This method is like `_.xor` except that it accepts `iteratee` which is
     * invoked for each element of each `arrays` to generate the criterion by
     * which by which they're compared. The order of result values is determined
     * by the order they occur in the arrays. The iteratee is invoked with one
     * argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.xorBy([2.1, 1.2], [2.3, 3.4], Math.floor);
     * // => [1.2, 3.4]
     *
     * // The `_.property` iteratee shorthand.
     * _.xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 2 }]
     */
    var xorBy = baseRest(function(arrays) {
      var iteratee = last(arrays);
      if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
      }
      return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
    });

    /**
     * This method is like `_.xor` except that it accepts `comparator` which is
     * invoked to compare elements of `arrays`. The order of result values is
     * determined by the order they occur in the arrays. The comparator is invoked
     * with two arguments: (arrVal, othVal).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Array
     * @param {...Array} [arrays] The arrays to inspect.
     * @param {Function} [comparator] The comparator invoked per element.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
     *
     * _.xorWith(objects, others, _.isEqual);
     * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
     */
    var xorWith = baseRest(function(arrays) {
      var comparator = last(arrays);
      comparator = typeof comparator == 'function' ? comparator : undefined;
      return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
    });

    /**
     * Creates an array of grouped elements, the first of which contains the
     * first elements of the given arrays, the second of which contains the
     * second elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {...Array} [arrays] The arrays to process.
     * @returns {Array} Returns the new array of grouped elements.
     * @example
     *
     * _.zip(['a', 'b'], [1, 2], [true, false]);
     * // => [['a', 1, true], ['b', 2, false]]
     */
    var zip = baseRest(unzip);

    /**
     * This method is like `_.fromPairs` except that it accepts two arrays,
     * one of property identifiers and one of corresponding values.
     *
     * @static
     * @memberOf _
     * @since 0.4.0
     * @category Array
     * @param {Array} [props=[]] The property identifiers.
     * @param {Array} [values=[]] The property values.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.zipObject(['a', 'b'], [1, 2]);
     * // => { 'a': 1, 'b': 2 }
     */
    function zipObject(props, values) {
      return baseZipObject(props || [], values || [], assignValue);
    }

    /**
     * This method is like `_.zipObject` except that it supports property paths.
     *
     * @static
     * @memberOf _
     * @since 4.1.0
     * @category Array
     * @param {Array} [props=[]] The property identifiers.
     * @param {Array} [values=[]] The property values.
     * @returns {Object} Returns the new object.
     * @example
     *
     * _.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2]);
     * // => { 'a': { 'b': [{ 'c': 1 }, { 'd': 2 }] } }
     */
    function zipObjectDeep(props, values) {
      return baseZipObject(props || [], values || [], baseSet);
    }

    /**
     * This method is like `_.zip` except that it accepts `iteratee` to specify
     * how grouped values should be combined. The iteratee is invoked with the
     * elements of each group: (...group).
     *
     * @static
     * @memberOf _
     * @since 3.8.0
     * @category Array
     * @param {...Array} [arrays] The arrays to process.
     * @param {Function} [iteratee=_.identity] The function to combine
     *  grouped values.
     * @returns {Array} Returns the new array of grouped elements.
     * @example
     *
     * _.zipWith([1, 2], [10, 20], [100, 200], function(a, b, c) {
     *   return a + b + c;
     * });
     * // => [111, 222]
     */
    var zipWith = baseRest(function(arrays) {
      var length = arrays.length,
          iteratee = length > 1 ? arrays[length - 1] : undefined;

      iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined;
      return unzipWith(arrays, iteratee);
    });

    /*------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` wrapper instance that wraps `value` with explicit method
     * chain sequences enabled. The result of such sequences must be unwrapped
     * with `_#value`.
     *
     * @static
     * @memberOf _
     * @since 1.3.0
     * @category Seq
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36 },
     *   { 'user': 'fred',    'age': 40 },
     *   { 'user': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _
     *   .chain(users)
     *   .sortBy('age')
     *   .map(function(o) {
     *     return o.user + ' is ' + o.age;
     *   })
     *   .head()
     *   .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      var result = lodash(value);
      result.__chain__ = true;
      return result;
    }

    /**
     * This method invokes `interceptor` and returns `value`. The interceptor
     * is invoked with one argument; (value). The purpose of this method is to
     * "tap into" a method chain sequence in order to modify intermediate results.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Seq
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3])
     *  .tap(function(array) {
     *    // Mutate input array.
     *    array.pop();
     *  })
     *  .reverse()
     *  .value();
     * // => [2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * This method is like `_.tap` except that it returns the result of `interceptor`.
     * The purpose of this method is to "pass thru" values replacing intermediate
     * results in a method chain sequence.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Seq
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns the result of `interceptor`.
     * @example
     *
     * _('  abc  ')
     *  .chain()
     *  .trim()
     *  .thru(function(value) {
     *    return [value];
     *  })
     *  .value();
     * // => ['abc']
     */
    function thru(value, interceptor) {
      return interceptor(value);
    }

    /**
     * This method is the wrapper version of `_.at`.
     *
     * @name at
     * @memberOf _
     * @since 1.0.0
     * @category Seq
     * @param {...(string|string[])} [paths] The property paths to pick.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
     *
     * _(object).at(['a[0].b.c', 'a[1]']).value();
     * // => [3, 4]
     */
    var wrapperAt = flatRest(function(paths) {
      var length = paths.length,
          start = length ? paths[0] : 0,
          value = this.__wrapped__,
          interceptor = function(object) { return baseAt(object, paths); };

      if (length > 1 || this.__actions__.length ||
          !(value instanceof LazyWrapper) || !isIndex(start)) {
        return this.thru(interceptor);
      }
      value = value.slice(start, +start + (length ? 1 : 0));
      value.__actions__.push({
        'func': thru,
        'args': [interceptor],
        'thisArg': undefined
      });
      return new LodashWrapper(value, this.__chain__).thru(function(array) {
        if (length && !array.length) {
          array.push(undefined);
        }
        return array;
      });
    });

    /**
     * Creates a `lodash` wrapper instance with explicit method chain sequences enabled.
     *
     * @name chain
     * @memberOf _
     * @since 0.1.0
     * @category Seq
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 }
     * ];
     *
     * // A sequence without explicit chaining.
     * _(users).head();
     * // => { 'user': 'barney', 'age': 36 }
     *
     * // A sequence with explicit chaining.
     * _(users)
     *   .chain()
     *   .head()
     *   .pick('user')
     *   .value();
     * // => { 'user': 'barney' }
     */
    function wrapperChain() {
      return chain(this);
    }

    /**
     * Executes the chain sequence and returns the wrapped result.
     *
     * @name commit
     * @memberOf _
     * @since 3.2.0
     * @category Seq
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2];
     * var wrapped = _(array).push(3);
     *
     * console.log(array);
     * // => [1, 2]
     *
     * wrapped = wrapped.commit();
     * console.log(array);
     * // => [1, 2, 3]
     *
     * wrapped.last();
     * // => 3
     *
     * console.log(array);
     * // => [1, 2, 3]
     */
    function wrapperCommit() {
      return new LodashWrapper(this.value(), this.__chain__);
    }

    /**
     * Gets the next value on a wrapped object following the
     * [iterator protocol](https://mdn.io/iteration_protocols#iterator).
     *
     * @name next
     * @memberOf _
     * @since 4.0.0
     * @category Seq
     * @returns {Object} Returns the next iterator value.
     * @example
     *
     * var wrapped = _([1, 2]);
     *
     * wrapped.next();
     * // => { 'done': false, 'value': 1 }
     *
     * wrapped.next();
     * // => { 'done': false, 'value': 2 }
     *
     * wrapped.next();
     * // => { 'done': true, 'value': undefined }
     */
    function wrapperNext() {
      if (this.__values__ === undefined) {
        this.__values__ = toArray(this.value());
      }
      var done = this.__index__ >= this.__values__.length,
          value = done ? undefined : this.__values__[this.__index__++];

      return { 'done': done, 'value': value };
    }

    /**
     * Enables the wrapper to be iterable.
     *
     * @name Symbol.iterator
     * @memberOf _
     * @since 4.0.0
     * @category Seq
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var wrapped = _([1, 2]);
     *
     * wrapped[Symbol.iterator]() === wrapped;
     * // => true
     *
     * Array.from(wrapped);
     * // => [1, 2]
     */
    function wrapperToIterator() {
      return this;
    }

    /**
     * Creates a clone of the chain sequence planting `value` as the wrapped value.
     *
     * @name plant
     * @memberOf _
     * @since 3.2.0
     * @category Seq
     * @param {*} value The value to plant.
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var wrapped = _([1, 2]).map(square);
     * var other = wrapped.plant([3, 4]);
     *
     * other.value();
     * // => [9, 16]
     *
     * wrapped.value();
     * // => [1, 4]
     */
    function wrapperPlant(value) {
      var result,
          parent = this;

      while (parent instanceof baseLodash) {
        var clone = wrapperClone(parent);
        clone.__index__ = 0;
        clone.__values__ = undefined;
        if (result) {
          previous.__wrapped__ = clone;
        } else {
          result = clone;
        }
        var previous = clone;
        parent = parent.__wrapped__;
      }
      previous.__wrapped__ = value;
      return result;
    }

    /**
     * This method is the wrapper version of `_.reverse`.
     *
     * **Note:** This method mutates the wrapped array.
     *
     * @name reverse
     * @memberOf _
     * @since 0.1.0
     * @category Seq
     * @returns {Object} Returns the new `lodash` wrapper instance.
     * @example
     *
     * var array = [1, 2, 3];
     *
     * _(array).reverse().value()
     * // => [3, 2, 1]
     *
     * console.log(array);
     * // => [3, 2, 1]
     */
    function wrapperReverse() {
      var value = this.__wrapped__;
      if (value instanceof LazyWrapper) {
        var wrapped = value;
        if (this.__actions__.length) {
          wrapped = new LazyWrapper(this);
        }
        wrapped = wrapped.reverse();
        wrapped.__actions__.push({
          'func': thru,
          'args': [reverse],
          'thisArg': undefined
        });
        return new LodashWrapper(wrapped, this.__chain__);
      }
      return this.thru(reverse);
    }

    /**
     * Executes the chain sequence to resolve the unwrapped value.
     *
     * @name value
     * @memberOf _
     * @since 0.1.0
     * @alias toJSON, valueOf
     * @category Seq
     * @returns {*} Returns the resolved unwrapped value.
     * @example
     *
     * _([1, 2, 3]).value();
     * // => [1, 2, 3]
     */
    function wrapperValue() {
      return baseWrapperValue(this.__wrapped__, this.__actions__);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` thru `iteratee`. The corresponding value of
     * each key is the number of times the key was returned by `iteratee`. The
     * iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([6.1, 4.2, 6.3], Math.floor);
     * // => { '4': 1, '6': 2 }
     *
     * // The `_.property` iteratee shorthand.
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        ++result[key];
      } else {
        baseAssignValue(result, key, 1);
      }
    });

    /**
     * Checks if `predicate` returns truthy for **all** elements of `collection`.
     * Iteration is stopped once `predicate` returns falsey. The predicate is
     * invoked with three arguments: (value, index|key, collection).
     *
     * **Note:** This method returns `true` for
     * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
     * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
     * elements of empty collections.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes'], Boolean);
     * // => false
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * // The `_.matches` iteratee shorthand.
     * _.every(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.every(users, ['active', false]);
     * // => true
     *
     * // The `_.property` iteratee shorthand.
     * _.every(users, 'active');
     * // => false
     */
    function every(collection, predicate, guard) {
      var func = isArray(collection) ? arrayEvery : baseEvery;
      if (guard && isIterateeCall(collection, predicate, guard)) {
        predicate = undefined;
      }
      return func(collection, getIteratee(predicate, 3));
    }

    /**
     * Iterates over elements of `collection`, returning an array of all elements
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * **Note:** Unlike `_.remove`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     * @see _.reject
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.filter(users, function(o) { return !o.active; });
     * // => objects for ['fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.filter(users, { 'age': 36, 'active': true });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.filter(users, ['active', false]);
     * // => objects for ['fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.filter(users, 'active');
     * // => objects for ['barney']
     */
    function filter(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, getIteratee(predicate, 3));
    }

    /**
     * Iterates over elements of `collection`, returning the first element
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': true },
     *   { 'user': 'fred',    'age': 40, 'active': false },
     *   { 'user': 'pebbles', 'age': 1,  'active': true }
     * ];
     *
     * _.find(users, function(o) { return o.age < 40; });
     * // => object for 'barney'
     *
     * // The `_.matches` iteratee shorthand.
     * _.find(users, { 'age': 1, 'active': true });
     * // => object for 'pebbles'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.find(users, ['active', false]);
     * // => object for 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.find(users, 'active');
     * // => object for 'barney'
     */
    var find = createFind(findIndex);

    /**
     * This method is like `_.find` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=collection.length-1] The index to search from.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(n) {
     *   return n % 2 == 1;
     * });
     * // => 3
     */
    var findLast = createFind(findLastIndex);

    /**
     * Creates a flattened array of values by running each element in `collection`
     * thru `iteratee` and flattening the mapped results. The iteratee is invoked
     * with three arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * function duplicate(n) {
     *   return [n, n];
     * }
     *
     * _.flatMap([1, 2], duplicate);
     * // => [1, 1, 2, 2]
     */
    function flatMap(collection, iteratee) {
      return baseFlatten(map(collection, iteratee), 1);
    }

    /**
     * This method is like `_.flatMap` except that it recursively flattens the
     * mapped results.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * function duplicate(n) {
     *   return [[[n, n]]];
     * }
     *
     * _.flatMapDeep([1, 2], duplicate);
     * // => [1, 1, 2, 2]
     */
    function flatMapDeep(collection, iteratee) {
      return baseFlatten(map(collection, iteratee), INFINITY);
    }

    /**
     * This method is like `_.flatMap` except that it recursively flattens the
     * mapped results up to `depth` times.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {number} [depth=1] The maximum recursion depth.
     * @returns {Array} Returns the new flattened array.
     * @example
     *
     * function duplicate(n) {
     *   return [[[n, n]]];
     * }
     *
     * _.flatMapDepth([1, 2], duplicate, 2);
     * // => [[1, 1], [2, 2]]
     */
    function flatMapDepth(collection, iteratee, depth) {
      depth = depth === undefined ? 1 : toInteger(depth);
      return baseFlatten(map(collection, iteratee), depth);
    }

    /**
     * Iterates over elements of `collection` and invokes `iteratee` for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length"
     * property are iterated like arrays. To avoid this behavior use `_.forIn`
     * or `_.forOwn` for object iteration.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias each
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEachRight
     * @example
     *
     * _.forEach([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `1` then `2`.
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, getIteratee(iteratee, 3));
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @alias eachRight
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEach
     * @example
     *
     * _.forEachRight([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `2` then `1`.
     */
    function forEachRight(collection, iteratee) {
      var func = isArray(collection) ? arrayEachRight : baseEachRight;
      return func(collection, getIteratee(iteratee, 3));
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` thru `iteratee`. The order of grouped values
     * is determined by the order they occur in `collection`. The corresponding
     * value of each key is an array of elements responsible for generating the
     * key. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([6.1, 4.2, 6.3], Math.floor);
     * // => { '4': [4.2], '6': [6.1, 6.3] }
     *
     * // The `_.property` iteratee shorthand.
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      if (hasOwnProperty.call(result, key)) {
        result[key].push(value);
      } else {
        baseAssignValue(result, key, [value]);
      }
    });

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'a': 1, 'b': 2 }, 1);
     * // => true
     *
     * _.includes('abcd', 'bc');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
    }

    /**
     * Invokes the method at `path` of each element in `collection`, returning
     * an array of the results of each invoked method. Any additional arguments
     * are provided to each invoked method. If `path` is a function, it's invoked
     * for, and `this` bound to, each element in `collection`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Array|Function|string} path The path of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [args] The arguments to invoke each method with.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * _.invokeMap([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invokeMap([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    var invokeMap = baseRest(function(collection, path, args) {
      var index = -1,
          isFunc = typeof path == 'function',
          result = isArrayLike(collection) ? Array(collection.length) : [];

      baseEach(collection, function(value) {
        result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
      });
      return result;
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` thru `iteratee`. The corresponding value of
     * each key is the last element responsible for generating the key. The
     * iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var array = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.keyBy(array, function(o) {
     *   return String.fromCharCode(o.code);
     * });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.keyBy(array, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     */
    var keyBy = createAggregator(function(result, value, key) {
      baseAssignValue(result, key, value);
    });

    /**
     * Creates an array of values by running each element in `collection` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
     * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
     * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
     * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * _.map([4, 8], square);
     * // => [16, 64]
     *
     * _.map({ 'a': 4, 'b': 8 }, square);
     * // => [16, 64] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */
    function map(collection, iteratee) {
      var func = isArray(collection) ? arrayMap : baseMap;
      return func(collection, getIteratee(iteratee, 3));
    }

    /**
     * This method is like `_.sortBy` except that it allows specifying the sort
     * orders of the iteratees to sort by. If `orders` is unspecified, all values
     * are sorted in ascending order. Otherwise, specify an order of "desc" for
     * descending or "asc" for ascending sort order of corresponding values.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
     *  The iteratees to sort by.
     * @param {string[]} [orders] The sort orders of `iteratees`.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 34 },
     *   { 'user': 'fred',   'age': 40 },
     *   { 'user': 'barney', 'age': 36 }
     * ];
     *
     * // Sort by `user` in ascending order and by `age` in descending order.
     * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
     * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
     */
    function orderBy(collection, iteratees, orders, guard) {
      if (collection == null) {
        return [];
      }
      if (!isArray(iteratees)) {
        iteratees = iteratees == null ? [] : [iteratees];
      }
      orders = guard ? undefined : orders;
      if (!isArray(orders)) {
        orders = orders == null ? [] : [orders];
      }
      return baseOrderBy(collection, iteratees, orders);
    }

    /**
     * Creates an array of elements split into two groups, the first of which
     * contains elements `predicate` returns truthy for, the second of which
     * contains elements `predicate` returns falsey for. The predicate is
     * invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the array of grouped elements.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': false },
     *   { 'user': 'fred',    'age': 40, 'active': true },
     *   { 'user': 'pebbles', 'age': 1,  'active': false }
     * ];
     *
     * _.partition(users, function(o) { return o.active; });
     * // => objects for [['fred'], ['barney', 'pebbles']]
     *
     * // The `_.matches` iteratee shorthand.
     * _.partition(users, { 'age': 1, 'active': false });
     * // => objects for [['pebbles'], ['barney', 'fred']]
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.partition(users, ['active', false]);
     * // => objects for [['barney', 'pebbles'], ['fred']]
     *
     * // The `_.property` iteratee shorthand.
     * _.partition(users, 'active');
     * // => objects for [['fred'], ['barney', 'pebbles']]
     */
    var partition = createAggregator(function(result, value, key) {
      result[key ? 0 : 1].push(value);
    }, function() { return [[], []]; });

    /**
     * Reduces `collection` to a value which is the accumulated result of running
     * each element in `collection` thru `iteratee`, where each successive
     * invocation is supplied the return value of the previous. If `accumulator`
     * is not given, the first element of `collection` is used as the initial
     * value. The iteratee is invoked with four arguments:
     * (accumulator, value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.reduce`, `_.reduceRight`, and `_.transform`.
     *
     * The guarded methods are:
     * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
     * and `sortBy`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @returns {*} Returns the accumulated value.
     * @see _.reduceRight
     * @example
     *
     * _.reduce([1, 2], function(sum, n) {
     *   return sum + n;
     * }, 0);
     * // => 3
     *
     * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
     *   (result[value] || (result[value] = [])).push(key);
     *   return result;
     * }, {});
     * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
     */
    function reduce(collection, iteratee, accumulator) {
      var func = isArray(collection) ? arrayReduce : baseReduce,
          initAccum = arguments.length < 3;

      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements of
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @returns {*} Returns the accumulated value.
     * @see _.reduce
     * @example
     *
     * var array = [[0, 1], [2, 3], [4, 5]];
     *
     * _.reduceRight(array, function(flattened, other) {
     *   return flattened.concat(other);
     * }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, iteratee, accumulator) {
      var func = isArray(collection) ? arrayReduceRight : baseReduce,
          initAccum = arguments.length < 3;

      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
    }

    /**
     * The opposite of `_.filter`; this method returns the elements of `collection`
     * that `predicate` does **not** return truthy for.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     * @see _.filter
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false },
     *   { 'user': 'fred',   'age': 40, 'active': true }
     * ];
     *
     * _.reject(users, function(o) { return !o.active; });
     * // => objects for ['fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.reject(users, { 'age': 40, 'active': true });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.reject(users, ['active', false]);
     * // => objects for ['fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.reject(users, 'active');
     * // => objects for ['barney']
     */
    function reject(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, negate(getIteratee(predicate, 3)));
    }

    /**
     * Gets a random element from `collection`.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to sample.
     * @returns {*} Returns the random element.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     */
    function sample(collection) {
      var func = isArray(collection) ? arraySample : baseSample;
      return func(collection);
    }

    /**
     * Gets `n` random elements at unique keys from `collection` up to the
     * size of `collection`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Collection
     * @param {Array|Object} collection The collection to sample.
     * @param {number} [n=1] The number of elements to sample.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the random elements.
     * @example
     *
     * _.sampleSize([1, 2, 3], 2);
     * // => [3, 1]
     *
     * _.sampleSize([1, 2, 3], 4);
     * // => [2, 3, 1]
     */
    function sampleSize(collection, n, guard) {
      if ((guard ? isIterateeCall(collection, n, guard) : n === undefined)) {
        n = 1;
      } else {
        n = toInteger(n);
      }
      var func = isArray(collection) ? arraySampleSize : baseSampleSize;
      return func(collection, n);
    }

    /**
     * Creates an array of shuffled values, using a version of the
     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to shuffle.
     * @returns {Array} Returns the new shuffled array.
     * @example
     *
     * _.shuffle([1, 2, 3, 4]);
     * // => [4, 1, 3, 2]
     */
    function shuffle(collection) {
      var func = isArray(collection) ? arrayShuffle : baseShuffle;
      return func(collection);
    }

    /**
     * Gets the size of `collection` by returning its length for array-like
     * values or the number of own enumerable string keyed properties for objects.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns the collection size.
     * @example
     *
     * _.size([1, 2, 3]);
     * // => 3
     *
     * _.size({ 'a': 1, 'b': 2 });
     * // => 2
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      if (collection == null) {
        return 0;
      }
      if (isArrayLike(collection)) {
        return isString(collection) ? stringSize(collection) : collection.length;
      }
      var tag = getTag(collection);
      if (tag == mapTag || tag == setTag) {
        return collection.size;
      }
      return baseKeys(collection).length;
    }

    /**
     * Checks if `predicate` returns truthy for **any** element of `collection`.
     * Iteration is stopped once `predicate` returns truthy. The predicate is
     * invoked with three arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var users = [
     *   { 'user': 'barney', 'active': true },
     *   { 'user': 'fred',   'active': false }
     * ];
     *
     * // The `_.matches` iteratee shorthand.
     * _.some(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.some(users, ['active', false]);
     * // => true
     *
     * // The `_.property` iteratee shorthand.
     * _.some(users, 'active');
     * // => true
     */
    function some(collection, predicate, guard) {
      var func = isArray(collection) ? arraySome : baseSome;
      if (guard && isIterateeCall(collection, predicate, guard)) {
        predicate = undefined;
      }
      return func(collection, getIteratee(predicate, 3));
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection thru each iteratee. This method
     * performs a stable sort, that is, it preserves the original sort order of
     * equal elements. The iteratees are invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {...(Function|Function[])} [iteratees=[_.identity]]
     *  The iteratees to sort by.
     * @returns {Array} Returns the new sorted array.
     * @example
     *
     * var users = [
     *   { 'user': 'fred',   'age': 48 },
     *   { 'user': 'barney', 'age': 36 },
     *   { 'user': 'fred',   'age': 40 },
     *   { 'user': 'barney', 'age': 34 }
     * ];
     *
     * _.sortBy(users, [function(o) { return o.user; }]);
     * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
     *
     * _.sortBy(users, ['user', 'age']);
     * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
     */
    var sortBy = baseRest(function(collection, iteratees) {
      if (collection == null) {
        return [];
      }
      var length = iteratees.length;
      if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
        iteratees = [];
      } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
        iteratees = [iteratees[0]];
      }
      return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
    });

    /*------------------------------------------------------------------------*/

    /**
     * Gets the timestamp of the number of milliseconds that have elapsed since
     * the Unix epoch (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Date
     * @returns {number} Returns the timestamp.
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => Logs the number of milliseconds it took for the deferred invocation.
     */
    var now = ctxNow || function() {
      return root.Date.now();
    };

    /*------------------------------------------------------------------------*/

    /**
     * The opposite of `_.before`; this method creates a function that invokes
     * `func` once it's called `n` or more times.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {number} n The number of calls before `func` is invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => Logs 'done saving!' after the two async saves have completed.
     */
    function after(n, func) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that invokes `func`, with up to `n` arguments,
     * ignoring any additional arguments.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} func The function to cap arguments for.
     * @param {number} [n=func.length] The arity cap.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the new capped function.
     * @example
     *
     * _.map(['6', '8', '10'], _.ary(parseInt, 1));
     * // => [6, 8, 10]
     */
    function ary(func, n, guard) {
      n = guard ? undefined : n;
      n = (func && n == null) ? func.length : n;
      return createWrap(func, WRAP_ARY_FLAG, undefined, undefined, undefined, undefined, n);
    }

    /**
     * Creates a function that invokes `func`, with the `this` binding and arguments
     * of the created function, while it's called less than `n` times. Subsequent
     * calls to the created function return the result of the last `func` invocation.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {number} n The number of calls at which `func` is no longer invoked.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * jQuery(element).on('click', _.before(5, addContactToList));
     * // => Allows adding up to 4 contacts to the list.
     */
    function before(n, func) {
      var result;
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = undefined;
        }
        return result;
      };
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of `thisArg`
     * and `partials` prepended to the arguments it receives.
     *
     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for partially applied arguments.
     *
     * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
     * property of bound functions.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to bind.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * function greet(greeting, punctuation) {
     *   return greeting + ' ' + this.user + punctuation;
     * }
     *
     * var object = { 'user': 'fred' };
     *
     * var bound = _.bind(greet, object, 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * // Bound with placeholders.
     * var bound = _.bind(greet, object, _, '!');
     * bound('hi');
     * // => 'hi fred!'
     */
    var bind = baseRest(function(func, thisArg, partials) {
      var bitmask = WRAP_BIND_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, getHolder(bind));
        bitmask |= WRAP_PARTIAL_FLAG;
      }
      return createWrap(func, bitmask, thisArg, partials, holders);
    });

    /**
     * Creates a function that invokes the method at `object[key]` with `partials`
     * prepended to the arguments it receives.
     *
     * This method differs from `_.bind` by allowing bound functions to reference
     * methods that may be redefined or don't yet exist. See
     * [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
     * for more details.
     *
     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * @static
     * @memberOf _
     * @since 0.10.0
     * @category Function
     * @param {Object} object The object to invoke the method on.
     * @param {string} key The key of the method.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'user': 'fred',
     *   'greet': function(greeting, punctuation) {
     *     return greeting + ' ' + this.user + punctuation;
     *   }
     * };
     *
     * var bound = _.bindKey(object, 'greet', 'hi');
     * bound('!');
     * // => 'hi fred!'
     *
     * object.greet = function(greeting, punctuation) {
     *   return greeting + 'ya ' + this.user + punctuation;
     * };
     *
     * bound('!');
     * // => 'hiya fred!'
     *
     * // Bound with placeholders.
     * var bound = _.bindKey(object, 'greet', _, '!');
     * bound('hi');
     * // => 'hiya fred!'
     */
    var bindKey = baseRest(function(object, key, partials) {
      var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
      if (partials.length) {
        var holders = replaceHolders(partials, getHolder(bindKey));
        bitmask |= WRAP_PARTIAL_FLAG;
      }
      return createWrap(key, bitmask, object, partials, holders);
    });

    /**
     * Creates a function that accepts arguments of `func` and either invokes
     * `func` returning its result, if at least `arity` number of arguments have
     * been provided, or returns a function that accepts the remaining `func`
     * arguments, and so on. The arity of `func` may be specified if `func.length`
     * is not sufficient.
     *
     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
     * may be used as a placeholder for provided arguments.
     *
     * **Note:** This method doesn't set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curry(abc);
     *
     * curried(1)(2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2)(3);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // Curried with placeholders.
     * curried(1)(_, 3)(2);
     * // => [1, 2, 3]
     */
    function curry(func, arity, guard) {
      arity = guard ? undefined : arity;
      var result = createWrap(func, WRAP_CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
      result.placeholder = curry.placeholder;
      return result;
    }

    /**
     * This method is like `_.curry` except that arguments are applied to `func`
     * in the manner of `_.partialRight` instead of `_.partial`.
     *
     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for provided arguments.
     *
     * **Note:** This method doesn't set the "length" property of curried functions.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
     *
     * var curried = _.curryRight(abc);
     *
     * curried(3)(2)(1);
     * // => [1, 2, 3]
     *
     * curried(2, 3)(1);
     * // => [1, 2, 3]
     *
     * curried(1, 2, 3);
     * // => [1, 2, 3]
     *
     * // Curried with placeholders.
     * curried(3)(1, _)(2);
     * // => [1, 2, 3]
     */
    function curryRight(func, arity, guard) {
      arity = guard ? undefined : arity;
      var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
      result.placeholder = curryRight.placeholder;
      return result;
    }

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed `func` invocations and a `flush` method to immediately invoke them.
     * Provide `options` to indicate whether `func` should be invoked on the
     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
     * with the last arguments provided to the debounced function. Subsequent
     * calls to the debounced function return the result of the last `func`
     * invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the debounced function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=false]
     *  Specify invoking on the leading edge of the timeout.
     * @param {number} [options.maxWait]
     *  The maximum time `func` is allowed to be delayed before it's invoked.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // Avoid costly calculations while the window size is in flux.
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
     * jQuery(element).on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', debounced);
     *
     * // Cancel the trailing debounced invocation.
     * jQuery(window).on('popstate', debounced.cancel);
     */
    function debounce(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }

      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            result = wait - timeSinceLastCall;

        return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
      }

      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }

      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
      }

      function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }

      function cancel() {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(now());
      }

      function debounced() {
        var time = now(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }

    /**
     * Defers invoking the `func` until the current call stack has cleared. Any
     * additional arguments are provided to `func` when it's invoked.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to defer.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) {
     *   console.log(text);
     * }, 'deferred');
     * // => Logs 'deferred' after one millisecond.
     */
    var defer = baseRest(function(func, args) {
      return baseDelay(func, 1, args);
    });

    /**
     * Invokes `func` after `wait` milliseconds. Any additional arguments are
     * provided to `func` when it's invoked.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay invocation.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) {
     *   console.log(text);
     * }, 1000, 'later');
     * // => Logs 'later' after one second.
     */
    var delay = baseRest(function(func, wait, args) {
      return baseDelay(func, toNumber(wait) || 0, args);
    });

    /**
     * Creates a function that invokes `func` with arguments reversed.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to flip arguments for.
     * @returns {Function} Returns the new flipped function.
     * @example
     *
     * var flipped = _.flip(function() {
     *   return _.toArray(arguments);
     * });
     *
     * flipped('a', 'b', 'c', 'd');
     * // => ['d', 'c', 'b', 'a']
     */
    function flip(func) {
      return createWrap(func, WRAP_FLIP_FLAG);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }

    // Expose `MapCache`.
    memoize.Cache = MapCache;

    /**
     * Creates a function that negates the result of the predicate `func`. The
     * `func` predicate is invoked with the `this` binding and arguments of the
     * created function.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} predicate The predicate to negate.
     * @returns {Function} Returns the new negated function.
     * @example
     *
     * function isEven(n) {
     *   return n % 2 == 0;
     * }
     *
     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
     * // => [1, 3, 5]
     */
    function negate(predicate) {
      if (typeof predicate != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      return function() {
        var args = arguments;
        switch (args.length) {
          case 0: return !predicate.call(this);
          case 1: return !predicate.call(this, args[0]);
          case 2: return !predicate.call(this, args[0], args[1]);
          case 3: return !predicate.call(this, args[0], args[1], args[2]);
        }
        return !predicate.apply(this, args);
      };
    }

    /**
     * Creates a function that is restricted to invoking `func` once. Repeat calls
     * to the function return the value of the first invocation. The `func` is
     * invoked with the `this` binding and arguments of the created function.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // => `createApplication` is invoked once
     */
    function once(func) {
      return before(2, func);
    }

    /**
     * Creates a function that invokes `func` with its arguments transformed.
     *
     * @static
     * @since 4.0.0
     * @memberOf _
     * @category Function
     * @param {Function} func The function to wrap.
     * @param {...(Function|Function[])} [transforms=[_.identity]]
     *  The argument transforms.
     * @returns {Function} Returns the new function.
     * @example
     *
     * function doubled(n) {
     *   return n * 2;
     * }
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var func = _.overArgs(function(x, y) {
     *   return [x, y];
     * }, [square, doubled]);
     *
     * func(9, 3);
     * // => [81, 6]
     *
     * func(10, 5);
     * // => [100, 10]
     */
    var overArgs = castRest(function(func, transforms) {
      transforms = (transforms.length == 1 && isArray(transforms[0]))
        ? arrayMap(transforms[0], baseUnary(getIteratee()))
        : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));

      var funcsLength = transforms.length;
      return baseRest(function(args) {
        var index = -1,
            length = nativeMin(args.length, funcsLength);

        while (++index < length) {
          args[index] = transforms[index].call(this, args[index]);
        }
        return apply(func, this, args);
      });
    });

    /**
     * Creates a function that invokes `func` with `partials` prepended to the
     * arguments it receives. This method is like `_.bind` except it does **not**
     * alter the `this` binding.
     *
     * The `_.partial.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method doesn't set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @since 0.2.0
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * function greet(greeting, name) {
     *   return greeting + ' ' + name;
     * }
     *
     * var sayHelloTo = _.partial(greet, 'hello');
     * sayHelloTo('fred');
     * // => 'hello fred'
     *
     * // Partially applied with placeholders.
     * var greetFred = _.partial(greet, _, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     */
    var partial = baseRest(function(func, partials) {
      var holders = replaceHolders(partials, getHolder(partial));
      return createWrap(func, WRAP_PARTIAL_FLAG, undefined, partials, holders);
    });

    /**
     * This method is like `_.partial` except that partially applied arguments
     * are appended to the arguments it receives.
     *
     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
     * builds, may be used as a placeholder for partially applied arguments.
     *
     * **Note:** This method doesn't set the "length" property of partially
     * applied functions.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Function
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [partials] The arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * function greet(greeting, name) {
     *   return greeting + ' ' + name;
     * }
     *
     * var greetFred = _.partialRight(greet, 'fred');
     * greetFred('hi');
     * // => 'hi fred'
     *
     * // Partially applied with placeholders.
     * var sayHelloTo = _.partialRight(greet, 'hello', _);
     * sayHelloTo('fred');
     * // => 'hello fred'
     */
    var partialRight = baseRest(function(func, partials) {
      var holders = replaceHolders(partials, getHolder(partialRight));
      return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined, partials, holders);
    });

    /**
     * Creates a function that invokes `func` with arguments arranged according
     * to the specified `indexes` where the argument value at the first index is
     * provided as the first argument, the argument value at the second index is
     * provided as the second argument, and so on.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Function
     * @param {Function} func The function to rearrange arguments for.
     * @param {...(number|number[])} indexes The arranged argument indexes.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var rearged = _.rearg(function(a, b, c) {
     *   return [a, b, c];
     * }, [2, 0, 1]);
     *
     * rearged('b', 'c', 'a')
     * // => ['a', 'b', 'c']
     */
    var rearg = flatRest(function(func, indexes) {
      return createWrap(func, WRAP_REARG_FLAG, undefined, undefined, undefined, indexes);
    });

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * created function and arguments from `start` and beyond provided as
     * an array.
     *
     * **Note:** This method is based on the
     * [rest parameter](https://mdn.io/rest_parameters).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.rest(function(what, names) {
     *   return what + ' ' + _.initial(names).join(', ') +
     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
     * });
     *
     * say('hello', 'fred', 'barney', 'pebbles');
     * // => 'hello fred, barney, & pebbles'
     */
    function rest(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = start === undefined ? start : toInteger(start);
      return baseRest(func, start);
    }

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * create function and an array of arguments much like
     * [`Function#apply`](http://www.ecma-international.org/ecma-262/7.0/#sec-function.prototype.apply).
     *
     * **Note:** This method is based on the
     * [spread operator](https://mdn.io/spread_operator).
     *
     * @static
     * @memberOf _
     * @since 3.2.0
     * @category Function
     * @param {Function} func The function to spread arguments over.
     * @param {number} [start=0] The start position of the spread.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.spread(function(who, what) {
     *   return who + ' says ' + what;
     * });
     *
     * say(['fred', 'hello']);
     * // => 'fred says hello'
     *
     * var numbers = Promise.all([
     *   Promise.resolve(40),
     *   Promise.resolve(36)
     * ]);
     *
     * numbers.then(_.spread(function(x, y) {
     *   return x + y;
     * }));
     * // => a Promise of 76
     */
    function spread(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = start == null ? 0 : nativeMax(toInteger(start), 0);
      return baseRest(function(args) {
        var array = args[start],
            otherArgs = castSlice(args, 0, start);

        if (array) {
          arrayPush(otherArgs, array);
        }
        return apply(func, this, otherArgs);
      });
    }

    /**
     * Creates a throttled function that only invokes `func` at most once per
     * every `wait` milliseconds. The throttled function comes with a `cancel`
     * method to cancel delayed `func` invocations and a `flush` method to
     * immediately invoke them. Provide `options` to indicate whether `func`
     * should be invoked on the leading and/or trailing edge of the `wait`
     * timeout. The `func` is invoked with the last arguments provided to the
     * throttled function. Subsequent calls to the throttled function return the
     * result of the last `func` invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the throttled function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.throttle` and `_.debounce`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to throttle.
     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=true]
     *  Specify invoking on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // Avoid excessively updating the position while scrolling.
     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
     *
     * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
     * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
     * jQuery(element).on('click', throttled);
     *
     * // Cancel the trailing throttled invocation.
     * jQuery(window).on('popstate', throttled.cancel);
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        'leading': leading,
        'maxWait': wait,
        'trailing': trailing
      });
    }

    /**
     * Creates a function that accepts up to one argument, ignoring any
     * additional arguments.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     * @example
     *
     * _.map(['6', '8', '10'], _.unary(parseInt));
     * // => [6, 8, 10]
     */
    function unary(func) {
      return ary(func, 1);
    }

    /**
     * Creates a function that provides `value` to `wrapper` as its first
     * argument. Any additional arguments provided to the function are appended
     * to those provided to the `wrapper`. The wrapper is invoked with the `this`
     * binding of the created function.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {*} value The value to wrap.
     * @param {Function} [wrapper=identity] The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('fred, barney, & pebbles');
     * // => '<p>fred, barney, &amp; pebbles</p>'
     */
    function wrap(value, wrapper) {
      return partial(castFunction(wrapper), value);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Casts `value` as an array if it's not one.
     *
     * @static
     * @memberOf _
     * @since 4.4.0
     * @category Lang
     * @param {*} value The value to inspect.
     * @returns {Array} Returns the cast array.
     * @example
     *
     * _.castArray(1);
     * // => [1]
     *
     * _.castArray({ 'a': 1 });
     * // => [{ 'a': 1 }]
     *
     * _.castArray('abc');
     * // => ['abc']
     *
     * _.castArray(null);
     * // => [null]
     *
     * _.castArray(undefined);
     * // => [undefined]
     *
     * _.castArray();
     * // => []
     *
     * var array = [1, 2, 3];
     * console.log(_.castArray(array) === array);
     * // => true
     */
    function castArray() {
      if (!arguments.length) {
        return [];
      }
      var value = arguments[0];
      return isArray(value) ? value : [value];
    }

    /**
     * Creates a shallow clone of `value`.
     *
     * **Note:** This method is loosely based on the
     * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
     * and supports cloning arrays, array buffers, booleans, date objects, maps,
     * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
     * arrays. The own enumerable properties of `arguments` objects are cloned
     * as plain objects. An empty object is returned for uncloneable values such
     * as error objects, functions, DOM nodes, and WeakMaps.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to clone.
     * @returns {*} Returns the cloned value.
     * @see _.cloneDeep
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var shallow = _.clone(objects);
     * console.log(shallow[0] === objects[0]);
     * // => true
     */
    function clone(value) {
      return baseClone(value, CLONE_SYMBOLS_FLAG);
    }

    /**
     * This method is like `_.clone` except that it accepts `customizer` which
     * is invoked to produce the cloned value. If `customizer` returns `undefined`,
     * cloning is handled by the method instead. The `customizer` is invoked with
     * up to four arguments; (value [, index|key, object, stack]).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to clone.
     * @param {Function} [customizer] The function to customize cloning.
     * @returns {*} Returns the cloned value.
     * @see _.cloneDeepWith
     * @example
     *
     * function customizer(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(false);
     *   }
     * }
     *
     * var el = _.cloneWith(document.body, customizer);
     *
     * console.log(el === document.body);
     * // => false
     * console.log(el.nodeName);
     * // => 'BODY'
     * console.log(el.childNodes.length);
     * // => 0
     */
    function cloneWith(value, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
    }

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
    }

    /**
     * This method is like `_.cloneWith` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @param {Function} [customizer] The function to customize cloning.
     * @returns {*} Returns the deep cloned value.
     * @see _.cloneWith
     * @example
     *
     * function customizer(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(true);
     *   }
     * }
     *
     * var el = _.cloneDeepWith(document.body, customizer);
     *
     * console.log(el === document.body);
     * // => false
     * console.log(el.nodeName);
     * // => 'BODY'
     * console.log(el.childNodes.length);
     * // => 20
     */
    function cloneDeepWith(value, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
    }

    /**
     * Checks if `object` conforms to `source` by invoking the predicate
     * properties of `source` with the corresponding property values of `object`.
     *
     * **Note:** This method is equivalent to `_.conforms` when `source` is
     * partially applied.
     *
     * @static
     * @memberOf _
     * @since 4.14.0
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property predicates to conform to.
     * @returns {boolean} Returns `true` if `object` conforms, else `false`.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     *
     * _.conformsTo(object, { 'b': function(n) { return n > 1; } });
     * // => true
     *
     * _.conformsTo(object, { 'b': function(n) { return n > 2; } });
     * // => false
     */
    function conformsTo(object, source) {
      return source == null || baseConformsTo(object, source, keys(source));
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Checks if `value` is greater than `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than `other`,
     *  else `false`.
     * @see _.lt
     * @example
     *
     * _.gt(3, 1);
     * // => true
     *
     * _.gt(3, 3);
     * // => false
     *
     * _.gt(1, 3);
     * // => false
     */
    var gt = createRelationalOperation(baseGt);

    /**
     * Checks if `value` is greater than or equal to `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is greater than or equal to
     *  `other`, else `false`.
     * @see _.lte
     * @example
     *
     * _.gte(3, 1);
     * // => true
     *
     * _.gte(3, 3);
     * // => true
     *
     * _.gte(1, 3);
     * // => false
     */
    var gte = createRelationalOperation(function(value, other) {
      return value >= other;
    });

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is classified as an `ArrayBuffer` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
     * @example
     *
     * _.isArrayBuffer(new ArrayBuffer(2));
     * // => true
     *
     * _.isArrayBuffer(new Array(2));
     * // => false
     */
    var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /**
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
     * @example
     *
     * _.isBoolean(false);
     * // => true
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        (isObjectLike(value) && baseGetTag(value) == boolTag);
    }

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /**
     * Checks if `value` is classified as a `Date` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     *
     * _.isDate('Mon April 23 2012');
     * // => false
     */
    var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;

    /**
     * Checks if `value` is likely a DOM element.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     *
     * _.isElement('<body>');
     * // => false
     */
    function isElement(value) {
      return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
    }

    /**
     * Checks if `value` is an empty object, collection, map, or set.
     *
     * Objects are considered empty if they have no own enumerable string keyed
     * properties.
     *
     * Array-like values such as `arguments` objects, arrays, buffers, strings, or
     * jQuery-like collections are considered empty if they have a `length` of `0`.
     * Similarly, maps and sets are considered empty if they have a `size` of `0`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty(null);
     * // => true
     *
     * _.isEmpty(true);
     * // => true
     *
     * _.isEmpty(1);
     * // => true
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({ 'a': 1 });
     * // => false
     */
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      if (isArrayLike(value) &&
          (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
            isBuffer(value) || isTypedArray(value) || isArguments(value))) {
        return !value.length;
      }
      var tag = getTag(value);
      if (tag == mapTag || tag == setTag) {
        return !value.size;
      }
      if (isPrototype(value)) {
        return !baseKeys(value).length;
      }
      for (var key in value) {
        if (hasOwnProperty.call(value, key)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are compared by strict equality, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }

    /**
     * This method is like `_.isEqual` except that it accepts `customizer` which
     * is invoked to compare values. If `customizer` returns `undefined`, comparisons
     * are handled by the method instead. The `customizer` is invoked with up to
     * six arguments: (objValue, othValue [, index|key, object, other, stack]).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * function isGreeting(value) {
     *   return /^h(?:i|ello)$/.test(value);
     * }
     *
     * function customizer(objValue, othValue) {
     *   if (isGreeting(objValue) && isGreeting(othValue)) {
     *     return true;
     *   }
     * }
     *
     * var array = ['hello', 'goodbye'];
     * var other = ['hi', 'goodbye'];
     *
     * _.isEqualWith(array, other, customizer);
     * // => true
     */
    function isEqualWith(value, other, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      var result = customizer ? customizer(value, other) : undefined;
      return result === undefined ? baseIsEqual(value, other, undefined, customizer) : !!result;
    }

    /**
     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
     * `SyntaxError`, `TypeError`, or `URIError` object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
     * @example
     *
     * _.isError(new Error);
     * // => true
     *
     * _.isError(Error);
     * // => false
     */
    function isError(value) {
      if (!isObjectLike(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == errorTag || tag == domExcTag ||
        (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
    }

    /**
     * Checks if `value` is a finite primitive number.
     *
     * **Note:** This method is based on
     * [`Number.isFinite`](https://mdn.io/Number/isFinite).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
     * @example
     *
     * _.isFinite(3);
     * // => true
     *
     * _.isFinite(Number.MIN_VALUE);
     * // => true
     *
     * _.isFinite(Infinity);
     * // => false
     *
     * _.isFinite('3');
     * // => false
     */
    function isFinite(value) {
      return typeof value == 'number' && nativeIsFinite(value);
    }

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /**
     * Checks if `value` is an integer.
     *
     * **Note:** This method is based on
     * [`Number.isInteger`](https://mdn.io/Number/isInteger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
     * @example
     *
     * _.isInteger(3);
     * // => true
     *
     * _.isInteger(Number.MIN_VALUE);
     * // => false
     *
     * _.isInteger(Infinity);
     * // => false
     *
     * _.isInteger('3');
     * // => false
     */
    function isInteger(value) {
      return typeof value == 'number' && value == toInteger(value);
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

    /**
     * Performs a partial deep comparison between `object` and `source` to
     * determine if `object` contains equivalent property values.
     *
     * **Note:** This method is equivalent to `_.matches` when `source` is
     * partially applied.
     *
     * Partial comparisons will match empty array and empty object `source`
     * values against any array or object value, respectively. See `_.isEqual`
     * for a list of supported value comparisons.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     *
     * _.isMatch(object, { 'b': 2 });
     * // => true
     *
     * _.isMatch(object, { 'b': 1 });
     * // => false
     */
    function isMatch(object, source) {
      return object === source || baseIsMatch(object, source, getMatchData(source));
    }

    /**
     * This method is like `_.isMatch` except that it accepts `customizer` which
     * is invoked to compare values. If `customizer` returns `undefined`, comparisons
     * are handled by the method instead. The `customizer` is invoked with five
     * arguments: (objValue, srcValue, index|key, object, source).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     * @example
     *
     * function isGreeting(value) {
     *   return /^h(?:i|ello)$/.test(value);
     * }
     *
     * function customizer(objValue, srcValue) {
     *   if (isGreeting(objValue) && isGreeting(srcValue)) {
     *     return true;
     *   }
     * }
     *
     * var object = { 'greeting': 'hello' };
     * var source = { 'greeting': 'hi' };
     *
     * _.isMatchWith(object, source, customizer);
     * // => true
     */
    function isMatchWith(object, source, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return baseIsMatch(object, source, getMatchData(source), customizer);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * **Note:** This method is based on
     * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
     * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
     * `undefined` and other non-number values.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // An `NaN` primitive is the only value that is not equal to itself.
      // Perform the `toStringTag` check first to avoid errors with some
      // ActiveX objects in IE.
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is a pristine native function.
     *
     * **Note:** This method can't reliably detect native functions in the presence
     * of the core-js package because core-js circumvents this kind of detection.
     * Despite multiple requests, the core-js maintainer has made it clear: any
     * attempt to fix the detection will be obstructed. As a result, we're left
     * with little choice but to throw an error. Unfortunately, this also affects
     * packages, like [babel-polyfill](https://www.npmjs.com/package/babel-polyfill),
     * which rely on core-js.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     * @example
     *
     * _.isNative(Array.prototype.push);
     * // => true
     *
     * _.isNative(_);
     * // => false
     */
    function isNative(value) {
      if (isMaskable(value)) {
        throw new Error(CORE_ERROR_TEXT);
      }
      return baseIsNative(value);
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(void 0);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is `null` or `undefined`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
     * @example
     *
     * _.isNil(null);
     * // => true
     *
     * _.isNil(void 0);
     * // => true
     *
     * _.isNil(NaN);
     * // => false
     */
    function isNil(value) {
      return value == null;
    }

    /**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
     * classified as numbers, use the `_.isFinite` method.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(3);
     * // => true
     *
     * _.isNumber(Number.MIN_VALUE);
     * // => true
     *
     * _.isNumber(Infinity);
     * // => true
     *
     * _.isNumber('3');
     * // => false
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        (isObjectLike(value) && baseGetTag(value) == numberTag);
    }

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString.call(Ctor) == objectCtorString;
    }

    /**
     * Checks if `value` is classified as a `RegExp` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
     * @example
     *
     * _.isRegExp(/abc/);
     * // => true
     *
     * _.isRegExp('/abc/');
     * // => false
     */
    var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

    /**
     * Checks if `value` is a safe integer. An integer is safe if it's an IEEE-754
     * double precision number which isn't the result of a rounded unsafe integer.
     *
     * **Note:** This method is based on
     * [`Number.isSafeInteger`](https://mdn.io/Number/isSafeInteger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a safe integer, else `false`.
     * @example
     *
     * _.isSafeInteger(3);
     * // => true
     *
     * _.isSafeInteger(Number.MIN_VALUE);
     * // => false
     *
     * _.isSafeInteger(Infinity);
     * // => false
     *
     * _.isSafeInteger('3');
     * // => false
     */
    function isSafeInteger(value) {
      return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' ||
        (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
    }

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     *
     * _.isUndefined(null);
     * // => false
     */
    function isUndefined(value) {
      return value === undefined;
    }

    /**
     * Checks if `value` is classified as a `WeakMap` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
     * @example
     *
     * _.isWeakMap(new WeakMap);
     * // => true
     *
     * _.isWeakMap(new Map);
     * // => false
     */
    function isWeakMap(value) {
      return isObjectLike(value) && getTag(value) == weakMapTag;
    }

    /**
     * Checks if `value` is classified as a `WeakSet` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a weak set, else `false`.
     * @example
     *
     * _.isWeakSet(new WeakSet);
     * // => true
     *
     * _.isWeakSet(new Set);
     * // => false
     */
    function isWeakSet(value) {
      return isObjectLike(value) && baseGetTag(value) == weakSetTag;
    }

    /**
     * Checks if `value` is less than `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than `other`,
     *  else `false`.
     * @see _.gt
     * @example
     *
     * _.lt(1, 3);
     * // => true
     *
     * _.lt(3, 3);
     * // => false
     *
     * _.lt(3, 1);
     * // => false
     */
    var lt = createRelationalOperation(baseLt);

    /**
     * Checks if `value` is less than or equal to `other`.
     *
     * @static
     * @memberOf _
     * @since 3.9.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if `value` is less than or equal to
     *  `other`, else `false`.
     * @see _.gte
     * @example
     *
     * _.lte(1, 3);
     * // => true
     *
     * _.lte(3, 3);
     * // => true
     *
     * _.lte(3, 1);
     * // => false
     */
    var lte = createRelationalOperation(function(value, other) {
      return value <= other;
    });

    /**
     * Converts `value` to an array.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Array} Returns the converted array.
     * @example
     *
     * _.toArray({ 'a': 1, 'b': 2 });
     * // => [1, 2]
     *
     * _.toArray('abc');
     * // => ['a', 'b', 'c']
     *
     * _.toArray(1);
     * // => []
     *
     * _.toArray(null);
     * // => []
     */
    function toArray(value) {
      if (!value) {
        return [];
      }
      if (isArrayLike(value)) {
        return isString(value) ? stringToArray(value) : copyArray(value);
      }
      if (symIterator && value[symIterator]) {
        return iteratorToArray(value[symIterator]());
      }
      var tag = getTag(value),
          func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);

      return func(value);
    }

    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger(value) {
      var result = toFinite(value),
          remainder = result % 1;

      return result === result ? (remainder ? result - remainder : result) : 0;
    }

    /**
     * Converts `value` to an integer suitable for use as the length of an
     * array-like object.
     *
     * **Note:** This method is based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toLength(3.2);
     * // => 3
     *
     * _.toLength(Number.MIN_VALUE);
     * // => 0
     *
     * _.toLength(Infinity);
     * // => 4294967295
     *
     * _.toLength('3.2');
     * // => 3
     */
    function toLength(value) {
      return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
    }

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    /**
     * Converts `value` to a plain object flattening inherited enumerable string
     * keyed properties of `value` to own properties of the plain object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Object} Returns the converted plain object.
     * @example
     *
     * function Foo() {
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.assign({ 'a': 1 }, new Foo);
     * // => { 'a': 1, 'b': 2 }
     *
     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
     * // => { 'a': 1, 'b': 2, 'c': 3 }
     */
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }

    /**
     * Converts `value` to a safe integer. A safe integer can be compared and
     * represented correctly.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toSafeInteger(3.2);
     * // => 3
     *
     * _.toSafeInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toSafeInteger(Infinity);
     * // => 9007199254740991
     *
     * _.toSafeInteger('3.2');
     * // => 3
     */
    function toSafeInteger(value) {
      return value
        ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER)
        : (value === 0 ? value : 0);
    }

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable string keyed properties of source objects to the
     * destination object. Source objects are applied from left to right.
     * Subsequent sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object` and is loosely based on
     * [`Object.assign`](https://mdn.io/Object/assign).
     *
     * @static
     * @memberOf _
     * @since 0.10.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.assignIn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * function Bar() {
     *   this.c = 3;
     * }
     *
     * Foo.prototype.b = 2;
     * Bar.prototype.d = 4;
     *
     * _.assign({ 'a': 0 }, new Foo, new Bar);
     * // => { 'a': 1, 'c': 3 }
     */
    var assign = createAssigner(function(object, source) {
      if (isPrototype(source) || isArrayLike(source)) {
        copyObject(source, keys(source), object);
        return;
      }
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          assignValue(object, key, source[key]);
        }
      }
    });

    /**
     * This method is like `_.assign` except that it iterates over own and
     * inherited source properties.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias extend
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.assign
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * function Bar() {
     *   this.c = 3;
     * }
     *
     * Foo.prototype.b = 2;
     * Bar.prototype.d = 4;
     *
     * _.assignIn({ 'a': 0 }, new Foo, new Bar);
     * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
     */
    var assignIn = createAssigner(function(object, source) {
      copyObject(source, keysIn(source), object);
    });

    /**
     * This method is like `_.assignIn` except that it accepts `customizer`
     * which is invoked to produce the assigned values. If `customizer` returns
     * `undefined`, assignment is handled by the method instead. The `customizer`
     * is invoked with five arguments: (objValue, srcValue, key, object, source).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias extendWith
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @see _.assignWith
     * @example
     *
     * function customizer(objValue, srcValue) {
     *   return _.isUndefined(objValue) ? srcValue : objValue;
     * }
     *
     * var defaults = _.partialRight(_.assignInWith, customizer);
     *
     * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
     * // => { 'a': 1, 'b': 2 }
     */
    var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
      copyObject(source, keysIn(source), object, customizer);
    });

    /**
     * This method is like `_.assign` except that it accepts `customizer`
     * which is invoked to produce the assigned values. If `customizer` returns
     * `undefined`, assignment is handled by the method instead. The `customizer`
     * is invoked with five arguments: (objValue, srcValue, key, object, source).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @see _.assignInWith
     * @example
     *
     * function customizer(objValue, srcValue) {
     *   return _.isUndefined(objValue) ? srcValue : objValue;
     * }
     *
     * var defaults = _.partialRight(_.assignWith, customizer);
     *
     * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
     * // => { 'a': 1, 'b': 2 }
     */
    var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
      copyObject(source, keys(source), object, customizer);
    });

    /**
     * Creates an array of values corresponding to `paths` of `object`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {...(string|string[])} [paths] The property paths to pick.
     * @returns {Array} Returns the picked values.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
     *
     * _.at(object, ['a[0].b.c', 'a[1]']);
     * // => [3, 4]
     */
    var at = flatRest(baseAt);

    /**
     * Creates an object that inherits from the `prototype` object. If a
     * `properties` object is given, its own enumerable string keyed properties
     * are assigned to the created object.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Object
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, {
     *   'constructor': Circle
     * });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties == null ? result : baseAssign(result, properties);
    }

    /**
     * Assigns own and inherited enumerable string keyed properties of source
     * objects to the destination object for all destination properties that
     * resolve to `undefined`. Source objects are applied from left to right.
     * Once a property is set, additional values of the same property are ignored.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.defaultsDeep
     * @example
     *
     * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
     * // => { 'a': 1, 'b': 2 }
     */
    var defaults = baseRest(function(args) {
      args.push(undefined, customDefaultsAssignIn);
      return apply(assignInWith, undefined, args);
    });

    /**
     * This method is like `_.defaults` except that it recursively assigns
     * default properties.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @see _.defaults
     * @example
     *
     * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
     * // => { 'a': { 'b': 2, 'c': 3 } }
     */
    var defaultsDeep = baseRest(function(args) {
      args.push(undefined, customDefaultsMerge);
      return apply(mergeWith, undefined, args);
    });

    /**
     * This method is like `_.find` except that it returns the key of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category Object
     * @param {Object} object The object to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {string|undefined} Returns the key of the matched element,
     *  else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findKey(users, function(o) { return o.age < 40; });
     * // => 'barney' (iteration order is not guaranteed)
     *
     * // The `_.matches` iteratee shorthand.
     * _.findKey(users, { 'age': 1, 'active': true });
     * // => 'pebbles'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findKey(users, ['active', false]);
     * // => 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.findKey(users, 'active');
     * // => 'barney'
     */
    function findKey(object, predicate) {
      return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements of
     * a collection in the opposite order.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Object
     * @param {Object} object The object to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {string|undefined} Returns the key of the matched element,
     *  else `undefined`.
     * @example
     *
     * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
     *
     * _.findLastKey(users, function(o) { return o.age < 40; });
     * // => returns 'pebbles' assuming `_.findKey` returns 'barney'
     *
     * // The `_.matches` iteratee shorthand.
     * _.findLastKey(users, { 'age': 36, 'active': true });
     * // => 'barney'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findLastKey(users, ['active', false]);
     * // => 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.findLastKey(users, 'active');
     * // => 'pebbles'
     */
    function findLastKey(object, predicate) {
      return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
    }

    /**
     * Iterates over own and inherited enumerable string keyed properties of an
     * object and invokes `iteratee` for each property. The iteratee is invoked
     * with three arguments: (value, key, object). Iteratee functions may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 0.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forInRight
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forIn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
     */
    function forIn(object, iteratee) {
      return object == null
        ? object
        : baseFor(object, getIteratee(iteratee, 3), keysIn);
    }

    /**
     * This method is like `_.forIn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forIn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forInRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'c', 'b', then 'a' assuming `_.forIn` logs 'a', 'b', then 'c'.
     */
    function forInRight(object, iteratee) {
      return object == null
        ? object
        : baseForRight(object, getIteratee(iteratee, 3), keysIn);
    }

    /**
     * Iterates over own enumerable string keyed properties of an object and
     * invokes `iteratee` for each property. The iteratee is invoked with three
     * arguments: (value, key, object). Iteratee functions may exit iteration
     * early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 0.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forOwnRight
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forOwn(object, iteratee) {
      return object && baseForOwn(object, getIteratee(iteratee, 3));
    }

    /**
     * This method is like `_.forOwn` except that it iterates over properties of
     * `object` in the opposite order.
     *
     * @static
     * @memberOf _
     * @since 2.0.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forOwn
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwnRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'b' then 'a' assuming `_.forOwn` logs 'a' then 'b'.
     */
    function forOwnRight(object, iteratee) {
      return object && baseForOwnRight(object, getIteratee(iteratee, 3));
    }

    /**
     * Creates an array of function property names from own enumerable properties
     * of `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns the function names.
     * @see _.functionsIn
     * @example
     *
     * function Foo() {
     *   this.a = _.constant('a');
     *   this.b = _.constant('b');
     * }
     *
     * Foo.prototype.c = _.constant('c');
     *
     * _.functions(new Foo);
     * // => ['a', 'b']
     */
    function functions(object) {
      return object == null ? [] : baseFunctions(object, keys(object));
    }

    /**
     * Creates an array of function property names from own and inherited
     * enumerable properties of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns the function names.
     * @see _.functions
     * @example
     *
     * function Foo() {
     *   this.a = _.constant('a');
     *   this.b = _.constant('b');
     * }
     *
     * Foo.prototype.c = _.constant('c');
     *
     * _.functionsIn(new Foo);
     * // => ['a', 'b', 'c']
     */
    function functionsIn(object) {
      return object == null ? [] : baseFunctions(object, keysIn(object));
    }

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    /**
     * Checks if `path` is a direct property of `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = { 'a': { 'b': 2 } };
     * var other = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.has(object, 'a');
     * // => true
     *
     * _.has(object, 'a.b');
     * // => true
     *
     * _.has(object, ['a', 'b']);
     * // => true
     *
     * _.has(other, 'a');
     * // => false
     */
    function has(object, path) {
      return object != null && hasPath(object, path, baseHas);
    }

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }

    /**
     * Creates an object composed of the inverted keys and values of `object`.
     * If `object` contains duplicate values, subsequent values overwrite
     * property assignments of previous values.
     *
     * @static
     * @memberOf _
     * @since 0.7.0
     * @category Object
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the new inverted object.
     * @example
     *
     * var object = { 'a': 1, 'b': 2, 'c': 1 };
     *
     * _.invert(object);
     * // => { '1': 'c', '2': 'b' }
     */
    var invert = createInverter(function(result, value, key) {
      result[value] = key;
    }, constant(identity));

    /**
     * This method is like `_.invert` except that the inverted object is generated
     * from the results of running each element of `object` thru `iteratee`. The
     * corresponding inverted value of each inverted key is an array of keys
     * responsible for generating the inverted value. The iteratee is invoked
     * with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.1.0
     * @category Object
     * @param {Object} object The object to invert.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {Object} Returns the new inverted object.
     * @example
     *
     * var object = { 'a': 1, 'b': 2, 'c': 1 };
     *
     * _.invertBy(object);
     * // => { '1': ['a', 'c'], '2': ['b'] }
     *
     * _.invertBy(object, function(value) {
     *   return 'group' + value;
     * });
     * // => { 'group1': ['a', 'c'], 'group2': ['b'] }
     */
    var invertBy = createInverter(function(result, value, key) {
      if (hasOwnProperty.call(result, value)) {
        result[value].push(key);
      } else {
        result[value] = [key];
      }
    }, getIteratee);

    /**
     * Invokes the method at `path` of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the method to invoke.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {*} Returns the result of the invoked method.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] };
     *
     * _.invoke(object, 'a[0].b.c.slice', 1, 3);
     * // => [2, 3]
     */
    var invoke = baseRest(baseInvoke);

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }

    /**
     * The opposite of `_.mapValues`; this method creates an object with the
     * same values as `object` and keys generated by running each own enumerable
     * string keyed property of `object` thru `iteratee`. The iteratee is invoked
     * with three arguments: (value, key, object).
     *
     * @static
     * @memberOf _
     * @since 3.8.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns the new mapped object.
     * @see _.mapValues
     * @example
     *
     * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
     *   return key + value;
     * });
     * // => { 'a1': 1, 'b2': 2 }
     */
    function mapKeys(object, iteratee) {
      var result = {};
      iteratee = getIteratee(iteratee, 3);

      baseForOwn(object, function(value, key, object) {
        baseAssignValue(result, iteratee(value, key, object), value);
      });
      return result;
    }

    /**
     * Creates an object with the same keys as `object` and values generated
     * by running each own enumerable string keyed property of `object` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns the new mapped object.
     * @see _.mapKeys
     * @example
     *
     * var users = {
     *   'fred':    { 'user': 'fred',    'age': 40 },
     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
     * };
     *
     * _.mapValues(users, function(o) { return o.age; });
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     *
     * // The `_.property` iteratee shorthand.
     * _.mapValues(users, 'age');
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     */
    function mapValues(object, iteratee) {
      var result = {};
      iteratee = getIteratee(iteratee, 3);

      baseForOwn(object, function(value, key, object) {
        baseAssignValue(result, key, iteratee(value, key, object));
      });
      return result;
    }

    /**
     * This method is like `_.assign` except that it recursively merges own and
     * inherited enumerable string keyed properties of source objects into the
     * destination object. Source properties that resolve to `undefined` are
     * skipped if a destination value exists. Array and plain object properties
     * are merged recursively. Other objects and value types are overridden by
     * assignment. Source objects are applied from left to right. Subsequent
     * sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {
     *   'a': [{ 'b': 2 }, { 'd': 4 }]
     * };
     *
     * var other = {
     *   'a': [{ 'c': 3 }, { 'e': 5 }]
     * };
     *
     * _.merge(object, other);
     * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
     */
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });

    /**
     * This method is like `_.merge` except that it accepts `customizer` which
     * is invoked to produce the merged values of the destination and source
     * properties. If `customizer` returns `undefined`, merging is handled by the
     * method instead. The `customizer` is invoked with six arguments:
     * (objValue, srcValue, key, object, source, stack).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} sources The source objects.
     * @param {Function} customizer The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function customizer(objValue, srcValue) {
     *   if (_.isArray(objValue)) {
     *     return objValue.concat(srcValue);
     *   }
     * }
     *
     * var object = { 'a': [1], 'b': [2] };
     * var other = { 'a': [3], 'b': [4] };
     *
     * _.mergeWith(object, other, customizer);
     * // => { 'a': [1, 3], 'b': [2, 4] }
     */
    var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
      baseMerge(object, source, srcIndex, customizer);
    });

    /**
     * The opposite of `_.pick`; this method creates an object composed of the
     * own and inherited enumerable property paths of `object` that are not omitted.
     *
     * **Note:** This method is considerably slower than `_.pick`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {...(string|string[])} [paths] The property paths to omit.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.omit(object, ['a', 'c']);
     * // => { 'b': '2' }
     */
    var omit = flatRest(function(object, paths) {
      var result = {};
      if (object == null) {
        return result;
      }
      var isDeep = false;
      paths = arrayMap(paths, function(path) {
        path = castPath(path, object);
        isDeep || (isDeep = path.length > 1);
        return path;
      });
      copyObject(object, getAllKeysIn(object), result);
      if (isDeep) {
        result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
      }
      var length = paths.length;
      while (length--) {
        baseUnset(result, paths[length]);
      }
      return result;
    });

    /**
     * The opposite of `_.pickBy`; this method creates an object composed of
     * the own and inherited enumerable string keyed properties of `object` that
     * `predicate` doesn't return truthy for. The predicate is invoked with two
     * arguments: (value, key).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The source object.
     * @param {Function} [predicate=_.identity] The function invoked per property.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.omitBy(object, _.isNumber);
     * // => { 'b': '2' }
     */
    function omitBy(object, predicate) {
      return pickBy(object, negate(getIteratee(predicate)));
    }

    /**
     * Creates an object composed of the picked `object` properties.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {...(string|string[])} [paths] The property paths to pick.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.pick(object, ['a', 'c']);
     * // => { 'a': 1, 'c': 3 }
     */
    var pick = flatRest(function(object, paths) {
      return object == null ? {} : basePick(object, paths);
    });

    /**
     * Creates an object composed of the `object` properties `predicate` returns
     * truthy for. The predicate is invoked with two arguments: (value, key).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The source object.
     * @param {Function} [predicate=_.identity] The function invoked per property.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.pickBy(object, _.isNumber);
     * // => { 'a': 1, 'c': 3 }
     */
    function pickBy(object, predicate) {
      if (object == null) {
        return {};
      }
      var props = arrayMap(getAllKeysIn(object), function(prop) {
        return [prop];
      });
      predicate = getIteratee(predicate);
      return basePickBy(object, props, function(value, path) {
        return predicate(value, path[0]);
      });
    }

    /**
     * This method is like `_.get` except that if the resolved value is a
     * function it's invoked with the `this` binding of its parent object and
     * its result is returned.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to resolve.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
     *
     * _.result(object, 'a[0].b.c1');
     * // => 3
     *
     * _.result(object, 'a[0].b.c2');
     * // => 4
     *
     * _.result(object, 'a[0].b.c3', 'default');
     * // => 'default'
     *
     * _.result(object, 'a[0].b.c3', _.constant('default'));
     * // => 'default'
     */
    function result(object, path, defaultValue) {
      path = castPath(path, object);

      var index = -1,
          length = path.length;

      // Ensure the loop is entered when path is empty.
      if (!length) {
        length = 1;
        object = undefined;
      }
      while (++index < length) {
        var value = object == null ? undefined : object[toKey(path[index])];
        if (value === undefined) {
          index = length;
          value = defaultValue;
        }
        object = isFunction(value) ? value.call(object) : value;
      }
      return object;
    }

    /**
     * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
     * it's created. Arrays are created for missing index properties while objects
     * are created for all other missing properties. Use `_.setWith` to customize
     * `path` creation.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.set(object, 'a[0].b.c', 4);
     * console.log(object.a[0].b.c);
     * // => 4
     *
     * _.set(object, ['x', '0', 'y', 'z'], 5);
     * console.log(object.x[0].y.z);
     * // => 5
     */
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }

    /**
     * This method is like `_.set` except that it accepts `customizer` which is
     * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
     * path creation is handled by the method instead. The `customizer` is invoked
     * with three arguments: (nsValue, key, nsObject).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {*} value The value to set.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {};
     *
     * _.setWith(object, '[0][1]', 'a', Object);
     * // => { '0': { '1': 'a' } }
     */
    function setWith(object, path, value, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return object == null ? object : baseSet(object, path, value, customizer);
    }

    /**
     * Creates an array of own enumerable string keyed-value pairs for `object`
     * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
     * entries are returned.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias entries
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the key-value pairs.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.toPairs(new Foo);
     * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
     */
    var toPairs = createToPairs(keys);

    /**
     * Creates an array of own and inherited enumerable string keyed-value pairs
     * for `object` which can be consumed by `_.fromPairs`. If `object` is a map
     * or set, its entries are returned.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @alias entriesIn
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the key-value pairs.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.toPairsIn(new Foo);
     * // => [['a', 1], ['b', 2], ['c', 3]] (iteration order is not guaranteed)
     */
    var toPairsIn = createToPairs(keysIn);

    /**
     * An alternative to `_.reduce`; this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable string keyed properties thru `iteratee`, with each invocation
     * potentially mutating the `accumulator` object. If `accumulator` is not
     * provided, a new object with the same `[[Prototype]]` will be used. The
     * iteratee is invoked with four arguments: (accumulator, value, key, object).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 1.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * _.transform([2, 3, 4], function(result, n) {
     *   result.push(n *= n);
     *   return n % 2 == 0;
     * }, []);
     * // => [4, 9]
     *
     * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
     *   (result[value] || (result[value] = [])).push(key);
     * }, {});
     * // => { '1': ['a', 'c'], '2': ['b'] }
     */
    function transform(object, iteratee, accumulator) {
      var isArr = isArray(object),
          isArrLike = isArr || isBuffer(object) || isTypedArray(object);

      iteratee = getIteratee(iteratee, 4);
      if (accumulator == null) {
        var Ctor = object && object.constructor;
        if (isArrLike) {
          accumulator = isArr ? new Ctor : [];
        }
        else if (isObject(object)) {
          accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
        }
        else {
          accumulator = {};
        }
      }
      (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
        return iteratee(accumulator, value, index, object);
      });
      return accumulator;
    }

    /**
     * Removes the property at `path` of `object`.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to unset.
     * @returns {boolean} Returns `true` if the property is deleted, else `false`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 7 } }] };
     * _.unset(object, 'a[0].b.c');
     * // => true
     *
     * console.log(object);
     * // => { 'a': [{ 'b': {} }] };
     *
     * _.unset(object, ['a', '0', 'b', 'c']);
     * // => true
     *
     * console.log(object);
     * // => { 'a': [{ 'b': {} }] };
     */
    function unset(object, path) {
      return object == null ? true : baseUnset(object, path);
    }

    /**
     * This method is like `_.set` except that accepts `updater` to produce the
     * value to set. Use `_.updateWith` to customize `path` creation. The `updater`
     * is invoked with one argument: (value).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.6.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {Function} updater The function to produce the updated value.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.update(object, 'a[0].b.c', function(n) { return n * n; });
     * console.log(object.a[0].b.c);
     * // => 9
     *
     * _.update(object, 'x[0].y.z', function(n) { return n ? n + 1 : 0; });
     * console.log(object.x[0].y.z);
     * // => 0
     */
    function update(object, path, updater) {
      return object == null ? object : baseUpdate(object, path, castFunction(updater));
    }

    /**
     * This method is like `_.update` except that it accepts `customizer` which is
     * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
     * path creation is handled by the method instead. The `customizer` is invoked
     * with three arguments: (nsValue, key, nsObject).
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 4.6.0
     * @category Object
     * @param {Object} object The object to modify.
     * @param {Array|string} path The path of the property to set.
     * @param {Function} updater The function to produce the updated value.
     * @param {Function} [customizer] The function to customize assigned values.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {};
     *
     * _.updateWith(object, '[0][1]', _.constant('a'), Object);
     * // => { '0': { '1': 'a' } }
     */
    function updateWith(object, path, updater, customizer) {
      customizer = typeof customizer == 'function' ? customizer : undefined;
      return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
    }

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object == null ? [] : baseValues(object, keys(object));
    }

    /**
     * Creates an array of the own and inherited enumerable string keyed property
     * values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.valuesIn(new Foo);
     * // => [1, 2, 3] (iteration order is not guaranteed)
     */
    function valuesIn(object) {
      return object == null ? [] : baseValues(object, keysIn(object));
    }

    /*------------------------------------------------------------------------*/

    /**
     * Clamps `number` within the inclusive `lower` and `upper` bounds.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Number
     * @param {number} number The number to clamp.
     * @param {number} [lower] The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the clamped number.
     * @example
     *
     * _.clamp(-10, -5, 5);
     * // => -5
     *
     * _.clamp(10, -5, 5);
     * // => 5
     */
    function clamp(number, lower, upper) {
      if (upper === undefined) {
        upper = lower;
        lower = undefined;
      }
      if (upper !== undefined) {
        upper = toNumber(upper);
        upper = upper === upper ? upper : 0;
      }
      if (lower !== undefined) {
        lower = toNumber(lower);
        lower = lower === lower ? lower : 0;
      }
      return baseClamp(toNumber(number), lower, upper);
    }

    /**
     * Checks if `n` is between `start` and up to, but not including, `end`. If
     * `end` is not specified, it's set to `start` with `start` then set to `0`.
     * If `start` is greater than `end` the params are swapped to support
     * negative ranges.
     *
     * @static
     * @memberOf _
     * @since 3.3.0
     * @category Number
     * @param {number} number The number to check.
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
     * @see _.range, _.rangeRight
     * @example
     *
     * _.inRange(3, 2, 4);
     * // => true
     *
     * _.inRange(4, 8);
     * // => true
     *
     * _.inRange(4, 2);
     * // => false
     *
     * _.inRange(2, 2);
     * // => false
     *
     * _.inRange(1.2, 2);
     * // => true
     *
     * _.inRange(5.2, 4);
     * // => false
     *
     * _.inRange(-3, -2, -6);
     * // => true
     */
    function inRange(number, start, end) {
      start = toFinite(start);
      if (end === undefined) {
        end = start;
        start = 0;
      } else {
        end = toFinite(end);
      }
      number = toNumber(number);
      return baseInRange(number, start, end);
    }

    /**
     * Produces a random number between the inclusive `lower` and `upper` bounds.
     * If only one argument is provided a number between `0` and the given number
     * is returned. If `floating` is `true`, or either `lower` or `upper` are
     * floats, a floating-point number is returned instead of an integer.
     *
     * **Note:** JavaScript follows the IEEE-754 standard for resolving
     * floating-point values which can produce unexpected results.
     *
     * @static
     * @memberOf _
     * @since 0.7.0
     * @category Number
     * @param {number} [lower=0] The lower bound.
     * @param {number} [upper=1] The upper bound.
     * @param {boolean} [floating] Specify returning a floating-point number.
     * @returns {number} Returns the random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(lower, upper, floating) {
      if (floating && typeof floating != 'boolean' && isIterateeCall(lower, upper, floating)) {
        upper = floating = undefined;
      }
      if (floating === undefined) {
        if (typeof upper == 'boolean') {
          floating = upper;
          upper = undefined;
        }
        else if (typeof lower == 'boolean') {
          floating = lower;
          lower = undefined;
        }
      }
      if (lower === undefined && upper === undefined) {
        lower = 0;
        upper = 1;
      }
      else {
        lower = toFinite(lower);
        if (upper === undefined) {
          upper = lower;
          lower = 0;
        } else {
          upper = toFinite(upper);
        }
      }
      if (lower > upper) {
        var temp = lower;
        lower = upper;
        upper = temp;
      }
      if (floating || lower % 1 || upper % 1) {
        var rand = nativeRandom();
        return nativeMin(lower + (rand * (upper - lower + freeParseFloat('1e-' + ((rand + '').length - 1)))), upper);
      }
      return baseRandom(lower, upper);
    }

    /*------------------------------------------------------------------------*/

    /**
     * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the camel cased string.
     * @example
     *
     * _.camelCase('Foo Bar');
     * // => 'fooBar'
     *
     * _.camelCase('--foo-bar--');
     * // => 'fooBar'
     *
     * _.camelCase('__FOO_BAR__');
     * // => 'fooBar'
     */
    var camelCase = createCompounder(function(result, word, index) {
      word = word.toLowerCase();
      return result + (index ? capitalize(word) : word);
    });

    /**
     * Converts the first character of `string` to upper case and the remaining
     * to lower case.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to capitalize.
     * @returns {string} Returns the capitalized string.
     * @example
     *
     * _.capitalize('FRED');
     * // => 'Fred'
     */
    function capitalize(string) {
      return upperFirst(toString(string).toLowerCase());
    }

    /**
     * Deburrs `string` by converting
     * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
     * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
     * letters to basic Latin letters and removing
     * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to deburr.
     * @returns {string} Returns the deburred string.
     * @example
     *
     * _.deburr('déjà vu');
     * // => 'deja vu'
     */
    function deburr(string) {
      string = toString(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
    }

    /**
     * Checks if `string` ends with the given target string.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {string} [target] The string to search for.
     * @param {number} [position=string.length] The position to search up to.
     * @returns {boolean} Returns `true` if `string` ends with `target`,
     *  else `false`.
     * @example
     *
     * _.endsWith('abc', 'c');
     * // => true
     *
     * _.endsWith('abc', 'b');
     * // => false
     *
     * _.endsWith('abc', 'b', 2);
     * // => true
     */
    function endsWith(string, target, position) {
      string = toString(string);
      target = baseToString(target);

      var length = string.length;
      position = position === undefined
        ? length
        : baseClamp(toInteger(position), 0, length);

      var end = position;
      position -= target.length;
      return position >= 0 && string.slice(position, end) == target;
    }

    /**
     * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
     * corresponding HTML entities.
     *
     * **Note:** No other characters are escaped. To escape additional
     * characters use a third-party library like [_he_](https://mths.be/he).
     *
     * Though the ">" character is escaped for symmetry, characters like
     * ">" and "/" don't need escaping in HTML and have no special meaning
     * unless they're part of a tag or unquoted attribute value. See
     * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
     * (under "semi-related fun fact") for more details.
     *
     * When working with HTML you should always
     * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
     * XSS vectors.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('fred, barney, & pebbles');
     * // => 'fred, barney, &amp; pebbles'
     */
    function escape(string) {
      string = toString(string);
      return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
    }

    /**
     * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
     * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escapeRegExp('[lodash](https://lodash.com/)');
     * // => '\[lodash\]\(https://lodash\.com/\)'
     */
    function escapeRegExp(string) {
      string = toString(string);
      return (string && reHasRegExpChar.test(string))
        ? string.replace(reRegExpChar, '\\$&')
        : string;
    }

    /**
     * Converts `string` to
     * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the kebab cased string.
     * @example
     *
     * _.kebabCase('Foo Bar');
     * // => 'foo-bar'
     *
     * _.kebabCase('fooBar');
     * // => 'foo-bar'
     *
     * _.kebabCase('__FOO_BAR__');
     * // => 'foo-bar'
     */
    var kebabCase = createCompounder(function(result, word, index) {
      return result + (index ? '-' : '') + word.toLowerCase();
    });

    /**
     * Converts `string`, as space separated words, to lower case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the lower cased string.
     * @example
     *
     * _.lowerCase('--Foo-Bar--');
     * // => 'foo bar'
     *
     * _.lowerCase('fooBar');
     * // => 'foo bar'
     *
     * _.lowerCase('__FOO_BAR__');
     * // => 'foo bar'
     */
    var lowerCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + word.toLowerCase();
    });

    /**
     * Converts the first character of `string` to lower case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.lowerFirst('Fred');
     * // => 'fred'
     *
     * _.lowerFirst('FRED');
     * // => 'fRED'
     */
    var lowerFirst = createCaseFirst('toLowerCase');

    /**
     * Pads `string` on the left and right sides if it's shorter than `length`.
     * Padding characters are truncated if they can't be evenly divided by `length`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.pad('abc', 8);
     * // => '  abc   '
     *
     * _.pad('abc', 8, '_-');
     * // => '_-abc_-_'
     *
     * _.pad('abc', 3);
     * // => 'abc'
     */
    function pad(string, length, chars) {
      string = toString(string);
      length = toInteger(length);

      var strLength = length ? stringSize(string) : 0;
      if (!length || strLength >= length) {
        return string;
      }
      var mid = (length - strLength) / 2;
      return (
        createPadding(nativeFloor(mid), chars) +
        string +
        createPadding(nativeCeil(mid), chars)
      );
    }

    /**
     * Pads `string` on the right side if it's shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padEnd('abc', 6);
     * // => 'abc   '
     *
     * _.padEnd('abc', 6, '_-');
     * // => 'abc_-_'
     *
     * _.padEnd('abc', 3);
     * // => 'abc'
     */
    function padEnd(string, length, chars) {
      string = toString(string);
      length = toInteger(length);

      var strLength = length ? stringSize(string) : 0;
      return (length && strLength < length)
        ? (string + createPadding(length - strLength, chars))
        : string;
    }

    /**
     * Pads `string` on the left side if it's shorter than `length`. Padding
     * characters are truncated if they exceed `length`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to pad.
     * @param {number} [length=0] The padding length.
     * @param {string} [chars=' '] The string used as padding.
     * @returns {string} Returns the padded string.
     * @example
     *
     * _.padStart('abc', 6);
     * // => '   abc'
     *
     * _.padStart('abc', 6, '_-');
     * // => '_-_abc'
     *
     * _.padStart('abc', 3);
     * // => 'abc'
     */
    function padStart(string, length, chars) {
      string = toString(string);
      length = toInteger(length);

      var strLength = length ? stringSize(string) : 0;
      return (length && strLength < length)
        ? (createPadding(length - strLength, chars) + string)
        : string;
    }

    /**
     * Converts `string` to an integer of the specified radix. If `radix` is
     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a
     * hexadecimal, in which case a `radix` of `16` is used.
     *
     * **Note:** This method aligns with the
     * [ES5 implementation](https://es5.github.io/#x15.1.2.2) of `parseInt`.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category String
     * @param {string} string The string to convert.
     * @param {number} [radix=10] The radix to interpret `value` by.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     *
     * _.map(['6', '08', '10'], _.parseInt);
     * // => [6, 8, 10]
     */
    function parseInt(string, radix, guard) {
      if (guard || radix == null) {
        radix = 0;
      } else if (radix) {
        radix = +radix;
      }
      return nativeParseInt(toString(string).replace(reTrimStart, ''), radix || 0);
    }

    /**
     * Repeats the given string `n` times.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to repeat.
     * @param {number} [n=1] The number of times to repeat the string.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the repeated string.
     * @example
     *
     * _.repeat('*', 3);
     * // => '***'
     *
     * _.repeat('abc', 2);
     * // => 'abcabc'
     *
     * _.repeat('abc', 0);
     * // => ''
     */
    function repeat(string, n, guard) {
      if ((guard ? isIterateeCall(string, n, guard) : n === undefined)) {
        n = 1;
      } else {
        n = toInteger(n);
      }
      return baseRepeat(toString(string), n);
    }

    /**
     * Replaces matches for `pattern` in `string` with `replacement`.
     *
     * **Note:** This method is based on
     * [`String#replace`](https://mdn.io/String/replace).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to modify.
     * @param {RegExp|string} pattern The pattern to replace.
     * @param {Function|string} replacement The match replacement.
     * @returns {string} Returns the modified string.
     * @example
     *
     * _.replace('Hi Fred', 'Fred', 'Barney');
     * // => 'Hi Barney'
     */
    function replace() {
      var args = arguments,
          string = toString(args[0]);

      return args.length < 3 ? string : string.replace(args[1], args[2]);
    }

    /**
     * Converts `string` to
     * [snake case](https://en.wikipedia.org/wiki/Snake_case).
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the snake cased string.
     * @example
     *
     * _.snakeCase('Foo Bar');
     * // => 'foo_bar'
     *
     * _.snakeCase('fooBar');
     * // => 'foo_bar'
     *
     * _.snakeCase('--FOO-BAR--');
     * // => 'foo_bar'
     */
    var snakeCase = createCompounder(function(result, word, index) {
      return result + (index ? '_' : '') + word.toLowerCase();
    });

    /**
     * Splits `string` by `separator`.
     *
     * **Note:** This method is based on
     * [`String#split`](https://mdn.io/String/split).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to split.
     * @param {RegExp|string} separator The separator pattern to split by.
     * @param {number} [limit] The length to truncate results to.
     * @returns {Array} Returns the string segments.
     * @example
     *
     * _.split('a-b-c', '-', 2);
     * // => ['a', 'b']
     */
    function split(string, separator, limit) {
      if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
        separator = limit = undefined;
      }
      limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;
      if (!limit) {
        return [];
      }
      string = toString(string);
      if (string && (
            typeof separator == 'string' ||
            (separator != null && !isRegExp(separator))
          )) {
        separator = baseToString(separator);
        if (!separator && hasUnicode(string)) {
          return castSlice(stringToArray(string), 0, limit);
        }
      }
      return string.split(separator, limit);
    }

    /**
     * Converts `string` to
     * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
     *
     * @static
     * @memberOf _
     * @since 3.1.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the start cased string.
     * @example
     *
     * _.startCase('--foo-bar--');
     * // => 'Foo Bar'
     *
     * _.startCase('fooBar');
     * // => 'Foo Bar'
     *
     * _.startCase('__FOO_BAR__');
     * // => 'FOO BAR'
     */
    var startCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + upperFirst(word);
    });

    /**
     * Checks if `string` starts with the given target string.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {string} [target] The string to search for.
     * @param {number} [position=0] The position to search from.
     * @returns {boolean} Returns `true` if `string` starts with `target`,
     *  else `false`.
     * @example
     *
     * _.startsWith('abc', 'a');
     * // => true
     *
     * _.startsWith('abc', 'b');
     * // => false
     *
     * _.startsWith('abc', 'b', 1);
     * // => true
     */
    function startsWith(string, target, position) {
      string = toString(string);
      position = position == null
        ? 0
        : baseClamp(toInteger(position), 0, string.length);

      target = baseToString(target);
      return string.slice(position, position + target.length) == target;
    }

    /**
     * Creates a compiled template function that can interpolate data properties
     * in "interpolate" delimiters, HTML-escape interpolated data properties in
     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
     * properties may be accessed as free variables in the template. If a setting
     * object is given, it takes precedence over `_.templateSettings` values.
     *
     * **Note:** In the development build `_.template` utilizes
     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
     * for easier debugging.
     *
     * For more information on precompiling templates see
     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
     *
     * For more information on Chrome extension sandboxes see
     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category String
     * @param {string} [string=''] The template string.
     * @param {Object} [options={}] The options object.
     * @param {RegExp} [options.escape=_.templateSettings.escape]
     *  The HTML "escape" delimiter.
     * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
     *  The "evaluate" delimiter.
     * @param {Object} [options.imports=_.templateSettings.imports]
     *  An object to import into the template as free variables.
     * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
     *  The "interpolate" delimiter.
     * @param {string} [options.sourceURL='lodash.templateSources[n]']
     *  The sourceURL of the compiled template.
     * @param {string} [options.variable='obj']
     *  The data object variable name.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Function} Returns the compiled template function.
     * @example
     *
     * // Use the "interpolate" delimiter to create a compiled template.
     * var compiled = _.template('hello <%= user %>!');
     * compiled({ 'user': 'fred' });
     * // => 'hello fred!'
     *
     * // Use the HTML "escape" delimiter to escape data property values.
     * var compiled = _.template('<b><%- value %></b>');
     * compiled({ 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // Use the internal `print` function in "evaluate" delimiters.
     * var compiled = _.template('<% print("hello " + user); %>!');
     * compiled({ 'user': 'barney' });
     * // => 'hello barney!'
     *
     * // Use the ES template literal delimiter as an "interpolate" delimiter.
     * // Disable support by replacing the "interpolate" delimiter.
     * var compiled = _.template('hello ${ user }!');
     * compiled({ 'user': 'pebbles' });
     * // => 'hello pebbles!'
     *
     * // Use backslashes to treat delimiters as plain text.
     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
     * compiled({ 'value': 'ignored' });
     * // => '<%- value %>'
     *
     * // Use the `imports` option to import `jQuery` as `jq`.
     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
     * compiled({ 'users': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // Use the `sourceURL` option to specify a custom sourceURL for the template.
     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
     *
     * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     * //   var __t, __p = '';
     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
     * //   return __p;
     * // }
     *
     * // Use custom template delimiters.
     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
     * var compiled = _.template('hello {{ user }}!');
     * compiled({ 'user': 'mustache' });
     * // => 'hello mustache!'
     *
     * // Use the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and stack traces.
     * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(string, options, guard) {
      // Based on John Resig's `tmpl` implementation
      // (http://ejohn.org/blog/javascript-micro-templating/)
      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
      var settings = lodash.templateSettings;

      if (guard && isIterateeCall(string, options, guard)) {
        options = undefined;
      }
      string = toString(string);
      options = assignInWith({}, options, settings, customDefaultsAssignIn);

      var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
          importsKeys = keys(imports),
          importsValues = baseValues(imports, importsKeys);

      var isEscaping,
          isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // Compile the regexp to match each delimiter.
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      // Use a sourceURL for easier debugging.
      var sourceURL = '//# sourceURL=' +
        ('sourceURL' in options
          ? options.sourceURL
          : ('lodash.templateSources[' + (++templateCounter) + ']')
        ) + '\n';

      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // Escape characters that can't be included in string literals.
        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // Replace delimiters with snippets.
        if (escapeValue) {
          isEscaping = true;
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // The JS engine embedded in Adobe products needs `match` returned in
        // order to produce the correct `offset` value.
        return match;
      });

      source += "';\n";

      // If `variable` is not specified wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain.
      var variable = options.variable;
      if (!variable) {
        source = 'with (obj) {\n' + source + '\n}\n';
      }
      // Cleanup code by stripping empty strings.
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // Frame code as the function body.
      source = 'function(' + (variable || 'obj') + ') {\n' +
        (variable
          ? ''
          : 'obj || (obj = {});\n'
        ) +
        "var __t, __p = ''" +
        (isEscaping
           ? ', __e = _.escape'
           : ''
        ) +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      var result = attempt(function() {
        return Function(importsKeys, sourceURL + 'return ' + source)
          .apply(undefined, importsValues);
      });

      // Provide the compiled function's source by its `toString` method or
      // the `source` property as a convenience for inlining compiled templates.
      result.source = source;
      if (isError(result)) {
        throw result;
      }
      return result;
    }

    /**
     * Converts `string`, as a whole, to lower case just like
     * [String#toLowerCase](https://mdn.io/toLowerCase).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the lower cased string.
     * @example
     *
     * _.toLower('--Foo-Bar--');
     * // => '--foo-bar--'
     *
     * _.toLower('fooBar');
     * // => 'foobar'
     *
     * _.toLower('__FOO_BAR__');
     * // => '__foo_bar__'
     */
    function toLower(value) {
      return toString(value).toLowerCase();
    }

    /**
     * Converts `string`, as a whole, to upper case just like
     * [String#toUpperCase](https://mdn.io/toUpperCase).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the upper cased string.
     * @example
     *
     * _.toUpper('--foo-bar--');
     * // => '--FOO-BAR--'
     *
     * _.toUpper('fooBar');
     * // => 'FOOBAR'
     *
     * _.toUpper('__foo_bar__');
     * // => '__FOO_BAR__'
     */
    function toUpper(value) {
      return toString(value).toUpperCase();
    }

    /**
     * Removes leading and trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trim('  abc  ');
     * // => 'abc'
     *
     * _.trim('-_-abc-_-', '_-');
     * // => 'abc'
     *
     * _.map(['  foo  ', '  bar  '], _.trim);
     * // => ['foo', 'bar']
     */
    function trim(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrim, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          chrSymbols = stringToArray(chars),
          start = charsStartIndex(strSymbols, chrSymbols),
          end = charsEndIndex(strSymbols, chrSymbols) + 1;

      return castSlice(strSymbols, start, end).join('');
    }

    /**
     * Removes trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimEnd('  abc  ');
     * // => '  abc'
     *
     * _.trimEnd('-_-abc-_-', '_-');
     * // => '-_-abc'
     */
    function trimEnd(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrimEnd, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;

      return castSlice(strSymbols, 0, end).join('');
    }

    /**
     * Removes leading whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trimStart('  abc  ');
     * // => 'abc  '
     *
     * _.trimStart('-_-abc-_-', '_-');
     * // => 'abc-_-'
     */
    function trimStart(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrimStart, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          start = charsStartIndex(strSymbols, stringToArray(chars));

      return castSlice(strSymbols, start).join('');
    }

    /**
     * Truncates `string` if it's longer than the given maximum string length.
     * The last characters of the truncated string are replaced with the omission
     * string which defaults to "...".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to truncate.
     * @param {Object} [options={}] The options object.
     * @param {number} [options.length=30] The maximum string length.
     * @param {string} [options.omission='...'] The string to indicate text is omitted.
     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
     * @returns {string} Returns the truncated string.
     * @example
     *
     * _.truncate('hi-diddly-ho there, neighborino');
     * // => 'hi-diddly-ho there, neighbo...'
     *
     * _.truncate('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': ' '
     * });
     * // => 'hi-diddly-ho there,...'
     *
     * _.truncate('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': /,? +/
     * });
     * // => 'hi-diddly-ho there...'
     *
     * _.truncate('hi-diddly-ho there, neighborino', {
     *   'omission': ' [...]'
     * });
     * // => 'hi-diddly-ho there, neig [...]'
     */
    function truncate(string, options) {
      var length = DEFAULT_TRUNC_LENGTH,
          omission = DEFAULT_TRUNC_OMISSION;

      if (isObject(options)) {
        var separator = 'separator' in options ? options.separator : separator;
        length = 'length' in options ? toInteger(options.length) : length;
        omission = 'omission' in options ? baseToString(options.omission) : omission;
      }
      string = toString(string);

      var strLength = string.length;
      if (hasUnicode(string)) {
        var strSymbols = stringToArray(string);
        strLength = strSymbols.length;
      }
      if (length >= strLength) {
        return string;
      }
      var end = length - stringSize(omission);
      if (end < 1) {
        return omission;
      }
      var result = strSymbols
        ? castSlice(strSymbols, 0, end).join('')
        : string.slice(0, end);

      if (separator === undefined) {
        return result + omission;
      }
      if (strSymbols) {
        end += (result.length - end);
      }
      if (isRegExp(separator)) {
        if (string.slice(end).search(separator)) {
          var match,
              substring = result;

          if (!separator.global) {
            separator = RegExp(separator.source, toString(reFlags.exec(separator)) + 'g');
          }
          separator.lastIndex = 0;
          while ((match = separator.exec(substring))) {
            var newEnd = match.index;
          }
          result = result.slice(0, newEnd === undefined ? end : newEnd);
        }
      } else if (string.indexOf(baseToString(separator), end) != end) {
        var index = result.lastIndexOf(separator);
        if (index > -1) {
          result = result.slice(0, index);
        }
      }
      return result + omission;
    }

    /**
     * The inverse of `_.escape`; this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to
     * their corresponding characters.
     *
     * **Note:** No other HTML entities are unescaped. To unescape additional
     * HTML entities use a third-party library like [_he_](https://mths.be/he).
     *
     * @static
     * @memberOf _
     * @since 0.6.0
     * @category String
     * @param {string} [string=''] The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('fred, barney, &amp; pebbles');
     * // => 'fred, barney, & pebbles'
     */
    function unescape(string) {
      string = toString(string);
      return (string && reHasEscapedHtml.test(string))
        ? string.replace(reEscapedHtml, unescapeHtmlChar)
        : string;
    }

    /**
     * Converts `string`, as space separated words, to upper case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the upper cased string.
     * @example
     *
     * _.upperCase('--foo-bar');
     * // => 'FOO BAR'
     *
     * _.upperCase('fooBar');
     * // => 'FOO BAR'
     *
     * _.upperCase('__foo_bar__');
     * // => 'FOO BAR'
     */
    var upperCase = createCompounder(function(result, word, index) {
      return result + (index ? ' ' : '') + word.toUpperCase();
    });

    /**
     * Converts the first character of `string` to upper case.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category String
     * @param {string} [string=''] The string to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.upperFirst('fred');
     * // => 'Fred'
     *
     * _.upperFirst('FRED');
     * // => 'FRED'
     */
    var upperFirst = createCaseFirst('toUpperCase');

    /**
     * Splits `string` into an array of its words.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to inspect.
     * @param {RegExp|string} [pattern] The pattern to match words.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {Array} Returns the words of `string`.
     * @example
     *
     * _.words('fred, barney, & pebbles');
     * // => ['fred', 'barney', 'pebbles']
     *
     * _.words('fred, barney, & pebbles', /[^, ]+/g);
     * // => ['fred', 'barney', '&', 'pebbles']
     */
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? undefined : pattern;

      if (pattern === undefined) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }

    /*------------------------------------------------------------------------*/

    /**
     * Attempts to invoke `func`, returning either the result or the caught error
     * object. Any additional arguments are provided to `func` when it's invoked.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {Function} func The function to attempt.
     * @param {...*} [args] The arguments to invoke `func` with.
     * @returns {*} Returns the `func` result or error object.
     * @example
     *
     * // Avoid throwing errors for invalid selectors.
     * var elements = _.attempt(function(selector) {
     *   return document.querySelectorAll(selector);
     * }, '>_>');
     *
     * if (_.isError(elements)) {
     *   elements = [];
     * }
     */
    var attempt = baseRest(function(func, args) {
      try {
        return apply(func, undefined, args);
      } catch (e) {
        return isError(e) ? e : new Error(e);
      }
    });

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method.
     *
     * **Note:** This method doesn't set the "length" property of bound functions.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...(string|string[])} methodNames The object method names to bind.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'click': function() {
     *     console.log('clicked ' + this.label);
     *   }
     * };
     *
     * _.bindAll(view, ['click']);
     * jQuery(element).on('click', view.click);
     * // => Logs 'clicked docs' when clicked.
     */
    var bindAll = flatRest(function(object, methodNames) {
      arrayEach(methodNames, function(key) {
        key = toKey(key);
        baseAssignValue(object, key, bind(object[key], object));
      });
      return object;
    });

    /**
     * Creates a function that iterates over `pairs` and invokes the corresponding
     * function of the first predicate to return truthy. The predicate-function
     * pairs are invoked with the `this` binding and arguments of the created
     * function.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {Array} pairs The predicate-function pairs.
     * @returns {Function} Returns the new composite function.
     * @example
     *
     * var func = _.cond([
     *   [_.matches({ 'a': 1 }),           _.constant('matches A')],
     *   [_.conforms({ 'b': _.isNumber }), _.constant('matches B')],
     *   [_.stubTrue,                      _.constant('no match')]
     * ]);
     *
     * func({ 'a': 1, 'b': 2 });
     * // => 'matches A'
     *
     * func({ 'a': 0, 'b': 1 });
     * // => 'matches B'
     *
     * func({ 'a': '1', 'b': '2' });
     * // => 'no match'
     */
    function cond(pairs) {
      var length = pairs == null ? 0 : pairs.length,
          toIteratee = getIteratee();

      pairs = !length ? [] : arrayMap(pairs, function(pair) {
        if (typeof pair[1] != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        return [toIteratee(pair[0]), pair[1]];
      });

      return baseRest(function(args) {
        var index = -1;
        while (++index < length) {
          var pair = pairs[index];
          if (apply(pair[0], this, args)) {
            return apply(pair[1], this, args);
          }
        }
      });
    }

    /**
     * Creates a function that invokes the predicate properties of `source` with
     * the corresponding property values of a given object, returning `true` if
     * all predicates return truthy, else `false`.
     *
     * **Note:** The created function is equivalent to `_.conformsTo` with
     * `source` partially applied.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {Object} source The object of property predicates to conform to.
     * @returns {Function} Returns the new spec function.
     * @example
     *
     * var objects = [
     *   { 'a': 2, 'b': 1 },
     *   { 'a': 1, 'b': 2 }
     * ];
     *
     * _.filter(objects, _.conforms({ 'b': function(n) { return n > 1; } }));
     * // => [{ 'a': 1, 'b': 2 }]
     */
    function conforms(source) {
      return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
    }

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Checks `value` to determine whether a default value should be returned in
     * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
     * or `undefined`.
     *
     * @static
     * @memberOf _
     * @since 4.14.0
     * @category Util
     * @param {*} value The value to check.
     * @param {*} defaultValue The default value.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * _.defaultTo(1, 10);
     * // => 1
     *
     * _.defaultTo(undefined, 10);
     * // => 10
     */
    function defaultTo(value, defaultValue) {
      return (value == null || value !== value) ? defaultValue : value;
    }

    /**
     * Creates a function that returns the result of invoking the given functions
     * with the `this` binding of the created function, where each successive
     * invocation is supplied the return value of the previous.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {...(Function|Function[])} [funcs] The functions to invoke.
     * @returns {Function} Returns the new composite function.
     * @see _.flowRight
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flow([_.add, square]);
     * addSquare(1, 2);
     * // => 9
     */
    var flow = createFlow();

    /**
     * This method is like `_.flow` except that it creates a function that
     * invokes the given functions from right to left.
     *
     * @static
     * @since 3.0.0
     * @memberOf _
     * @category Util
     * @param {...(Function|Function[])} [funcs] The functions to invoke.
     * @returns {Function} Returns the new composite function.
     * @see _.flow
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * var addSquare = _.flowRight([square, _.add]);
     * addSquare(1, 2);
     * // => 9
     */
    var flowRight = createFlow(true);

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Creates a function that invokes `func` with the arguments of the created
     * function. If `func` is a property name, the created function returns the
     * property value for a given element. If `func` is an array or object, the
     * created function returns `true` for elements that contain the equivalent
     * source properties, otherwise it returns `false`.
     *
     * @static
     * @since 4.0.0
     * @memberOf _
     * @category Util
     * @param {*} [func=_.identity] The value to convert to a callback.
     * @returns {Function} Returns the callback.
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * // The `_.matches` iteratee shorthand.
     * _.filter(users, _.iteratee({ 'user': 'barney', 'active': true }));
     * // => [{ 'user': 'barney', 'age': 36, 'active': true }]
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.filter(users, _.iteratee(['user', 'fred']));
     * // => [{ 'user': 'fred', 'age': 40 }]
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, _.iteratee('user'));
     * // => ['barney', 'fred']
     *
     * // Create custom iteratee shorthands.
     * _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
     *   return !_.isRegExp(func) ? iteratee(func) : function(string) {
     *     return func.test(string);
     *   };
     * });
     *
     * _.filter(['abc', 'def'], /ef/);
     * // => ['def']
     */
    function iteratee(func) {
      return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
    }

    /**
     * Creates a function that performs a partial deep comparison between a given
     * object and `source`, returning `true` if the given object has equivalent
     * property values, else `false`.
     *
     * **Note:** The created function is equivalent to `_.isMatch` with `source`
     * partially applied.
     *
     * Partial comparisons will match empty array and empty object `source`
     * values against any array or object value, respectively. See `_.isEqual`
     * for a list of supported value comparisons.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     * @example
     *
     * var objects = [
     *   { 'a': 1, 'b': 2, 'c': 3 },
     *   { 'a': 4, 'b': 5, 'c': 6 }
     * ];
     *
     * _.filter(objects, _.matches({ 'a': 4, 'c': 6 }));
     * // => [{ 'a': 4, 'b': 5, 'c': 6 }]
     */
    function matches(source) {
      return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
    }

    /**
     * Creates a function that performs a partial deep comparison between the
     * value at `path` of a given object to `srcValue`, returning `true` if the
     * object value is equivalent, else `false`.
     *
     * **Note:** Partial comparisons will match empty array and empty object
     * `srcValue` values against any array or object value, respectively. See
     * `_.isEqual` for a list of supported value comparisons.
     *
     * @static
     * @memberOf _
     * @since 3.2.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     * @example
     *
     * var objects = [
     *   { 'a': 1, 'b': 2, 'c': 3 },
     *   { 'a': 4, 'b': 5, 'c': 6 }
     * ];
     *
     * _.find(objects, _.matchesProperty('a', 4));
     * // => { 'a': 4, 'b': 5, 'c': 6 }
     */
    function matchesProperty(path, srcValue) {
      return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
    }

    /**
     * Creates a function that invokes the method at `path` of a given object.
     * Any additional arguments are provided to the invoked method.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Util
     * @param {Array|string} path The path of the method to invoke.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Function} Returns the new invoker function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': _.constant(2) } },
     *   { 'a': { 'b': _.constant(1) } }
     * ];
     *
     * _.map(objects, _.method('a.b'));
     * // => [2, 1]
     *
     * _.map(objects, _.method(['a', 'b']));
     * // => [2, 1]
     */
    var method = baseRest(function(path, args) {
      return function(object) {
        return baseInvoke(object, path, args);
      };
    });

    /**
     * The opposite of `_.method`; this method creates a function that invokes
     * the method at a given path of `object`. Any additional arguments are
     * provided to the invoked method.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Util
     * @param {Object} object The object to query.
     * @param {...*} [args] The arguments to invoke the method with.
     * @returns {Function} Returns the new invoker function.
     * @example
     *
     * var array = _.times(3, _.constant),
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.methodOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
     * // => [2, 0]
     */
    var methodOf = baseRest(function(object, args) {
      return function(path) {
        return baseInvoke(object, path, args);
      };
    });

    /**
     * Adds all own enumerable string keyed function properties of a source
     * object to the destination object. If `object` is a function, then methods
     * are added to its prototype as well.
     *
     * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
     * avoid conflicts caused by modifying the original.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {Function|Object} [object=lodash] The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
     * @returns {Function|Object} Returns `object`.
     * @example
     *
     * function vowels(string) {
     *   return _.filter(string, function(v) {
     *     return /[aeiou]/i.test(v);
     *   });
     * }
     *
     * _.mixin({ 'vowels': vowels });
     * _.vowels('fred');
     * // => ['e']
     *
     * _('fred').vowels().value();
     * // => ['e']
     *
     * _.mixin({ 'vowels': vowels }, { 'chain': false });
     * _('fred').vowels();
     * // => ['e']
     */
    function mixin(object, source, options) {
      var props = keys(source),
          methodNames = baseFunctions(source, props);

      if (options == null &&
          !(isObject(source) && (methodNames.length || !props.length))) {
        options = source;
        source = object;
        object = this;
        methodNames = baseFunctions(source, keys(source));
      }
      var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
          isFunc = isFunction(object);

      arrayEach(methodNames, function(methodName) {
        var func = source[methodName];
        object[methodName] = func;
        if (isFunc) {
          object.prototype[methodName] = function() {
            var chainAll = this.__chain__;
            if (chain || chainAll) {
              var result = object(this.__wrapped__),
                  actions = result.__actions__ = copyArray(this.__actions__);

              actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
              result.__chain__ = chainAll;
              return result;
            }
            return func.apply(object, arrayPush([this.value()], arguments));
          };
        }
      });

      return object;
    }

    /**
     * Reverts the `_` variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      if (root._ === this) {
        root._ = oldDash;
      }
      return this;
    }

    /**
     * This method returns `undefined`.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Util
     * @example
     *
     * _.times(2, _.noop);
     * // => [undefined, undefined]
     */
    function noop() {
      // No operation performed.
    }

    /**
     * Creates a function that gets the argument at index `n`. If `n` is negative,
     * the nth argument from the end is returned.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {number} [n=0] The index of the argument to return.
     * @returns {Function} Returns the new pass-thru function.
     * @example
     *
     * var func = _.nthArg(1);
     * func('a', 'b', 'c', 'd');
     * // => 'b'
     *
     * var func = _.nthArg(-2);
     * func('a', 'b', 'c', 'd');
     * // => 'c'
     */
    function nthArg(n) {
      n = toInteger(n);
      return baseRest(function(args) {
        return baseNth(args, n);
      });
    }

    /**
     * Creates a function that invokes `iteratees` with the arguments it receives
     * and returns their results.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {...(Function|Function[])} [iteratees=[_.identity]]
     *  The iteratees to invoke.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var func = _.over([Math.max, Math.min]);
     *
     * func(1, 2, 3, 4);
     * // => [4, 1]
     */
    var over = createOver(arrayMap);

    /**
     * Creates a function that checks if **all** of the `predicates` return
     * truthy when invoked with the arguments it receives.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {...(Function|Function[])} [predicates=[_.identity]]
     *  The predicates to check.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var func = _.overEvery([Boolean, isFinite]);
     *
     * func('1');
     * // => true
     *
     * func(null);
     * // => false
     *
     * func(NaN);
     * // => false
     */
    var overEvery = createOver(arrayEvery);

    /**
     * Creates a function that checks if **any** of the `predicates` return
     * truthy when invoked with the arguments it receives.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {...(Function|Function[])} [predicates=[_.identity]]
     *  The predicates to check.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var func = _.overSome([Boolean, isFinite]);
     *
     * func('1');
     * // => true
     *
     * func(null);
     * // => true
     *
     * func(NaN);
     * // => false
     */
    var overSome = createOver(arraySome);

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }

    /**
     * The opposite of `_.property`; this method creates a function that returns
     * the value at a given path of `object`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Util
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var array = [0, 1, 2],
     *     object = { 'a': array, 'b': array, 'c': array };
     *
     * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
     * // => [2, 0]
     *
     * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
     * // => [2, 0]
     */
    function propertyOf(object) {
      return function(path) {
        return object == null ? undefined : baseGet(object, path);
      };
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to, but not including, `end`. A step of `-1` is used if a negative
     * `start` is specified without an `end` or `step`. If `end` is not specified,
     * it's set to `start` with `start` then set to `0`.
     *
     * **Note:** JavaScript follows the IEEE-754 standard for resolving
     * floating-point values which can produce unexpected results.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns the range of numbers.
     * @see _.inRange, _.rangeRight
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(-4);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    var range = createRange();

    /**
     * This method is like `_.range` except that it populates values in
     * descending order.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns the range of numbers.
     * @see _.inRange, _.range
     * @example
     *
     * _.rangeRight(4);
     * // => [3, 2, 1, 0]
     *
     * _.rangeRight(-4);
     * // => [-3, -2, -1, 0]
     *
     * _.rangeRight(1, 5);
     * // => [4, 3, 2, 1]
     *
     * _.rangeRight(0, 20, 5);
     * // => [15, 10, 5, 0]
     *
     * _.rangeRight(0, -4, -1);
     * // => [-3, -2, -1, 0]
     *
     * _.rangeRight(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.rangeRight(0);
     * // => []
     */
    var rangeRight = createRange(true);

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    /**
     * This method returns a new empty object.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Object} Returns the new empty object.
     * @example
     *
     * var objects = _.times(2, _.stubObject);
     *
     * console.log(objects);
     * // => [{}, {}]
     *
     * console.log(objects[0] === objects[1]);
     * // => false
     */
    function stubObject() {
      return {};
    }

    /**
     * This method returns an empty string.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {string} Returns the empty string.
     * @example
     *
     * _.times(2, _.stubString);
     * // => ['', '']
     */
    function stubString() {
      return '';
    }

    /**
     * This method returns `true`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `true`.
     * @example
     *
     * _.times(2, _.stubTrue);
     * // => [true, true]
     */
    function stubTrue() {
      return true;
    }

    /**
     * Invokes the iteratee `n` times, returning an array of the results of
     * each invocation. The iteratee is invoked with one argument; (index).
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     * @example
     *
     * _.times(3, String);
     * // => ['0', '1', '2']
     *
     *  _.times(4, _.constant(0));
     * // => [0, 0, 0, 0]
     */
    function times(n, iteratee) {
      n = toInteger(n);
      if (n < 1 || n > MAX_SAFE_INTEGER) {
        return [];
      }
      var index = MAX_ARRAY_LENGTH,
          length = nativeMin(n, MAX_ARRAY_LENGTH);

      iteratee = getIteratee(iteratee);
      n -= MAX_ARRAY_LENGTH;

      var result = baseTimes(length, iteratee);
      while (++index < n) {
        iteratee(index);
      }
      return result;
    }

    /**
     * Converts `value` to a property path array.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Util
     * @param {*} value The value to convert.
     * @returns {Array} Returns the new property path array.
     * @example
     *
     * _.toPath('a.b.c');
     * // => ['a', 'b', 'c']
     *
     * _.toPath('a[0].b.c');
     * // => ['a', '0', 'b', 'c']
     */
    function toPath(value) {
      if (isArray(value)) {
        return arrayMap(value, toKey);
      }
      return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
    }

    /**
     * Generates a unique ID. If `prefix` is given, the ID is appended to it.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {string} [prefix=''] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return toString(prefix) + id;
    }

    /*------------------------------------------------------------------------*/

    /**
     * Adds two numbers.
     *
     * @static
     * @memberOf _
     * @since 3.4.0
     * @category Math
     * @param {number} augend The first number in an addition.
     * @param {number} addend The second number in an addition.
     * @returns {number} Returns the total.
     * @example
     *
     * _.add(6, 4);
     * // => 10
     */
    var add = createMathOperation(function(augend, addend) {
      return augend + addend;
    }, 0);

    /**
     * Computes `number` rounded up to `precision`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Math
     * @param {number} number The number to round up.
     * @param {number} [precision=0] The precision to round up to.
     * @returns {number} Returns the rounded up number.
     * @example
     *
     * _.ceil(4.006);
     * // => 5
     *
     * _.ceil(6.004, 2);
     * // => 6.01
     *
     * _.ceil(6040, -2);
     * // => 6100
     */
    var ceil = createRound('ceil');

    /**
     * Divide two numbers.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Math
     * @param {number} dividend The first number in a division.
     * @param {number} divisor The second number in a division.
     * @returns {number} Returns the quotient.
     * @example
     *
     * _.divide(6, 4);
     * // => 1.5
     */
    var divide = createMathOperation(function(dividend, divisor) {
      return dividend / divisor;
    }, 1);

    /**
     * Computes `number` rounded down to `precision`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Math
     * @param {number} number The number to round down.
     * @param {number} [precision=0] The precision to round down to.
     * @returns {number} Returns the rounded down number.
     * @example
     *
     * _.floor(4.006);
     * // => 4
     *
     * _.floor(0.046, 2);
     * // => 0.04
     *
     * _.floor(4060, -2);
     * // => 4000
     */
    var floor = createRound('floor');

    /**
     * Computes the maximum value of `array`. If `array` is empty or falsey,
     * `undefined` is returned.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * _.max([]);
     * // => undefined
     */
    function max(array) {
      return (array && array.length)
        ? baseExtremum(array, identity, baseGt)
        : undefined;
    }

    /**
     * This method is like `_.max` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * the value is ranked. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * var objects = [{ 'n': 1 }, { 'n': 2 }];
     *
     * _.maxBy(objects, function(o) { return o.n; });
     * // => { 'n': 2 }
     *
     * // The `_.property` iteratee shorthand.
     * _.maxBy(objects, 'n');
     * // => { 'n': 2 }
     */
    function maxBy(array, iteratee) {
      return (array && array.length)
        ? baseExtremum(array, getIteratee(iteratee, 2), baseGt)
        : undefined;
    }

    /**
     * Computes the mean of the values in `array`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {number} Returns the mean.
     * @example
     *
     * _.mean([4, 2, 8, 6]);
     * // => 5
     */
    function mean(array) {
      return baseMean(array, identity);
    }

    /**
     * This method is like `_.mean` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the value to be averaged.
     * The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {number} Returns the mean.
     * @example
     *
     * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
     *
     * _.meanBy(objects, function(o) { return o.n; });
     * // => 5
     *
     * // The `_.property` iteratee shorthand.
     * _.meanBy(objects, 'n');
     * // => 5
     */
    function meanBy(array, iteratee) {
      return baseMean(array, getIteratee(iteratee, 2));
    }

    /**
     * Computes the minimum value of `array`. If `array` is empty or falsey,
     * `undefined` is returned.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * _.min([]);
     * // => undefined
     */
    function min(array) {
      return (array && array.length)
        ? baseExtremum(array, identity, baseLt)
        : undefined;
    }

    /**
     * This method is like `_.min` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the criterion by which
     * the value is ranked. The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * var objects = [{ 'n': 1 }, { 'n': 2 }];
     *
     * _.minBy(objects, function(o) { return o.n; });
     * // => { 'n': 1 }
     *
     * // The `_.property` iteratee shorthand.
     * _.minBy(objects, 'n');
     * // => { 'n': 1 }
     */
    function minBy(array, iteratee) {
      return (array && array.length)
        ? baseExtremum(array, getIteratee(iteratee, 2), baseLt)
        : undefined;
    }

    /**
     * Multiply two numbers.
     *
     * @static
     * @memberOf _
     * @since 4.7.0
     * @category Math
     * @param {number} multiplier The first number in a multiplication.
     * @param {number} multiplicand The second number in a multiplication.
     * @returns {number} Returns the product.
     * @example
     *
     * _.multiply(6, 4);
     * // => 24
     */
    var multiply = createMathOperation(function(multiplier, multiplicand) {
      return multiplier * multiplicand;
    }, 1);

    /**
     * Computes `number` rounded to `precision`.
     *
     * @static
     * @memberOf _
     * @since 3.10.0
     * @category Math
     * @param {number} number The number to round.
     * @param {number} [precision=0] The precision to round to.
     * @returns {number} Returns the rounded number.
     * @example
     *
     * _.round(4.006);
     * // => 4
     *
     * _.round(4.006, 2);
     * // => 4.01
     *
     * _.round(4060, -2);
     * // => 4100
     */
    var round = createRound('round');

    /**
     * Subtract two numbers.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {number} minuend The first number in a subtraction.
     * @param {number} subtrahend The second number in a subtraction.
     * @returns {number} Returns the difference.
     * @example
     *
     * _.subtract(6, 4);
     * // => 2
     */
    var subtract = createMathOperation(function(minuend, subtrahend) {
      return minuend - subtrahend;
    }, 0);

    /**
     * Computes the sum of the values in `array`.
     *
     * @static
     * @memberOf _
     * @since 3.4.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @returns {number} Returns the sum.
     * @example
     *
     * _.sum([4, 2, 8, 6]);
     * // => 20
     */
    function sum(array) {
      return (array && array.length)
        ? baseSum(array, identity)
        : 0;
    }

    /**
     * This method is like `_.sum` except that it accepts `iteratee` which is
     * invoked for each element in `array` to generate the value to be summed.
     * The iteratee is invoked with one argument: (value).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Math
     * @param {Array} array The array to iterate over.
     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
     * @returns {number} Returns the sum.
     * @example
     *
     * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
     *
     * _.sumBy(objects, function(o) { return o.n; });
     * // => 20
     *
     * // The `_.property` iteratee shorthand.
     * _.sumBy(objects, 'n');
     * // => 20
     */
    function sumBy(array, iteratee) {
      return (array && array.length)
        ? baseSum(array, getIteratee(iteratee, 2))
        : 0;
    }

    /*------------------------------------------------------------------------*/

    // Add methods that return wrapped values in chain sequences.
    lodash.after = after;
    lodash.ary = ary;
    lodash.assign = assign;
    lodash.assignIn = assignIn;
    lodash.assignInWith = assignInWith;
    lodash.assignWith = assignWith;
    lodash.at = at;
    lodash.before = before;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.castArray = castArray;
    lodash.chain = chain;
    lodash.chunk = chunk;
    lodash.compact = compact;
    lodash.concat = concat;
    lodash.cond = cond;
    lodash.conforms = conforms;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.curry = curry;
    lodash.curryRight = curryRight;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defaultsDeep = defaultsDeep;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.differenceBy = differenceBy;
    lodash.differenceWith = differenceWith;
    lodash.drop = drop;
    lodash.dropRight = dropRight;
    lodash.dropRightWhile = dropRightWhile;
    lodash.dropWhile = dropWhile;
    lodash.fill = fill;
    lodash.filter = filter;
    lodash.flatMap = flatMap;
    lodash.flatMapDeep = flatMapDeep;
    lodash.flatMapDepth = flatMapDepth;
    lodash.flatten = flatten;
    lodash.flattenDeep = flattenDeep;
    lodash.flattenDepth = flattenDepth;
    lodash.flip = flip;
    lodash.flow = flow;
    lodash.flowRight = flowRight;
    lodash.fromPairs = fromPairs;
    lodash.functions = functions;
    lodash.functionsIn = functionsIn;
    lodash.groupBy = groupBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.intersectionBy = intersectionBy;
    lodash.intersectionWith = intersectionWith;
    lodash.invert = invert;
    lodash.invertBy = invertBy;
    lodash.invokeMap = invokeMap;
    lodash.iteratee = iteratee;
    lodash.keyBy = keyBy;
    lodash.keys = keys;
    lodash.keysIn = keysIn;
    lodash.map = map;
    lodash.mapKeys = mapKeys;
    lodash.mapValues = mapValues;
    lodash.matches = matches;
    lodash.matchesProperty = matchesProperty;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.mergeWith = mergeWith;
    lodash.method = method;
    lodash.methodOf = methodOf;
    lodash.mixin = mixin;
    lodash.negate = negate;
    lodash.nthArg = nthArg;
    lodash.omit = omit;
    lodash.omitBy = omitBy;
    lodash.once = once;
    lodash.orderBy = orderBy;
    lodash.over = over;
    lodash.overArgs = overArgs;
    lodash.overEvery = overEvery;
    lodash.overSome = overSome;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.partition = partition;
    lodash.pick = pick;
    lodash.pickBy = pickBy;
    lodash.property = property;
    lodash.propertyOf = propertyOf;
    lodash.pull = pull;
    lodash.pullAll = pullAll;
    lodash.pullAllBy = pullAllBy;
    lodash.pullAllWith = pullAllWith;
    lodash.pullAt = pullAt;
    lodash.range = range;
    lodash.rangeRight = rangeRight;
    lodash.rearg = rearg;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.reverse = reverse;
    lodash.sampleSize = sampleSize;
    lodash.set = set;
    lodash.setWith = setWith;
    lodash.shuffle = shuffle;
    lodash.slice = slice;
    lodash.sortBy = sortBy;
    lodash.sortedUniq = sortedUniq;
    lodash.sortedUniqBy = sortedUniqBy;
    lodash.split = split;
    lodash.spread = spread;
    lodash.tail = tail;
    lodash.take = take;
    lodash.takeRight = takeRight;
    lodash.takeRightWhile = takeRightWhile;
    lodash.takeWhile = takeWhile;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.thru = thru;
    lodash.toArray = toArray;
    lodash.toPairs = toPairs;
    lodash.toPairsIn = toPairsIn;
    lodash.toPath = toPath;
    lodash.toPlainObject = toPlainObject;
    lodash.transform = transform;
    lodash.unary = unary;
    lodash.union = union;
    lodash.unionBy = unionBy;
    lodash.unionWith = unionWith;
    lodash.uniq = uniq;
    lodash.uniqBy = uniqBy;
    lodash.uniqWith = uniqWith;
    lodash.unset = unset;
    lodash.unzip = unzip;
    lodash.unzipWith = unzipWith;
    lodash.update = update;
    lodash.updateWith = updateWith;
    lodash.values = values;
    lodash.valuesIn = valuesIn;
    lodash.without = without;
    lodash.words = words;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.xorBy = xorBy;
    lodash.xorWith = xorWith;
    lodash.zip = zip;
    lodash.zipObject = zipObject;
    lodash.zipObjectDeep = zipObjectDeep;
    lodash.zipWith = zipWith;

    // Add aliases.
    lodash.entries = toPairs;
    lodash.entriesIn = toPairsIn;
    lodash.extend = assignIn;
    lodash.extendWith = assignInWith;

    // Add methods to `lodash.prototype`.
    mixin(lodash, lodash);

    /*------------------------------------------------------------------------*/

    // Add methods that return unwrapped values in chain sequences.
    lodash.add = add;
    lodash.attempt = attempt;
    lodash.camelCase = camelCase;
    lodash.capitalize = capitalize;
    lodash.ceil = ceil;
    lodash.clamp = clamp;
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.cloneDeepWith = cloneDeepWith;
    lodash.cloneWith = cloneWith;
    lodash.conformsTo = conformsTo;
    lodash.deburr = deburr;
    lodash.defaultTo = defaultTo;
    lodash.divide = divide;
    lodash.endsWith = endsWith;
    lodash.eq = eq;
    lodash.escape = escape;
    lodash.escapeRegExp = escapeRegExp;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.floor = floor;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.get = get;
    lodash.gt = gt;
    lodash.gte = gte;
    lodash.has = has;
    lodash.hasIn = hasIn;
    lodash.head = head;
    lodash.identity = identity;
    lodash.includes = includes;
    lodash.indexOf = indexOf;
    lodash.inRange = inRange;
    lodash.invoke = invoke;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isArrayBuffer = isArrayBuffer;
    lodash.isArrayLike = isArrayLike;
    lodash.isArrayLikeObject = isArrayLikeObject;
    lodash.isBoolean = isBoolean;
    lodash.isBuffer = isBuffer;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isEqualWith = isEqualWith;
    lodash.isError = isError;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isInteger = isInteger;
    lodash.isLength = isLength;
    lodash.isMap = isMap;
    lodash.isMatch = isMatch;
    lodash.isMatchWith = isMatchWith;
    lodash.isNaN = isNaN;
    lodash.isNative = isNative;
    lodash.isNil = isNil;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isObjectLike = isObjectLike;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isSafeInteger = isSafeInteger;
    lodash.isSet = isSet;
    lodash.isString = isString;
    lodash.isSymbol = isSymbol;
    lodash.isTypedArray = isTypedArray;
    lodash.isUndefined = isUndefined;
    lodash.isWeakMap = isWeakMap;
    lodash.isWeakSet = isWeakSet;
    lodash.join = join;
    lodash.kebabCase = kebabCase;
    lodash.last = last;
    lodash.lastIndexOf = lastIndexOf;
    lodash.lowerCase = lowerCase;
    lodash.lowerFirst = lowerFirst;
    lodash.lt = lt;
    lodash.lte = lte;
    lodash.max = max;
    lodash.maxBy = maxBy;
    lodash.mean = mean;
    lodash.meanBy = meanBy;
    lodash.min = min;
    lodash.minBy = minBy;
    lodash.stubArray = stubArray;
    lodash.stubFalse = stubFalse;
    lodash.stubObject = stubObject;
    lodash.stubString = stubString;
    lodash.stubTrue = stubTrue;
    lodash.multiply = multiply;
    lodash.nth = nth;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.pad = pad;
    lodash.padEnd = padEnd;
    lodash.padStart = padStart;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.repeat = repeat;
    lodash.replace = replace;
    lodash.result = result;
    lodash.round = round;
    lodash.runInContext = runInContext;
    lodash.sample = sample;
    lodash.size = size;
    lodash.snakeCase = snakeCase;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.sortedIndexBy = sortedIndexBy;
    lodash.sortedIndexOf = sortedIndexOf;
    lodash.sortedLastIndex = sortedLastIndex;
    lodash.sortedLastIndexBy = sortedLastIndexBy;
    lodash.sortedLastIndexOf = sortedLastIndexOf;
    lodash.startCase = startCase;
    lodash.startsWith = startsWith;
    lodash.subtract = subtract;
    lodash.sum = sum;
    lodash.sumBy = sumBy;
    lodash.template = template;
    lodash.times = times;
    lodash.toFinite = toFinite;
    lodash.toInteger = toInteger;
    lodash.toLength = toLength;
    lodash.toLower = toLower;
    lodash.toNumber = toNumber;
    lodash.toSafeInteger = toSafeInteger;
    lodash.toString = toString;
    lodash.toUpper = toUpper;
    lodash.trim = trim;
    lodash.trimEnd = trimEnd;
    lodash.trimStart = trimStart;
    lodash.truncate = truncate;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;
    lodash.upperCase = upperCase;
    lodash.upperFirst = upperFirst;

    // Add aliases.
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.first = head;

    mixin(lodash, (function() {
      var source = {};
      baseForOwn(lodash, function(func, methodName) {
        if (!hasOwnProperty.call(lodash.prototype, methodName)) {
          source[methodName] = func;
        }
      });
      return source;
    }()), { 'chain': false });

    /*------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type {string}
     */
    lodash.VERSION = VERSION;

    // Assign default placeholders.
    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
      lodash[methodName].placeholder = lodash;
    });

    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
    arrayEach(['drop', 'take'], function(methodName, index) {
      LazyWrapper.prototype[methodName] = function(n) {
        n = n === undefined ? 1 : nativeMax(toInteger(n), 0);

        var result = (this.__filtered__ && !index)
          ? new LazyWrapper(this)
          : this.clone();

        if (result.__filtered__) {
          result.__takeCount__ = nativeMin(n, result.__takeCount__);
        } else {
          result.__views__.push({
            'size': nativeMin(n, MAX_ARRAY_LENGTH),
            'type': methodName + (result.__dir__ < 0 ? 'Right' : '')
          });
        }
        return result;
      };

      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
        return this.reverse()[methodName](n).reverse();
      };
    });

    // Add `LazyWrapper` methods that accept an `iteratee` value.
    arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
      var type = index + 1,
          isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

      LazyWrapper.prototype[methodName] = function(iteratee) {
        var result = this.clone();
        result.__iteratees__.push({
          'iteratee': getIteratee(iteratee, 3),
          'type': type
        });
        result.__filtered__ = result.__filtered__ || isFilter;
        return result;
      };
    });

    // Add `LazyWrapper` methods for `_.head` and `_.last`.
    arrayEach(['head', 'last'], function(methodName, index) {
      var takeName = 'take' + (index ? 'Right' : '');

      LazyWrapper.prototype[methodName] = function() {
        return this[takeName](1).value()[0];
      };
    });

    // Add `LazyWrapper` methods for `_.initial` and `_.tail`.
    arrayEach(['initial', 'tail'], function(methodName, index) {
      var dropName = 'drop' + (index ? '' : 'Right');

      LazyWrapper.prototype[methodName] = function() {
        return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
      };
    });

    LazyWrapper.prototype.compact = function() {
      return this.filter(identity);
    };

    LazyWrapper.prototype.find = function(predicate) {
      return this.filter(predicate).head();
    };

    LazyWrapper.prototype.findLast = function(predicate) {
      return this.reverse().find(predicate);
    };

    LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
      if (typeof path == 'function') {
        return new LazyWrapper(this);
      }
      return this.map(function(value) {
        return baseInvoke(value, path, args);
      });
    });

    LazyWrapper.prototype.reject = function(predicate) {
      return this.filter(negate(getIteratee(predicate)));
    };

    LazyWrapper.prototype.slice = function(start, end) {
      start = toInteger(start);

      var result = this;
      if (result.__filtered__ && (start > 0 || end < 0)) {
        return new LazyWrapper(result);
      }
      if (start < 0) {
        result = result.takeRight(-start);
      } else if (start) {
        result = result.drop(start);
      }
      if (end !== undefined) {
        end = toInteger(end);
        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
      }
      return result;
    };

    LazyWrapper.prototype.takeRightWhile = function(predicate) {
      return this.reverse().takeWhile(predicate).reverse();
    };

    LazyWrapper.prototype.toArray = function() {
      return this.take(MAX_ARRAY_LENGTH);
    };

    // Add `LazyWrapper` methods to `lodash.prototype`.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
          isTaker = /^(?:head|last)$/.test(methodName),
          lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
          retUnwrapped = isTaker || /^find/.test(methodName);

      if (!lodashFunc) {
        return;
      }
      lodash.prototype[methodName] = function() {
        var value = this.__wrapped__,
            args = isTaker ? [1] : arguments,
            isLazy = value instanceof LazyWrapper,
            iteratee = args[0],
            useLazy = isLazy || isArray(value);

        var interceptor = function(value) {
          var result = lodashFunc.apply(lodash, arrayPush([value], args));
          return (isTaker && chainAll) ? result[0] : result;
        };

        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
          // Avoid lazy use if the iteratee has a "length" value other than `1`.
          isLazy = useLazy = false;
        }
        var chainAll = this.__chain__,
            isHybrid = !!this.__actions__.length,
            isUnwrapped = retUnwrapped && !chainAll,
            onlyLazy = isLazy && !isHybrid;

        if (!retUnwrapped && useLazy) {
          value = onlyLazy ? value : new LazyWrapper(this);
          var result = func.apply(value, args);
          result.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
          return new LodashWrapper(result, chainAll);
        }
        if (isUnwrapped && onlyLazy) {
          return func.apply(this, args);
        }
        result = this.thru(interceptor);
        return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
      };
    });

    // Add `Array` methods to `lodash.prototype`.
    arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
      var func = arrayProto[methodName],
          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
          retUnwrapped = /^(?:pop|shift)$/.test(methodName);

      lodash.prototype[methodName] = function() {
        var args = arguments;
        if (retUnwrapped && !this.__chain__) {
          var value = this.value();
          return func.apply(isArray(value) ? value : [], args);
        }
        return this[chainName](function(value) {
          return func.apply(isArray(value) ? value : [], args);
        });
      };
    });

    // Map minified method names to their real names.
    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
      var lodashFunc = lodash[methodName];
      if (lodashFunc) {
        var key = (lodashFunc.name + ''),
            names = realNames[key] || (realNames[key] = []);

        names.push({ 'name': methodName, 'func': lodashFunc });
      }
    });

    realNames[createHybrid(undefined, WRAP_BIND_KEY_FLAG).name] = [{
      'name': 'wrapper',
      'func': undefined
    }];

    // Add methods to `LazyWrapper`.
    LazyWrapper.prototype.clone = lazyClone;
    LazyWrapper.prototype.reverse = lazyReverse;
    LazyWrapper.prototype.value = lazyValue;

    // Add chain sequence methods to the `lodash` wrapper.
    lodash.prototype.at = wrapperAt;
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.commit = wrapperCommit;
    lodash.prototype.next = wrapperNext;
    lodash.prototype.plant = wrapperPlant;
    lodash.prototype.reverse = wrapperReverse;
    lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

    // Add lazy aliases.
    lodash.prototype.first = lodash.prototype.head;

    if (symIterator) {
      lodash.prototype[symIterator] = wrapperToIterator;
    }
    return lodash;
  });

  /*--------------------------------------------------------------------------*/

  // Export lodash.
  var _ = runInContext();

  // Some AMD build optimizers, like r.js, check for condition patterns like:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lodash on the global object to prevent errors when Lodash is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    // Use `_.noConflict` to remove Lodash from the global object.
    root._ = _;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
      return _;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds it.
  else if (freeModule) {
    // Export for Node.js.
    (freeModule.exports = _)._ = _;
    // Export for CommonJS support.
    freeExports._ = _;
  }
  else {
    // Export to the global object.
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
/** Module containing Lens class
  * Class represents lens object, including pixel location and radius, and
  * ring radius
  * @module Lens
  */

/**Lens class
  * Represents lens object, including pixel location and radius, and ring radius
  * @class Lens
  */

function Lens(xPixelScale, yPixelScale,
              thetaXtoPixel, thetaYtoPixel,
              xPos, yPos, pixelRadius, color, outlineWidth, outlineColor,
              ringRadius_mas,
              ringColor, ringWidth, dashedRingLength, dashedRingSpacing) {
  this.updatePos = function(xPos, yPos) {
    this.pos = {
      x: xPos,
      y: yPos,
    };

    this.pixelPos = {
      x: thetaXtoPixel(xPos),
      y: thetaYtoPixel(yPos),
    };
  }

  this.updatePos(xPos, yPos);

  this.pixelRadius = pixelRadius;

  this.color = color;
  this.outlineWidth = outlineWidth;
  this.outlineColor = outlineColor;

  this.ring = {
    radius: ringRadius_mas,

    pixelRadius: {
      x: xPixelScale * ringRadius_mas,
      y: yPixelScale * ringRadius_mas,
    },
    color: ringColor,
    width: ringWidth,
    dashedLength: dashedRingLength,
    dashedSpacing: dashedRingSpacing,
  };
}

module.exports = Lens;

},{}],9:[function(require,module,exports){
/** Almost Equals.
  * Function that checks if two numbers are almost equal.
  * @module almost-equals
  */

module.exports = function almostEquals(a, b, epsilon=1e-12) {
  return (Math.abs(a - b) < epsilon);
}

},{}],10:[function(require,module,exports){
/** Ellipse.
  * Draw an ellipse (but don't actually perform the stroke or fill) on a
  * Canvas element.
  * Unlike the native JS ellipse ellipse function,
  * this is compatible with Firefox.
  * @module ellipse
  */

module.exports = function ellipse(context, xPos, yPos, xRadius, yRadius) {
  context.save();

  context.translate(xPos, yPos);
  context.scale(xRadius, yRadius);

  context.beginPath();
  context.arc(0, 0, 1, 0, Math.PI * 2, false);

  context.restore();
}

},{}],11:[function(require,module,exports){
/** Animation module.
  * Handles animated playback of microlensing event.
  *
  * @module fspl-microlensing-event-animation
  */

;

var eventModule = require("./fspl-microlensing-event.js");
var lensPlaneModule = require("./fspl-microlensing-event-lens-plane.js");

var almostEquals = require("./utils.js").almostEquals;

// whether module init function has been executed
var initialized = false;

// frames rendered per second (ideally; runs slow in non-Chrome browsers now)
var fps = 60;

var time;
var timer;
var running = false;

var minTime;
var maxTime;
// (days) time step per frame of animation
var animationStep = 0.1;
// (days) time step for "stepBack" and "stepForward" playback commands
var playbackControlStep = 0.2;

var timeReadout = document.getElementById("timeReadout");
var stepBackButton = document.getElementById("stepBack");
var playButton = document.getElementById("play");
var pauseButton = document.getElementById("pause");
var stepForwardButton = document.getElementById("stepForward");
var timeResetButton = document.getElementById("timeReset");

/** init */
function init() {
  updateMinAndMaxTimes();
  if (animationStep >= 0)
    time = minTime;
  else
    time = maxTime;
  timeReadout.innerHTML = Number(time).toFixed(4);
  initListeners();
  initialized = true;
}

/** updateMinAndMaxTimes */
function updateMinAndMaxTimes(min, max) {
  // default to min/max values of lightcurve plot time axis
  if (min === undefined)
    min = eventModule.xAxisInitialDay;

  if (max === undefined)
    max = eventModule.xAxisFinalDay;

  minTime = min;
  maxTime = max;
}

/** initListeners */
function initListeners() {
  stepBackButton.addEventListener("click", function() { updatePlayback("stepBack"); }, false);
  playButton.addEventListener("click", function() { updatePlayback("play"); }, false);
  pauseButton.addEventListener("click", function() { updatePlayback("pause"); }, false);
  stepForwardButton.addEventListener("click", function() { updatePlayback("stepForward"); }, false);
  timeResetButton.addEventListener("click", function() { updatePlayback("timeReset"); }, false);
}

/** run */
function run() {
  if (running === true) {
    timer = window.setTimeout(run, 1000/fps);

    updateMinAndMaxTimes();
    updateTime(time + animationStep);

    animateFrame();

    if (time >= maxTime || almostEquals(time, maxTime) === true ||
        time <= minTime || almostEquals(time, minTime) === true) {
      updatePlayback("Pause");
    }
  }
}

/** updateTime */
function updateTime(newTime) {

  var newTimeOverMax = false;
  var newTimeUnderMin = false;

  // don't let time exceed maximum limit
  if (newTime >= maxTime || almostEquals(newTime, maxTime) === true) {
    newTime = maxTime;
    newTimeOverMax = true;
  }

  // don't let time fall under minimum limit
  if (newTime <= minTime || almostEquals(newTime, minTime) === true) {
    newTime = minTime;
    newTimeUnderMin = true;
  }

  // Pause animation if time has reached minimum or maximum limit
  if (newTimeOverMax === true && newTimeUnderMin === true)
    updatePlayback("Pause");

  // update time property
  time = newTime;

  // update time readout on page

  // makes sure we display "0.00" instead of "-0.00" if 0 time has rounding error
  var newTimeReadout = Number(time).toFixed(4);
  if (almostEquals(time, 0) === true) {
    newTimeReadout = Number(0).toFixed(4);
  }
  timeReadout.innerHTML = newTimeReadout; // update time readout
}

/** animateFrame */
function animateFrame() {
  ;

  // animate frame for lightcurve
  eventModule.plotLightcurve(time);
  // animate frame for source movement on lens plane figure
  animateFrameSource();
  ;
  var u = eventModule.getU(eventModule.getTimeTerm(time));
  var magnif = eventModule.getMagnif(time);
  ;
  ;
}

/** animateFrameSource */
function animateFrameSource() {
  // update source thetaX position for new time
  lensPlaneModule.sourcePos.x = lensPlaneModule.getThetaX(time);
  lensPlaneModule.redraw();
}

/** updatePlayback */
function updatePlayback(command="play", updateFrame=true) {
  //setting updateFrame to false lets us modify the internal frame without
  // actually updating the display, in case we want to issue multiple playback
  // command before actually updating the displayed frame (like multiple
  // steps backwards/forwards)
  window.clearTimeout(timer);

  if (command === "stepBack") {
    ;
    if (time > minTime && almostEquals(time, minTime) === false) {
      updateTime(time - playbackControlStep);
      if (updateFrame === true)
        animateFrame();
    }
  }
  else if (command === "play") {
    ;
    ;
    if (time >= maxTime || almostEquals(time, maxTime) === true ||
        time <= minTime || almostEquals(time, minTime) === true) {
      updatePlayback("timeReset");
      ;
    }
    running = true;
    run();
  }
  else if (command === "pause") {
    ;
    running = false;
  }
  else if (command === "stepForward") {
    ;
    updateTime(time + playbackControlStep);
    if (updateFrame === true)
      animateFrame();
  }
  else if (command === "timeReset") {
    ;
    running = false;

    // if playing forwards (positive step), reset to minimum time
    var newTime;
    if (animationStep >= 0)
      newTime = minTime;
    // if playing backwards (negative step), reset to maximum time

    // animationStep < 0
    else
      newTime = maxTime;

    updateTime(newTime);
    if (updateFrame === true)
      animateFrame();
  }
}

module.exports = {
  //initialization

  // initialization function
  init: init,
  // whether initialization is done
  get initialized() { return initialized; },

  get running() { return running; },
  get time() { return time; },

  updatePlayback: updatePlayback,
  animateFrame: animateFrame,
}

},{"./fspl-microlensing-event-lens-plane.js":14,"./fspl-microlensing-event.js":15,"./utils.js":19}],12:[function(require,module,exports){
/** Finite Source Table module.
  * Handles calculations of finite source effects.
  * Holds z and B0 columns for calculating finite source magnifaction factor.
  *
  * @module fspl-microlensing-event-finite-source-table
  */

;

var zColumn = [
  0.00100000, 0.00200000, 0.00300000, 0.00400000, 0.00500000, 0.00600000, 0.00700000, 0.00800000, 0.00900000, 0.01000000, 0.01100000, 0.01200000, 0.01300000, 0.01400000, 0.01500000, 0.01600000, 0.01700000, 0.01800000, 0.01900000, 0.02000000, 0.02100000, 0.02200000, 0.02300000, 0.02400000, 0.02500000, 0.02600000, 0.02700000, 0.02800000, 0.02900000, 0.03000000, 0.03100000, 0.03200000, 0.03300000, 0.03400000, 0.03500000, 0.03600000, 0.03700000, 0.03800000, 0.03900000, 0.04000000, 0.04100000, 0.04200000, 0.04300000, 0.04400000, 0.04500000, 0.04600000, 0.04700000, 0.04800000, 0.04900000, 0.05000000, 0.05100000, 0.05200000, 0.05300000, 0.05400000, 0.05500000, 0.05600000, 0.05700000, 0.05800000, 0.05900000, 0.06000000, 0.06100000, 0.06200000, 0.06300000, 0.06400000, 0.06500000, 0.06600000, 0.06700000, 0.06800000, 0.06900000, 0.07000000, 0.07100000, 0.07200000, 0.07300000, 0.07400000, 0.07500000, 0.07600000, 0.07700000, 0.07800000, 0.07900000, 0.08000000, 0.08100000, 0.08200000, 0.08300000, 0.08400000, 0.08500000, 0.08600000, 0.08700000, 0.08800000, 0.08900000, 0.09000000, 0.09100000, 0.09200000, 0.09300000, 0.09400000, 0.09500000, 0.09600000, 0.09700000, 0.09800000, 0.09900000, 0.10000000, 0.10100000, 0.10200000, 0.10300000, 0.10400000, 0.10500000, 0.10600000, 0.10700000, 0.10800000, 0.10900000, 0.11000000, 0.11100000, 0.11200000, 0.11300000, 0.11400000, 0.11500000, 0.11600000, 0.11700000, 0.11800000, 0.11900000, 0.12000000, 0.12100000, 0.12200000, 0.12300000, 0.12400000, 0.12500000, 0.12600000, 0.12700000, 0.12800000, 0.12900000, 0.13000000, 0.13100000, 0.13200000, 0.13300000, 0.13400000, 0.13500000, 0.13600000, 0.13700000, 0.13800000, 0.13900000, 0.14000000, 0.14100000, 0.14200000, 0.14300000, 0.14400000, 0.14500000, 0.14600000, 0.14700000, 0.14800000, 0.14900000, 0.15000000, 0.15100000, 0.15200000, 0.15300000, 0.15400000, 0.15500000, 0.15600000, 0.15700000, 0.15800000, 0.15900000, 0.16000000, 0.16100000, 0.16200000, 0.16300000, 0.16400000, 0.16500000, 0.16600000, 0.16700000, 0.16800000, 0.16900000, 0.17000000, 0.17100000, 0.17200000, 0.17300000, 0.17400000, 0.17500000, 0.17600000, 0.17700000, 0.17800000, 0.17900000, 0.18000000, 0.18100000, 0.18200000, 0.18300000, 0.18400000, 0.18500000, 0.18600000, 0.18700000, 0.18800000, 0.18900000, 0.19000000, 0.19100000, 0.19200000, 0.19300000, 0.19400000, 0.19500000, 0.19600000, 0.19700000, 0.19800000, 0.19900000, 0.20000000, 0.20100000, 0.20200000, 0.20300000, 0.20400000, 0.20500000, 0.20600000, 0.20700000, 0.20800000, 0.20900000, 0.21000000, 0.21100000, 0.21200000, 0.21300000, 0.21400000, 0.21500000, 0.21600000, 0.21700000, 0.21800000, 0.21900000, 0.22000000, 0.22100000, 0.22200000, 0.22300000, 0.22400000, 0.22500000, 0.22600000, 0.22700000, 0.22800000, 0.22900000, 0.23000000, 0.23100000, 0.23200000, 0.23300000, 0.23400000, 0.23500000, 0.23600000, 0.23700000, 0.23800000, 0.23900000, 0.24000000, 0.24100000, 0.24200000, 0.24300000, 0.24400000, 0.24500000, 0.24600000, 0.24700000, 0.24800000, 0.24900000, 0.25000000, 0.25100000, 0.25200000, 0.25300000, 0.25400000, 0.25500000, 0.25600000, 0.25700000, 0.25800000, 0.25900000, 0.26000000, 0.26100000, 0.26200000, 0.26300000, 0.26400000, 0.26500000, 0.26600000, 0.26700000, 0.26800000, 0.26900000, 0.27000000, 0.27100000, 0.27200000, 0.27300000, 0.27400000, 0.27500000, 0.27600000, 0.27700000, 0.27800000, 0.27900000, 0.28000000, 0.28100000, 0.28200000, 0.28300000, 0.28400000, 0.28500000, 0.28600000, 0.28700000, 0.28800000, 0.28900000, 0.29000000, 0.29100000, 0.29200000, 0.29300000, 0.29400000, 0.29500000, 0.29600000, 0.29700000, 0.29800000, 0.29900000, 0.30000000, 0.30100000, 0.30200000, 0.30300000, 0.30400000, 0.30500000, 0.30600000, 0.30700000, 0.30800000, 0.30900000, 0.31000000, 0.31100000, 0.31200000, 0.31300000, 0.31400000, 0.31500000, 0.31600000, 0.31700000, 0.31800000, 0.31900000, 0.32000000, 0.32100000, 0.32200000, 0.32300000, 0.32400000, 0.32500000, 0.32600000, 0.32700000, 0.32800000, 0.32900000, 0.33000000, 0.33100000, 0.33200000, 0.33300000, 0.33400000, 0.33500000, 0.33600000, 0.33700000, 0.33800000, 0.33900000, 0.34000000, 0.34100000, 0.34200000, 0.34300000, 0.34400000, 0.34500000, 0.34600000, 0.34700000, 0.34800000, 0.34900000, 0.35000000, 0.35100000, 0.35200000, 0.35300000, 0.35400000, 0.35500000, 0.35600000, 0.35700000, 0.35800000, 0.35900000, 0.36000000, 0.36100000, 0.36200000, 0.36300000, 0.36400000, 0.36500000, 0.36600000, 0.36700000, 0.36800000, 0.36900000, 0.37000000, 0.37100000, 0.37200000, 0.37300000, 0.37400000, 0.37500000, 0.37600000, 0.37700000, 0.37800000, 0.37900000, 0.38000000, 0.38100000, 0.38200000, 0.38300000, 0.38400000, 0.38500000, 0.38600000, 0.38700000, 0.38800000, 0.38900000, 0.39000000, 0.39100000, 0.39200000, 0.39300000, 0.39400000, 0.39500000, 0.39600000, 0.39700000, 0.39800000, 0.39900000, 0.40000000, 0.40100000, 0.40200000, 0.40300000, 0.40400000, 0.40500000, 0.40600000, 0.40700000, 0.40800000, 0.40900000, 0.41000000, 0.41100000, 0.41200000, 0.41300000, 0.41400000, 0.41500000, 0.41600000, 0.41700000, 0.41800000, 0.41900000, 0.42000000, 0.42100000, 0.42200000, 0.42300000, 0.42400000, 0.42500000, 0.42600000, 0.42700000, 0.42800000, 0.42900000, 0.43000000, 0.43100000, 0.43200000, 0.43300000, 0.43400000, 0.43500000, 0.43600000, 0.43700000, 0.43800000, 0.43900000, 0.44000000, 0.44100000, 0.44200000, 0.44300000, 0.44400000, 0.44500000, 0.44600000, 0.44700000, 0.44800000, 0.44900000, 0.45000000, 0.45100000, 0.45200000, 0.45300000, 0.45400000, 0.45500000, 0.45600000, 0.45700000, 0.45800000, 0.45900000, 0.46000000, 0.46100000, 0.46200000, 0.46300000, 0.46400000, 0.46500000, 0.46600000, 0.46700000, 0.46800000, 0.46900000, 0.47000000, 0.47100000, 0.47200000, 0.47300000, 0.47400000, 0.47500000, 0.47600000, 0.47700000, 0.47800000, 0.47900000, 0.48000000, 0.48100000, 0.48200000, 0.48300000, 0.48400000, 0.48500000, 0.48600000, 0.48700000, 0.48800000, 0.48900000, 0.49000000, 0.49100000, 0.49200000, 0.49300000, 0.49400000, 0.49500000, 0.49600000, 0.49700000, 0.49800000, 0.49900000, 0.50000000, 0.50100000, 0.50200000, 0.50300000, 0.50400000, 0.50500000, 0.50600000, 0.50700000, 0.50800000, 0.50900000, 0.51000000, 0.51100000, 0.51200000, 0.51300000, 0.51400000, 0.51500000, 0.51600000, 0.51700000, 0.51800000, 0.51900000, 0.52000000, 0.52100000, 0.52200000, 0.52300000, 0.52400000, 0.52500000, 0.52600000, 0.52700000, 0.52800000, 0.52900000, 0.53000000, 0.53100000, 0.53200000, 0.53300000, 0.53400000, 0.53500000, 0.53600000, 0.53700000, 0.53800000, 0.53900000, 0.54000000, 0.54100000, 0.54200000, 0.54300000, 0.54400000, 0.54500000, 0.54600000, 0.54700000, 0.54800000, 0.54900000, 0.55000000, 0.55100000, 0.55200000, 0.55300000, 0.55400000, 0.55500000, 0.55600000, 0.55700000, 0.55800000, 0.55900000, 0.56000000, 0.56100000, 0.56200000, 0.56300000, 0.56400000, 0.56500000, 0.56600000, 0.56700000, 0.56800000, 0.56900000, 0.57000000, 0.57100000, 0.57200000, 0.57300000, 0.57400000, 0.57500000, 0.57600000, 0.57700000, 0.57800000, 0.57900000, 0.58000000, 0.58100000, 0.58200000, 0.58300000, 0.58400000, 0.58500000, 0.58600000, 0.58700000, 0.58800000, 0.58900000, 0.59000000, 0.59100000, 0.59200000, 0.59300000, 0.59400000, 0.59500000, 0.59600000, 0.59700000, 0.59800000, 0.59900000, 0.60000000, 0.60100000, 0.60200000, 0.60300000, 0.60400000, 0.60500000, 0.60600000, 0.60700000, 0.60800000, 0.60900000, 0.61000000, 0.61100000, 0.61200000, 0.61300000, 0.61400000, 0.61500000, 0.61600000, 0.61700000, 0.61800000, 0.61900000, 0.62000000, 0.62100000, 0.62200000, 0.62300000, 0.62400000, 0.62500000, 0.62600000, 0.62700000, 0.62800000, 0.62900000, 0.63000000, 0.63100000, 0.63200000, 0.63300000, 0.63400000, 0.63500000, 0.63600000, 0.63700000, 0.63800000, 0.63900000, 0.64000000, 0.64100000, 0.64200000, 0.64300000, 0.64400000, 0.64500000, 0.64600000, 0.64700000, 0.64800000, 0.64900000, 0.65000000, 0.65100000, 0.65200000, 0.65300000, 0.65400000, 0.65500000, 0.65600000, 0.65700000, 0.65800000, 0.65900000, 0.66000000, 0.66100000, 0.66200000, 0.66300000, 0.66400000, 0.66500000, 0.66600000, 0.66700000, 0.66800000, 0.66900000, 0.67000000, 0.67100000, 0.67200000, 0.67300000, 0.67400000, 0.67500000, 0.67600000, 0.67700000, 0.67800000, 0.67900000, 0.68000000, 0.68100000, 0.68200000, 0.68300000, 0.68400000, 0.68500000, 0.68600000, 0.68700000, 0.68800000, 0.68900000, 0.69000000, 0.69100000, 0.69200000, 0.69300000, 0.69400000, 0.69500000, 0.69600000, 0.69700000, 0.69800000, 0.69900000, 0.70000000, 0.70100000, 0.70200000, 0.70300000, 0.70400000, 0.70500000, 0.70600000, 0.70700000, 0.70800000, 0.70900000, 0.71000000, 0.71100000, 0.71200000, 0.71300000, 0.71400000, 0.71500000, 0.71600000, 0.71700000, 0.71800000, 0.71900000, 0.72000000, 0.72100000, 0.72200000, 0.72300000, 0.72400000, 0.72500000, 0.72600000, 0.72700000, 0.72800000, 0.72900000, 0.73000000, 0.73100000, 0.73200000, 0.73300000, 0.73400000, 0.73500000, 0.73600000, 0.73700000, 0.73800000, 0.73900000, 0.74000000, 0.74100000, 0.74200000, 0.74300000, 0.74400000, 0.74500000, 0.74600000, 0.74700000, 0.74800000, 0.74900000, 0.75000000, 0.75100000, 0.75200000, 0.75300000, 0.75400000, 0.75500000, 0.75600000, 0.75700000, 0.75800000, 0.75900000, 0.76000000, 0.76100000, 0.76200000, 0.76300000, 0.76400000, 0.76500000, 0.76600000, 0.76700000, 0.76800000, 0.76900000, 0.77000000, 0.77100000, 0.77200000, 0.77300000, 0.77400000, 0.77500000, 0.77600000, 0.77700000, 0.77800000, 0.77900000, 0.78000000, 0.78100000, 0.78200000, 0.78300000, 0.78400000, 0.78500000, 0.78600000, 0.78700000, 0.78800000, 0.78900000, 0.79000000, 0.79100000, 0.79200000, 0.79300000, 0.79400000, 0.79500000, 0.79600000, 0.79700000, 0.79800000, 0.79900000, 0.80000000, 0.80100000, 0.80200000, 0.80300000, 0.80400000, 0.80500000, 0.80600000, 0.80700000, 0.80800000, 0.80900000, 0.81000000, 0.81100000, 0.81200000, 0.81300000, 0.81400000, 0.81500000, 0.81600000, 0.81700000, 0.81800000, 0.81900000, 0.82000000, 0.82100000, 0.82200000, 0.82300000, 0.82400000, 0.82500000, 0.82600000, 0.82700000, 0.82800000, 0.82900000, 0.83000000, 0.83100000, 0.83200000, 0.83300000, 0.83400000, 0.83500000, 0.83600000, 0.83700000, 0.83800000, 0.83900000, 0.84000000, 0.84100000, 0.84200000, 0.84300000, 0.84400000, 0.84500000, 0.84600000, 0.84700000, 0.84800000, 0.84900000, 0.85000000, 0.85100000, 0.85200000, 0.85300000, 0.85400000, 0.85500000, 0.85600000, 0.85700000, 0.85800000, 0.85900000, 0.86000000, 0.86100000, 0.86200000, 0.86300000, 0.86400000, 0.86500000, 0.86600000, 0.86700000, 0.86800000, 0.86900000, 0.87000000, 0.87100000, 0.87200000, 0.87300000, 0.87400000, 0.87500000, 0.87600000, 0.87700000, 0.87800000, 0.87900000, 0.88000000, 0.88100000, 0.88200000, 0.88300000, 0.88400000, 0.88500000, 0.88600000, 0.88700000, 0.88800000, 0.88900000, 0.89000000, 0.89100000, 0.89200000, 0.89300000, 0.89400000, 0.89500000, 0.89600000, 0.89700000, 0.89800000, 0.89900000, 0.89900000, 0.89910000, 0.89920000, 0.89930000, 0.89940000, 0.89950000, 0.89960000, 0.89970000, 0.89980000, 0.89990000, 0.90000000, 0.90010000, 0.90020000, 0.90030000, 0.90040000, 0.90050000, 0.90060000, 0.90070000, 0.90080000, 0.90090000, 0.90100000, 0.90110000, 0.90120000, 0.90130000, 0.90140000, 0.90150000, 0.90160000, 0.90170000, 0.90180000, 0.90190000, 0.90200000, 0.90210000, 0.90220000, 0.90230000, 0.90240000, 0.90250000, 0.90260000, 0.90270000, 0.90280000, 0.90290000, 0.90300000, 0.90310000, 0.90320000, 0.90330000, 0.90340000, 0.90350000, 0.90360000, 0.90370000, 0.90380000, 0.90390000, 0.90400000, 0.90410000, 0.90420000, 0.90430000, 0.90440000, 0.90450000, 0.90460000, 0.90470000, 0.90480000, 0.90490000, 0.90500000, 0.90510000, 0.90520000, 0.90530000, 0.90540000, 0.90550000, 0.90560000, 0.90570000, 0.90580000, 0.90590000, 0.90600000, 0.90610000, 0.90620000, 0.90630000, 0.90640000, 0.90650000, 0.90660000, 0.90670000, 0.90680000, 0.90690000, 0.90700000, 0.90710000, 0.90720000, 0.90730000, 0.90740000, 0.90750000, 0.90760000, 0.90770000, 0.90780000, 0.90790000, 0.90800000, 0.90810000, 0.90820000, 0.90830000, 0.90840000, 0.90850000, 0.90860000, 0.90870000, 0.90880000, 0.90890000, 0.90900000, 0.90910000, 0.90920000, 0.90930000, 0.90940000, 0.90950000, 0.90960000, 0.90970000, 0.90980000, 0.90990000, 0.91000000, 0.91010000, 0.91020000, 0.91030000, 0.91040000, 0.91050000, 0.91060000, 0.91070000, 0.91080000, 0.91090000, 0.91100000, 0.91110000, 0.91120000, 0.91130000, 0.91140000, 0.91150000, 0.91160000, 0.91170000, 0.91180000, 0.91190000, 0.91200000, 0.91210000, 0.91220000, 0.91230000, 0.91240000, 0.91250000, 0.91260000, 0.91270000, 0.91280000, 0.91290000, 0.91300000, 0.91310000, 0.91320000, 0.91330000, 0.91340000, 0.91350000, 0.91360000, 0.91370000, 0.91380000, 0.91390000, 0.91400000, 0.91410000, 0.91420000, 0.91430000, 0.91440000, 0.91450000, 0.91460000, 0.91470000, 0.91480000, 0.91490000, 0.91500000, 0.91510000, 0.91520000, 0.91530000, 0.91540000, 0.91550000, 0.91560000, 0.91570000, 0.91580000, 0.91590000, 0.91600000, 0.91610000, 0.91620000, 0.91630000, 0.91640000, 0.91650000, 0.91660000, 0.91670000, 0.91680000, 0.91690000, 0.91700000, 0.91710000, 0.91720000, 0.91730000, 0.91740000, 0.91750000, 0.91760000, 0.91770000, 0.91780000, 0.91790000, 0.91800000, 0.91810000, 0.91820000, 0.91830000, 0.91840000, 0.91850000, 0.91860000, 0.91870000, 0.91880000, 0.91890000, 0.91900000, 0.91910000, 0.91920000, 0.91930000, 0.91940000, 0.91950000, 0.91960000, 0.91970000, 0.91980000, 0.91990000, 0.92000000, 0.92010000, 0.92020000, 0.92030000, 0.92040000, 0.92050000, 0.92060000, 0.92070000, 0.92080000, 0.92090000, 0.92100000, 0.92110000, 0.92120000, 0.92130000, 0.92140000, 0.92150000, 0.92160000, 0.92170000, 0.92180000, 0.92190000, 0.92200000, 0.92210000, 0.92220000, 0.92230000, 0.92240000, 0.92250000, 0.92260000, 0.92270000, 0.92280000, 0.92290000, 0.92300000, 0.92310000, 0.92320000, 0.92330000, 0.92340000, 0.92350000, 0.92360000, 0.92370000, 0.92380000, 0.92390000, 0.92400000, 0.92410000, 0.92420000, 0.92430000, 0.92440000, 0.92450000, 0.92460000, 0.92470000, 0.92480000, 0.92490000, 0.92500000, 0.92510000, 0.92520000, 0.92530000, 0.92540000, 0.92550000, 0.92560000, 0.92570000, 0.92580000, 0.92590000, 0.92600000, 0.92610000, 0.92620000, 0.92630000, 0.92640000, 0.92650000, 0.92660000, 0.92670000, 0.92680000, 0.92690000, 0.92700000, 0.92710000, 0.92720000, 0.92730000, 0.92740000, 0.92750000, 0.92760000, 0.92770000, 0.92780000, 0.92790000, 0.92800000, 0.92810000, 0.92820000, 0.92830000, 0.92840000, 0.92850000, 0.92860000, 0.92870000, 0.92880000, 0.92890000, 0.92900000, 0.92910000, 0.92920000, 0.92930000, 0.92940000, 0.92950000, 0.92960000, 0.92970000, 0.92980000, 0.92990000, 0.93000000, 0.93010000, 0.93020000, 0.93030000, 0.93040000, 0.93050000, 0.93060000, 0.93070000, 0.93080000, 0.93090000, 0.93100000, 0.93110000, 0.93120000, 0.93130000, 0.93140000, 0.93150000, 0.93160000, 0.93170000, 0.93180000, 0.93190000, 0.93200000, 0.93210000, 0.93220000, 0.93230000, 0.93240000, 0.93250000, 0.93260000, 0.93270000, 0.93280000, 0.93290000, 0.93300000, 0.93310000, 0.93320000, 0.93330000, 0.93340000, 0.93350000, 0.93360000, 0.93370000, 0.93380000, 0.93390000, 0.93400000, 0.93410000, 0.93420000, 0.93430000, 0.93440000, 0.93450000, 0.93460000, 0.93470000, 0.93480000, 0.93490000, 0.93500000, 0.93510000, 0.93520000, 0.93530000, 0.93540000, 0.93550000, 0.93560000, 0.93570000, 0.93580000, 0.93590000, 0.93600000, 0.93610000, 0.93620000, 0.93630000, 0.93640000, 0.93650000, 0.93660000, 0.93670000, 0.93680000, 0.93690000, 0.93700000, 0.93710000, 0.93720000, 0.93730000, 0.93740000, 0.93750000, 0.93760000, 0.93770000, 0.93780000, 0.93790000, 0.93800000, 0.93810000, 0.93820000, 0.93830000, 0.93840000, 0.93850000, 0.93860000, 0.93870000, 0.93880000, 0.93890000, 0.93900000, 0.93910000, 0.93920000, 0.93930000, 0.93940000, 0.93950000, 0.93960000, 0.93970000, 0.93980000, 0.93990000, 0.94000000, 0.94010000, 0.94020000, 0.94030000, 0.94040000, 0.94050000, 0.94060000, 0.94070000, 0.94080000, 0.94090000, 0.94100000, 0.94110000, 0.94120000, 0.94130000, 0.94140000, 0.94150000, 0.94160000, 0.94170000, 0.94180000, 0.94190000, 0.94200000, 0.94210000, 0.94220000, 0.94230000, 0.94240000, 0.94250000, 0.94260000, 0.94270000, 0.94280000, 0.94290000, 0.94300000, 0.94310000, 0.94320000, 0.94330000, 0.94340000, 0.94350000, 0.94360000, 0.94370000, 0.94380000, 0.94390000, 0.94400000, 0.94410000, 0.94420000, 0.94430000, 0.94440000, 0.94450000, 0.94460000, 0.94470000, 0.94480000, 0.94490000, 0.94500000, 0.94510000, 0.94520000, 0.94530000, 0.94540000, 0.94550000, 0.94560000, 0.94570000, 0.94580000, 0.94590000, 0.94600000, 0.94610000, 0.94620000, 0.94630000, 0.94640000, 0.94650000, 0.94660000, 0.94670000, 0.94680000, 0.94690000, 0.94700000, 0.94710000, 0.94720000, 0.94730000, 0.94740000, 0.94750000, 0.94760000, 0.94770000, 0.94780000, 0.94790000, 0.94800000, 0.94810000, 0.94820000, 0.94830000, 0.94840000, 0.94850000, 0.94860000, 0.94870000, 0.94880000, 0.94890000, 0.94900000, 0.94910000, 0.94920000, 0.94930000, 0.94940000, 0.94950000, 0.94960000, 0.94970000, 0.94980000, 0.94990000, 0.95000000, 0.95010000, 0.95020000, 0.95030000, 0.95040000, 0.95050000, 0.95060000, 0.95070000, 0.95080000, 0.95090000, 0.95100000, 0.95110000, 0.95120000, 0.95130000, 0.95140000, 0.95150000, 0.95160000, 0.95170000, 0.95180000, 0.95190000, 0.95200000, 0.95210000, 0.95220000, 0.95230000, 0.95240000, 0.95250000, 0.95260000, 0.95270000, 0.95280000, 0.95290000, 0.95300000, 0.95310000, 0.95320000, 0.95330000, 0.95340000, 0.95350000, 0.95360000, 0.95370000, 0.95380000, 0.95390000, 0.95400000, 0.95410000, 0.95420000, 0.95430000, 0.95440000, 0.95450000, 0.95460000, 0.95470000, 0.95480000, 0.95490000, 0.95500000, 0.95510000, 0.95520000, 0.95530000, 0.95540000, 0.95550000, 0.95560000, 0.95570000, 0.95580000, 0.95590000, 0.95600000, 0.95610000, 0.95620000, 0.95630000, 0.95640000, 0.95650000, 0.95660000, 0.95670000, 0.95680000, 0.95690000, 0.95700000, 0.95710000, 0.95720000, 0.95730000, 0.95740000, 0.95750000, 0.95760000, 0.95770000, 0.95780000, 0.95790000, 0.95800000, 0.95810000, 0.95820000, 0.95830000, 0.95840000, 0.95850000, 0.95860000, 0.95870000, 0.95880000, 0.95890000, 0.95900000, 0.95910000, 0.95920000, 0.95930000, 0.95940000, 0.95950000, 0.95960000, 0.95970000, 0.95980000, 0.95990000, 0.96000000, 0.96010000, 0.96020000, 0.96030000, 0.96040000, 0.96050000, 0.96060000, 0.96070000, 0.96080000, 0.96090000, 0.96100000, 0.96110000, 0.96120000, 0.96130000, 0.96140000, 0.96150000, 0.96160000, 0.96170000, 0.96180000, 0.96190000, 0.96200000, 0.96210000, 0.96220000, 0.96230000, 0.96240000, 0.96250000, 0.96260000, 0.96270000, 0.96280000, 0.96290000, 0.96300000, 0.96310000, 0.96320000, 0.96330000, 0.96340000, 0.96350000, 0.96360000, 0.96370000, 0.96380000, 0.96390000, 0.96400000, 0.96410000, 0.96420000, 0.96430000, 0.96440000, 0.96450000, 0.96460000, 0.96470000, 0.96480000, 0.96490000, 0.96500000, 0.96510000, 0.96520000, 0.96530000, 0.96540000, 0.96550000, 0.96560000, 0.96570000, 0.96580000, 0.96590000, 0.96600000, 0.96610000, 0.96620000, 0.96630000, 0.96640000, 0.96650000, 0.96660000, 0.96670000, 0.96680000, 0.96690000, 0.96700000, 0.96710000, 0.96720000, 0.96730000, 0.96740000, 0.96750000, 0.96760000, 0.96770000, 0.96780000, 0.96790000, 0.96800000, 0.96810000, 0.96820000, 0.96830000, 0.96840000, 0.96850000, 0.96860000, 0.96870000, 0.96880000, 0.96890000, 0.96900000, 0.96910000, 0.96920000, 0.96930000, 0.96940000, 0.96950000, 0.96960000, 0.96970000, 0.96980000, 0.96990000, 0.97000000, 0.97010000, 0.97020000, 0.97030000, 0.97040000, 0.97050000, 0.97060000, 0.97070000, 0.97080000, 0.97090000, 0.97100000, 0.97110000, 0.97120000, 0.97130000, 0.97140000, 0.97150000, 0.97160000, 0.97170000, 0.97180000, 0.97190000, 0.97200000, 0.97210000, 0.97220000, 0.97230000, 0.97240000, 0.97250000, 0.97260000, 0.97270000, 0.97280000, 0.97290000, 0.97300000, 0.97310000, 0.97320000, 0.97330000, 0.97340000, 0.97350000, 0.97360000, 0.97370000, 0.97380000, 0.97390000, 0.97400000, 0.97410000, 0.97420000, 0.97430000, 0.97440000, 0.97450000, 0.97460000, 0.97470000, 0.97480000, 0.97490000, 0.97500000, 0.97510000, 0.97520000, 0.97530000, 0.97540000, 0.97550000, 0.97560000, 0.97570000, 0.97580000, 0.97590000, 0.97600000, 0.97610000, 0.97620000, 0.97630000, 0.97640000, 0.97650000, 0.97660000, 0.97670000, 0.97680000, 0.97690000, 0.97700000, 0.97710000, 0.97720000, 0.97730000, 0.97740000, 0.97750000, 0.97760000, 0.97770000, 0.97780000, 0.97790000, 0.97800000, 0.97810000, 0.97820000, 0.97830000, 0.97840000, 0.97850000, 0.97860000, 0.97870000, 0.97880000, 0.97890000, 0.97900000, 0.97910000, 0.97920000, 0.97930000, 0.97940000, 0.97950000, 0.97960000, 0.97970000, 0.97980000, 0.97990000, 0.98000000, 0.98010000, 0.98020000, 0.98030000, 0.98040000, 0.98050000, 0.98060000, 0.98070000, 0.98080000, 0.98090000, 0.98100000, 0.98110000, 0.98120000, 0.98130000, 0.98140000, 0.98150000, 0.98160000, 0.98170000, 0.98180000, 0.98190000, 0.98200000, 0.98210000, 0.98220000, 0.98230000, 0.98240000, 0.98250000, 0.98260000, 0.98270000, 0.98280000, 0.98290000, 0.98300000, 0.98310000, 0.98320000, 0.98330000, 0.98340000, 0.98350000, 0.98360000, 0.98370000, 0.98380000, 0.98390000, 0.98400000, 0.98410000, 0.98420000, 0.98430000, 0.98440000, 0.98450000, 0.98460000, 0.98470000, 0.98480000, 0.98490000, 0.98500000, 0.98510000, 0.98520000, 0.98530000, 0.98540000, 0.98550000, 0.98560000, 0.98570000, 0.98580000, 0.98590000, 0.98600000, 0.98610000, 0.98620000, 0.98630000, 0.98640000, 0.98650000, 0.98660000, 0.98670000, 0.98680000, 0.98690000, 0.98700000, 0.98710000, 0.98720000, 0.98730000, 0.98740000, 0.98750000, 0.98760000, 0.98770000, 0.98780000, 0.98790000, 0.98800000, 0.98810000, 0.98820000, 0.98830000, 0.98840000, 0.98850000, 0.98860000, 0.98870000, 0.98880000, 0.98890000, 0.98900000, 0.98910000, 0.98920000, 0.98930000, 0.98940000, 0.98950000, 0.98960000, 0.98970000, 0.98980000, 0.98990000, 0.99000000, 0.99010000, 0.99020000, 0.99030000, 0.99040000, 0.99050000, 0.99060000, 0.99070000, 0.99080000, 0.99090000, 0.99100000, 0.99110000, 0.99120000, 0.99130000, 0.99140000, 0.99150000, 0.99160000, 0.99170000, 0.99180000, 0.99190000, 0.99200000, 0.99210000, 0.99220000, 0.99230000, 0.99240000, 0.99250000, 0.99260000, 0.99270000, 0.99280000, 0.99290000, 0.99300000, 0.99310000, 0.99320000, 0.99330000, 0.99340000, 0.99350000, 0.99360000, 0.99370000, 0.99380000, 0.99390000, 0.99400000, 0.99410000, 0.99420000, 0.99430000, 0.99440000, 0.99450000, 0.99460000, 0.99470000, 0.99480000, 0.99490000, 0.99500000, 0.99510000, 0.99520000, 0.99530000, 0.99540000, 0.99550000, 0.99560000, 0.99570000, 0.99580000, 0.99590000, 0.99600000, 0.99610000, 0.99620000, 0.99630000, 0.99640000, 0.99650000, 0.99660000, 0.99670000, 0.99680000, 0.99690000, 0.99700000, 0.99710000, 0.99720000, 0.99730000, 0.99740000, 0.99750000, 0.99760000, 0.99770000, 0.99780000, 0.99790000, 0.99800000, 0.99810000, 0.99820000, 0.99830000, 0.99840000, 0.99850000, 0.99860000, 0.99870000, 0.99880000, 0.99890000, 0.99900000, 0.99910000, 0.99920000, 0.99930000, 0.99940000, 0.99950000, 0.99960000, 0.99970000, 0.99980000, 0.99990000, 1.00000000, 1.00010000, 1.00020000, 1.00030000, 1.00040000, 1.00050000, 1.00060000, 1.00070000, 1.00080000, 1.00090000, 1.00100000, 1.00110000, 1.00120000, 1.00130000, 1.00140000, 1.00150000, 1.00160000, 1.00170000, 1.00180000, 1.00190000, 1.00200000, 1.00210000, 1.00220000, 1.00230000, 1.00240000, 1.00250000, 1.00260000, 1.00270000, 1.00280000, 1.00290000, 1.00300000, 1.00310000, 1.00320000, 1.00330000, 1.00340000, 1.00350000, 1.00360000, 1.00370000, 1.00380000, 1.00390000, 1.00400000, 1.00410000, 1.00420000, 1.00430000, 1.00440000, 1.00450000, 1.00460000, 1.00470000, 1.00480000, 1.00490000, 1.00500000, 1.00510000, 1.00520000, 1.00530000, 1.00540000, 1.00550000, 1.00560000, 1.00570000, 1.00580000, 1.00590000, 1.00600000, 1.00610000, 1.00620000, 1.00630000, 1.00640000, 1.00650000, 1.00660000, 1.00670000, 1.00680000, 1.00690000, 1.00700000, 1.00710000, 1.00720000, 1.00730000, 1.00740000, 1.00750000, 1.00760000, 1.00770000, 1.00780000, 1.00790000, 1.00800000, 1.00810000, 1.00820000, 1.00830000, 1.00840000, 1.00850000, 1.00860000, 1.00870000, 1.00880000, 1.00890000, 1.00900000, 1.00910000, 1.00920000, 1.00930000, 1.00940000, 1.00950000, 1.00960000, 1.00970000, 1.00980000, 1.00990000, 1.01000000, 1.01010000, 1.01020000, 1.01030000, 1.01040000, 1.01050000, 1.01060000, 1.01070000, 1.01080000, 1.01090000, 1.01100000, 1.01110000, 1.01120000, 1.01130000, 1.01140000, 1.01150000, 1.01160000, 1.01170000, 1.01180000, 1.01190000, 1.01200000, 1.01210000, 1.01220000, 1.01230000, 1.01240000, 1.01250000, 1.01260000, 1.01270000, 1.01280000, 1.01290000, 1.01300000, 1.01310000, 1.01320000, 1.01330000, 1.01340000, 1.01350000, 1.01360000, 1.01370000, 1.01380000, 1.01390000, 1.01400000, 1.01410000, 1.01420000, 1.01430000, 1.01440000, 1.01450000, 1.01460000, 1.01470000, 1.01480000, 1.01490000, 1.01500000, 1.01510000, 1.01520000, 1.01530000, 1.01540000, 1.01550000, 1.01560000, 1.01570000, 1.01580000, 1.01590000, 1.01600000, 1.01610000, 1.01620000, 1.01630000, 1.01640000, 1.01650000, 1.01660000, 1.01670000, 1.01680000, 1.01690000, 1.01700000, 1.01710000, 1.01720000, 1.01730000, 1.01740000, 1.01750000, 1.01760000, 1.01770000, 1.01780000, 1.01790000, 1.01800000, 1.01810000, 1.01820000, 1.01830000, 1.01840000, 1.01850000, 1.01860000, 1.01870000, 1.01880000, 1.01890000, 1.01900000, 1.01910000, 1.01920000, 1.01930000, 1.01940000, 1.01950000, 1.01960000, 1.01970000, 1.01980000, 1.01990000, 1.02000000, 1.02010000, 1.02020000, 1.02030000, 1.02040000, 1.02050000, 1.02060000, 1.02070000, 1.02080000, 1.02090000, 1.02100000, 1.02110000, 1.02120000, 1.02130000, 1.02140000, 1.02150000, 1.02160000, 1.02170000, 1.02180000, 1.02190000, 1.02200000, 1.02210000, 1.02220000, 1.02230000, 1.02240000, 1.02250000, 1.02260000, 1.02270000, 1.02280000, 1.02290000, 1.02300000, 1.02310000, 1.02320000, 1.02330000, 1.02340000, 1.02350000, 1.02360000, 1.02370000, 1.02380000, 1.02390000, 1.02400000, 1.02410000, 1.02420000, 1.02430000, 1.02440000, 1.02450000, 1.02460000, 1.02470000, 1.02480000, 1.02490000, 1.02500000, 1.02510000, 1.02520000, 1.02530000, 1.02540000, 1.02550000, 1.02560000, 1.02570000, 1.02580000, 1.02590000, 1.02600000, 1.02610000, 1.02620000, 1.02630000, 1.02640000, 1.02650000, 1.02660000, 1.02670000, 1.02680000, 1.02690000, 1.02700000, 1.02710000, 1.02720000, 1.02730000, 1.02740000, 1.02750000, 1.02760000, 1.02770000, 1.02780000, 1.02790000, 1.02800000, 1.02810000, 1.02820000, 1.02830000, 1.02840000, 1.02850000, 1.02860000, 1.02870000, 1.02880000, 1.02890000, 1.02900000, 1.02910000, 1.02920000, 1.02930000, 1.02940000, 1.02950000, 1.02960000, 1.02970000, 1.02980000, 1.02990000, 1.03000000, 1.03010000, 1.03020000, 1.03030000, 1.03040000, 1.03050000, 1.03060000, 1.03070000, 1.03080000, 1.03090000, 1.03100000, 1.03110000, 1.03120000, 1.03130000, 1.03140000, 1.03150000, 1.03160000, 1.03170000, 1.03180000, 1.03190000, 1.03200000, 1.03210000, 1.03220000, 1.03230000, 1.03240000, 1.03250000, 1.03260000, 1.03270000, 1.03280000, 1.03290000, 1.03300000, 1.03310000, 1.03320000, 1.03330000, 1.03340000, 1.03350000, 1.03360000, 1.03370000, 1.03380000, 1.03390000, 1.03400000, 1.03410000, 1.03420000, 1.03430000, 1.03440000, 1.03450000, 1.03460000, 1.03470000, 1.03480000, 1.03490000, 1.03500000, 1.03510000, 1.03520000, 1.03530000, 1.03540000, 1.03550000, 1.03560000, 1.03570000, 1.03580000, 1.03590000, 1.03600000, 1.03610000, 1.03620000, 1.03630000, 1.03640000, 1.03650000, 1.03660000, 1.03670000, 1.03680000, 1.03690000, 1.03700000, 1.03710000, 1.03720000, 1.03730000, 1.03740000, 1.03750000, 1.03760000, 1.03770000, 1.03780000, 1.03790000, 1.03800000, 1.03810000, 1.03820000, 1.03830000, 1.03840000, 1.03850000, 1.03860000, 1.03870000, 1.03880000, 1.03890000, 1.03900000, 1.03910000, 1.03920000, 1.03930000, 1.03940000, 1.03950000, 1.03960000, 1.03970000, 1.03980000, 1.03990000, 1.04000000, 1.04010000, 1.04020000, 1.04030000, 1.04040000, 1.04050000, 1.04060000, 1.04070000, 1.04080000, 1.04090000, 1.04100000, 1.04110000, 1.04120000, 1.04130000, 1.04140000, 1.04150000, 1.04160000, 1.04170000, 1.04180000, 1.04190000, 1.04200000, 1.04210000, 1.04220000, 1.04230000, 1.04240000, 1.04250000, 1.04260000, 1.04270000, 1.04280000, 1.04290000, 1.04300000, 1.04310000, 1.04320000, 1.04330000, 1.04340000, 1.04350000, 1.04360000, 1.04370000, 1.04380000, 1.04390000, 1.04400000, 1.04410000, 1.04420000, 1.04430000, 1.04440000, 1.04450000, 1.04460000, 1.04470000, 1.04480000, 1.04490000, 1.04500000, 1.04510000, 1.04520000, 1.04530000, 1.04540000, 1.04550000, 1.04560000, 1.04570000, 1.04580000, 1.04590000, 1.04600000, 1.04610000, 1.04620000, 1.04630000, 1.04640000, 1.04650000, 1.04660000, 1.04670000, 1.04680000, 1.04690000, 1.04700000, 1.04710000, 1.04720000, 1.04730000, 1.04740000, 1.04750000, 1.04760000, 1.04770000, 1.04780000, 1.04790000, 1.04800000, 1.04810000, 1.04820000, 1.04830000, 1.04840000, 1.04850000, 1.04860000, 1.04870000, 1.04880000, 1.04890000, 1.04900000, 1.04910000, 1.04920000, 1.04930000, 1.04940000, 1.04950000, 1.04960000, 1.04970000, 1.04980000, 1.04990000, 1.05000000, 1.05010000, 1.05020000, 1.05030000, 1.05040000, 1.05050000, 1.05060000, 1.05070000, 1.05080000, 1.05090000, 1.05100000, 1.05110000, 1.05120000, 1.05130000, 1.05140000, 1.05150000, 1.05160000, 1.05170000, 1.05180000, 1.05190000, 1.05200000, 1.05210000, 1.05220000, 1.05230000, 1.05240000, 1.05250000, 1.05260000, 1.05270000, 1.05280000, 1.05290000, 1.05300000, 1.05310000, 1.05320000, 1.05330000, 1.05340000, 1.05350000, 1.05360000, 1.05370000, 1.05380000, 1.05390000, 1.05400000, 1.05410000, 1.05420000, 1.05430000, 1.05440000, 1.05450000, 1.05460000, 1.05470000, 1.05480000, 1.05490000, 1.05500000, 1.05510000, 1.05520000, 1.05530000, 1.05540000, 1.05550000, 1.05560000, 1.05570000, 1.05580000, 1.05590000, 1.05600000, 1.05610000, 1.05620000, 1.05630000, 1.05640000, 1.05650000, 1.05660000, 1.05670000, 1.05680000, 1.05690000, 1.05700000, 1.05710000, 1.05720000, 1.05730000, 1.05740000, 1.05750000, 1.05760000, 1.05770000, 1.05780000, 1.05790000, 1.05800000, 1.05810000, 1.05820000, 1.05830000, 1.05840000, 1.05850000, 1.05860000, 1.05870000, 1.05880000, 1.05890000, 1.05900000, 1.05910000, 1.05920000, 1.05930000, 1.05940000, 1.05950000, 1.05960000, 1.05970000, 1.05980000, 1.05990000, 1.06000000, 1.06010000, 1.06020000, 1.06030000, 1.06040000, 1.06050000, 1.06060000, 1.06070000, 1.06080000, 1.06090000, 1.06100000, 1.06110000, 1.06120000, 1.06130000, 1.06140000, 1.06150000, 1.06160000, 1.06170000, 1.06180000, 1.06190000, 1.06200000, 1.06210000, 1.06220000, 1.06230000, 1.06240000, 1.06250000, 1.06260000, 1.06270000, 1.06280000, 1.06290000, 1.06300000, 1.06310000, 1.06320000, 1.06330000, 1.06340000, 1.06350000, 1.06360000, 1.06370000, 1.06380000, 1.06390000, 1.06400000, 1.06410000, 1.06420000, 1.06430000, 1.06440000, 1.06450000, 1.06460000, 1.06470000, 1.06480000, 1.06490000, 1.06500000, 1.06510000, 1.06520000, 1.06530000, 1.06540000, 1.06550000, 1.06560000, 1.06570000, 1.06580000, 1.06590000, 1.06600000, 1.06610000, 1.06620000, 1.06630000, 1.06640000, 1.06650000, 1.06660000, 1.06670000, 1.06680000, 1.06690000, 1.06700000, 1.06710000, 1.06720000, 1.06730000, 1.06740000, 1.06750000, 1.06760000, 1.06770000, 1.06780000, 1.06790000, 1.06800000, 1.06810000, 1.06820000, 1.06830000, 1.06840000, 1.06850000, 1.06860000, 1.06870000, 1.06880000, 1.06890000, 1.06900000, 1.06910000, 1.06920000, 1.06930000, 1.06940000, 1.06950000, 1.06960000, 1.06970000, 1.06980000, 1.06990000, 1.07000000, 1.07010000, 1.07020000, 1.07030000, 1.07040000, 1.07050000, 1.07060000, 1.07070000, 1.07080000, 1.07090000, 1.07100000, 1.07110000, 1.07120000, 1.07130000, 1.07140000, 1.07150000, 1.07160000, 1.07170000, 1.07180000, 1.07190000, 1.07200000, 1.07210000, 1.07220000, 1.07230000, 1.07240000, 1.07250000, 1.07260000, 1.07270000, 1.07280000, 1.07290000, 1.07300000, 1.07310000, 1.07320000, 1.07330000, 1.07340000, 1.07350000, 1.07360000, 1.07370000, 1.07380000, 1.07390000, 1.07400000, 1.07410000, 1.07420000, 1.07430000, 1.07440000, 1.07450000, 1.07460000, 1.07470000, 1.07480000, 1.07490000, 1.07500000, 1.07510000, 1.07520000, 1.07530000, 1.07540000, 1.07550000, 1.07560000, 1.07570000, 1.07580000, 1.07590000, 1.07600000, 1.07610000, 1.07620000, 1.07630000, 1.07640000, 1.07650000, 1.07660000, 1.07670000, 1.07680000, 1.07690000, 1.07700000, 1.07710000, 1.07720000, 1.07730000, 1.07740000, 1.07750000, 1.07760000, 1.07770000, 1.07780000, 1.07790000, 1.07800000, 1.07810000, 1.07820000, 1.07830000, 1.07840000, 1.07850000, 1.07860000, 1.07870000, 1.07880000, 1.07890000, 1.07900000, 1.07910000, 1.07920000, 1.07930000, 1.07940000, 1.07950000, 1.07960000, 1.07970000, 1.07980000, 1.07990000, 1.08000000, 1.08010000, 1.08020000, 1.08030000, 1.08040000, 1.08050000, 1.08060000, 1.08070000, 1.08080000, 1.08090000, 1.08100000, 1.08110000, 1.08120000, 1.08130000, 1.08140000, 1.08150000, 1.08160000, 1.08170000, 1.08180000, 1.08190000, 1.08200000, 1.08210000, 1.08220000, 1.08230000, 1.08240000, 1.08250000, 1.08260000, 1.08270000, 1.08280000, 1.08290000, 1.08300000, 1.08310000, 1.08320000, 1.08330000, 1.08340000, 1.08350000, 1.08360000, 1.08370000, 1.08380000, 1.08390000, 1.08400000, 1.08410000, 1.08420000, 1.08430000, 1.08440000, 1.08450000, 1.08460000, 1.08470000, 1.08480000, 1.08490000, 1.08500000, 1.08510000, 1.08520000, 1.08530000, 1.08540000, 1.08550000, 1.08560000, 1.08570000, 1.08580000, 1.08590000, 1.08600000, 1.08610000, 1.08620000, 1.08630000, 1.08640000, 1.08650000, 1.08660000, 1.08670000, 1.08680000, 1.08690000, 1.08700000, 1.08710000, 1.08720000, 1.08730000, 1.08740000, 1.08750000, 1.08760000, 1.08770000, 1.08780000, 1.08790000, 1.08800000, 1.08810000, 1.08820000, 1.08830000, 1.08840000, 1.08850000, 1.08860000, 1.08870000, 1.08880000, 1.08890000, 1.08900000, 1.08910000, 1.08920000, 1.08930000, 1.08940000, 1.08950000, 1.08960000, 1.08970000, 1.08980000, 1.08990000, 1.09000000, 1.09010000, 1.09020000, 1.09030000, 1.09040000, 1.09050000, 1.09060000, 1.09070000, 1.09080000, 1.09090000, 1.09100000, 1.09110000, 1.09120000, 1.09130000, 1.09140000, 1.09150000, 1.09160000, 1.09170000, 1.09180000, 1.09190000, 1.09200000, 1.09210000, 1.09220000, 1.09230000, 1.09240000, 1.09250000, 1.09260000, 1.09270000, 1.09280000, 1.09290000, 1.09300000, 1.09310000, 1.09320000, 1.09330000, 1.09340000, 1.09350000, 1.09360000, 1.09370000, 1.09380000, 1.09390000, 1.09400000, 1.09410000, 1.09420000, 1.09430000, 1.09440000, 1.09450000, 1.09460000, 1.09470000, 1.09480000, 1.09490000, 1.09500000, 1.09510000, 1.09520000, 1.09530000, 1.09540000, 1.09550000, 1.09560000, 1.09570000, 1.09580000, 1.09590000, 1.09600000, 1.09610000, 1.09620000, 1.09630000, 1.09640000, 1.09650000, 1.09660000, 1.09670000, 1.09680000, 1.09690000, 1.09700000, 1.09710000, 1.09720000, 1.09730000, 1.09740000, 1.09750000, 1.09760000, 1.09770000, 1.09780000, 1.09790000, 1.09800000, 1.09810000, 1.09820000, 1.09830000, 1.09840000, 1.09850000, 1.09860000, 1.09870000, 1.09880000, 1.09890000, 1.09900000, 1.09910000, 1.09920000, 1.09930000, 1.09940000, 1.09950000, 1.09960000, 1.09970000, 1.09980000, 1.09990000, 1.10000000, 1.10010000, 1.10020000, 1.10030000, 1.10040000, 1.10050000, 1.10060000, 1.10070000, 1.10080000, 1.10090000, 1.10100000, 1.10110000, 1.10120000, 1.10130000, 1.10140000, 1.10150000, 1.10160000, 1.10170000, 1.10180000, 1.10190000, 1.10200000, 1.10210000, 1.10220000, 1.10230000, 1.10240000, 1.10250000, 1.10260000, 1.10270000, 1.10280000, 1.10290000, 1.10300000, 1.10310000, 1.10320000, 1.10330000, 1.10340000, 1.10350000, 1.10360000, 1.10370000, 1.10380000, 1.10390000, 1.10400000, 1.10410000, 1.10420000, 1.10430000, 1.10440000, 1.10450000, 1.10460000, 1.10470000, 1.10480000, 1.10490000, 1.10500000, 1.10510000, 1.10520000, 1.10530000, 1.10540000, 1.10550000, 1.10560000, 1.10570000, 1.10580000, 1.10590000, 1.10600000, 1.10610000, 1.10620000, 1.10630000, 1.10640000, 1.10650000, 1.10660000, 1.10670000, 1.10680000, 1.10690000, 1.10700000, 1.10710000, 1.10720000, 1.10730000, 1.10740000, 1.10750000, 1.10760000, 1.10770000, 1.10780000, 1.10790000, 1.10800000, 1.10810000, 1.10820000, 1.10830000, 1.10840000, 1.10850000, 1.10860000, 1.10870000, 1.10880000, 1.10890000, 1.10900000, 1.10910000, 1.10920000, 1.10930000, 1.10940000, 1.10950000, 1.10960000, 1.10970000, 1.10980000, 1.10990000, 1.11000000, 1.11010000, 1.11020000, 1.11030000, 1.11040000, 1.11050000, 1.11060000, 1.11070000, 1.11080000, 1.11090000, 1.11100000, 1.11110000, 1.11120000, 1.11130000, 1.11140000, 1.11150000, 1.11160000, 1.11170000, 1.11180000, 1.11190000, 1.11200000, 1.11210000, 1.11220000, 1.11230000, 1.11240000, 1.11250000, 1.11260000, 1.11270000, 1.11280000, 1.11290000, 1.11300000, 1.11310000, 1.11320000, 1.11330000, 1.11340000, 1.11350000, 1.11360000, 1.11370000, 1.11380000, 1.11390000, 1.11400000, 1.11410000, 1.11420000, 1.11430000, 1.11440000, 1.11450000, 1.11460000, 1.11470000, 1.11480000, 1.11490000, 1.11500000, 1.11510000, 1.11520000, 1.11530000, 1.11540000, 1.11550000, 1.11560000, 1.11570000, 1.11580000, 1.11590000, 1.11600000, 1.11610000, 1.11620000, 1.11630000, 1.11640000, 1.11650000, 1.11660000, 1.11670000, 1.11680000, 1.11690000, 1.11700000, 1.11710000, 1.11720000, 1.11730000, 1.11740000, 1.11750000, 1.11760000, 1.11770000, 1.11780000, 1.11790000, 1.11800000, 1.11810000, 1.11820000, 1.11830000, 1.11840000, 1.11850000, 1.11860000, 1.11870000, 1.11880000, 1.11890000, 1.11900000, 1.11910000, 1.11920000, 1.11930000, 1.11940000, 1.11950000, 1.11960000, 1.11970000, 1.11980000, 1.11990000, 1.12000000, 1.12010000, 1.12020000, 1.12030000, 1.12040000, 1.12050000, 1.12060000, 1.12070000, 1.12080000, 1.12090000, 1.12100000, 1.12110000, 1.12120000, 1.12130000, 1.12140000, 1.12150000, 1.12160000, 1.12170000, 1.12180000, 1.12190000, 1.12200000, 1.12210000, 1.12220000, 1.12230000, 1.12240000, 1.12250000, 1.12260000, 1.12270000, 1.12280000, 1.12290000, 1.12300000, 1.12310000, 1.12320000, 1.12330000, 1.12340000, 1.12350000, 1.12360000, 1.12370000, 1.12380000, 1.12390000, 1.12400000, 1.12410000, 1.12420000, 1.12430000, 1.12440000, 1.12450000, 1.12460000, 1.12470000, 1.12480000, 1.12490000, 1.12500000, 1.12510000, 1.12520000, 1.12530000, 1.12540000, 1.12550000, 1.12560000, 1.12570000, 1.12580000, 1.12590000, 1.12600000, 1.12610000, 1.12620000, 1.12630000, 1.12640000, 1.12650000, 1.12660000, 1.12670000, 1.12680000, 1.12690000, 1.12700000, 1.12710000, 1.12720000, 1.12730000, 1.12740000, 1.12750000, 1.12760000, 1.12770000, 1.12780000, 1.12790000, 1.12800000, 1.12810000, 1.12820000, 1.12830000, 1.12840000, 1.12850000, 1.12860000, 1.12870000, 1.12880000, 1.12890000, 1.12900000, 1.12910000, 1.12920000, 1.12930000, 1.12940000, 1.12950000, 1.12960000, 1.12970000, 1.12980000, 1.12990000, 1.13000000, 1.13010000, 1.13020000, 1.13030000, 1.13040000, 1.13050000, 1.13060000, 1.13070000, 1.13080000, 1.13090000, 1.13100000, 1.13110000, 1.13120000, 1.13130000, 1.13140000, 1.13150000, 1.13160000, 1.13170000, 1.13180000, 1.13190000, 1.13200000, 1.13210000, 1.13220000, 1.13230000, 1.13240000, 1.13250000, 1.13260000, 1.13270000, 1.13280000, 1.13290000, 1.13300000, 1.13310000, 1.13320000, 1.13330000, 1.13340000, 1.13350000, 1.13360000, 1.13370000, 1.13380000, 1.13390000, 1.13400000, 1.13410000, 1.13420000, 1.13430000, 1.13440000, 1.13450000, 1.13460000, 1.13470000, 1.13480000, 1.13490000, 1.13500000, 1.13510000, 1.13520000, 1.13530000, 1.13540000, 1.13550000, 1.13560000, 1.13570000, 1.13580000, 1.13590000, 1.13600000, 1.13610000, 1.13620000, 1.13630000, 1.13640000, 1.13650000, 1.13660000, 1.13670000, 1.13680000, 1.13690000, 1.13700000, 1.13710000, 1.13720000, 1.13730000, 1.13740000, 1.13750000, 1.13760000, 1.13770000, 1.13780000, 1.13790000, 1.13800000, 1.13810000, 1.13820000, 1.13830000, 1.13840000, 1.13850000, 1.13860000, 1.13870000, 1.13880000, 1.13890000, 1.13900000, 1.13910000, 1.13920000, 1.13930000, 1.13940000, 1.13950000, 1.13960000, 1.13970000, 1.13980000, 1.13990000, 1.14000000, 1.14010000, 1.14020000, 1.14030000, 1.14040000, 1.14050000, 1.14060000, 1.14070000, 1.14080000, 1.14090000, 1.14100000, 1.14110000, 1.14120000, 1.14130000, 1.14140000, 1.14150000, 1.14160000, 1.14170000, 1.14180000, 1.14190000, 1.14200000, 1.14210000, 1.14220000, 1.14230000, 1.14240000, 1.14250000, 1.14260000, 1.14270000, 1.14280000, 1.14290000, 1.14300000, 1.14310000, 1.14320000, 1.14330000, 1.14340000, 1.14350000, 1.14360000, 1.14370000, 1.14380000, 1.14390000, 1.14400000, 1.14410000, 1.14420000, 1.14430000, 1.14440000, 1.14450000, 1.14460000, 1.14470000, 1.14480000, 1.14490000, 1.14500000, 1.14510000, 1.14520000, 1.14530000, 1.14540000, 1.14550000, 1.14560000, 1.14570000, 1.14580000, 1.14590000, 1.14600000, 1.14610000, 1.14620000, 1.14630000, 1.14640000, 1.14650000, 1.14660000, 1.14670000, 1.14680000, 1.14690000, 1.14700000, 1.14710000, 1.14720000, 1.14730000, 1.14740000, 1.14750000, 1.14760000, 1.14770000, 1.14780000, 1.14790000, 1.14800000, 1.14810000, 1.14820000, 1.14830000, 1.14840000, 1.14850000, 1.14860000, 1.14870000, 1.14880000, 1.14890000, 1.14900000, 1.14910000, 1.14920000, 1.14930000, 1.14940000, 1.14950000, 1.14960000, 1.14970000, 1.14980000, 1.14990000, 1.15000000, 1.15010000, 1.15020000, 1.15030000, 1.15040000, 1.15050000, 1.15060000, 1.15070000, 1.15080000, 1.15090000, 1.15100000, 1.15110000, 1.15120000, 1.15130000, 1.15140000, 1.15150000, 1.15160000, 1.15170000, 1.15180000, 1.15190000, 1.15200000, 1.15210000, 1.15220000, 1.15230000, 1.15240000, 1.15250000, 1.15260000, 1.15270000, 1.15280000, 1.15290000, 1.15300000, 1.15310000, 1.15320000, 1.15330000, 1.15340000, 1.15350000, 1.15360000, 1.15370000, 1.15380000, 1.15390000, 1.15400000, 1.15410000, 1.15420000, 1.15430000, 1.15440000, 1.15450000, 1.15460000, 1.15470000, 1.15480000, 1.15490000, 1.15500000, 1.15510000, 1.15520000, 1.15530000, 1.15540000, 1.15550000, 1.15560000, 1.15570000, 1.15580000, 1.15590000, 1.15600000, 1.15610000, 1.15620000, 1.15630000, 1.15640000, 1.15650000, 1.15660000, 1.15670000, 1.15680000, 1.15690000, 1.15700000, 1.15710000, 1.15720000, 1.15730000, 1.15740000, 1.15750000, 1.15760000, 1.15770000, 1.15780000, 1.15790000, 1.15800000, 1.15810000, 1.15820000, 1.15830000, 1.15840000, 1.15850000, 1.15860000, 1.15870000, 1.15880000, 1.15890000, 1.15900000, 1.15910000, 1.15920000, 1.15930000, 1.15940000, 1.15950000, 1.15960000, 1.15970000, 1.15980000, 1.15990000, 1.16000000, 1.16010000, 1.16020000, 1.16030000, 1.16040000, 1.16050000, 1.16060000, 1.16070000, 1.16080000, 1.16090000, 1.16100000, 1.16110000, 1.16120000, 1.16130000, 1.16140000, 1.16150000, 1.16160000, 1.16170000, 1.16180000, 1.16190000, 1.16200000, 1.16210000, 1.16220000, 1.16230000, 1.16240000, 1.16250000, 1.16260000, 1.16270000, 1.16280000, 1.16290000, 1.16300000, 1.16310000, 1.16320000, 1.16330000, 1.16340000, 1.16350000, 1.16360000, 1.16370000, 1.16380000, 1.16390000, 1.16400000, 1.16410000, 1.16420000, 1.16430000, 1.16440000, 1.16450000, 1.16460000, 1.16470000, 1.16480000, 1.16490000, 1.16500000, 1.16510000, 1.16520000, 1.16530000, 1.16540000, 1.16550000, 1.16560000, 1.16570000, 1.16580000, 1.16590000, 1.16600000, 1.16610000, 1.16620000, 1.16630000, 1.16640000, 1.16650000, 1.16660000, 1.16670000, 1.16680000, 1.16690000, 1.16700000, 1.16710000, 1.16720000, 1.16730000, 1.16740000, 1.16750000, 1.16760000, 1.16770000, 1.16780000, 1.16790000, 1.16800000, 1.16810000, 1.16820000, 1.16830000, 1.16840000, 1.16850000, 1.16860000, 1.16870000, 1.16880000, 1.16890000, 1.16900000, 1.16910000, 1.16920000, 1.16930000, 1.16940000, 1.16950000, 1.16960000, 1.16970000, 1.16980000, 1.16990000, 1.17000000, 1.17010000, 1.17020000, 1.17030000, 1.17040000, 1.17050000, 1.17060000, 1.17070000, 1.17080000, 1.17090000, 1.17100000, 1.17110000, 1.17120000, 1.17130000, 1.17140000, 1.17150000, 1.17160000, 1.17170000, 1.17180000, 1.17190000, 1.17200000, 1.17210000, 1.17220000, 1.17230000, 1.17240000, 1.17250000, 1.17260000, 1.17270000, 1.17280000, 1.17290000, 1.17300000, 1.17310000, 1.17320000, 1.17330000, 1.17340000, 1.17350000, 1.17360000, 1.17370000, 1.17380000, 1.17390000, 1.17400000, 1.17410000, 1.17420000, 1.17430000, 1.17440000, 1.17450000, 1.17460000, 1.17470000, 1.17480000, 1.17490000, 1.17500000, 1.17510000, 1.17520000, 1.17530000, 1.17540000, 1.17550000, 1.17560000, 1.17570000, 1.17580000, 1.17590000, 1.17600000, 1.17610000, 1.17620000, 1.17630000, 1.17640000, 1.17650000, 1.17660000, 1.17670000, 1.17680000, 1.17690000, 1.17700000, 1.17710000, 1.17720000, 1.17730000, 1.17740000, 1.17750000, 1.17760000, 1.17770000, 1.17780000, 1.17790000, 1.17800000, 1.17810000, 1.17820000, 1.17830000, 1.17840000, 1.17850000, 1.17860000, 1.17870000, 1.17880000, 1.17890000, 1.17900000, 1.17910000, 1.17920000, 1.17930000, 1.17940000, 1.17950000, 1.17960000, 1.17970000, 1.17980000, 1.17990000, 1.18000000, 1.18010000, 1.18020000, 1.18030000, 1.18040000, 1.18050000, 1.18060000, 1.18070000, 1.18080000, 1.18090000, 1.18100000, 1.18110000, 1.18120000, 1.18130000, 1.18140000, 1.18150000, 1.18160000, 1.18170000, 1.18180000, 1.18190000, 1.18200000, 1.18210000, 1.18220000, 1.18230000, 1.18240000, 1.18250000, 1.18260000, 1.18270000, 1.18280000, 1.18290000, 1.18300000, 1.18310000, 1.18320000, 1.18330000, 1.18340000, 1.18350000, 1.18360000, 1.18370000, 1.18380000, 1.18390000, 1.18400000, 1.18410000, 1.18420000, 1.18430000, 1.18440000, 1.18450000, 1.18460000, 1.18470000, 1.18480000, 1.18490000, 1.18500000, 1.18510000, 1.18520000, 1.18530000, 1.18540000, 1.18550000, 1.18560000, 1.18570000, 1.18580000, 1.18590000, 1.18600000, 1.18610000, 1.18620000, 1.18630000, 1.18640000, 1.18650000, 1.18660000, 1.18670000, 1.18680000, 1.18690000, 1.18700000, 1.18710000, 1.18720000, 1.18730000, 1.18740000, 1.18750000, 1.18760000, 1.18770000, 1.18780000, 1.18790000, 1.18800000, 1.18810000, 1.18820000, 1.18830000, 1.18840000, 1.18850000, 1.18860000, 1.18870000, 1.18880000, 1.18890000, 1.18900000, 1.18910000, 1.18920000, 1.18930000, 1.18940000, 1.18950000, 1.18960000, 1.18970000, 1.18980000, 1.18990000, 1.19000000, 1.19010000, 1.19020000, 1.19030000, 1.19040000, 1.19050000, 1.19060000, 1.19070000, 1.19080000, 1.19090000, 1.19100000, 1.19110000, 1.19120000, 1.19130000, 1.19140000, 1.19150000, 1.19160000, 1.19170000, 1.19180000, 1.19190000, 1.19200000, 1.19210000, 1.19220000, 1.19230000, 1.19240000, 1.19250000, 1.19260000, 1.19270000, 1.19280000, 1.19290000, 1.19300000, 1.19310000, 1.19320000, 1.19330000, 1.19340000, 1.19350000, 1.19360000, 1.19370000, 1.19380000, 1.19390000, 1.19400000, 1.19410000, 1.19420000, 1.19430000, 1.19440000, 1.19450000, 1.19460000, 1.19470000, 1.19480000, 1.19490000, 1.19500000, 1.19510000, 1.19520000, 1.19530000, 1.19540000, 1.19550000, 1.19560000, 1.19570000, 1.19580000, 1.19590000, 1.19600000, 1.19610000, 1.19620000, 1.19630000, 1.19640000, 1.19650000, 1.19660000, 1.19670000, 1.19680000, 1.19690000, 1.19700000, 1.19710000, 1.19720000, 1.19730000, 1.19740000, 1.19750000, 1.19760000, 1.19770000, 1.19780000, 1.19790000, 1.19800000, 1.19810000, 1.19820000, 1.19830000, 1.19840000, 1.19850000, 1.19860000, 1.19870000, 1.19880000, 1.19890000, 1.19900000, 1.19910000, 1.19920000, 1.19930000, 1.19940000, 1.19950000, 1.19960000, 1.19970000, 1.19980000, 1.19990000, 1.20000000, 1.20010000, 1.20020000, 1.20030000, 1.20040000, 1.20050000, 1.20060000, 1.20070000, 1.20080000, 1.20090000, 1.20100000, 1.20110000, 1.20120000, 1.20130000, 1.20140000, 1.20150000, 1.20160000, 1.20170000, 1.20180000, 1.20190000, 1.20200000, 1.20210000, 1.20220000, 1.20230000, 1.20240000, 1.20250000, 1.20260000, 1.20270000, 1.20280000, 1.20290000, 1.20300000, 1.20310000, 1.20320000, 1.20330000, 1.20340000, 1.20350000, 1.20360000, 1.20370000, 1.20380000, 1.20390000, 1.20400000, 1.20410000, 1.20420000, 1.20430000, 1.20440000, 1.20450000, 1.20460000, 1.20470000, 1.20480000, 1.20490000, 1.20500000, 1.20510000, 1.20520000, 1.20530000, 1.20540000, 1.20550000, 1.20560000, 1.20570000, 1.20580000, 1.20590000, 1.20600000, 1.20610000, 1.20620000, 1.20630000, 1.20640000, 1.20650000, 1.20660000, 1.20670000, 1.20680000, 1.20690000, 1.20700000, 1.20710000, 1.20720000, 1.20730000, 1.20740000, 1.20750000, 1.20760000, 1.20770000, 1.20780000, 1.20790000, 1.20800000, 1.20810000, 1.20820000, 1.20830000, 1.20840000, 1.20850000, 1.20860000, 1.20870000, 1.20880000, 1.20890000, 1.20900000, 1.20910000, 1.20920000, 1.20930000, 1.20940000, 1.20950000, 1.20960000, 1.20970000, 1.20980000, 1.20990000, 1.21000000, 1.21010000, 1.21020000, 1.21030000, 1.21040000, 1.21050000, 1.21060000, 1.21070000, 1.21080000, 1.21090000, 1.21100000, 1.21110000, 1.21120000, 1.21130000, 1.21140000, 1.21150000, 1.21160000, 1.21170000, 1.21180000, 1.21190000, 1.21200000, 1.21210000, 1.21220000, 1.21230000, 1.21240000, 1.21250000, 1.21260000, 1.21270000, 1.21280000, 1.21290000, 1.21300000, 1.21310000, 1.21320000, 1.21330000, 1.21340000, 1.21350000, 1.21360000, 1.21370000, 1.21380000, 1.21390000, 1.21400000, 1.21410000, 1.21420000, 1.21430000, 1.21440000, 1.21450000, 1.21460000, 1.21470000, 1.21480000, 1.21490000, 1.21500000, 1.21510000, 1.21520000, 1.21530000, 1.21540000, 1.21550000, 1.21560000, 1.21570000, 1.21580000, 1.21590000, 1.21600000, 1.21610000, 1.21620000, 1.21630000, 1.21640000, 1.21650000, 1.21660000, 1.21670000, 1.21680000, 1.21690000, 1.21700000, 1.21710000, 1.21720000, 1.21730000, 1.21740000, 1.21750000, 1.21760000, 1.21770000, 1.21780000, 1.21790000, 1.21800000, 1.21810000, 1.21820000, 1.21830000, 1.21840000, 1.21850000, 1.21860000, 1.21870000, 1.21880000, 1.21890000, 1.21900000, 1.21910000, 1.21920000, 1.21930000, 1.21940000, 1.21950000, 1.21960000, 1.21970000, 1.21980000, 1.21990000, 1.22000000, 1.22010000, 1.22020000, 1.22030000, 1.22040000, 1.22050000, 1.22060000, 1.22070000, 1.22080000, 1.22090000, 1.22100000, 1.22110000, 1.22120000, 1.22130000, 1.22140000, 1.22150000, 1.22160000, 1.22170000, 1.22180000, 1.22190000, 1.22200000, 1.22210000, 1.22220000, 1.22230000, 1.22240000, 1.22250000, 1.22260000, 1.22270000, 1.22280000, 1.22290000, 1.22300000, 1.22310000, 1.22320000, 1.22330000, 1.22340000, 1.22350000, 1.22360000, 1.22370000, 1.22380000, 1.22390000, 1.22400000, 1.22410000, 1.22420000, 1.22430000, 1.22440000, 1.22450000, 1.22460000, 1.22470000, 1.22480000, 1.22490000, 1.22500000, 1.22510000, 1.22520000, 1.22530000, 1.22540000, 1.22550000, 1.22560000, 1.22570000, 1.22580000, 1.22590000, 1.22600000, 1.22610000, 1.22620000, 1.22630000, 1.22640000, 1.22650000, 1.22660000, 1.22670000, 1.22680000, 1.22690000, 1.22700000, 1.22710000, 1.22720000, 1.22730000, 1.22740000, 1.22750000, 1.22760000, 1.22770000, 1.22780000, 1.22790000, 1.22800000, 1.22810000, 1.22820000, 1.22830000, 1.22840000, 1.22850000, 1.22860000, 1.22870000, 1.22880000, 1.22890000, 1.22900000, 1.22910000, 1.22920000, 1.22930000, 1.22940000, 1.22950000, 1.22960000, 1.22970000, 1.22980000, 1.22990000, 1.23000000, 1.23010000, 1.23020000, 1.23030000, 1.23040000, 1.23050000, 1.23060000, 1.23070000, 1.23080000, 1.23090000, 1.23100000, 1.23110000, 1.23120000, 1.23130000, 1.23140000, 1.23150000, 1.23160000, 1.23170000, 1.23180000, 1.23190000, 1.23200000, 1.23210000, 1.23220000, 1.23230000, 1.23240000, 1.23250000, 1.23260000, 1.23270000, 1.23280000, 1.23290000, 1.23300000, 1.23310000, 1.23320000, 1.23330000, 1.23340000, 1.23350000, 1.23360000, 1.23370000, 1.23380000, 1.23390000, 1.23400000, 1.23410000, 1.23420000, 1.23430000, 1.23440000, 1.23450000, 1.23460000, 1.23470000, 1.23480000, 1.23490000, 1.23500000, 1.23510000, 1.23520000, 1.23530000, 1.23540000, 1.23550000, 1.23560000, 1.23570000, 1.23580000, 1.23590000, 1.23600000, 1.23610000, 1.23620000, 1.23630000, 1.23640000, 1.23650000, 1.23660000, 1.23670000, 1.23680000, 1.23690000, 1.23700000, 1.23710000, 1.23720000, 1.23730000, 1.23740000, 1.23750000, 1.23760000, 1.23770000, 1.23780000, 1.23790000, 1.23800000, 1.23810000, 1.23820000, 1.23830000, 1.23840000, 1.23850000, 1.23860000, 1.23870000, 1.23880000, 1.23890000, 1.23900000, 1.23910000, 1.23920000, 1.23930000, 1.23940000, 1.23950000, 1.23960000, 1.23970000, 1.23980000, 1.23990000, 1.24000000, 1.24010000, 1.24020000, 1.24030000, 1.24040000, 1.24050000, 1.24060000, 1.24070000, 1.24080000, 1.24090000, 1.24100000, 1.24110000, 1.24120000, 1.24130000, 1.24140000, 1.24150000, 1.24160000, 1.24170000, 1.24180000, 1.24190000, 1.24200000, 1.24210000, 1.24220000, 1.24230000, 1.24240000, 1.24250000, 1.24260000, 1.24270000, 1.24280000, 1.24290000, 1.24300000, 1.24310000, 1.24320000, 1.24330000, 1.24340000, 1.24350000, 1.24360000, 1.24370000, 1.24380000, 1.24390000, 1.24400000, 1.24410000, 1.24420000, 1.24430000, 1.24440000, 1.24450000, 1.24460000, 1.24470000, 1.24480000, 1.24490000, 1.24500000, 1.24510000, 1.24520000, 1.24530000, 1.24540000, 1.24550000, 1.24560000, 1.24570000, 1.24580000, 1.24590000, 1.24600000, 1.24610000, 1.24620000, 1.24630000, 1.24640000, 1.24650000, 1.24660000, 1.24670000, 1.24680000, 1.24690000, 1.24700000, 1.24710000, 1.24720000, 1.24730000, 1.24740000, 1.24750000, 1.24760000, 1.24770000, 1.24780000, 1.24790000, 1.24800000, 1.24810000, 1.24820000, 1.24830000, 1.24840000, 1.24850000, 1.24860000, 1.24870000, 1.24880000, 1.24890000, 1.24900000, 1.24910000, 1.24920000, 1.24930000, 1.24940000, 1.24950000, 1.24960000, 1.24970000, 1.24980000, 1.24990000, 1.25000000, 1.25010000, 1.25020000, 1.25030000, 1.25040000, 1.25050000, 1.25060000, 1.25070000, 1.25080000, 1.25090000, 1.25100000, 1.25110000, 1.25120000, 1.25130000, 1.25140000, 1.25150000, 1.25160000, 1.25170000, 1.25180000, 1.25190000, 1.25200000, 1.25210000, 1.25220000, 1.25230000, 1.25240000, 1.25250000, 1.25260000, 1.25270000, 1.25280000, 1.25290000, 1.25300000, 1.25310000, 1.25320000, 1.25330000, 1.25340000, 1.25350000, 1.25360000, 1.25370000, 1.25380000, 1.25390000, 1.25400000, 1.25410000, 1.25420000, 1.25430000, 1.25440000, 1.25450000, 1.25460000, 1.25470000, 1.25480000, 1.25490000, 1.25500000, 1.25510000, 1.25520000, 1.25530000, 1.25540000, 1.25550000, 1.25560000, 1.25570000, 1.25580000, 1.25590000, 1.25600000, 1.25610000, 1.25620000, 1.25630000, 1.25640000, 1.25650000, 1.25660000, 1.25670000, 1.25680000, 1.25690000, 1.25700000, 1.25710000, 1.25720000, 1.25730000, 1.25740000, 1.25750000, 1.25760000, 1.25770000, 1.25780000, 1.25790000, 1.25800000, 1.25810000, 1.25820000, 1.25830000, 1.25840000, 1.25850000, 1.25860000, 1.25870000, 1.25880000, 1.25890000, 1.25900000, 1.25910000, 1.25920000, 1.25930000, 1.25940000, 1.25950000, 1.25960000, 1.25970000, 1.25980000, 1.25990000, 1.26000000, 1.26010000, 1.26020000, 1.26030000, 1.26040000, 1.26050000, 1.26060000, 1.26070000, 1.26080000, 1.26090000, 1.26100000, 1.26110000, 1.26120000, 1.26130000, 1.26140000, 1.26150000, 1.26160000, 1.26170000, 1.26180000, 1.26190000, 1.26200000, 1.26210000, 1.26220000, 1.26230000, 1.26240000, 1.26250000, 1.26260000, 1.26270000, 1.26280000, 1.26290000, 1.26300000, 1.26310000, 1.26320000, 1.26330000, 1.26340000, 1.26350000, 1.26360000, 1.26370000, 1.26380000, 1.26390000, 1.26400000, 1.26410000, 1.26420000, 1.26430000, 1.26440000, 1.26450000, 1.26460000, 1.26470000, 1.26480000, 1.26490000, 1.26500000, 1.26510000, 1.26520000, 1.26530000, 1.26540000, 1.26550000, 1.26560000, 1.26570000, 1.26580000, 1.26590000, 1.26600000, 1.26610000, 1.26620000, 1.26630000, 1.26640000, 1.26650000, 1.26660000, 1.26670000, 1.26680000, 1.26690000, 1.26700000, 1.26710000, 1.26720000, 1.26730000, 1.26740000, 1.26750000, 1.26760000, 1.26770000, 1.26780000, 1.26790000, 1.26800000, 1.26810000, 1.26820000, 1.26830000, 1.26840000, 1.26850000, 1.26860000, 1.26870000, 1.26880000, 1.26890000, 1.26900000, 1.26910000, 1.26920000, 1.26930000, 1.26940000, 1.26950000, 1.26960000, 1.26970000, 1.26980000, 1.26990000, 1.27000000, 1.27010000, 1.27020000, 1.27030000, 1.27040000, 1.27050000, 1.27060000, 1.27070000, 1.27080000, 1.27090000, 1.27100000, 1.27110000, 1.27120000, 1.27130000, 1.27140000, 1.27150000, 1.27160000, 1.27170000, 1.27180000, 1.27190000, 1.27200000, 1.27210000, 1.27220000, 1.27230000, 1.27240000, 1.27250000, 1.27260000, 1.27270000, 1.27280000, 1.27290000, 1.27300000, 1.27310000, 1.27320000, 1.27330000, 1.27340000, 1.27350000, 1.27360000, 1.27370000, 1.27380000, 1.27390000, 1.27400000, 1.27410000, 1.27420000, 1.27430000, 1.27440000, 1.27450000, 1.27460000, 1.27470000, 1.27480000, 1.27490000, 1.27500000, 1.27510000, 1.27520000, 1.27530000, 1.27540000, 1.27550000, 1.27560000, 1.27570000, 1.27580000, 1.27590000, 1.27600000, 1.27610000, 1.27620000, 1.27630000, 1.27640000, 1.27650000, 1.27660000, 1.27670000, 1.27680000, 1.27690000, 1.27700000, 1.27710000, 1.27720000, 1.27730000, 1.27740000, 1.27750000, 1.27760000, 1.27770000, 1.27780000, 1.27790000, 1.27800000, 1.27810000, 1.27820000, 1.27830000, 1.27840000, 1.27850000, 1.27860000, 1.27870000, 1.27880000, 1.27890000, 1.27900000, 1.27910000, 1.27920000, 1.27930000, 1.27940000, 1.27950000, 1.27960000, 1.27970000, 1.27980000, 1.27990000, 1.28000000, 1.28010000, 1.28020000, 1.28030000, 1.28040000, 1.28050000, 1.28060000, 1.28070000, 1.28080000, 1.28090000, 1.28100000, 1.28110000, 1.28120000, 1.28130000, 1.28140000, 1.28150000, 1.28160000, 1.28170000, 1.28180000, 1.28190000, 1.28200000, 1.28210000, 1.28220000, 1.28230000, 1.28240000, 1.28250000, 1.28260000, 1.28270000, 1.28280000, 1.28290000, 1.28300000, 1.28310000, 1.28320000, 1.28330000, 1.28340000, 1.28350000, 1.28360000, 1.28370000, 1.28380000, 1.28390000, 1.28400000, 1.28410000, 1.28420000, 1.28430000, 1.28440000, 1.28450000, 1.28460000, 1.28470000, 1.28480000, 1.28490000, 1.28500000, 1.28510000, 1.28520000, 1.28530000, 1.28540000, 1.28550000, 1.28560000, 1.28570000, 1.28580000, 1.28590000, 1.28600000, 1.28610000, 1.28620000, 1.28630000, 1.28640000, 1.28650000, 1.28660000, 1.28670000, 1.28680000, 1.28690000, 1.28700000, 1.28710000, 1.28720000, 1.28730000, 1.28740000, 1.28750000, 1.28760000, 1.28770000, 1.28780000, 1.28790000, 1.28800000, 1.28810000, 1.28820000, 1.28830000, 1.28840000, 1.28850000, 1.28860000, 1.28870000, 1.28880000, 1.28890000, 1.28900000, 1.28910000, 1.28920000, 1.28930000, 1.28940000, 1.28950000, 1.28960000, 1.28970000, 1.28980000, 1.28990000, 1.29000000, 1.29010000, 1.29020000, 1.29030000, 1.29040000, 1.29050000, 1.29060000, 1.29070000, 1.29080000, 1.29090000, 1.29100000, 1.29110000, 1.29120000, 1.29130000, 1.29140000, 1.29150000, 1.29160000, 1.29170000, 1.29180000, 1.29190000, 1.29200000, 1.29210000, 1.29220000, 1.29230000, 1.29240000, 1.29250000, 1.29260000, 1.29270000, 1.29280000, 1.29290000, 1.29300000, 1.29310000, 1.29320000, 1.29330000, 1.29340000, 1.29350000, 1.29360000, 1.29370000, 1.29380000, 1.29390000, 1.29400000, 1.29410000, 1.29420000, 1.29430000, 1.29440000, 1.29450000, 1.29460000, 1.29470000, 1.29480000, 1.29490000, 1.29500000, 1.29510000, 1.29520000, 1.29530000, 1.29540000, 1.29550000, 1.29560000, 1.29570000, 1.29580000, 1.29590000, 1.29600000, 1.29610000, 1.29620000, 1.29630000, 1.29640000, 1.29650000, 1.29660000, 1.29670000, 1.29680000, 1.29690000, 1.29700000, 1.29710000, 1.29720000, 1.29730000, 1.29740000, 1.29750000, 1.29760000, 1.29770000, 1.29780000, 1.29790000, 1.29800000, 1.29810000, 1.29820000, 1.29830000, 1.29840000, 1.29850000, 1.29860000, 1.29870000, 1.29880000, 1.29890000, 1.29900000, 1.29910000, 1.29920000, 1.29930000, 1.29940000, 1.29950000, 1.29960000, 1.29970000, 1.29980000, 1.29990000, 1.29990000, 1.30289658, 1.30590007, 1.30891048, 1.31192783, 1.31495213, 1.31798341, 1.32102168, 1.32406695, 1.32711923, 1.33017856, 1.33324494, 1.33631839, 1.33939892, 1.34248655, 1.34558130, 1.34868319, 1.35179222, 1.35490843, 1.35803181, 1.36116240, 1.36430020, 1.36744524, 1.37059753, 1.37375708, 1.37692392, 1.38009805, 1.38327951, 1.38646830, 1.38966444, 1.39286794, 1.39607884, 1.39929713, 1.40252284, 1.40575599, 1.40899660, 1.41224467, 1.41550023, 1.41876329, 1.42203388, 1.42531201, 1.42859769, 1.43189095, 1.43519180, 1.43850026, 1.44181634, 1.44514007, 1.44847146, 1.45181054, 1.45515730, 1.45851179, 1.46187401, 1.46524397, 1.46862171, 1.47200723, 1.47540056, 1.47880171, 1.48221070, 1.48562755, 1.48905227, 1.49248489, 1.49592543, 1.49937389, 1.50283030, 1.50629469, 1.50976705, 1.51324743, 1.51673582, 1.52023226, 1.52373676, 1.52724933, 1.53077000, 1.53429879, 1.53783572, 1.54138080, 1.54493405, 1.54849549, 1.55206514, 1.55564302, 1.55922914, 1.56282354, 1.56642622, 1.57003720, 1.57365651, 1.57728417, 1.58092018, 1.58456458, 1.58821738, 1.59187860, 1.59554826, 1.59922638, 1.60291297, 1.60660807, 1.61031168, 1.61402383, 1.61774454, 1.62147383, 1.62521171, 1.62895821, 1.63271335, 1.63647714, 1.64024961, 1.64403078, 1.64782066, 1.65161928, 1.65542666, 1.65924281, 1.66306776, 1.66690152, 1.67074413, 1.67459559, 1.67845593, 1.68232517, 1.68620333, 1.69009043, 1.69398650, 1.69789154, 1.70180558, 1.70572865, 1.70966076, 1.71360193, 1.71755219, 1.72151156, 1.72548006, 1.72945770, 1.73344451, 1.73744051, 1.74144573, 1.74546017, 1.74948387, 1.75351685, 1.75755912, 1.76161072, 1.76567165, 1.76974194, 1.77382162, 1.77791070, 1.78200921, 1.78611716, 1.79023459, 1.79436151, 1.79849794, 1.80264390, 1.80679943, 1.81096453, 1.81513923, 1.81932356, 1.82351753, 1.82772118, 1.83193451, 1.83615755, 1.84039033, 1.84463287, 1.84888519, 1.85314731, 1.85741926, 1.86170105, 1.86599271, 1.87029427, 1.87460575, 1.87892716, 1.88325853, 1.88759989, 1.89195126, 1.89631266, 1.90068411, 1.90506564, 1.90945727, 1.91385902, 1.91827092, 1.92269299, 1.92712526, 1.93156774, 1.93602046, 1.94048345, 1.94495673, 1.94944032, 1.95393424, 1.95843853, 1.96295319, 1.96747827, 1.97201377, 1.97655973, 1.98111617, 1.98568312, 1.99026059, 1.99484862, 1.99944722, 2.00405642, 2.00867625, 2.01330672, 2.01794787, 2.02259972, 2.02726230, 2.03193562, 2.03661972, 2.04131461, 2.04602033, 2.05073689, 2.05546433, 2.06020266, 2.06495192, 2.06971212, 2.07448330, 2.07926548, 2.08405868, 2.08886293, 2.09367826, 2.09850469, 2.10334224, 2.10819095, 2.11305083, 2.11792191, 2.12280423, 2.12769780, 2.13260265, 2.13751880, 2.14244629, 2.14738514, 2.15233538, 2.15729702, 2.16227010, 2.16725465, 2.17225069, 2.17725824, 2.18227734, 2.18730801, 2.19235028, 2.19740417, 2.20246971, 2.20754692, 2.21263585, 2.21773650, 2.22284891, 2.22797310, 2.23310911, 2.23825696, 2.24341668, 2.24858829, 2.25377182, 2.25896730, 2.26417475, 2.26939422, 2.27462571, 2.27986926, 2.28512491, 2.29039266, 2.29567256, 2.30096463, 2.30626891, 2.31158541, 2.31691416, 2.32225520, 2.32760855, 2.33297424, 2.33835230, 2.34374276, 2.34914565, 2.35456099, 2.35998881, 2.36542915, 2.37088202, 2.37634747, 2.38182552, 2.38731619, 2.39281952, 2.39833554, 2.40386428, 2.40940576, 2.41496001, 2.42052707, 2.42610696, 2.43169971, 2.43730536, 2.44292393, 2.44855545, 2.45419995, 2.45985747, 2.46552803, 2.47121166, 2.47690839, 2.48261825, 2.48834128, 2.49407750, 2.49982694, 2.50558963, 2.51136562, 2.51715491, 2.52295755, 2.52877357, 2.53460300, 2.54044586, 2.54630219, 2.55217202, 2.55805539, 2.56395231, 2.56986284, 2.57578698, 2.58172478, 2.58767627, 2.59364148, 2.59962044, 2.60561319, 2.61161975, 2.61764015, 2.62367444, 2.62972263, 2.63578477, 2.64186088, 2.64795100, 2.65405515, 2.66017338, 2.66630572, 2.67245219, 2.67861282, 2.68478766, 2.69097674, 2.69718008, 2.70339772, 2.70962970, 2.71587604, 2.72213678, 2.72841195, 2.73470159, 2.74100573, 2.74732440, 2.75365764, 2.76000548, 2.76636795, 2.77274508, 2.77913692, 2.78554349, 2.79196483, 2.79840098, 2.80485196, 2.81131781, 2.81779857, 2.82429426, 2.83080493, 2.83733061, 2.84387133, 2.85042714, 2.85699805, 2.86358411, 2.87018535, 2.87680181, 2.88343353, 2.89008053, 2.89674285, 2.90342053, 2.91011361, 2.91682211, 2.92354608, 2.93028555, 2.93704056, 2.94381114, 2.95059732, 2.95739915, 2.96421666, 2.97104988, 2.97789886, 2.98476363, 2.99164422, 2.99854067, 3.00545302, 3.01238131, 3.01932556, 3.02628583, 3.03326214, 3.04025453, 3.04726304, 3.05428770, 3.06132856, 3.06838566, 3.07545901, 3.08254868, 3.08965469, 3.09677708, 3.10391589, 3.11107115, 3.11824291, 3.12543120, 3.13263607, 3.13985754, 3.14709566, 3.15435046, 3.16162199, 3.16891028, 3.17621538, 3.18353731, 3.19087612, 3.19823185, 3.20560453, 3.21299422, 3.22040093, 3.22782472, 3.23526563, 3.24272369, 3.25019894, 3.25769142, 3.26520117, 3.27272824, 3.28027266, 3.28783447, 3.29541371, 3.30301042, 3.31062465, 3.31825642, 3.32590579, 3.33357280, 3.34125748, 3.34895987, 3.35668002, 3.36441797, 3.37217375, 3.37994742, 3.38773900, 3.39554854, 3.40337609, 3.41122168, 3.41908536, 3.42696717, 3.43486714, 3.44278533, 3.45072177, 3.45867651, 3.46664958, 3.47464103, 3.48265091, 3.49067924, 3.49872609, 3.50679149, 3.51487548, 3.52297810, 3.53109941, 3.53923943, 3.54739822, 3.55557582, 3.56377227, 3.57198761, 3.58022189, 3.58847516, 3.59674744, 3.60503880, 3.61334928, 3.62167891, 3.63002774, 3.63839582, 3.64678319, 3.65518989, 3.66361597, 3.67206148, 3.68052646, 3.68901095, 3.69751499, 3.70603865, 3.71458195, 3.72314494, 3.73172768, 3.74033020, 3.74895255, 3.75759478, 3.76625693, 3.77493905, 3.78364118, 3.79236338, 3.80110568, 3.80986813, 3.81865078, 3.82745368, 3.83627687, 3.84512041, 3.85398432, 3.86286867, 3.87177351, 3.88069887, 3.88964480, 3.89861136, 3.90759859, 3.91660653, 3.92563524, 3.93468477, 3.94375515, 3.95284644, 3.96195870, 3.97109196, 3.98024627, 3.98942168, 3.99861825, 4.00783602, 4.01707503, 4.02633535, 4.03561701, 4.04492007, 4.05424457, 4.06359057, 4.07295811, 4.08234725, 4.09175803, 4.10119051, 4.11064473, 4.12012075, 4.12961860, 4.13913836, 4.14868006, 4.15824375, 4.16782949, 4.17743733, 4.18706732, 4.19671951, 4.20639395, 4.21609069, 4.22580978, 4.23555128, 4.24531523, 4.25510169, 4.26491072, 4.27474235, 4.28459665, 4.29447366, 4.30437345, 4.31429605, 4.32424153, 4.33420994, 4.34420133, 4.35421574, 4.36425325, 4.37431389, 4.38439773, 4.39450481, 4.40463519, 4.41478892, 4.42496606, 4.43516666, 4.44539077, 4.45563846, 4.46590976, 4.47620475, 4.48652347, 4.49686597, 4.50723232, 4.51762256, 4.52803676, 4.53847496, 4.54893723, 4.55942361, 4.56993417, 4.58046895, 4.59102802, 4.60161144, 4.61221925, 4.62285151, 4.63350828, 4.64418962, 4.65489559, 4.66562623, 4.67638161, 4.68716178, 4.69796680, 4.70879674, 4.71965163, 4.73053155, 4.74143656, 4.75236670, 4.76332203, 4.77430262, 4.78530853, 4.79633980, 4.80739651, 4.81847870, 4.82958644, 4.84071979, 4.85187880, 4.86306354, 4.87427406, 4.88551042, 4.89677268, 4.90806091, 4.91937516, 4.93071549, 4.94208196, 4.95347464, 4.96489358, 4.97633884, 4.98781048, 4.99930857, 5.01083317, 5.02238433, 5.03396213, 5.04556661, 5.05719784, 5.06885588, 5.08054080, 5.09225266, 5.10399152, 5.11575743, 5.12755047, 5.13937069, 5.15121817, 5.16309295, 5.17499511, 5.18692471, 5.19888180, 5.21086646, 5.22287875, 5.23491873, 5.24698646, 5.25908202, 5.27120545, 5.28335684, 5.29553623, 5.30774370, 5.31997932, 5.33224313, 5.34453522, 5.35685565, 5.36920448, 5.38158177, 5.39398760, 5.40642203, 5.41888512, 5.43137694, 5.44389755, 5.45644703, 5.46902544, 5.48163285, 5.49426932, 5.50693492, 5.51962971, 5.53235377, 5.54510716, 5.55788996, 5.57070222, 5.58354401, 5.59641541, 5.60931648, 5.62224729, 5.63520791, 5.64819840, 5.66121885, 5.67426930, 5.68734984, 5.70046054, 5.71360146, 5.72677267, 5.73997425, 5.75320625, 5.76646876, 5.77976185, 5.79308557, 5.80644001, 5.81982524, 5.83324132, 5.84668833, 5.86016634, 5.87367542, 5.88721564, 5.90078707, 5.91438979, 5.92802387, 5.94168938, 5.95538639, 5.96911497, 5.98287520, 5.99666715, 6.01049090, 6.02434651, 6.03823406, 6.05215363, 6.06610528, 6.08008910, 6.09410515, 6.10815352, 6.12223427, 6.13634747, 6.15049322, 6.16467157, 6.17888260, 6.19312640, 6.20740303, 6.22171257, 6.23605510, 6.25043069, 6.26483942, 6.27928137, 6.29375661, 6.30826521, 6.32280727, 6.33738284, 6.35199202, 6.36663487, 6.38131148, 6.39602192, 6.41076628, 6.42554462, 6.44035703, 6.45520359, 6.47008437, 6.48499945, 6.49994892, 6.51493285, 6.52995132, 6.54500441, 6.56009221, 6.57521478, 6.59037222, 6.60556459, 6.62079199, 6.63605449, 6.65135218, 6.66668513, 6.68205343, 6.69745715, 6.71289638, 6.72837121, 6.74388171, 6.75942796, 6.77501005, 6.79062806, 6.80628208, 6.82197218, 6.83769845, 6.85346097, 6.86925983, 6.88509511, 6.90096689, 6.91687526, 6.93282031, 6.94880211, 6.96482075, 6.98087632, 6.99696890, 7.01309858, 7.02926544, 7.04546957, 7.06171106, 7.07798998, 7.09430644, 7.11066050, 7.12705227, 7.14348182, 7.15994925, 7.17645463, 7.19299807, 7.20957964, 7.22619944, 7.24285755, 7.25955406, 7.27628906, 7.29306264, 7.30987489, 7.32672589, 7.34361574, 7.36054452, 7.37751233, 7.39451925, 7.41156538, 7.42865080, 7.44577561, 7.46293989, 7.48014375, 7.49738726, 7.51467052, 7.53199362, 7.54935666, 7.56675973, 7.58420291, 7.60168630, 7.61921000, 7.63677409, 7.65437868, 7.67202384, 7.68970968, 7.70743629, 7.72520377, 7.74301220, 7.76086169, 7.77875232, 7.79668420, 7.81465741, 7.83267206, 7.85072823, 7.86882603, 7.88696555, 7.90514688, 7.92337013, 7.94163538, 7.95994274, 7.97829231, 7.99668417, 8.01511843, 8.03359519, 8.05211453, 8.07067658, 8.08928141, 8.10792913, 8.12661983, 8.14535363, 8.16413061, 8.18295087, 8.20181452, 8.22072166, 8.23967238, 8.25866678, 8.27770498, 8.29678706, 8.31591313, 8.33508329, 8.35429764, 8.37355628, 8.39285932, 8.41220686, 8.43159900, 8.45103584, 8.47051749, 8.49004405, 8.50961563, 8.52923232, 8.54889423, 8.56860146, 8.58835413, 8.60815233, 8.62799617, 8.64788576, 8.66782119, 8.68780258, 8.70783004, 8.72790366, 8.74802356, 8.76818983, 8.78840260, 8.80866196, 8.82896802, 8.84932089, 8.86972069, 8.89016750, 8.91066146, 8.93120265, 8.95179120, 8.97242721, 8.99311079, 9.01384205, 9.03462110, 9.05544806, 9.07632302, 9.09724611, 9.11821742, 9.13923709, 9.16030520, 9.18142189, 9.20258725, 9.22380141, 9.24506446, 9.26637654, 9.28773774, 9.30914819, 9.33060799, 9.35211727, 9.37367612, 9.39528468, 9.41694305, 9.43865134, 9.46040968, 9.48221818, 9.50407695, 9.52598611, 9.54794577, 9.56995606, 9.59201709, 9.61412897, 9.63629183, 9.65850577, 9.68077093, 9.70308741, 9.72545534, 9.74787483, 9.77034600, 9.79286897, 9.81544387, 9.83807080, 9.86074990, 9.88348127, 9.90626505, 9.92910135, 9.95199029, 9.97493200, 9.99792659, 10.02097419, 10.04407493, 10.06722891, 10.09043627, 10.11369713, 10.13701161, 10.16037983, 10.18380193, 10.20727801, 10.23080822, 10.25439267, 10.27803149, 10.30172479, 10.32547272, 10.34927540, 10.37313294, 10.39704548, 10.42101315, 10.44503606, 10.46911436, 10.49324816, 10.51743759, 10.54168279, 10.56598388, 10.59034099, 10.61475425, 10.63922378, 10.66374972, 10.68833221, 10.71297136, 10.73766731, 10.76242019, 10.78723013, 10.81209726, 10.83702172, 10.86200363, 10.88704314, 10.91214036, 10.93729545, 10.96250852, 10.98777971, 11.01310916, 11.03849699, 11.06394336, 11.08944838, 11.11501220, 11.14063495, 11.16631677, 11.19205778, 11.21785814, 11.24371798, 11.26963742, 11.29561662, 11.32165571, 11.34775482, 11.37391409, 11.40013367, 11.42641370, 11.45275430, 11.47915563, 11.50561781, 11.53214100, 11.55872533, 11.58537094, 11.61207798, 11.63884659, 11.66567690, 11.69256906, 11.71952322, 11.74653951, 11.77361808, 11.80075907, 11.82796263, 11.85522890, 11.88255803, 11.90995015, 11.93740542, 11.96492398, 11.99250598, 12.02015156, 12.04786087, 12.07563406, 12.10347127, 12.13137266, 12.15933836, 12.18736853, 12.21546331, 12.24362287, 12.27184733, 12.30013686, 12.32849160, 12.35691171, 12.38539734, 12.41394863, 12.44256573, 12.47124881, 12.49999801, 12.52881348, 12.55769538, 12.58664385, 12.61565906, 12.64474116, 12.67389030, 12.70310664, 12.73239032, 12.76174151, 12.79116036, 12.82064703, 12.85020168, 12.87982445, 12.90951551, 12.93927502, 12.96910313, 12.99900000, 13.02896579, 13.05900066, 13.08910476, 13.11927827, 13.14952133, 13.17983410, 13.21021676, 13.24066945, 13.27119235, 13.30178561, 13.33244939, 13.36318386, 13.39398918, 13.42486551, 13.45581302, 13.48683188, 13.51792224, 13.54908426, 13.58031813, 13.61162400, 13.64300203, 13.67445240, 13.70597527, 13.73757080, 13.76923917, 13.80098055, 13.83279509, 13.86468298, 13.89664438, 13.92867945, 13.96078837, 13.99297131, 14.02522844, 14.05755993, 14.08996596, 14.12244668, 14.15500228, 14.18763293, 14.22033881, 14.25312007, 14.28597691, 14.31890948, 14.35191798, 14.38500257, 14.41816342, 14.45140072, 14.48471464, 14.51810536, 14.55157305, 14.58511789, 14.61874006, 14.65243973, 14.68621709, 14.72007232, 14.75400559, 14.78801709, 14.82210699, 14.85627547, 14.89052273, 14.92484893, 14.95925426, 14.99373890, 15.02830304, 15.06294685, 15.09767053, 15.13247426, 15.16735821, 15.20232258, 15.23736756, 15.27249332, 15.30770005, 15.34298794, 15.37835718, 15.41380796, 15.44934045, 15.48495486, 15.52065137, 15.55643017, 15.59229144, 15.62823539, 15.66426219, 15.70037204, 15.73656514, 15.77284167, 15.80920182, 15.84564580, 15.88217378, 15.91878597, 15.95548257, 15.99226375, 16.02912973, 16.06608069, 16.10311683, 16.14023835, 16.17744544, 16.21473830, 16.25211713, 16.28958213, 16.32713350, 16.36477143, 16.40249612, 16.44030778, 16.47820660, 16.51619279, 16.55426655, 16.59242808, 16.63067757, 16.66901524, 16.70744129, 16.74595592, 16.78455934, 16.82325174, 16.86203334, 16.90090434, 16.93986495, 16.97891537, 17.01805582, 17.05728649, 17.09660759, 17.13601934, 17.17552195, 17.21511562, 17.25480056, 17.29457698, 17.33444510, 17.37440512, 17.41445726, 17.45460173, 17.49483874, 17.53516851, 17.57559125, 17.61610717, 17.65671649, 17.69741943, 17.73821619, 17.77910700, 17.82009208, 17.86117163, 17.90234589, 17.94361506, 17.98497936, 18.02643902, 18.06799425, 18.10964528, 18.15139233, 18.19323561, 18.23517535, 18.27721177, 18.31934509, 18.36157554, 18.40390335, 18.44632872, 18.48885190, 18.53147311, 18.57419257, 18.61701050, 18.65992714, 18.70294272, 18.74605745, 18.78927158, 18.83258532, 18.87599892, 18.91951259, 18.96312657, 19.00684109, 19.05065638, 19.09457268, 19.13859022, 19.18270923, 19.22692994, 19.27125259, 19.31567741, 19.36020465, 19.40483453, 19.44956729, 19.49440318, 19.53934242, 19.58438525, 19.62953192, 19.67478267, 19.72013773, 19.76559734, 19.81116175, 19.85683119, 19.90260591, 19.94848616, 19.99447217, 20.04056419, 20.08676246, 20.13306723, 20.17947874, 20.22599725, 20.27262298, 20.31935621, 20.36619716, 20.41314609, 20.46020326, 20.50736889, 20.55464326, 20.60202661, 20.64951919, 20.69712124, 20.74483303, 20.79265481, 20.84058683, 20.88862935, 20.93678261, 20.98504688, 21.03342241, 21.08190946, 21.13050828, 21.17921913, 21.22804227, 21.27697796, 21.32602646, 21.37518803, 21.42446293, 21.47385142, 21.52335376, 21.57297021, 21.62270104, 21.67254652, 21.72250690, 21.77258245, 21.82277343, 21.87308012, 21.92350278, 21.97404167, 22.02469707, 22.07546924, 22.12635845, 22.17736497, 22.22848908, 22.27973104, 22.33109112, 22.38256961, 22.43416676, 22.48588285, 22.53771817, 22.58967297, 22.64174755, 22.69394217, 22.74625711, 22.79869264, 22.85124906, 22.90392663, 22.95672563, 23.00964635, 23.06268906, 23.11585405, 23.16914160, 23.22255199, 23.27608550, 23.32974242, 23.38352303, 23.43742761, 23.49145646, 23.54560986, 23.59988810, 23.65429146, 23.70882023, 23.76347471, 23.81825518, 23.87316193, 23.92819525, 23.98335543, 24.03864278, 24.09405757, 24.14960011, 24.20527069, 24.26106960, 24.31699714, 24.37305361, 24.42923930, 24.48555451, 24.54199955, 24.59857470, 24.65528027, 24.71211656, 24.76908387, 24.82618251, 24.88341277, 24.94077496, 24.99826938, 25.05589635, 25.11365615, 25.17154911, 25.22957552, 25.28773570, 25.34602995, 25.40445859, 25.46302191, 25.52172024, 25.58055388, 25.63952315, 25.69862835, 25.75786981, 25.81724783, 25.87676273, 25.93641483, 25.99620444, 26.05613188, 26.11619747, 26.17640152, 26.23674436, 26.29722630, 26.35784767, 26.41860879, 26.47950997, 26.54055154, 26.60173383, 26.66305716, 26.72452186, 26.78612824, 26.84787665, 26.90976739, 26.97180081, 27.03397724, 27.09629699, 27.15876040, 27.22136781, 27.28411955, 27.34701594, 27.41005732, 27.47324403, 27.53657640, 27.60005476, 27.66367946, 27.72745083, 27.79136920, 27.85543492, 27.91964833, 27.98400977, 28.04851957, 28.11317809, 28.17798566, 28.24294262, 28.30804933, 28.37330612, 28.43871335, 28.50427135, 28.56998049, 28.63584109, 28.70185352, 28.76801813, 28.83433526, 28.90080527, 28.96742851, 29.03420532, 29.10113608, 29.16822113, 29.23546082, 29.30285552, 29.37040558, 29.43811135, 29.50597321, 29.57399150, 29.64216659, 29.71049885, 29.77898862, 29.84763628, 29.91644218, 29.98540671, 30.05453021, 30.12381305, 30.19325562, 30.26285826, 30.33262135, 30.40254527, 30.47263037, 30.54287704, 30.61328564, 30.68385655, 30.75459015, 30.82548680, 30.89654689, 30.96777078, 31.03915887, 31.11071152, 31.18242911, 31.25431204, 31.32636067, 31.39857539, 31.47095658, 31.54350463, 31.61621991, 31.68910283, 31.76215375, 31.83537308, 31.90876119, 31.98231849, 32.05604534, 32.12994216, 32.20400933, 32.27824724, 32.35265628, 32.42723686, 32.50198936, 32.57691418, 32.65201172, 32.72728238, 32.80272656, 32.87834466, 32.95413707, 33.03010420, 33.10624645, 33.18256423, 33.25905794, 33.33572799, 33.41257478, 33.48959872, 33.56680022, 33.64417968, 33.72173753, 33.79947416, 33.87739000, 33.95548545, 34.03376092, 34.11221685, 34.19085363, 34.26967168, 34.34867144, 34.42785330, 34.50721770, 34.58676505, 34.66649578, 34.74641031, 34.82650905, 34.90679245, 34.98726092, 35.06791488, 35.14875478, 35.22978102, 35.31099406, 35.39239430, 35.47398220, 35.55575817, 35.63772266, 35.71987610, 35.80221891, 35.88475155, 35.96747445, 36.05038804, 36.13349277, 36.21678907, 36.30027739, 36.38395817, 36.46783186, 36.55189889, 36.63615972, 36.72061479, 36.80526455, 36.89010945, 36.97514994, 37.06038646, 37.14581947, 37.23144943, 37.31727679, 37.40330199, 37.48952551, 37.57594779, 37.66256930, 37.74939049, 37.83641182, 37.92363375, 38.01105676, 38.09868130, 38.18650783, 38.27453682, 38.36276874, 38.45120405, 38.53984323, 38.62868675, 38.71773507, 38.80698866, 38.89644801, 38.98611358, 39.07598586, 39.16606531, 39.25635241, 39.34684765, 39.43755150, 39.52846445, 39.61958697, 39.71091955, 39.80246267, 39.89421683, 39.98618249, 40.07836017, 40.17075033, 40.26335347, 40.35617009, 40.44920067, 40.54244570, 40.63590569, 40.72958113, 40.82347251, 40.91758034, 41.01190510, 41.10644730, 41.20120745, 41.29618604, 41.39138358, 41.48680058, 41.58243753, 41.67829495, 41.77437334, 41.87067322, 41.96719509, 42.06393946, 42.16090686, 42.25809779, 42.35551276, 42.45315230, 42.55101693, 42.64910715, 42.74742350, 42.84596649, 42.94473664, 43.04373448, 43.14296054, 43.24241533, 43.34209940, 43.44201325, 43.54215744, 43.64253248, 43.74313890, 43.84397725, 43.94504806, 44.04635186, 44.14788918, 44.24966058, 44.35166658, 44.45390773, 44.55638457, 44.65909765, 44.76204750, 44.86523468, 44.96865972, 45.07232319, 45.17622563, 45.28036758, 45.38474961, 45.48937226, 45.59423610, 45.69934166, 45.80468953, 45.91028024, 46.01611437, 46.12219247, 46.22851510, 46.33508283, 46.44189623, 46.54895586, 46.65626228, 46.76381608, 46.87161781, 46.97966804, 47.08796736, 47.19651634, 47.30531555, 47.41436556, 47.52366696, 47.63322033, 47.74302624, 47.85308528, 47.96339804, 48.07396509, 48.18478702, 48.29586443, 48.40719790, 48.51878801, 48.63063537, 48.74274056, 48.85510418, 48.96772683, 49.08060910, 49.19375159, 49.30715490, 49.42081963, 49.53474638, 49.64893577, 49.76338838, 49.87810484, 49.99308575, 50.10833171, 50.22384335, 50.33962126, 50.45566608, 50.57197840, 50.68855885, 50.80540804, 50.92252661, 51.03991515, 51.15757431, 51.27550470, 51.39370694, 51.51218167, 51.63092952, 51.74995110, 51.86924706, 51.98881802, 52.10866462, 52.22878750, 52.34918729, 52.46986463, 52.59082016, 52.71205452, 52.83356836, 52.95536231, 53.07743703, 53.19979316, 53.32243135, 53.44535225, 53.56855651, 53.69204478, 53.81581773, 53.93987600, 54.06422026, 54.18885116, 54.31376936, 54.43897553, 54.56447033, 54.69025442, 54.81632848, 54.94269317, 55.06934916, 55.19629712, 55.32353772, 55.45107165, 55.57889957, 55.70702217, 55.83544012, 55.96415410, 56.09316480, 56.22247290, 56.35207908, 56.48198404, 56.61218846, 56.74269303, 56.87349845, 57.00460540, 57.13601459, 57.26772671, 57.39974245, 57.53206252, 57.66468762, 57.79761846, 57.93085573, 58.06440014, 58.19825241, 58.33241324, 58.46688334, 58.60166342, 58.73675421, 58.87215641, 59.00787075, 59.14389794, 59.28023870, 59.41689377, 59.55386385, 59.69114969, 59.82875200, 59.96667152, 60.10490897, 60.24346510, 60.38234063, 60.52153630, 60.66105285, 60.80089102, 60.94105155, 61.08153518, 61.22234266, 61.36347473, 61.50493215, 61.64671566, 61.78882602, 61.93126397, 62.07403028, 62.21712570, 62.36055099, 62.50430690, 62.64839421, 62.79281368, 62.93756606, 63.08265214, 63.22807267, 63.37382843, 63.51992019, 63.66634873, 63.81311482, 63.96021924, 64.10766278, 64.25544620, 64.40357030, 64.55203587, 64.70084368, 64.84999452, 64.99948920, 65.14932850, 65.29951321, 65.45004414, 65.60092207, 65.75214781, 65.90372217, 66.05564594, 66.20791993, 66.36054495, 66.51352180, 66.66685131, 66.82053427, 66.97457151, 67.12896384, 67.28371209, 67.43881706, 67.59427959, 67.75010050, 67.90628061, 68.06282075, 68.21972176, 68.37698446, 68.53460969, 68.69259828, 68.85095107, 69.00966891, 69.16875262, 69.32820306, 69.48802108, 69.64820751, 69.80876321, 69.96968903, 70.13098582, 70.29265444, 70.45469574, 70.61711059, 70.77989984, 70.94306436, 71.10660502, 71.27052267, 71.43481819, 71.59949246, 71.76454633, 71.92998070, 72.09579643, 72.26199440, 72.42857550, 72.59554061, 72.76289062, 72.93062640, 73.09874886, 73.26725888, 73.43615736, 73.60544518, 73.77512326, 73.94519248, 74.11565375, 74.28650798, 74.45775607, 74.62939892, 74.80143745, 74.97387258, 75.14670520, 75.31993625, 75.49356663, 75.66759728, 75.84202910, 76.01686304, 76.19210001, 76.36774094, 76.54378676, 76.72023841, 76.89709683, 77.07436294, 77.25203770, 77.43012204, 77.60861690, 77.78752324, 77.96684200, 78.14657414, 78.32672059, 78.50728233, 78.68826031, 78.86965548, 79.05146882, 79.23370127, 79.41635382, 79.59942742, 79.78292305, 79.96684168, 80.15118429, 80.33595185, 80.52114535, 80.70676576, 80.89281407, 81.07929126, 81.26619833, 81.45353627, 81.64130606, 81.82950871, 82.01814521, 82.20721656, 82.39672377, 82.58666783, 82.77704976, 82.96787057, 83.15913126, 83.35083286, 83.54297637, 83.73556282, 83.92859323, 84.12206862, 84.31599002, 84.51035845, 84.70517494, 84.90044054, 85.09615627, 85.29232317, 85.48894228, 85.68601464, 85.88354131, 86.08152332, 86.27996172, 86.47885757, 86.67821193, 86.87802584, 87.07830038, 87.27903659, 87.48023555, 87.68189832, 87.88402597, 88.08661957, 88.28968020, 88.49320894, 88.69720685, 88.90167503, 89.10661456, 89.31202652, 89.51791200, 89.72427210, 89.93110791, 90.13842052, 90.34621104, 90.55448057, 90.76323021, 90.97246106, 91.18217424, 91.39237086, 91.60305204, 91.81421888, 92.02587251, 92.23801406, 92.45064464, 92.66376539, 92.87737743, 93.09148189, 93.30607992, 93.52117265, 93.73676122, 93.95284677, 94.16943045, 94.38651341, 94.60409679, 94.82218176, 95.04076946, 95.25986106, 95.47945772, 95.69956060, 95.92017087, 96.14128970, 96.36291827, 96.58505774, 96.80770929, 97.03087411, 97.25455337, 97.47874827, 97.70345999, 97.92868973, 98.15443867, 98.38070802, 98.60749898, 98.83481274, 99.06265051, 99.29101351, 99.51990293, 99.74932000, 99.97926593,
];

var B0column = [
  0.00200000, 0.00400000, 0.00599999, 0.00799997, 0.00999994, 0.01199989, 0.01399983, 0.01599974, 0.01799964, 0.01999950, 0.02199933, 0.02399914, 0.02599890, 0.02799863, 0.02999831, 0.03199795, 0.03399754, 0.03599708, 0.03799657, 0.03999600, 0.04199537, 0.04399468, 0.04599392, 0.04799309, 0.04999219, 0.05199121, 0.05399016, 0.05598902, 0.05798780, 0.05998650, 0.06198510, 0.06398361, 0.06598203, 0.06798034, 0.06997856, 0.07197667, 0.07397467, 0.07597256, 0.07797033, 0.07996799, 0.08196553, 0.08396294, 0.08596023, 0.08795739, 0.08995442, 0.09195131, 0.09394807, 0.09594468, 0.09794115, 0.09993747, 0.10193364, 0.10392966, 0.10592552, 0.10792122, 0.10991677, 0.11191214, 0.11390735, 0.11590238, 0.11789724, 0.11989193, 0.12188643, 0.12388075, 0.12587488, 0.12786883, 0.12986258, 0.13185613, 0.13384949, 0.13584265, 0.13783560, 0.13982834, 0.14182087, 0.14381319, 0.14580530, 0.14779718, 0.14978884, 0.15178027, 0.15377148, 0.15576245, 0.15775319, 0.15974369, 0.16173395, 0.16372397, 0.16571374, 0.16770325, 0.16969252, 0.17168153, 0.17367028, 0.17565877, 0.17764699, 0.17963494, 0.18162263, 0.18361004, 0.18559717, 0.18758402, 0.18957058, 0.19155686, 0.19354286, 0.19552855, 0.19751396, 0.19949906, 0.20148386, 0.20346836, 0.20545254, 0.20743642, 0.20941999, 0.21140323, 0.21338616, 0.21536876, 0.21735104, 0.21933298, 0.22131460, 0.22329588, 0.22527681, 0.22725741, 0.22923767, 0.23121757, 0.23319713, 0.23517633, 0.23715517, 0.23913365, 0.24111177, 0.24308953, 0.24506691, 0.24704392, 0.24902056, 0.25099681, 0.25297269, 0.25494818, 0.25692328, 0.25889799, 0.26087231, 0.26284623, 0.26481975, 0.26679287, 0.26876558, 0.27073788, 0.27270976, 0.27468123, 0.27665229, 0.27862292, 0.28059312, 0.28256290, 0.28453224, 0.28650115, 0.28846963, 0.29043766, 0.29240524, 0.29437239, 0.29633908, 0.29830531, 0.30027109, 0.30223642, 0.30420127, 0.30616567, 0.30812959, 0.31009304, 0.31205602, 0.31401852, 0.31598053, 0.31794206, 0.31990311, 0.32186366, 0.32382372, 0.32578328, 0.32774234, 0.32970090, 0.33165895, 0.33361649, 0.33557352, 0.33753003, 0.33948602, 0.34144149, 0.34339643, 0.34535084, 0.34730473, 0.34925807, 0.35121088, 0.35316315, 0.35511487, 0.35706604, 0.35901666, 0.36096673, 0.36291624, 0.36486519, 0.36681358, 0.36876139, 0.37070864, 0.37265532, 0.37460141, 0.37654693, 0.37849186, 0.38043621, 0.38237997, 0.38432313, 0.38626570, 0.38820767, 0.39014904, 0.39208980, 0.39402995, 0.39596949, 0.39790841, 0.39984672, 0.40178440, 0.40372146, 0.40565789, 0.40759368, 0.40952885, 0.41146337, 0.41339725, 0.41533049, 0.41726308, 0.41919502, 0.42112630, 0.42305693, 0.42498689, 0.42691619, 0.42884483, 0.43077279, 0.43270007, 0.43462668, 0.43655261, 0.43847786, 0.44040241, 0.44232628, 0.44424945, 0.44617193, 0.44809370, 0.45001477, 0.45193514, 0.45385479, 0.45577373, 0.45769195, 0.45960945, 0.46152623, 0.46344228, 0.46535760, 0.46727218, 0.46918603, 0.47109914, 0.47301150, 0.47492312, 0.47683398, 0.47874409, 0.48065345, 0.48256204, 0.48446987, 0.48637693, 0.48828322, 0.49018874, 0.49209348, 0.49399744, 0.49590061, 0.49780300, 0.49970459, 0.50160539, 0.50350539, 0.50540459, 0.50730299, 0.50920058, 0.51109735, 0.51299331, 0.51488846, 0.51678278, 0.51867627, 0.52056894, 0.52246077, 0.52435177, 0.52624193, 0.52813125, 0.53001972, 0.53190734, 0.53379411, 0.53568003, 0.53756508, 0.53944927, 0.54133259, 0.54321504, 0.54509662, 0.54697732, 0.54885714, 0.55073608, 0.55261413, 0.55449129, 0.55636755, 0.55824292, 0.56011738, 0.56199094, 0.56386358, 0.56573532, 0.56760614, 0.56947604, 0.57134502, 0.57321307, 0.57508020, 0.57694638, 0.57881164, 0.58067595, 0.58253931, 0.58440173, 0.58626320, 0.58812371, 0.58998326, 0.59184186, 0.59369948, 0.59555614, 0.59741182, 0.59926653, 0.60112025, 0.60297300, 0.60482475, 0.60667552, 0.60852529, 0.61037406, 0.61222183, 0.61406859, 0.61591435, 0.61775909, 0.61960281, 0.62144552, 0.62328720, 0.62512786, 0.62696748, 0.62880607, 0.63064362, 0.63248012, 0.63431558, 0.63614999, 0.63798335, 0.63981565, 0.64164689, 0.64347707, 0.64530618, 0.64713421, 0.64896117, 0.65078705, 0.65261185, 0.65443556, 0.65625818, 0.65807970, 0.65990013, 0.66171945, 0.66353767, 0.66535478, 0.66717077, 0.66898565, 0.67079941, 0.67261204, 0.67442354, 0.67623391, 0.67804315, 0.67985124, 0.68165819, 0.68346400, 0.68526865, 0.68707214, 0.68887448, 0.69067565, 0.69247566, 0.69427449, 0.69607215, 0.69786864, 0.69966393, 0.70145805, 0.70325097, 0.70504269, 0.70683322, 0.70862255, 0.71041067, 0.71219758, 0.71398328, 0.71576775, 0.71755101, 0.71933304, 0.72111384, 0.72289341, 0.72467174, 0.72644882, 0.72822466, 0.72999925, 0.73177259, 0.73354467, 0.73531549, 0.73708504, 0.73885332, 0.74062032, 0.74238605, 0.74415050, 0.74591366, 0.74767553, 0.74943611, 0.75119538, 0.75295336, 0.75471002, 0.75646538, 0.75821942, 0.75997215, 0.76172355, 0.76347362, 0.76522236, 0.76696977, 0.76871583, 0.77046055, 0.77220393, 0.77394595, 0.77568661, 0.77742592, 0.77916385, 0.78090042, 0.78263562, 0.78436944, 0.78610188, 0.78783293, 0.78956259, 0.79129086, 0.79301772, 0.79474319, 0.79646724, 0.79818989, 0.79991112, 0.80163093, 0.80334931, 0.80506627, 0.80678179, 0.80849587, 0.81020852, 0.81191971, 0.81362946, 0.81533775, 0.81704458, 0.81874995, 0.82045384, 0.82215627, 0.82385722, 0.82555669, 0.82725467, 0.82895116, 0.83064615, 0.83233965, 0.83403164, 0.83572213, 0.83741110, 0.83909855, 0.84078449, 0.84246889, 0.84415177, 0.84583311, 0.84751291, 0.84919116, 0.85086787, 0.85254302, 0.85421661, 0.85588865, 0.85755911, 0.85922800, 0.86089532, 0.86256105, 0.86422520, 0.86588775, 0.86754872, 0.86920808, 0.87086583, 0.87252198, 0.87417651, 0.87582943, 0.87748072, 0.87913038, 0.88077841, 0.88242480, 0.88406955, 0.88571265, 0.88735410, 0.88899389, 0.89063203, 0.89226849, 0.89390328, 0.89553640, 0.89716783, 0.89879758, 0.90042564, 0.90205200, 0.90367666, 0.90529962, 0.90692086, 0.90854039, 0.91015820, 0.91177428, 0.91338863, 0.91500125, 0.91661213, 0.91822126, 0.91982864, 0.92143427, 0.92303813, 0.92464023, 0.92624056, 0.92783911, 0.92943588, 0.93103087, 0.93262406, 0.93421546, 0.93580505, 0.93739284, 0.93897882, 0.94056298, 0.94214532, 0.94372583, 0.94530451, 0.94688135, 0.94845635, 0.95002950, 0.95160079, 0.95317023, 0.95473780, 0.95630350, 0.95786733, 0.95942927, 0.96098933, 0.96254750, 0.96410378, 0.96565815, 0.96721061, 0.96876116, 0.97030979, 0.97185650, 0.97340128, 0.97494412, 0.97648503, 0.97802399, 0.97956099, 0.98109604, 0.98262913, 0.98416025, 0.98568939, 0.98721656, 0.98874174, 0.99026493, 0.99178612, 0.99330532, 0.99482250, 0.99633767, 0.99785082, 0.99936195, 1.00087104, 1.00237810, 1.00388312, 1.00538608, 1.00688700, 1.00838585, 1.00988264, 1.01137736, 1.01287000, 1.01436055, 1.01584902, 1.01733539, 1.01881966, 1.02030182, 1.02178187, 1.02325979, 1.02473560, 1.02620927, 1.02768080, 1.02915019, 1.03061743, 1.03208251, 1.03354543, 1.03500619, 1.03646476, 1.03792116, 1.03937537, 1.04082739, 1.04227720, 1.04372481, 1.04517021, 1.04661339, 1.04805434, 1.04949306, 1.05092955, 1.05236379, 1.05379578, 1.05522551, 1.05665298, 1.05807817, 1.05950109, 1.06092173, 1.06234008, 1.06375613, 1.06516987, 1.06658131, 1.06799043, 1.06939723, 1.07080169, 1.07220382, 1.07360361, 1.07500104, 1.07639612, 1.07778884, 1.07917918, 1.08056714, 1.08195272, 1.08333591, 1.08471670, 1.08609509, 1.08747106, 1.08884461, 1.09021574, 1.09158443, 1.09295068, 1.09431448, 1.09567583, 1.09703471, 1.09839113, 1.09974507, 1.10109652, 1.10244548, 1.10379195, 1.10513590, 1.10647735, 1.10781627, 1.10915266, 1.11048652, 1.11181784, 1.11314660, 1.11447280, 1.11579644, 1.11711751, 1.11843599, 1.11975189, 1.12106518, 1.12237588, 1.12368396, 1.12498942, 1.12629225, 1.12759245, 1.12889000, 1.13018490, 1.13147715, 1.13276672, 1.13405362, 1.13533784, 1.13661936, 1.13789818, 1.13917430, 1.14044770, 1.14171837, 1.14298632, 1.14425152, 1.14551397, 1.14677367, 1.14803059, 1.14928475, 1.15053612, 1.15178470, 1.15303048, 1.15427345, 1.15551360, 1.15675093, 1.15798543, 1.15921708, 1.16044587, 1.16167181, 1.16289488, 1.16411507, 1.16533237, 1.16654677, 1.16775827, 1.16896685, 1.17017252, 1.17137524, 1.17257503, 1.17377186, 1.17496574, 1.17615664, 1.17734456, 1.17852950, 1.17971144, 1.18089037, 1.18206628, 1.18323917, 1.18440902, 1.18557582, 1.18673957, 1.18790026, 1.18905787, 1.19021239, 1.19136382, 1.19251214, 1.19365735, 1.19479943, 1.19593838, 1.19707419, 1.19820683, 1.19933632, 1.20046262, 1.20158574, 1.20270566, 1.20382238, 1.20493588, 1.20604615, 1.20715318, 1.20825696, 1.20935748, 1.21045473, 1.21154869, 1.21263937, 1.21372674, 1.21481079, 1.21589152, 1.21696891, 1.21804295, 1.21911364, 1.22018095, 1.22124488, 1.22230541, 1.22336254, 1.22441625, 1.22546654, 1.22651338, 1.22755677, 1.22859670, 1.22963315, 1.23066611, 1.23169557, 1.23272152, 1.23374395, 1.23476283, 1.23577817, 1.23678995, 1.23779815, 1.23880277, 1.23980379, 1.24080120, 1.24179498, 1.24278512, 1.24377161, 1.24475444, 1.24573359, 1.24670906, 1.24768081, 1.24864886, 1.24961317, 1.25057374, 1.25153055, 1.25248359, 1.25343285, 1.25437830, 1.25531995, 1.25625777, 1.25719174, 1.25812187, 1.25904812, 1.25997049, 1.26088896, 1.26180352, 1.26271415, 1.26362084, 1.26452357, 1.26542233, 1.26631710, 1.26720787, 1.26809462, 1.26897734, 1.26985601, 1.27073061, 1.27160113, 1.27246756, 1.27332987, 1.27418806, 1.27504210, 1.27589198, 1.27673769, 1.27757919, 1.27841649, 1.27924956, 1.28007839, 1.28090296, 1.28172324, 1.28253923, 1.28335091, 1.28415826, 1.28496125, 1.28575988, 1.28655413, 1.28734397, 1.28812939, 1.28891038, 1.28968690, 1.29045895, 1.29122650, 1.29198954, 1.29274804, 1.29350199, 1.29425137, 1.29499615, 1.29573633, 1.29647187, 1.29720275, 1.29792897, 1.29865049, 1.29936730, 1.30007938, 1.30078670, 1.30148924, 1.30218698, 1.30287990, 1.30356799, 1.30425121, 1.30492954, 1.30560297, 1.30627146, 1.30693500, 1.30759357, 1.30824713, 1.30889568, 1.30953917, 1.31017760, 1.31081093, 1.31143915, 1.31206222, 1.31268012, 1.31329283, 1.31390033, 1.31450257, 1.31509956, 1.31569124, 1.31627760, 1.31685862, 1.31743426, 1.31800450, 1.31856931, 1.31912866, 1.31968253, 1.32023089, 1.32077371, 1.32131095, 1.32184260, 1.32236862, 1.32288898, 1.32340365, 1.32391261, 1.32441581, 1.32491324, 1.32540485, 1.32589062, 1.32637051, 1.32684450, 1.32731255, 1.32777462, 1.32823069, 1.32868071, 1.32912466, 1.32956250, 1.32999419, 1.33041970, 1.33083899, 1.33125203, 1.33165878, 1.33205920, 1.33245325, 1.33284090, 1.33322210, 1.33359683, 1.33396502, 1.33432666, 1.33468169, 1.33503007, 1.33537177, 1.33570674, 1.33603493, 1.33635631, 1.33667082, 1.33697843, 1.33727908, 1.33757273, 1.33785934, 1.33813886, 1.33841123, 1.33867642, 1.33893436, 1.33918501, 1.33942832, 1.33966423, 1.33989270, 1.34011366, 1.34032707, 1.34053287, 1.34073100, 1.34092141, 1.34110403, 1.34127881, 1.34144569, 1.34160461, 1.34175550, 1.34189831, 1.34203296, 1.34215939, 1.34227754, 1.34238734, 1.34248871, 1.34258160, 1.34258160, 1.34259042, 1.34259915, 1.34260780, 1.34261636, 1.34262483, 1.34263322, 1.34264153, 1.34264974, 1.34265788, 1.34266592, 1.34267388, 1.34268175, 1.34268954, 1.34269723, 1.34270485, 1.34271237, 1.34271981, 1.34272716, 1.34273443, 1.34274161, 1.34274870, 1.34275570, 1.34276262, 1.34276945, 1.34277619, 1.34278284, 1.34278941, 1.34279589, 1.34280228, 1.34280858, 1.34281480, 1.34282093, 1.34282697, 1.34283292, 1.34283878, 1.34284456, 1.34285024, 1.34285584, 1.34286135, 1.34286678, 1.34287211, 1.34287735, 1.34288251, 1.34288758, 1.34289255, 1.34289744, 1.34290224, 1.34290695, 1.34291157, 1.34291611, 1.34292055, 1.34292490, 1.34292916, 1.34293334, 1.34293742, 1.34294142, 1.34294532, 1.34294914, 1.34295286, 1.34295649, 1.34296004, 1.34296349, 1.34296686, 1.34297013, 1.34297331, 1.34297640, 1.34297940, 1.34298231, 1.34298513, 1.34298786, 1.34299050, 1.34299305, 1.34299550, 1.34299786, 1.34300014, 1.34300232, 1.34300441, 1.34300641, 1.34300831, 1.34301013, 1.34301185, 1.34301348, 1.34301502, 1.34301647, 1.34301782, 1.34301908, 1.34302025, 1.34302133, 1.34302231, 1.34302321, 1.34302401, 1.34302471, 1.34302533, 1.34302585, 1.34302628, 1.34302661, 1.34302685, 1.34302700, 1.34302705, 1.34302702, 1.34302688, 1.34302666, 1.34302634, 1.34302592, 1.34302542, 1.34302481, 1.34302412, 1.34302333, 1.34302245, 1.34302147, 1.34302039, 1.34301923, 1.34301796, 1.34301661, 1.34301516, 1.34301361, 1.34301197, 1.34301023, 1.34300840, 1.34300647, 1.34300445, 1.34300233, 1.34300012, 1.34299781, 1.34299540, 1.34299290, 1.34299031, 1.34298761, 1.34298483, 1.34298194, 1.34297896, 1.34297588, 1.34297271, 1.34296944, 1.34296607, 1.34296261, 1.34295905, 1.34295539, 1.34295163, 1.34294778, 1.34294383, 1.34293979, 1.34293564, 1.34293140, 1.34292706, 1.34292262, 1.34291809, 1.34291346, 1.34290873, 1.34290390, 1.34289897, 1.34289395, 1.34288882, 1.34288360, 1.34287828, 1.34287286, 1.34286734, 1.34286173, 1.34285601, 1.34285020, 1.34284428, 1.34283827, 1.34283216, 1.34282594, 1.34281963, 1.34281322, 1.34280671, 1.34280010, 1.34279339, 1.34278658, 1.34277966, 1.34277265, 1.34276554, 1.34275833, 1.34275101, 1.34274360, 1.34273609, 1.34272847, 1.34272075, 1.34271294, 1.34270502, 1.34269700, 1.34268888, 1.34268065, 1.34267233, 1.34266390, 1.34265537, 1.34264674, 1.34263801, 1.34262918, 1.34262024, 1.34261120, 1.34260206, 1.34259281, 1.34258347, 1.34257402, 1.34256446, 1.34255481, 1.34254505, 1.34253519, 1.34252522, 1.34251515, 1.34250498, 1.34249471, 1.34248433, 1.34247384, 1.34246325, 1.34245256, 1.34244177, 1.34243087, 1.34241986, 1.34240875, 1.34239754, 1.34238622, 1.34237479, 1.34236327, 1.34235163, 1.34233989, 1.34232805, 1.34231610, 1.34230404, 1.34229188, 1.34227961, 1.34226724, 1.34225476, 1.34224218, 1.34222949, 1.34221669, 1.34220378, 1.34219077, 1.34217766, 1.34216443, 1.34215110, 1.34213766, 1.34212411, 1.34211046, 1.34209670, 1.34208283, 1.34206886, 1.34205477, 1.34204058, 1.34202628, 1.34201187, 1.34199736, 1.34198273, 1.34196800, 1.34195316, 1.34193821, 1.34192315, 1.34190798, 1.34189270, 1.34187732, 1.34186182, 1.34184622, 1.34183050, 1.34181468, 1.34179874, 1.34178270, 1.34176654, 1.34175028, 1.34173390, 1.34171742, 1.34170082, 1.34168411, 1.34166729, 1.34165036, 1.34163332, 1.34161617, 1.34159891, 1.34158153, 1.34156405, 1.34154645, 1.34152874, 1.34151092, 1.34149298, 1.34147494, 1.34145678, 1.34143850, 1.34142012, 1.34140162, 1.34138301, 1.34136429, 1.34134545, 1.34132650, 1.34130744, 1.34128826, 1.34126897, 1.34124957, 1.34123005, 1.34121042, 1.34119067, 1.34117081, 1.34115083, 1.34113074, 1.34111053, 1.34109021, 1.34106978, 1.34104923, 1.34102856, 1.34100778, 1.34098688, 1.34096587, 1.34094474, 1.34092349, 1.34090213, 1.34088065, 1.34085905, 1.34083734, 1.34081551, 1.34079357, 1.34077151, 1.34074933, 1.34072703, 1.34070461, 1.34068208, 1.34065943, 1.34063666, 1.34061378, 1.34059077, 1.34056765, 1.34054441, 1.34052105, 1.34049757, 1.34047397, 1.34045025, 1.34042641, 1.34040246, 1.34037838, 1.34035419, 1.34032987, 1.34030544, 1.34028088, 1.34025620, 1.34023141, 1.34020649, 1.34018145, 1.34015629, 1.34013101, 1.34010561, 1.34008009, 1.34005444, 1.34002868, 1.34000279, 1.33997678, 1.33995064, 1.33992439, 1.33989801, 1.33987151, 1.33984489, 1.33981814, 1.33979127, 1.33976428, 1.33973716, 1.33970992, 1.33968256, 1.33965507, 1.33962746, 1.33959972, 1.33957186, 1.33954388, 1.33951576, 1.33948753, 1.33945917, 1.33943068, 1.33940207, 1.33937333, 1.33934447, 1.33931548, 1.33928637, 1.33925713, 1.33922776, 1.33919826, 1.33916864, 1.33913889, 1.33910902, 1.33907902, 1.33904889, 1.33901863, 1.33898824, 1.33895773, 1.33892708, 1.33889631, 1.33886541, 1.33883439, 1.33880323, 1.33877194, 1.33874053, 1.33870898, 1.33867731, 1.33864550, 1.33861357, 1.33858150, 1.33854931, 1.33851698, 1.33848453, 1.33845194, 1.33841922, 1.33838637, 1.33835339, 1.33832028, 1.33828703, 1.33825365, 1.33822015, 1.33818650, 1.33815273, 1.33811882, 1.33808478, 1.33805061, 1.33801630, 1.33798186, 1.33794729, 1.33791258, 1.33787774, 1.33784276, 1.33780765, 1.33777241, 1.33773703, 1.33770151, 1.33766586, 1.33763007, 1.33759415, 1.33755809, 1.33752190, 1.33748557, 1.33744910, 1.33741250, 1.33737576, 1.33733888, 1.33730186, 1.33726471, 1.33722742, 1.33718999, 1.33715243, 1.33711472, 1.33707688, 1.33703890, 1.33700077, 1.33696251, 1.33692411, 1.33688557, 1.33684690, 1.33680808, 1.33676912, 1.33673002, 1.33669078, 1.33665139, 1.33661187, 1.33657221, 1.33653240, 1.33649245, 1.33645236, 1.33641213, 1.33637176, 1.33633124, 1.33629058, 1.33624978, 1.33620883, 1.33616774, 1.33612651, 1.33608513, 1.33604361, 1.33600194, 1.33596013, 1.33591817, 1.33587607, 1.33583383, 1.33579143, 1.33574890, 1.33570621, 1.33566338, 1.33562040, 1.33557728, 1.33553401, 1.33549059, 1.33544703, 1.33540331, 1.33535945, 1.33531544, 1.33527128, 1.33522698, 1.33518252, 1.33513792, 1.33509316, 1.33504826, 1.33500320, 1.33495800, 1.33491264, 1.33486714, 1.33482148, 1.33477567, 1.33472971, 1.33468360, 1.33463734, 1.33459093, 1.33454436, 1.33449764, 1.33445076, 1.33440374, 1.33435656, 1.33430922, 1.33426174, 1.33421409, 1.33416630, 1.33411835, 1.33407024, 1.33402198, 1.33397356, 1.33392499, 1.33387626, 1.33382737, 1.33377833, 1.33372913, 1.33367977, 1.33363025, 1.33358058, 1.33353075, 1.33348076, 1.33343061, 1.33338031, 1.33332984, 1.33327921, 1.33322843, 1.33317748, 1.33312638, 1.33307511, 1.33302368, 1.33297209, 1.33292034, 1.33286843, 1.33281636, 1.33276412, 1.33271172, 1.33265916, 1.33260643, 1.33255354, 1.33250049, 1.33244727, 1.33239389, 1.33234034, 1.33228663, 1.33223275, 1.33217871, 1.33212450, 1.33207012, 1.33201558, 1.33196087, 1.33190599, 1.33185095, 1.33179573, 1.33174035, 1.33168480, 1.33162908, 1.33157320, 1.33151714, 1.33146091, 1.33140451, 1.33134795, 1.33129121, 1.33123430, 1.33117721, 1.33111996, 1.33106254, 1.33100494, 1.33094717, 1.33088922, 1.33083110, 1.33077281, 1.33071434, 1.33065570, 1.33059689, 1.33053790, 1.33047873, 1.33041939, 1.33035987, 1.33030017, 1.33024030, 1.33018025, 1.33012002, 1.33005961, 1.32999903, 1.32993826, 1.32987732, 1.32981619, 1.32975489, 1.32969341, 1.32963174, 1.32956990, 1.32950787, 1.32944566, 1.32938327, 1.32932070, 1.32925794, 1.32919500, 1.32913188, 1.32906857, 1.32900508, 1.32894140, 1.32887753, 1.32881349, 1.32874925, 1.32868483, 1.32862022, 1.32855542, 1.32849044, 1.32842527, 1.32835991, 1.32829436, 1.32822862, 1.32816269, 1.32809657, 1.32803026, 1.32796376, 1.32789706, 1.32783018, 1.32776310, 1.32769583, 1.32762837, 1.32756071, 1.32749286, 1.32742481, 1.32735657, 1.32728814, 1.32721950, 1.32715067, 1.32708165, 1.32701243, 1.32694301, 1.32687339, 1.32680357, 1.32673355, 1.32666334, 1.32659292, 1.32652230, 1.32645149, 1.32638047, 1.32630925, 1.32623782, 1.32616620, 1.32609437, 1.32602233, 1.32595010, 1.32587765, 1.32580500, 1.32573215, 1.32565909, 1.32558582, 1.32551235, 1.32543867, 1.32536478, 1.32529068, 1.32521637, 1.32514185, 1.32506712, 1.32499218, 1.32491703, 1.32484166, 1.32476609, 1.32469030, 1.32461429, 1.32453808, 1.32446164, 1.32438500, 1.32430813, 1.32423105, 1.32415376, 1.32407624, 1.32399851, 1.32392056, 1.32384239, 1.32376400, 1.32368539, 1.32360656, 1.32352751, 1.32344823, 1.32336874, 1.32328902, 1.32320907, 1.32312890, 1.32304851, 1.32296789, 1.32288704, 1.32280597, 1.32272467, 1.32264314, 1.32256138, 1.32247940, 1.32239718, 1.32231473, 1.32223205, 1.32214914, 1.32206600, 1.32198262, 1.32189901, 1.32181517, 1.32173108, 1.32164677, 1.32156221, 1.32147742, 1.32139240, 1.32130713, 1.32122162, 1.32113588, 1.32104989, 1.32096366, 1.32087719, 1.32079048, 1.32070352, 1.32061632, 1.32052887, 1.32044118, 1.32035324, 1.32026505, 1.32017662, 1.32008793, 1.31999900, 1.31990982, 1.31982039, 1.31973070, 1.31964076, 1.31955057, 1.31946012, 1.31936942, 1.31927847, 1.31918725, 1.31909578, 1.31900405, 1.31891207, 1.31881982, 1.31872731, 1.31863454, 1.31854151, 1.31844822, 1.31835466, 1.31826083, 1.31816674, 1.31807239, 1.31797776, 1.31788287, 1.31778771, 1.31769228, 1.31759658, 1.31750060, 1.31740435, 1.31730783, 1.31721103, 1.31711396, 1.31701661, 1.31691899, 1.31682108, 1.31672290, 1.31662443, 1.31652569, 1.31642666, 1.31632734, 1.31622775, 1.31612787, 1.31602770, 1.31592724, 1.31582649, 1.31572546, 1.31562413, 1.31552252, 1.31542061, 1.31531840, 1.31521590, 1.31511311, 1.31501002, 1.31490662, 1.31480293, 1.31469894, 1.31459465, 1.31449006, 1.31438516, 1.31427995, 1.31417444, 1.31406862, 1.31396250, 1.31385606, 1.31374931, 1.31364225, 1.31353488, 1.31342719, 1.31331918, 1.31321086, 1.31310222, 1.31299326, 1.31288398, 1.31277437, 1.31266444, 1.31255419, 1.31244361, 1.31233270, 1.31222146, 1.31210989, 1.31199799, 1.31188575, 1.31177318, 1.31166028, 1.31154703, 1.31143345, 1.31131952, 1.31120526, 1.31109065, 1.31097569, 1.31086039, 1.31074474, 1.31062873, 1.31051238, 1.31039567, 1.31027861, 1.31016120, 1.31004342, 1.30992528, 1.30980679, 1.30968793, 1.30956870, 1.30944911, 1.30932915, 1.30920882, 1.30908811, 1.30896704, 1.30884559, 1.30872376, 1.30860155, 1.30847896, 1.30835599, 1.30823263, 1.30810889, 1.30798475, 1.30786023, 1.30773531, 1.30761000, 1.30748429, 1.30735818, 1.30723167, 1.30710476, 1.30697744, 1.30684972, 1.30672158, 1.30659304, 1.30646408, 1.30633470, 1.30620490, 1.30607469, 1.30594404, 1.30581298, 1.30568148, 1.30554956, 1.30541720, 1.30528440, 1.30515117, 1.30501750, 1.30488338, 1.30474882, 1.30461381, 1.30447834, 1.30434243, 1.30420605, 1.30406922, 1.30393193, 1.30379416, 1.30365594, 1.30351724, 1.30337806, 1.30323841, 1.30309828, 1.30295766, 1.30281656, 1.30267497, 1.30253288, 1.30239030, 1.30224722, 1.30210364, 1.30195955, 1.30181495, 1.30166983, 1.30152420, 1.30137805, 1.30123137, 1.30108417, 1.30093643, 1.30078816, 1.30063935, 1.30048999, 1.30034009, 1.30018964, 1.30003862, 1.29988705, 1.29973492, 1.29958221, 1.29942893, 1.29927507, 1.29912063, 1.29896561, 1.29880999, 1.29865377, 1.29849695, 1.29833952, 1.29818149, 1.29802283, 1.29786355, 1.29770365, 1.29754311, 1.29738193, 1.29722011, 1.29705763, 1.29689450, 1.29673071, 1.29656625, 1.29640111, 1.29623529, 1.29606879, 1.29590159, 1.29573368, 1.29556507, 1.29539575, 1.29522570, 1.29505492, 1.29488340, 1.29471114, 1.29453813, 1.29436435, 1.29418981, 1.29401448, 1.29383837, 1.29366147, 1.29348376, 1.29330524, 1.29312589, 1.29294571, 1.29276469, 1.29258282, 1.29240008, 1.29221647, 1.29203197, 1.29184658, 1.29166028, 1.29147306, 1.29128490, 1.29109581, 1.29090575, 1.29071472, 1.29052271, 1.29032970, 1.29013568, 1.28994063, 1.28974453, 1.28954738, 1.28934915, 1.28914982, 1.28894939, 1.28874782, 1.28854511, 1.28834123, 1.28813617, 1.28792989, 1.28772239, 1.28751363, 1.28730360, 1.28709227, 1.28687961, 1.28666561, 1.28645022, 1.28623343, 1.28601521, 1.28579551, 1.28557432, 1.28535159, 1.28512729, 1.28490139, 1.28467384, 1.28444461, 1.28421364, 1.28398091, 1.28374634, 1.28350991, 1.28327154, 1.28303120, 1.28278880, 1.28254430, 1.28229762, 1.28204868, 1.28179742, 1.28154374, 1.28128755, 1.28102875, 1.28076725, 1.28050292, 1.28023563, 1.27996525, 1.27969163, 1.27941459, 1.27913396, 1.27884951, 1.27856102, 1.27826822, 1.27797081, 1.27766843, 1.27736068, 1.27704706, 1.27672700, 1.27639978, 1.27606452, 1.27572006, 1.27536487, 1.27499679, 1.27461254, 1.27420659, 1.27376724, 1.27323954, 1.27271175, 1.27227212, 1.27186572, 1.27148087, 1.27111203, 1.27075594, 1.27041043, 1.27007398, 1.26974544, 1.26942392, 1.26910872, 1.26879924, 1.26849500, 1.26819561, 1.26790070, 1.26760998, 1.26732318, 1.26704006, 1.26676042, 1.26648407, 1.26621084, 1.26594059, 1.26567317, 1.26540847, 1.26514636, 1.26488673, 1.26462950, 1.26437458, 1.26412186, 1.26387129, 1.26362278, 1.26337627, 1.26313170, 1.26288900, 1.26264812, 1.26240900, 1.26217160, 1.26193586, 1.26170174, 1.26146921, 1.26123821, 1.26100871, 1.26078067, 1.26055406, 1.26032885, 1.26010500, 1.25988248, 1.25966126, 1.25944132, 1.25922262, 1.25900515, 1.25878888, 1.25857378, 1.25835982, 1.25814700, 1.25793529, 1.25772466, 1.25751510, 1.25730658, 1.25709910, 1.25689262, 1.25668714, 1.25648264, 1.25627910, 1.25607651, 1.25587484, 1.25567409, 1.25547425, 1.25527529, 1.25507721, 1.25487998, 1.25468361, 1.25448807, 1.25429336, 1.25409946, 1.25390636, 1.25371405, 1.25352252, 1.25333176, 1.25314176, 1.25295251, 1.25276400, 1.25257622, 1.25238915, 1.25220280, 1.25201715, 1.25183220, 1.25164793, 1.25146434, 1.25128142, 1.25109916, 1.25091756, 1.25073660, 1.25055628, 1.25037659, 1.25019753, 1.25001908, 1.24984125, 1.24966402, 1.24948739, 1.24931135, 1.24913590, 1.24896103, 1.24878673, 1.24861300, 1.24843983, 1.24826721, 1.24809515, 1.24792363, 1.24775266, 1.24758222, 1.24741231, 1.24724292, 1.24707405, 1.24690570, 1.24673786, 1.24657052, 1.24640369, 1.24623735, 1.24607150, 1.24590614, 1.24574127, 1.24557687, 1.24541295, 1.24524950, 1.24508651, 1.24492399, 1.24476193, 1.24460032, 1.24443916, 1.24427845, 1.24411819, 1.24395836, 1.24379898, 1.24364002, 1.24348150, 1.24332340, 1.24316572, 1.24300846, 1.24285162, 1.24269520, 1.24253918, 1.24238357, 1.24222837, 1.24207356, 1.24191916, 1.24176514, 1.24161153, 1.24145829, 1.24130545, 1.24115299, 1.24100091, 1.24084921, 1.24069788, 1.24054693, 1.24039635, 1.24024613, 1.24009628, 1.23994680, 1.23979767, 1.23964890, 1.23950048, 1.23935242, 1.23920471, 1.23905735, 1.23891033, 1.23876366, 1.23861733, 1.23847134, 1.23832568, 1.23818036, 1.23803537, 1.23789071, 1.23774639, 1.23760238, 1.23745871, 1.23731535, 1.23717232, 1.23702960, 1.23688720, 1.23674511, 1.23660334, 1.23646188, 1.23632073, 1.23617988, 1.23603934, 1.23589910, 1.23575917, 1.23561953, 1.23548020, 1.23534116, 1.23520241, 1.23506396, 1.23492580, 1.23478793, 1.23465034, 1.23451305, 1.23437604, 1.23423931, 1.23410286, 1.23396670, 1.23383081, 1.23369520, 1.23355986, 1.23342480, 1.23329002, 1.23315550, 1.23302125, 1.23288728, 1.23275356, 1.23262012, 1.23248694, 1.23235402, 1.23222136, 1.23208896, 1.23195683, 1.23182494, 1.23169332, 1.23156195, 1.23143083, 1.23129997, 1.23116936, 1.23103899, 1.23090888, 1.23077901, 1.23064939, 1.23052001, 1.23039087, 1.23026198, 1.23013333, 1.23000492, 1.22987675, 1.22974882, 1.22962112, 1.22949366, 1.22936643, 1.22923944, 1.22911268, 1.22898615, 1.22885985, 1.22873378, 1.22860793, 1.22848232, 1.22835693, 1.22823176, 1.22810682, 1.22798210, 1.22785760, 1.22773332, 1.22760927, 1.22748543, 1.22736180, 1.22723840, 1.22711521, 1.22699224, 1.22686948, 1.22674693, 1.22662460, 1.22650247, 1.22638056, 1.22625886, 1.22613736, 1.22601607, 1.22589499, 1.22577411, 1.22565344, 1.22553297, 1.22541271, 1.22529265, 1.22517279, 1.22505313, 1.22493367, 1.22481441, 1.22469535, 1.22457648, 1.22445781, 1.22433934, 1.22422106, 1.22410297, 1.22398508, 1.22386738, 1.22374988, 1.22363256, 1.22351543, 1.22339850, 1.22328175, 1.22316519, 1.22304882, 1.22293263, 1.22281663, 1.22270082, 1.22258518, 1.22246974, 1.22235447, 1.22223939, 1.22212449, 1.22200977, 1.22189523, 1.22178087, 1.22166669, 1.22155268, 1.22143885, 1.22132520, 1.22121173, 1.22109843, 1.22098531, 1.22087236, 1.22075958, 1.22064698, 1.22053454, 1.22042228, 1.22031019, 1.22019827, 1.22008652, 1.21997494, 1.21986353, 1.21975229, 1.21964121, 1.21953030, 1.21941955, 1.21930897, 1.21919856, 1.21908831, 1.21897822, 1.21886830, 1.21875854, 1.21864894, 1.21853950, 1.21843022, 1.21832110, 1.21821214, 1.21810335, 1.21799471, 1.21788622, 1.21777790, 1.21766973, 1.21756172, 1.21745386, 1.21734616, 1.21723862, 1.21713122, 1.21702399, 1.21691690, 1.21680997, 1.21670319, 1.21659656, 1.21649009, 1.21638376, 1.21627758, 1.21617156, 1.21606568, 1.21595995, 1.21585437, 1.21574894, 1.21564365, 1.21553851, 1.21543352, 1.21532867, 1.21522397, 1.21511942, 1.21501500, 1.21491074, 1.21480661, 1.21470263, 1.21459879, 1.21449509, 1.21439154, 1.21428812, 1.21418485, 1.21408171, 1.21397872, 1.21387587, 1.21377315, 1.21367058, 1.21356814, 1.21346584, 1.21336367, 1.21326165, 1.21315976, 1.21305800, 1.21295638, 1.21285490, 1.21275355, 1.21265234, 1.21255126, 1.21245031, 1.21234949, 1.21224881, 1.21214826, 1.21204785, 1.21194756, 1.21184741, 1.21174738, 1.21164749, 1.21154773, 1.21144809, 1.21134859, 1.21124921, 1.21114997, 1.21105085, 1.21095186, 1.21085299, 1.21075426, 1.21065565, 1.21055716, 1.21045880, 1.21036057, 1.21026246, 1.21016448, 1.21006662, 1.20996889, 1.20987128, 1.20977379, 1.20967642, 1.20957918, 1.20948206, 1.20938506, 1.20928819, 1.20919143, 1.20909480, 1.20899829, 1.20890189, 1.20880562, 1.20870947, 1.20861343, 1.20851752, 1.20842172, 1.20832604, 1.20823048, 1.20813504, 1.20803971, 1.20794450, 1.20784941, 1.20775443, 1.20765957, 1.20756483, 1.20747020, 1.20737569, 1.20728129, 1.20718700, 1.20709283, 1.20699877, 1.20690483, 1.20681100, 1.20671728, 1.20662368, 1.20653019, 1.20643681, 1.20634354, 1.20625038, 1.20615734, 1.20606440, 1.20597158, 1.20587886, 1.20578626, 1.20569376, 1.20560138, 1.20550910, 1.20541693, 1.20532487, 1.20523292, 1.20514108, 1.20504935, 1.20495772, 1.20486620, 1.20477478, 1.20468348, 1.20459228, 1.20450118, 1.20441019, 1.20431931, 1.20422853, 1.20413786, 1.20404729, 1.20395683, 1.20386647, 1.20377621, 1.20368606, 1.20359601, 1.20350607, 1.20341622, 1.20332648, 1.20323685, 1.20314731, 1.20305788, 1.20296854, 1.20287931, 1.20279018, 1.20270116, 1.20261223, 1.20252340, 1.20243467, 1.20234605, 1.20225752, 1.20216909, 1.20208076, 1.20199253, 1.20190440, 1.20181636, 1.20172843, 1.20164059, 1.20155285, 1.20146521, 1.20137767, 1.20129022, 1.20120287, 1.20111561, 1.20102846, 1.20094139, 1.20085443, 1.20076756, 1.20068078, 1.20059410, 1.20050752, 1.20042103, 1.20033463, 1.20024833, 1.20016213, 1.20007601, 1.19998999, 1.19990407, 1.19981823, 1.19973250, 1.19964685, 1.19956129, 1.19947583, 1.19939046, 1.19930518, 1.19922000, 1.19913490, 1.19904990, 1.19896499, 1.19888017, 1.19879544, 1.19871080, 1.19862625, 1.19854179, 1.19845742, 1.19837314, 1.19828895, 1.19820485, 1.19812083, 1.19803691, 1.19795308, 1.19786933, 1.19778567, 1.19770210, 1.19761862, 1.19753522, 1.19745192, 1.19736870, 1.19728557, 1.19720252, 1.19711956, 1.19703669, 1.19695390, 1.19687120, 1.19678859, 1.19670606, 1.19662362, 1.19654126, 1.19645899, 1.19637680, 1.19629470, 1.19621268, 1.19613075, 1.19604890, 1.19596714, 1.19588546, 1.19580386, 1.19572235, 1.19564092, 1.19555957, 1.19547830, 1.19539712, 1.19531603, 1.19523501, 1.19515408, 1.19507323, 1.19499246, 1.19491177, 1.19483116, 1.19475064, 1.19467020, 1.19458983, 1.19450955, 1.19442935, 1.19434923, 1.19426919, 1.19418924, 1.19410936, 1.19402956, 1.19394984, 1.19387020, 1.19379064, 1.19371116, 1.19363176, 1.19355244, 1.19347319, 1.19339403, 1.19331494, 1.19323593, 1.19315700, 1.19307815, 1.19299937, 1.19292068, 1.19284206, 1.19276352, 1.19268505, 1.19260666, 1.19252835, 1.19245012, 1.19237196, 1.19229388, 1.19221588, 1.19213795, 1.19206010, 1.19198232, 1.19190462, 1.19182699, 1.19174944, 1.19167197, 1.19159457, 1.19151724, 1.19143999, 1.19136281, 1.19128571, 1.19120869, 1.19113173, 1.19105485, 1.19097805, 1.19090132, 1.19082466, 1.19074808, 1.19067156, 1.19059513, 1.19051876, 1.19044247, 1.19036625, 1.19029010, 1.19021403, 1.19013803, 1.19006210, 1.18998624, 1.18991045, 1.18983474, 1.18975910, 1.18968353, 1.18960803, 1.18953260, 1.18945724, 1.18938195, 1.18930674, 1.18923159, 1.18915652, 1.18908151, 1.18900658, 1.18893172, 1.18885692, 1.18878220, 1.18870754, 1.18863296, 1.18855844, 1.18848400, 1.18840962, 1.18833531, 1.18826107, 1.18818690, 1.18811280, 1.18803877, 1.18796481, 1.18789091, 1.18781708, 1.18774332, 1.18766963, 1.18759601, 1.18752245, 1.18744896, 1.18737554, 1.18730218, 1.18722890, 1.18715568, 1.18708252, 1.18700944, 1.18693642, 1.18686346, 1.18679058, 1.18671776, 1.18664500, 1.18657231, 1.18649969, 1.18642713, 1.18635464, 1.18628222, 1.18620986, 1.18613756, 1.18606533, 1.18599317, 1.18592107, 1.18584904, 1.18577707, 1.18570516, 1.18563332, 1.18556155, 1.18548983, 1.18541819, 1.18534660, 1.18527508, 1.18520363, 1.18513224, 1.18506091, 1.18498964, 1.18491844, 1.18484730, 1.18477623, 1.18470522, 1.18463427, 1.18456338, 1.18449256, 1.18442180, 1.18435110, 1.18428046, 1.18420989, 1.18413938, 1.18406893, 1.18399854, 1.18392821, 1.18385795, 1.18378775, 1.18371761, 1.18364753, 1.18357751, 1.18350755, 1.18343765, 1.18336782, 1.18329805, 1.18322833, 1.18315868, 1.18308909, 1.18301956, 1.18295008, 1.18288067, 1.18281132, 1.18274203, 1.18267280, 1.18260363, 1.18253452, 1.18246547, 1.18239647, 1.18232754, 1.18225867, 1.18218985, 1.18212110, 1.18205240, 1.18198377, 1.18191519, 1.18184667, 1.18177821, 1.18170980, 1.18164146, 1.18157317, 1.18150495, 1.18143678, 1.18136867, 1.18130061, 1.18123262, 1.18116468, 1.18109680, 1.18102898, 1.18096121, 1.18089351, 1.18082586, 1.18075826, 1.18069073, 1.18062325, 1.18055583, 1.18048846, 1.18042115, 1.18035390, 1.18028670, 1.18021957, 1.18015248, 1.18008546, 1.18001849, 1.17995157, 1.17988471, 1.17981791, 1.17975116, 1.17968447, 1.17961784, 1.17955126, 1.17948473, 1.17941827, 1.17935185, 1.17928549, 1.17921919, 1.17915294, 1.17908675, 1.17902061, 1.17895452, 1.17888849, 1.17882252, 1.17875660, 1.17869073, 1.17862492, 1.17855916, 1.17849346, 1.17842781, 1.17836221, 1.17829667, 1.17823118, 1.17816575, 1.17810037, 1.17803504, 1.17796977, 1.17790455, 1.17783938, 1.17777427, 1.17770921, 1.17764420, 1.17757924, 1.17751434, 1.17744949, 1.17738469, 1.17731995, 1.17725526, 1.17719062, 1.17712603, 1.17706150, 1.17699701, 1.17693258, 1.17686821, 1.17680388, 1.17673960, 1.17667538, 1.17661121, 1.17654709, 1.17648302, 1.17641901, 1.17635504, 1.17629113, 1.17622726, 1.17616345, 1.17609969, 1.17603598, 1.17597232, 1.17590871, 1.17584516, 1.17578165, 1.17571820, 1.17565479, 1.17559143, 1.17552813, 1.17546488, 1.17540167, 1.17533852, 1.17527541, 1.17521236, 1.17514936, 1.17508640, 1.17502350, 1.17496064, 1.17489784, 1.17483508, 1.17477237, 1.17470972, 1.17464711, 1.17458455, 1.17452204, 1.17445958, 1.17439717, 1.17433481, 1.17427249, 1.17421023, 1.17414801, 1.17408585, 1.17402373, 1.17396166, 1.17389964, 1.17383766, 1.17377574, 1.17371386, 1.17365203, 1.17359025, 1.17352852, 1.17346683, 1.17340520, 1.17334361, 1.17328206, 1.17322057, 1.17315912, 1.17309773, 1.17303637, 1.17297507, 1.17291381, 1.17285260, 1.17279144, 1.17273033, 1.17266926, 1.17260824, 1.17254726, 1.17248633, 1.17242545, 1.17236462, 1.17230383, 1.17224309, 1.17218239, 1.17212175, 1.17206114, 1.17200059, 1.17194008, 1.17187961, 1.17181920, 1.17175883, 1.17169850, 1.17163822, 1.17157799, 1.17151780, 1.17145766, 1.17139756, 1.17133751, 1.17127750, 1.17121754, 1.17115763, 1.17109776, 1.17103793, 1.17097815, 1.17091842, 1.17085873, 1.17079909, 1.17073949, 1.17067993, 1.17062042, 1.17056096, 1.17050154, 1.17044216, 1.17038283, 1.17032354, 1.17026430, 1.17020510, 1.17014595, 1.17008684, 1.17002777, 1.16996875, 1.16990977, 1.16985084, 1.16979195, 1.16973311, 1.16967430, 1.16961554, 1.16955683, 1.16949816, 1.16943953, 1.16938095, 1.16932241, 1.16926391, 1.16920546, 1.16914704, 1.16908868, 1.16903035, 1.16897207, 1.16891383, 1.16885564, 1.16879748, 1.16873937, 1.16868131, 1.16862328, 1.16856530, 1.16850736, 1.16844946, 1.16839161, 1.16833380, 1.16827603, 1.16821830, 1.16816062, 1.16810297, 1.16804537, 1.16798781, 1.16793030, 1.16787282, 1.16781539, 1.16775800, 1.16770065, 1.16764334, 1.16758608, 1.16752885, 1.16747167, 1.16741453, 1.16735743, 1.16730037, 1.16724335, 1.16718638, 1.16712944, 1.16707255, 1.16701569, 1.16695888, 1.16690211, 1.16684538, 1.16678869, 1.16673205, 1.16667544, 1.16661887, 1.16656235, 1.16650586, 1.16644942, 1.16639301, 1.16633665, 1.16628033, 1.16622405, 1.16616780, 1.16611160, 1.16605544, 1.16599932, 1.16594323, 1.16588719, 1.16583119, 1.16577523, 1.16571931, 1.16566342, 1.16560758, 1.16555178, 1.16549601, 1.16544029, 1.16538461, 1.16532896, 1.16527336, 1.16521779, 1.16516226, 1.16510678, 1.16505133, 1.16499592, 1.16494055, 1.16488522, 1.16482993, 1.16477468, 1.16471946, 1.16466429, 1.16460915, 1.16455405, 1.16449900, 1.16444398, 1.16438900, 1.16433405, 1.16427915, 1.16422428, 1.16416946, 1.16411467, 1.16405992, 1.16400521, 1.16395053, 1.16389590, 1.16384130, 1.16378674, 1.16373222, 1.16367773, 1.16362329, 1.16356888, 1.16351451, 1.16346018, 1.16340589, 1.16335163, 1.16329741, 1.16324323, 1.16318908, 1.16313498, 1.16308091, 1.16302688, 1.16297288, 1.16291893, 1.16286501, 1.16281113, 1.16275728, 1.16270347, 1.16264970, 1.16259597, 1.16254227, 1.16248861, 1.16243499, 1.16238140, 1.16232785, 1.16227434, 1.16222087, 1.16216743, 1.16211402, 1.16206066, 1.16200733, 1.16195404, 1.16190078, 1.16184756, 1.16179437, 1.16174123, 1.16168812, 1.16163504, 1.16158200, 1.16152900, 1.16147603, 1.16142310, 1.16137021, 1.16131735, 1.16126453, 1.16121174, 1.16115899, 1.16110627, 1.16105359, 1.16100095, 1.16094834, 1.16089577, 1.16084323, 1.16079073, 1.16073826, 1.16068583, 1.16063344, 1.16058108, 1.16052875, 1.16047646, 1.16042421, 1.16037199, 1.16031980, 1.16026765, 1.16021554, 1.16016346, 1.16011142, 1.16005941, 1.16000743, 1.15995549, 1.15990359, 1.15985172, 1.15979988, 1.15974808, 1.15969631, 1.15964458, 1.15959289, 1.15954122, 1.15948960, 1.15943800, 1.15938644, 1.15933492, 1.15928343, 1.15923197, 1.15918055, 1.15912916, 1.15907780, 1.15902648, 1.15897520, 1.15892395, 1.15887273, 1.15882154, 1.15877039, 1.15871928, 1.15866819, 1.15861714, 1.15856613, 1.15851515, 1.15846420, 1.15841328, 1.15836240, 1.15831155, 1.15826074, 1.15820996, 1.15815921, 1.15810850, 1.15805782, 1.15800717, 1.15795656, 1.15790597, 1.15785543, 1.15780491, 1.15775443, 1.15770398, 1.15765357, 1.15760318, 1.15755283, 1.15750252, 1.15745223, 1.15740198, 1.15735176, 1.15730158, 1.15725142, 1.15720130, 1.15715121, 1.15710116, 1.15705114, 1.15700115, 1.15695119, 1.15690126, 1.15685137, 1.15680151, 1.15675168, 1.15670188, 1.15665212, 1.15660239, 1.15655269, 1.15650302, 1.15645339, 1.15640378, 1.15635421, 1.15630467, 1.15625516, 1.15620569, 1.15615624, 1.15610683, 1.15605745, 1.15600810, 1.15595879, 1.15590950, 1.15586025, 1.15581103, 1.15576184, 1.15571268, 1.15566355, 1.15561445, 1.15556539, 1.15551636, 1.15546735, 1.15541838, 1.15536944, 1.15532054, 1.15527166, 1.15522281, 1.15517400, 1.15512522, 1.15507646, 1.15502774, 1.15497905, 1.15493039, 1.15488177, 1.15483317, 1.15478460, 1.15473607, 1.15468756, 1.15463909, 1.15459064, 1.15454223, 1.15449385, 1.15444550, 1.15439717, 1.15434888, 1.15430062, 1.15425239, 1.15420420, 1.15415603, 1.15410789, 1.15405978, 1.15401170, 1.15396365, 1.15391564, 1.15386765, 1.15381969, 1.15377177, 1.15372387, 1.15367600, 1.15362817, 1.15358036, 1.15353258, 1.15348484, 1.15343712, 1.15338943, 1.15334178, 1.15329415, 1.15324655, 1.15319898, 1.15315145, 1.15310394, 1.15305646, 1.15300901, 1.15296159, 1.15291420, 1.15286684, 1.15281951, 1.15277221, 1.15272493, 1.15267769, 1.15263048, 1.15258329, 1.15253614, 1.15248901, 1.15244192, 1.15239485, 1.15234781, 1.15230080, 1.15225382, 1.15220687, 1.15215995, 1.15211306, 1.15206619, 1.15201936, 1.15197255, 1.15192577, 1.15187902, 1.15183230, 1.15178561, 1.15173895, 1.15169232, 1.15164571, 1.15159914, 1.15155259, 1.15150607, 1.15145958, 1.15141312, 1.15136668, 1.15132028, 1.15127390, 1.15122755, 1.15118123, 1.15113494, 1.15108868, 1.15104244, 1.15099624, 1.15095006, 1.15090391, 1.15085779, 1.15081169, 1.15076563, 1.15071959, 1.15067358, 1.15062760, 1.15058164, 1.15053572, 1.15048982, 1.15044395, 1.15039811, 1.15035229, 1.15030651, 1.15026075, 1.15021502, 1.15016931, 1.15012364, 1.15007799, 1.15003237, 1.14998678, 1.14994121, 1.14989567, 1.14985016, 1.14980468, 1.14975922, 1.14971379, 1.14966839, 1.14962302, 1.14957767, 1.14953236, 1.14948706, 1.14944180, 1.14939656, 1.14935135, 1.14930617, 1.14926102, 1.14921589, 1.14917079, 1.14912571, 1.14908066, 1.14903564, 1.14899065, 1.14894568, 1.14890074, 1.14885583, 1.14881095, 1.14876609, 1.14872125, 1.14867645, 1.14863167, 1.14858692, 1.14854219, 1.14849749, 1.14845282, 1.14840818, 1.14836356, 1.14831896, 1.14827440, 1.14822986, 1.14818535, 1.14814086, 1.14809640, 1.14805196, 1.14800756, 1.14796318, 1.14791882, 1.14787449, 1.14783019, 1.14778591, 1.14774166, 1.14769744, 1.14765324, 1.14760907, 1.14756492, 1.14752080, 1.14747671, 1.14743264, 1.14738860, 1.14734459, 1.14730060, 1.14725663, 1.14721269, 1.14716878, 1.14712490, 1.14708104, 1.14703720, 1.14699339, 1.14694961, 1.14690585, 1.14686212, 1.14681841, 1.14677473, 1.14673108, 1.14668745, 1.14664384, 1.14660026, 1.14655671, 1.14651318, 1.14646968, 1.14642620, 1.14638275, 1.14633932, 1.14629592, 1.14625255, 1.14620920, 1.14616587, 1.14612257, 1.14607930, 1.14603605, 1.14599282, 1.14594962, 1.14590645, 1.14586330, 1.14582017, 1.14577707, 1.14573400, 1.14569095, 1.14564793, 1.14560493, 1.14556195, 1.14551900, 1.14547608, 1.14543318, 1.14539030, 1.14534745, 1.14530462, 1.14526182, 1.14521905, 1.14517629, 1.14513357, 1.14509086, 1.14504819, 1.14500553, 1.14496290, 1.14492030, 1.14487772, 1.14483516, 1.14479263, 1.14475013, 1.14470764, 1.14466519, 1.14462275, 1.14458034, 1.14453796, 1.14449560, 1.14445326, 1.14441095, 1.14436866, 1.14432640, 1.14428416, 1.14424194, 1.14419975, 1.14415758, 1.14411544, 1.14407332, 1.14403122, 1.14398915, 1.14394710, 1.14390508, 1.14386308, 1.14382111, 1.14377915, 1.14373723, 1.14369532, 1.14365344, 1.14361159, 1.14356975, 1.14352794, 1.14348616, 1.14344440, 1.14340266, 1.14336094, 1.14331925, 1.14327759, 1.14323594, 1.14319432, 1.14315272, 1.14311115, 1.14306960, 1.14302808, 1.14298657, 1.14294509, 1.14290364, 1.14286220, 1.14282080, 1.14277941, 1.14273805, 1.14269671, 1.14265539, 1.14261410, 1.14257283, 1.14253158, 1.14249036, 1.14244916, 1.14240798, 1.14236683, 1.14232570, 1.14228459, 1.14224350, 1.14220244, 1.14216140, 1.14212039, 1.14207939, 1.14203842, 1.14199747, 1.14195655, 1.14191565, 1.14187477, 1.14183391, 1.14179308, 1.14175227, 1.14171148, 1.14167072, 1.14162998, 1.14158926, 1.14154856, 1.14150788, 1.14146723, 1.14142660, 1.14138600, 1.14134541, 1.14130485, 1.14126431, 1.14122380, 1.14118330, 1.14114283, 1.14110238, 1.14106195, 1.14102155, 1.14098117, 1.14094081, 1.14090047, 1.14086015, 1.14081986, 1.14077959, 1.14073934, 1.14069912, 1.14065891, 1.14061873, 1.14057857, 1.14053843, 1.14049832, 1.14045822, 1.14041815, 1.14037810, 1.14033808, 1.14029807, 1.14025809, 1.14021813, 1.14017819, 1.14013827, 1.14009837, 1.14005850, 1.14001865, 1.13997882, 1.13993901, 1.13989922, 1.13985946, 1.13981971, 1.13977999, 1.13974029, 1.13970062, 1.13966096, 1.13962133, 1.13958171, 1.13954212, 1.13950255, 1.13946300, 1.13942348, 1.13938397, 1.13934449, 1.13930503, 1.13926559, 1.13922617, 1.13918677, 1.13914739, 1.13910804, 1.13906870, 1.13902939, 1.13899010, 1.13895083, 1.13891158, 1.13887236, 1.13883315, 1.13879397, 1.13875480, 1.13871566, 1.13867654, 1.13863744, 1.13859836, 1.13855930, 1.13852027, 1.13848125, 1.13844226, 1.13840328, 1.13836433, 1.13832540, 1.13828649, 1.13824760, 1.13820873, 1.13816988, 1.13813106, 1.13809225, 1.13805347, 1.13801470, 1.13797596, 1.13793724, 1.13789854, 1.13785986, 1.13782120, 1.13778256, 1.13774394, 1.13770534, 1.13766676, 1.13762821, 1.13758967, 1.13755116, 1.13751266, 1.13747419, 1.13743573, 1.13739730, 1.13735889, 1.13732050, 1.13728213, 1.13724377, 1.13720544, 1.13716713, 1.13712884, 1.13709057, 1.13705233, 1.13701410, 1.13697589, 1.13693770, 1.13689953, 1.13686139, 1.13682326, 1.13678515, 1.13674707, 1.13670900, 1.13667095, 1.13663293, 1.13659492, 1.13655694, 1.13651897, 1.13648103, 1.13644310, 1.13640520, 1.13636731, 1.13632945, 1.13629160, 1.13625378, 1.13621597, 1.13617819, 1.13614042, 1.13610267, 1.13606495, 1.13602724, 1.13598956, 1.13595189, 1.13591425, 1.13587662, 1.13583901, 1.13580143, 1.13576386, 1.13572631, 1.13568879, 1.13565128, 1.13561379, 1.13557632, 1.13553888, 1.13550145, 1.13546404, 1.13542665, 1.13538928, 1.13535193, 1.13531460, 1.13527729, 1.13523999, 1.13520272, 1.13516547, 1.13512824, 1.13509102, 1.13505383, 1.13501665, 1.13497950, 1.13494236, 1.13490524, 1.13486815, 1.13483107, 1.13479401, 1.13475697, 1.13471995, 1.13468295, 1.13464597, 1.13460901, 1.13457206, 1.13453514, 1.13449823, 1.13446135, 1.13442448, 1.13438763, 1.13435081, 1.13431400, 1.13427721, 1.13424044, 1.13420368, 1.13416695, 1.13413024, 1.13409354, 1.13405687, 1.13402021, 1.13398357, 1.13394695, 1.13391035, 1.13387377, 1.13383721, 1.13380067, 1.13376414, 1.13372764, 1.13369115, 1.13365468, 1.13361823, 1.13358180, 1.13354539, 1.13350900, 1.13347262, 1.13343627, 1.13339993, 1.13336361, 1.13332731, 1.13329103, 1.13325477, 1.13321853, 1.13318230, 1.13314609, 1.13310991, 1.13307374, 1.13303759, 1.13300145, 1.13296534, 1.13292925, 1.13289317, 1.13285711, 1.13282107, 1.13278505, 1.13274905, 1.13271306, 1.13267709, 1.13264115, 1.13260522, 1.13256931, 1.13253341, 1.13249754, 1.13246168, 1.13242584, 1.13239002, 1.13235422, 1.13231844, 1.13228267, 1.13224693, 1.13221120, 1.13217549, 1.13213979, 1.13210412, 1.13206846, 1.13203283, 1.13199721, 1.13196160, 1.13192602, 1.13189045, 1.13185491, 1.13181938, 1.13178386, 1.13174837, 1.13171289, 1.13167744, 1.13164200, 1.13160657, 1.13157117, 1.13153578, 1.13150041, 1.13146506, 1.13142973, 1.13139442, 1.13135912, 1.13132384, 1.13128858, 1.13125333, 1.13121811, 1.13118290, 1.13114771, 1.13111254, 1.13107738, 1.13104224, 1.13100712, 1.13097202, 1.13093694, 1.13090187, 1.13086682, 1.13083179, 1.13079677, 1.13076178, 1.13072680, 1.13069184, 1.13065689, 1.13062196, 1.13058706, 1.13055216, 1.13051729, 1.13048243, 1.13044759, 1.13041277, 1.13037797, 1.13034318, 1.13030841, 1.13027366, 1.13023892, 1.13020420, 1.13016950, 1.13013482, 1.13010016, 1.13006551, 1.13003088, 1.12999626, 1.12996166, 1.12992708, 1.12989252, 1.12985798, 1.12982345, 1.12978894, 1.12975444, 1.12971997, 1.12968551, 1.12965107, 1.12961664, 1.12958223, 1.12954784, 1.12951347, 1.12947911, 1.12944477, 1.12941045, 1.12937614, 1.12934185, 1.12930758, 1.12927332, 1.12923908, 1.12920486, 1.12917066, 1.12913647, 1.12910230, 1.12906815, 1.12903401, 1.12899989, 1.12896578, 1.12893170, 1.12889763, 1.12886357, 1.12882954, 1.12879552, 1.12876152, 1.12872753, 1.12869356, 1.12865961, 1.12862567, 1.12859175, 1.12855785, 1.12852396, 1.12849009, 1.12845624, 1.12842241, 1.12838859, 1.12835478, 1.12832100, 1.12828723, 1.12825347, 1.12821974, 1.12818602, 1.12815231, 1.12811862, 1.12808495, 1.12805130, 1.12801766, 1.12798404, 1.12795043, 1.12791685, 1.12788327, 1.12784972, 1.12781618, 1.12778266, 1.12774915, 1.12771566, 1.12768218, 1.12764873, 1.12761528, 1.12758186, 1.12754845, 1.12751506, 1.12748168, 1.12744832, 1.12741497, 1.12738165, 1.12734833, 1.12731504, 1.12728176, 1.12724850, 1.12721525, 1.12718202, 1.12714880, 1.12711560, 1.12708242, 1.12704925, 1.12701610, 1.12698297, 1.12694985, 1.12691675, 1.12688366, 1.12685059, 1.12681753, 1.12678450, 1.12675147, 1.12671847, 1.12668548, 1.12665250, 1.12661954, 1.12658660, 1.12655367, 1.12652076, 1.12648786, 1.12645498, 1.12642212, 1.12638927, 1.12635644, 1.12632362, 1.12629082, 1.12625804, 1.12622527, 1.12619251, 1.12615977, 1.12612705, 1.12609435, 1.12606166, 1.12602898, 1.12599632, 1.12596368, 1.12593105, 1.12589844, 1.12586584, 1.12583326, 1.12580069, 1.12576814, 1.12573561, 1.12570309, 1.12567059, 1.12563810, 1.12560562, 1.12557317, 1.12554073, 1.12550830, 1.12547589, 1.12544349, 1.12541112, 1.12537875, 1.12534640, 1.12531407, 1.12528175, 1.12524945, 1.12521716, 1.12518489, 1.12515263, 1.12512039, 1.12508817, 1.12505595, 1.12502376, 1.12499158, 1.12495942, 1.12492727, 1.12489513, 1.12486301, 1.12483091, 1.12479882, 1.12476675, 1.12473469, 1.12470265, 1.12467062, 1.12463861, 1.12460661, 1.12457463, 1.12454266, 1.12451071, 1.12447877, 1.12444685, 1.12441494, 1.12438305, 1.12435117, 1.12431931, 1.12428746, 1.12425563, 1.12422382, 1.12419201, 1.12416023, 1.12412846, 1.12409670, 1.12406496, 1.12403323, 1.12400152, 1.12396982, 1.12393814, 1.12390647, 1.12387482, 1.12384318, 1.12381156, 1.12377995, 1.12374836, 1.12371678, 1.12368522, 1.12365367, 1.12362214, 1.12359062, 1.12355911, 1.12352762, 1.12349615, 1.12346469, 1.12343324, 1.12340181, 1.12337040, 1.12333900, 1.12330761, 1.12327624, 1.12324488, 1.12321354, 1.12318221, 1.12315090, 1.12311960, 1.12308832, 1.12305705, 1.12302579, 1.12299455, 1.12296332, 1.12293211, 1.12290092, 1.12286973, 1.12283857, 1.12280741, 1.12277628, 1.12274515, 1.12271404, 1.12268295, 1.12265187, 1.12262080, 1.12258975, 1.12255871, 1.12252769, 1.12249668, 1.12246568, 1.12243470, 1.12240374, 1.12237279, 1.12234185, 1.12231093, 1.12228002, 1.12224912, 1.12221824, 1.12218738, 1.12215653, 1.12212569, 1.12209487, 1.12206406, 1.12203327, 1.12200249, 1.12197172, 1.12194097, 1.12191023, 1.12187951, 1.12184880, 1.12181810, 1.12178742, 1.12175676, 1.12172610, 1.12169546, 1.12166484, 1.12163423, 1.12160363, 1.12157305, 1.12154248, 1.12151193, 1.12148139, 1.12145086, 1.12142035, 1.12138985, 1.12135937, 1.12132890, 1.12129844, 1.12126800, 1.12123757, 1.12120716, 1.12117676, 1.12114637, 1.12111600, 1.12108564, 1.12105530, 1.12102497, 1.12099465, 1.12096435, 1.12093406, 1.12090378, 1.12087352, 1.12084327, 1.12081304, 1.12078282, 1.12075261, 1.12072242, 1.12069224, 1.12066208, 1.12063193, 1.12060179, 1.12057167, 1.12054156, 1.12051146, 1.12048138, 1.12045131, 1.12042125, 1.12039121, 1.12036118, 1.12033117, 1.12030117, 1.12027118, 1.12024121, 1.12021125, 1.12018130, 1.12015137, 1.12012145, 1.12009155, 1.12006165, 1.12003178, 1.12000191, 1.11997206, 1.11994222, 1.11991240, 1.11988259, 1.11985279, 1.11982301, 1.11979324, 1.11976348, 1.11973374, 1.11970401, 1.11967429, 1.11964459, 1.11961490, 1.11958522, 1.11955556, 1.11952591, 1.11949627, 1.11946665, 1.11943704, 1.11940744, 1.11937786, 1.11934829, 1.11931874, 1.11928919, 1.11925966, 1.11923015, 1.11920064, 1.11917115, 1.11914168, 1.11911221, 1.11908276, 1.11905333, 1.11902390, 1.11899449, 1.11896510, 1.11893571, 1.11890634, 1.11887698, 1.11884764, 1.11881831, 1.11878899, 1.11875968, 1.11873039, 1.11870111, 1.11867185, 1.11864260, 1.11861336, 1.11858413, 1.11855492, 1.11852572, 1.11849653, 1.11846735, 1.11843819, 1.11840904, 1.11837991, 1.11835079, 1.11832168, 1.11829258, 1.11826350, 1.11823443, 1.11820537, 1.11817633, 1.11814729, 1.11811828, 1.11808927, 1.11806028, 1.11803130, 1.11800233, 1.11797338, 1.11794444, 1.11791551, 1.11788659, 1.11785769, 1.11782880, 1.11779992, 1.11777106, 1.11774221, 1.11771337, 1.11768454, 1.11765573, 1.11762693, 1.11759814, 1.11756937, 1.11754060, 1.11751185, 1.11748312, 1.11745439, 1.11742568, 1.11739698, 1.11736830, 1.11733962, 1.11731096, 1.11728232, 1.11725368, 1.11722506, 1.11719645, 1.11716785, 1.11713927, 1.11711069, 1.11708214, 1.11705359, 1.11702505, 1.11699653, 1.11696802, 1.11693953, 1.11691104, 1.11688257, 1.11685411, 1.11682567, 1.11679723, 1.11676881, 1.11674040, 1.11671200, 1.11668362, 1.11665525, 1.11662689, 1.11659854, 1.11657021, 1.11654189, 1.11651358, 1.11648528, 1.11645700, 1.11642872, 1.11640046, 1.11637222, 1.11634398, 1.11631576, 1.11628755, 1.11625935, 1.11623116, 1.11620299, 1.11617483, 1.11614668, 1.11611854, 1.11609042, 1.11606231, 1.11603421, 1.11600612, 1.11597805, 1.11594998, 1.11592193, 1.11589389, 1.11586587, 1.11583785, 1.11580985, 1.11578186, 1.11575389, 1.11572592, 1.11569797, 1.11567003, 1.11564210, 1.11561418, 1.11558628, 1.11555838, 1.11553050, 1.11550264, 1.11547478, 1.11544694, 1.11541910, 1.11539128, 1.11536348, 1.11533568, 1.11530790, 1.11528013, 1.11525237, 1.11522462, 1.11519688, 1.11516916, 1.11514145, 1.11511375, 1.11508606, 1.11505839, 1.11503072, 1.11500307, 1.11497543, 1.11494780, 1.11492019, 1.11489258, 1.11486499, 1.11483741, 1.11480984, 1.11478229, 1.11475474, 1.11472721, 1.11469969, 1.11467218, 1.11464469, 1.11461720, 1.11458973, 1.11456227, 1.11453482, 1.11450738, 1.11447995, 1.11445254, 1.11442514, 1.11439775, 1.11437037, 1.11434300, 1.11431565, 1.11428830, 1.11426097, 1.11423365, 1.11420634, 1.11417904, 1.11415176, 1.11412449, 1.11409723, 1.11406998, 1.11404274, 1.11401551, 1.11398830, 1.11396109, 1.11393390, 1.11390672, 1.11387955, 1.11385240, 1.11382525, 1.11379812, 1.11377100, 1.11374389, 1.11371679, 1.11368970, 1.11366263, 1.11363556, 1.11360851, 1.11358147, 1.11355444, 1.11352742, 1.11350041, 1.11347342, 1.11344644, 1.11341946, 1.11339250, 1.11336556, 1.11333862, 1.11331169, 1.11328478, 1.11325788, 1.11323098, 1.11320410, 1.11317723, 1.11315038, 1.11312353, 1.11309670, 1.11306987, 1.11304306, 1.11301626, 1.11298947, 1.11296270, 1.11293593, 1.11290917, 1.11288243, 1.11285570, 1.11282898, 1.11280227, 1.11277557, 1.11274888, 1.11272221, 1.11269554, 1.11266889, 1.11264225, 1.11261562, 1.11258900, 1.11256239, 1.11253579, 1.11250921, 1.11248263, 1.11245607, 1.11242952, 1.11240298, 1.11237645, 1.11234993, 1.11232342, 1.11229693, 1.11227044, 1.11224397, 1.11221751, 1.11219105, 1.11216461, 1.11213819, 1.11211177, 1.11208536, 1.11205896, 1.11203258, 1.11200621, 1.11197984, 1.11195349, 1.11192715, 1.11190082, 1.11187450, 1.11184820, 1.11182190, 1.11179562, 1.11176934, 1.11174308, 1.11171683, 1.11169059, 1.11166436, 1.11163814, 1.11161193, 1.11158573, 1.11155955, 1.11153337, 1.11150721, 1.11148105, 1.11145491, 1.11142878, 1.11140266, 1.11137655, 1.11135045, 1.11132436, 1.11129828, 1.11127222, 1.11124616, 1.11122012, 1.11119409, 1.11116806, 1.11114205, 1.11111605, 1.11109006, 1.11106408, 1.11103811, 1.11101216, 1.11098621, 1.11096027, 1.11093435, 1.11090843, 1.11088253, 1.11085664, 1.11083076, 1.11080488, 1.11077902, 1.11075317, 1.11072733, 1.11070151, 1.11067569, 1.11064988, 1.11062409, 1.11059830, 1.11057253, 1.11054676, 1.11052101, 1.11049527, 1.11046953, 1.11044381, 1.11041810, 1.11039240, 1.11036671, 1.11034103, 1.11031536, 1.11028971, 1.11026406, 1.11023842, 1.11021280, 1.11018718, 1.11016158, 1.11013598, 1.11011040, 1.11008483, 1.11005926, 1.11003371, 1.11000817, 1.10998264, 1.10995712, 1.10993161, 1.10990611, 1.10988062, 1.10985514, 1.10982968, 1.10980422, 1.10977877, 1.10975334, 1.10972791, 1.10970250, 1.10967709, 1.10965170, 1.10962631, 1.10960094, 1.10957558, 1.10955022, 1.10952488, 1.10949955, 1.10947423, 1.10944892, 1.10942362, 1.10939833, 1.10937305, 1.10934778, 1.10932252, 1.10929727, 1.10927203, 1.10924680, 1.10922158, 1.10919638, 1.10917118, 1.10914599, 1.10912081, 1.10909565, 1.10907049, 1.10904535, 1.10902021, 1.10899509, 1.10896997, 1.10894487, 1.10891977, 1.10889469, 1.10886961, 1.10884455, 1.10881950, 1.10879445, 1.10876942, 1.10874440, 1.10871938, 1.10869438, 1.10866939, 1.10864441, 1.10861944, 1.10859447, 1.10856952, 1.10854458, 1.10851965, 1.10849473, 1.10846982, 1.10844492, 1.10842003, 1.10839515, 1.10837027, 1.10834541, 1.10832056, 1.10829572, 1.10827089, 1.10824607, 1.10822126, 1.10819646, 1.10817167, 1.10814689, 1.10812212, 1.10809736, 1.10807261, 1.10804787, 1.10802314, 1.10799843, 1.10797372, 1.10794902, 1.10792433, 1.10789965, 1.10787498, 1.10785032, 1.10782567, 1.10780103, 1.10777640, 1.10775178, 1.10772717, 1.10770257, 1.10767798, 1.10765340, 1.10762883, 1.10760427, 1.10757972, 1.10755518, 1.10753064, 1.10750612, 1.10748161, 1.10745711, 1.10743262, 1.10740814, 1.10738367, 1.10735921, 1.10733475, 1.10731031, 1.10728588, 1.10726146, 1.10723705, 1.10721264, 1.10718825, 1.10716387, 1.10713949, 1.10711513, 1.10709078, 1.10706643, 1.10704210, 1.10701777, 1.10699346, 1.10696915, 1.10694486, 1.10692057, 1.10689630, 1.10687203, 1.10684778, 1.10682353, 1.10679929, 1.10677507, 1.10675085, 1.10672664, 1.10670244, 1.10667825, 1.10665407, 1.10662991, 1.10660575, 1.10658160, 1.10655746, 1.10653333, 1.10650920, 1.10648509, 1.10646099, 1.10643690, 1.10641282, 1.10638874, 1.10636468, 1.10634063, 1.10631658, 1.10629255, 1.10626852, 1.10624451, 1.10622050, 1.10619651, 1.10617252, 1.10614854, 1.10612458, 1.10610062, 1.10607667, 1.10605273, 1.10602880, 1.10600488, 1.10598097, 1.10595707, 1.10593318, 1.10590930, 1.10588542, 1.10586156, 1.10583771, 1.10581386, 1.10579003, 1.10576620, 1.10574239, 1.10571858, 1.10569478, 1.10567100, 1.10564722, 1.10562345, 1.10559969, 1.10557594, 1.10555220, 1.10552847, 1.10550475, 1.10548104, 1.10545733, 1.10543364, 1.10540996, 1.10538628, 1.10536262, 1.10533896, 1.10531531, 1.10529167, 1.10526805, 1.10524443, 1.10522082, 1.10519722, 1.10517363, 1.10515005, 1.10512647, 1.10510291, 1.10507936, 1.10505581, 1.10503228, 1.10500875, 1.10498523, 1.10496173, 1.10493823, 1.10491474, 1.10489126, 1.10486779, 1.10484433, 1.10482088, 1.10479743, 1.10477400, 1.10475058, 1.10472716, 1.10470375, 1.10468036, 1.10465697, 1.10463359, 1.10461022, 1.10458686, 1.10456351, 1.10454017, 1.10451684, 1.10449351, 1.10447020, 1.10444689, 1.10442360, 1.10440031, 1.10437703, 1.10435376, 1.10433050, 1.10430725, 1.10428401, 1.10426078, 1.10423756, 1.10421434, 1.10419114, 1.10416794, 1.10414475, 1.10412157, 1.10409841, 1.10407525, 1.10405209, 1.10402895, 1.10400582, 1.10398270, 1.10395958, 1.10393648, 1.10391338, 1.10389029, 1.10386721, 1.10384414, 1.10382108, 1.10379803, 1.10377499, 1.10375195, 1.10372893, 1.10370591, 1.10368290, 1.10365991, 1.10363692, 1.10361394, 1.10359096, 1.10356800, 1.10354505, 1.10352210, 1.10349917, 1.10347624, 1.10345332, 1.10343041, 1.10340751, 1.10338462, 1.10336174, 1.10333887, 1.10331600, 1.10329315, 1.10327030, 1.10324746, 1.10322463, 1.10320181, 1.10317900, 1.10315620, 1.10313340, 1.10311062, 1.10308784, 1.10306507, 1.10304231, 1.10301956, 1.10299682, 1.10297409, 1.10295137, 1.10292865, 1.10290594, 1.10288325, 1.10286056, 1.10283788, 1.10281521, 1.10279254, 1.10276989, 1.10274725, 1.10272461, 1.10270198, 1.10267936, 1.10265675, 1.10263415, 1.10261156, 1.10258898, 1.10256640, 1.10254383, 1.10252128, 1.10249873, 1.10247619, 1.10245365, 1.10243113, 1.10240862, 1.10238611, 1.10236361, 1.10234112, 1.10231864, 1.10229617, 1.10227371, 1.10225125, 1.10222881, 1.10220637, 1.10218394, 1.10216152, 1.10213911, 1.10211671, 1.10209431, 1.10207193, 1.10204955, 1.10202718, 1.10200482, 1.10198247, 1.10196013, 1.10193780, 1.10191547, 1.10189315, 1.10187084, 1.10184854, 1.10182625, 1.10180397, 1.10178169, 1.10175943, 1.10173717, 1.10171492, 1.10169268, 1.10167045, 1.10164823, 1.10162601, 1.10160380, 1.10158161, 1.10155942, 1.10153723, 1.10151506, 1.10149290, 1.10147074, 1.10144859, 1.10142645, 1.10140432, 1.10138220, 1.10136009, 1.10133798, 1.10131589, 1.10129380, 1.10127172, 1.10124964, 1.10122758, 1.10120553, 1.10118348, 1.10116144, 1.10113941, 1.10111739, 1.10109538, 1.10107337, 1.10105137, 1.10102939, 1.10100741, 1.10098543, 1.10096347, 1.10094152, 1.10091957, 1.10089763, 1.10087570, 1.10085378, 1.10083187, 1.10080996, 1.10078806, 1.10076617, 1.10074429, 1.10072242, 1.10070056, 1.10067870, 1.10065686, 1.10063502, 1.10061319, 1.10059136, 1.10056955, 1.10054774, 1.10052594, 1.10050415, 1.10048237, 1.10046060, 1.10043884, 1.10041708, 1.10039533, 1.10037359, 1.10035186, 1.10033013, 1.10030842, 1.10028671, 1.10026501, 1.10024332, 1.10022164, 1.10019996, 1.10017829, 1.10015663, 1.10013498, 1.10011334, 1.10009171, 1.10007008, 1.10004846, 1.10002685, 1.10000525, 1.09998366, 1.09996207, 1.09994049, 1.09991892, 1.09989736, 1.09987581, 1.09985426, 1.09983273, 1.09981120, 1.09978968, 1.09976816, 1.09974666, 1.09972516, 1.09970367, 1.09968219, 1.09966072, 1.09963926, 1.09961780, 1.09959635, 1.09957491, 1.09955348, 1.09953205, 1.09951064, 1.09948923, 1.09946783, 1.09944643, 1.09942505, 1.09940367, 1.09938230, 1.09936094, 1.09933959, 1.09931825, 1.09929691, 1.09927558, 1.09925426, 1.09923295, 1.09921164, 1.09919034, 1.09916906, 1.09914777, 1.09912650, 1.09910524, 1.09908398, 1.09906273, 1.09904149, 1.09902025, 1.09899903, 1.09897781, 1.09895660, 1.09893540, 1.09891420, 1.09889302, 1.09887184, 1.09885067, 1.09882950, 1.09880835, 1.09878720, 1.09876606, 1.09874493, 1.09872381, 1.09870269, 1.09868158, 1.09866048, 1.09863939, 1.09861831, 1.09859723, 1.09859723, 1.09796925, 1.09734674, 1.09672962, 1.09611783, 1.09551128, 1.09490993, 1.09431369, 1.09372250, 1.09313631, 1.09255503, 1.09197863, 1.09140702, 1.09084016, 1.09027798, 1.08972043, 1.08916745, 1.08861899, 1.08807498, 1.08753539, 1.08700014, 1.08646921, 1.08594252, 1.08542004, 1.08490171, 1.08438749, 1.08387732, 1.08337117, 1.08286899, 1.08237072, 1.08187633, 1.08138578, 1.08089902, 1.08041601, 1.07993670, 1.07946106, 1.07898905, 1.07852063, 1.07805575, 1.07759438, 1.07713649, 1.07668203, 1.07623098, 1.07578328, 1.07533892, 1.07489784, 1.07446003, 1.07402544, 1.07359404, 1.07316580, 1.07274069, 1.07231867, 1.07189972, 1.07148380, 1.07107088, 1.07066094, 1.07025393, 1.06984984, 1.06944864, 1.06905029, 1.06865477, 1.06826205, 1.06787210, 1.06748491, 1.06710043, 1.06671864, 1.06633953, 1.06596305, 1.06558920, 1.06521794, 1.06484925, 1.06448310, 1.06411947, 1.06375835, 1.06339969, 1.06304349, 1.06268972, 1.06233835, 1.06198937, 1.06164276, 1.06129848, 1.06095653, 1.06061688, 1.06027950, 1.05994439, 1.05961151, 1.05928086, 1.05895240, 1.05862612, 1.05830201, 1.05798004, 1.05766019, 1.05734244, 1.05702679, 1.05671320, 1.05640166, 1.05609216, 1.05578467, 1.05547918, 1.05517568, 1.05487414, 1.05457454, 1.05427688, 1.05398114, 1.05368730, 1.05339534, 1.05310525, 1.05281701, 1.05253061, 1.05224604, 1.05196327, 1.05168230, 1.05140310, 1.05112567, 1.05084999, 1.05057604, 1.05030382, 1.05003330, 1.04976448, 1.04949734, 1.04923186, 1.04896804, 1.04870586, 1.04844531, 1.04818637, 1.04792904, 1.04767330, 1.04741913, 1.04716653, 1.04691548, 1.04666597, 1.04641800, 1.04617153, 1.04592658, 1.04568312, 1.04544114, 1.04520063, 1.04496159, 1.04472399, 1.04448783, 1.04425310, 1.04401978, 1.04378787, 1.04355736, 1.04332823, 1.04310047, 1.04287408, 1.04264905, 1.04242536, 1.04220300, 1.04198196, 1.04176225, 1.04154383, 1.04132671, 1.04111088, 1.04089633, 1.04068304, 1.04047101, 1.04026023, 1.04005069, 1.03984238, 1.03963529, 1.03942942, 1.03922475, 1.03902128, 1.03881899, 1.03861789, 1.03841795, 1.03821918, 1.03802157, 1.03782509, 1.03762976, 1.03743556, 1.03724248, 1.03705051, 1.03685965, 1.03666990, 1.03648123, 1.03629364, 1.03610713, 1.03592169, 1.03573732, 1.03555399, 1.03537172, 1.03519048, 1.03501028, 1.03483110, 1.03465294, 1.03447579, 1.03429965, 1.03412450, 1.03395035, 1.03377718, 1.03360499, 1.03343377, 1.03326352, 1.03309422, 1.03292588, 1.03275848, 1.03259202, 1.03242650, 1.03226190, 1.03209822, 1.03193546, 1.03177360, 1.03161265, 1.03145260, 1.03129344, 1.03113516, 1.03097776, 1.03082123, 1.03066558, 1.03051078, 1.03035684, 1.03020375, 1.03005151, 1.02990011, 1.02974954, 1.02959981, 1.02945089, 1.02930280, 1.02915551, 1.02900904, 1.02886337, 1.02871850, 1.02857442, 1.02843112, 1.02828862, 1.02814688, 1.02800593, 1.02786573, 1.02772631, 1.02758764, 1.02744972, 1.02731256, 1.02717613, 1.02704045, 1.02690550, 1.02677128, 1.02663779, 1.02650502, 1.02637296, 1.02624162, 1.02611099, 1.02598106, 1.02585183, 1.02572329, 1.02559544, 1.02546828, 1.02534180, 1.02521600, 1.02509087, 1.02496642, 1.02484263, 1.02471950, 1.02459702, 1.02447520, 1.02435403, 1.02423351, 1.02411362, 1.02399438, 1.02387577, 1.02375778, 1.02364043, 1.02352369, 1.02340758, 1.02329208, 1.02317719, 1.02306291, 1.02294923, 1.02283615, 1.02272367, 1.02261179, 1.02250049, 1.02238978, 1.02227965, 1.02217010, 1.02206113, 1.02195272, 1.02184489, 1.02173763, 1.02163092, 1.02152477, 1.02141918, 1.02131415, 1.02120966, 1.02110572, 1.02100232, 1.02089945, 1.02079713, 1.02069534, 1.02059408, 1.02049335, 1.02039314, 1.02029345, 1.02019428, 1.02009562, 1.01999748, 1.01989984, 1.01980271, 1.01970609, 1.01960996, 1.01951433, 1.01941920, 1.01932456, 1.01923040, 1.01913673, 1.01904355, 1.01895085, 1.01885862, 1.01876687, 1.01867559, 1.01858478, 1.01849444, 1.01840456, 1.01831514, 1.01822618, 1.01813768, 1.01804963, 1.01796204, 1.01787489, 1.01778819, 1.01770193, 1.01761611, 1.01753073, 1.01744579, 1.01736128, 1.01727720, 1.01719356, 1.01711033, 1.01702754, 1.01694516, 1.01686320, 1.01678166, 1.01670053, 1.01661982, 1.01653952, 1.01645962, 1.01638013, 1.01630104, 1.01622236, 1.01614407, 1.01606618, 1.01598868, 1.01591158, 1.01583487, 1.01575854, 1.01568260, 1.01560704, 1.01553186, 1.01545707, 1.01538265, 1.01530861, 1.01523493, 1.01516163, 1.01508870, 1.01501614, 1.01494394, 1.01487211, 1.01480063, 1.01472952, 1.01465876, 1.01458835, 1.01451830, 1.01444861, 1.01437926, 1.01431026, 1.01424160, 1.01417329, 1.01410532, 1.01403769, 1.01397039, 1.01390344, 1.01383682, 1.01377053, 1.01370457, 1.01363894, 1.01357364, 1.01350866, 1.01344401, 1.01337968, 1.01331567, 1.01325198, 1.01318861, 1.01312555, 1.01306281, 1.01300038, 1.01293825, 1.01287644, 1.01281493, 1.01275373, 1.01269283, 1.01263224, 1.01257194, 1.01251194, 1.01245225, 1.01239284, 1.01233373, 1.01227491, 1.01221639, 1.01215815, 1.01210020, 1.01204254, 1.01198516, 1.01192807, 1.01187126, 1.01181472, 1.01175847, 1.01170250, 1.01164680, 1.01159137, 1.01153622, 1.01148134, 1.01142673, 1.01137239, 1.01131831, 1.01126451, 1.01121096, 1.01115768, 1.01110466, 1.01105191, 1.01099941, 1.01094717, 1.01089518, 1.01084345, 1.01079197, 1.01074075, 1.01068978, 1.01063906, 1.01058858, 1.01053835, 1.01048837, 1.01043864, 1.01038914, 1.01033989, 1.01029088, 1.01024211, 1.01019358, 1.01014528, 1.01009722, 1.01004940, 1.01000181, 1.00995445, 1.00990732, 1.00986042, 1.00981375, 1.00976731, 1.00972109, 1.00967510, 1.00962933, 1.00958379, 1.00953847, 1.00949337, 1.00944848, 1.00940382, 1.00935937, 1.00931514, 1.00927112, 1.00922732, 1.00918373, 1.00914036, 1.00909719, 1.00905423, 1.00901148, 1.00896894, 1.00892660, 1.00888447, 1.00884255, 1.00880082, 1.00875930, 1.00871798, 1.00867686, 1.00863594, 1.00859522, 1.00855469, 1.00851436, 1.00847423, 1.00843429, 1.00839454, 1.00835499, 1.00831562, 1.00827645, 1.00823746, 1.00819866, 1.00816006, 1.00812163, 1.00808339, 1.00804534, 1.00800747, 1.00796978, 1.00793228, 1.00789495, 1.00785781, 1.00782084, 1.00778405, 1.00774744, 1.00771101, 1.00767475, 1.00763866, 1.00760275, 1.00756701, 1.00753145, 1.00749605, 1.00746082, 1.00742577, 1.00739088, 1.00735616, 1.00732160, 1.00728722, 1.00725299, 1.00721893, 1.00718504, 1.00715131, 1.00711774, 1.00708433, 1.00705108, 1.00701799, 1.00698506, 1.00695228, 1.00691966, 1.00688720, 1.00685490, 1.00682275, 1.00679075, 1.00675891, 1.00672722, 1.00669568, 1.00666429, 1.00663305, 1.00660196, 1.00657102, 1.00654023, 1.00650958, 1.00647908, 1.00644873, 1.00641852, 1.00638846, 1.00635854, 1.00632876, 1.00629912, 1.00626963, 1.00624027, 1.00621106, 1.00618199, 1.00615305, 1.00612425, 1.00609559, 1.00606707, 1.00603868, 1.00601043, 1.00598231, 1.00595433, 1.00592648, 1.00589876, 1.00587117, 1.00584372, 1.00581639, 1.00578920, 1.00576213, 1.00573520, 1.00570839, 1.00568171, 1.00565515, 1.00562873, 1.00560242, 1.00557625, 1.00555019, 1.00552426, 1.00549846, 1.00547278, 1.00544721, 1.00542177, 1.00539645, 1.00537126, 1.00534618, 1.00532122, 1.00529637, 1.00527165, 1.00524704, 1.00522255, 1.00519818, 1.00517392, 1.00514977, 1.00512575, 1.00510183, 1.00507803, 1.00505434, 1.00503076, 1.00500730, 1.00498394, 1.00496070, 1.00493756, 1.00491454, 1.00489162, 1.00486882, 1.00484612, 1.00482353, 1.00480104, 1.00477866, 1.00475639, 1.00473422, 1.00471216, 1.00469020, 1.00466835, 1.00464659, 1.00462495, 1.00460340, 1.00458195, 1.00456061, 1.00453937, 1.00451823, 1.00449718, 1.00447624, 1.00445540, 1.00443465, 1.00441400, 1.00439345, 1.00437300, 1.00435264, 1.00433238, 1.00431222, 1.00429214, 1.00427217, 1.00425229, 1.00423250, 1.00421280, 1.00419320, 1.00417369, 1.00415427, 1.00413495, 1.00411571, 1.00409657, 1.00407751, 1.00405855, 1.00403967, 1.00402089, 1.00400219, 1.00398358, 1.00396506, 1.00394662, 1.00392827, 1.00391001, 1.00389183, 1.00387374, 1.00385574, 1.00383781, 1.00381998, 1.00380222, 1.00378455, 1.00376697, 1.00374946, 1.00373204, 1.00371470, 1.00369744, 1.00368027, 1.00366317, 1.00364615, 1.00362922, 1.00361236, 1.00359558, 1.00357888, 1.00356226, 1.00354572, 1.00352925, 1.00351287, 1.00349656, 1.00348032, 1.00346416, 1.00344808, 1.00343207, 1.00341614, 1.00340028, 1.00338450, 1.00336879, 1.00335316, 1.00333760, 1.00332211, 1.00330669, 1.00329135, 1.00327607, 1.00326087, 1.00324574, 1.00323069, 1.00321570, 1.00320078, 1.00318593, 1.00317115, 1.00315645, 1.00314181, 1.00312723, 1.00311273, 1.00309829, 1.00308393, 1.00306963, 1.00305539, 1.00304122, 1.00302712, 1.00301309, 1.00299912, 1.00298522, 1.00297138, 1.00295760, 1.00294389, 1.00293025, 1.00291666, 1.00290315, 1.00288969, 1.00287630, 1.00286297, 1.00284970, 1.00283650, 1.00282335, 1.00281027, 1.00279725, 1.00278429, 1.00277139, 1.00275855, 1.00274577, 1.00273305, 1.00272039, 1.00270779, 1.00269525, 1.00268276, 1.00267034, 1.00265797, 1.00264566, 1.00263341, 1.00262121, 1.00260907, 1.00259699, 1.00258497, 1.00257300, 1.00256109, 1.00254923, 1.00253743, 1.00252568, 1.00251399, 1.00250235, 1.00249076, 1.00247923, 1.00246776, 1.00245634, 1.00244497, 1.00243365, 1.00242239, 1.00241118, 1.00240002, 1.00238891, 1.00237786, 1.00236685, 1.00235590, 1.00234500, 1.00233415, 1.00232335, 1.00231260, 1.00230190, 1.00229125, 1.00228065, 1.00227010, 1.00225960, 1.00224915, 1.00223875, 1.00222839, 1.00221808, 1.00220782, 1.00219761, 1.00218745, 1.00217733, 1.00216726, 1.00215724, 1.00214727, 1.00213734, 1.00212745, 1.00211762, 1.00210782, 1.00209808, 1.00208838, 1.00207872, 1.00206911, 1.00205955, 1.00205003, 1.00204055, 1.00203112, 1.00202173, 1.00201238, 1.00200308, 1.00199382, 1.00198461, 1.00197543, 1.00196630, 1.00195721, 1.00194817, 1.00193917, 1.00193020, 1.00192128, 1.00191241, 1.00190357, 1.00189477, 1.00188602, 1.00187730, 1.00186863, 1.00186000, 1.00185140, 1.00184285, 1.00183433, 1.00182586, 1.00181743, 1.00180903, 1.00180067, 1.00179235, 1.00178408, 1.00177583, 1.00176763, 1.00175947, 1.00175134, 1.00174325, 1.00173520, 1.00172719, 1.00171921, 1.00171127, 1.00170337, 1.00169550, 1.00168767, 1.00167988, 1.00167212, 1.00166440, 1.00165671, 1.00164906, 1.00164145, 1.00163387, 1.00162633, 1.00161882, 1.00161134, 1.00160391, 1.00159650, 1.00158913, 1.00158179, 1.00157449, 1.00156722, 1.00155999, 1.00155279, 1.00154562, 1.00153849, 1.00153138, 1.00152432, 1.00151728, 1.00151028, 1.00150331, 1.00149637, 1.00148946, 1.00148259, 1.00147575, 1.00146894, 1.00146216, 1.00145541, 1.00144869, 1.00144201, 1.00143536, 1.00142873, 1.00142214, 1.00141558, 1.00140905, 1.00140254, 1.00139607, 1.00138963, 1.00138322, 1.00137684, 1.00137049, 1.00136416, 1.00135787, 1.00135161, 1.00134537, 1.00133917, 1.00133299, 1.00132684, 1.00132072, 1.00131463, 1.00130856, 1.00130253, 1.00129652, 1.00129054, 1.00128459, 1.00127866, 1.00127276, 1.00126689, 1.00126105, 1.00125523, 1.00124945, 1.00124368, 1.00123795, 1.00123224, 1.00122656, 1.00122090, 1.00121527, 1.00120967, 1.00120409, 1.00119854, 1.00119301, 1.00118751, 1.00118203, 1.00117658, 1.00117116, 1.00116576, 1.00116038, 1.00115503, 1.00114971, 1.00114441, 1.00113913, 1.00113388, 1.00112865, 1.00112345, 1.00111827, 1.00111311, 1.00110798, 1.00110288, 1.00109779, 1.00109273, 1.00108769, 1.00108268, 1.00107769, 1.00107272, 1.00106778, 1.00106286, 1.00105796, 1.00105308, 1.00104823, 1.00104340, 1.00103859, 1.00103380, 1.00102904, 1.00102429, 1.00101957, 1.00101487, 1.00101020, 1.00100554, 1.00100091, 1.00099629, 1.00099170, 1.00098713, 1.00098258, 1.00097806, 1.00097355, 1.00096906, 1.00096460, 1.00096015, 1.00095573, 1.00095133, 1.00094694, 1.00094258, 1.00093824, 1.00093391, 1.00092961, 1.00092533, 1.00092106, 1.00091682, 1.00091260, 1.00090839, 1.00090421, 1.00090004, 1.00089589, 1.00089177, 1.00088766, 1.00088357, 1.00087950, 1.00087545, 1.00087142, 1.00086740, 1.00086341, 1.00085943, 1.00085547, 1.00085153, 1.00084761, 1.00084370, 1.00083982, 1.00083595, 1.00083210, 1.00082826, 1.00082445, 1.00082065, 1.00081687, 1.00081311, 1.00080936, 1.00080564, 1.00080193, 1.00079823, 1.00079456, 1.00079090, 1.00078726, 1.00078363, 1.00078002, 1.00077643, 1.00077285, 1.00076929, 1.00076575, 1.00076222, 1.00075871, 1.00075522, 1.00075174, 1.00074828, 1.00074484, 1.00074141, 1.00073799, 1.00073459, 1.00073121, 1.00072784, 1.00072449, 1.00072116, 1.00071784, 1.00071453, 1.00071124, 1.00070797, 1.00070471, 1.00070146, 1.00069823, 1.00069502, 1.00069182, 1.00068863, 1.00068546, 1.00068231, 1.00067916, 1.00067604, 1.00067293, 1.00066983, 1.00066674, 1.00066367, 1.00066062, 1.00065758, 1.00065455, 1.00065154, 1.00064854, 1.00064555, 1.00064258, 1.00063962, 1.00063668, 1.00063375, 1.00063083, 1.00062793, 1.00062503, 1.00062216, 1.00061929, 1.00061644, 1.00061361, 1.00061078, 1.00060797, 1.00060517, 1.00060239, 1.00059961, 1.00059685, 1.00059411, 1.00059137, 1.00058865, 1.00058594, 1.00058324, 1.00058056, 1.00057789, 1.00057523, 1.00057258, 1.00056994, 1.00056732, 1.00056471, 1.00056211, 1.00055952, 1.00055695, 1.00055439, 1.00055183, 1.00054930, 1.00054677, 1.00054425, 1.00054175, 1.00053925, 1.00053677, 1.00053430, 1.00053184, 1.00052939, 1.00052696, 1.00052453, 1.00052212, 1.00051972, 1.00051733, 1.00051495, 1.00051258, 1.00051022, 1.00050787, 1.00050553, 1.00050321, 1.00050089, 1.00049859, 1.00049629, 1.00049401, 1.00049173, 1.00048947, 1.00048722, 1.00048498, 1.00048275, 1.00048053, 1.00047831, 1.00047611, 1.00047392, 1.00047174, 1.00046957, 1.00046741, 1.00046526, 1.00046312, 1.00046099, 1.00045887, 1.00045676, 1.00045466, 1.00045256, 1.00045048, 1.00044841, 1.00044635, 1.00044429, 1.00044225, 1.00044021, 1.00043819, 1.00043617, 1.00043417, 1.00043217, 1.00043018, 1.00042820, 1.00042623, 1.00042427, 1.00042232, 1.00042038, 1.00041844, 1.00041652, 1.00041460, 1.00041269, 1.00041080, 1.00040891, 1.00040702, 1.00040515, 1.00040329, 1.00040143, 1.00039959, 1.00039775, 1.00039592, 1.00039410, 1.00039228, 1.00039048, 1.00038868, 1.00038690, 1.00038512, 1.00038334, 1.00038158, 1.00037983, 1.00037808, 1.00037634, 1.00037461, 1.00037289, 1.00037117, 1.00036946, 1.00036776, 1.00036607, 1.00036439, 1.00036271, 1.00036104, 1.00035938, 1.00035773, 1.00035609, 1.00035445, 1.00035282, 1.00035119, 1.00034958, 1.00034797, 1.00034637, 1.00034478, 1.00034319, 1.00034161, 1.00034004, 1.00033848, 1.00033692, 1.00033537, 1.00033383, 1.00033229, 1.00033077, 1.00032924, 1.00032773, 1.00032622, 1.00032472, 1.00032323, 1.00032174, 1.00032026, 1.00031879, 1.00031732, 1.00031587, 1.00031441, 1.00031297, 1.00031153, 1.00031009, 1.00030867, 1.00030725, 1.00030584, 1.00030443, 1.00030303, 1.00030164, 1.00030025, 1.00029887, 1.00029749, 1.00029613, 1.00029476, 1.00029341, 1.00029206, 1.00029072, 1.00028938, 1.00028805, 1.00028672, 1.00028541, 1.00028409, 1.00028279, 1.00028149, 1.00028019, 1.00027890, 1.00027762, 1.00027634, 1.00027507, 1.00027381, 1.00027255, 1.00027130, 1.00027005, 1.00026881, 1.00026757, 1.00026634, 1.00026512, 1.00026390, 1.00026268, 1.00026148, 1.00026027, 1.00025908, 1.00025789, 1.00025670, 1.00025552, 1.00025434, 1.00025317, 1.00025201, 1.00025085, 1.00024970, 1.00024855, 1.00024741, 1.00024627, 1.00024514, 1.00024401, 1.00024289, 1.00024177, 1.00024066, 1.00023955, 1.00023845, 1.00023736, 1.00023626, 1.00023518, 1.00023410, 1.00023302, 1.00023195, 1.00023088, 1.00022982, 1.00022876, 1.00022771, 1.00022667, 1.00022562, 1.00022459, 1.00022355, 1.00022253, 1.00022150, 1.00022048, 1.00021947, 1.00021846, 1.00021746, 1.00021646, 1.00021546, 1.00021447, 1.00021349, 1.00021250, 1.00021153, 1.00021055, 1.00020959, 1.00020862, 1.00020766, 1.00020671, 1.00020576, 1.00020481, 1.00020387, 1.00020293, 1.00020200, 1.00020107, 1.00020015, 1.00019923, 1.00019831, 1.00019740, 1.00019649, 1.00019559, 1.00019469, 1.00019380, 1.00019290, 1.00019202, 1.00019113, 1.00019026, 1.00018938, 1.00018851, 1.00018764, 1.00018678, 1.00018592, 1.00018507, 1.00018422, 1.00018337, 1.00018253, 1.00018169, 1.00018085, 1.00018002, 1.00017919, 1.00017837, 1.00017755, 1.00017673, 1.00017592, 1.00017511, 1.00017431, 1.00017351, 1.00017271, 1.00017192, 1.00017112, 1.00017034, 1.00016956, 1.00016878, 1.00016800, 1.00016723, 1.00016646, 1.00016569, 1.00016493, 1.00016417, 1.00016342, 1.00016267, 1.00016192, 1.00016118, 1.00016044, 1.00015970, 1.00015896, 1.00015823, 1.00015751, 1.00015678, 1.00015606, 1.00015534, 1.00015463, 1.00015392, 1.00015321, 1.00015251, 1.00015181, 1.00015111, 1.00015041, 1.00014972, 1.00014903, 1.00014835, 1.00014767, 1.00014699, 1.00014631, 1.00014564, 1.00014497, 1.00014430, 1.00014364, 1.00014298, 1.00014232, 1.00014167, 1.00014102, 1.00014037, 1.00013972, 1.00013908, 1.00013844, 1.00013781, 1.00013717, 1.00013654, 1.00013591, 1.00013529, 1.00013467, 1.00013405, 1.00013343, 1.00013282, 1.00013221, 1.00013160, 1.00013100, 1.00013039, 1.00012980, 1.00012920, 1.00012860, 1.00012801, 1.00012743, 1.00012684, 1.00012626, 1.00012568, 1.00012510, 1.00012452, 1.00012395, 1.00012338, 1.00012281, 1.00012225, 1.00012169, 1.00012113, 1.00012057, 1.00012002, 1.00011947, 1.00011892, 1.00011837, 1.00011783, 1.00011729, 1.00011675, 1.00011621, 1.00011568, 1.00011514, 1.00011461, 1.00011409, 1.00011356, 1.00011304, 1.00011252, 1.00011200, 1.00011149, 1.00011098, 1.00011047, 1.00010996, 1.00010945, 1.00010895, 1.00010845, 1.00010795, 1.00010746, 1.00010696, 1.00010647, 1.00010598, 1.00010549, 1.00010501, 1.00010453, 1.00010405, 1.00010357, 1.00010309, 1.00010262, 1.00010215, 1.00010168, 1.00010121, 1.00010074, 1.00010028, 1.00009982, 1.00009936, 1.00009891, 1.00009845, 1.00009800, 1.00009755, 1.00009710, 1.00009665, 1.00009621, 1.00009577, 1.00009533, 1.00009489, 1.00009445, 1.00009402, 1.00009359, 1.00009316, 1.00009273, 1.00009230, 1.00009188, 1.00009146, 1.00009104, 1.00009062, 1.00009020, 1.00008979, 1.00008937, 1.00008896, 1.00008855, 1.00008815, 1.00008774, 1.00008734, 1.00008694, 1.00008654, 1.00008614, 1.00008574, 1.00008535, 1.00008496, 1.00008457, 1.00008418, 1.00008379, 1.00008341, 1.00008302, 1.00008264, 1.00008226, 1.00008188, 1.00008151, 1.00008113, 1.00008076, 1.00008039, 1.00008002, 1.00007965, 1.00007929, 1.00007892, 1.00007856, 1.00007820, 1.00007784, 1.00007748, 1.00007712, 1.00007677, 1.00007642, 1.00007607, 1.00007572, 1.00007537, 1.00007502, 1.00007468, 1.00007433, 1.00007399, 1.00007365, 1.00007331, 1.00007298, 1.00007264, 1.00007231, 1.00007198, 1.00007164, 1.00007132, 1.00007099, 1.00007066, 1.00007034, 1.00007001, 1.00006969, 1.00006937, 1.00006905, 1.00006874, 1.00006842, 1.00006810, 1.00006779, 1.00006748, 1.00006717, 1.00006686, 1.00006655, 1.00006625, 1.00006594, 1.00006564, 1.00006534, 1.00006504, 1.00006474, 1.00006444, 1.00006415, 1.00006385, 1.00006356, 1.00006327, 1.00006298, 1.00006269, 1.00006240, 1.00006211, 1.00006183, 1.00006154, 1.00006126, 1.00006098, 1.00006070, 1.00006042, 1.00006014, 1.00005986, 1.00005959, 1.00005932, 1.00005904, 1.00005877, 1.00005850, 1.00005823, 1.00005796, 1.00005770, 1.00005743, 1.00005717, 1.00005691, 1.00005665, 1.00005639, 1.00005613, 1.00005587, 1.00005561, 1.00005536, 1.00005510, 1.00005485, 1.00005460, 1.00005435, 1.00005410, 1.00005385, 1.00005360, 1.00005335, 1.00005311, 1.00005286, 1.00005262, 1.00005238, 1.00005214, 1.00005190, 1.00005166, 1.00005142, 1.00005119, 1.00005095, 1.00005072, 1.00005048, 1.00005025, 1.00005002, 1.00004979, 1.00004956, 1.00004933, 1.00004911, 1.00004888, 1.00004866, 1.00004843, 1.00004821, 1.00004799, 1.00004777, 1.00004755, 1.00004733, 1.00004711, 1.00004690, 1.00004668, 1.00004647, 1.00004625, 1.00004604, 1.00004583, 1.00004562, 1.00004541, 1.00004520, 1.00004499, 1.00004479, 1.00004458, 1.00004438, 1.00004417, 1.00004397, 1.00004377, 1.00004357, 1.00004337, 1.00004317, 1.00004297, 1.00004277, 1.00004257, 1.00004238, 1.00004218, 1.00004199, 1.00004180, 1.00004160, 1.00004141, 1.00004122, 1.00004103, 1.00004085, 1.00004066, 1.00004047, 1.00004028, 1.00004010, 1.00003992, 1.00003973, 1.00003955, 1.00003937, 1.00003919, 1.00003901, 1.00003883, 1.00003865, 1.00003847, 1.00003829, 1.00003812, 1.00003794, 1.00003777, 1.00003760, 1.00003742, 1.00003725, 1.00003708, 1.00003691, 1.00003674, 1.00003657, 1.00003640, 1.00003624, 1.00003607, 1.00003590, 1.00003574, 1.00003557, 1.00003541, 1.00003525, 1.00003509, 1.00003492, 1.00003476, 1.00003460, 1.00003445, 1.00003429, 1.00003413, 1.00003397, 1.00003382, 1.00003366, 1.00003351, 1.00003335, 1.00003320, 1.00003305, 1.00003290, 1.00003274, 1.00003259, 1.00003244, 1.00003229, 1.00003215, 1.00003200, 1.00003185, 1.00003171, 1.00003156, 1.00003141, 1.00003127, 1.00003113, 1.00003098, 1.00003084, 1.00003070, 1.00003056, 1.00003042, 1.00003028, 1.00003014, 1.00003000, 1.00002986, 1.00002973, 1.00002959, 1.00002945, 1.00002932, 1.00002918, 1.00002905, 1.00002892, 1.00002878, 1.00002865, 1.00002852, 1.00002839, 1.00002826, 1.00002813, 1.00002800, 1.00002787, 1.00002774, 1.00002761, 1.00002749, 1.00002736, 1.00002723, 1.00002711, 1.00002699, 1.00002686, 1.00002674, 1.00002661, 1.00002649, 1.00002637, 1.00002625, 1.00002613, 1.00002601, 1.00002589, 1.00002577, 1.00002565, 1.00002553, 1.00002542, 1.00002530, 1.00002518, 1.00002507, 1.00002495, 1.00002484, 1.00002472, 1.00002461, 1.00002450, 1.00002438, 1.00002427, 1.00002416, 1.00002405, 1.00002394, 1.00002383, 1.00002372, 1.00002361, 1.00002350, 1.00002339, 1.00002329, 1.00002318, 1.00002307, 1.00002297, 1.00002286, 1.00002276, 1.00002265, 1.00002255, 1.00002244, 1.00002234, 1.00002224, 1.00002214, 1.00002204, 1.00002193, 1.00002183, 1.00002173, 1.00002163, 1.00002153, 1.00002143, 1.00002134, 1.00002124, 1.00002114, 1.00002104, 1.00002095, 1.00002085, 1.00002075, 1.00002066, 1.00002056, 1.00002047, 1.00002038, 1.00002028, 1.00002019, 1.00002010, 1.00002000, 1.00001991, 1.00001982, 1.00001973, 1.00001964, 1.00001955, 1.00001946, 1.00001937, 1.00001928, 1.00001919, 1.00001910, 1.00001902, 1.00001893, 1.00001884, 1.00001875, 1.00001867, 1.00001858, 1.00001850, 1.00001841, 1.00001833, 1.00001824, 1.00001816, 1.00001808, 1.00001799, 1.00001791, 1.00001783, 1.00001775, 1.00001766, 1.00001758, 1.00001750, 1.00001742, 1.00001734, 1.00001726, 1.00001718, 1.00001710, 1.00001703, 1.00001695, 1.00001687, 1.00001679, 1.00001672, 1.00001664, 1.00001656, 1.00001649, 1.00001641, 1.00001633, 1.00001626, 1.00001618, 1.00001611, 1.00001604, 1.00001596, 1.00001589, 1.00001582, 1.00001574, 1.00001567, 1.00001560, 1.00001553, 1.00001546, 1.00001539, 1.00001531, 1.00001524, 1.00001517, 1.00001510, 1.00001504, 1.00001497, 1.00001490, 1.00001483, 1.00001476, 1.00001469, 1.00001463, 1.00001456, 1.00001449, 1.00001442, 1.00001436, 1.00001429, 1.00001423, 1.00001416, 1.00001410, 1.00001403, 1.00001397, 1.00001390, 1.00001384, 1.00001378, 1.00001371, 1.00001365, 1.00001359, 1.00001352, 1.00001346, 1.00001340, 1.00001334, 1.00001328, 1.00001322, 1.00001316, 1.00001310, 1.00001303, 1.00001297, 1.00001292, 1.00001286, 1.00001280, 1.00001274, 1.00001268, 1.00001262, 1.00001256, 1.00001251,
];

var table = {"z": zColumn, "B0": B0column};

module.exports = {
  get table() { return table; },
};

},{}],13:[function(require,module,exports){
/** Finite Source module.
  * Handles calculations of finite source effects.
  *
  * @module fspl-microlensing-event-finite-source
  */

;

var everpolate = require("everpolate");

var eventModule = require("./fspl-microlensing-event.js");
var lensPlaneModule = require("./fspl-microlensing-event-lens-plane.js");
var tableModule = require("./fspl-microlensing-event-finite-source-table.js");

var smallZarray = [];
var largeZarray = [];
var lastZarray = [];

/** getFiniteSourceFactor */
function getFiniteSourceFactor(u) {
  var sourceRadius = lensPlaneModule.sourceRadius;
  var thetaE_mas = eventModule.thetaE_mas;
  var table = tableModule.table;

  var rhoNormalized = sourceRadius / thetaE_mas;

  var z = u/rhoNormalized;

  var zColumn = table.z;
  var B0column = table.B0;

  var B0 = everpolate.linear(z, zColumn, B0column);
  // var B0 = interpolateFromTables(z, zColumn, B0column)

  if (typeof this.printedOnce === "undefined" || this.printedOnce === false ||
      (z > 1.01 && z < 1.02)) {
    ;
    ;
    this.printedOnce = true;
  }

  return B0
}


module.exports = {
  getFiniteSourceFactor: getFiniteSourceFactor,
};

},{"./fspl-microlensing-event-finite-source-table.js":12,"./fspl-microlensing-event-lens-plane.js":14,"./fspl-microlensing-event.js":15,"everpolate":1}],14:[function(require,module,exports){
/** Lens Plane Module.
  * Handles calculation and drawing of the lens plane plot for the microlensing
  * event.
  *
  * Depicts the source's path across the sky when the lenses are held fixed.
  *
  * Also listens for events from related UI buttons/sliders.
  *
  * @module fspl-microlensing-event-lens-plane
  */

;

var _ = require("lodash");

var eventModule = require("./fspl-microlensing-event.js")

var almostEquals = require("./utils.js").almostEquals;
var ellipse = require("./utils.js").ellipse;
var Lens = require("./Lens.js");

// whether module init function has been executed
var initialized = false;

// base variables (borders)
var picLeftBorder = 50;
var picTopBorder = 50;
var picWidth = 400;
var picHeight = 300;

// base variables (trails)
var picLeftTrail = 10;
var picRightTrail = 0;
var picTopTrail = 0;
var picBottomTrail = 10;

// plot range/scale
var dayWidth = 30;
var thetaXwidth = 4/3;
var thetaYheight = 1; // mas
var xAxisInitialDay = -15;
var xAxisInitialThetaX = -(4/3)/2
var yAxisInitialThetaY = -0.5; // half of thetaYheight so that 0 is the middle
var xGridStepDefault = 0.1;
var yGridStepDefault = 0.1;

var lens1;

//base variables (background/picture aesthetics)
var backgroundColor = "#ffffe6";
var picBackgroundColor = "#eff";
var picBorderColor = "grey";
var picBorderWidth = 1;

var ringColor = "dimgrey";
var ringWidth = 2;
var dashedRingLength = 5;
var dashedRingSpacing = 5;

var pathColor = "blue";
var pathWidth = 2;

var dashedPathColor = "green";
var dashedPathWidth = 2;
var dashedPathLength = 8;
var dashedPathSpacing = 10;

// darker teal
var sourceColor = "#004d4d";
// initialized elsewhere in function

// mas
var sourceRadius;
var sourceOutlineWidth = 2;
var sourceOutlineColor = "teal";

var lensPixelRadius = 2;
var lensColor = "red";
var lensOutlineWidth = 2;
var lensOutlineColor = lensColor;

var uArrowColor;
var uArrowWidth;

var axisColor = "black";
var axisWidth = "2";

var gridColor = "grey";
var gridWidth = 1;

var lensedImageRadius = 2;
var lensedImageLineWidth = 2;
var dashedLensedImageLength = 5;
var dashedLensedImageSpacing = 0;
var lensedImagePlusColor = "purple";
var lensedImagePlusOutlineColor = "fuchsia";
var lensedImageMinusColor = "green";
var lensedImageMinusOutlineColor = "lime";

//base variables (tick labels)
var tickLabelFont = "8pt Arial";
var tickLabelColor = "black";
var tickLabelAlign = "center";
var tickLabelBaseline = "middle";
// spacing between tick label and end of trailing gridline
var tickLabelSpacing = 7;

// base variables (axis labels)
var xDayLabel = "time (days)";
// thetaX
var xLabel = String.fromCharCode(952) + "x (mas)";
// thetaY
var yLabel = String.fromCharCode(952) + "y (mas)";
var axisLabelFont = "10pt Arial";
var axisLabelColor = "black";
var axisLabelAlign = "center";
var axisLabelBaseline = "middle";
var axisLabelSpacing = 27;

//derived variables (borders)
var picRightBorder;
var picBottomBorder;
var centerX;
var centerY;

// derived variables (trails)
var picLeftTrailingBorder;
var picRightTrailingBorder;
var picTopTrailingBorder;
var picBottomTrailingBorder;

// derived variables (range/scale)
var xDayPixelScale;
var xPixelScale;
var yPixelScale;
var xAxisFinalDay;
var yAxisFinalThetaY;

// derived variables (gridlines)
var xGridInitial;
var yGridInitial;
var xGridFinal;
var yGridFinal;
var xGridStep;
var yGridStep;

// derived variable (source/lens/ring)
// x value: time (days), y value: thetaY
var sourcePos;
// pixel x and y values
var sourcePixelPos;
var ringRadius = {x: undefined, y: undefined}
var lensedImages;
var sourceOutline;
var lensedImageOutlines;

//sort of derived variables? but not really? (canvas/context)
var mainCanvas = document.getElementById("lensPlaneCanvas");
var mainContext = mainCanvas.getContext("2d");

// off-screen canvases for critical/caustic curves
var critCanvas = document.createElement("canvas");
critCanvas.width = mainCanvas.width;
critCanvas.height = mainCanvas.width;
var critContext = critCanvas.getContext("2d");

var causticCanvas = document.createElement("canvas");
causticCanvas.width = mainCanvas.width;
causticCanvas.height = mainCanvas.width;
var causticContext = causticCanvas.getContext("2d");

var curveCanvases = {crit:critCanvas, caustic:causticCanvas};
var curveContexts = {crit:critContext, caustic:causticContext};

// readout of current source thetaX position
var thetaXreadout = document.getElementById("thetaXreadout");

var sourceRadiusNormalizedReadout = document.getElementById("sourceRadiusNormalizedReadout");
var sourceRadiusSlider = document.getElementById("sourceRadiusSlider");
var sourceRadiusReadout = document.getElementById("sourceRadiusReadout");

// checkboxes
var displayImagesCheckbox = document.getElementById("displayImagesCheckbox");
var displayRingsCheckbox = document.getElementById("displayRingsCheckbox");

// number of points into which source outline is divided
// i.e. a value of 8 would divide the outline into 8
// evenly spaced points
var numPointsDefault = 360;
var numExtraPointsDefault = 360;

// default checkbox values
var ringsFlagDefault = true;
var imagesFlagDefault = true;

// flags toggled by checkbox
var displayFlags = {};

// initialize default checkbox flag values, even if the checkboxes don't exist
// on html page
displayFlags.images = imagesFlagDefault;
displayFlags.rings = ringsFlagDefault;

// debug flags
var centerLayoutFlag = false;
var drawGridFlag = true;
var drawFullLensedImagesFlag = true;

// if true, grid lines/ticks for that axis are created in steps starting from 0,
// rather than starting from the lowest x-axis value or y-axis value
var centerXgridOnZeroFlag = true;
var centerYgridOnZeroFlag = true;

// firefox doesn't support context.ellipse, so this replaces it with a custom
// ellipse function using context.arc and canvas rescaling/translating
var firefoxCompatibilityFlag = true;

// add more points to outline if source is close to lens
var lensProximityCheckFlag = true;
// obsolete flag originally used to fix lensed images by "clipping" them;
// did not work because clipping wasn't enough
var clippingImageFlag = false;

var updateOnSliderMovementFlag = eventModule.updateOnSliderMovementFlag;
var updateOnSliderReleaseFlag = eventModule.updateOnSliderReleaseFlag;

/** init */
function init() {
  initListeners();
  updateScaleAndRangeValues();
  initLenses();
  initSourcePos();
  initSourceRadius();
  redraw();

  initialized = true;
}

/** initListeners */
function initListeners(updateOnSliderMovement=updateOnSliderMovementFlag,
                       updateOnSliderRelease=updateOnSliderReleaseFlag) {
  initCheckboxes();
  initSliders(updateOnSliderMovement, updateOnSliderRelease);
}

/** initCheckboxes() */
function initCheckboxes() {
  if (typeof displayImagesCheckbox !== "undefined" &&
      displayImagesCheckbox !== null) {
    displayImagesCheckbox.addEventListener("change",
                                           function() {
                                             displayFlags.images = displayImagesCheckbox.checked;
                                             redraw();
                                           },
                                           false);
    // default checkbox to value of flag
    displayImagesCheckbox.checked = displayFlags.images;
  }

  if (typeof displayRingsCheckbox !== "undefined" &&
      displayRingsCheckbox !== null) {
    displayRingsCheckbox.addEventListener("change",
                                          function() {
                                            displayFlags.rings = displayRingsCheckbox.checked;
                                            redraw();
                                          },
                                          false);
    // default checkbox to value of flag
    displayRingsCheckbox.checked = displayFlags.rings;
  }
}

/** initSliders */
function initSliders(updateOnSliderMovement=updateOnSliderMovementFlag,
                       updateOnSliderRelease=updateOnSliderReleaseFlag) {
  ;
  ;

  // update plot when slider is moved
  if (sourceRadiusSlider !== null) {
    if (updateOnSliderMovement === true) {
      sourceRadiusSlider.addEventListener("input", function() { updateSourceRadius(); }, false);
    }

    // update plot when slider is released
    if (updateOnSliderRelease === true) {
      sourceRadiusSlider.addEventListener("change", function() { updateSourceRadius(); }, false);

      // if plot updates only upon slider release,
      // update slider readout alone while slider is being moved,
      // without recalculating/updating other sliders (until after current slider is released)
      if (updateOnSliderMovement === false) {
        sourceRadiusSlider.addEventListener("input",
                                            function() {
                                              eventModule.updateSliderReadout(sourceRadiusSlider,
                                                                              sourceRadiusReadout,
                                                                              "sourceRadius");
                                            },
                                            false);
      }
    }
  }
}

/** initLenses */
function initLenses() {
  var ring1radius_mas = eventModule.calculateThetaE(get_mas=true);

  lens1 = new Lens(xPixelScale, yPixelScale,
                  thetaXtoPixel, thetaYtoPixel,
                  0, 0, lensPixelRadius, lensColor,
                  lensOutlineWidth, lensOutlineColor,
                  ring1radius_mas,
                  ringColor, ringWidth, dashedRingLength, dashedRingSpacing);
}

/** initSourceRadius */
function initSourceRadius() {
  sourceRadius = 4/xPixelScale; // source radius in mas

  lensedImageRadius = sourceRadius*xPixelScale;

  if (sourceRadiusSlider !== null)
    updateSourceRadiusSlider();
}

/** updateSourceRadiusSlider */
function updateSourceRadiusSlider() {
  // source radius in mas
  sourceRadiusSlider.value = sourceRadius;
  eventModule.updateSliderReadout(sourceRadiusSlider, sourceRadiusReadout, "sourceRadius");
}

/** updateSourceRadius */
function updateSourceRadius() {
  // source radisu in mas
  sourceRadius = sourceRadiusSlider.value;
  lensedImageRadius = sourceRadius * xPixelScale;
  updateSourceRadiusSlider();
  eventModule.updateCurveData();
  eventModule.redrawCanvases();
}

/** initSourcePos */
function initSourcePos() {
  var sourcePosY = eventModule.thetaY;
  sourcePos = {x: getThetaX(eventModule.xAxisInitialDay), y: sourcePosY};
}

/** redraw */
function redraw() {
  updateDrawingValues();
  drawing.drawPic();
}

/** updateScaleAndRangeValues */
function updateScaleAndRangeValues() {
  // borders

  // right border of picture x-pixel value, NOT including any trailing gridlines
  picRightBorder = picLeftBorder + picWidth;
  // bottom border of picture y-pixel value, NOT including any trailing gridlines
  picBottomBorder = picTopBorder + picHeight;
  centerX = picWidth/2 + picLeftBorder;
  centerY = picHeight/2 + picTopBorder;

  // trails

  // left border of picture x-pixel value, INCLUDING any trailing gridlines
  picLeftTrailingBorder = picLeftBorder - picLeftTrail;
  // right border of picture x-pixel value, INCLUDING any trailing gridlines
  picRightTrailingBorder = picRightBorder + picRightTrail;
  // top border of picture y-pixel value, INCLUDING any trailing gridlines
  picTopTrailingBorder = picTopBorder - picTopTrail;
  // bottom border of picture y-pixel value, INCLUDING any trailing gridlines
  picBottomTrailingBorder = picBottomBorder + picBottomTrail;

  // range/scale
  xDayPixelScale = picWidth/dayWidth;
  xPixelScale = picWidth/thetaXwidth;
  yPixelScale = picHeight/thetaYheight;

  xAxisFinalDay = xAxisInitialDay + dayWidth;
  xAxisFinalThetaX = xAxisInitialThetaX + thetaXwidth;
  yAxisFinalThetaY = yAxisInitialThetaY + thetaYheight;

  // grid values
  // initialize gridline vars
  updateGridRange(xGridStepDefault, yGridStepDefault);
}

/** updateDrawingValues */
function updateDrawingValues() {
  // update source thetaY
  sourcePos.y = getThetaYpathValue(sourcePos.x);

  // makes sure "0.0000" is displayed instead of "-0.0000" if rounding error
  // occurs
  if (thetaXreadout !== null) {
    var newThetaXreadout = Number(sourcePos.x).toFixed(4)
    if (Number(newThetaXreadout) === -0) {
      newThetaXreadout = Number(0).toFixed(4);
    }
    thetaXreadout.innerHTML = newThetaXreadout; // update source thetaX readout
  }

  if (typeof sourceRadiusNormalizedReadout !== "undefined" &&
      sourceRadiusNormalizedReadout !== null) {
    var newSourceRadiusNormalizedReadout = Number(sourceRadius / eventModule.thetaE_mas).toFixed(4);
    if (Number(newSourceRadiusNormalizedReadout) === -0) {
      newSourceRadiusNormalizedReadout = Number(0).toFixed(4);
    }
    sourceRadiusNormalizedReadout.innerHTML = newSourceRadiusNormalizedReadout;
  }

  // convert position to pixel units
  sourcePixelPos = {x: thetaXtoPixel(sourcePos.x), y: thetaYtoPixel(sourcePos.y)};

  // initialize lense position, appearance, etc.
  initLenses();

  // initialize lensed image positions
  lensedImages = getLensedImages(sourcePos);

  if (drawFullLensedImagesFlag === true &&
      eventModule.finiteSourceFlag === true) {
        sourceOutline = getCircleOutline(sourceRadius, sourcePos);
        lensedImageOutlines = getLensedImageOutlines(sourceOutline);
      }
}

/** thetaXtoPixel */
function thetaXtoPixel(xPicThetaX) {
  var xPixel = (xPicThetaX - xAxisInitialThetaX) * xPixelScale + picLeftBorder;
  return xPixel;
}

/** xDayToPixel */
function xDayToPixel(xPicDay) {
  var xPixel = (xPicDay - xAxisInitialDay) * xDayPixelScale + picLeftBorder;
  return xPixel;
}

/** thetaYtoPixel */
function thetaYtoPixel(yPicThetaY) {
  var yPixel = picBottomBorder - (yPicThetaY - yAxisInitialThetaY) * yPixelScale
  return yPixel;
}

/** getThetaX */
function getThetaX(t) {
  var mu = eventModule.mu;
  var t0 = eventModule.t0;
   // day/year; const
  var yearToDay = 365.25;
  // convert mu to milliarcseconds/day
  var eqMu = mu / yearToDay;
  var thetaX = eqMu * (t - t0);
  return thetaX;
}

/** getThetaYpathValue */
function getThetaYpathValue(thetaX) {

  if (typeof eventModule.incline !== "undefined" &&
      eventModule.incline !== null) {
    var incline_radians = eventModule.incline * Math.PI/180;
    var slope = Math.tan(incline_radians);
  }
  else {
    var slope = 0;
  }

  var thetaYintercept = eventModule.thetaY; // mas

  var thetaYvalue = slope*thetaX + thetaYintercept;
  return thetaYvalue;
}

/** getCircleOutline */
function getCircleOutline(radius=sourceRadius, thetaPos=sourcePos,
                          numPoints=numPointsDefault, initialAngle=0,
                          finalAngle=2*Math.PI, lens=lens1) {
  var outline = [];
  var deltaAngle = (finalAngle - initialAngle)/numPoints;

  for (var angle=initialAngle;
       (angle<finalAngle && almostEquals(angle, finalAngle) === false);
       angle+=deltaAngle) {
    var xOffset = radius * Math.cos(angle);
    var yOffset = radius * Math.sin(angle);
    var point = {x: thetaPos.x + xOffset, y: thetaPos.y + yOffset};

    var deltaX = point.x - lens.pos.x;
    var deltaY = point.y - lens.pos.y;
    var distR = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    var nextAngle = angle+deltaAngle;

    outline.push(point);
    if (lensProximityCheckFlag === true)
      addExtraPoints(outline, radius, thetaPos, angle, nextAngle, distR)
  }
  return outline;
}

/** addExtraPoints */
function addExtraPoints(outline, radius, thetaPos, initialAngle, finalAngle,
                        distR, numExtraPoints=numExtraPointsDefault) {
  var deltaAngle = (finalAngle - initialAngle)/numExtraPoints;

  // distance of point to lens in units of source radius.

  // used to determine when to add extra points.

  // in units of source radius because larger sources require more points to
  // be added.
  
  // mas / mas = unitless
  var z = distR / sourceRadius;

  // threshold below which we add extra points.
  // higher value yields better image shapes, worse performance (plot update
  // speed).

  // Determined happy medium of good shapes vs. performance through testing.
  var minZ = 0.05;

  // Add extra points if z (distance in units of sourcer adius)
  if (z < minZ || almostEquals(z, minZ) === true) {
    for (var angle=initialAngle+deltaAngle;
         (angle<finalAngle && almostEquals(angle, finalAngle) === false);
         angle+=deltaAngle) {
      var xOffset = radius * Math.cos(angle);
      var yOffset = radius * Math.sin(angle);
      var point = {x: thetaPos.x + xOffset, y: thetaPos.y + yOffset};
      outline.push(point);
    }
  }
}

/** getCircleOutlineWithRecursion */
function getCircleOutlineWithRecursion(radius=sourceRadius, thetaPos=sourcePos,
                          numPoints=numPointsDefault,
                          numExtraPoints=numExtraPointsDefault,
                          initialAngle, finalAngle, recurring=false,
                          lens=lens1) {
  // get points (in mas units) for outline of a circle, given its pixel radius
  // and theta position; defaults to getting source outline

  if (initialAngle === undefined)
    initialAngle = 0;

  if (finalAngle === undefined)
    finalAngle = 2*Math.PI;

  if (recurring === undefined)
    recurring = false;

  var outline = [];
  var deltaAngle = (finalAngle - initialAngle)/numPoints;
  for (var angle=initialAngle;
       (angle<finalAngle && almostEquals(angle, finalAngle) === false);
       angle += deltaAngle) {
    var xOffset = radius * Math.cos(angle);
    var yOffset = radius * Math.sin(angle);

    var point = {x: thetaPos.x + xOffset, y: thetaPos.y + yOffset}

    var deltaX = point.x - lens.pos.x;
    var deltaY = point.y - lens.pos.y;
    var distR = Math.sqrt(deltaX*deltaX + deltaY*deltaY);


    // how close outline point must be in pixels to lens for extra points to be added
    // var pixelProximity = sourceRadius*xPixelScale/4;
    var pixelProximity = sourceRadius / 0.0133;

    // if (pixelProximity > 30) // cap at 10 pixels
      // pixelProximity = 30;

    // output pixel proximity ONCE whenever value changes
    if (typeof this.pixelProximity !== "undefined" && pixelProximity !== this.pixelProximity) {
      ;
    }
    this.pixelProximity = pixelProximity;

    // if (almostEquals(distR, 0, epsilon=10/xPixelScale) === true && recurring === false && lensProximityCheckFlag===true) {
    if (almostEquals(distR, 0, epsilon=pixelProximity/xPixelScale) === true && recurring === false && lensProximityCheckFlag===true) {
      var nextAngle = angle + deltaAngle;
      // var halfwayAngle = (angle + nextAngle)/2;
      // var quarterAngle = (angle + halfwayAngle)/2;
      // var threeQuartersRadian = (halfwayAngle + nextAngle)/2;
      // var subOutline = getCircleOutline(radius, thetaPos, numPoints, quarterRadian, threeQuartersRadian, true);

      // var numExtraPoints2 = (nextAngle - angle)/(2*Math.PI/numExtraPoints);
      // console.log(`numExtraPoints2: ${numExtraPoints2}`);
      var subOutline = getCircleOutline(radius, thetaPos, numExtraPoints, numExtraPoints, angle, nextAngle, true);
      outline = outline.concat(subOutline);
    }
    else { // not close enough to center, or on a recursion iteration, or lens proximity check flag is off
      outline.push(point);
    }
  }

  return outline;
}

/** getLensedImages */
function getLensedImages(thetaPos=sourcePos, lens=lens1) {
  var thetaE_mas = eventModule.thetaE_mas;
  // var u0 = eventModule.u0;

  var images = {plus: {pos: undefined, pixelPos: undefined},
                minus: {pos: undefined, pixelPos: undefined}};

  var thetaR = Math.sqrt(thetaPos.x*thetaPos.x + thetaPos.y*thetaPos.y);
  var u = thetaR / thetaE_mas;
  var plusLensedImageR = ( ( u + Math.sqrt(u*u + 4) ) / 2 ) * thetaE_mas;
  // var minusLensedImageR = Math.abs( ( u - Math.sqrt(u*u + 4) ) / 2 ) * thetaE_mas;
  var minusLensedImageR = 1/plusLensedImageR * thetaE_mas*thetaE_mas;


  if (thetaPos.y >= 0)
    var thetaYsign = 1;
  else // thetaY is negative
    var thetaYsign = -1;

  var phi = Math.acos(thetaPos.x/thetaR) * thetaYsign;

  // var phi = Math.atan(thetaPos.y/thetaPos.x);
  //
  // // top-left or bottom-left quadrant
  // if (thetaPos.x < 0)
  //   phi += Math.PI;
  //
  // // bottom-right quadrant
  // if (thetaPos.x > 0 && thetaPos.y < 0)
  //   phi += 2*Math.PI;


  images.plus.pos = {x: lens.pos.x + plusLensedImageR * Math.cos(phi),
                     y: lens.pos.y + plusLensedImageR * Math.sin(phi)};
  images.minus.pos = {x: lens.pos.x + minusLensedImageR * Math.cos(Math.PI + phi),
                      y: lens.pos.y + minusLensedImageR * Math.sin(Math.PI + phi)};

  images.plus.pixelPos = {x: thetaXtoPixel(images.plus.pos.x),
                          y: thetaYtoPixel(images.plus.pos.y)};
  images.minus.pixelPos = {x: thetaXtoPixel(images.minus.pos.x),
                           y: thetaYtoPixel(images.minus.pos.y)};


  return images;
}

/** getLensedImageOutlines */
function getLensedImageOutlines(sourceOutline) {
  var outlines = {plus: [], minus: []};

  for (var index=0; index<sourceOutline.length; index++) {
    var sourcePoint = sourceOutline[index];
    // var sourcePoint = sourceOutline[0];
    var images = getLensedImages(sourcePoint);
    // images = {plus: {pos: {x:0, y:0}, pixelPos: {x:0, y:0}}, minus: {pos: {x:0, y:0}, pixelPos: {x:0, y:0}}};
    outlines.plus.push(images.plus);
    outlines.minus.push(images.minus);
  }
  return outlines;
}

/** updateGridRange */
function updateGridRange(xStep, yStep, centerXgridOnZero=centerXgridOnZeroFlag,
                         centerYgridOnZero=centerYgridOnZeroFlag) {
  // update grid with new step values,

  // and/or update grid for new initial/final axis values using

  // if new step values are passed in, update grid step values;

  // otherwise leave grid steps unchanged when updating grid
  if ( !(xStep === undefined) && !(yStep === undefined)) {
    xGridStep = xStep;
    yGridStep = yStep;
  }

  // update grid using current x/y axis initial and final values
  if ((centerXgridOnZero === true) && (xGridStep - Math.abs(xAxisInitialThetaX % xGridStep) > 1e-10))
   xGridInitial = xAxisInitialThetaX - (xAxisInitialThetaX % xGridStep);
  else
    xGridInitial = xAxisInitialThetaX;
  ;

  xGridFinal = xAxisFinalThetaX;

  if ((centerYgridOnZero === true) && (yGridStep - Math.abs(yAxisInitialThetaY % yGridStep) > 1e-10))
    yGridInitial = yAxisInitialThetaY - (yAxisInitialThetaY % yGridStep);
  else
    yGridInitial = yAxisInitialThetaY;

  
  ;
  ;
  ;

  // same rounding for final y grid line placement
  yGridFinal = yAxisFinalThetaY;
}

/** xDayToThetaX */
function xDayToThetaX() {}
/** drawing */
var drawing = (function(context=mainContext, canvas=mainCanvas) {
  /** clearPic */
  function clearPic(context=mainContext) {
    context.clearRect(picLeftBorder, picTopBorder, picWidth, picHeight);
  }

  /** drawBackgrounds */
  function drawBackgrounds() {
    // canvas background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // picture drawing area background
    context.fillStyle = picBackgroundColor;
    context.fillRect(picLeftBorder, picTopBorder, picWidth, picHeight);
  }

  /** toggleClippingRegion */
  function toggleClippingRegion(turnOn) {
    // set up clipping region as picture region, so that curve does not
    // extend beyond picture region

    // isOn flag tracks whether clipping was last turned on/off; off by default
    if (this.isOn === undefined) {
      this.isOn = false;
    }

    // toggle clipping if on/off command not specified
    if (turnOn !== true && turnOn !==false) {
      turnOn = !this.isOn;
    }

    // if told to turn clipping on, and clipping is not already on:
    if (turnOn === true && this.isOn === false) {
      context.save();
      context.beginPath();
      context.rect(picLeftBorder, picTopBorder, picWidth, picHeight);
      context.clip();
      this.isOn = true;
    }
    // If told to turn clipping off, and clipping is not already off:
    else if (turnOn === false && this.isOn === true){
      context.restore();
      this.isOn = false;
    }
  }

  /** drawLens */
  function drawLens(lens=lens1) {
    context.beginPath();
    context.arc(lens.pixelPos.x, lens.pixelPos.y, lens.pixelRadius, 0, 2*Math.PI, false);
    context.fillStyle = lens.color;
    context.fill();
    context.lineWidth = lens.outlineWidth;
    context.strokeStyle = lens.outlineColor;
    context.stroke();
  }

  /** drawRing */
  function drawRing(lens=lens1, firefoxCompatibility=firefoxCompatibilityFlag) {
    var ring = lens.ring;
    context.beginPath();
    // ellipse not compatible with firefox
    if (firefoxCompatibility === true)
      ellipse(context, lens.pixelPos.x, lens.pixelPos.y, ring.pixelRadius.x, ring.pixelRadius.y);
    else
      context.ellipse(lens.pixelPos.x, lens.pixelPos.y, ring.pixelRadius.x,
                      ring.pixelRadius.y, 0, 0, 2*Math.PI)
    context.strokeStyle = ring.color;
    context.lineWidth = ring.width;
     // turn on dashed lines
    context.setLineDash([ring.dashedLength, ring.dashedSpacing]);
    context.stroke();
    // turn off dashed-line drawing
    context.setLineDash([]);
  }

  // use this for when implementing animation

  // for now, should be at end of path, if we bother placing it
  /** drawSource */
  function drawSource() {
    // set aesthetics
    context.lineWidth = sourceOutlineWidth;
    context.strokeStyle = sourceOutlineColor;
    context.fillStyle = sourceColor;

    // draw source
    context.beginPath();
    var radiusPixels = sourceRadius * xPixelScale;
    context.arc(sourcePixelPos.x, sourcePixelPos.y, radiusPixels, 0, 2*Math.PI, false);
    context.fill();
    context.stroke();
  }

  /** drawSourcePath */
  function drawSourcePath() {
    var thetaYleft = getThetaYpathValue(xAxisInitialThetaX);
    var thetaYright = getThetaYpathValue(xAxisFinalThetaX);
    var thetaYpixelLeft = thetaYtoPixel(thetaYleft);
    var thetaYpixelRight = thetaYtoPixel(thetaYright);

    // dashed line (path yet to be travelled)
    context.beginPath();
    context.moveTo(picLeftBorder, thetaYpixelLeft);
    context.lineTo(picRightBorder, thetaYpixelRight);
    context.setLineDash([dashedPathLength, dashedPathSpacing]); // turn on dashed lines
    context.strokeStyle = dashedPathColor;
    context.lineWidth = dashedPathWidth;
    context.stroke();
    context.setLineDash([]); // turn off dashed lines

    // solid line (path traveled so far)
    context.beginPath();
    context.moveTo(picLeftBorder, thetaYpixelLeft);
    context.lineTo(sourcePixelPos.x, sourcePixelPos.y);
    context.strokeStyle = pathColor;
    context.lineWidth = pathWidth;
    context.stroke();
  }

  /** drawBorder */
  function drawBorder() {
    context.beginPath();
    context.strokeStyle = picBorderColor;
    context.lineWidth = picBorderWidth;
    context.strokeRect(picLeftBorder, picTopBorder, picWidth, picHeight);
  }

  /** drawAxes */
  function drawAxes() {
    function drawAxisLines() {
      context.beginPath();

      // x axis

      // the -axisWidth/2 makes the x and y axes fully connect
      // at their intersection for all axis linewidths
      context.moveTo(picLeftBorder - axisWidth/2, picBottomBorder);
      context.lineTo(picRightBorder + 15, picBottomBorder);

      // y axis
      context.moveTo(picLeftBorder, picBottomBorder);
      context.lineTo(picLeftBorder, picTopBorder - 15);

      // x axis arrow

      // NOTE: Doesn't look right for linewidth > 2
      context.moveTo(picRightBorder + 15, picBottomBorder);
      context.lineTo(picRightBorder + 8, picBottomBorder - 5);
      context.moveTo(picRightBorder + 15, picBottomBorder);
      context.lineTo(picRightBorder + 8, picBottomBorder + 5);

      // thetaT axis arrow

      // NOTE: Doesn't look right for linewidth > 2
      context.moveTo(picLeftBorder, picTopBorder - 15);
      context.lineTo(picLeftBorder - 5, picTopBorder - 8);
      context.moveTo(picLeftBorder, picTopBorder - 15);
      context.lineTo(picLeftBorder + 5, picTopBorder - 8);

      context.strokeStyle = axisColor;
      context.lineWidth = axisWidth;
      context.stroke();
    }

    function drawAxisLabels(centerLayout=centerLayoutFlag) {
      // x label
      context.font = axisLabelFont;
      context.textAlign = axisLabelAlign;
      context.textBaseline = axisLabelBaseline;
      context.fillStyle = axisLabelColor;

      if (centerLayout === true) {
        // x label
        context.fillText(xLabel, centerX, picBottomTrailingBorder + axisLabelSpacing)

        // y label
        context.save();
        context.translate(picLeftTrailingBorder - 25, centerY);
        context.rotate(-Math.PI/2);
        context.textAlign = "center";
        context.fillText(yLabel, 0, 0);
        context.restore();
      }
      else {
        // x label
        context.textAlign = "left";
        context.fillText(xLabel, picRightTrailingBorder + 20, picBottomBorder);

        // y label
        context.textBaseline = "bottom";
        context.textAlign = "center";
        context.fillText(yLabel, picLeftBorder, picTopTrailingBorder - 20);
      }
    }

    drawAxisLines();
    drawAxisLabels();
  }

  /** drawGridlinesAndTicks */
  function drawGridlinesAndTicks(drawGrid=drawGridFlag, noTicks) {
    // draw vertical lines and x axis tick labels
    context.beginPath();
    ;
    for (var thetaX = xGridInitial; thetaX <= xGridFinal; thetaX+=xGridStep) {
      var xPixel = thetaXtoPixel(thetaX);
      // line starts from bottom trail
      context.moveTo(xPixel, picBottomTrailingBorder);

      // if using gridlines, line extends top end of top trail
      var yLineEnd = picTopTrailingBorder;
      // if not using grid lines, draw tick lines
      if (drawGrid === false) {
        // tick lines extend one trailing length on either side of axis
        yLineEnd = picBottomBorder - picBottomTrail;
      }

      context.lineTo(xPixel, yLineEnd);

      // tick text label
      var xTickLabel = Number(thetaX).toFixed(2);

      // catches if yTickLabel is set to "-0.00" due to rounding error and
      // converts to "0.00";

      // (NOTE: 0 === -0 in javascript)
      if (Number(xTickLabel) === -0) {
        xTickLabel = Number(0).toFixed(2);
      }
      context.font = tickLabelFont;
      context.fillStyle = tickLabelColor;
      context.textAlign = tickLabelAlign;
      context.textBaseline = tickLabelBaseline;
      context.fillText(xTickLabel, xPixel, picBottomTrailingBorder + tickLabelSpacing);
    }

    //draw horizontal lines and y axis tick label
    for (var thetaY = yGridInitial; thetaY <= yGridFinal; thetaY+=yGridStep) {
      var yPixel = thetaYtoPixel(thetaY);
      context.moveTo(picLeftTrailingBorder, yPixel);
      // if using gridlines, line extends to end of right trail
      var xLineEnd = picRightTrailingBorder;
      // if not using gridlines, draw tick lines
      if (drawGrid ===false)
        // tick lines extend one trailing length on either side of axis
        xLineEnd = picLeftBorder + picLeftTrail;
      context.lineTo(xLineEnd, yPixel);

      var yTickLabel = Number(thetaY).toFixed(2);

      // catches if yTickLabel is set to "-0.00" due to rounding error and
      // converts to "0.00"

      // (note 0 === -0 in javascript)
      if (Number(yTickLabel) === -0) {
        yTickLabel = Number(0).toFixed(2);
      }
      context.font = tickLabelFont;
      context.fillStyle = tickLabelColor;
      context.textAlign = "right";
      context.textBaseline = tickLabelBaseline;
      context.fillText(yTickLabel,picLeftTrailingBorder - tickLabelSpacing,  yPixel);
    }
    context.lineWidth = gridWidth;
    context.strokeStyle = gridColor;
    context.stroke();
  }

  /** drawPointLensedImages */
  function drawPointLensedImages() {
    // console.log("Lensed image mas position (plus): " + String(lensedImages.plus.pos.x) + ", " + String(lensedImages.plus.pos.y));
    // console.log("Lensed image mas position (minus): " + String(lensedImages.minus.pos.x) + ", " + String(lensedImages.minus.pos.y));

    // console.log("Lensed image pixel position (plus): " + String(lensedImages.plus.pixelPos.x) + ", " + String(lensedImages.plus.pixelPos.y));
    // console.log("Lensed image pixel position (minus): " + String(lensedImages.minus.pixelPos.x) + ", " + String(lensedImages.minus.pixelPos.y));

    context.lineWidth = lensedImageLineWidth;
    context.fillStyle = lensedImagePlusColor;
    context.strokeStyle = lensedImagePlusOutlineColor;

    context.setLineDash([dashedLensedImageLength, dashedLensedImageSpacing]);
    context.beginPath();
    context.arc(lensedImages.plus.pixelPos.x, lensedImages.plus.pixelPos.y, lensedImageRadius, 0, 2*Math.PI, false);
    context.fill();
    context.stroke();

    context.fillStyle = lensedImageMinusColor;
    context.strokeStyle = lensedImageMinusOutlineColor;
    context.beginPath();
    context.arc(lensedImages.minus.pixelPos.x, lensedImages.minus.pixelPos.y, lensedImageRadius, 0, 2*Math.PI, false);
    context.fill();
    context.stroke();
    context.setLineDash([]);
  }

  /** drawFullLensedImage */
  function drawFullLensedImage(sign="plus", debug=false, fillOn=true,
                               strokeOn=false, lens=lens1) {
    // draw either a plus or minus lensed image

    // set aesthetics and select plus or minus outlines object
    context.lineWidth = lensedImageLineWidth;
    if (sign === "plus") {
      context.strokeStyle = "fuchsia";
      context.fillStyle = "purple";

      if (debug === true) {
        context.fillStyle = "black";
      }
      var outlines = lensedImageOutlines.plus;
    }

    else if (sign === "minus") {
      context.strokeStyle = "lime";
      context.fillStyle = "green";

      if (debug === true) {
        context.fillStyle = "black";
      }
      var outlines = lensedImageOutlines.minus;
    }

    else {
      
      return;
    }

    if (typeof outlines === "undefined" || outlines === null ||
        outlines.length === 0) {
      return;
    }

    // draw line through each point in outline array
    if (debug === false) {
      context.beginPath();
      context.moveTo(outlines[0].pixelPos.x, outlines[0].pixelPos.y);
    }

    for (var index = 0; index<outlines.length; index++) {
      var pixelPos = outlines[index].pixelPos;

      if (debug === false) {
        context.lineTo(pixelPos.x, pixelPos.y);
      }
      else {
        context.beginPath();
        // filling in rectangles for points is much faster than
        // filling circles with arc function
        context.fillRect(pixelPos.x-0.5, pixelPos.y-0.5, 1, 1);
        // context.arc(pixelPos.x, pixelPos.y, 1, 0, 2*Math.PI);
        // context.fill();
      }
    }
    // context.closePath();
    if (debug === false) {
       context.lineTo(outlines[0].pixelPos.x, outlines[0].pixelPos.y);
      //context.closePath();

      //context.setLineDash([dashedLensedImageLength, dashedLensedImageSpacing]);

      if (fillOn === true)
        context.fill();
      if (strokeOn === true)
        context.stroke();

      //context.setLineDash([]);
    }
  }

  /** drawCombinedImage */
  function drawCombinedImage(fillOn=true, strokeOn=false) {

    function drawInnerOutline() {
      context.moveTo(innerOutlines[0].pixelPos.x, innerOutlines[0].pixelPos.y);
      for (var i=1; i<innerOutlines.length; i++) {
        var pixelPos = innerOutlines[i].pixelPos;
        context.lineTo(pixelPos.x, pixelPos.y);
      }
      //context.closePath();
      context.lineTo(innerOutlines[0].pixelPos.x, innerOutlines[0].pixelPos.y);


    }

    function drawOuterOutline(outerConnectionIndex) {
      var seenStartBefore=false;
      var loop = true;
      for (var j=outerConnectionIndex; loop===true; j--) {
        if (j < 0) {
          j = outerOutlines.length + j;
        }

        if (j === outerConnectionIndex)  {
          if (seenStartBefore === true) {
            loop = false;
          }
          else { // seenStartBefore === false
            seenStartBefore = true;
          }
        }

        var pixelPos = outerOutlines[j].pixelPos;
        context.lineTo(pixelPos.x, pixelPos.y);
      }
      context.lineTo(outerOutlines[outerOutlines.length-1].pixelPos.x,
                     outerOutlines[outerOutlines.length-1].pixelPos.y);
    }

    context.lineWidth = lensedImageLineWidth;
    context.strokeStyle = "aqua";
    context.fillStyle = "navy";

    outerOutlines = lensedImageOutlines.plus;
    innerOutlines = lensedImageOutlines.minus;

    if (outerOutlines === undefined || outerOutlines.length === 0 ||
        innerOutlines === undefined || innerOutlines.length === 0) {
      return;
    }

    if (fillOn === true) {
      // connect inner outline to outer outline and set outer path start

      // draw inner outline
      context.beginPath();
      drawInnerOutline();

      // set outer outline start
      var outerConnectionIndex = outerOutlines.length-1;
      // connect inner outline to outer outline start
      context.lineTo(outerOutlines[outerConnectionIndex].pixelPos.x, outerOutlines[outerConnectionIndex].pixelPos.y);
      drawOuterOutline(outerConnectionIndex);

      context.fill();
    }

    if (strokeOn === true) {
      // draw separate outline for outer and inner outlines

      //context.setLineDash([dashedLensedImageLength, dashedLensedImageSpacing]);

      // draw and display inner outline
      context.beginPath();
      drawInnerOutline();
      context.stroke();

      // draw and display outer outline as separate path
      context.beginPath();
      // set outer path start point
      var outerConnectionIndex = outerOutlines.length-1;
      // move to outer outline start, without connecting inner outline
      context.moveTo(outerOutlines[outerConnectionIndex].pixelPos.x, outerOutlines[outerConnectionIndex].pixelPos.y);
      drawOuterOutline(outerConnectionIndex);
      context.stroke();

      //context.setLineDash([]);
    }
  }

  /** drawFullLensedImages */
  function drawFullLensedImages(debug=false, fillOn=false, strokeOn=false,
                                lens=lens1) {
    // draw both plus and minus lensed images

    sourceLensDistX = sourcePos.x - lens.pos.x;
    sourceLensDistY = sourcePos.y - lens.pos.y;
    sourceLensDist = Math.sqrt(sourceLensDistX * sourceLensDistX +
                               sourceLensDistY * sourceLensDistY);

    if (sourceLensDist <= sourceRadius && debug === false) {
      ;
      drawCombinedImage(fillOn, strokeOn);
    }
    else {
      ;
      drawFullLensedImage("plus", debug, fillOn, strokeOn, lens1); // draw plus image
      drawFullLensedImage("minus", debug, fillOn, strokeOn, lens1); // draw minus image
    }
  }

  /** getTimeFromThetaX */
  function getTimeFromThetaX(thetaX) {
    // temp: very hacky
      var yearToDay = 365.25; // day/year; const
      var eqMu = eventModule.mu / yearToDay; // convert mu to milliarcseconds/day
      var time = thetaX/eqMu + eventModule.t0
      return time;
  }

  /** drawPic */
  function drawPic(display=displayFlags,
                   context=mainContext, canvas=mainCanvas) {
    clearPic();
    drawBackgrounds();
    drawBorder();
    drawGridlinesAndTicks();
    toggleClippingRegion(turnOn=true);

    drawLens(lens1);

    if (display.rings === true) {
      // draw separate rings for each lens
      drawRing(lens1);
    }

    drawSourcePath();
    drawSource();

    if (display.images === true) {
      if (eventModule.finiteSourceFlag === true) {
        drawFullLensedImages(debug=false, fillOn=true, strokeOn=true, lens1);
        // drawFullLensedImages(debug=true, fillOn=true, strokeOn=true, lens1);
      }
      else {
        drawPointLensedImages();
      }
    }

    toggleClippingRegion(turnOn=false);
    drawAxes();
  }

  return {
    drawPic: drawPic,
  }

})();

// public properties to be stored in module object,
// accessible via module object by code executed after this script
module.exports = {
  // initialization

  // initialization function
  init: init,
  // whether initialization is done
  get initialized() { return initialized; },

  // mas
  get sourcePos() { return sourcePos; },
  // mas
  get xAxisInitialThetaX() { return xAxisInitialThetaX; },
  // mas
  get sourceRadius() { return sourceRadius; },

  redraw: redraw,
  getThetaX: getThetaX,
  initSourceRadius: initSourceRadius,
};

},{"./Lens.js":8,"./fspl-microlensing-event.js":15,"./utils.js":19,"lodash":7}],15:[function(require,module,exports){
/** Event module.
  * Handles calculation and drawing lightcurve plot for the microlensing.
  * event.
  *
  * Depicts magnification vs. time curve for microlensing event.
  *
  * Also listens for events from related UI buttons/sliders.
  *
  * @module fspl-microlensing-event
  */

;

var handleError = require("./utils.js").handleError;

// whether module init function has been executed
var initialized = false;

var canvas = document.getElementById("lcurveCanvas");
var context = canvas.getContext("2d");

// left border of graph x-pixel value, NOT including any trailing gridlines
var graphLeftBorder = 50;
 // top border of graph y-pixel value, NOT including any trailing gridlines
var graphTopBorder = 50;

var graphWidth = 400;
var graphHeight = 300;

// "trail" lengths for gridlines extending beyond graph border
var graphLeftTrail = 10;
var graphRightTrail = 0;
var graphTopTrail = 0;
var graphBottomTrail = 10;

// right border of graph x-pixel value, NOT including any trailing gridlines
var graphRightBorder = graphLeftBorder + graphWidth;
// bottom border of y-pixel value, NOT including any trailing gridlines
var graphBottomBorder = graphTopBorder + graphHeight;

// left border of graph x-pixel value, INCLUDING any trailing gridlines
var graphLeftTrailingBorder = graphLeftBorder - graphLeftTrail;
// right border of graph x-pixel value, INCLUDING any trailing gridlines
var graphRightTrailingBorder = graphRightBorder + graphRightTrail;
// top border of graph y-pixel value, INCLUDING any trailing gridlines
var graphTopTrailingBorder = graphTopBorder - graphTopTrail;
// bottom border of graph y-pixel value, INCLUDING any trailing gridlines
var graphBottomTrailingBorder = graphBottomBorder + graphBottomTrail;

var centerX = graphWidth/2 + graphLeftBorder;
var centerY = graphHeight/2 + graphTopBorder;

// Physical constants

// m3 kg−1 s−2 (astropy value); const
var G = 6.67384e-11;
 // m s-1 (astropy value); const
var c = 299792458.0;

// conversion constants

// rad/mas; const
var masToRad = 4.84813681109536e-9;

// Dl slider/value is kept one "step" below Ds; determines size of that step

// kpc; const
var sourceLensMinSeparation = 0.01;

// base quantities set by user

// solMass
var Ml;
// kpc: Ds =  Dl / (1 - 1/mu)
var Ds;
// milliarcseconds (mas)
var thetaY;
// kpc: Dl = Ds * (1 - 1/mu)
var Dl;
// days
var t0;
// mas/yr:
// ```
// mu = thetaE / tE; mu = Ds / (Ds - Dl) = 1/(1 - Dl/Ds)
// ```
var mu;

// derived quantities

// unitless
var u0;
// days
var tE;
// kpc
var Drel;
// radians (or should we use milliarcsecond?)
var thetaE;

// lightcurve information
var lightcurveData = null;

// plot scale
var dayWidth;
var magnifHeight;
// pixels per day
var xPixelScale;
// pixels per magnif unit
var yPixelScale;

// plot range
var xAxisInitialDay;
var yAxisInitialMagnif;
var xAxisFinalDay;
var yAxisFinalMagnif;

// arbitrarily chosen value; const
var dayWidthDefault = 32;
// const
var magnifHeightDefault = 10;
// arbitrarily chosen value; const
var xAxisInitialDayDefault = -16;
// const
var yAxisInitialMagnifDefault = 0.5;

// gridlines
var xGridInitial;
var yGridInitial;
var xGridFinal;
var yGridFinal;
var xGridStep;
var yGridStep;

// arbitrarily chosen value; const
var xGridStepDefault = 2;
// const
var yGridStepDefault = 1;

// Step increments used by debug buttons to alter range/scale
var xGraphShiftStep = 0.25;
var yGraphShiftStep = xGraphShiftStep;
var xGraphZoomStep = 0.25;
var yGraphZoomStep = xGraphZoomStep;

// plot aesthetics
var canvasBackgroundColor = "#ffffe6"
var graphBackgroundColor = "#eff";
var gridColor = "grey";
var gridWidth = 1;
var curveColor = "blue";
var curveWidth = 2;
var dashedCurveColor = "green";
var dashedCurveWidth = 2;
var dashedCurveLength = 8;
var dashedCurveSpacing = 10;
var graphBorderColor = "grey";
var graphBorderWidth = 1;
var axisColor = "black";
var axisWidth = 2;

// tick label text aesthetics
var tickLabelFont = "10pt Arial";
var tickLabelColor = "black";
var tickLabelAlign = "center";
var tickLabelBaseline = "middle";
// spacing between tick label and end of trailing gridline
var tickLabelSpacing = 7;

// axis label text aesthetics
var xLabel = "time (days)";
var yLabel = "magnification";
var axisLabelFont = "10pt Arial";
var axisLabelColor = "black";
var axisLabelAlign = "center";
var axisLabelBaseline = "middle";
var axisLabelSpacing = 27;

// time increment for drawing curve
var dt = 0.01;

// parameter sliders and their readouts
var tEslider = document.getElementById("tEslider");
var tEreadout = document.getElementById("tEreadout");

var thetaEreadout = document.getElementById("thetaEreadout");

var u0slider = document.getElementById("u0slider");
var u0readout = document.getElementById("u0readout");

var MlSlider = document.getElementById("MlSlider");
var MlReadout = document.getElementById("MlReadout");

var DsSlider = document.getElementById("DsSlider");
var DsReadout = document.getElementById("DsReadout");

var thetaYslider = document.getElementById("thetaYslider");
var thetaYreadout = document.getElementById("thetaYreadout");

var DlSlider = document.getElementById("DlSlider");
var DlReadout = document.getElementById("DlReadout");

var t0slider = document.getElementById("t0slider");
var t0readout = document.getElementById("t0readout");

var muSlider = document.getElementById("muSlider");
var muReadout = document.getElementById("muReadout");

var resetParamsButton = document.getElementById("resetParams");
var fixU0checkbox = document.getElementById("fixU0checkbox");

// debug plot scale/range buttons
var xLeftButton = document.getElementById("xLeft");
var xRightButton = document.getElementById("xRight");
var yUpButton = document.getElementById("yUp");
var yDownButton = document.getElementById("yDown");

var xZoomInButton = document.getElementById("xZoomIn");
var xZoomOutButton = document.getElementById("xZoomOut");
var yZoomInButton = document.getElementById("yZoomIn");
var yZoomOutButton = document.getElementById("yZoomOut");

var resetGraphButton = document.getElementById("resetGraph");

var finiteSourceCheckbox = document.getElementById("finiteSourceCheckbox");

// const
var centerLayout = false;

// checkbox flags

// default values for checkbox flags
var fixU0flagDefault = false;
var finiteSourceFlagDefault = false;

// tracks whether u0 is to be held fixed while other quantities vary
var fixU0flag = fixU0flagDefault;
// tracks whether finite or point source is being used
var finiteSourceFlag = finiteSourceFlagDefault;

// controls whether plot updates when slider is moved
// or when slider is released
var updateOnSliderMovementFlag = true;
var updateOnSliderReleaseFlag = false;

/** init */
function init() {
  initParams();
  initListeners();
  updateGridRange(xGridStepDefault, yGridStepDefault); // initialize gridline vars
  // initialize plot scale/range vars
  updatePlotScaleAndRange(dayWidthDefault, magnifHeightDefault,
                          xAxisInitialDayDefault, yAxisInitialMagnifDefault);
  updateCurveData();

  plotLightcurve();
  ;
  ;
  ;
  ;

  initialized = true;
}

/** initListeners */
function initListeners(updateOnSliderMovement=updateOnSliderMovementFlag,
                       updateOnSliderRelease=updateOnSliderReleaseFlag) {

  // update plot when slider is moved
  if (updateOnSliderMovement == true) {
    tEslider.addEventListener("input", function() { updateParam("tE"); }, false);
    u0slider.addEventListener("input", function() { updateParam("u0"); }, false);
    MlSlider.addEventListener("input", function() { updateParam("Ml"); }, false);
    DsSlider.addEventListener("input", function() { updateParam("Ds"); }, false);
    thetaYslider.addEventListener("input", function() { updateParam("thetaY"); }, false);
    DlSlider.addEventListener("input", function() { updateParam("Dl"); }, false);
    t0slider.addEventListener("input", function() { updateParam("t0"); }, false);
    muSlider.addEventListener("input", function() { updateParam("mu"); }, false);
  }

  // update plot when slider is released
  if (updateOnSliderRelease === true) {
    tEslider.addEventListener("change", function() { updateParam("tE"); }, false);
    u0slider.addEventListener("change", function() { updateParam("u0"); }, false);
    MlSlider.addEventListener("change", function() { updateParam("Ml"); }, false);
    DsSlider.addEventListener("change", function() { updateParam("Ds"); }, false);
    thetaYslider.addEventListener("change", function() { updateParam("thetaY"); }, false);
    DlSlider.addEventListener("change", function() { updateParam("Dl"); }, false);
    t0slider.addEventListener("change", function() { updateParam("t0"); }, false);
    muSlider.addEventListener("change", function() { updateParam("mu"); }, false);

    // if plot updates only upon slider release,
    // update slider readout alone while slider is being moved,
    // without recalculating/updating other sliders (until after current slider is released)
    if (updateOnSliderMovement === false) {
      tEslider.addEventListener("input", function() { updateSliderReadout(tEslider, tEreadout, "tE"); }, false);
      u0slider.addEventListener("input", function() { updateSliderReadout(u0slider, u0readout, "u0"); }, false);
      MlSlider.addEventListener("input", function() { updateSliderReadout(MlSlider, MlReadout, "Ml"); }, false);
      DsSlider.addEventListener("input", function() { updateSliderReadout(DsSlider, DsReadout, "Ds"); }, false);
      thetaYslider.addEventListener("input", function() { updateSliderReadout(thetaYslider, thetaYreadout, "thetaY"); }, false);
      DlSlider.addEventListener("input", function() { updateSliderReadout(DlSlider, DlReadout, "Dl"); }, false);
      t0slider.addEventListener("input", function() { updateSliderReadout(t0slider, t0readout, "t0"); }, false);
      muSlider.addEventListener("input", function() { updateSliderReadout(muSlider, muReadout, "mu"); }, false);
    }
  }

  // reset buttons
  resetParamsButton.addEventListener("click", resetParams, false);

  // checkbox to hold u0 value fixed while varying other quantities besides thetaY
  fixU0checkbox.addEventListener("change", function() { fixU0flag = fixU0checkbox.checked;
                                                        ; }, false);
  // debug plot range/scale and reset buttons
  xLeftButton.addEventListener("click", function() { updateGraph("xLeft"); }, false);
  xRightButton.addEventListener("click", function() {updateGraph("xRight"); }, false);
  yUpButton.addEventListener("click", function() { updateGraph("yUp"); }, false);
  yDownButton.addEventListener("click", function() { updateGraph("yDown"); }, false);

  xZoomInButton.addEventListener("click", function() { updateGraph("xZoomIn"); }, false);
  xZoomOutButton.addEventListener("click", function() {updateGraph("xZoomOut"); }, false);
  yZoomInButton.addEventListener("click", function() { updateGraph("yZoomIn"); }, false);
  yZoomOutButton.addEventListener("click", function() { updateGraph("yZoomOut"); }, false);

  resetGraphButton.addEventListener("click", function() { updateGraph("reset"); }, false)
  if (typeof finiteSourceCheckbox !== "undefined" &&
     finiteSourceCheckbox !== null)
    finiteSourceCheckbox.addEventListener("change", toggleFiniteSource, false);
  else
    finiteSourceFlag = false;

   // in case HTML slider values differ from actual starting values
  updateSliders();
}

/** initParams */
function initParams() {
  // set lense curve parameters to defaults

  // set base quantity defaults

  // solMass
  Ml = 0.1
  // kpc: Ds =  Dl / (1 - 1/mu)
  Ds = 8.0;
  // milliarcseconds (mas)
  thetaY = -0.05463809952990817329;
  // kpc:
  // ```
  // Dl = Ds * (1 - 1/mu)
  // ```
  Dl = 4.75;
  // days
  t0 = 0;
  // mas/yr (milliarcseconds/year):
  // ```
  // mu = thetaE/tE
  // ```
  mu = 7;

  // set default checkboxes
  if (typeof fixU0checkbox !== "undefined" &&
      fixU0checkbox !== null) {
    fixU0checkbox.checked = false;
    fixU0flag = fixU0checkbox.checked;
  }

  if (typeof finiteSourceCheckbox !== "undefined" &&
      finiteSourceCheckbox !== null) {
    finiteSourceCheckbox.checked = false;
    var finiteSourceFlag = finiteSourceCheckbox.checked;
  }

  // set derived quantities
  updateDerivedQuantities(initializing=true);
}

/** updateDerivedQuantities */
function updateDerivedQuantities(initializing=false) {
  updateDrel();
  updateThetaE();
  if (fixU0flag === false || initializing === true)
    updateU0();
  else
    updateThetaY();

  updateTE();
}

/** updateU0 */
function updateU0() {
  // convert from mas to radians
  var thetaY_rad = thetaY * masToRad;
  // unitless ("units" of thetaE)
  u0 = thetaY_rad / thetaE;
}

/** updateThetaY */
function updateThetaY() {
  // convert from radians to mas
  var thetaE_mas = thetaE / masToRad ;
  // mas
  thetaY = u0 * thetaE_mas;
}

/** updateDrel */
function updateDrel() {
  // kpc
  Drel = 1/((1/Dl) - (1/Ds));
}

/** updateThetaE */
function updateThetaE() {
  thetaE = calculateThetaE();
}

/** calculateThetaE */
function calculateThetaE(get_mas=false) {
  /*
  G: m3 kg−1 s−2 (astropy value)
  c: 299792458.0; // m s-1 (astropy value)
  Ml: solMass
  Drel: kpc

  solMass -> kg: 1.9891e+30 kg/solMass
  kpc -> m: 3.0856775814671917e+19 m/kpc

  kg -> solMass: 5.02739932632849e-31
  m -> kpc: 3.240779289469756e-20 kpc/m
  */

  // kg/solMass; const
  var solMassToKg = 1.9891e30;
  // m/kpc; const
  var kpcToM = 3.0856775814671917e19;

  // Ml converted for equation to kg
  var eqMl = Ml * solMassToKg;
  // Drel converted for equation to m
  var eqDrel = Drel * kpcToM;

  // G is m^3 /(kg * s^2)

  // c is m/s
  var thetaEresult = Math.sqrt(4 * G * eqMl/(c*c*eqDrel)); // radians (i.e. unitless)

  if (get_mas === true)
    thetaEresult = thetaEresult / masToRad;

  return thetaEresult;
}

/** updateTE */
function updateTE() {
  var yearToDay = 365.25; // day/year; const

  // mu converted for equation to rad/yr
  var eqMu = mu * masToRad / yearToDay

  // thetaE is in radians

  // days
  tE = thetaE/eqMu;
}

/** updateSliderReadout */
function updateSliderReadout(slider, readout, sliderName="") {
  // Update individual slider readout to match slider value

  // Default value for tE, u0, thetaY
  var fixedDecimalPlace = 3;

  if (sliderName === "Ml")
    fixedDecimalPlace = 6;

  else if (sliderName === "Ds" || sliderName === "Dl" ||
           sliderName === "mu")
    fixedDecimalPlace = 2;

  else if (sliderName === "t0") {
    fixedDecimalPlace = 1;
  }
  else if (sliderName === "sourceRadius") {
    fixedDecimalePlace = 4;
  }
  readout.innerHTML = Number(slider.value).toFixed(fixedDecimalPlace);
}

/** updateSliders */
function updateSliders() {
  // maximum parameter values that can be displayed;

  // need to match up with max value on HTML sliders

  // days
  var tEmax = 365;
  // unitless (einstein radii)
  var u0max = 2;
  // solMass
  var MlMax = 15;
  // kpc
  var DsMax = 8.5
  // mas
  var thetaYmax = 2;
  // kpc
  var DlMax = 8.5
  // days
  var t0max = 75
  // milliarcseconds/year
  var muMax = 10

  // update slider values and readouts to reflect current variable values
  tEslider.value = tE;
  // tEreadout.innerHTML = Number(tEslider.value).toFixed(3);
  updateSliderReadout(tEslider, tEreadout, "tE");
  // add "+" once after exceeding maximum slider value;

  // NOTE: Very hacky. Improve this
  if (tE > tEmax) {
    tEreadout.innerHTML += "+";
  }

  u0slider.value = u0;
  updateSliderReadout(u0slider, u0readout, "u0");
  if (u0 > u0max) {
    u0readout.innerHTML += "+";
  }

  MlSlider.value = Ml;
  updateSliderReadout(MlSlider, MlReadout, "Ml");
  if (Ml > MlMax) {
    MlReadout.innerHTML += "+";
  }

  DsSlider.value = Ds;
  updateSliderReadout(DsSlider, DsReadout, "Ds");
  if (Ds > DsMax) {
    DsReadout.innerHTML += "+";
  }

  thetaYslider.value = thetaY;
  updateSliderReadout(thetaYslider, thetaYreadout, "thetaY");
  if (thetaY > thetaYmax) {
    thetaYreadout.innerHTML += "+";
  }

  DlSlider.value = Dl;
  updateSliderReadout(DlSlider, DlReadout, "Dl");
  if (Dl > DlMax) {
    DlReadout.innerHTML += "+";
  }

  t0slider.value = t0;
  updateSliderReadout(t0slider, t0readout, "t0");
  if (t0 > t0max) {
    t0Readout.innerHTML += "+";
  }

  muSlider.value = mu;
  updateSliderReadout(muSlider, muReadout, "mu");
  if (mu > muMax) {
    muReadout.innerHTML += "+";
  }

  // update thetaE readout (no slider)
  if (thetaEreadout !== null) {
    var thetaE_mas = thetaE / masToRad;
    ;
    thetaEreadout.innerHTML = Number(thetaE_mas).toFixed(4);
  }
}

/** resetParams */
function resetParams(isFiniteSource = finiteSourceFlag) {
  // reset lense curve parameters to defaults and redraw curve
  initParams();
  updateSliders();

  try {
    var lensPlaneModule = require("./fspl-microlensing-event-lens-plane.js");
  }
  catch(ex) {
    handleError(ex);
  }

  if (typeof lensPlaneModule !== "undefined" && lensPlaneModule.initialized === true) {
    lensPlaneModule.initSourceRadius();
  }

  updateCurveData();
  redrawCanvases();
}

/** updateParam */
function updateParam(param) {
  if (param === "Ml") {
    Ml = Number(MlSlider.value);
    // tE depends on thetaE which depends on Ml
  }
  else if (param === "Ds") {
    // source must be farther than lens
    if (Number(DsSlider.value) > Dl) {
      Ds = Number(DsSlider.value);
    }
    // If Ds slider is less than or equal to Dl, we should set Ds to one step above Dl
    else {
      Ds = Dl + sourceLensMinSeparation;
    }
    // tE depends on thetaE depends on Drel depends on Ds
  }
  else if (param === "thetaY" && fixU0flag === false) {
    thetaY = Number(thetaYslider.value);
  }
  else if (param === "Dl") {
     // lens must be closer than source
    if (Number(DlSlider.value) < Ds) {
      Dl = Number(DlSlider.value);
    }
    // If Dl slider is less than or equal to Dl, we should set Dl to one step below Ds
    else {
      Dl = Ds - sourceLensMinSeparation;
    }
    // TE depends on thetaE depends on Drel depends on Dl
  }
  else if (param === "t0") {
    t0 = Number(t0slider.value);
  }
  else if (param === "mu") {
    mu = Number(muSlider.value);
    // tE depends on mu
  }
  else if (param === "tE") {
    ;
    var oldTE = tE;
    tE = Number(tEslider.value);

    // NOTE: Pretty hacky way of doing this

    // modify Ml accordingly of tE is changed, where
    // Ml is propotional to tE^2
    Ml *= (tE/oldTE)*(tE/oldTE);
  }
  else if (param === "u0") {
    u0 = Number(u0slider.value);
    // thetaY in radians
    var thetaY_rad = u0 * thetaE;
    // converted to milliarcseconds (mas)
    thetaY = thetaY_rad / masToRad;
  }

  // updates Drel, then thetaE, then tE, each of which depends on the last,
  // and collectively depends on some of these base quantities

  // not necessary for every option, but probably cleaner code this way
  updateDerivedQuantities();
  updateSliders();
  updateCurveData();
  redrawCanvases();
}

/** redrawCanvases */
function redrawCanvases() {
  try {
    var lensPlaneModule = require("./fspl-microlensing-event-lens-plane.js");
  }
  catch(ex) {
    handleError(ex);
  }

  if (typeof lensPlaneModule !== "undefined" && lensPlaneModule.initialized === true) {
    lensPlaneModule.redraw();
  }

  try {
    var animationModule = require("./fspl-microlensing-event-animation.js");
  }
  catch(ex) {
    handleError(ex);
  }

  if (typeof animationModule !== "undefined" && animationModule.initialized === true) {
    plotLightcurve(animationModule.time);
    //redraw current animation frame
    animationModule.animateFrame();
  }
  else {
    plotLightcurve();
  }
}

/** updateGraph */
function updateGraph(shift) {
  ;
  var xInit, yInit, xWidth, yHeight;
  if (shift === undefined)
    return;
  else if (shift === "xLeft") {
    xInit = xAxisInitialDay + xGraphShiftStep;
  }
  else if (shift === "xRight") {
    xInit = xAxisInitialDay - xGraphShiftStep;
  }
  else if (shift === "yUp") {
    yInit = yAxisInitialMagnif - yGraphShiftStep;
  }
    else if (shift === "yDown") {
    yInit = yAxisInitialMagnif + yGraphShiftStep;
  }
  else if (shift === "xZoomIn") {
    xWidth = dayWidth - xGraphZoomStep;
  }
  else if (shift === "xZoomOut") {
    xWidth = dayWidth + xGraphZoomStep;
  }
  else if (shift === "yZoomIn") {
    yHeight = magnifHeight - yGraphZoomStep;
  }
  else if (shift === "yZoomOut") {
    yHeight = magnifHeight + yGraphZoomStep;
  }
  else if (shift === "reset") {
    updatePlotScaleAndRange(dayWidthDefault, magnifHeightDefault,
                            xAxisInitialDayDefault, yAxisInitialMagnifDefault);
    updateGridRange(xGridStepDefault, yGridStepDefault);
  }

  updatePlotScaleAndRange(xWidth, yHeight, xInit, yInit);
  updateCurveData();
  plotLightcurve();
}

/** updateGridRange */
function updateGridRange(xStep, yStep) {
  // update grid with new step values,
  // and/or update grid for new initial/final axis values using

  // if new step values are passed in, update grid step values;

  // otherwise leave grid steps unchanged when updating grid
  if ( xStep !== undefined && yStep !== undefined) {
    xGridStep = xStep;
    yGridStep = yStep;
  }

  // update grid using current x/y axis initial and final values

  // Round the initial x grid line placement from initial day on axis
  // up to next xGridStep increment, except when exactly on an xGridStep
  // increment
  if (xAxisInitialDay % xGridStep === 0)
    xGridInitial = xAxisInitialDay;
  else
    xGridInitial = xGridStep * (Math.floor(xAxisInitialDay / xGridStep) + 1);

  // same rounding for final grid line placement
  if (xAxisFinalDay % xGridStep === 0)
    xGridFinal = xAxisFinalDay;
  else
    xGridFinal = xGridStep * (Math.floor(xAxisFinalDay / xGridStep));

  // same rounding for initial y grid line placement
  if (yAxisInitialMagnif % yGridStep === 0)
    yGridInitial = yAxisInitialMagnif;
  else
    yGridInitial = yGridStep * (Math.floor(Math.floor(yAxisInitialMagnif) / yGridStep) + 1);

  // same rounding for final y grid line placement
  if (yAxisFinalMagnif % yGridStep === 0)
    yGridFinal = yAxisFinalMagnif;
  else
    yGridFinal = yGridStep * (Math.floor(yAxisFinalMagnif / yGridStep));
}

/** clearGraph */
function clearGraph() {
  context.clearRect(graphLeftBorder, graphTopBorder, graphWidth, graphHeight);
}

/** xDayToPixel */
function xDayToPixel(xPlotDay) {
  var xPlotPixel = (xPlotDay - xAxisInitialDay) * xPixelScale + graphLeftBorder;
  return xPlotPixel;
}

/** yMagnifToPixel */
function yMagnifToPixel(yPlotMagnif) {
  var yPlotPixel = graphBottomBorder - (yPlotMagnif - yAxisInitialMagnif) * yPixelScale;
  return yPlotPixel;
}

/** drawAxes */
function drawAxes() {
  context.beginPath();

  // x axis

  // the -axisWidth/2 makes the x and y axes fully connect
  // at their intersection for all axis linewidths
  context.moveTo(graphLeftBorder - axisWidth/2, graphBottomBorder);
  context.lineTo(graphRightBorder + 15, graphBottomBorder);

  // y axis;
  context.moveTo(graphLeftBorder, graphBottomBorder);
  context.lineTo(graphLeftBorder, graphTopBorder - 15);

  // x axis arrow

  // NOTE: Doesn't look right for linewidth > 2
  context.moveTo(graphRightBorder + 15, graphBottomBorder);
  context.lineTo(graphRightBorder + 8, graphBottomBorder - 5);
  context.moveTo(graphRightBorder + 15, graphBottomBorder);
  context.lineTo(graphRightBorder + 8, graphBottomBorder + 5);

  // y axis arrow

  // NOTE: Doesn't look right for linewidth > 2
  context.moveTo(graphLeftBorder, graphTopBorder - 15);
  context.lineTo(graphLeftBorder - 5, graphTopBorder - 8);
  context.moveTo(graphLeftBorder, graphTopBorder - 15);
  context.lineTo(graphLeftBorder + 5, graphTopBorder - 8);

  context.strokeStyle = axisColor;
  context.lineWidth = axisWidth;
  context.stroke();
}

/** drawAxisLabels */
function drawAxisLabels() {
  // x label
  context.font = axisLabelFont;
  context.textAlign = axisLabelAlign;
  context.textBaseline = axisLabelBaseline;
  context.fillStyle = axisLabelColor;

  if (centerLayout === true) {
    // x label
    context.fillText(xLabel, centerX, graphBottomTrailingBorder + axisLabelSpacing)

    // y label
    context.save();
    context.translate(graphLeftTrailingBorder - 25, centerY);
    context.rotate(-Math.PI/2);
    context.textAlign = "center";
    context.fillText(yLabel, 0, 0);
    context.restore();
  }
  else {
    // x label
    context.textAlign = "left";
    context.fillText(xLabel, graphRightTrailingBorder + 20, graphBottomBorder);

    // y label
    context.textBaseline = "bottom";
    context.textAlign = "center";
    context.fillText(yLabel, graphLeftBorder, graphTopTrailingBorder - 20);
  }
}

/** updatePlotScaleAndRange */
function updatePlotScaleAndRange(width, height, xInit, yInit) {
  // Change range/scale of plot

  // plot scale
  if (width !== undefined)
    dayWidth = width;
  if (height !== undefined)
    magnifHeight = height;
  xPixelScale = graphWidth/dayWidth; // pixels per day
  yPixelScale = graphHeight/magnifHeight; // pixels per magnif unit
  if (xInit !== undefined)
    xAxisInitialDay = xInit;
  if (yInit !== undefined)
    yAxisInitialMagnif = yInit;
  xAxisFinalDay = xAxisInitialDay + dayWidth;
  yAxisFinalMagnif = yAxisInitialMagnif + magnifHeight;

  updateGridRange();
}

/** initPlot */
function initPlot() {
  clearGraph();

  // fill in canvas background
  context.fillStyle = canvasBackgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // fill in graph background
  context.fillStyle = graphBackgroundColor;
  context.fillRect(graphLeftBorder, graphTopBorder, graphWidth, graphHeight);

  // draw vertical lines and x axis tick labels
  context.beginPath();
  for (var xPlotDay = xGridInitial; xPlotDay <= xGridFinal; xPlotDay+=xGridStep) {
    var xPlotPixel = xDayToPixel(xPlotDay);
    context.moveTo(xPlotPixel, graphTopTrailingBorder);
    context.lineTo(xPlotPixel, graphBottomTrailingBorder);

    // tick text label
    var xTickLabel = xPlotDay;
    context.font = tickLabelFont;
    context.fillStyle = tickLabelColor;
    context.textAlign = tickLabelAlign;
    context.textBaseline = tickLabelBaseline;
    context.fillText(xTickLabel, xPlotPixel, graphBottomTrailingBorder + tickLabelSpacing);
  }

  //draw horizontal lines and y axis tick label
  for (var yPlotMagnif = yGridInitial; yPlotMagnif <= yGridFinal; yPlotMagnif+=yGridStep) {
    var yPlotPixel = yMagnifToPixel(yPlotMagnif);
    context.moveTo(graphLeftTrailingBorder, yPlotPixel);
    context.lineTo(graphRightTrailingBorder, yPlotPixel);

    var yTickLabel = yPlotMagnif;
    context.font = tickLabelFont;
    context.fillStyle = tickLabelColor;
    context.textAlign = "right";
    context.textBaseline = tickLabelBaseline;
    context.fillText(yTickLabel,graphLeftTrailingBorder - tickLabelSpacing,  yPlotPixel);
  }
  context.lineWidth = gridWidth;
  context.strokeStyle = gridColor;
  context.stroke();

  // draw border
  context.strokeStyle = graphBorderColor;
  context.lineWidth = graphBorderWidth;
  context.strokeRect(graphLeftBorder, graphTopBorder, graphWidth, graphHeight);
}

/** plotLightcurve */
function plotLightcurve(tDayFinal=xAxisFinalDay, inputData) {
  // Draw plot background, as well as both complete (dashed) lightcurve and
  // partial (solid) lightcurve up to a given time
  // draw plot with gridlines, etc. (no axes or axis labels yet).
  initPlot();
  // draw complete lightcurve across entire time axis as dashed line
  plotLightcurveAlone(xAxisFinalDay, inputData, dashedCurve=true);
  // draw lightcurve up to the time argument as solid line
  plotLightcurveAlone(tDayFinal, inputData, dashedCurve=false);
  // draw axes and their labels;
  // goes last because axes are IN FRONT of lightcurve
  drawAxes();
  drawAxisLabels();
}

/** plotLightcurveAlone */
function plotLightcurveAlone(tDayFinal=xAxisFinalDay, inputData, dashedCurve=false) {
  // draw a single lightcurve (dashed or solid) up to a given time

  var tDay, magnif;
  if (inputData !== undefined) {
    curveData = inputData;
  }
  // no input parameter given
  else {
    // module lightcurve variable already initialized
    if (lightcurveData !== null) {
      // use module variable in function
      curveData = lightcurveData;
    }
    // module lightcurve variable not initialized yet
    else {
      // initialize module variable
      updateCurveData();
      curveData = lightcurveData; // use newly initialized module variable in function
    }
  }
  var times = curveData.times;
  var magnifs = curveData.magnifs;
  tDay = times[0];
  magnif = magnifs[0];

  context.save();
    // set up clipping region as graph region, so that curve does not
    // extend beyond graph region
    context.beginPath();
    context.rect(graphLeftBorder, graphTopBorder, graphWidth, graphHeight);
    context.clip();

    if (dashedCurve === true)
      // turn on dashed lines
      context.setLineDash([dashedCurveLength, dashedCurveSpacing]);

    // prepare to draw curve and move to initial pixel coordinate
    var tPixel = xDayToPixel(tDay);
    var magnifPixel = yMagnifToPixel(magnif);
    context.beginPath();
    context.moveTo(tPixel, magnifPixel);

    // Iterate over remaining days and draw lines from each pixel coordinate
    // to the next

    // Index tracks place in data arrays if reading in data
    var index = 0;
    while (tDay < tDayFinal) {
      // proceed to the next elements for the day and magnification arrays
      index += 1;
      tDay = times[index];
      magnif = magnifs[index];

      var tPixel = xDayToPixel(tDay);
      var magnifPixel = yMagnifToPixel(magnif);
      context.lineTo(tPixel, magnifPixel);
    }

    if (dashedCurve === true) {
      context.strokeStyle = dashedCurveColor;
      context.lineWidth = dashedCurveWidth;
    }
    else {
      context.lineJoin = "round";
      context.lineWidth = curveWidth;
      context.strokeStyle = curveColor;
    }
    context.stroke();

    if (dashedCurve === true)
      context.setLineDash([]); // turn off dashed lines
  context.restore();
}

/** getThetaX */
function getThetaX(t) {
  // day/year; const
  var yearToDay = 365.25;
  // convert mu to milliarcseconds/day
  var eqMu = mu / yearToDay;
  var thetaX = eqMu * (t - t0);
  return thetaX;
}

/** updateCurveData */
function updateCurveData(isFiniteSource = finiteSourceFlag) {
  var times = [];
  var magnifs = [];

  var finiteSourceModule;
  if (isFiniteSource) {
    try {
      finiteSourceModule = require("./fspl-microlensing-event-finite-source.js");
    }
    catch(ex) {
      handleError(ex);
    }
  }

  for (var tDay = xAxisInitialDay; tDay <= xAxisFinalDay; tDay += dt) {
    var magnif = getMagnif(tDay, isFiniteSource, finiteSourceModule);
    // if (tDay === 0)
    //   console.log("magnif: " + magnif);
    times.push(tDay);
    magnifs.push(magnif);
  }
  var curveData = {
    times:times,
    magnifs:magnifs
  };

  lightcurveData = curveData;

  var autoScaleMagnifHeight = false;

  if (autoScaleMagnifHeight === true) {
    var maxMagnif = math.max(curveData.magnifs);
    updatePlotScaleAndRange(undefined, maxMagnif+1, undefined, 0.5);
  }

  lightcurveData = curveData;
}

/** toggleFiniteSource */
function toggleFiniteSource() {
  finiteSourceFlag = finiteSourceCheckbox.checked;
  updateCurveData();
  redrawCanvases();
}

// functions to calculate magnification from parameters for a given time
/** getTimeTerm */
function getTimeTerm(t) {
  var timeTerm = (t - t0)/tE; // unitless
  return timeTerm;
}

/** getU */
function getU(timeTerm) {
  var u = Math.sqrt(u0*u0 + timeTerm*timeTerm); // unitless
  return u;
}

/** getMagnifFromU */
function getMagnifFromU(u, isFiniteSource = finiteSourceFlag, finiteSourceModule) {
  var magnifNumerator = u*u + 2;
  var magnifDenominator = u * Math.sqrt(u * u + 4);
  // unitless
  magnif = magnifNumerator / magnifDenominator;
  if (isFiniteSource && typeof finiteSourceModule !== "undefined" &&
     finiteSourceModule !== null) {
    magnif *= finiteSourceModule.getFiniteSourceFactor(u);
  }

  return magnif;
}

/** getMagnif */
function getMagnif(t, isFiniteSource=finiteSourceFlag, finiteSourceModule) {
    // unitless
  var timeTerm = getTimeTerm(t);
  // unitless
  var u = getU(timeTerm);
  // unitless
  var magnif = getMagnifFromU(u, isFiniteSource, finiteSourceModule);

  return magnif;
}

// public properties to be stored in module object,
// accessible via module object by code executed after this script
module.exports = {
  // initialization

  // initialization function
  init: init,
  // whether initialization is done
  get initialized() { return initialized; },

  // getters for variables we want to share

  // base modeling parameters
  get Ml() { return Ml; },
  // kpc
  get Ds() { return Ds; },
  // milliarcseconds (mas)
  get thetaY() { return thetaY; },
  // kpc
  get Dl() { return Dl; },
  // days
  get t0() { return t0; },
  // mas/yr
  get mu() { return mu; },

  // derived modeling parameters

  // debug: find out units for Drel
  get Drel() { return Drel; },
  // radians
  get thetaE() { return thetaE; },
  // milliarcseconds (mas)
  get thetaE_mas() { return thetaE / masToRad; },
  // days
  get tE() { return tE; },
  // unitless (units of thetaE)
  get u0() { return u0; },

  get finiteSourceFlag() { return finiteSourceFlag; }, // whether finite or point source is being used

  // controls if plot updates when slider is moved and/or released
  get updateOnSliderMovementFlag() { return updateOnSliderMovementFlag; },
  get updateOnSliderReleaseFlag() { return updateOnSliderReleaseFlag; },

  // used for animation

  // time step used for drawing curve (days)
  get dt() { return dt; },
  get xAxisInitialDay() { return xAxisInitialDay; },
  get xAxisFinalDay() { return xAxisFinalDay; },
  plotLightcurve: plotLightcurve,

  // redrawing both canvases
  redrawCanvases: redrawCanvases,

  // for calculating thetaE for individual lens masses, in addition to the
  // thetaE of the summed lens masses
  calculateThetaE: calculateThetaE,

  get imageParities() {
    if (lightcurveData !== null && lightcurveData !== undefined)
      return lightcurveData.imageParities;
  },

  // normalized (over thetaE) positions of the (five or three) lensed images
  get imagesNormalizedPos() {
    if (lightcurveData !== null && lightcurveData !== undefined)
      return lightcurveData.imagesNormalizedPos;
  },

  // get caustic and critical curve data points,
  // normalized in units of (binary) thetaE
  get causticNormalized() {
    if (lightcurveData !== null && lightcurveData !== undefined)
      return lightcurveData.causticNormalized;
  },

  get critNormalized() {
    if (lightcurveData !== null && lightcurveData !== undefined)
      return lightcurveData.critNormalized;
  },

  get times() {
    if (lightcurveData !== null && lightcurveData !== undefined)
      return lightcurveData.times;
  },

  // for debugging
  getU: getU,
  getTimeTerm: getTimeTerm,
  getMagnif: getMagnif,
  updateCurveData: updateCurveData,
  getThetaX: getThetaX,

  // for updating slider readout
  updateSliderReadout: updateSliderReadout,
};

},{"./fspl-microlensing-event-animation.js":11,"./fspl-microlensing-event-finite-source.js":13,"./fspl-microlensing-event-lens-plane.js":14,"./utils.js":19}],16:[function(require,module,exports){
/** Error handler module.
  * Handles exceptions.
  *
  * Needed to handle exceptions raised when trying to load
  * a module that is not present.
  *
  * @module handle-error
  */

;

/** handle */
module.exports = function handleError(ex) {
  if (ex instanceof Error && ex.code === "MODULE_NOT_FOUND") {
    ;
  }
  else {
    throw(ex);
  }
}

},{}],17:[function(require,module,exports){
/** Main module.
  * Main module for interactive microlensing simulator.
  *
  * @module main
  */

var showOrHideModule = require("./show-or-hide.js");
var eventModule = require("./fspl-microlensing-event.js");
var lensPlaneModule = require("./fspl-microlensing-event-lens-plane.js");
var animationModule = require("./fspl-microlensing-event-animation.js");

/** init */
function init() {
  // add event listener to show/hide link for finite source options
  if (typeof showOrHideModule !== "undefined" &&
      showOrHideModule !== null)
    showOrHideModule.init();

  // these modules must be initialized in this specific order
  if (typeof eventModule !== "undefined" &&
      eventModule !== null)
    eventModule.init();

  if (typeof lensPlaneModule !== "undefined" &&
      lensPlaneModule !== null)
    lensPlaneModule.init();

  if (typeof animationModule !== "undefined" &&
      animationModule !== null)
    animationModule.init();
}

window.onload = init;

},{"./fspl-microlensing-event-animation.js":11,"./fspl-microlensing-event-lens-plane.js":14,"./fspl-microlensing-event.js":15,"./show-or-hide.js":18}],18:[function(require,module,exports){
/** Show/Hide finite source options module.
  * @module show-or-hide.js
  */



var toggleLink;
var toggledElement;
var initialized = false;

function init() {
  toggleLink = document.getElementById("toggleLink");
  toggledElement = document.getElementById("toggledElement");
  if (typeof toggleLink !== "undefined" && toggleLink !== null &&
      typeof toggledElement !== "undefined" && toggledElement !== null) {
    toggleLink.addEventListener("click", toggle, false);
    initialized = true;
  }
}

function toggle() {
  if (initialized === false)
    init();

	if(toggledElement.style.display == "block") {
    		toggledElement.style.display = "none";
		toggleLink.innerHTML = "+" + toggleLink.innerHTML.slice(1, toggleLink.innerHTML.length);
  	}
	else {
		toggledElement.style.display = "block";
		toggleLink.innerHTML = "&minus;" + toggleLink.innerHTML.slice(1, toggleLink.innerHTML.length);
	}
}

module.exports = {
  init: init,
  toggle: toggle,
};

},{}],19:[function(require,module,exports){
/** Uitilities module.
  * Miscellaneous helper functions.
  * @module utils
  */

module.exports = {
  almostEquals: require("./almost-equals.js"),
  handleError: require("./handle-error.js"),
  ellipse: require("./ellipse.js"),
};

},{"./almost-equals.js":9,"./ellipse.js":10,"./handle-error.js":16}]},{},[17]);
