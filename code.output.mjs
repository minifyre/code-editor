import {config,logic} from './code.logic.mjs'
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
output.view=function(editor,el)
{
	editor.shadowRoot.querySelector('.cursor-info').innerHTML=logic.cursor(el)
}
output.renderCodeFromEl=function(editor,el)//el=textarea
{
	const
	{lang,value}=el,
	can=el.parentElement.querySelector('canvas'),
	ctx=can.getContext('2d'),
	viewbox=output.viewbox(editor,el),
	styles=output.elStyles2floats(el,'fontSize','lineHeight','tabSize'),
	//tmp resize canvas to fit text area size
	{height,width}=el.getBoundingClientRect()
	Object.assign(can,{height,width})
	styles.colors=config.themes.pane
	//end tmp
	output.view(editor,el)
	output.renderCode(ctx,value,{lang,styles,viewbox,textarea:el})
}
output.renderCode=function(ctx,txt,opts={})
{
	const
	{lang,styles,viewbox,textarea}=opts,
	{width,height}=viewbox,
	lineNums=true,//@todo decouples horizontal text positioning by a few px...
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
	tab=Array(styles.tabSize).fill(' ').join('')


	const
	queue=[],
	txtWidth=function(txt)
	{
		return ctx.measureText(txt.replace(/\t/g,tab)).width
	},
	queueTxt=function(txt,opts,config)
	{
		const
		x=pos.x,
		y=config.pos.y*config.lineHeight
		queue.push({txt,x,y,opts})
		config.pos.x+=txtWidth(txt)
	},
	token2queue=function(token,opts)
	{
		const
		{colors,lineHeight,pos}=opts,
		fillStyle=logic.tokenType2color(token.type,colors)||'#fff',
		{children,type,start,stop}=token
		//start
		queueTxt(type.match(/tab/)?opts.tab:start,{fillStyle},{lineHeight,pos})
		//children
		children.forEach(token=>token2queue(token,opts))
		//stop
		if (stop.length) queueTxt(stop,{fillStyle},{lineHeight,pos})
		if (token.type.match(/newline/))
		{
			pos.x=0
			pos.y+=1
			// if (lineNums)
			// {
			// 	queueTxt(logic.int2lineNum(pos.y+1),{fillStyle:'#999'},{lineHeight,pos})
			// 	pos.x=Math.ceil(pos.x)
			// }
		}
	},
	token2queue2=function(token,opts)
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
		if (token.type.match(/newline/))
		{
			pos.x=0
			pos.y+=1
			// if (lineNums)
			// {
			// 	queueTxt(logic.int2lineNum(pos.y+1),{fillStyle:'#999'},{lineHeight,pos})
			// 	pos.x=Math.ceil(pos.x)
			// }
		}
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

	// if (lineNums)
	// {
	// 	queueTxt(logic.int2lineNum(1),{fillStyle:'#999'},{lineHeight,pos})
	// 	//line number padding
	// 	textarea.style.paddingLeft=Math.ceil(ctx.measureText('   1 ').width)+'px'
	// }
	config.Prism.tokenize(txt,config.Prism.languages[lang])
	.reduce((arr,token)=>arr.concat(flattenTokens(token,['html'])),[])
	.reduce(function(arr,token)//split newline chars
	{
		if (token.type.match('newline')&&token.length>1)
		{
			const types=token.type.split('.')
			types.pop()
			return arr.concat
			(
				token.content.split('')
				.map(str2token).map(x=>Object.assign(x,{type:types+'.'+x.type}))
			)
		}
		return arr.concat([token])
	},[])
	.forEach(token=>token2queue2(token,{colors,lineHeight,pos,tab}))
	ctx.save()
	//@todo if txt y (or x) is not within the bounds, don't draw it (need to integrate further down)
	ctx.translate(-viewbox.x,adj-viewbox.y)
	queue.forEach(({txt,x,y,opts})=>output.renderTxt(ctx,txt,x,y,opts))
	ctx.restore()
}
output.renderTxt=(ctx,txt,x,y,opts)=>Object.assign(ctx,opts).fillText(txt,x,y)
output.viewbox=({scrollHeight:h,scrollLeft:x,scrollTop:y,scrollWidth:w})=>({height:h,width:w,x,y})
export {config,logic,output}