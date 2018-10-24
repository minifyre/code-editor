import silo from './output.mjs'
const
{config,input,logic,output,util}=silo,
{truth,v}=util
export default async function code(url='/node_modules/code-editor/')
{
	await util.prism.load()

	Object.assign(config.themes,util.prism.themes)

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