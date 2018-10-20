import silo from './output.mjs'
const
{config,input,logic,output,util}=silo,
{truth,v}=util
export default async function code(url='/node_modules/code-editor/')
{
	//@todo use es6 module loading for Prism.js
	const {err}=await util.loadScript(url+'node_modules/prism/prism.js')
	if (err) return console.error(err)
	util.Prism=Prism

	//get available langs, themes, & plugins
	await fetch(url+'node_modules/prism/components.js')
	.then(res=>res.text())
	.then(body=>new Function('components',body+'return components')())
	.then(({languages:langs,plugins,themes})=>Object.assign(util,{langs,plugins,themes}))

	await util.mkCustomEl(url,'code-editor',code.editor)
}
Object.assign(code,silo)
code.editor=class extends silo.viewer
{
	constructor(state)
	{
		super(state,silo)
		//@todo is it possible to get this into output?
		new ResizeObserver(([{target}])=>input.resize({target})).observe(this)
	}
}