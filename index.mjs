import silo from './input.mjs'//@todo switch to output
const
{config,input,logic,output,util}=silo,
{truth,v}=util
export default async function code(url='/node_modules/code-editor/')
{
	const {err}=await util.loadScript(url+'node_modules/prism/prism.js')
	if (err) return console.error(err)
	util.Prism=Prism
	const
	importFile=path=>fetch(path).then(x=>x.text()),
	files=['css','html'].map(ext=>url+'index.'+ext),
	[css,html]=await Promise.all(files.map(importFile))
	//@todo simplify with await silo(url,'code-editor',code.editor)
	config.css=css
	config.dom=`<style>${css}</style>${html}`
	customElements.define('code-editor',code.editor)
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
	attributeChangedCallback(attr,oldVal,newVal)
	{
		const editor=this.shadowRoot.querySelector('textarea')
		editor[attr]=newVal
		if (attr==='value') editor.innerHTML=newVal
		else if (attr==='lang')
		{
			const
			sel=this.shadowRoot.querySelector('.langs'),
			i=[...sel.options].findIndex(opt=>opt.value===newVal)
			//@todo load lang if i===-1
			sel.selectedIndex=i
		}
		code.output.renderCode(this)
		return newVal
	}
	//@todo add tab size & simplify this
	// static get observedAttributes()
	// {
	// 	return ['lang','value']
	// }
	// get lang()
	// {
	// 	return this.shadowRoot.querySelector('textarea').lang
	// }
	// get state()
	// {
	// 	const {lang,value}=this
	// 	return {lang,value}
	// }
	// get value()
	// {
	// 	return this.shadowRoot.querySelector('textarea').value
	// }
	// set lang(val)
	// {
	// 	return this.shadowRoot.querySelector('textarea').lang=val
	// }
	// set state(val)
	// {
	// 	//@todo refresh everything: canvas,cursor,lang
	// 	const newVal=Object.assign(this,val)
	// 	output.renderCode(this)
	// 	return newVal
	// }
	// set value(val)
	// {
	// 	return this.shadowRoot.querySelector('textarea').value=val
	// }
}