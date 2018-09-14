import {config,input,logic,output,util} from './code.input.mjs'
export default async function code(url='/node_modules/code-editor/')
{
	const {err}=await util.loadScript(url+'/node_modules/prism/prism.js')
	if (err) return console.error(err)
	util.Prism=Prism
	const
	importFile=path=>fetch(path).then(x=>x.text()),
	files=['css','html'].map(ext=>url+'code.'+ext),
	[css,html]=await Promise.all(files.map(importFile))
	config.dom=`<style>${css}</style>${html}`
	customElements.define('code-editor',code.editor)
}
Object.assign(code,{config,input,logic,output})
code.editor=class extends HTMLElement
{
	constructor()
	{
		super()
	}
	attributeChangedCallback(attr,oldVal,newVal)
	{
		const editor=this.shadowRoot.querySelector('textarea')
		editor[attr]=newVal
		if (attr==='value') editor.innerHTML=newVal
		else if (attr==='lang') '@todo update lang selector in footer'
		code.output.renderCodeFromEl(this,editor)
		return newVal
	}
	connectedCallback()
	{
		const
		editor=this,
		{dom:innerHTML}=config,
		shadow=Object.assign(this.attachShadow({mode:'open'}),{innerHTML}),
		textarea=shadow.querySelector('textarea')
		//+evt listeners
		//pointer down should pointerMove,out,or up evt listeners & then remove them
		// when done 
		//only recalc cursor info if pointer is held down & moving, thus selecting more or less text
		'input,keydown,keyup,pointerdown,pointermove,pointerout,pointerup,scroll'
		.split(',')
		.forEach(fn=>textarea.addEventListener(fn,evt=>input[fn](this,evt)))
		output.renderCodeFromEl(editor,textarea)

		const langSelector=shadow.querySelector('.langs')
		
		langSelector.innerHTML=Object.entries(util.Prism.languages)
		.filter(([key,val])=>typeof val!=='function')
		.map(([key])=>key)
		.sort().map(opt=>`<option ${opt===textarea.lang?' selected':''}>${opt}</option>`).join('')
		langSelector.addEventListener('change',function({target})
		{
			textarea.lang=target.value
			output.renderCodeFromEl(editor,textarea)
		})
	}
	adoptedCallback()
	{
		console.error('add adoptedCallback behavior')
	}
	disconnectedCallback()
	{
		console.error('add disconnectedCallback behavior')
	}
	//@todo add tab size & simplify this
	static get observedAttributes()
	{
		return ['lang','value']
	}
	get lang()
	{
		return this.shadowRoot.querySelector('textarea').lang
	}
	get value()
	{
		return this.shadowRoot.querySelector('textarea').value
	}
	set lang(val)
	{
		return this.shadowRoot.querySelector('textarea').lang=val
	}
	set value(val)
	{
		return this.shadowRoot.querySelector('textarea').value=val
	}
}