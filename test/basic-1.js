var tape= require('tape'),
  CoGenFactory= require('..')

function fixtureGenerator(b){
	var factoryRef= 0
	function*gen(a){
		factoryRef++
		yield a||1
		factoryRef++
		yield 101
		factoryRef++
		yield 1101
		factoryRef++
	}
	gen.ref= function(){
		return factoryRef
	}
	return gen
}



tape('run factory', function(t){
	var gen= fixtureGenerator()
	var factory= CoGenFactory(gen)()
	t.equal(factory(), 1, 'pulls a first value')
	t.equal(factory(), 1, 'maintains first value')
	t.equal(factory(), 1, 'maintains first value again')
	factory.clear()
	t.equal(factory(), 101, 'advances to next item')
	t.equal(factory(), 101, 'maintains second item')
	factory.clear()
	t.equal(factory(), 1101, 'advances to third item')
	t.equal(factory(), 1101, 'maintains third item')
	factory.clear()
	t.equal(factory(), 1, 'starts over')
	t.end()
	

	/*
	factory(function(a,b){
		console.log("out-a", a,b)
		factory(function(c,d){
			console.log("out-c", c,d)
			factory.clear()
			factory(function(e,f){
				console.log("out-e", e,f)
			})

		})
	})
	*/
})

tape('interlocked', function(t){
	var gen= fixtureGenerator()
	var factory= CoGenFactory(gen)
	var f1= factory()
	var f2= factory()
	t.equal(f1(), 1, 'pulls a first value')
	t.equal(f1(), 1, 'maintains first value')
	t.equal(f2(), 1, 'maintains first value again')
	f2.clear()
	t.equal(f1(), 101, 'advances to next item')
	t.equal(f2(), 101, 'maintains second item')
	f1.clear()
	t.equal(f1(), 1101, 'advances to third item')
	t.equal(f2(), 1101, 'maintains third item')
	f2.clear()
	t.equal(f1(), 1, 'starts over')
	t.end()
})

tape('clear clears, but doesnt double clear', function(t){
	var factory= CoGenFactory(fixtureGenerator())
	var f1= factory()
	t.equal(f1(), 1, 'pulls a first value')
	f1.clear()
	t.equals(f1(), 101, 'pulls second value')
	f1.clear()
	f1.clear()
	t.equals(f1(), 1101, 'double clear only clears once')
	f1.clear()
	f1.clear()
	t.equals(f1(), 1, 'pulls first value again')
	t.end()
})

tape('separate instances', function(t){
	var f1= CoGenFactory(fixtureGenerator())()
	var f2= CoGenFactory(fixtureGenerator())()
	t.equal(f1(), 1, 'pulls a first value')
	f1.clear()
	t.equals(f2(), 1, 'second factory is decoupled')
	t.end()
})

tape('separate invocations', function(t){
	var factory= CoGenFactory(fixtureGenerator())
	var f1= factory()
	var f2= factory(22)
	t.equal(f1(), 1, 'pulls a first value')
	t.equals(f2(), 22, 'second factory is decoupled')
	f1.clear()
	t.equals(f2(), 22, 'second factory is decoupled')
	f1.clear()
	f2.clear()
	t.equals(f1(), 101, 'pulls second value')
	t.end()
})
