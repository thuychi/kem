function async(fn){
	setTimeout(fn)
}

async.run = function(array){
	for(var i = 0, n = array.length; i < n; i++){
		setTimeout(array[i])
	}
}

async.each = function(array, fn){
	for(let i = 0, n = array.length; i < n; i++){
		setTimeout(function(){ fn(array[i], i) })
	}
}

async.map = function(array, fn){
	if(array.length){
		Promise.all(array.map(function(item){
			return new Promise(function(resolve, reject){ 
				item(function(error, data){ error ? reject(data) : resolve(data) }) 
			})
		})).then(fn)
	}else{
		var array_task = [], array_key = Object.keys(array), result = {};

		for(let i in array){
			array_task.push(new Promise(function(resolve, reject){ 
				array[i](function(error, data){ error ? reject(data) : resolve(data) }) 
			}))
		}

		Promise.all(array_task).then(function(data){
			for(var i = 0, n = array_key.length; i < n; i++){
				result[array_key[i]] = data[i]
			}

			fn(result)
		})
	}
}

module.exports = async;