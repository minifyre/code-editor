import silo from './config.mjs'
const {util}=silo
//@todo eliminate
util.loadScript=function(src)//for old scripts that mutate the global scope
{
	return new Promise(function(onload,onerror)
	{
		document.head.appendChild
		(
			Object.assign(document.createElement('script'),{onerror,onload,src})
		)
	})
	.finally(rtn=>(rtn instanceof Error?{err:rtn}:{data:rtn}))
}

util.loadPrism=async function(url)
{
	//@todo use es6 module loading for Prism.js
	//const {err}=await util.loadScript(url+'node_modules/prism/components/prism-core.js')
	const {err}=await util.loadScript(url+'node_modules/prism/prism.js')
	if (err) return console.error(err)


	//get available langs, themes, & plugins
	const {languages,plugins,themes}=await fetch(url+'node_modules/prism/components.js')
	.then(res=>res.text())
	.then(body=>new Function('components',body+'return components')())


	//console.log(languages)

	// //@todo use es6 module loading for Prism.js
	// const
	// dir=url+'node_modules/prism/',
	// {err}=await util.loadScript(dir+'/components/prism-core.js')
	// if (err) return console.error(err)

	// console.log(Prism)

	// //get available langs, themes, & plugins
	// // await fetch(dir+'/components.js')
	// // .then(res=>res.text())
	// // .then(body=>new Function('components',body+'return components')())
	// // .then(({languages:langs,plugins,themes})=>Object.assign(util,{langs,plugins,themes}))

	// //var loadComponents = require('./components/index.js')
	// return Prism
	return Prism
}


export default silo