import silo from './util.mjs'
const {config,logic,util}=silo
logic.currentLine=el=>logic.prevLines(el).slice(-1)[0]
logic.cursor=function(state,el)
{
	const
	length=el.selectionEnd-el.selectionStart,
	row=logic.prevLines(el).length,
	tabs=logic.tabReplacement(el),
	col=logic.currentLine(el).replace(/\t/g,tabs).length+1
	
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
logic.tabReplacement=el=>Array(parseInt(getComputedStyle(el).tabSize)).fill(' ').join('')
export default silo