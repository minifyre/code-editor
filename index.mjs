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

	await silo(url,'code-editor',code.editor)
}
Object.assign(code,silo)
code.editor=class extends silo.viewer
{
	constructor(state)
	{
		super()
		let renderer=x=>x
		this.state=truth(logic(state),(...args)=>renderer(args))
		renderer=v.render(this.shadowRoot,this,output)
		//@todo is it possible to get this into output?
		new ResizeObserver(([{target}])=>input.resize({target})).observe(this)
	}
}