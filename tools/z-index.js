// jQuery
$("*").each(function(k, v) {
    console.log(v.nodeName + " " + $(v).css("z-Index"));
})

// no jQuery
document.querySelectorAll('*').forEach((e, n) => {
    const win = e.ownerDocument.defaultView;
    const style = win.getComputedStyle(e, null);
    console.log(e.parentNode.nodeName + '.' + e.nodeName + " - " + style['zIndex']);
});
