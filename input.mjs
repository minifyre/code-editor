import silo from './output.mjs'//@todo switch to logic
const {config,input,logic,output,util}=silo//@todo eliminate output
input.alt=(e,x='')=>e.preventDefault(document.execCommand('insertHTML',false,x))
//@todo make editor the 2nd parameter for everything
input.input=(editor,{target})=>logic.modify(editor.state)
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

	logic.cursor(editor.state,target)
}
input.keyup=(editor,{target})=>output.renderCode(editor,target)
//@todo pointermove should only be active if pointer down was triggered first
input.pointerdown=input.pointermove=input.pointerout=
input.pointerup=(editor,{target})=>logic.cursor(editor.state,target)
input.scroll=(editor,{target})=>output.renderCode(editor,target)
input.resize=({target})=>output.renderCode(target)
//@todo cleanup
input.lang=function({target},editor)
{
	editor.setAttribute('lang',target.value)
	output.renderCode(editor)
}
export default silo