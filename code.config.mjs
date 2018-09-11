const config=
{
	newline:/\r?\n|\r/g,
	themes:{}
}
config.themes.pane=
{
	//html
	//@todo make parent tokens overwrite default text color (e.g. comment text should be green)
	text:'#fff',
	attribute:'#90c',
	comment:'#0c0',
	tag:'#09c',
	operator:'#999',
	value:'#0cf',
	entity:'#999'//@todo why is this not working
}
export default config