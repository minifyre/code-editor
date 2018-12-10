output.render=function(editor)
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
			output.loadableDropdown('langs',{on:{change:evt=>input.lang(evt,editor)}},prism.languages,lang,
				Object.entries(prism.languages)
				.filter(([key,val])=>typeof val!=='function')
				.filter(([key,val])=>!key.match(/-extras$/))
				.map(([key])=>key)
				.sort()
			)
		)
	]
}

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
	//tmp resize canvas to fit textarea size
	{height:h,width:w}=el.getBoundingClientRect()
	Object.assign(can,{height:h,width:w})
	//end tmp
	output.renderRect(ctx,{fillStyle:colors.background},0,0,width,height)
	Object.assign(ctx,{fillStyle:'#fff',font,textBaseline:'hanging'})
	if(!txt.length) return

	logic.queueTxt=function(queue,txt,opts,config)//@todo add ctx to params
	{
		const
		x=pos.x,
		y=config.pos.y*config.lineHeight
		queue.push({txt,x,y,opts})
		config.pos.x+=ctx.measureText(txt.replace(/\t/g,tab)).width
	}

	//@todo tabs after text may break things as they take up as much space as 
	//exists between their starting position and the next multiple of their length 
	const
	pos={x:0,y:0},
	tab=Array(tabSize).fill(' ').join(''),
	newLine=pos=>Object.assign(pos,{x:0,y:pos.y+1}),
	token2queue=function(tokens,{colors,lineHeight,pos},token)
	{
		const
		{content,type}=token,
		key=Object.keys(colors)
		.reduce((old,key)=>type.match(key)&&key.length>old.length?key:old,''),
		fillStyle=colors[key||'text']||'#fff'

		logic.queueTxt(tokens,content,{fillStyle},{lineHeight,pos})
		if(token.type.match(/(clrf|cr|lf)$/)) newLine(pos)

		return tokens
	}



	ctx.save()
	//@todo if txt y (or x) is not within the bounds, don't draw it (need to integrate further down)
	ctx.translate(-x,Math.ceil(lineHeight/10)-y)//@todo figure out how to make this work with scaling...

	prism.tokenize(txt,prism.languages[lang])
	.reduce((arr,token)=>arr.concat(logic.flattenTokens(token,[lang])),[])
	.reduce(function(arr,token)//split newline chars
	{
		const types=token.type
		return arr.concat(!token.content.match(/\t|\n|\r/)?[token]:
			Object.entries(config.whitespace)
			.reduce(function(tokens,[type,pattern])//add tabs & newlines
			{
				const rtn=[]
				tokens
				.forEach(function(token)
				{
					if(typeof token!=='string'||!token.match(pattern)) return rtn.push(token)
					const
					matches=token.match(pattern)
					.map(content=>({content,length:content.length,type:types+'.'+type})),
					tmp=token.split(pattern)
					.reduce((arr,nonMatch,i)=>arr.concat(nonMatch,matches[i]),[])
					tmp.pop()//remove empty last element
					rtn.push(...tmp.filter(x=>x.length))
				})
				return rtn
			},[token.content])
			.map(x=>typeof x==='string'?{content:x,length:x.length,type:types}:x)
		)
	},[])
	.reduce((tokens,token)=>token2queue(tokens,{colors,lineHeight,pos,tab},token),[])
	.forEach(({txt,x,y,opts})=>output.renderTxt(ctx,txt,x,y,opts))

	ctx.restore()
}
output.renderRect=(ctx,opts,x,y,w,h=w)=>Object.assign(ctx,opts).fillRect(x,y,w,h)
output.renderTxt=(ctx,txt,x,y,opts)=>Object.assign(ctx,opts).fillText(txt,x,y)
output.viewbox=({scrollHeight:h,scrollLeft:x,scrollTop:y,scrollWidth:w})=>({height:h,width:w,x,y})