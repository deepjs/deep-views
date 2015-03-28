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
	DomComposer.add("directives", "after", function() {
		var argus = Args;
		return function(entry, context) {
			var args = Array.prototype.slice.apply(argus), name = args.shift();
			var directive = deep.ui.directives[name];
			if(!directive)
				return deep.errors.View("missing directive : " + name);
			var $ = deep.$(),
				promises = [],
				self = this;
			args.unshift(this, context);
			$(entry).each(function(){
				args[0] = this;
				var r = directive.apply(self, args);
				if(r && r.then)
					promises.push(r);
			});
			if(promises.length)
				return deep.all(promises)
				.when(Args([entry, context]));
		};
	});
	//____________________________________________________________________ STILL TO IMPLEMENT AND TEST
	DomComposer.add("control", "after", function(controller) {
		return function(entry, context) {
			var $ = deep.$(),
				promises = [];

			$(entry).each(function(node){

			});
			return deep.all(promises)
			.when(Args([entry, context]));
		};
	});	
	DomComposer.add("sheet", "after", function() {
		var controllers = Args;
		return function(entry, context) {
			var $ = deep.$(),
				promises = [];

			$(entry).each(function(node){

			});
			return deep.all(promises)
			.when(Args([entry, context]));
		};
	});
	return deep.compose.dom;
});