var memoizee= require('memoizee'),
  memoizeeMethods= require('memoizee/methods')

/**
  Create a factory 
*/
function factoryGen(_gen, _opts){
	var memoized= memoize(function(){
		return _gen.apply(this, arguments)
	}, _opts)

	function *factoryGen(){
		while(true){
			var iter = memoized.apply(this, arguments)
			if(!iter || !iter.next){
				memoized.delete.apply(memoized, arguments)
				yield null
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
