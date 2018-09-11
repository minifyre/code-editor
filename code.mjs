import {config,input,logic,output} from './code.input.mjs'
export default async function code(url='/node_modules/code-editor/')
{
	const
	importFile=path=>fetch(path).then(x=>x.text()),
	files=['css','html'].map(ext=>url+'code.'+ext),
	[css,html]=await Promise.all(files.map(importFile))
	config.dom=`<style>${css}</style>${html}`
	customElements.define('code-editor',code.editor)
}
code.editor=function()
{
	return Reflect.construct(HTMLElement,[],code.editor)
}
Object.assign(code,{config,input,logic,output})
const proto=code.editor.prototype=Object.create(HTMLElement.prototype)
proto.connectedCallback=function()
{
	const
	{dom:innerHTML}=config,
	shadow=Object.assign(this.attachShadow({mode:'open'}),{innerHTML}),
	textarea=shadow.querySelector('textarea')
	textarea.addEventListener('input',input.input)
	textarea.addEventListener('keydown',input.keydown)
	textarea.addEventListener('scroll',input.scroll)
	textarea.innerHTML=`<!Doctype html>
<link rel=stylesheet href=index.css>
<style>
/*comment*/
main
{
	display:flex;
	flex:1 1 auto;
	position:relative;
	overflow:hidden;
	width:100%;
}
</style>
<!--body-->
<main></main>
<footer>&amp;copy;</footer>
<script type=module src=index.js></script>`
	output.renderCodeFromEl(textarea)

	const langSelector=shadow.querySelector('.langs')
	langSelector.innerHTML=Object.keys(logic.tokenize.config.languages)
	.sort().map(opt=>`<option ${opt===textarea.lang?' selected':''}>${opt}</option>`).join('')

	langSelector.addEventListener('change',function({target})
	{
		textarea.lang=target.value
		output.renderCodeFromEl(textarea)
	})
}//disconnectedCallback,attributeChangedCallback