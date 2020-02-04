const urls = [
    {
        title: 'BUS Log',
        items:[
            { title: '实时数据曲线', url: 'test_svg1.html'},
            { title: '历史数据目录', url: 'test_rtlog_dirs.html'},
            { title: '特定点的历史', url: 'test_rtlog_file.html?logdir=20191127&filename=0x01000005.txt'},
        ]
    },
    {
        title: 'BUS Debug',
        items:[
            { title: '实时数据读', url: 'viewer.html'},
            { title: '实时数据写', url: 'poster.html'},
        ]
    },
    ];

const _$ = document.querySelector.bind(document);
const _$$ = document.querySelectorAll.bind(document);

let docCookies = {
    getItem: function(sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        let sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function(sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) {
            return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function(sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function() {
        let aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (let nIdx = 0; nIdx < aKeys.length; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    }
};

// docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
// docCookies.getItem(name)
// docCookies.removeItem(name[, path],domain)
// docCookies.hasItem(name)

let dogs = [{name: 'a', age: 1}, {name: 'b', age: 2}]

const markup = `
<ul class="dogs">
    ${dogs.map(dog => `<li>${dog.name} is ${dog.age * 7}</li>`)}
</ul>
`;

const marUrls = urls.map((g,gi) => `
        <ul class="list-unstyled active">
            <li>
                <a href="#submenu${String(gi)}" data-toggle="collapse"><i class="fa fa-fw fa-address-card"></i>${g.title}</a>
                <ul id="submenu${String(gi)}" class="list-unstyled collapse show">${g.items.map(item => `
                    <li><a href="./${item.url}">${item.title}</a></li>`).join('')}
                </ul>
            </li>
        </ul>`).join('');
console.log(marUrls);

const navBar = `
<nav class="navbar navbar-expand navbar-dark bg-primary">
    <a class="sidebar-toggle text-light mr-3"><i class="fa fa-bars"></i></a>
    <a class="navbar-brand" href="#"><i class="fa fa-code-branch"></i> Navbar</a>
    <div class="navbar-collapse collapse">
        <ul class="navbar-nav ml-auto">
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown">
                    <i class="fa fa-user"></i> Username
                </a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdownMenuLink">
                    <a class="dropdown-item" href="#">Action</a>
                    <a class="dropdown-item" href="#">Another</a>
                </div>
            </li>
        </ul>
    </div>
</nav>
`;

const nav = `
    <nav class="sidebar bg-dark ">
        <ul class="list-unstyled">
            <!--            target="_blank"-->
            <li><a href="./index.html"><i class="fa fa-fw fa-link"></i>HOME</a></li>
        </ul>
        ${marUrls}
    </nav>
`;

let eNavBar = document.createElement('div');
eNavBar.innerHTML = navBar;
let eNav = document.createElement('div');
eNav.classList.add('d-flex');
eNav.innerHTML = nav;
let eContent = document.createElement('div');
eContent.classList.add('content');
eContent.classList.add('p-4');
eContent.innerHTML = document.body.innerHTML;
eNav.append(eContent);
document.body.innerHTML = '';
document.body.append(eNavBar);
document.body.append(eNav);

// document.body.firstElementChild.insertBefore(eNav, document.body.firstElementChild.firstElementChild);
// document.body.insertBefore(eNavBar, document.body.firstElementChild);

let _sidebarListen = () => {
    // toggle sidebar when button clicked
    _$('.sidebar-toggle').addEventListener('click', function() {
        _$('.sidebar').classList.toggle('toggled');
    });

    // auto-expand submenu if an item is active
    let active = _$$('.sidebar .active');

    if (active.length > 0) {
        active.forEach(a => {
            if (a.parentElement.classList.contains('sidebar')) {
                for (let i = 0; i < a.parentElement.parentElement.children.length; i++) {
                    let item = a.parentElement.parentElement.children.item(i);
                    if (item.nodeName === 'a') {
                        item.setAttribute('aria-expanded', 'true');
                    }
                }
                a.parentElement.classList.add('show');
            }
        })
    }
};

if (document.readyState !== 'loading') {
    _sidebarListen();
}
else {
    document.addEventListener('DOMContentLoaded', _sidebarListen);
}
