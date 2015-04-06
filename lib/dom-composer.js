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
		return function(entry, renderNode) {
			if(deep.context("isServer"))
				return Args([entry, renderNode]);
			console.log("In place editable enhancement")
			return Args([entry, renderNode]);
		};
	});
	DomComposer.add("hide", "after", function() {
		return function(entry, renderNode) {
			if(deep.context("isServer"))
				return Args([entry, renderNode]);
			deep.$(entry).hide();
			return Args([entry, renderNode]);
		};
	});

	DomComposer.add("show", "after", function() {
		return function(entry, renderNode) {
			// console.log("dom show")
			if(deep.context("isServer"))
				return Args([entry, renderNode]);
			deep.$(entry).show();
			return Args([entry, renderNode]);
		};
	});

	DomComposer.add("fadeIn", "after", function(ms) {
		return function(entry, renderNode) {
			if(deep.context("isServer"))
				return Args([entry, renderNode]);
			deep.$(entry).fadeIn(ms);
			return Args([entry, renderNode]);
		};
	});
	DomComposer.add("fadeIn", "after", function(ms) {
		return function(entry, renderNode) {
			if(deep.context("isServer"))
				return Args([entry, renderNode]);
			deep.$(entry).fadeIn(ms);
			return Args([entry, renderNode]);
		};
	});
	DomComposer.add("click", "after", function() {
		var args = Array.prototype.slice.call(arguments);
		return function(entry, renderNode) {
			if(deep.context("isServer"))
				return Args([entry, renderNode]);
			var self = this, handler = args.shift();
			// console.log('click : ', self, handler, args);
			deep.$(entry)
			.click(function(e){
				var ar = [this, renderNode].concat(args);
				if(typeof handler === 'function')
					return handler.apply(self, ar);
				self[handler].apply(self, ar);
				if(e && e.preventDefault)
					e.preventDefault();
				return false;
			});
		};
	});
	DomComposer.add("each", "after", function(handler) {
		return function(entry, renderNode) {
			var $ = deep.$(),
				promises = [];
			var self = this;
			$(entry).each(function(){
				promises.push(handler.call(self, this));
			});
			return deep.all(promises)
			.when(Args([entry, renderNode]))
		};
	});
	DomComposer.add("find", "after", function(selector) {
		return function(entry, renderNode) {
			return Args([deep.$(entry).find(selector), renderNode]);
		};
	});
	//____________________________________________________________________ STILL TO IMPLEMENT AND TEST
	DomComposer.add("from", "after", function(path) {
		return function(node, renderNode) {
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
		};
	});
	deep.ui.form = deep.ui.form || {};

	deep.ui.form.validate = function(selector, map, schema){
		var obj = {},
			map2 = deep.utils.copy(map);
		for (var i in map2){
			var input = map2[i] = deep.$(selector).find(map2[i]),
				val = deep.$(input).val();
			deep.utils.toPath(obj, i, val, ".");
		}
		var report = deep.validate(obj, schema);
		if(!report.valid)
		{
			report.inputs = [];
			for(var i in map2)
			{
				var errors = deep.utils.fromPath(report.errorsMap, i+".errors", ".");
				if(errors && errors.length)
					$(map2[i]).addClass("error");
				else
					$(map2[i]).removeClass("error");
				report.inputs.push({
					input: map2[i],
					errors: errors
				})
			}
			return deep.errors.PreconditionFail("composer.dom.validate", report);
		}
		for(var i in map2)
			$(map2[i]).removeClass("error");
		return obj;
	}
	return deep.compose.dom;
});