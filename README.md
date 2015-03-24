# deep-views

Views controller, dom directives and dom-sheets for deepjs

For [jquery dom manipulator](./docs/jquery-dom.md), take a look there.

Simple View :
```javascript
var deep = require("deepjs");
require("deep-views/index");
require("deep-views/lib/jquery-dom")("dom");

var view = deep.View({
	how: "<b>Hello my friend</b>",
	where: "dom.htmlOf::#content"
});

view.refresh();
```

"What" is injected in "how".
```javascript
var view = deep.View({
	what: {
		fullName:"John Rambo"
	},
	how: function (what) {
		return "<b>Hello " + what.fullName + "</b>";
	},
	where: "dom.replace::#content"
});
```

"What" could be loadable.
```javascript
var deep = require("deepjs"); // core
require("deep-views/index"); // views
require("deep-views/lib/jquery-dom")("dom"); // dom protocol

// browser side template and json client protocol
require("deep-marked/lib/jq-ajax")("marked"); // server side use : deep-marked/lib/nodejs
require("deep-jquery/lib/ajax/json")("json"); // server side use : deep-node/lib/rest/file/json

var view = deep.View({
	what: "json::/json/profile.json",
	how: "marked::/templates/my-template.html",
	where: "dom.prependTo::#content"
});
```

 
"What" could be deeply structured. every loadable string (with a valid protocol in front) will be replaced by its result. 
```javascript
var view = deep.View({
	what: { 
		datas:"json::/json/profile.json",
		otherDatas:"json::/json/comments.json"
	},
	how: "swig::/templates/simple-template.html",
	where: "dom.appendTo::#content"
});
```


"done" is executed after "where". Use it to bind custom behaviour.
```javascript
var view = deep.View({
	what: "json::/json/profile.json",
	how: "swig::/templates/simple-template.html",
	where: "dom.appendTo::#content",
	done: function (renderObject) {
		$(renderObject.placed).find("#fullname-span").click(function () {
			window.alert("You clicked on a name");
		});
	}
});
```


Full description :
```javascript
var view = deep.View({
	init:function(){
		// init views (bind event listeners, ...);
		// fired each time that view will be placed in dom. 
		// (if you refresh a view that is already in dom : it is not fired)
	},
	// what datas to render
	what:{ /*...*/ }
	// how to render datas
	how: function(what){
		return something;
	},
	// where to place rendered output (in dom)
	where: function( howOutput ){
		// do as you want.
		return placed_dom_element;
	},
	done: function ( renderedObject ) {
		// "done" handler of whole render sequence
		// do as you want.
	},
	fail: function ( renderedObject ) {
		// manage any error from load/render sequence.
	},
	clean: function(){
		// remove event listeners
		// fired when its removed from dom
	}
});
view.refresh();
```

 
A config entry could be added : 
```javascript
var view = deep.View({
	config:{
		scope:"browser", // or "both" (default), or "server"
		relink:false	// relink any anchor tag resent in rendered output to deeplink engine
	},
	how: "swig::/templates/simple-template.html",
	where: "dom.appendTo::#content"
});
```


Directives could be used with views html output.
Docs on directives and dom-sheets coming soon.

## Licence

LGPL 3.0
