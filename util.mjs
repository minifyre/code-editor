import silo from './config.mjs'
export default silo
const {util}=silo
util.asyncMap=function(arr,cb)
{
	return arr.reduce(async function(promiseArr,item)
	{
		return [...await promiseArr,await cb(item)]
	},Promise.resolve([]))
}
util.loadScript=function(src)//for old scripts that mutate the global scope
{//@todo eliminate loadScript
	return new Promise(function(onload,onerror)
	{
		document.head.appendChild
		(
			Object.assign(document.createElement('script'),{onerror,onload,src})
		)
	})
	.finally(rtn=>(rtn instanceof Error?{err:rtn}:{data:rtn}))
}
//everything below here relates directly to prism-js
util.loadPrism=async function()
{
	//load prism//@todo use es6 module import
	const
	url='./node_modules/prism/',
	{err}=await util.loadScript(url+'components/prism-core.js')
	//const {err}=await util.loadScript(url+'node_modules/prism/prism.js')
	if(err) return console.error(err)
	const prism=window.Prism

	//get available langs, themes, & plugins
	prism.components=await fetch(url+'components.js')
	.then(res=>res.text())
	.then(body=>new Function('components',body+'return components')())

	//show all loadable langs
	Object.entries(prism.components.languages)
	.forEach(function([lang,val])
	{
		if(lang==='meta') return
		const
		{alias}=val,
		aliases=!alias?[]:
				Array.isArray(alias)?alias:[alias]

		aliases.concat([lang]).forEach(lang=>prism.languages[lang]=false)
	})
	//@todo show loadable themes
	//@todo show loadable plugins

	//load default langs
	await util.loadPrismLangs(prism,'html,css,js'.split(','))

	return prism
}
//without dependencies prevents reloading langs to avoid avoid circular references
util.loadPrismLangs=async function(prism,aliases=[],withoutDependencies=false)
{
	const
	{components}=prism,
	langs=(Array.isArray(aliases)?aliases:[aliases])
	.filter(x=>x!=='meta')
	.map(function(alias)
	{//convert aliases to language names
		const val=components.languages[alias]
		return val?[alias,val]:Object.entries(components.languages)
		.find(function([_,val])
		{
			if(!val.alias) return
			const aliases=Array.isArray(val.alias)?val.alias:[val.alias]
			return aliases.indexOf(alias)!==-1
		})
	})
	.map(([key])=>key),
	// If no argument is passed, load all components
	arr=!langs.length?Object.keys(components.languages):langs

	if(!arr.length) return

	util.asyncMap(arr,async function(lang)
	{
		const definition=components.languages[lang]

		if(!definition) return console.warn('Language does not exist '+lang)

		// Load dependencies first
		if(!withoutDependencies&&definition.require) await util.loadPrismLangs(prism,definition.require)

		delete prism.languages[lang]
		await fetch(`./node_modules/prism/components/prism-${lang}.js`)
		.then(res=>res.text())
		.then(body=>new Function('Prism',body)(prism))

		// Reload dependents
		const dependents=util.getPeerDependents(lang)
		.filter(function(dependent)
		{
			// If dependent language was already loaded,
			// we want to reload it.
			if(Prism.languages[dependent])
			{
				delete Prism.languages[dependent]
				return true
			}
			return false
		})

		if(dependents.length) util.loadPrismLangs(prism,dependents,true)
		
		return
	})
}
util.getPeerDependentsMap=function()
{
	return Object.entries(util.Prism.components.languages)
	.reduce(function(peerDependentsMap,[language,value])
	{
		const {peerDependencies}=value

		if(!peerDependencies) return peerDependentsMap//ignores meta as well

		;(Array.isArray(peerDependencies)?peerDependencies:[peerDependencies])
		.forEach(function(depenency)
		{
			if(!peerDependentsMap[depenency]) peerDependentsMap[depenency]=[]

			peerDependentsMap[depenency].push(language)
		})

		return peerDependentsMap
	},{})
}
util.getPeerDependents=function(mainLanguage)
{
	if(!util.peerDependentsMap) util.peerDependentsMap=util.getPeerDependentsMap()

	return util.peerDependentsMap[mainLanguage]||[]
}