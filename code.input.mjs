import {config,logic,output} from './code.output.mjs'
const input={}
input.keydown=function(evt)
{
	//handle tabs
    if (evt.keyCode===9)
    {
        evt.preventDefault()
        document.execCommand('insertHTML',false,'\t')
    }
    //@todo if enter, get # of tabs from prev line & add them after new space
}
input.input=({target})=>output.renderCodeFromEl(target)
input.scroll=({target})=>output.renderCodeFromEl(target)
export {config,input,logic,output}