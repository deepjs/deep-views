/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Views controller using deepjs tools and methods
 * Licence : MIT
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./directives", "deepjs/lib/deepload"], function(require, deep, directives) {
	"use strict";

	deep.ui = deep.ui || {};

	/**
	 * view refresh sequence : arg = route params
	 * 	if(!initialised)
	 * 		init()
	 * 	then
	 * 		load(params);
	 * 			deepLoad data, how, where
	 * 		render(loaded);
	 * 			how(context);
	 * 		 	where(context);
	 * 		  	enhance(context);
	 * 		   	done(context);
	 *
	 * View remove sequence :
	 * 		remove each subs
	 * 		remove each dp-controlled
	 * 		remove html node
	 * 		clean();
	 */

	var applyRender = function(self, loaded, routeMatch, params) {
		// console.log("view render : ", loaded)
		if (!loaded)
			return;
		var config = self.config || {},
			isServer = deep.context("isServer");
		if (self._deep_controlled_) {
			for (var i in self._deep_controlled_)
				self._deep_controlled_[i].remove();
			self._deep_controlled_ = null;
		}
		var data = null,
			how = null,
			where = null,
			rendered = null,
			placed = null;
		if (loaded.data)
			data = loaded.data;
		if (loaded.how)
			how = loaded.how;
		if (loaded.where)
			where = loaded.where;
		data = (data && data._deep_query_node_) ? data.value : data;
		how = (how && how._deep_query_node_) ? how.value : how;
		where = (where && where._deep_query_node_) ? where.value : where;

		if (data && data._deep_ocm_)
			data = data();
		if (how && how._deep_ocm_)
			how = how();
		if (where && where._deep_ocm_)
			where = where();

		loaded.data = data;
		loaded.how = how;
		loaded.where = where;
		loaded.params = params;

		placed = self.placed ? self.placed() : null;

		loaded.placed = placed;
		loaded.ctrl = self;
		// console.log("render with : how : ", how, data)
		//console.log("data : ", data);
		// console.log("HOW : ", how);
		if (routeMatch) {
			loaded.route = routeMatch;
		}
		if (typeof how === 'function')
			rendered = loaded.rendered = how.call(self, loaded);
		else if (how)
			rendered = loaded.rendered = how;
		else if (data)
			rendered = loaded.rendered = data;
		if (where && typeof where === 'function')
			placed = loaded.placed = where.call(self, loaded.rendered, loaded.placed);
		else if (typeof jQuery !== 'undefined' && where instanceof jQuery)
			placed = loaded.placed = where;
		else if (typeof where === 'string' && deep.Promise.context.$)
			placed = loaded.placed = deep.Promise.context.$(where);
		/*else
			placed = loaded.placed = null;*/

		if (placed && !isServer)
			self.placed = function() {
				// console.log("store placed : ", placed)
				return placed;
			};

		var promise = null;
		if (config.enhance !== false && placed && deep.Promise.context.$) {
			//console.log("view placed : placed = ", placed);					
			if (placed._deep_html_merged_) {
				var subprom = [];
				for (var i in placed) {
					if (i === '_deep_html_merged_')
						continue;
					subprom.push(deep.ui.applyDirectives(self, placed[i], loaded))
				}
				promise = deep.all(subprom);
			} else
				promise = deep.ui.applyDirectives(self, placed, loaded);
		}

		//console.log("rendered : ", loaded);
		if (promise)
			return promise
				.done(function() {
					if (config.relink !== false && !isServer && placed && self.relink)
						self.relink(placed);
					if (typeof self.done === "function") {
						var done = self.done;
						if (done._deep_ocm_)
							done = done();
						return done.call(self, loaded) || loaded;
					}
					return loaded;
				})
				.fail(function(e) {
					if (typeof self.fail === 'function')
						return self.fail(e) || e;
					return e;
				});

		//if(config.relink == false)
		//	console.log("skip relink on : ", self);
		if (config.relink !== false && !isServer && placed && self.relink)
			self.relink(placed);
		if (typeof self.done === "function") {
			var done = self.done;
			if (done._deep_ocm_)
				done = done();
			return done.call(self, loaded) || loaded;
		}
		return loaded;
	};


	deep.View = deep.Classes(function(layer) {
		if (layer)
			deep.aup(layer, this);
	}, {
		_deep_view_: true,
		fail: function(renderObject, error) {
			var $ = deep.$();
			if (deep.context("debug"))
				deep.utils.dumpError(error);
			if (!renderObject.where)
				return error;
			var whereType = typeof renderObject.where;
			if (whereType === 'string')
				$(renderObject.where).html(error.toString());
			else if (whereType === 'function')
				renderObject.where(error.toString());
			return error;
		},
		addSubControlled: function(ctrl) {
			var label = "view" + Date.now().valueOf();
			this._deep_controlled_ = this._deep_controlled_ || {};
			this._deep_controlled_[label] = ctrl;
		},
		remove: function() {
			//console.log("VIEW REMOVE : ", this.placed);
			if (this.subs)
				for (var i in this.subs)
					this.subs[i].remove();
			if (this._deep_controlled_) {
				for (var i in this._deep_controlled_)
					this._deep_controlled_[i].remove();
				this._deep_controlled_ = null;
			}
			if (this.placed) {
				// console.log("remove node : ", this, this.placed())
				deep.$(this.placed()).remove();
			}
			if (this.clean)
				this.clean();
			this.prepared = false;
			this.placed = null;
		},
		load: function(opt) {
			opt = opt || {};
			var params = opt.params,
				config = this.config || {},
				isServer = deep.context("isServer");
			//if (params && Object.keys(params).length === 0)
			//	params = null;
			if (config.scope && config.scope != "both")
				if (isServer) {
					if (config.scope != "server")
						return;
				} else if (config.scope != "browser")
				return;
			var self = this;
			if (this.init && !this.initialised)
				return deep.when(this.init())
					.done(function(success) {
						self.initialised = true;
						return self.load(opt);
					});
			var promises = [],
				ctx = {
					params: params,
					context: deep.context(),
					ctrl: self
				};

			if (this.data)
				promises.push(deep.nodes(this).find("./data").deepLoad(ctx, false));
			else
				promises.push(null);

			if (typeof this.how === 'string')
				promises.push(deep.nodes(this).find("./how").deepLoad(ctx, false, true));
			else
				promises.push(this.how);

			if (this.where)
				if (typeof this.where === 'string')
					promises.push(deep.nodes(this).find("./where").deepLoad(ctx, false, true));
				else
					promises.push(this.where);

				// console.log("launch deep load");
			return deep.all(promises)
				.done(function(res) {
					//console.log("view deep load : res  : ", res);
					var result = {
						_deep_render_node_: true,
						data: res[0],
						how: res[1],
						where: res[2],
						params: params
					};
					// console.log("view deep load done : ", self.how);
					return result;
				})
				.fail(function(e) {
					if (typeof self.fail === 'function')
						return self.fail(e) || e;
					return e;
				});
		},
		render: function(loaded, routeMatch, params) {
			try {
				return applyRender(this, loaded, routeMatch, params);
			} catch (e) {
				if (this.fail)
					return this.fail(e) || e;
				return e;
			}
		},
		refresh: function(arg) {
			var config = this.config || {},
				isServer = deep.context("isServer");
			if (config.scope && config.scope != "both")
				if (!isServer) {
					if (config.scope != "browser")
						return;
				} else
			if (config.scope != "server")
				return;
			// console.log("view refresh : params : ", params, " - loaded : ", loaded);
			var self = this;
			if (this.init && !this.initialised)
				return deep.when(this.init())
					.done(function(success) {
						self.initialised = true;
						return self.refresh(arg);
					});
			var loaded, params, routeMatch;
			if (arg) {
				if (arg._deep_render_node_) {
					loaded = arg;
					params = loaded.params;
				} else if (arg._deep_matched_node_) {
					loaded = arg.loaded;
					params = arg.output;
					routeMatch = arg;
				} else
					params = arg;
			}
			params = params || this.params;
			if (params && !isServer)
				this.params = params;


			var p;
			if (loaded)
				p = deep.when(this.render(loaded, routeMatch, params))
				.fail(function(e) {
					if (typeof self.fail === 'function') {
						var fail = self.fail;
						if (fail._deep_ocm_)
							fail = fail();
						return fail.call(self, e) || e;
					}
				});
			else
				p = deep.when(this.load({
					params: params
				}))
				.done(function(loaded) {
					return self.render(loaded, routeMatch, params);
				})
				.done(function(s) {
					return s[0];
				})
				.fail(function(e) {
					if (typeof self.fail === 'function') {
						var fail = self.fail;
						if (fail._deep_ocm_)
							fail = fail();
						return fail.call(self, e) || e;
					}
				});
			return p;
		},
		relink: function(selector) {
			if (deep.context("isServer"))
				return;
			var app = deep.currentApp(),
				$ = deep.$();
			if (!$)
				return;
			$(selector)
				.find(this.relinkSelector || "a")
				.each(function() {
					if (this._deep_rerouted_)
						return;
					this._deep_rerouted_ = true;

					var uri = $(this).attr("href");
					if (!uri)
						return;
					if (uri.substring(0, 4) === 'http')
						return;
					if (uri[0] == '/' && uri[1] == '/') // file
						return;
					// console.log("RELINK : ", uri, this);
					$(this).click(function(e) {
						if (e && e.preventDefault)
							e.preventDefault();
						if (window.history && window.history.pushState) {
							if (uri === window.history.location.path)
								return false;
							// deep.debug("add entry in history for : ", uri);
							window.history.pushState({}, this.title || document.title, uri);
						}
						deep.app(app).get(uri).elog();
						return false;
					});
				});
		}
	});

	deep.View.relink = function(selector, relinkSelector) {
		// console.log("relink : ", selector);
		return deep.View.prototype.relink.call({
			relinkSelector: relinkSelector
		}, selector);
	};
	deep.coreUnits = deep.coreUnits || [];
	deep.coreUnits.push("js::deep-views/units/views");
	return deep.View;
});
