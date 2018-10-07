import silo from './util.mjs'
const {config,logic,util}=silo
logic.currentLine=el=>logic.prevLines(el).slice(-1)[0]
logic.cursor=function(el)
{
	const
	length=el.selectionEnd-el.selectionStart,
	row=logic.prevLines(el).length,
	tabs=logic.tabReplacement(el),
	col=logic.currentLine(el).replace(/\t/g,tabs).length+1
	return [col,row,length].filter(x=>!!x).join(',')
}
logic.findReplace=(txt,[find,swap])=>txt.replace(new RegExp(find,'g'),swap)
logic.indentation=ln=>(ln.match(/^\s*/g)||[''])[0]
logic.int2lineNum=(int,lpad=4,txt=''+int)=>' '.repeat(lpad-txt.length)+txt+' '
logic.prevLines=({selectionStart:i,value})=>value.slice(0,i).split(config.newline)
logic.tabReplacement=el=>Array(parseInt(getComputedStyle(el).tabSize)).fill(' ').join('')
export default silo