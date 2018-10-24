import silo from './config.mjs'
export default silo
const {config,util}=silo

import prism from './node_modules/prism-plus/index.js'
util.prism=prism

util.prismTheme2json=function(name='Dark')
{
	const
	theme=util.prism.themes[name],//@todo kill off util.upercase Prism variant
	rules=util.prism.languages.css,
	tokens=util.prism.tokenize(theme,rules)
	.filter(({type})=>type!=='comment')//remove comments
	.filter(token=>!(typeof token=='string'&&token.match(/^\s{1,}$/))),//remove whitespace
	styles=tokens.reduce(function(rules,token)
	{
		if(token.type==='selector') rules.push([])
		rules[rules.length-1].push(token)
		return rules
	},[[]])
	//remove first style if it empty or does not start with a selector
	if(!styles[0].length||styles[0][0].type!=='selector') styles.splice(0,1)

	//extract rules
	const relevantRules=styles.map(function([selector,_,...tokens])
	{
		const closingBrace=tokens.reverse().findIndex(({content})=>content==='}')
		tokens=tokens.slice(closingBrace+1).reverse()

		const rules={}

		let lastLength=tokens.length
		while(true)
		{
			tokens.splice(0,tokens.findIndex(({type})=>type==='property'))

			const property=tokens.splice(0,1)[0]
			
			tokens.splice(0,tokens.findIndex(({content})=>content===':')+1)

			const semicolonI=tokens.findIndex(({content})=>content===';')

			rules[property.content]=tokens.splice(0,semicolonI)
			.map(token=>token.content||token)
			.join('')

			tokens.shift()//remove semicolon

			if(!tokens.length||tokens.length===lastLength) break
			lastLength=tokens.length
		}

		const relevantRules=
				Object.entries(rules)
				.filter(([prop])=>prop.match(/background|color/))
				.filter(([prop,val])=>!(''+val).match(/none/))
				.reduce((obj,[prop,val])=>Object.assign(obj,{[prop]:val}),{})
		
		return [selector,relevantRules]
	})
	.filter(([_,rules])=>!!Object.keys(rules).length)

	const editor=/code|pre/

	const ruleset=relevantRules.reduce(function(obj,[selector,rules])
	{
		if(!selector.content?selector.match(editor):
			selector.content.some(x=>(x.content||x).match(editor)))
		{
			Object.entries(rules)
			.forEach(function([prop,val])
			{
				if(prop.match(/background/)) obj.background=val
				else if(prop.match(/color/)) obj.text=val
			})
		}
		else
		{
			//@todo handle nested rules
			;(selector.content||[selector])
			.map(x=>(x.content||x).replace(/\s/g,''))
			.filter(x=>!!x.length)
			.join('')
			.split(',')
			.map(x=>x.replace(/\.token/g,''))
			.map(x=>x.match(/language-/)?'.'+x.match(/language-([^\.]+)/)[1]:x)
			.map(x=>x.match(/(style|script)\./)?'.'+x.match(/(style|script)/)[1]:x)
			.map(x=>x.replace(/\./g,''))
			.forEach(type=>obj[type]=rules.color||'#fff')
		}

		return obj
	},{background:'#000',text:'#fff'})

	ruleset['html.tag']=ruleset.tag||'#000'

	return ruleset
}