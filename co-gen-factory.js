var memoizee= require('memoizee'),
  memoizeeMethods= require('memoizee/methods')


var Generator = typeof GeneratorFunction !== 'undefined' ? GeneratorFunction : (function*(){yield undefined}).constructor

/**
  Create a factory 
*/
function factoryGen(_gen, _opts){
	var memoized= memoize(function(){
		var gen= _gen.apply(this, arguments)
		if(gen instanceof Generator){
			return gen
		}else if(gen instanceof Function){
			return gen.apply(this, arguments)
		}
	}, _opts)

	function *factoryGen(){
		while(true){
			var iter = memoized.apply(this, arguments)
			if(!iter || !iter.next){
				memoized.delete.apply(memoized, arguments)
				yield undefined
				continue
			}

			var val = iter.next()
			if(val.done){
				memoized.delete.apply(memoized, arguments)
				continue;
			}

			val= val.value
			if(val && _opts.memoizeMethods){
				Object.defineProperties(val.value, memoizeMethods(_opts.memoizeMethods))
			}
			yield val
		}
	}

	var factory = co(factoryGen)
	factory.clear=(function clear(){
		memoized.delete.apply(memoized, arguments)
	})
	return factory
}
