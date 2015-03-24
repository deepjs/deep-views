if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep"], function(require, deep) {
	var unit = {
		title: "deep-views/units/views",
		stopOnError: false,
		setup: function() {
		},
		tests: {
			how: function() {
				return new deep.View({
					how:"hello"
				})
				.refresh()
				.done(function(output){
					return output.rendered;
				})
				.equal("hello");
			},
			where: function() {
				var view = new deep.View({
					how:"hello",
					where:function(rendered, node){
						return { wasPlaced:true, value:rendered };
					}
				})
				return view.refresh()
				.done(function(output){
					return output.placed;
				})
				.equal({ wasPlaced:true, value:"hello" })
				.done(function(){
					return view.placed();
				})
				.equal({ wasPlaced:true, value:"hello" });
			},
			whereTwice: function() {
				var view = new deep.View({
					how:"hello",
					where:function(rendered, node){
						return { wasPlaced:true, value:rendered, old:(node && node.value=='hello')?true:false };
					}
				})
				return view.refresh()
				.done(function(output){
					return output.placed;
				})
				.equal({ wasPlaced:true, value:"hello", old:false })
				.done(function(){
					return view.refresh();
				})
				.done(function(output){
					return output.placed;
				})
				.equal({ wasPlaced:true, value:"hello", old:true });
			},
			params: function() {
				var view = new deep.View({
					how:"hello { params.test }"
				})
				return view.refresh({ test:"world" })
				.done(function(output){
					return output.rendered;
				})
				.equal("hello world");
			},
			whatHideParams: function() {
				var view = new deep.View({
					what:{ test:"from what" },
					how:function(node){ return "hello "+node.what.test; }
				})
				return view.refresh({ test:"world" })
				.done(function(output){
					return output.rendered;
				})
				.equal("hello from what");
			},
			whatLoaded: function() {
				var view = new deep.View({
					what:"dummy::hello",
					how:function(node){ return "from how : "+node.what; }
				})
				return view.refresh({ test:"world" })
				.done(function(output){
					return output.rendered;
				})
				.equal("from how : You say 'hello' through dummy protocol");
			},
			howNonDestructive:function(){
				var view = new deep.View({
				    how:"dummy::hello"
				});
				return view.refresh({})
				.done(function(s){
				    return view.how;
				})
				.equal("dummy::hello");
			}
		}
	};
	return unit;
});