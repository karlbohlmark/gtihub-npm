dom = (query) ->
	nodes = document.querySelectorAll query
	[].slice.call nodes

underline = (el) -> el.style.textDecoration = 'underline'

npmPackageDataUrl = (name) -> "https://registry.npmjs.org/" + name

npmWebUrl = (name) -> "https://npmjs.org/package/" + name

packageMetaData = (pkg, cb) ->
	xhr = new XMLHttpRequest()
	xhr.onreadystatechange = () ->
		if @readyState is @DONE
			cb(null, JSON.parse @responseText)

	xhr.open "GET", npmPackageDataUrl pkg
	xhr.send()

getLinkAndTitle = (pkg, cb) ->
	packageMetaData pkg, (err, p) ->
		pkgJson = p.versions[p['dist-tags'].latest]
		link = pkgJson.homepage
		if not link 
			repo = pkgJson.repository
			if repo?.type is "git"
				link = repo.url.replace('git://', "http://")
			link or= npmWebUrl(p.name)
		title = p.author?.name + ': ' + p.description
		cb(null, {link, title})


decorateDependencies = () ->
	lines = dom '.line'

	inDeps = false
	lines
		.some (line) ->
			name = line.querySelector '.nt'
			if name
				n = name.innerHTML.replace /"/g, ''
				if n is "dependencies" or n is "devDependencies"
					inDeps = true
					return false

			if inDeps
				if line.querySelector('.p').innerHTML.indexOf('}') isnt -1
					inDeps = false
					return false
				if name
					pkg = name.innerHTML
					pkg = pkg.substring 1, pkg.length - 1
					getLinkAndTitle pkg, (err, {link, title}) ->
						if link
							name.innerHTML = "<a title=#{JSON.stringify(title)} href=#{link}>#{pkg}</a>"
					return false

pathParts = document.location.href.split '/'
if pathParts[pathParts.length-1] is 'package.json'
  decorateDependencies();
else
	packageJson = document.querySelector('.content a[title="package.json"]')
	if packageJson
		packageJson.addEventListener 'click', () ->
			setTimeout (() ->
				decorateDependencies()), 300



