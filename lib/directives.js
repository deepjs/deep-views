/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * dom directives for deepjs views controller.
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deepjs/lib/utils", "./dom-sheeter","deepjs/lib/errors"], function(require, deep, utils, DomSheeter, errors){

/*
<div dp-enhancements="from(json::./hello.json) code-try  click(ploum) sheets(js::./mysheet.js)">
*/
	deep.ui.directives = {
		from: function(node, context, path) {
			var $ = deep.$();
			var controller = this;
			return deep.getAll(path.split(","))
				.done(function(result) {
					//console.log("dp-from ", from," : get : ", result)
					if (typeof result === 'function')
						$(node).html(result({
							_ctrl: controller
						}));
					else
						$(node).html(result);
					return deep.ui.enhance(controller, node, context);
				});
		},
		sheets: function(node, context, from) {
			var $ = deep.$();
			var controller = this;
			return deep.getAll(from.split(","))
				.done(function(results) {
					results.unshift({});
					return deep.sheet(node, deep.up.apply(deep, results));
				});
		},
		control: function(node, context, from) {
			// console.log("directives control : ", node, context, from);
			var $ = deep.$(),
				controller = this;
			var d = deep({});
			return d.up.apply(d, from.split(","))
			.done(function(ctrl) {
				if (!ctrl)
					return deep.errors.Internal("dp-control has retrieved nothing");
				var config = ctrl.config || {};
				if (config.scope && config.scope != "both")
					if (!deep.isBrowser) {
						if (config.scope != "server")
							return;
					} 
					else if (config.scope != "browser")
						return;
				if(controller && controller.addSubControlled)
					controller.addSubControlled(ctrl);
				ctrl.placed = function() {
					return node;
				};
				return ctrl.refresh();
			});
		},
		click: function(node, context, action, args) {
			if (!deep.isBrowser)
				return;
			var controller = this;
			if(!controller)
				return;
			if (args)
				args = args.split(",");
			else
				args = []
			var $ = deep.$();
			$(node).click(function(e) {
				e.preventDefault();
				if(!controller[action])
					throw new Error("no method found in control with : "+action);
				controller[action].apply(controller, args);
				return false;
			});
		}
	}

	var cache = {};

	// should use mp-lex/lib/parser/directive
	deep.ui.parseDirectives = function(directives){
		if(cache[directives])
			return cache[directives];
		var splitted = directives.split(/[\s]+/);
		var sheeter = DomSheeter.create();
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
			if(!deep.ui.directives[enhancer])
			{
				deep.warn("missing ui enhancer : ",enhancer);
				continue;
			}
			args.unshift(enhancer);
			sheeter.enhance.apply(sheeter, args);
		}
		cache[directives] = sheeter;
		return sheeter;
	};
	deep.ui.enhance = function(ctrl, selector, context) {
		var promises = [];
		ctrl = ctrl || {};
		var $ = deep.$();
		$(selector)
		.find(".dp-enhance")
		.each(function(index, element) {

			var scope = $(this).attr("dp-scope");
			if (scope && scope != 'both' && (scope == 'browser' && !deep.isBrowser) || (scope == 'server' && deep.isBrowser))
				return;
			var enhancements = $(this).attr("dp-enhancements");
			if(deep.isBrowser || (scope == "server" && !deep.isBrowser))
				$(this).removeClass("dp-enhance").removeAttr("dp-enhancements");
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