import silo from './config.mjs'
export default silo
const {util}=silo

import prism from './node_modules/prism-plus/index.js'
util.prism=prism

util.prismTheme2json=function(name='Dark')
{
	const
	theme=util.Prism.themes[name],//@todo kill off util.upercase Prism variant
	rules=util.Prism.languages.css,
	tokens=util.Prism.tokenize(theme,rules)
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
				.filter(([prop])=>prop.match(/background|color|opacity/))
				.filter(([prop,val])=>!(''+val).match(/none/))
				.reduce((obj,[prop,val])=>Object.assign(obj,{[prop]:val}),{})
		
		return [selector,relevantRules]
	})
	.filter(([_,rules])=>!!Object.keys(rules).length)

	const editor=/code|pre/

	console.log(relevantRules.reduce(function(obj,[selector,rules])
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
			;(selector.content||[selector])
		}

		return obj
	},{background:'#000',text:'#fff'}))

}