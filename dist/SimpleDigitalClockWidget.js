(function () {

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
/*!
 * Simple Digital Clock Widget
 * Simple Digital Clock Widget – is a 🪶 light (11 kB gzip) HTML/JS based, easy-to-use digital clock widget with flexible settings, embedded seamlessly for your website. Build ⚡ instantly-interactive web widget without effort.
 *
 * Repo:    https://github.com/Timenow-zone/Simple-Digital-Clock-Widget
 * Demo:    https://utctime.info/
 * Related: https://todaysdatenow.com/
 * WP plugin: https://wordpress.org/plugins/simple-digital-clock/
 *
 * Version: 0.6.0
 * License: MIT
 * Author: dejurin (https://github.com/Timenow-zone)
 */ var $6bd3564550fc0340$var$n, $6bd3564550fc0340$export$41c562ebe57d11e2, $6bd3564550fc0340$var$u, $6bd3564550fc0340$export$a8257692ac88316c, $6bd3564550fc0340$var$i, $6bd3564550fc0340$var$r, $6bd3564550fc0340$var$o, $6bd3564550fc0340$var$e, $6bd3564550fc0340$var$f, $6bd3564550fc0340$var$c, $6bd3564550fc0340$var$a, $6bd3564550fc0340$var$s, $6bd3564550fc0340$var$h, $6bd3564550fc0340$var$p, $6bd3564550fc0340$var$v, $6bd3564550fc0340$var$y, $6bd3564550fc0340$var$d = {}, $6bd3564550fc0340$var$w = [], $6bd3564550fc0340$var$_ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, $6bd3564550fc0340$var$g = Array.isArray;
function $6bd3564550fc0340$var$m(n, l) {
    for(var u in l)n[u] = l[u];
    return n;
}
function $6bd3564550fc0340$var$b(n) {
    n && n.parentNode && n.parentNode.removeChild(n);
}
function $6bd3564550fc0340$export$c8a8987d4410bf2d(l, u, t) {
    var i, r, o, e = {};
    for(o in u)"key" == o ? i = u[o] : "ref" == o ? r = u[o] : e[o] = u[o];
    if (arguments.length > 2 && (e.children = arguments.length > 3 ? $6bd3564550fc0340$var$n.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for(o in l.defaultProps)void 0 === e[o] && (e[o] = l.defaultProps[o]);
    return $6bd3564550fc0340$var$x(l, e, i, r, null);
}
function $6bd3564550fc0340$var$x(n, t, i, r, o) {
    var e = {
        type: n,
        props: t,
        key: i,
        ref: r,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: null == o ? ++$6bd3564550fc0340$var$u : o,
        __i: -1,
        __u: 0
    };
    return null == o && null != $6bd3564550fc0340$export$41c562ebe57d11e2.vnode && $6bd3564550fc0340$export$41c562ebe57d11e2.vnode(e), e;
}
function $6bd3564550fc0340$export$7d1e3a5e95ceca43() {
    return {
        current: null
    };
}
function $6bd3564550fc0340$export$ffb0004e005737fa(n) {
    return n.children;
}
function $6bd3564550fc0340$export$16fa2f45be04daa8(n, l) {
    this.props = n, this.context = l;
}
function $6bd3564550fc0340$var$$(n, l) {
    if (null == l) return n.__ ? $6bd3564550fc0340$var$$(n.__, n.__i + 1) : null;
    for(var u; l < n.__k.length; l++)if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
    return "function" == typeof n.type ? $6bd3564550fc0340$var$$(n) : null;
}
function $6bd3564550fc0340$var$I(n) {
    if (n.__P && n.__d) {
        var u = n.__v, t = u.__e, i = [], r = [], o = $6bd3564550fc0340$var$m({}, u);
        o.__v = u.__v + 1, $6bd3564550fc0340$export$41c562ebe57d11e2.vnode && $6bd3564550fc0340$export$41c562ebe57d11e2.vnode(o), $6bd3564550fc0340$var$q(n.__P, o, u, n.__n, n.__P.namespaceURI, 32 & u.__u ? [
            t
        ] : null, i, null == t ? $6bd3564550fc0340$var$$(u) : t, !!(32 & u.__u), r), o.__v = u.__v, o.__.__k[o.__i] = o, $6bd3564550fc0340$var$D(i, o, r), u.__e = u.__ = null, o.__e != t && $6bd3564550fc0340$var$P(o);
    }
}
function $6bd3564550fc0340$var$P(n) {
    if (null != (n = n.__) && null != n.__c) return n.__e = n.__c.base = null, n.__k.some(function(l) {
        if (null != l && null != l.__e) return n.__e = n.__c.base = l.__e;
    }), $6bd3564550fc0340$var$P(n);
}
function $6bd3564550fc0340$var$A(n) {
    (!n.__d && (n.__d = !0) && $6bd3564550fc0340$var$i.push(n) && !$6bd3564550fc0340$var$H.__r++ || $6bd3564550fc0340$var$r != $6bd3564550fc0340$export$41c562ebe57d11e2.debounceRendering) && (($6bd3564550fc0340$var$r = $6bd3564550fc0340$export$41c562ebe57d11e2.debounceRendering) || $6bd3564550fc0340$var$o)($6bd3564550fc0340$var$H);
}
function $6bd3564550fc0340$var$H() {
    try {
        for(var n, l = 1; $6bd3564550fc0340$var$i.length;)$6bd3564550fc0340$var$i.length > l && $6bd3564550fc0340$var$i.sort($6bd3564550fc0340$var$e), n = $6bd3564550fc0340$var$i.shift(), l = $6bd3564550fc0340$var$i.length, $6bd3564550fc0340$var$I(n);
    } finally{
        $6bd3564550fc0340$var$i.length = $6bd3564550fc0340$var$H.__r = 0;
    }
}
function $6bd3564550fc0340$var$L(n, l, u, t, i, r, o, e, f, c, a) {
    var s, h, p, v, y, _, g = t && t.__k || $6bd3564550fc0340$var$w, m = l.length;
    for(f = $6bd3564550fc0340$var$T(u, l, g, f, m), s = 0; s < m; s++)null != (p = u.__k[s]) && (h = -1 != p.__i && g[p.__i] || $6bd3564550fc0340$var$d, p.__i = s, _ = $6bd3564550fc0340$var$q(n, p, h, i, r, o, e, f, c, a), v = p.__e, p.ref && h.ref != p.ref && (h.ref && $6bd3564550fc0340$var$J(h.ref, null, p), a.push(p.ref, p.__c || v, p)), null == y && null != v && (y = v), 4 & p.__u ? (f = $6bd3564550fc0340$var$j(p, f, n), h.__e && (h.__e = null)) : "function" == typeof p.type && void 0 !== _ ? f = _ : v && (f = v.nextSibling), p.__u &= -7);
    return u.__e = y, f;
}
function $6bd3564550fc0340$var$T(n, l, u, t, i) {
    var r, o, e, f, c, a = u.length, s = a, h = 0;
    for(n.__k = new Array(i), r = 0; r < i; r++)null != (o = l[r]) && "boolean" != typeof o && "function" != typeof o ? ("string" == typeof o || "number" == typeof o || "bigint" == typeof o || o.constructor == String ? o = n.__k[r] = $6bd3564550fc0340$var$x(null, o, null, null, null) : $6bd3564550fc0340$var$g(o) ? o = n.__k[r] = $6bd3564550fc0340$var$x($6bd3564550fc0340$export$ffb0004e005737fa, {
        children: o
    }, null, null, null) : void 0 === o.constructor && o.__b > 0 ? o = n.__k[r] = $6bd3564550fc0340$var$x(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : n.__k[r] = o, f = r + h, o.__ = n, o.__b = n.__b + 1, e = null, -1 != (c = o.__i = $6bd3564550fc0340$var$O(o, u, f, s)) && (s--, (e = u[c]) && (e.__u |= 2)), null == e || null == e.__v ? (-1 == c && (i > a ? h-- : i < a && h++), "function" != typeof o.type && (o.__u |= 4)) : c != f && (c == f - 1 ? h-- : c == f + 1 ? h++ : (c > f ? h-- : h++, o.__u |= 4))) : n.__k[r] = null;
    if (s) for(r = 0; r < a; r++)null != (e = u[r]) && 0 == (2 & e.__u) && (e.__e == t && (t = $6bd3564550fc0340$var$$(e)), $6bd3564550fc0340$var$K(e, e));
    return t;
}
function $6bd3564550fc0340$var$j(n, l, u) {
    var t, i;
    if ("function" == typeof n.type) {
        for(t = n.__k, i = 0; t && i < t.length; i++)t[i] && (t[i].__ = n, l = $6bd3564550fc0340$var$j(t[i], l, u));
        return l;
    }
    n.__e != l && (l && n.type && !l.parentNode && (l = $6bd3564550fc0340$var$$(n)), l = u.insertBefore(n.__e, l || null));
    do l = l && l.nextSibling;
    while (null != l && 8 == l.nodeType);
    return l;
}
function $6bd3564550fc0340$export$47e4c5b300681277(n, l) {
    return l = l || [], null == n || "boolean" == typeof n || ($6bd3564550fc0340$var$g(n) ? n.some(function(n) {
        $6bd3564550fc0340$export$47e4c5b300681277(n, l);
    }) : l.push(n)), l;
}
function $6bd3564550fc0340$var$O(n, l, u, t) {
    var i, r, o, e = n.key, f = n.type, c = l[u], a = null != c && 0 == (2 & c.__u);
    if (null === c && null == e || a && e == c.key && f == c.type) return u;
    if (t > (a ? 1 : 0)) {
        for(i = u - 1, r = u + 1; i >= 0 || r < l.length;)if (null != (c = l[o = i >= 0 ? i-- : r++]) && 0 == (2 & c.__u) && e == c.key && f == c.type) return o;
    }
    return -1;
}
function $6bd3564550fc0340$var$z(n, l, u) {
    "-" == l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || $6bd3564550fc0340$var$_.test(l) ? u : u + "px";
}
function $6bd3564550fc0340$var$N(n, l, u, t, i) {
    var r, o;
    n: if ("style" == l) {
        if ("string" == typeof u) n.style.cssText = u;
        else {
            if ("string" == typeof t && (n.style.cssText = t = ""), t) for(l in t)u && l in u || $6bd3564550fc0340$var$z(n.style, l, "");
            if (u) for(l in u)t && u[l] == t[l] || $6bd3564550fc0340$var$z(n.style, l, u[l]);
        }
    } else if ("o" == l[0] && "n" == l[1]) r = l != (l = l.replace($6bd3564550fc0340$var$s, "$1")), o = l.toLowerCase(), l = o in n || "onFocusOut" == l || "onFocusIn" == l ? o.slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? t ? u[$6bd3564550fc0340$var$a] = t[$6bd3564550fc0340$var$a] : (u[$6bd3564550fc0340$var$a] = $6bd3564550fc0340$var$h, n.addEventListener(l, r ? $6bd3564550fc0340$var$v : $6bd3564550fc0340$var$p, r)) : n.removeEventListener(l, r ? $6bd3564550fc0340$var$v : $6bd3564550fc0340$var$p, r);
    else {
        if ("http://www.w3.org/2000/svg" == i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
            n[l] = null == u ? "" : u;
            break n;
        } catch (n) {}
        "function" == typeof u || (null == u || !1 === u && "-" != l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == u ? "" : u));
    }
}
function $6bd3564550fc0340$var$V(n) {
    return function(u) {
        if (this.l) {
            var t = this.l[u.type + n];
            if (null == u[$6bd3564550fc0340$var$c]) u[$6bd3564550fc0340$var$c] = $6bd3564550fc0340$var$h++;
            else if (u[$6bd3564550fc0340$var$c] < t[$6bd3564550fc0340$var$a]) return;
            return t($6bd3564550fc0340$export$41c562ebe57d11e2.event ? $6bd3564550fc0340$export$41c562ebe57d11e2.event(u) : u);
        }
    };
}
function $6bd3564550fc0340$var$q(n, u, t, i, r, o, e, f, c, a) {
    var s, h, p, v, y, d, _, k, x, M, I, P, A, H, T, j, F = u.type;
    if (void 0 !== u.constructor) return null;
    128 & t.__u && (c = !!(32 & t.__u), o = [
        f = u.__e = t.__e
    ]), (s = $6bd3564550fc0340$export$41c562ebe57d11e2.__b) && s(u);
    n: if ("function" == typeof F) {
        h = e.length;
        try {
            if (x = u.props, M = F.prototype && F.prototype.render, I = (s = F.contextType) && i[s.__c], P = s ? I ? I.props.value : s.__ : i, t.__c ? k = (p = u.__c = t.__c).__ = p.__E : (M ? u.__c = p = new F(x, P) : (u.__c = p = new $6bd3564550fc0340$export$16fa2f45be04daa8(x, P), p.constructor = F, p.render = $6bd3564550fc0340$var$Q), I && I.sub(p), p.state || (p.state = {}), p.__n = i, v = p.__d = !0, p.__h = [], p._sb = []), M && null == p.__s && (p.__s = p.state), M && null != F.getDerivedStateFromProps && (p.__s == p.state && (p.__s = $6bd3564550fc0340$var$m({}, p.__s)), $6bd3564550fc0340$var$m(p.__s, F.getDerivedStateFromProps(x, p.__s))), y = p.props, d = p.state, p.__v = u, v) M && null == F.getDerivedStateFromProps && null != p.componentWillMount && p.componentWillMount(), M && null != p.componentDidMount && p.__h.push(p.componentDidMount);
            else {
                if (M && null == F.getDerivedStateFromProps && x !== y && null != p.componentWillReceiveProps && p.componentWillReceiveProps(x, P), u.__v == t.__v || !p.__e && null != p.shouldComponentUpdate && !1 === p.shouldComponentUpdate(x, p.__s, P)) {
                    u.__v != t.__v && (p.props = x, p.state = p.__s, p.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.some(function(n) {
                        n && (n.__ = u);
                    }), $6bd3564550fc0340$var$w.push.apply(p.__h, p._sb), p._sb = [], p.__h.length && e.push(p), f = $6bd3564550fc0340$var$$(t);
                    break n;
                }
                null != p.componentWillUpdate && p.componentWillUpdate(x, p.__s, P), M && null != p.componentDidUpdate && p.__h.push(function() {
                    p.componentDidUpdate(y, d, _);
                });
            }
            if (p.context = P, p.props = x, p.__P = n, p.__e = !1, A = $6bd3564550fc0340$export$41c562ebe57d11e2.__r, H = 0, M) p.state = p.__s, p.__d = !1, A && A(u), s = p.render(p.props, p.state, p.context), $6bd3564550fc0340$var$w.push.apply(p.__h, p._sb), p._sb = [];
            else do p.__d = !1, A && A(u), s = p.render(p.props, p.state, p.context), p.state = p.__s;
            while (p.__d && ++H < 25);
            p.state = p.__s, null != p.getChildContext && (i = $6bd3564550fc0340$var$m($6bd3564550fc0340$var$m({}, i), p.getChildContext())), M && !v && null != p.getSnapshotBeforeUpdate && (_ = p.getSnapshotBeforeUpdate(y, d)), T = null != s && s.type === $6bd3564550fc0340$export$ffb0004e005737fa && null == s.key ? $6bd3564550fc0340$var$E(s.props.children) : s, f = $6bd3564550fc0340$var$L(n, $6bd3564550fc0340$var$g(T) ? T : [
                T
            ], u, t, i, r, o, e, f, c, a), p.base = u.__e, u.__u &= -161, p.__h.length && e.push(p), k && (p.__E = p.__ = null);
        } catch (n) {
            if (e.length = h, u.__v = null, c || null != o) {
                if (n.then) {
                    for(u.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling;)f = f.nextSibling;
                    null != o && (o[o.indexOf(f)] = null), u.__e = f;
                } else if (null != o) for(j = o.length; j--;)$6bd3564550fc0340$var$b(o[j]);
            } else u.__e = t.__e;
            null == u.__k && (u.__k = t.__k || []), n.then || $6bd3564550fc0340$var$B(u), $6bd3564550fc0340$export$41c562ebe57d11e2.__e(n, u, t);
        }
    } else null == o && u.__v == t.__v ? (u.__k = t.__k, u.__e = t.__e) : f = u.__e = $6bd3564550fc0340$var$G(t.__e, u, t, i, r, o, e, c, a);
    return (s = $6bd3564550fc0340$export$41c562ebe57d11e2.diffed) && s(u), 128 & u.__u ? void 0 : f;
}
function $6bd3564550fc0340$var$B(n) {
    n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some($6bd3564550fc0340$var$B));
}
function $6bd3564550fc0340$var$D(n, u, t) {
    for(var i = 0; i < t.length; i++)$6bd3564550fc0340$var$J(t[i], t[++i], t[++i]);
    $6bd3564550fc0340$export$41c562ebe57d11e2.__c && $6bd3564550fc0340$export$41c562ebe57d11e2.__c(u, n), n.some(function(u) {
        try {
            n = u.__h, u.__h = [], n.some(function(n) {
                n.call(u);
            });
        } catch (n) {
            $6bd3564550fc0340$export$41c562ebe57d11e2.__e(n, u.__v);
        }
    });
}
function $6bd3564550fc0340$var$E(n) {
    return "object" != typeof n || null == n || n.__b > 0 ? n : $6bd3564550fc0340$var$g(n) ? n.map($6bd3564550fc0340$var$E) : void 0 !== n.constructor ? null : $6bd3564550fc0340$var$m({}, n);
}
function $6bd3564550fc0340$var$G(u, t, i, r, o, e, f, c, a) {
    var s, h, p, v, y, w, _, m = i.props || $6bd3564550fc0340$var$d, k = t.props, x = t.type;
    if ("svg" == x ? o = "http://www.w3.org/2000/svg" : "math" == x ? o = "http://www.w3.org/1998/Math/MathML" : o || (o = "http://www.w3.org/1999/xhtml"), null != e) {
        for(s = 0; s < e.length; s++)if ((y = e[s]) && "setAttribute" in y == !!x && (x ? y.localName == x : 3 == y.nodeType)) {
            u = y, e[s] = null;
            break;
        }
    }
    if (null == u) {
        if (null == x) return document.createTextNode(k);
        u = document.createElementNS(o, x, k.is && k), c && ($6bd3564550fc0340$export$41c562ebe57d11e2.__m && $6bd3564550fc0340$export$41c562ebe57d11e2.__m(t, e), c = !1), e = null;
    }
    if (null == x) m === k || c && u.data == k || (u.data = k);
    else {
        if (e = "textarea" == x && null != k.defaultValue ? null : e && $6bd3564550fc0340$var$n.call(u.childNodes), !c && null != e) for(m = {}, s = 0; s < u.attributes.length; s++)m[(y = u.attributes[s]).name] = y.value;
        for(s in m)y = m[s], "dangerouslySetInnerHTML" == s ? p = y : "children" == s || s in k || "value" == s && "defaultValue" in k || "checked" == s && "defaultChecked" in k || $6bd3564550fc0340$var$N(u, s, null, y, o);
        for(s in k)y = k[s], "children" == s ? v = y : "dangerouslySetInnerHTML" == s ? h = y : "value" == s ? w = y : "checked" == s ? _ = y : c && "function" != typeof y || m[s] === y || $6bd3564550fc0340$var$N(u, s, y, m[s], o);
        if (h) c || p && (h.__html == p.__html || h.__html == u.innerHTML) || (u.innerHTML = h.__html), t.__k = [];
        else if (p && (u.innerHTML = ""), $6bd3564550fc0340$var$L("template" == t.type ? u.content : u, $6bd3564550fc0340$var$g(v) ? v : [
            v
        ], t, i, r, "foreignObject" == x ? "http://www.w3.org/1999/xhtml" : o, e, f, e ? e[0] : i.__k && $6bd3564550fc0340$var$$(i, 0), c, a), null != e) for(s = e.length; s--;)$6bd3564550fc0340$var$b(e[s]);
        c && "textarea" != x || (s = "value", "progress" == x && null == w ? u.removeAttribute("value") : null != w && (w !== u[s] || "progress" == x && !w || "option" == x && w != m[s]) && $6bd3564550fc0340$var$N(u, s, w, m[s], o), s = "checked", null != _ && _ != u[s] && $6bd3564550fc0340$var$N(u, s, _, m[s], o));
    }
    return u;
}
function $6bd3564550fc0340$var$J(n, u, t) {
    try {
        if ("function" == typeof n) {
            var i = "function" == typeof n.__u;
            i && n.__u(), i && null == u || (n.__u = n(u));
        } else n.current = u;
    } catch (n) {
        $6bd3564550fc0340$export$41c562ebe57d11e2.__e(n, t);
    }
}
function $6bd3564550fc0340$var$K(n, u, t) {
    var i, r;
    if ($6bd3564550fc0340$export$41c562ebe57d11e2.unmount && $6bd3564550fc0340$export$41c562ebe57d11e2.unmount(n), (i = n.ref) && (i.current && i.current != n.__e || $6bd3564550fc0340$var$J(i, null, u)), null != (i = n.__c)) {
        if (i.componentWillUnmount) try {
            i.componentWillUnmount();
        } catch (n) {
            $6bd3564550fc0340$export$41c562ebe57d11e2.__e(n, u);
        }
        i.base = i.__P = i.__n = null;
    }
    if (i = n.__k) for(r = 0; r < i.length; r++)i[r] && $6bd3564550fc0340$var$K(i[r], u, t || "function" != typeof n.type);
    t || $6bd3564550fc0340$var$b(n.__e), n.__c = n.__ = n.__e = void 0;
}
function $6bd3564550fc0340$var$Q(n, l, u) {
    return this.constructor(n, u);
}
function $6bd3564550fc0340$export$b3890eb0ae9dca99(u, t, i) {
    var r, o, e, f;
    t == document && (t = document.documentElement), $6bd3564550fc0340$export$41c562ebe57d11e2.__ && $6bd3564550fc0340$export$41c562ebe57d11e2.__(u, t), o = (r = "function" == typeof i) ? null : i && i.__k || t.__k, e = [], f = [], $6bd3564550fc0340$var$q(t, u = (!r && i || t).__k = $6bd3564550fc0340$export$c8a8987d4410bf2d($6bd3564550fc0340$export$ffb0004e005737fa, null, [
        u
    ]), o || $6bd3564550fc0340$var$d, $6bd3564550fc0340$var$d, t.namespaceURI, !r && i ? [
        i
    ] : o ? null : t.firstChild ? $6bd3564550fc0340$var$n.call(t.childNodes) : null, e, !r && i ? i : o ? o.__e : t.firstChild, r, f), $6bd3564550fc0340$var$D(e, u, f), u.props.children = null;
}
function $6bd3564550fc0340$export$fa8d919ba61d84db(n, l) {
    $6bd3564550fc0340$export$b3890eb0ae9dca99(n, l, $6bd3564550fc0340$export$fa8d919ba61d84db);
}
function $6bd3564550fc0340$export$e530037191fcd5d7(l, u, t) {
    var i, r, o, e, f = $6bd3564550fc0340$var$m({}, l.props);
    for(o in l.type && l.type.defaultProps && (e = l.type.defaultProps), u)"key" == o ? i = u[o] : "ref" == o ? r = u[o] : f[o] = void 0 === u[o] && null != e ? e[o] : u[o];
    return arguments.length > 2 && (f.children = arguments.length > 3 ? $6bd3564550fc0340$var$n.call(arguments, 2) : t), $6bd3564550fc0340$var$x(l.type, f, i || l.key, r || l.ref, null);
}
function $6bd3564550fc0340$export$fd42f52fd3ae1109(n) {
    function l(n) {
        var u, t;
        return this.getChildContext || (u = new Set, (t = {})[l.__c] = this, this.getChildContext = function() {
            return t;
        }, this.componentWillUnmount = function() {
            u = null;
        }, this.shouldComponentUpdate = function(n) {
            this.props.value != n.value && u.forEach(function(n) {
                n.__e = !0, $6bd3564550fc0340$var$A(n);
            });
        }, this.sub = function(n) {
            u.add(n);
            var l = n.componentWillUnmount;
            n.componentWillUnmount = function() {
                u && u.delete(n), l && l.call(n);
            };
        }), n.children;
    }
    return l.__c = "__cC" + $6bd3564550fc0340$var$y++, l.__ = n, l.Provider = l.__l = (l.Consumer = function(n, l) {
        return n.children(l);
    }).contextType = l, l;
}
$6bd3564550fc0340$var$n = $6bd3564550fc0340$var$w.slice, $6bd3564550fc0340$export$41c562ebe57d11e2 = {
    __e: function(n, l, u, t) {
        for(var i, r, o; l = l.__;)if ((i = l.__c) && !i.__) try {
            if ((r = i.constructor) && null != r.getDerivedStateFromError && (i.setState(r.getDerivedStateFromError(n)), o = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), o = i.__d), o) return i.__E = i;
        } catch (l) {
            n = l;
        }
        throw n;
    }
}, $6bd3564550fc0340$var$u = 0, $6bd3564550fc0340$export$a8257692ac88316c = function(n) {
    return null != n && void 0 === n.constructor;
}, $6bd3564550fc0340$export$16fa2f45be04daa8.prototype.setState = function(n, l) {
    var u;
    u = null != this.__s && this.__s != this.state ? this.__s : this.__s = $6bd3564550fc0340$var$m({}, this.state), "function" == typeof n && (n = n($6bd3564550fc0340$var$m({}, u), this.props)), n && $6bd3564550fc0340$var$m(u, n), null != n && this.__v && (l && this._sb.push(l), $6bd3564550fc0340$var$A(this));
}, $6bd3564550fc0340$export$16fa2f45be04daa8.prototype.forceUpdate = function(n) {
    this.__v && (this.__e = !0, n && this.__h.push(n), $6bd3564550fc0340$var$A(this));
}, $6bd3564550fc0340$export$16fa2f45be04daa8.prototype.render = $6bd3564550fc0340$export$ffb0004e005737fa, $6bd3564550fc0340$var$i = [], $6bd3564550fc0340$var$o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, $6bd3564550fc0340$var$e = function(n, l) {
    return n.__v.__b - l.__v.__b;
}, $6bd3564550fc0340$var$H.__r = 0, $6bd3564550fc0340$var$f = Math.random().toString(8), $6bd3564550fc0340$var$c = "__d" + $6bd3564550fc0340$var$f, $6bd3564550fc0340$var$a = "__a" + $6bd3564550fc0340$var$f, $6bd3564550fc0340$var$s = /(PointerCapture)$|Capture$/i, $6bd3564550fc0340$var$h = 0, $6bd3564550fc0340$var$p = $6bd3564550fc0340$var$V(!1), $6bd3564550fc0340$var$v = $6bd3564550fc0340$var$V(!0), $6bd3564550fc0340$var$y = 0;



function $6f0b21dd6dcd5f7b$var$i() {
    return $6f0b21dd6dcd5f7b$var$i = Object.assign ? Object.assign.bind() : function(t) {
        for(var e = 1; e < arguments.length; e++){
            var n = arguments[e];
            for(var o in n)Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
        }
        return t;
    }, $6f0b21dd6dcd5f7b$var$i.apply(this, arguments);
}
function $6f0b21dd6dcd5f7b$var$s(t, e) {
    if (null == t) return {};
    var n, o, r = {}, i = Object.keys(t);
    for(o = 0; o < i.length; o++)e.indexOf(n = i[o]) >= 0 || (r[n] = t[n]);
    return r;
}
var $6f0b21dd6dcd5f7b$var$a = [
    "context",
    "children"
], $6f0b21dd6dcd5f7b$var$l = [
    "useFragment"
];
function $6f0b21dd6dcd5f7b$export$2e2bcd8739ae039(t, e, n, o) {
    function r() {
        var e, n = Reflect.construct(HTMLElement, [], r);
        return n._vdomComponent = t, o && o.shadow ? (n._root = n.attachShadow({
            mode: o.mode || "open",
            serializable: null != (e = o.serializable) && e
        }), o.adoptedStyleSheets && (n._root.adoptedStyleSheets = o.adoptedStyleSheets)) : n._root = n, n;
    }
    return (r.prototype = Object.create(HTMLElement.prototype)).constructor = r, r.prototype.connectedCallback = function() {
        $6f0b21dd6dcd5f7b$var$d.call(this, o);
    }, r.prototype.attributeChangedCallback = $6f0b21dd6dcd5f7b$var$h, r.prototype.disconnectedCallback = $6f0b21dd6dcd5f7b$var$f, n = n || t.observedAttributes || Object.keys(t.propTypes || {}), r.observedAttributes = n, t.formAssociated && (r.formAssociated = !0), n.forEach(function(t) {
        Object.defineProperty(r.prototype, t, {
            get: function() {
                return this._vdom ? this._vdom.props[t] : this._props[t];
            },
            set: function(e) {
                this._vdom ? this.attributeChangedCallback(t, null, e) : (this._props || (this._props = {}), this._props[t] = e);
                var n = typeof e;
                null != e && "string" !== n && "boolean" !== n && "number" !== n || this.setAttribute(t, e);
            }
        });
    }), customElements.define(e || t.tagName || t.displayName || t.name, r), r;
}
function $6f0b21dd6dcd5f7b$var$u(t) {
    this.getChildContext = function() {
        return t.context;
    };
    var e = t.children, n = $6f0b21dd6dcd5f7b$var$s(t, $6f0b21dd6dcd5f7b$var$a);
    return (0, $6bd3564550fc0340$export$e530037191fcd5d7)(e, n);
}
function $6f0b21dd6dcd5f7b$var$d(o) {
    var r = new CustomEvent("_preact", {
        detail: {},
        bubbles: !0,
        cancelable: !0
    });
    this.dispatchEvent(r), this._vdom = (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)($6f0b21dd6dcd5f7b$var$u, $6f0b21dd6dcd5f7b$var$i({}, this._props, {
        context: r.detail.context
    }), $6f0b21dd6dcd5f7b$var$v(this, this._vdomComponent, o)), (this.hasAttribute("hydrate") ? (0, $6bd3564550fc0340$export$fa8d919ba61d84db) : (0, $6bd3564550fc0340$export$b3890eb0ae9dca99))(this._vdom, this._root);
}
function $6f0b21dd6dcd5f7b$var$p(t) {
    return t.replace(/-(\w)/g, function(t, e) {
        return e ? e.toUpperCase() : "";
    });
}
function $6f0b21dd6dcd5f7b$var$h(t, e, r) {
    if (this._vdom) {
        var i = {};
        i[t] = r = null == r ? void 0 : r, i[$6f0b21dd6dcd5f7b$var$p(t)] = r, this._vdom = (0, $6bd3564550fc0340$export$e530037191fcd5d7)(this._vdom, i), (0, $6bd3564550fc0340$export$b3890eb0ae9dca99)(this._vdom, this._root);
    }
}
function $6f0b21dd6dcd5f7b$var$f() {
    (0, $6bd3564550fc0340$export$b3890eb0ae9dca99)(this._vdom = null, this._root);
}
function $6f0b21dd6dcd5f7b$var$m(e, n) {
    var o = this, a = e.useFragment, c = $6f0b21dd6dcd5f7b$var$s(e, $6f0b21dd6dcd5f7b$var$l);
    return (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)(a ? (0, $6bd3564550fc0340$export$ffb0004e005737fa) : "slot", $6f0b21dd6dcd5f7b$var$i({}, c, {
        ref: function(t) {
            t ? (o.ref = t, o._listener || (o._listener = function(t) {
                t.stopPropagation(), t.detail.context = n;
            }, t.addEventListener("_preact", o._listener))) : o.ref.removeEventListener("_preact", o._listener);
        }
    }));
}
function $6f0b21dd6dcd5f7b$var$v(e, n, o) {
    if (3 === e.nodeType) return e.data;
    if (1 !== e.nodeType) return null;
    var r = [], i = {}, s = 0, a = e.attributes, l = e.childNodes;
    for(s = a.length; s--;)"slot" !== a[s].name && (i[a[s].name] = a[s].value, i[$6f0b21dd6dcd5f7b$var$p(a[s].name)] = a[s].value);
    for(s = l.length; s--;){
        var c = $6f0b21dd6dcd5f7b$var$v(l[s], null, o), u = l[s].slot;
        u ? i[u] = (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)($6f0b21dd6dcd5f7b$var$m, {
            name: u
        }, c) : r[s] = c;
    }
    var d = !(!o || !o.shadow), h = n ? (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)($6f0b21dd6dcd5f7b$var$m, {
        useFragment: !d
    }, r) : r;
    return !d && n && (e.innerHTML = ""), (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)(n || e.nodeName.toLowerCase(), i, h);
}


function $c199437f4e4422ea$var$r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) {
        if (Array.isArray(e)) {
            var o = e.length;
            for(t = 0; t < o; t++)e[t] && (f = $c199437f4e4422ea$var$r(e[t])) && (n && (n += " "), n += f);
        } else for(f in e)e[f] && (n && (n += " "), n += f);
    }
    return n;
}
function $c199437f4e4422ea$export$4f5d2d50c9deca37() {
    for(var e, t, f = 0, n = "", o = arguments.length; f < o; f++)(e = arguments[f]) && (t = $c199437f4e4422ea$var$r(e)) && (n && (n += " "), n += t);
    return n;
}
var $c199437f4e4422ea$export$2e2bcd8739ae039 = $c199437f4e4422ea$export$4f5d2d50c9deca37;


var $311a3960f67ea2d3$exports = {};
$311a3960f67ea2d3$exports = "*, :before, :after, ::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: #3b82f680;\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n  --tw-contain-size:  ;\n  --tw-contain-layout:  ;\n  --tw-contain-paint:  ;\n  --tw-contain-style:  ;\n}\n\n*, :before, :after {\n  box-sizing: border-box;\n  border: 0 solid #e5e7eb;\n}\n\n:before, :after {\n  --tw-content: \"\";\n}\n\nhtml, :host {\n  -webkit-text-size-adjust: 100%;\n  tab-size: 4;\n  font-feature-settings: normal;\n  font-variation-settings: normal;\n  -webkit-tap-highlight-color: transparent;\n  font-family: ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n  line-height: 1.5;\n}\n\nbody {\n  line-height: inherit;\n  margin: 0;\n}\n\nhr {\n  height: 0;\n  color: inherit;\n  border-top-width: 1px;\n}\n\nabbr:where([title]) {\n  text-decoration: underline dotted;\n}\n\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\na {\n  color: inherit;\n  -webkit-text-decoration: inherit;\n  text-decoration: inherit;\n}\n\nb, strong {\n  font-weight: bolder;\n}\n\ncode, kbd, samp, pre {\n  font-feature-settings: normal;\n  font-variation-settings: normal;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;\n  font-size: 1em;\n}\n\nsmall {\n  font-size: 80%;\n}\n\nsub, sup {\n  vertical-align: baseline;\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n}\n\nsub {\n  bottom: -.25em;\n}\n\nsup {\n  top: -.5em;\n}\n\ntable {\n  text-indent: 0;\n  border-color: inherit;\n  border-collapse: collapse;\n}\n\nbutton, input, optgroup, select, textarea {\n  font-feature-settings: inherit;\n  font-variation-settings: inherit;\n  font-family: inherit;\n  font-size: 100%;\n  font-weight: inherit;\n  line-height: inherit;\n  letter-spacing: inherit;\n  color: inherit;\n  margin: 0;\n  padding: 0;\n}\n\nbutton, select {\n  text-transform: none;\n}\n\nbutton, input:where([type=\"button\"]), input:where([type=\"reset\"]), input:where([type=\"submit\"]) {\n  -webkit-appearance: button;\n  background-color: #0000;\n  background-image: none;\n}\n\n:-moz-focusring {\n  outline: auto;\n}\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\nprogress {\n  vertical-align: baseline;\n}\n\n::-webkit-inner-spin-button {\n  height: auto;\n}\n\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n[type=\"search\"] {\n  -webkit-appearance: textfield;\n  outline-offset: -2px;\n}\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  font: inherit;\n}\n\nsummary {\n  display: list-item;\n}\n\nblockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol, ul, menu {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\ndialog {\n  padding: 0;\n}\n\ntextarea {\n  resize: vertical;\n}\n\ninput::placeholder, textarea::placeholder {\n  opacity: 1;\n  color: #9ca3af;\n}\n\nbutton, [role=\"button\"] {\n  cursor: pointer;\n}\n\n:disabled {\n  cursor: default;\n}\n\nimg, svg, video, canvas, audio, iframe, embed, object {\n  vertical-align: middle;\n  display: block;\n}\n\nimg, video {\n  max-width: 100%;\n  height: auto;\n}\n\n[hidden]:where(:not([hidden=\"until-found\"])) {\n  display: none;\n}\n\n.static {\n  position: static;\n}\n\n.relative {\n  position: relative;\n}\n\n.block {\n  display: block;\n}\n\n.resize {\n  resize: both;\n}\n\n.rounded {\n  border-radius: .25rem;\n}\n\n.border {\n  border-width: 1px;\n}\n\n.shadow {\n  --tw-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px #00000040;\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-lg {\n  --tw-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-md {\n  --tw-shadow: 0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a;\n  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-sm {\n  --tw-shadow: 0 1px 2px 0 #0000000d;\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-xl {\n  --tw-shadow: 0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;\n  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter, backdrop-filter;\n  transition-duration: .15s;\n  transition-timing-function: cubic-bezier(.4, 0, .2, 1);\n}\n\n.widget {\n  text-transform: uppercase;\n  justify-content: center;\n  align-items: center;\n  padding-top: .5rem;\n  padding-bottom: .5rem;\n  display: flex;\n}\n\n.font-family {\n  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Liberation Sans, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n}\n";


function $270bff5585dd7bb3$var$contrastColor(inputColor) {
    // --- Helpers --------------------------------------------------------------
    // Clamp number into [min, max]
    const clamp = (v, min, max)=>Math.min(Math.max(v, min), max);
    // Convert sRGB channel [0..255] to linear light
    const srgbToLinear = (c255)=>{
        const c = c255 / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    // Relative luminance per WCAG (0..1)
    const relativeLuminance = (r, g, b)=>{
        const R = srgbToLinear(r);
        const G = srgbToLinear(g);
        const B = srgbToLinear(b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };
    // Contrast ratio between two luminances (L1 lighter, L2 darker)
    const contrastRatio = (L1, L2)=>(L1 + 0.05) / (L2 + 0.05);
    // Parse #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    const parseHex = (hexInput)=>{
        const hex = hexInput.slice(1).trim();
        const len = hex.length;
        if (len !== 3 && len !== 4 && len !== 6 && len !== 8) throw new Error("Invalid HEX length. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.");
        const toByte = (h)=>parseInt(h, 16);
        let r, g, b;
        if (len === 3 || len === 4) {
            // Expand short form (#abc[#d] -> #aabbcc[dd])
            r = toByte(hex[0] + hex[0]);
            g = toByte(hex[1] + hex[1]);
            b = toByte(hex[2] + hex[2]);
        // alpha (hex[3]) is ignored for contrast background
        } else {
            r = toByte(hex.slice(0, 2));
            g = toByte(hex.slice(2, 4));
            b = toByte(hex.slice(4, 6));
        // alpha (hex[6..8]) is ignored
        }
        if ([
            r,
            g,
            b
        ].some((v)=>Number.isNaN(v))) throw new Error("Invalid HEX digits.");
        return {
            r: r,
            g: g,
            b: b
        };
    };
    // Parse rgb()/rgba(); supports integers 0..255 or percentages 0%..100%
    const parseRgbFunc = (rgbInput)=>{
        // Normalize and extract content inside parentheses
        const open = rgbInput.indexOf("(");
        const close = rgbInput.lastIndexOf(")");
        if (open === -1 || close === -1 || close <= open) throw new Error("Malformed rgb()/rgba() string.");
        const inner = rgbInput.slice(open + 1, close).trim();
        // Split by commas, tolerate extra spaces
        const parts = inner.split(/\s*,\s*/);
        if (parts.length < 3) throw new Error("rgb()/rgba() must have at least 3 components.");
        const parseChannel = (s)=>{
            // Percentage form e.g., "80%"
            const percentMatch = s.match(/^(-?\d+(?:\.\d+)?)%$/);
            if (percentMatch) {
                const p = parseFloat(percentMatch[1]);
                return clamp(Math.round(p / 100 * 255), 0, 255);
            }
            // Integer 0..255 (also accepts floats and rounds)
            const n = Number(s);
            if (Number.isNaN(n)) throw new Error("Invalid RGB channel value.");
            return clamp(Math.round(n), 0, 255);
        };
        const r = parseChannel(parts[0]);
        const g = parseChannel(parts[1]);
        const b = parseChannel(parts[2]);
        // Alpha (parts[3]) is intentionally ignored for background color
        return {
            r: r,
            g: g,
            b: b
        };
    };
    // --- Main -----------------------------------------------------------------
    let r, g, b;
    const color = inputColor.trim();
    if (color.startsWith("#")) ({ r: r, g: g, b: b } = parseHex(color));
    else if (color.toLowerCase().startsWith("rgb")) ({ r: r, g: g, b: b } = parseRgbFunc(color));
    else // Keep API behavior: only HEX or rgb()/rgba() are accepted
    throw new Error("Color format not recognized. Use HEX (#RRGGBB, #RGB, with optional alpha) or rgb()/rgba().");
    // Compute relative luminance
    const Lbg = relativeLuminance(r, g, b);
    // Compare contrast vs black (#000) and white (#fff); pick better
    const Lwhite = 1.0; // luminance of #fff
    const Lblack = 0.0; // luminance of #000
    const contrastWithWhite = contrastRatio(Math.max(Lwhite, Lbg), Math.min(Lwhite, Lbg));
    const contrastWithBlack = contrastRatio(Math.max(Lbg, Lblack), Math.min(Lbg, Lblack));
    // Return "black" or "white" to keep original API
    return contrastWithBlack >= contrastWithWhite ? "black" : "white";
}
var $270bff5585dd7bb3$export$2e2bcd8739ae039 = $270bff5585dd7bb3$var$contrastColor;


// darkenColor.ts
function $ac4001033fac7d2f$var$darkenColor(color, percent) {
    // --- Helpers --------------------------------------------------------------
    const clamp = (v, min, max)=>Math.min(Math.max(v, min), max);
    const toByte = (n)=>clamp(Math.floor(n), 0, 255); // <= floor for stable expectations
    // Clamp percent to [-1, 1]; negative => darken, positive => lighten
    const p = Math.max(-1, Math.min(1, percent));
    // Parse #RGB/#RGBA/#RRGGBB/#RRGGBBAA
    const parseHex = (hexInput)=>{
        const hex = hexInput.slice(1).trim();
        const len = hex.length;
        if (![
            3,
            4,
            6,
            8
        ].includes(len)) throw new Error("Invalid HEX length. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA.");
        const expand = (c)=>c + c;
        let r, g, b, a = null;
        if (len === 3 || len === 4) {
            r = parseInt(expand(hex[0]), 16);
            g = parseInt(expand(hex[1]), 16);
            b = parseInt(expand(hex[2]), 16);
            if (len === 4) a = parseInt(expand(hex[3]), 16) / 255;
        } else {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            if (len === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
        }
        if ([
            r,
            g,
            b
        ].some(Number.isNaN)) throw new Error("Invalid HEX digits.");
        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    };
    // Parse rgb()/rgba(); supports integers and percentages
    const parseRgb = (rgbInput)=>{
        const open = rgbInput.indexOf("(");
        const close = rgbInput.lastIndexOf(")");
        if (open === -1 || close === -1 || close <= open) throw new Error("Malformed rgb()/rgba().");
        const inner = rgbInput.slice(open + 1, close).trim();
        const parts = inner.split(/\s*,\s*/);
        if (parts.length < 3) throw new Error("rgb()/rgba() must have at least 3 components.");
        const parseChan = (s)=>{
            const m = s.match(/^(-?\d+(?:\.\d+)?)%$/);
            if (m) return toByte(parseFloat(m[1]) / 100 * 255);
            const n = Number(s);
            if (Number.isNaN(n)) throw new Error("Invalid RGB channel value.");
            return toByte(n);
        };
        const r = parseChan(parts[0]);
        const g = parseChan(parts[1]);
        const b = parseChan(parts[2]);
        let a = null;
        if (parts[3] !== undefined) {
            const an = Number(parts[3]);
            if (Number.isNaN(an)) throw new Error("Invalid alpha channel.");
            a = clamp(an, 0, 1);
        }
        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    };
    // --- Parse input ----------------------------------------------------------
    const src = color.trim();
    const hasHex = src.startsWith("#");
    const isRGBA = src.toLowerCase().startsWith("rgba");
    const isRGB = src.toLowerCase().startsWith("rgb");
    let r, g, b, a;
    if (hasHex) ({ r: r, g: g, b: b, a: a } = parseHex(src));
    else if (isRGB) {
        ({ r: r, g: g, b: b, a: a } = parseRgb(src));
        if (a === null) a = isRGBA ? 1 : null; // keep family: rgba stays rgba, rgb stays rgb
    } else throw new Error("Invalid color format. Use HEX (#...[,AA]) or rgb()/rgba().");
    // --- Apply lighten/darken -------------------------------------------------
    const target = p < 0 ? 0 : 255;
    const pp = Math.abs(p);
    r = toByte(r + (target - r) * pp);
    g = toByte(g + (target - g) * pp);
    b = toByte(b + (target - b) * pp);
    // --- Serialize back in the original family --------------------------------
    if (hasHex) {
        const hex = (v)=>v.toString(16).padStart(2, "0");
        const base = `#${hex(r)}${hex(g)}${hex(b)}`;
        return a !== null ? `${base}${hex(Math.floor((a ?? 1) * 255))}` : base; // keep alpha byte; floor for stability
    }
    if (isRGBA) {
        const outA = a ?? 1;
        return `rgba(${r}, ${g}, ${b}, ${outA})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
}
var $ac4001033fac7d2f$export$2e2bcd8739ae039 = $ac4001033fac7d2f$var$darkenColor;


var $b2927e49b2707936$exports = {};
$b2927e49b2707936$exports = {
    "allowFonts": [
        "Sono",
        "Roboto Mono",
        "Sometype Mono",
        "Inconsolata",
        "Source Code Pro",
        "IBM Plex Mono",
        "Space Mono",
        "Ubuntu Mono",
        "Nanum Gothic Coding",
        "Courier Prime",
        "JetBrains Mono",
        "Fira Mono",
        "Cousine",
        "Anonymous Pro",
        "Noto Sans Mono",
        "Fira Code",
        "Overpass Mono",
        "B612 Mono",
        "Victor Mono",
        "Chivo Mono",
        "Azeret Mono",
        "Martian Mono",
        "Red Hat Mono",
        "Spline Sans Mono"
    ]
};


// isDark.ts
/**
 * Detect if user prefers dark color scheme.
 * Returns `false` if matchMedia is not available (e.g. server-side).
 */ function $02a8a47a7fc1ea47$var$isDark() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
var $02a8a47a7fc1ea47$export$2e2bcd8739ae039 = $02a8a47a7fc1ea47$var$isDark;


const $aa43cbaf8926a599$var$v = "0.6.0";
const $aa43cbaf8926a599$var$googleFontsMonospace = (0, (/*@__PURE__*/$parcel$interopDefault($b2927e49b2707936$exports)))?.allowFonts ?? [];
class $aa43cbaf8926a599$var$SimpleDigitalClockWidget extends (0, $6bd3564550fc0340$export$16fa2f45be04daa8) {
    constructor(props){
        super(props), this.hundredthsMetadataAt = 0, this.containerRef = null, this.zoneContainerRef = null, this.dateContainerRef = null, this.isHundredthsEnabled = ()=>this.normalizeBool(this.props.hundredths) === true, this.stopClock = ()=>{
            if (this.interval !== undefined) {
                clearInterval(this.interval);
                this.interval = undefined;
            }
            if (this.animationFrame !== undefined) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = undefined;
            }
        }, this.startClock = ()=>{
            this.stopClock();
            if (this.isHundredthsEnabled()) {
                this.hundredthsMetadataAt = Date.now();
                this.animationFrame = requestAnimationFrame(this.updateHundredthsFrame);
                return;
            }
            this.interval = setInterval(this.updateTimeAndDateString, 1000);
        }, this.updateHundredthsTimeString = (date)=>{
            const { locale: locale, timeZone: timeZone } = this.props;
            const periodPref = this.normalizeBool(this.props.period);
            try {
                const timeString = date.toLocaleTimeString(locale, {
                    timeZone: timeZone,
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    fractionalSecondDigits: 2,
                    ...periodPref !== undefined ? {
                        hour12: periodPref,
                        hourCycle: periodPref ? "h12" : "h23"
                    } : {}
                });
                if (timeString !== this.state.timeString) this.setState({
                    timeString: timeString
                });
            } catch (e) {
                if (!this.state.isError) {
                    console.error("Error: ", e);
                    this.setState({
                        isError: true
                    });
                }
            }
        }, this.updateHundredthsMetadata = (date)=>{
            const { locale: locale, timeZone: timeZone } = this.props;
            const isDay = date.getHours() >= 6 && date.getHours() < 18;
            try {
                const dateString = date.toLocaleDateString(locale, {
                    timeZone: timeZone,
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
                const timeZoneName = date.toLocaleDateString(locale, {
                    timeZone: timeZone,
                    timeZoneName: this.props.timeZoneName === "" ? undefined : this.props.timeZoneName
                });
                if (dateString !== this.state.dateString || timeZoneName !== this.state.timeZoneName || isDay !== this.state.isDay) this.setState({
                    dateString: dateString,
                    timeZoneName: timeZoneName,
                    isDay: isDay
                });
            } catch (e) {
                if (!this.state.isError) {
                    console.error("Error: ", e);
                    this.setState({
                        isError: true
                    });
                }
            }
        }, this.updateHundredthsFrame = ()=>{
            if (!this.isHundredthsEnabled()) {
                this.animationFrame = undefined;
                return;
            }
            const date = new Date();
            this.updateHundredthsTimeString(date);
            const now = date.getTime();
            if (now < this.hundredthsMetadataAt || now - this.hundredthsMetadataAt >= 1000) {
                this.updateHundredthsMetadata(date);
                this.hundredthsMetadataAt = now;
            }
            this.animationFrame = requestAnimationFrame(this.updateHundredthsFrame);
        }, this.loadGoogleFont = (fontFamily)=>{
            if (fontFamily) {
                const link = document.createElement("link");
                link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, "+")}:wght@700&display=swap`;
                link.rel = "stylesheet";
                document.head.appendChild(link);
            }
        }, this.handlePrefers = ()=>{
            const backgroundColor = this.props.prefers === undefined || this.props.prefers === null || this.props.prefers === "" || this.props.prefers === "system" || this.props.prefers === "auto" ? (0, $02a8a47a7fc1ea47$export$2e2bcd8739ae039)() ? "#000000" : "#ffffff" : this.props.prefers === "dark" ? "#000000" : "#ffffff";
            this.setState({
                backgroundColor: backgroundColor
            });
        // console.log(this.props.prefers, "prefers");
        }, this.handleResize = ()=>{
            if (this.containerRef) {
                const localeList = [
                    "bg",
                    "ko"
                ];
                const currentLocale = this.props.locale || "en"; // Replace this with your actual locale string
                const isLocaleMatch = localeList.some((prefix)=>currentLocale.startsWith(prefix));
                const fontSizeByLocale = this.isHundredthsEnabled() ? isLocaleMatch ? 12 : 11 : isLocaleMatch ? 8 : 7;
                const width = this.containerRef.offsetWidth;
                const fontSize = (width || 1) / fontSizeByLocale;
                const fontSizeTitle = (width || 1) / 15;
                this.setState({
                    fontSize: fontSize,
                    fontSizeTitle: fontSizeTitle
                });
            }
        }, /**
   * Updates the time and date strings based on the current locale, timeZone, seconds, and period props.
   * Sets the state with the updated timeString, dateString, timeZoneName, and isError values.
   */ this.updateTimeAndDateString = ()=>{
            const { locale: locale, timeZone: timeZone } = this.props;
            // Normalize boolean-like attributes
            const periodPref = this.normalizeBool(this.props.period);
            const showSeconds = this.normalizeBool(this.props.second);
            const date = new Date();
            let isDay = date.getHours() >= 6 && date.getHours() < 18;
            let timeString = "";
            let dateString = "";
            let timeZoneName = "";
            let isError = false;
            try {
                timeString = date.toLocaleTimeString(locale, {
                    timeZone: timeZone,
                    hour: "numeric",
                    minute: "numeric",
                    // show seconds only when explicitly true
                    ...showSeconds === true ? {
                        second: "numeric"
                    } : {},
                    // period overrides locale when explicitly provided
                    ...periodPref !== undefined ? {
                        hour12: periodPref,
                        hourCycle: periodPref ? "h12" : "h23"
                    } : {}
                });
                dateString = date.toLocaleDateString(locale, {
                    timeZone: timeZone,
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
                timeZoneName = date.toLocaleDateString(locale, {
                    timeZone: timeZone,
                    timeZoneName: this.props.timeZoneName === "" ? undefined : this.props.timeZoneName
                });
            } catch (e) {
                isError = true;
                console.error("Error: ", e);
            }
            this.setState({
                timeString: timeString,
                dateString: dateString,
                timeZoneName: timeZoneName,
                isDay: isDay,
                isError: isError
            });
        };
        this.interval;
        this.state = {
            isDay: true,
            isError: false,
            timeString: "",
            dateString: "",
            timeZoneName: "",
            fontSize: 16,
            fontSizeTitle: 16,
            backgroundColor: "#ffffff"
        };
    }
    static{
        this.tagName = "timenow-zone-sdcw";
    }
    static{
        // Observe attributes in kebab-case (HTML side)
        this.observedAttributes = [
            "background-color",
            "time-zone-name",
            "font-family",
            "background",
            "time-zone",
            "rounded",
            "second",
            "hundredths",
            "caption",
            "prefers",
            "locale",
            "shadow",
            "border",
            "period",
            "date",
            "width",
            "align"
        ];
    }
    /** Normalize boolean-like props coming from attributes. */ normalizeBool(value) {
        // undefined/null => not provided
        if (value == null) return undefined;
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            const v = value.trim().toLowerCase();
            // HTML boolean attr present without value -> ""
            if (v === "" || v === "true" || v === "1" || v === "yes") return true;
            if (v === "false" || v === "0" || v === "no") return false;
        }
        return undefined; // unknown -> treat as "not provided"
    }
    // componentDidMount replaces useEffect for post-mount actions
    componentDidMount() {
        // console.log("componentDidMount");
        // Your CSS injection logic here
        this.handlePrefers();
        this.updateTimeAndDateString(); // Call it once immediately
        this.startClock();
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        // Load the Google Font
        this.loadGoogleFont(this.props.fontFamily);
    }
    componentDidUpdate(prevProps) {
        const hundredthsChanged = prevProps.hundredths !== this.props.hundredths;
        if (prevProps.fontFamily !== this.props.fontFamily) this.loadGoogleFont(this.props.fontFamily);
        if (prevProps.width !== this.props.width || hundredthsChanged) this.handleResize();
        if (prevProps.prefers !== this.props.prefers) this.handlePrefers();
        // Recalc time immediately when formatting-related props change
        if (prevProps.locale !== this.props.locale || prevProps.timeZone !== this.props.timeZone || prevProps.second !== this.props.second || prevProps.hundredths !== this.props.hundredths || prevProps.period !== this.props.period || prevProps.timeZoneName !== this.props.timeZoneName) this.updateTimeAndDateString();
        if (hundredthsChanged) this.startClock();
    }
    componentWillUnmount() {
        // console.log("componentWillUnmount");
        this.stopClock();
    }
    render() {
        const { backgroundColor: backgroundColor, background: background, fontFamily: fontFamily, caption: caption, rounded: rounded, shadow: shadow, border: border, width: width, align: align, date: date } = this.props;
        const showDate = date !== undefined;
        const showCaption = caption || false;
        const mainDivClasses = [
            "widget",
            "font-family"
        ];
        if (shadow) mainDivClasses.push(shadow);
        const mainStyle = {
            color: (0, $270bff5585dd7bb3$export$2e2bcd8739ae039)(backgroundColor?.toLowerCase() || this.state.backgroundColor),
            ...background ? {
                background: background?.toLowerCase() || this.state.backgroundColor
            } : {
                backgroundColor: backgroundColor?.toLowerCase()
            }
        };
        const fontStyles = {
            fontFamily: $aa43cbaf8926a599$var$googleFontsMonospace.some((element)=>element === fontFamily) ? this.props.fontFamily : "monospace"
        };
        return /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)((0, $6bd3564550fc0340$export$ffb0004e005737fa), null, /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("style", null, (0, (/*@__PURE__*/$parcel$interopDefault($311a3960f67ea2d3$exports)))), /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("div", {
            "data-version": $aa43cbaf8926a599$var$v,
            className: (0, $c199437f4e4422ea$export$2e2bcd8739ae039)(mainDivClasses),
            ref: (el)=>{
                this.containerRef = el;
            },
            style: {
                ...mainStyle,
                ...rounded !== undefined && {
                    borderRadius: `${rounded}rem`
                },
                ...border !== undefined && {
                    borderColor: (0, $ac4001033fac7d2f$export$2e2bcd8739ae039)(backgroundColor?.toLowerCase() || this.state.backgroundColor, -0.25),
                    borderWidth: "1px"
                },
                transition: "background 1s ease",
                position: "relative",
                minWidth: 80,
                ...width !== undefined && {
                    width: parseInt(width?.toString() || "80", 10) || undefined
                }
            }
        }, /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("div", {
            className: (0, $c199437f4e4422ea$export$2e2bcd8739ae039)(`text-${align || "center"}`)
        }, this.state.timeString ? /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)((0, $6bd3564550fc0340$export$ffb0004e005737fa), null, showCaption && /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("div", {
            style: {
                fontSize: this.state.fontSizeTitle
            }
        }, caption), /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("a", {
            title: this.state.timeZoneName,
            style: {
                fontSize: this.state.fontSize,
                ...fontStyles
            },
            href: "https://utctime.info/",
            target: "_blank",
            rel: "noopener noreferrer"
        }, this.state.timeString), showDate && /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)((0, $6bd3564550fc0340$export$ffb0004e005737fa), null, /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("div", {
            title: this.state.timeZoneName,
            ref: (el)=>{
                this.dateContainerRef = el;
            },
            onClick: ()=>{
                this.zoneContainerRef?.style.setProperty("display", "block");
                this.dateContainerRef?.style.setProperty("display", "none");
            },
            style: {
                fontSize: this.state.fontSizeTitle,
                cursor: "pointer"
            }
        }, this.state.dateString), /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("div", {
            title: this.state.dateString,
            onClick: ()=>{
                this.zoneContainerRef?.style.setProperty("display", "none");
                this.dateContainerRef?.style.setProperty("display", "block");
            },
            ref: (el)=>{
                this.zoneContainerRef = el;
            },
            style: {
                fontSize: this.state.fontSizeTitle,
                display: "none",
                cursor: "pointer"
            }
        }, this.state.timeZoneName))) : /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)((0, $6bd3564550fc0340$export$ffb0004e005737fa), null, "..."), this.state.isError && /*#__PURE__*/ (0, $6bd3564550fc0340$export$c8a8987d4410bf2d)("div", null, "Error, please check attributes of tag."))));
    }
}
var $aa43cbaf8926a599$export$2e2bcd8739ae039 = $aa43cbaf8926a599$var$SimpleDigitalClockWidget;
(0, $6f0b21dd6dcd5f7b$export$2e2bcd8739ae039)($aa43cbaf8926a599$var$SimpleDigitalClockWidget, undefined, undefined, {
    shadow: true
});

})();
//# sourceMappingURL=SimpleDigitalClockWidget.js.map
