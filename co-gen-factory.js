var co= require('co'),
  memoizee= require('memoizee'),
  memoizeeMethods= require('memoizee/methods')


var Generator = typeof GeneratorFunction !== 'undefined' ? GeneratorFunction : (function*(){yield undefined}).constructor

/**
  Create a factory 
*/
function factoryGen(_gen, _opts){
	_opts= _opts|| {}

	/*
	_opts.async= true
	var memoized= memoizee(function(){
		var gen= _gen.apply(this, arguments)
		if(gen && gen.next){
			return gen
		}else if(gen instanceof Generator){
			return gen
		}else if(gen instanceof Function){
			return gen.apply(this, arguments)
		}else{
			return gen
		}
	}, _opts)

	function *factoryGen(){
		while(true){
			var iter = memoized.apply(this, arguments)
			if(!iter || !iter.next){
				memoized.delete.apply(memoized, arguments)
				continue
			}

			var val = iter.next()
			if(val.done){
				memoized.delete.apply(memoized, arguments)
				continue;
			}

			val= val.value
			if(val && _opts && _opts.memoizeMethods){
				Object.defineProperties(val.value, memoizeMethods(_opts.memoizeMethods))
			}
			return yield val
		}
	}

	var factory = function(done){
		co(factoryGen)(done)
	}

	//var factory= co(factoryGen)
	factory.clear=(function clear(){
		memoized.delete.apply(memoized, arguments)
	})
	return factory
	*/

	function factoryCo(done){
		var args= Array.prototype.slice.call(arguments, 0)
		if(_gen instanceof Generator){
			co(_gen).apply(this, args)
		}else{
			_gen.apply(this, args)
		}
	}
	var mCo= memoizee(factoryCo, {async:true})

	function factory(){
		var args= Array.prototype.slice.call(arguments, 0)
		  self= this

		var iter,
		  cursor
		function get(){
			while(!cursor){
				if(!iter){
					iter= _gen.apply(self, args)
				}
				cursor= iter.next()
				if(cursor.done){
					iter= null
					if(cursor.value === undefined){
						cursor= null
					}
				}
			}

			return cursor.value
		}
		get.clear= function(){
			cursor= null
		}
		return get
	}
	var m= memoizee(factory, {length: 12})
	m.clear=(function clear(){
		m.apply(m, arguments).clear()
	})


	//if(_gen instanceof Generator && false){
	//	mCo.flat= m
	//	return mCo
	//}else{
	//	m.co= mCo
	//	return m
	//}

	m.co= mCo
	return m
}

module.exports= factoryGen
