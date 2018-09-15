import {config,logic,util} from './code.logic.mjs'
const output={}
output.elStyles2floats=function(el,...props)
{
	const styles=getComputedStyle(el)
	return props.reduce(function(obj,prop)
	{
		obj[prop]=parseFloat(styles[prop])
		return obj
	},{})
}
output.langTokens=function(obj,prefix)
{
	const before=prefix?prefix+'>':''
	return Object.entries(obj||{})
	.reduce(function(arr,[key,prop])
	{
		const val=before+key
		return [...arr,val,...output.langTokens(prop.inside,val)]
	},[])
}
output.view=function(editor,el)
{
	editor.shadowRoot.querySelector('.cursor-info').innerHTML=logic.cursor(el)
}
output.renderCode=function(editor,el)//el=textarea
{
	const
	{lang,value}=el,
	can=el.parentElement.querySelector('canvas'),
	ctx=can.getContext('2d'),
	viewbox=output.viewbox(el),
	styles=output.elStyles2floats(el,'fontSize','lineHeight','tabSize'),
	txt=value,
	//tmp resize canvas to fit text area size
	{height:h,width:w}=el.getBoundingClientRect()
	Object.assign(can,{height:h,width:w})
	styles.colors=config.themes.pane
	//end tmp
	output.view(editor,el)



	const
	{width,height}=viewbox,
	{colors,fontSize,lineHeight}=styles,
	font=fontSize+'px "Source Code Pro", monospace',
	adj=Math.ceil(lineHeight/10)//@todo figure out how to make this work with scaling...
	ctx.fillStyle='#222'
	ctx.fillRect(0,0,width,height)
	Object.assign(ctx,{fillStyle:'#fff',font,textBaseline:'hanging'})
	
	if (!txt.length) return
	//@todo newlines inside html tags break things
	const
	pos={x:0,y:0},
	tab=Array(styles.tabSize).fill(' ').join(''),
	queue=[],
	queueTxt=function(txt,opts,config)
	{
		const
		x=pos.x,
		y=config.pos.y*config.lineHeight
		queue.push({txt,x,y,opts})
		config.pos.x+=ctx.measureText(txt.replace(/\t/g,tab)).width
	},
	newLine=function(pos)
	{
		pos.x=0
		pos.y+=1
		// @todo find a way to fix the horizontal distortion this causes
		// if (!lineNums) return
		// queueTxt(logic.int2lineNum(pos.y+1),{fillStyle:'#999'},{lineHeight,pos})
		// pos.x=Math.ceil(pos.x)
		// queueTxt(logic.int2lineNum(1),{fillStyle:'#999'},{lineHeight,pos})
		// //line number padding
		// textarea.style.paddingLeft=Math.ceil(ctx.measureText('   1 ').width)+'px'
	},
	token2queue=function(token,opts)
	{
		const
		{colors,lineHeight,pos}=opts,
		{content,type}=token,
		key=Object.keys(colors).reduce(function(old,key)
		{
			const match=type.match(key)
			return match&&key.length>old.length?key:old
		},'')||'text',
		fillStyle=colors[key]||'#fff'
		queueTxt(content,{fillStyle},{lineHeight,pos})
		//@todo readd tabs queueTxt(type.match(/tab/)?opts.tab:start,{fillStyle},{lineHeight,pos})
		if (token.type.match(/newline/)) newLine(pos)
	},
	str2token=function(content)
	{
		const
		{length}=content,
		type=	content.match(config.newline)?'newline':
				content.match(/\t/)?'tab':
				'text'
		return {content,length,type}
	},
	flattenTokens=function(token,parentTypes=[])
	{
		if (typeof token==='string') token=str2token(token)
		parentTypes=parentTypes.concat([token.type])
		token.type=parentTypes.filter(x=>x.length).filter((x,i,arr)=>arr.indexOf(x)===i).join('.')
		if (!Array.isArray(token.content)) return [token]
		return [...token.content.reduce((arr,x)=>arr.concat(flattenTokens(x,parentTypes)),[])]		
	}
	util.Prism.tokenize(txt,util.Prism.languages[lang])
	.reduce((arr,token)=>arr.concat(flattenTokens(token,['html'])),[])
	.reduce(function(arr,token)//split newline chars
	{
		if (token.type.match('newline')&&token.length>1)
		{
			const types=token.type.split('.').slice(0,-1)
			return [
				...arr,
				...token
				.content
				.split('')
				.map(str2token)
				.map(x=>Object.assign(x,{type:types+'.'+x.type}))
			]
		}
		return [...arr,token]
	},[])
	.forEach(token=>token2queue(token,{colors,lineHeight,pos,tab}))
	ctx.save()
	//@todo if txt y (or x) is not within the bounds, don't draw it (need to integrate further down)
	ctx.translate(-viewbox.x,adj-viewbox.y)
	queue.forEach(({txt,x,y,opts})=>output.renderTxt(ctx,txt,x,y,opts))
	ctx.restore()
}
output.renderTxt=(ctx,txt,x,y,opts)=>Object.assign(ctx,opts).fillText(txt,x,y)
output.viewbox=({scrollHeight:h,scrollLeft:x,scrollTop:y,scrollWidth:w})=>({height:h,width:w,x,y})
export {config,logic,output,util}