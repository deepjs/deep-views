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
define(["require", "deepjs/deep", "deepjs/lib/utils", "./dom-composer","deepjs/lib/errors"], function(require, deep, utils, DomSheeter, errors){

	// parsed directives cache
	var cache = {};

	// should use mp-lex/lib/parser/directive
	deep.ui.parseDirectives = function(directives){
		if(cache[directives])
			return cache[directives];
		var splitted = directives.split(/[\s]+/);
		var composer = deep.compose.dom, tmp = composer;
		for(var i = 0, len = splitted.length; i < len; ++i)
		{
			var d = splitted[i], 
				pI = d.indexOf("("),
				args = [],
				enhancer = d;
			if(pI > -1)
			{
				enhancer = d.substring(0,pI);
				args = d.substring(pI+1, d.length-1).split(",");
			}
			if(!tmp[enhancer])
			{
				deep.warn("missing dom composer : ",enhancer);
				continue;
			}
			tmp = tmp[enhancer].apply(composer, args);
		}
		cache[directives] = tmp;
		return tmp;
	};
	deep.ui.enhance = function(ctrl, selector, context) {
		var $ = deep.$();
		if(!$)
			return null;
		var promises = [];
		ctrl = ctrl || {};
		var isServer = deep.context("isServer");
		$(selector)
		.find(".dp")
		.each(function(index, element) {
			var scope = $(this).attr("dp-scope");
			if (scope && scope != 'both' && (scope == 'browser' && isServer) || (scope == 'server' && !isServer))
				return;
			var enhancements = $(this).attr("dp");
			if(!isServer || (scope == "server" && isServer))
				$(this).removeClass("dp").removeAttr("dp");
			if(enhancements)
			{
				var r = deep.ui.parseDirectives(enhancements).call(ctrl, this, context);
				if(r && r.then)
					promises.push(r);
			}
		});
		if (promises.length === 0)
			return null;
		return deep.all(promises);
	}
});