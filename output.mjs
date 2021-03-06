import silo from './input.mjs'
export default silo
const
{config,util,logic,input,output}=silo(function output(editor)
{
	const
	{state}=editor,
	{cursor,lang,tabSize,theme}=state.view,
	{file}=state,
	{modified}=file,

	//+evt listeners
	//pointer down should pointerMove,out,or up evt listeners & then remove them
	// when done 
	//only recalc cursor info if pointer is held down & moving, thus selecting more or less text
	on={}
	'input,keydown,keyup,pointerdown,pointermove,pointerout,pointerup,scroll'
	.split(',')
	.forEach(fn=>on[fn]=evt=>silo.input[fn](editor,evt))

	return [v('style',{},silo.config.css),
		v('main',{},
			v('canvas',{data:{modified},on:{render:()=>output.renderCode(editor)}}),
			v('textarea',{lang,on,spellcheck:false,style:`tab-size:${tabSize};`},file.value)
		),
		v('footer',{},
			//@todo cursor is not updating fast enough (1 char behind...)
			v('.cursor-info',{},cursor),//@todo convert to 2 input[type=number] fields
			output.loadableDropdown('theme',{on:{change:evt=>input.theme(evt,editor)}},config.themes,theme,Object.keys(config.themes)),
			output.loadableDropdown('langs',{on:{change:evt=>input.lang(evt,editor)}},util.prism.languages,lang,
				Object.entries(util.prism.languages)
				.filter(([key,val])=>typeof val!=='function')
				.filter(([key,val])=>!key.match(/-extras$/))
				.map(([key])=>key)
				.sort()
			)
		)
	]
}),
{v}=util

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
output.loadableDropdown=function(name,props,from,selectedVal,items)
{
	return v('select.'+name,props,
		...items.map(function(value)
		{
			const
			loaded=from[value],
			selected=value===selectedVal?{selected:true}:{},
			props=Object.assign({data:{loaded},value},selected)

			return v('option',props,(loaded?'':'*')+value)
		})
	)
}
output.renderCode=function(editor)//@todo cleanup
{
	//@todo recalc cursor position in case another view changed the value?
	const
	[el,can]=['textarea','canvas'].map(x=>editor.shadowRoot.querySelector(x)),
	{lang,value:txt}=el,
	ctx=can.getContext('2d'),
	{height,width,x,y}=output.viewbox(el),
	{fontSize,lineHeight,tabSize}=output.elStyles2floats(el,'fontSize','lineHeight','tabSize'),
	font=fontSize+'px "Source Code Pro", monospace',
	colors=config.themes[editor.state.view.theme],
	//tmp resize canvas to fit text area size
	{height:h,width:w}=el.getBoundingClientRect()
	Object.assign(can,{height:h,width:w})
	//end tmp
	output.renderRect(ctx,{fillStyle:colors.background},0,0,width,height)
	Object.assign(ctx,{fillStyle:'#fff',font,textBaseline:'hanging'})
	if (!txt.length) return
	//@todo newlines inside html tags break things
	const
	pos={x:0,y:0},
	tab=Array(tabSize).fill(' ').join(''),
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
		key=Object.keys(colors)
		.reduce((old,key)=>type.match(key)&&key.length>old.length?key:old,''),
		fillStyle=colors[key||'text']||'#fff'
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
	util.prism.tokenize(txt,util.prism.languages[lang])
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
	ctx.translate(-x,Math.ceil(lineHeight/10)-y)//@todo figure out how to make this work with scaling...
	queue.forEach(({txt,x,y,opts})=>output.renderTxt(ctx,txt,x,y,opts))
	ctx.restore()
}
output.renderRect=(ctx,opts,x,y,w,h=w)=>Object.assign(ctx,opts).fillRect(x,y,w,h)
output.renderTxt=(ctx,txt,x,y,opts)=>Object.assign(ctx,opts).fillText(txt,x,y)
output.viewbox=({scrollHeight:h,scrollLeft:x,scrollTop:y,scrollWidth:w})=>({height:h,width:w,x,y})