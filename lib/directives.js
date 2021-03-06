/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * dom directives for deepjs views controller.
 *
 *	TODO : 
 *	deep.compose.dom.inPlaceEditable().click(deep.log);
	deep.compose.dom(renderObject).inPlaceEditable().click(deep.log);
 * 
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./dom-composer", "kroked/lib/directives-parser"], function(require, deep, DomComposer, directivesParser) {

	// parsed directives cache
	var cache = {};

	deep.ui = deep.ui || {};
	/**
	 * Forge the final function with deep.compose.dom (a decompose.Composer)
	 * @param  {[type]} directives [description]
	 * @return {[type]}            [description]
	 */
	deep.ui.parseDirectives = function(directives) {
		if (cache[directives])
			return cache[directives];
		var composer = deep.compose.dom,
			tmp = composer,
			tokens = directivesParser.analyse(directives, null, true).tokens;
		for (var i = 0, len = tokens.length; i < len; ++i) {
			var token = tokens[i],
				name = token.name;
			if (!tmp[name]) {
				deep.warn("missing dom composer : ", name);
				continue;
			}
			tmp = tmp[name].apply(composer, token.args);
		}
		cache[directives] = tmp;
		return tmp;
	};
	deep.ui.applyDirectives = function(ctrl, selector, renderNode) {
		var $ = deep.$();
		if (!$)
			return null;
		var promises = [],
			isServer = deep.context("isServer");
		ctrl = ctrl || {};
		$(selector)
			.find(".dp")
			.each(function(index, element) {
				var scope = $(this).data("scope");
				if (scope && scope != 'both' && (scope == 'browser' && isServer) || (scope == 'server' && !isServer))
					return;
				var directives = $(this).data("directives");
				if (!isServer || (scope == "server" && isServer))
					$(this).removeClass("dp");
				if (directives) {
					var r = deep.ui.parseDirectives(directives).call(ctrl, this, renderNode);
					if (r && r.then)
						promises.push(r);
				}
			});
		if (promises.length === 0)
			return null;
		return deep.all(promises);
	}
});
