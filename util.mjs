import silo from './config.mjs'
export default silo
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
	const {err}=await util.loadScript('./node_modules/prism/components/prism-core.js')
	//const {err}=await util.loadScript(url+'node_modules/prism/prism.js')
	if(err) return console.error(err)

	const
	prism=window.Prism,
	//get available langs, themes, & plugins
	components=await fetch('./node_modules/prism/components.js')
	.then(res=>res.text())
	.then(body=>new Function('components',body+'return components')())

	//show all loadable langs
	Object.entries(components.languages)
	.forEach(function([lang,val])
	{
		if(lang==='meta') return
		const
		{alias}=val,
		aliases=!alias?[]:
				Array.isArray(alias)?alias:[alias]

		aliases.concat([lang]).forEach(lang=>Prism.languages[lang]=false)
	})

	//@todo show loadable themes
	//@todo show loadable plugins



	// components.languages.forEach(function(lang)
	// {
	// 	prism.languages=lang
	// })


	// await fetch(url+'node_modules/prism/components/prism-markup.js')
	// .then(res=>res.text())
	// .then(body=>new Function('Prism',body+'return Prism')(prism))

	console.log(prism)

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
	return prism
}





function getPeerDependentsMap()
{
	return Object.entries(components.languages)
	.reduce(function(peerDependentsMap,[language,value])
	{
		const {peerDependencies}=value

		if(!peerDependencies) return peerDependentsMap//ignores meta as well

		;(!Array.isArray(peerDependencies)?peerDependencies:[peerDependencies])
		.forEach(function(depenency)
		{
			if(!peerDependentsMap[depenency]) peerDependentsMap[depenency]=[]

			peerDependentsMap[depenency].push(language)
		})

		return peerDependentsMap
	},{})
}

function getPeerDependents(mainLanguage)
{
	if(!peerDependentsMap) peerDependentsMap=getPeerDependentsMap()

	return peerDependentsMap[mainLanguage]||[]
}

function loadLanguages(arr,withoutDependencies)
{
	// If no argument is passed, load all components
	if(!arr) arr=Object.keys(components.languages).filter(lang=>lang!=='meta')

	if(arr&&!arr.length) return

	if(!Array.isArray(arr)) arr=[arr]

	arr.forEach(function(lang)
	{
		const def=components.languages[lang]
		if (!def)
		{
			console.warn('Language does not exist '+lang)
			return
		}

		console.log(def)

		// // Load dependencies first
		// if(!withoutDependencies&&def.require) loadLanguages(def.require)

		// const pathToLanguage='./prism-'+lang

		// delete require.cache[require.resolve(pathToLanguage)]
		// delete Prism.languages[lang]
		// require(pathToLanguage)

		// // Reload dependents
		// const dependents=getPeerDependents(lang)
		// .filter(function(dependent)
		// {
		// 	// If dependent language was already loaded,
		// 	// we want to reload it.
		// 	if(Prism.languages[dependent])
		// 	{
		// 		delete Prism.languages[dependent]
		// 		return true
		// 	}
		// 	return false
		// })

		// if(dependents.length) loadLanguages(dependents,true)
	})
}