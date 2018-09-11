import config from './code.config.mjs'
import tokenize from './node_modules/tokenize/tokenize.mjs'
const logic={}
logic.getCursorInfo=function(el)
{
	const
	{selectionStart:start,selectionEnd:stop,value}=el,
	length=stop-start,
	txt=value.slice(0,start),
	prevLines=txt.split(config.newline),
	row=prevLines.length,
	tabSize=parseInt(getComputedStyle(el).tabSize),
	swap=Array(tabSize).fill(' ').join(''),
	col=prevLines.slice(-1)[0].replace(/\t/g,swap).length+1
	return [col,row,length].filter(x=>!!x).join(',')
}
logic.findReplace=(txt,[find,swap])=>txt.replace(new RegExp(find,'g'),swap)
logic.int2lineNum=function(int,lpad=4)
{
	const txt=int.toString()
	return Array(lpad-txt.length).fill(' ').join('')+txt+' '
}
logic.token2color=({type},colors)=>colors[type.split(' ').find(x=>colors[x])]
logic.tokenize=tokenize
export {config,logic}