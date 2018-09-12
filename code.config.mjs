const config=
{
	newline:/\r?\n|\r/g,
	themes:{}
}
config.themes.pane=
{
	//html
	//@todo make parent tokens overwrite default text color (e.g. comment text should be green)
    'html.doctype':'#999',
    'html.tag':'#09c',
    'html.tag.attr-name':'#90c',
    'html.tag.attr-value':'#0cf',
    'html.attr-value.punctuation':'#999',
	comment:'#0c0',
    'html.entity':'#999',    
    text:'#fff',

    'html.style':'red',
    'html.style.comment':'#0c0'
}
export default config