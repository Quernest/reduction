!function(t){var n={};function r(e){if(n[e])return n[e].exports;var o=n[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=t,r.c=n,r.d=function(t,n,e){r.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:e})},r.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(n,"a",n),n},r.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},r.p="/reduction/",r(r.s=17)}([function(t,n,r){var e=r(3),o=r(29),u=r(30),c="[object Null]",f="[object Undefined]",i=e?e.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?f:c:i&&i in Object(t)?o(t):u(t)}},function(t,n){t.exports=function(t){return null!=t&&"object"==typeof t}},function(t,n){var r=Array.isArray;t.exports=r},function(t,n,r){var e=r(7).Symbol;t.exports=e},function(t,n,r){var e=r(39),o=r(11);t.exports=function(t){return null!=t&&o(t.length)&&!e(t)}},function(t,n,r){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.__extends=function(t,n){function r(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)},r.d(n,"__assign",function(){return o}),n.__rest=function(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(null!=t&&"function"===typeof Object.getOwnPropertySymbols)for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&(r[e[o]]=t[e[o]]);return r},n.__decorate=function(t,n,r,e){var o,u=arguments.length,c=u<3?n:null===e?e=Object.getOwnPropertyDescriptor(n,r):e;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)c=Reflect.decorate(t,n,r,e);else for(var f=t.length-1;f>=0;f--)(o=t[f])&&(c=(u<3?o(c):u>3?o(n,r,c):o(n,r))||c);return u>3&&c&&Object.defineProperty(n,r,c),c},n.__param=function(t,n){return function(r,e){n(r,e,t)}},n.__metadata=function(t,n){if("object"===typeof Reflect&&"function"===typeof Reflect.metadata)return Reflect.metadata(t,n)},n.__awaiter=function(t,n,r,e){return new(r||(r=Promise))(function(o,u){function c(t){try{i(e.next(t))}catch(t){u(t)}}function f(t){try{i(e.throw(t))}catch(t){u(t)}}function i(t){t.done?o(t.value):new r(function(n){n(t.value)}).then(c,f)}i((e=e.apply(t,n||[])).next())})},n.__generator=function(t,n){var r,e,o,u,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return u={next:f(0),throw:f(1),return:f(2)},"function"===typeof Symbol&&(u[Symbol.iterator]=function(){return this}),u;function f(u){return function(f){return function(u){if(r)throw new TypeError("Generator is already executing.");for(;c;)try{if(r=1,e&&(o=2&u[0]?e.return:u[0]?e.throw||((o=e.return)&&o.call(e),0):e.next)&&!(o=o.call(e,u[1])).done)return o;switch(e=0,o&&(u=[2&u[0],o.value]),u[0]){case 0:case 1:o=u;break;case 4:return c.label++,{value:u[1],done:!1};case 5:c.label++,e=u[1],u=[0];continue;case 7:u=c.ops.pop(),c.trys.pop();continue;default:if(!(o=(o=c.trys).length>0&&o[o.length-1])&&(6===u[0]||2===u[0])){c=0;continue}if(3===u[0]&&(!o||u[1]>o[0]&&u[1]<o[3])){c.label=u[1];break}if(6===u[0]&&c.label<o[1]){c.label=o[1],o=u;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(u);break}o[2]&&c.ops.pop(),c.trys.pop();continue}u=n.call(t,c)}catch(t){u=[6,t],e=0}finally{r=o=0}if(5&u[0])throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}([u,f])}}},n.__exportStar=function(t,n){for(var r in t)n.hasOwnProperty(r)||(n[r]=t[r])},n.__values=u,n.__read=c,n.__spread=function(){for(var t=[],n=0;n<arguments.length;n++)t=t.concat(c(arguments[n]));return t},n.__await=f,n.__asyncGenerator=function(t,n,r){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e,o=r.apply(t,n||[]),u=[];return e={},c("next"),c("throw"),c("return"),e[Symbol.asyncIterator]=function(){return this},e;function c(t){o[t]&&(e[t]=function(n){return new Promise(function(r,e){u.push([t,n,r,e])>1||i(t,n)})})}function i(t,n){try{!function(t){t.value instanceof f?Promise.resolve(t.value.v).then(a,l):s(u[0][2],t)}(o[t](n))}catch(t){s(u[0][3],t)}}function a(t){i("next",t)}function l(t){i("throw",t)}function s(t,n){t(n),u.shift(),u.length&&i(u[0][0],u[0][1])}},n.__asyncDelegator=function(t){var n,r;return n={},e("next"),e("throw",function(t){throw t}),e("return"),n[Symbol.iterator]=function(){return this},n;function e(e,o){n[e]=t[e]?function(n){return(r=!r)?{value:f(t[e](n)),done:"return"===e}:o?o(n):n}:o}},n.__asyncValues=function(t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var n,r=t[Symbol.asyncIterator];return r?r.call(t):(t=u(t),n={},e("next"),e("throw"),e("return"),n[Symbol.asyncIterator]=function(){return this},n);function e(r){n[r]=t[r]&&function(n){return new Promise(function(e,o){n=t[r](n),function(t,n,r,e){Promise.resolve(e).then(function(n){t({value:n,done:r})},n)}(e,o,n.done,n.value)})}}},n.__makeTemplateObject=function(t,n){Object.defineProperty?Object.defineProperty(t,"raw",{value:n}):t.raw=n;return t},n.__importStar=function(t){if(t&&t.__esModule)return t;var n={};if(null!=t)for(var r in t)Object.hasOwnProperty.call(t,r)&&(n[r]=t[r]);return n.default=t,n},n.__importDefault=function(t){return t&&t.__esModule?t:{default:t}};var e=function(t,n){return(e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var r in n)n.hasOwnProperty(r)&&(t[r]=n[r])})(t,n)};var o=function(){return(o=Object.assign||function(t){for(var n,r=1,e=arguments.length;r<e;r++)for(var o in n=arguments[r])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)};function u(t){var n="function"===typeof Symbol&&t[Symbol.iterator],r=0;return n?n.call(t):{next:function(){return t&&r>=t.length&&(t=void 0),{value:t&&t[r++],done:!t}}}}function c(t,n){var r="function"===typeof Symbol&&t[Symbol.iterator];if(!r)return t;var e,o,u=r.call(t),c=[];try{for(;(void 0===n||n-- >0)&&!(e=u.next()).done;)c.push(e.value)}catch(t){o={error:t}}finally{try{e&&!e.done&&(r=u.return)&&r.call(u)}finally{if(o)throw o.error}}return c}function f(t){return this instanceof f?(this.v=t,this):new f(t)}},function(t,n,r){var e=r(18),o=r(19),u=r(41),c=r(2);t.exports=function(t,n){return(c(t)?e:o)(t,u(n))}},function(t,n,r){var e=r(8),o="object"==typeof self&&self&&self.Object===Object&&self,u=e||o||Function("return this")();t.exports=u},function(t,n,r){(function(n){var r="object"==typeof n&&n&&n.Object===Object&&n;t.exports=r}).call(n,r(28))},function(t,n){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}},function(t,n){var r=9007199254740991,e=/^(?:0|[1-9]\d*)$/;t.exports=function(t,n){var o=typeof t;return!!(n=null==n?r:n)&&("number"==o||"symbol"!=o&&e.test(t))&&t>-1&&t%1==0&&t<n}},function(t,n){var r=9007199254740991;t.exports=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=r}},function(t,n){t.exports=function(t){return function(n){return t(n)}}},function(t,n,r){(function(t){var e=r(8),o="object"==typeof n&&n&&!n.nodeType&&n,u=o&&"object"==typeof t&&t&&!t.nodeType&&t,c=u&&u.exports===o&&e.process,f=function(){try{var t=u&&u.require&&u.require("util").types;return t||c&&c.binding&&c.binding("util")}catch(t){}}();t.exports=f}).call(n,r(9)(t))},function(t,n){t.exports=function(t){var n=typeof t;return null!=t&&("object"==n||"function"==n)}},function(t,n,r){var e=r(3),o=r(48),u=r(2),c=r(49),f=1/0,i=e?e.prototype:void 0,a=i?i.toString:void 0;t.exports=function t(n){if("string"==typeof n)return n;if(u(n))return o(n,t)+"";if(c(n))return a?a.call(n):"";var r=n+"";return"0"==r&&1/n==-f?"-0":r}},function(t,n){var r=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");t.exports=function(t){return r.test(t)}},function(t,n,r){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var e=r(5),o=e.__importDefault(r(6)),u=e.__importDefault(r(43)),c=e.__importDefault(r(45)),f=r(46),i=self;i.addEventListener("message",function(t){var n=new FileReader;n.readAsText(t.data),n.onload=function(){var t,r=n.result;if(!c.default(r))throw new Error("data reading error");var e=(t=f.parseCSV(r)).headers,a=t.data;if(e.length<2)throw new Error("the object of dataset must contain more than 2 factors.");o.default(a,function(t){o.default(t,function(t){return function(t){if(u.default(t))throw new Error("the dataset has some wrong values")}(t)})}),i.postMessage(t)},n.onerror=function(t){return i.postMessage(t)}})},function(t,n){t.exports=function(t,n){for(var r=-1,e=null==t?0:t.length;++r<e&&!1!==n(t[r],r,t););return t}},function(t,n,r){var e=r(20),o=r(40)(e);t.exports=o},function(t,n,r){var e=r(21),o=r(23);t.exports=function(t,n){return t&&e(t,n,o)}},function(t,n,r){var e=r(22)();t.exports=e},function(t,n){t.exports=function(t){return function(n,r,e){for(var o=-1,u=Object(n),c=e(n),f=c.length;f--;){var i=c[t?f:++o];if(!1===r(u[i],i,u))break}return n}}},function(t,n,r){var e=r(24),o=r(35),u=r(4);t.exports=function(t){return u(t)?e(t):o(t)}},function(t,n,r){var e=r(25),o=r(26),u=r(2),c=r(31),f=r(10),i=r(33),a=Object.prototype.hasOwnProperty;t.exports=function(t,n){var r=u(t),l=!r&&o(t),s=!r&&!l&&c(t),p=!r&&!l&&!s&&i(t),y=r||l||s||p,b=y?e(t.length,String):[],v=b.length;for(var d in t)!n&&!a.call(t,d)||y&&("length"==d||s&&("offset"==d||"parent"==d)||p&&("buffer"==d||"byteLength"==d||"byteOffset"==d)||f(d,v))||b.push(d);return b}},function(t,n){t.exports=function(t,n){for(var r=-1,e=Array(t);++r<t;)e[r]=n(r);return e}},function(t,n,r){var e=r(27),o=r(1),u=Object.prototype,c=u.hasOwnProperty,f=u.propertyIsEnumerable,i=e(function(){return arguments}())?e:function(t){return o(t)&&c.call(t,"callee")&&!f.call(t,"callee")};t.exports=i},function(t,n,r){var e=r(0),o=r(1),u="[object Arguments]";t.exports=function(t){return o(t)&&e(t)==u}},function(t,n){var r;r=function(){return this}();try{r=r||Function("return this")()||(0,eval)("this")}catch(t){"object"===typeof window&&(r=window)}t.exports=r},function(t,n,r){var e=r(3),o=Object.prototype,u=o.hasOwnProperty,c=o.toString,f=e?e.toStringTag:void 0;t.exports=function(t){var n=u.call(t,f),r=t[f];try{t[f]=void 0;var e=!0}catch(t){}var o=c.call(t);return e&&(n?t[f]=r:delete t[f]),o}},function(t,n){var r=Object.prototype.toString;t.exports=function(t){return r.call(t)}},function(t,n,r){(function(t){var e=r(7),o=r(32),u="object"==typeof n&&n&&!n.nodeType&&n,c=u&&"object"==typeof t&&t&&!t.nodeType&&t,f=c&&c.exports===u?e.Buffer:void 0,i=(f?f.isBuffer:void 0)||o;t.exports=i}).call(n,r(9)(t))},function(t,n){t.exports=function(){return!1}},function(t,n,r){var e=r(34),o=r(12),u=r(13),c=u&&u.isTypedArray,f=c?o(c):e;t.exports=f},function(t,n,r){var e=r(0),o=r(11),u=r(1),c={};c["[object Float32Array]"]=c["[object Float64Array]"]=c["[object Int8Array]"]=c["[object Int16Array]"]=c["[object Int32Array]"]=c["[object Uint8Array]"]=c["[object Uint8ClampedArray]"]=c["[object Uint16Array]"]=c["[object Uint32Array]"]=!0,c["[object Arguments]"]=c["[object Array]"]=c["[object ArrayBuffer]"]=c["[object Boolean]"]=c["[object DataView]"]=c["[object Date]"]=c["[object Error]"]=c["[object Function]"]=c["[object Map]"]=c["[object Number]"]=c["[object Object]"]=c["[object RegExp]"]=c["[object Set]"]=c["[object String]"]=c["[object WeakMap]"]=!1,t.exports=function(t){return u(t)&&o(t.length)&&!!c[e(t)]}},function(t,n,r){var e=r(36),o=r(37),u=Object.prototype.hasOwnProperty;t.exports=function(t){if(!e(t))return o(t);var n=[];for(var r in Object(t))u.call(t,r)&&"constructor"!=r&&n.push(r);return n}},function(t,n){var r=Object.prototype;t.exports=function(t){var n=t&&t.constructor;return t===("function"==typeof n&&n.prototype||r)}},function(t,n,r){var e=r(38)(Object.keys,Object);t.exports=e},function(t,n){t.exports=function(t,n){return function(r){return t(n(r))}}},function(t,n,r){var e=r(0),o=r(14),u="[object AsyncFunction]",c="[object Function]",f="[object GeneratorFunction]",i="[object Proxy]";t.exports=function(t){if(!o(t))return!1;var n=e(t);return n==c||n==f||n==u||n==i}},function(t,n,r){var e=r(4);t.exports=function(t,n){return function(r,o){if(null==r)return r;if(!e(r))return t(r,o);for(var u=r.length,c=n?u:-1,f=Object(r);(n?c--:++c<u)&&!1!==o(f[c],c,f););return r}}},function(t,n,r){var e=r(42);t.exports=function(t){return"function"==typeof t?t:e}},function(t,n){t.exports=function(t){return t}},function(t,n,r){var e=r(44);t.exports=function(t){return e(t)&&t!=+t}},function(t,n,r){var e=r(0),o=r(1),u="[object Number]";t.exports=function(t){return"number"==typeof t||o(t)&&e(t)==u}},function(t,n,r){var e=r(0),o=r(2),u=r(1),c="[object String]";t.exports=function(t){return"string"==typeof t||!o(t)&&u(t)&&e(t)==c}},function(t,n,r){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var e=r(5),o=e.__importDefault(r(6)),u=e.__importDefault(r(47));n.parseCSV=function(t){var n=u.default(t,"\n"),r=[],e=u.default(n[0],",");return o.default(n,function(t,n){if(!(n<1)){var c=u.default(t,",");o.default(e,function(t,n){r[n]||(r[n]=[]),c[n]&&r[n].push(parseFloat(c[n]))})}}),{headers:e,data:r}}},function(t,n,r){var e=r(15),o=r(50),u=r(16),c=r(52),f=r(54),i=r(56),a=r(59),l=4294967295;t.exports=function(t,n,r){return r&&"number"!=typeof r&&c(t,n,r)&&(n=r=void 0),(r=void 0===r?l:r>>>0)?(t=a(t))&&("string"==typeof n||null!=n&&!f(n))&&!(n=e(n))&&u(t)?o(i(t),0,r):t.split(n,r):[]}},function(t,n){t.exports=function(t,n){for(var r=-1,e=null==t?0:t.length,o=Array(e);++r<e;)o[r]=n(t[r],r,t);return o}},function(t,n,r){var e=r(0),o=r(1),u="[object Symbol]";t.exports=function(t){return"symbol"==typeof t||o(t)&&e(t)==u}},function(t,n,r){var e=r(51);t.exports=function(t,n,r){var o=t.length;return r=void 0===r?o:r,!n&&r>=o?t:e(t,n,r)}},function(t,n){t.exports=function(t,n,r){var e=-1,o=t.length;n<0&&(n=-n>o?0:o+n),(r=r>o?o:r)<0&&(r+=o),o=n>r?0:r-n>>>0,n>>>=0;for(var u=Array(o);++e<o;)u[e]=t[e+n];return u}},function(t,n,r){var e=r(53),o=r(4),u=r(10),c=r(14);t.exports=function(t,n,r){if(!c(r))return!1;var f=typeof n;return!!("number"==f?o(r)&&u(n,r.length):"string"==f&&n in r)&&e(r[n],t)}},function(t,n){t.exports=function(t,n){return t===n||t!==t&&n!==n}},function(t,n,r){var e=r(55),o=r(12),u=r(13),c=u&&u.isRegExp,f=c?o(c):e;t.exports=f},function(t,n,r){var e=r(0),o=r(1),u="[object RegExp]";t.exports=function(t){return o(t)&&e(t)==u}},function(t,n,r){var e=r(57),o=r(16),u=r(58);t.exports=function(t){return o(t)?u(t):e(t)}},function(t,n){t.exports=function(t){return t.split("")}},function(t,n){var r="[\\ud800-\\udfff]",e="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",o="\\ud83c[\\udffb-\\udfff]",u="[^\\ud800-\\udfff]",c="(?:\\ud83c[\\udde6-\\uddff]){2}",f="[\\ud800-\\udbff][\\udc00-\\udfff]",i="(?:"+e+"|"+o+")"+"?",a="[\\ufe0e\\ufe0f]?"+i+("(?:\\u200d(?:"+[u,c,f].join("|")+")[\\ufe0e\\ufe0f]?"+i+")*"),l="(?:"+[u+e+"?",e,c,f,r].join("|")+")",s=RegExp(o+"(?="+o+")|"+l+a,"g");t.exports=function(t){return t.match(s)||[]}},function(t,n,r){var e=r(15);t.exports=function(t){return null==t?"":e(t)}}]);
//# sourceMappingURL=406cda69386c5ac5acd7.worker.js.map