/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep"], function(require, deep){
	deep.compose.dom = deep.compose.dom || {};
	var DomComposer = deep.compose.dom.Composer = new deep.Composer(deep.compose.dom);	// create composer manager for namespace deep.sheet 
	var Args = deep.Arguments;
	DomComposer.add("inPlaceEditable", "after", function() {
		return function(entry, options) {
			console.log("In place editable enhancement")
			return Args([entry, options]);
		};
	});
	DomComposer.add("hide", "after", function() {
		return function(entry, options) {
			// console.log("dom hide")
			deep.$(entry).hide();
			return Args([entry, options]);
		};
	});
	DomComposer.add("show", "after", function() {
		return function(entry, options) {
			// console.log("dom show")
			deep.$(entry).show();
			return Args([entry, options]);
		};
	});
	DomComposer.add("fadeIn", "after", function(ms) {
		return function(entry, options) {
			deep.$(entry).fadeIn(ms);
			return Args([entry, options]);
		};
	});
	DomComposer.add("click", "after", function(handler, args) {
		// console.log('csheeter click 1 : ', handler, args);
		return function(entry, context) {
			// console.log("sheeter.click : entry, context, handler, args : ", entry, context, handler, args)
			var $ = deep.$();
			var self = this;
			$(entry).click(function(e){
				if(typeof handler === 'function')
					return handler.call(self, this, e);
				if(e && e.preventDefault)
					e.preventDefault();
				self[handler].apply(self, args || []);
				return false;
			});
		};
	});
	DomComposer.add("each", "after", function(handler) {
		return function(entry, context) {
			var $ = deep.$(),
				promises = [];
			var self = this;
			$(entry).each(function(){
				promises.push(handler.call(self, this));
			});
			return deep.all(promises)
			.when(Args([entry, context]))
		};
	});
	DomComposer.add("find", "after", function(selector) {
		return function(entry, context) {
			return Args([deep.$(entry).find(selector), context]);
		};
	});
	//____________________________________________________________________ STILL TO IMPLEMENT AND TEST
	DomComposer.add("control", "after", function(from) {
		return function(node, context) {
			var $ = deep.$(),
				controller = this;
			var d = deep.nodes({});
			return d.up.apply(d, from.split(","))
			.done(function(ctrl) {
				if (!ctrl)
					return deep.errors.Internal("dp-control has retrieved nothing");
				var config = ctrl.config || {};
				if (config.scope && config.scope != "both")
					if (deep.context("isServer")) {
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
			})
			.when(Args([node, context]));
		};
	});
	DomComposer.add("from", "after", function(path) {
		return function(node, context) {
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
				});
		};
	});

	return deep.compose.dom;
});