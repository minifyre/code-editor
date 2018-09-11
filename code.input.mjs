import {config,logic,output} from './code.output.mjs'
const input={}
input.input=(editor,{target})=>output.renderCodeFromEl(editor,target)
input.keydown=function(editor,evt)
{
	//handle tabs
    if (evt.keyCode===9)
    {
        evt.preventDefault()
        document.execCommand('insertHTML',false,'\t')
    }
    //@todo if enter, get # of tabs from prev line & add them after new space
    output.view(editor,evt.path[0])
}
input.pointerdown=input.pointermove=input.pointerout=
input.pointerup=(editor,{target})=>output.view(editor,target)
input.scroll=(editor,{target})=>output.renderCodeFromEl(editor,target)
export {config,input,logic,output}