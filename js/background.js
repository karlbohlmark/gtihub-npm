(function() {
  var decorateDependencies, dom, getLinkAndTitle, npmPackageDataUrl, npmWebUrl, packageJson, packageMetaData, pathParts, underline;

  dom = function(query) {
    var nodes;
    nodes = document.querySelectorAll(query);
    return [].slice.call(nodes);
  };

  underline = function(el) {
    return el.style.textDecoration = 'underline';
  };

  npmPackageDataUrl = function(name) {
    return "https://registry.npmjs.org/" + name;
  };

  npmWebUrl = function(name) {
    return "https://npmjs.org/package/" + name;
  };

  packageMetaData = function(pkg, cb) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState === this.DONE) {
        return cb(null, JSON.parse(this.responseText));
      }
    };
    xhr.open("GET", npmPackageDataUrl(pkg));
    return xhr.send();
  };

  getLinkAndTitle = function(pkg, cb) {
    return packageMetaData(pkg, function(err, p) {
      var link, pkgJson, repo, title, _ref;
      pkgJson = p.versions[p['dist-tags'].latest];
      link = pkgJson.homepage;
      if (!link) {
        repo = pkgJson.repository;
        if ((repo != null ? repo.type : void 0) === "git") {
          link = repo.url.replace('git://', "http://");
        }
        link || (link = npmWebUrl(p.name));
      }
      title = ((_ref = p.author) != null ? _ref.name : void 0) + ': ' + p.description;
      return cb(null, {
        link: link,
        title: title
      });
    });
  };

  decorateDependencies = function() {
    var inDeps, lines;
    lines = dom('.line');
    inDeps = false;
    return lines.some(function(line) {
      var n, name, pkg;
      name = line.querySelector('.nt');
      if (name) {
        n = name.innerHTML.replace(/"/g, '');
        if (n === "dependencies" || n === "devDependencies") {
          inDeps = true;
          return false;
        }
      }
      if (inDeps) {
        if (line.querySelector('.p').innerHTML.indexOf('}') !== -1) {
          inDeps = false;
          return false;
        }
        if (name) {
          pkg = name.innerHTML;
          pkg = pkg.substring(1, pkg.length - 1);
          getLinkAndTitle(pkg, function(err, _arg) {
            var link, title;
            link = _arg.link, title = _arg.title;
            if (link) {
              return name.innerHTML = "<a title=" + (JSON.stringify(title)) + " href=" + link + ">" + pkg + "</a>";
            }
          });
          return false;
        }
      }
    });
  };

  pathParts = document.location.href.split('/');

  if (pathParts[pathParts.length - 1] === 'package.json') {
    decorateDependencies();
  } else {
    packageJson = document.querySelector('.content a[title="package.json"]');
    if (packageJson) {
      packageJson.addEventListener('click', function() {
        return setTimeout((function() {
          return decorateDependencies();
        }), 300);
      });
    }
  }

}).call(this);
