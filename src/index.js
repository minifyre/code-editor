import prism from './node_modules/prism-plus/index.js'
import silo from './node_modules/silo/index.js'
import truth from './node_modules/truth/truth.mjs'
import v from './node_modules/v/v.mjs'

const {config,util,logic,output,input}=silo
util.prism=prism

export default silo(async function code(url='/node_modules/code-editor/')
{
	await util.prism.load()

	Object.assign(config.themes,util.prism.themes)

	customElements.define('code-editor',silo.editor)
})
silo.editor=class extends silo.customElement
{
	constructor(state)
	{
		super(state,silo)
		//@todo is it possible to get this into output?
		new ResizeObserver(([{target}])=>input.resize({target})).observe(this)
	}
}