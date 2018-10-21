import silo from './config.mjs'
const {util}=silo
//@todo eliminate
util.loadScript=function(src)//for old timey scripts that pollute global scope
{
	return new Promise(function(res,rej)
	{
		document.head.appendChild(Object.assign
		(
			document.createElement('script'),
			{
				onerror:err=>rej({err}),
				onload:data=>res({data}),
				src
			}
		))
	})
}

util.loadPrism=async function(url)
{
	//@todo use es6 module loading for Prism.js
	const {err}=await util.loadScript(url+'node_modules/prism/prism.js')
	if (err) return console.error(err)

	//get available langs, themes, & plugins
	// await fetch(url+'node_modules/prism/components.js')
	// .then(res=>res.text())
	// .then(body=>new Function('components',body+'return components')())
	// .then(({languages:langs,plugins,themes})=>Object.assign(util,{langs,plugins,themes}))



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