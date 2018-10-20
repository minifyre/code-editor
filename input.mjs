import silo from './logic.mjs'
const {config,input,logic,util}=silo
input.alt=(e,x='')=>e.preventDefault(document.execCommand('insertHTML',false,x))
//@todo make editor the 2nd parameter for everything
input.input=(editor,{target})=>logic.update(editor.state,target.value)
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
input.keyup=(editor,{target})=>logic.cursor(editor.state,target)
input.lang=({target},editor)=>logic.lang(editor.state,target.value)
//@todo pointermove should only be active if pointer down was triggered first
input.pointerdown=input.pointermove=input.pointerout=
input.pointerup=(editor,{target})=>logic.cursor(editor.state,target)
input.scroll=(editor,{target})=>logic.modify(editor.state)
input.resize=({target})=>logic.modify(util.findParent(target,'code-editor').state)
export default silo