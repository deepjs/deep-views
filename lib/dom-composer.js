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
		inPlaceEditable: function() {
			return this.after(function(entry, renderNode) {
				if (deep.context("isServer"))
					return Args([entry, renderNode]);
				console.log("In place editable enhancement")
				return Args([entry, renderNode]);
			});
		},
		hide: function() {
			return this.after(function(entry, renderNode) {
				if (deep.context("isServer"))
					return Args([entry, renderNode]);
				deep.$(entry).hide();
				return Args([entry, renderNode]);
			});
		},
		show: function() {
			return this.after(function(entry, renderNode) {
				// console.log("dom show")
				if (deep.context("isServer"))
					return Args([entry, renderNode]);
				deep.$(entry).show();
				return Args([entry, renderNode]);
			});
		},
		fadeIn: function(ms) {
			return this.after(function(entry, renderNode) {
				if (deep.context("isServer"))
					return Args([entry, renderNode]);
				deep.$(entry).fadeIn(ms);
				return Args([entry, renderNode]);
			});
		},
		fadeOut: function(ms) {
			return this.after(function(entry, renderNode) {
				if (deep.context("isServer"))
					return Args([entry, renderNode]);
				deep.$(entry).fadeOut(ms);
				return Args([entry, renderNode]);
			});
		},
		click: function() {
			var args = Array.prototype.slice.call(arguments);
			return this.after(function(entry, renderNode) {
				if (deep.context("isServer"))
					return Args([entry, renderNode]);
				var self = this,
					handler = args.shift();
				// console.log('click : ', self, handler, args);
				deep.$(entry)
					.click(function(e) {
						var ar = [renderNode, this].concat(args);
						if (typeof handler === 'function')
							return handler.apply(self, ar);
						self[handler].apply(self, ar);
						if (e && e.preventDefault)
							e.preventDefault();
						return false;
					});
			});
		},
		each: function(handler) {
			return this.after(function(entry, renderNode) {
				var $ = deep.$(),
					promises = [];
				var self = this;
				$(entry).each(function() {
					promises.push(handler.call(self, this));
				});
				return deep.all(promises)
					.when(Args([entry, renderNode]))
			});
		},
		find: function(selector) {
			return this.after(function(entry, renderNode) {
				return Args([deep.$(entry).find(selector), renderNode]);
			});
		},

		//____________________________________________________________________ STILL TO IMPLEMENT AND TEST

		from: function(path) {
			return this.after(function(node, renderNode) {
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
					})
					.when(Args([node, renderNode]));
			});
		}
	};
	deep.compose.dom = new deep.compose.Composer(api); // create composer manager for namespace deep.sheet 
	return deep.compose.dom;
});