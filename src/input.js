import silo from './logic.mjs'
export default silo
const {config,util,logic,input}=silo()

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
input.lang=async function({target},editor)
{
	const {value}=target
	if(!util.prism.languages[value]) await util.prism.loadLanguages([value])
	//@todo find a better way to rerender view as this doesn't alter the file
	logic.lang(editor.state,value)
}
//@todo pointermove should only be active if pointer down was triggered first
input.pointerdown=input.pointermove=input.pointerout=
input.pointerup=(editor,{target})=>logic.cursor(editor.state,target)
input.resize=({target})=>logic.modify(util.findParent(target,'code-editor').state)
input.scroll=(editor,{target})=>logic.modify(editor.state)
input.theme=async function({target},editor)
{
	const {value}=target
	if(!config.themes[value])
	{
		await util.prism.loadThemes(value)
		config.themes[value]=util.prismTheme2json(value)
	}
	//@todo move into logic
	editor.state.view.theme=value
	//@todo find a better way to rerender view as this doesn't alter the file
	logic.modify(editor.state)
}