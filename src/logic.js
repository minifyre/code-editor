logic.currentLine=el=>logic.prevLines(el).slice(-1)[0]
logic.cursor=function(state,el)
{
	const
	length=el.selectionEnd-el.selectionStart,
	row=logic.prevLines(el).length,
	col=util.tabs2spaces(logic.currentLine(el),state.view.tabSize).length+1

	state.view.cursor=[col,row,length].filter(x=>!!x).join(',')
}
logic.lang=function(state,value)
{
	state.view.lang=value
	logic.modify(state)
}
logic.update=function(state,value)
{//@todo optimize by splicing in text at cursor position
	//(prevents overwriting the entire thing each update cycle)
	state.file.value=value
	logic.modify(state)
}
logic.modify=(state,time=Date.now())=>state.file.modified=time
logic.findReplace=(txt,[find,swap])=>txt.replace(new RegExp(find,'g'),swap)
logic.indentation=ln=>(ln.match(/^\s*/g)||[''])[0]
logic.int2lineNum=(int,lpad=4,txt=''+int)=>' '.repeat(lpad-txt.length)+txt+' '
logic.prevLines=({selectionStart:i,value})=>value.slice(0,i).split(config.newline)


//non-state fns
logic.flattenTokens=function(token,parentTypes=[])
{
	if (typeof token==='string') token=logic.str2token(token)
	parentTypes=parentTypes.concat([token.type])
	token.type=parentTypes.filter(x=>x.length).filter((x,i,arr)=>arr.indexOf(x)===i).join('.')
	if (!Array.isArray(token.content)) return [token]
	return [...token.content.reduce((arr,x)=>arr.concat(logic.flattenTokens(x,parentTypes)),[])]		
}
logic.str2token=function(content)
{
	const
	{length}=content,
	type=	//content.match(config.newline)?'newline':
			//content.match(/\t/)?'tab':
			'text'
	return {content,length,type}
}