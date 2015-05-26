# deep-views

- Views controller
- directives-to-dom-composer parser 
- dom-protocol 

Views related scripts and controlers that use [deepjs](https://github.com/deepjs/deepjs) tools and patterns.

They have been developed to be absolutly __isomorphic__, which mean that they could be executed client side (single "async process") or server side (concurrent async "processes") __without any change__, and could be used to obtain __real-SEO-in-a-minute__.

It has first been designed to be easily used __alone__ (i.e. without routers) from anywhere (browser console or nodejs repl or ...).

It has also been designed to be easily used through inversion of controls mecanism, as routers (expressjs, angular, or [deep-routes](https://github.com/deepjs/deep-routes) - see by example : simple deep-views/expressjs). 

It particulary fits well with [deep-routes](https://github.com/deepjs/deep-routes) and its structured map.



## Install

deep-views is avaiable as an AMD/CommonJS module which could be install with npm or bower :

```
npm i --save deepjs deep-views
```
or

```
bower i --save deepjs deep-views
```


## Examples

The aim is to write things like this : 
```javascript
new deep.View({
	data: "json::/json/profile.json",
	how: "marked::/templates/my-template.html",
	where: "dom.htmlOf::body",
	done: deep.compose.dom().applyDirectives().relink("a")
})
.refresh()
.log();
```

But lets start from the beginning....

A Really Simple view :
```javascript
var deep = require("deepjs");
require("deep-views/index");

var view = new deep.View({
	how: function(ctx){
		return "<b>Hello " + ctx.params.fullName + "</b>";
	},
	// "rendered" is the result returned by "how".
	// "oldDomElem" is the dom element ref inserted on previous refresh (if any).
	where: function(rendered, oldDomElem){
		var elem = document.getElementById( 'content' )
		elem.innerHTML = rendered;
		return elem; // do not forget to return current dom elem ref.
	}
});

// provided argument is placed as "params" in how context
view.refresh({ fullName:"Bloupy Goldberg" });
```

You could use a "dom-protocol" to declare where you want to place view's output.
Example in the browser with jquery loaded : 
```javascript
define(["require", "deepjs/deep", "deep-views/lib/jquery-dom", "deep-views/index"],
function(require, deep, jqueryDom){

	// define dom protocol
	deep.protocols.dom = jqueryDom;

	// bind jquery reference to deep.$ (it will be used by jquery-dom)
	deep.context("$", $);

	var view = new deep.View({
		// you could also place, for test and fast dev, some html directly in how.
		how: "<b>Hello my friend</b>",
		where: "dom.htmlOf::#content"
	});

	view.refresh();
});
```

"data" is placed in "how" context.
```javascript
new deep.View({
	data: {
		fullName:"John Rambo"
	},
	how: function (ctx) {
		return "<b>Hello " + ctx.data.fullName + "</b>";
	},
	where: "dom.replace::#content"
})
.refresh();
```

"data" and "how" could be "loadable" (see [deep-protocols](https://github.com/deepjs/deep-protocols)).
```javascript
// npm i --save deepjs cheerio deep-views deep-marked deep-jquery-http
var deep = require("deepjs"), // core
	cheerio = require("cheerio"); // lightweight jquery like for nodejs
require("deep-views/index"); // views

// dom access protocol
deep.protocols.dom = require("deep-views/lib/jquery-dom");
// browser side marked template protocol
deep.protocols.marked = new require("deep-marked/lib/jq-ajax")(); // server side use : deep-marked/lib/nodejs
// browser side json protocol 
deep.protocols.json = new require("deep-jquery-http/lib/json")(); // server side use : deep-node/lib/rest/file/json
// bind cheerio instance to deep.$
deep.context("$", cheerio.load('<html><head></head><body></body></html>'));

// somewhere else in your code
new deep.View({
	data: "json::/json/profile.json",
	how: "marked::/templates/my-template.html",
	where: "dom.htmlOf::body"
})
.refresh();
```
 
"data" could be deeply structured. Every loadable string (with a valid protocol in front) will be replaced by its result. 
```javascript
new deep.View({
	data: { 
		profile:"json::/json/profile.json",
		something:"json::/json/some-datas-as-array.json",
		author:"Bloupi Goldberg"
	},
	how: function (ctx) {
		var res = "<h1>Hello " + ctx.data.profile.fullName + "</h1>"
		res += "\n<div>" + ctx.data.something.list.join(", ") + "</div>";
		res += "\n<div>" + ctx.data.author + "</div>";
		return res;
	},
	where: "dom.appendTo::#content"
});
```


"done" is executed after "where". Use it to add custom behaviour.
```javascript
new deep.View({
	data: "json::/json/profile.json",
	how: "swig::/templates/simple-template.html",
	where: "dom.appendTo::#content",
	done: function (renderObject) {
		deep.$(renderObject).find("#something").click(function () {
			window.alert("You clicked.");
		});
	}
});
```

A "condition" entry could be added : 
```javascript
var view = new deep.View({
	condition:function(renderObject){
		if(renderObject.params.id)
			return true;
		return false; // do not render
	},
	how: "swig::/templates/simple-template.html",
	where: "dom.appendTo::#content"
});

view.render({ id:"12" });
```


A "config" entry could be added : 
```javascript
var view = new deep.View({
	config:{
		scope:"browser", // or "both" (default), or "server"
		relink:false	// relink any anchor tag resent in rendered output to deeplink engine
	},
	how: "swig::/templates/simple-template.html",
	where: "dom.appendTo::#content"
});
```

## RESTful paradigm

For concurrency compliance (server side), they have been designed to __never hold any state__.
Client side, it only holds the inserted/updated dom element(s) between render call, which allow us to refresh selected portion of UI, or to remove nicely element from dom when needed.

It tries to follow the RESTful paradigm which says that produced result should only depend on a __limited set of external parameters__ (from route parsing by example) and __never from internal particular state__.

> One routes (so one set of parameters) = One state.

And never :

> Internal state + route = Another state.

You could always use an external persistent store to get or save complementary data that is needed to perform rendering, and which must only depend on provided external parameters (e.g. from route parsing and session).




## Full description

```javascript
var view = new deep.View({
	// ___________ Optional "descriptive" API and settings (by default none of them are defined)
	config:{
		scope:"browser", // Or "both" (default), or "server"
		relink:false	// default true. Relink any anchor tag resent in rendered output to deeplink engine
	},
	condition:function(renderObject){
		return true;
	},
	init:function(){
		// init views (bind event listeners, ...);
		// fired each time that view will be placed in dom. 
		// (if you refresh a view that is already in dom : it is not fired)
		// executed before load.
	},

	// data to load and/or render
	data:/*...*/,
	
	// how to render datas
	how: function (renderObject){
		return something;
	},
	
	// where to place rendered output (in dom)
	where: function ( renderedString, oldDomElem ){
		// do as you want.
		return placed_dom_element;
	},
	
	done: function ( renderObject ) {
		// "done" handler of whole render sequence.
		// executed after placement in dom.
	},
	
	fail: function ( renderObject, error ) {
		// manage any error from load/render sequence.
	},
	
	clean: function ( renderObject ){
		// remove event listeners
		// fired after dom removal
		// only called client side
	},
	// ______________________________________________________________________________________________________
	// _____ Main views API methods provided by deep.View class. Do not overload them before reading further.
	// _____ They are listed here to explain what they do.
	//
	// __ Main and only method you should call directly on a view
	refresh : function(params){ /* init if necessary, do load then apply render */ },
	// __ Internal function used by refresh and IOC-controllers
	load:	function(renderObject){ /* load : "data", "how" and "where" if necessary */ },
	render: function(renderObject){ /* apply : "how" then "where" then "done"/"fail" */ }
	remove: function(renderObject){ /* only called client side : remove placed element from DOM then call "clean" */ }
});
view.refresh();
```




## Events and equivalent

As deep-views are made to be runned in a concurrent environnement (aka nodejs as a server), there is no Event Emitter include in view controler.

When you want to specify behaviour as "afterLoad", "beforeRemove" or "beforeInit" (by example), you could simply use deep.composition ([see decompose](https://github.com/nomocas/decompose)).

```javascript
var view = new deep.View({
	how:"<div>hello world</div>",
	where"dom.prependTo::#content",
	render:deep.compose().after(function(renderObject){
		// do something after render and so after done
	}),
	remove:deep.compose().before(function(renderObject){
		// do something before remove
	})
});

view.refresh();
```




## Directives

Directives could be used with views html output.




## Licence

The [MIT](http://opensource.org/licenses/MIT) License

Copyright (c) 2015 Gilles Coomans <gilles.coomans@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



