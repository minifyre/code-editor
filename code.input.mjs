import {config,logic,output,util} from './code.output.mjs'
const input={}
input.alt=(e,x='')=>e.preventDefault(document.execCommand('insertHTML',false,x))
input.input=(editor,{target})=>output.renderCode(editor,target)
input.keydown=function(editor,evt)
{
	const
	[target]=evt.path,
	key=evt.key.toLowerCase(),
	fns=
	{
		tab:evt=>input.alt(evt,'\t'),
		enter:function(evt)
		{
			const
			line=logic.currentLine(target),
			indentation=logic.indentation(line)
			input.alt(evt,'\n'+indentation)//@todo unhardcode newline char
		}
	},
	fn=fns[key]
	if (fn) fn(evt)
	output.view(editor,target)
}
input.keyup=(editor,{target})=>output.renderCode(editor,target)
input.pointerdown=input.pointermove=input.pointerout=
input.pointerup=(editor,{target})=>output.view(editor,target)
input.scroll=(editor,{target})=>output.renderCode(editor,target)
input.resize=({target})=>output.renderCode(target)
export {config,input,logic,output,util}