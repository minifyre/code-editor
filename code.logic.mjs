import config from './code.config.mjs'
import tokenize from '../node_modules/tokenize/tokenize.mjs'
const logic={}
logic.addChars=function(rows,token,i)//@finish
{
    const
    {type,start,stop}=token,
    types=token.type.split(),
    col=rows[rows.length-1]
    col.push({type,text:start})
    if (types.indexOf('newline')>-1) rows.push([])
    return rows
}
logic.findReplace=function(txt,findReplaceArr)
{
    const [find,replace]=findReplaceArr
    return txt.replace(new RegExp(find,'g'),replace)
}
logic.token2color=({type},colors)=>colors[type.split(' ').find(x=>colors[x])]
logic.tokenize=tokenize
export {config,logic}