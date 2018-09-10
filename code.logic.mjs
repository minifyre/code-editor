import config from './code.config.mjs'
import tokenize from './node_modules/tokenize/tokenize.mjs'
const logic={}
logic.findReplace=(txt,[find,swap])=>txt.replace(new RegExp(find,'g'),swap)
logic.int2lineNum=function(int,lpad=4)
{
	const txt=int.toString()
	return Array(lpad-txt.length).fill(' ').join('')+txt+' '
}
logic.token2color=({type},colors)=>colors[type.split(' ').find(x=>colors[x])]
logic.tokenize=tokenize
export {config,logic}