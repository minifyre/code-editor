import {config,input,logic,output} from './code.input.mjs'
export default function code()
{
	const
    el=output(input),
    textarea=el.querySelector('textarea'),
    {addEventListener:on}=textarea
    on('input',input.input,true)
    on('keydown',input.keydown,true)
    on('scroll',input.scroll,true)
    output.renderCodeFromEl(textarea)
    return el
}
Object.assign(code,{config,input,logic,output})

//https://developers.google.com/web/fundamentals/web-components/customelements
//https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
// const
// codeEditor=function()
// {
// 	const construct=Reflect.construct(HTMLElement,[],codeEditor)
// 	return construct
// },
// proto=codeEditor.prototype=Object.create(HTMLElement.prototype)
// proto.connectedCallback=function()
// {
// 	const
// 	shadow=this.attachShadow({mode: 'open'}),
// 	wrapper=code(),
// 	style=document.createElement('style')

// 	wrapper.querySelector('textarea').appendChild(document.createElement('slot'))

// 	//style.textContent = '.wrapper {' +
// 	shadow.appendChild(style)
// 	shadow.appendChild(wrapper)
// }//disconnectedCallback,attributeChangedCallback
// customElements.define('code-editor',codeEditor)