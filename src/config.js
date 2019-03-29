config.whitespace=
{
	tab:/\t/g,
	crlf:/\r\n/g,
	lf:/\n/g,
	cr:/\r/g
}
config.newline=/\r?\n|\r/g//@todo eliminate

config.state=
{
	file:{value:''},
	view:
	{
		cursor:'0,0',
		lang:'html',
		tabSize:4,
		theme:'pane',
		type:'code-editor'
	}
}
config.style=`
:host
{
	contain:content;
	display:flex;
	flex-direction:column;
}
.cursor-info
{
	color:#fff;
	height:100%;
	flex:1 1 auto;
}
main
{
	display:flex;
	flex:1 1 auto;
	position:relative;
	overflow:hidden;
	width:100%;
}
footer
{
	background:#000;
	display:flex;
	flex:0 0 auto;
	flex-direction:row;
	min-height:1.2rem;
	width:100%;
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
	-webkit-text-fill-color:transparent;/*does not affect cursor color*/
	white-space:pre;
}
textarea:focus
{
	outline:none;
}`
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