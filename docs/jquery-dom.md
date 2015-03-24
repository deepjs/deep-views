

# deep.jquery

jquery/deepjs related tools for isomorphic dom manipulation.

Using [cheerio](https://github.com/MatthewMueller/cheerio) server side, and jquery browser side.


## Setting $ reference

Before all, you should provides to deep the loaded jquery reference. It allow isomorphic design of your views or dom manipulation.

Example :
```javascript
var deep = require("deepjs/deep");
require("deep-views/lib/jquery-dom"); // isomorphic manager (provides deep.$ api)
deep.$($); // here we set $ reference from the global one loaded in page (browser case)
```

Server side, if you use autobahnjs you have nothing to do. It automaticaly set $ reference with a cheerio instance associated to the current request.

## Using $ reference

When using deep.$("...") ___after___ setting current jquery reference (or in autobahnjs html render engine), you should not worried about in which context do you apply your selection. Either it's browser side and you manipulate main browser window. Either it's server side and you manipulate you current request's "window".

Following this, you obtain clear and isomorphic code, that could be runned safely without any change browser side or server side.

```javascript
var deep = require("deepjs/deep");
require("deep-views/lib/jquery-dom"); // isomorphic manager
deep.$(...); // bind your jquery ref.


// somewhere in your code
deep.$("#content") // return jquery selection handler from current window
.find("...")
.each(function(i, e){ /*...*/ })
...

```


## using DOM api

* dom.htmlOf
* dom.appendTo
* dom.prependTo
* dom.replace


```javascript
var deep = require("deepjs/deep");
require("deep-views/lib/jquery-dom"); // isomorphic manager

deep.jquery.dom(); // set default dom protocol

deep.$($); // here we set $ reference from the global one loaded in page

var myDomHandler = dep.jquery.appendTo("#mySelector");

var domElement = myDomHandler("my rendered output"); // will append "my rendered output" to "#mySelector" and return added dom element.

```

You will certainly never use it as this. In place, you will using it through protocols in conjonction with deep-views.


```javascript
var deep = require("deepjs/deep");
require("deep-views/index");
require("deep-views/lib/jquery-dom")(); // load and set default dom protocol

deep.$($); // we set $ reference from the global one, loaded in page.

var view = deep.View({
	how:function(){
		return "my result";
	},
	where:"dom.htmlOf::#content"
});

view.refresh();
```
Will place "my result" in "#content"


## Licence

LGPL 3.0


