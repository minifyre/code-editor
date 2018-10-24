import silo from './node_modules/pane-viewer/index.mjs'
export default silo
const {config}=silo()

config.newline=/\r?\n|\r/g
config.state=
{
	file:{value:''},
	view:
	{
		cursor:'0,0',
		lang:'html',
		theme:'pane',
		type:'code-editor'
	}
}
config.themes={}
config.themes.pane=
{
	background:'#222',

	comment:'#0c0',
	//html
	//@todo make parent tokens overwrite default text color (e.g. comment text should be green)
	'html.doctype':'#ccc',
	'html.tag':'#09c',
	'html.tag.attr-name':'#90c',
	'html.tag.attr-value':'#0cf',
	'html.attr-value.punctuation':'#999',
	'html.entity':'#999',
	text:'#fff',

	'html.style':'#f33',
	'html.style.property':'#fcc',
	'html.style.comment':'#0c0',

	'html.script':'#fc0',
	'html.script.comment':'#0c0',


	'html.script.keyword':'#f90',
	'html.script.string':'#f60'
}