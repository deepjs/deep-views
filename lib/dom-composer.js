/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep"], function(require, deep) {
	var Args = deep.Arguments;
	var api = {
		hide: function() {
			return this.after(function(renderNode, entry) {
				if (deep.context("isServer"))
					return Args([renderNode, entry]);
				deep.$(entry || renderNode).hide();
				return Args([renderNode, entry]);
			});
		},
		show: function() {
			return this.after(function(renderNode, entry) {
				// console.log("dom show")
				if (deep.context("isServer"))
					return Args([renderNode, entry]);
				deep.$(entry || renderNode).show();
				return Args([renderNode, entry]);
			});
		},
		fadeIn: function(ms) {
			return this.after(function(renderNode, entry) {
				if (deep.context("isServer"))
					return Args([renderNode, entry]);
				deep.$(entry || renderNode).fadeIn(ms);
				return Args([renderNode, entry]);
			});
		},
		fadeOut: function(ms) {
			return this.after(function(renderNode, entry) {
				if (deep.context("isServer"))
					return Args([renderNode, entry]);
				deep.$(entry || renderNode).fadeOut(ms);
				return Args([renderNode, entry]);
			});
		},
		click: function() {
			var args = Array.prototype.slice.call(arguments);
			return this.after(function(renderNode, entry) {
				if (deep.context("isServer"))
					return Args([renderNode, entry]);
				var self = this,
					handler = args.shift();
				// console.log('click : ', self, handler, args);
				deep.$(entry || renderNode)
					.click(function(e) {
						var ar = [renderNode, this, e].concat(args);
						if (typeof handler === 'function')
							return handler.apply(self, ar) || true;
						return self[handler].apply(self, ar) || true;
					});
			});
		},
		each: function(handler) {
			return this.after(function(renderNode, entry) {
				var promises = [],
					self = this;
				deep.$(entry || renderNode).each(function() {
					promises.push(handler.call(self, this));
				});
				return deep.all(promises)
					.when(Args([renderNode, entry]))
			});
		},
		find: function(selector) {
			return this.after(function(renderNode, entry) {
				return Args([renderNode, deep.$(entry || renderNode).find(selector)]);
			});
		},
		from: function(path) {
			return this.after(function(renderNode, node) {
				var controller = this;
				return deep.getAll(path.split(","))
					.done(function(result) {
						var $ = deep.$();
						//console.log("dp-from ", from," : get : ", result)
						if (typeof result === 'function')
							$(node || renderNode).html(result(renderNode));
						else
							$(node || renderNode).html(result.join("\n"));
					})
					.when(Args([renderNode, node]));
			});
		}
	};
	deep.compose.dom = new deep.compose.Composer(api); // create composer manager for namespace deep.sheet 
	return deep.compose.dom;
});
