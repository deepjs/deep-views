/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Views controller, dom directives and dom-sheets for deepjs.
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./lib/views", "./lib/directives", "./lib/directives-parser", "./lib/dom-sheeter"], function(require, views, directives, directivesParser, domsheets){
	return deep;
});