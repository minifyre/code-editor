import {config,input,logic,output} from './code.input.mjs'
export default function code()
{
	return Reflect.construct(HTMLElement,[],code)
}
Object.assign(code,{config,input,logic,output})
const proto=code.prototype=Object.create(HTMLElement.prototype)
proto.connectedCallback=function()
{
	const
	innerHTML=`<style>
	main
	{
		display:flex;
		height:100%;
		position:relative;
		overflow:hidden;
	}
	canvas,
	textarea
	{
		border:0;
		height:100%;
		position:absolute;
		margin:0;
		padding:0;
		width:100%;
	}
	/*@todo add text highlight color*/
	textarea
	{
		background:transparent;
		color:#fff;/*cursor color*/
		font-family:'Source Code Pro', monospace;
		font-size:1.2rem;
		line-height:120%;
		opacity:0.5;
		overflow:scroll;
		resize:none;
		tab-size:4;
		-webkit-text-fill-color:transparent;/*does not affect cursor color*/
		white-space:pre;
	}
	textarea:focus
	{
		outline:none;
	}
	</style>
	<main>
		<canvas></canvas>
		<textarea lang=html spellcheck=false></textarea>
	</main>`,
	shadow=Object.assign(this.attachShadow({mode:'open'}),{innerHTML}),
	textarea=shadow.querySelector('textarea')
	textarea.addEventListener('input',input.input)
	textarea.addEventListener('keydown',input.keydown)//@todo isnt this bound to the window?
	textarea.addEventListener('scroll',input.scroll)
	output.renderCodeFromEl(textarea)
}//disconnectedCallback,attributeChangedCallback
customElements.define('code-editor',code)