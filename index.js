/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Views controller, dom directives and dom-sheets for deepjs.
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./lib/view", "./lib/directives", "./lib/dom-composer"], function(require, deep, views, directives, domComposer) {
	return deep;
});
