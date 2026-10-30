(function () {

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
/*!
 * Simple Digital Clock Widget
 * Simple Digital Clock Widget – a lightweight HTML/JS digital clock widget with flexible settings, embedded seamlessly for your website. Build ⚡ instantly-interactive web widget without effort.
 *
 * Repo:    https://github.com/Timenow-zone/Simple-Digital-Clock-Widget
 * Demo:    https://utctime.info/
 * Related: https://todaysdatenow.com/
 * WP plugin: https://wordpress.org/plugins/simple-digital-clock/
 *
 * Version: 0.8.1
 * License: MIT
 * Author: dejurin (https://github.com/Timenow-zone)
 */ var $a7a8e2c5ae553f9f$export$41c562ebe57d11e2, $a7a8e2c5ae553f9f$var$t, $a7a8e2c5ae553f9f$export$a8257692ac88316c, $a7a8e2c5ae553f9f$var$i, $a7a8e2c5ae553f9f$var$u, $a7a8e2c5ae553f9f$var$f, $a7a8e2c5ae553f9f$var$e, $a7a8e2c5ae553f9f$var$o, $a7a8e2c5ae553f9f$var$l, $a7a8e2c5ae553f9f$var$c, $a7a8e2c5ae553f9f$var$a, $a7a8e2c5ae553f9f$var$s, $a7a8e2c5ae553f9f$var$h = Symbol.for("pv"), $a7a8e2c5ae553f9f$var$p = {}, $a7a8e2c5ae553f9f$var$v = [], $a7a8e2c5ae553f9f$var$y = /^m(i|n|o|s|text|space)$/, $a7a8e2c5ae553f9f$var$w = Array.isArray, $a7a8e2c5ae553f9f$var$d = $a7a8e2c5ae553f9f$var$v.slice, $a7a8e2c5ae553f9f$var$_ = Object.assign;
function $a7a8e2c5ae553f9f$var$g(n) {
    n && n.parentNode && n.remove();
}
function $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d(n, t, r) {
    var i, u, f, e = {}, o = arguments.length;
    for(f in t)"key" == f ? i = t[f] : "ref" == f && "function" != typeof n ? u = t[f] : e[f] = t[f];
    return o > 2 && (e.children = o > 3 ? $a7a8e2c5ae553f9f$var$d.call(arguments, 2) : r), $a7a8e2c5ae553f9f$var$m(n, e, i, u, null);
}
function $a7a8e2c5ae553f9f$export$e530037191fcd5d7(n, t, r) {
    var i, u, f, e = $a7a8e2c5ae553f9f$var$_({}, n.props), o = arguments.length;
    for(f in t)"key" == f ? i = t[f] : "ref" == f && "function" != typeof n.type ? u = t[f] : e[f] = t[f];
    return o > 2 && (e.children = o > 3 ? $a7a8e2c5ae553f9f$var$d.call(arguments, 2) : r), $a7a8e2c5ae553f9f$var$m(n.type, e, void 0 !== i ? i : n.key, void 0 !== u ? u : n.ref, null);
}
function $a7a8e2c5ae553f9f$var$m(r, i, u, f, e) {
    var o = {
        type: r,
        props: i,
        key: u,
        ref: f,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: $a7a8e2c5ae553f9f$var$h,
        __v: e || ++$a7a8e2c5ae553f9f$var$t,
        __i: -1,
        __u: 0
    };
    return !e && $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.vnode && $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.vnode(o), o;
}
function $a7a8e2c5ae553f9f$export$7d1e3a5e95ceca43() {
    return {
        current: null
    };
}
function $a7a8e2c5ae553f9f$export$ffb0004e005737fa(n) {
    return n.children;
}
function $a7a8e2c5ae553f9f$export$16fa2f45be04daa8(n, t) {
    this.props = n, this.context = t, this.__g = 0;
}
function $a7a8e2c5ae553f9f$var$S(n, t) {
    if (null == t) return n.__ && $a7a8e2c5ae553f9f$var$S(n.__, n.__i + 1);
    for(var r; t < n.__k.length; t++)if ((r = n.__k[t]) && r.__e) return r.__e;
    return "function" != typeof n.type || n.props.__P ? null : $a7a8e2c5ae553f9f$var$S(n);
}
function $a7a8e2c5ae553f9f$var$C(n) {
    if ((n = n.__) && n.__c && !n.props.__P) return n.__e = null, n.__k.some(function(t) {
        return t && (n.__e = t.__e);
    }), $a7a8e2c5ae553f9f$var$C(n);
}
function $a7a8e2c5ae553f9f$var$j(t) {
    (8 & t.__g || (t.__g |= 8, $a7a8e2c5ae553f9f$var$i.push(t), $a7a8e2c5ae553f9f$var$f++)) && $a7a8e2c5ae553f9f$var$u == $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.debounceRendering || (($a7a8e2c5ae553f9f$var$u = $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.debounceRendering) || queueMicrotask)($a7a8e2c5ae553f9f$var$L);
}
function $a7a8e2c5ae553f9f$var$L() {
    var t, r, o, l, c, a, s, p, v;
    try {
        for(r = 1; $a7a8e2c5ae553f9f$var$i.length;)$a7a8e2c5ae553f9f$var$i.length > r && $a7a8e2c5ae553f9f$var$i.sort($a7a8e2c5ae553f9f$var$e), t = $a7a8e2c5ae553f9f$var$i.shift(), r = $a7a8e2c5ae553f9f$var$i.length, 8 & t.__g && (l = void 0, c = void 0, a = (c = (o = t).__v).__e, s = [], p = [], (v = o.__P) && ((l = $a7a8e2c5ae553f9f$var$_({
            constructor: $a7a8e2c5ae553f9f$var$h
        }, c)).__v = c.__v + 1, $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.vnode && $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.vnode(l), $a7a8e2c5ae553f9f$var$V(v, l, c, o.__n, v.namespaceURI, 32 & c.__u ? [
            a
        ] : null, s, a || $a7a8e2c5ae553f9f$var$S(c), 32 & c.__u, p), l.__v = c.__v, l.__.__k[l.__i] = l, $a7a8e2c5ae553f9f$var$D(s, l, p), c.__ = c.__e = null, l.__e != a && $a7a8e2c5ae553f9f$var$C(l)));
    } finally{
        ($a7a8e2c5ae553f9f$var$f = $a7a8e2c5ae553f9f$var$i.length) && ($a7a8e2c5ae553f9f$var$u || queueMicrotask)($a7a8e2c5ae553f9f$var$L);
    }
}
function $a7a8e2c5ae553f9f$var$H(n, t, r, i, u, f, e, o, l, c, a) {
    var s, h, y, w, d, _, g = i.__k || $a7a8e2c5ae553f9f$var$v, k = t.length;
    for(l = $a7a8e2c5ae553f9f$var$I(r, t, g, l, k), s = 0; s < k; s++)null != (y = r.__k[s]) && (h = ~y.__i && g[y.__i] || $a7a8e2c5ae553f9f$var$p, y.__i = s, _ = $a7a8e2c5ae553f9f$var$V(n, y, h, u, f, e, o, l, c, a), w = y.__e, (h.ref != y.ref || 8 & h.__u) && (h.ref && $a7a8e2c5ae553f9f$var$F(h.ref, null, y, h), y.ref && a.push(y.ref, y.__c || w, y)), d = d || w, 4 & y.__u ? (l = $a7a8e2c5ae553f9f$var$q(y, l, n, !h.__v), h.__e && (h.__e = null)) : "function" == typeof y.type && void 0 !== _ ? l = _ : w && (l = w.nextSibling), y.__u &= -21);
    return r.__e = d, l;
}
function $a7a8e2c5ae553f9f$var$I(n, t, r, i, u) {
    var f, e, o, l, c, a, s, p, v, y = r.length, d = y, _ = 0, g = 0, k = n.__k = Array(u);
    for(f = 0; f < u; f++)null != (e = t[f]) && "boolean" != typeof e && "function" != typeof e ? ("object" != typeof e || e.constructor === String ? e = k[f] = $a7a8e2c5ae553f9f$var$m(null, e) : $a7a8e2c5ae553f9f$var$w(e) ? e = k[f] = $a7a8e2c5ae553f9f$var$m($a7a8e2c5ae553f9f$export$ffb0004e005737fa, {
        children: e
    }) : e.constructor === $a7a8e2c5ae553f9f$var$h && e.__b ? e = k[f] = $a7a8e2c5ae553f9f$var$m(e.type, e.props, e.key, e.ref, e.__v) : k[f] = e, l = f + _, e.__ = n, e.__b = n.__b + 1, o = null, ~(c = e.__i = $a7a8e2c5ae553f9f$var$O(e, r, l, d)) && (d--, (o = r[c]) && (o.__u |= 2)), o && o.__v ? (e.__u |= 16, c == l - 1 ? _-- : c == l + 1 ? _++ : c != l && (c > l ? _-- : _++, g = 1)) : (~c || (u > y ? _-- : u < y && _++), "function" != typeof e.type && (e.__u |= 4))) : k[f] = null;
    if (g) {
        for(a = [], s = [], f = 0; f < u; f++)if ((e = k[f]) && 16 & e.__u) {
            for(_ = 0, p = a.length; _ < p;)a[v = _ + p >> 1] < e.__i ? _ = v + 1 : p = v;
            a[_] = e.__i, s[f] = _ + 1;
        }
        for(_ = a.length; f--;)s[f] && (s[f] == _ ? _-- : k[f].__u |= 4);
    }
    if (d) for(f = 0; f < y; f++)!(o = r[f]) || 2 & o.__u || (o.__e == i && (i = $a7a8e2c5ae553f9f$var$S(o)), $a7a8e2c5ae553f9f$var$G(o, o));
    return i;
}
function $a7a8e2c5ae553f9f$var$q(n, t, r, i) {
    var u, f, e, o;
    if ("function" == typeof n.type) {
        if (n.props.__P) return t;
        if (u = n.__k) for(f = 0; f < u.length; f++)u[f] && (u[f].__ = n, t = $a7a8e2c5ae553f9f$var$q(u[f], t, r, !1));
        return t;
    }
    for(t && !t.parentNode && (t = $a7a8e2c5ae553f9f$var$S(n)) && !t.parentNode && (t = null), e = n.__e, o = t; o && 8 == o.nodeType;)o = o.nextSibling;
    for(e != o && (!i && r.moveBefore && e.parentNode ? r.moveBefore(e, t) : r.insertBefore(e, t || null)), t = e; (t = t && t.nextSibling) && 8 == t.nodeType && !t.data.startsWith("$s"););
    return t;
}
function $a7a8e2c5ae553f9f$export$47e4c5b300681277(n, t) {
    return t = t || [], null != n && "boolean" != typeof n && ($a7a8e2c5ae553f9f$var$w(n) ? n.some(function(n) {
        $a7a8e2c5ae553f9f$export$47e4c5b300681277(n, t);
    }) : t.push(n)), t;
}
function $a7a8e2c5ae553f9f$var$O(n, t, r, i) {
    var u, f = n.key, e = n.type, o = t[r], l = o && !(2 & o.__u);
    if (null === o && null == f || l && f == o.key && e == o.type) return r;
    if (i > (l ? 1 : 0)) {
        for(u = r - 1; u >= 0; u--)if ((o = t[u]) && !(2 & o.__u) && f == o.key && e == o.type) return u;
        for(u = r + 1; u < t.length; u++)if ((o = t[u]) && !(2 & o.__u) && f == o.key && e == o.type) return u;
    }
    return -1;
}
function $a7a8e2c5ae553f9f$var$P(n, t, r) {
    null == r && (r = ""), "-" == t[0] ? n.setProperty(t, r) : n[t] = r;
}
function $a7a8e2c5ae553f9f$var$T(n, t, r, i, u) {
    var f, e;
    if ("style" == t) {
        if ("string" == typeof r) n.style.cssText = r;
        else {
            if ("string" == typeof i && (n.style.cssText = i = ""), i) for(t in i)r && t in r || $a7a8e2c5ae553f9f$var$P(n.style, t);
            if (r) for(t in r)i && r[t] == i[t] || $a7a8e2c5ae553f9f$var$P(n.style, t, r[t]);
        }
    } else if ("o" == t[0] && "n" == t[1]) (n.__e || (n.__e = {}))[t] = r, r && i || (e = $a7a8e2c5ae553f9f$var$a[t] || ($a7a8e2c5ae553f9f$var$a[t] = $a7a8e2c5ae553f9f$var$N(t)), (n.__a || (n.__a = {}))[t] = $a7a8e2c5ae553f9f$var$c, f = t != (t = t.replace($a7a8e2c5ae553f9f$var$l, "$1")), (t = t.slice(2))[0] < "a" && (t = t.toLowerCase()), r ? n.addEventListener(t, e, f) : n.removeEventListener(t, e, f));
    else {
        if ("http://www.w3.org/2000/svg" == u) t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" != t && "height" != t && "href" != t && "list" != t && "form" != t && "tabIndex" != t && "download" != t && "rowSpan" != t && "colSpan" != t && "role" != t && "popover" != t && t in n) try {
            return void (n[t] = null == r ? "" : r);
        } catch (n) {}
        if ("function" == typeof r) return;
        null == r || !1 === r && "-" != t[4] ? n.removeAttribute(t) : n.setAttribute(t, "popover" == t && 1 == r ? "" : r);
    }
}
function $a7a8e2c5ae553f9f$var$N(t) {
    return function(r) {
        var i = this.__e;
        if (i) {
            if (i = i[t], null == r[$a7a8e2c5ae553f9f$var$o]) r[$a7a8e2c5ae553f9f$var$o] = $a7a8e2c5ae553f9f$var$c++;
            else if (r[$a7a8e2c5ae553f9f$var$o] < this.__a[t]) return;
            return i($a7a8e2c5ae553f9f$export$41c562ebe57d11e2.event ? $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.event(r) : r);
        }
    };
}
function $a7a8e2c5ae553f9f$var$V(t, r, i, u, f, e, o, l, c, a) {
    var s, p, y, d, k, b, m, $, C, j, L, I, q, A, O, P, T, N, V = r.type;
    if (r.constructor !== $a7a8e2c5ae553f9f$var$h) return null;
    128 & i.__u && (c = 32 & i.__u, s = i.__c.__z) && (r.__u |= c, p = e = [], 8 == s.nodeType ? l = $a7a8e2c5ae553f9f$var$z(s, e) : e.push(s), l = e[0] || l), (s = $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__b) && s(r);
    n: if ("function" == typeof V) {
        y = o.length;
        try {
            if ($ = r.props, C = (s = V.prototype) && s.render, j = (s = V.contextType) && u[s.__c], L = s ? j ? j.props.value : s.__ : u, (d = i.__c) ? (r.__c = d, 2 & d.__g && (d.__g |= 1)) : (C ? r.__c = d = new V($, L) : (r.__c = d = new $a7a8e2c5ae553f9f$export$16fa2f45be04daa8($, L), d.constructor = V, d.render = $a7a8e2c5ae553f9f$var$J), j && j.sub(d), d.state || (d.state = {}), d.__n = u, d.__g |= 8, d.__h = [], d.__k = []), C && (d.__s || (d.__s = d.state), V.getDerivedStateFromProps && (d.__s == d.state && (d.__s = $a7a8e2c5ae553f9f$var$_({}, d.__s)), $a7a8e2c5ae553f9f$var$_(d.__s, V.getDerivedStateFromProps($, d.__s)))), k = d.props, b = d.state, d.__v = r, i.__c) {
                if ($ !== k && C && !V.getDerivedStateFromProps && d.componentWillReceiveProps && d.componentWillReceiveProps($, L), r.__v == i.__v && !(8 & d.__g) || !(4 & d.__g) && d.shouldComponentUpdate && !1 === d.shouldComponentUpdate($, d.__s, L)) {
                    r.__v != i.__v && (d.props = $, d.state = d.__s, d.__g &= -9), r.__e = i.__e, r.__k = i.__k, r.__k.some(function(n) {
                        n && (n.__ = r);
                    }), $a7a8e2c5ae553f9f$var$v.push.apply(d.__h, d.__k), d.__k = [], d.__h.length && o.push(d), l = $a7a8e2c5ae553f9f$var$S(i);
                    break n;
                }
                d.componentWillUpdate && d.componentWillUpdate($, d.__s, L), C && d.componentDidUpdate && d.__h.push(function() {
                    d.componentDidUpdate(k, b, m);
                });
            } else C && !V.getDerivedStateFromProps && d.componentWillMount && d.componentWillMount(), C && d.componentDidMount && d.__h.push(d.componentDidMount);
            if (d.context = L, d.props = $, d.__P = t, d.__g &= -5, I = $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__r, q = 0, C) d.state = d.__s, d.__g &= -9, I && I(r), s = d.render(d.props, d.state, d.context), $a7a8e2c5ae553f9f$var$v.push.apply(d.__h, d.__k), d.__k = [];
            else do d.__g &= -9, I && I(r), s = d.render(d.props, d.state, d.context), d.state = d.__s;
            while (8 & d.__g && ++q < 25);
            d.state = d.__s, d.getChildContext && (u = $a7a8e2c5ae553f9f$var$_({}, u, d.getChildContext())), C && i.__c && d.getSnapshotBeforeUpdate && (m = d.getSnapshotBeforeUpdate(k, b)), A = s && s.type === $a7a8e2c5ae553f9f$export$ffb0004e005737fa && null == s.key ? s.props.children : s, $.__P && (s = l, f = (t = $.__P).namespaceURI, c = e = null, i.props && i.props.__P != t && (i.__k.some(function(n) {
                n && $a7a8e2c5ae553f9f$var$G(n, n);
            }), i.__k = null), l = i.__k ? $a7a8e2c5ae553f9f$var$S(i, 0) : null), l = $a7a8e2c5ae553f9f$var$H(t, $a7a8e2c5ae553f9f$var$w(A) ? A : [
                A
            ], r, i, u, f, e, o, l, c, a), $.__P && (r.__e = null, l = s), r.__u &= -161, p && p.some($a7a8e2c5ae553f9f$var$g), d.__h.length && o.push(d), 1 & d.__g && (d.__g &= -4);
        } catch (t) {
            if (o.length = y, r.__v = null, c || e) {
                if (t.then) {
                    if (O = 0, r.__u |= 128 | c, e) {
                        for(~(T = e.indexOf(l || void 0)) || (T = e.length); (N = e[T - 1]) && 8 == N.nodeType;)T--;
                        for(; T < e.length; T++)if (N = e[T]) {
                            if (e[T] = null, 8 == N.nodeType) {
                                if (N.data.startsWith("$s")) O++ || (P = N);
                                else if (O && N.data.startsWith("/$s") && !--O) break;
                            } else if (!O) break;
                        }
                    }
                    if (!P) {
                        for(; l && 8 == l.nodeType && l.nextSibling;)l = l.nextSibling;
                        P = l;
                    }
                    (s = $a7a8e2c5ae553f9f$var$z(P = r.__c.__z || (r.__c.__z = P))) ? (r.__e = P, l = s) : r.__e = l, l = l && l.nextSibling;
                } else e && e.some($a7a8e2c5ae553f9f$var$g);
            } else r.__e = i.__e;
            r.__k || (r.__k = i.__k || []), t.then || $a7a8e2c5ae553f9f$var$B(r), $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__e(t, r, i);
        }
    } else l = r.__e = $a7a8e2c5ae553f9f$var$E(i.__e, r, i, u, f, e, o, c, a, t);
    return (s = $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.diffed) && s(r), l;
}
function $a7a8e2c5ae553f9f$var$z(n, t) {
    if (n && 8 == n.nodeType && n.data.startsWith("$s")) for(var r = 1; n = n.nextSibling;){
        if (8 == n.nodeType) {
            if (n.data.startsWith("$s")) r++;
            else if (n.data.startsWith("/$s") && !--r) return n;
        }
        t && t.push(n);
    }
}
function $a7a8e2c5ae553f9f$var$B(n) {
    n && (n.__c && (n.__c.__g |= 4), n.__k && n.__k.some($a7a8e2c5ae553f9f$var$B));
}
function $a7a8e2c5ae553f9f$var$D(t, r, i) {
    for(var u = 0; u < i.length;)$a7a8e2c5ae553f9f$var$F(i[u++], i[u++], i[u++]);
    $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__c && $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__c(r, t), t.some(function(r) {
        try {
            t = r.__h, r.__h = [], t.some(function(n) {
                n.call(r);
            });
        } catch (t) {
            $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__e(t, r.__v);
        }
    });
}
function $a7a8e2c5ae553f9f$var$E(t, r, i, u, f, e, o, l, c, a) {
    var s, h, v, _, k, b, m, $, M, x = i.props || $a7a8e2c5ae553f9f$var$p, C = r.props, j = r.type;
    if ("svg" == j ? f = "http://www.w3.org/2000/svg" : "math" == j ? f = "http://www.w3.org/1998/Math/MathML" : f || (f = "http://www.w3.org/1999/xhtml"), e) {
        for(s = 0; s < e.length; s++)if ((k = e[s]) && (j ? k.localName == j : 3 == k.nodeType)) {
            t = k, e[s] = null;
            break;
        }
    }
    if (!t) {
        if ($ = a.ownerDocument || document, !j) return $.createTextNode(C);
        t = $.createElementNS(f, j, C.is && C), l && ($a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__m && $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__m(r, e), l = !1), e = null;
    }
    if (j) {
        if (a = "template" == j ? t.content : t, e = "textarea" == j && null != C.defaultValue ? null : e && $a7a8e2c5ae553f9f$var$d.call(a.childNodes), !l && e) for(x = {}, s = 0; s < t.attributes.length; s++)x[(k = t.attributes[s]).name] = k.value;
        for(s in x)k = x[s], "dangerouslySetInnerHTML" == s ? v = k : "children" == s || s in C || "value" == s && "defaultValue" in C || "checked" == s && "defaultChecked" in C || $a7a8e2c5ae553f9f$var$T(t, s, null, k, f);
        for(s in M = 1 & i.__u, C)k = C[s], "children" == s ? _ = k : "dangerouslySetInnerHTML" == s ? h = k : "value" == s ? b = k : "checked" == s ? m = k : l && "function" != typeof k || !(x[s] !== k || M && null != k) || $a7a8e2c5ae553f9f$var$T(t, s, k, x[s], f);
        h ? (l || v && (h.__html == v.__html || h.__html == t.innerHTML) || (t.innerHTML = h.__html), r.__k = []) : (v && (t.textContent = ""), ("foreignObject" == j || "http://www.w3.org/1998/Math/MathML" == f && $a7a8e2c5ae553f9f$var$y.test(j)) && (f = "http://www.w3.org/1999/xhtml"), $a7a8e2c5ae553f9f$var$H(a, $a7a8e2c5ae553f9f$var$w(_) ? _ : [
            _
        ], r, i, u, f, e, o, e ? e[0] : i.__k && $a7a8e2c5ae553f9f$var$S(i, 0), l, c), e && e.some($a7a8e2c5ae553f9f$var$g)), l && "textarea" != j || (s = "value", "progress" == j && null == b ? t.removeAttribute(s) : null == b || b === t[s] && ("progress" != j || b) || $a7a8e2c5ae553f9f$var$T(t, s, b, x[s], f), s = "checked", null != m && m != t[s] && $a7a8e2c5ae553f9f$var$T(t, s, m, x[s], f));
    } else x === C || l && t.data == C || (t.data = C);
    return t;
}
function $a7a8e2c5ae553f9f$var$F(t, r, i, u) {
    try {
        "function" == typeof t ? r ? r.__x = t(r) || 1 : u && (u = u.__c || u.__e) && (r = u.__x) && (u.__x = null, "function" == typeof r ? r() : t(null)) : t.current = r;
    } catch (t) {
        $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__e(t, i);
    }
}
function $a7a8e2c5ae553f9f$var$G(t, r, i) {
    var u, f, e, o;
    if ($a7a8e2c5ae553f9f$export$41c562ebe57d11e2.unmount && $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.unmount(t), !(u = t.ref) || u.current && u.current != t.__e || $a7a8e2c5ae553f9f$var$F(u, null, r, t), u = t.__c) {
        if (u.componentWillUnmount) try {
            u.componentWillUnmount();
        } catch (t) {
            $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__e(t, r);
        }
        u.__P = u.__n = null;
    }
    if (u = t.__k) for(o = 0; o < u.length; o++)u[o] && $a7a8e2c5ae553f9f$var$G(u[o], r, "function" != typeof t.type || i && !t.props.__P);
    !i && (u = t.__c) && (u = u.__z) && (f = $a7a8e2c5ae553f9f$var$z(u, e = [])) && (u == t.__e && e.some($a7a8e2c5ae553f9f$var$g), $a7a8e2c5ae553f9f$var$g(f), $a7a8e2c5ae553f9f$var$g(u)), (u = t.__e) && (i || $a7a8e2c5ae553f9f$var$g(u), u.__e && (u.__e = null)), t.__e = t.__c = t.__ = null;
}
function $a7a8e2c5ae553f9f$var$J(n, t, r) {
    return this.constructor(n, r);
}
function $a7a8e2c5ae553f9f$export$b3890eb0ae9dca99(t, r) {
    var i, u, f, e;
    $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__ && $a7a8e2c5ae553f9f$export$41c562ebe57d11e2.__(t, r), 9 == r.nodeType && (r = r.documentElement), u = (i = t && 32 & t.__u) ? null : r.__k, r.__k = $a7a8e2c5ae553f9f$var$m($a7a8e2c5ae553f9f$export$ffb0004e005737fa, {
        children: [
            t
        ]
    }), f = [], e = [], $a7a8e2c5ae553f9f$var$V(r, r.__k, u || $a7a8e2c5ae553f9f$var$p, $a7a8e2c5ae553f9f$var$p, r.namespaceURI, u ? null : r.firstChild ? $a7a8e2c5ae553f9f$var$d.call(r.childNodes) : null, f, u ? u.__e : r.firstChild, i, e), $a7a8e2c5ae553f9f$var$D(f, r.__k, e), r.__k.props.children = null;
}
function $a7a8e2c5ae553f9f$export$fa8d919ba61d84db(n, t) {
    n && "object" == typeof n && (n.__u |= 32), $a7a8e2c5ae553f9f$export$b3890eb0ae9dca99(n, t);
}
function $a7a8e2c5ae553f9f$export$fd42f52fd3ae1109(n) {
    function t(n) {
        var r, i;
        return this.getChildContext || (r = new Set, (i = {})[t.__c] = this, this.getChildContext = function() {
            return i;
        }, this.shouldComponentUpdate = function(n) {
            this.props.value != n.value && r.forEach(function(n) {
                n.__g |= 4, $a7a8e2c5ae553f9f$var$j(n);
            });
        }, this.sub = function(n) {
            r.add(n);
            var t = n.componentWillUnmount;
            n.componentWillUnmount = function() {
                r.delete(n), t && t.call(n);
            };
        }), n.children;
    }
    return t.__c = "__cC" + $a7a8e2c5ae553f9f$var$s++, t.__ = n, t.Provider = (t.Consumer = function(n, t) {
        return n.children(t);
    }).contextType = t, t;
}
function $a7a8e2c5ae553f9f$var$U(n) {
    return n.children;
}
function $a7a8e2c5ae553f9f$export$d39a5bbd09211389(n, t) {
    return $a7a8e2c5ae553f9f$var$m($a7a8e2c5ae553f9f$var$U, {
        __P: t,
        children: n
    });
}
$a7a8e2c5ae553f9f$export$41c562ebe57d11e2 = {
    __e: function(n, t, r, i) {
        for(var u, e, o; t = t.__;)if ((u = t.__c) && !(1 & u.__g)) {
            u.__g |= 4;
            try {
                if ((o = (e = u.constructor) && e.getDerivedStateFromError) && u.setState(e.getDerivedStateFromError(n)), u.componentDidCatch && (u.componentDidCatch(n, i || {}), o = 1), o && 8 & u.__g) return void (u.__g |= 2);
            } catch (t) {
                n = t;
            }
        }
        throw $a7a8e2c5ae553f9f$var$f = 0, n;
    }
}, $a7a8e2c5ae553f9f$var$t = 0, $a7a8e2c5ae553f9f$export$a8257692ac88316c = function(n) {
    return null != n && n.constructor === $a7a8e2c5ae553f9f$var$h;
}, $a7a8e2c5ae553f9f$export$16fa2f45be04daa8.prototype.setState = function(n, t) {
    var r = this.__s;
    r && r != this.state || (r = this.__s = $a7a8e2c5ae553f9f$var$_({}, this.state)), "function" == typeof n && (n = n($a7a8e2c5ae553f9f$var$_({}, r), this.props)), n && ($a7a8e2c5ae553f9f$var$_(r, n), this.__v && (t && this.__k.push(t), $a7a8e2c5ae553f9f$var$j(this)));
}, $a7a8e2c5ae553f9f$export$16fa2f45be04daa8.prototype.forceUpdate = function(n) {
    this.__v && (this.__g |= 4, n && this.__h.push(n), $a7a8e2c5ae553f9f$var$j(this));
}, $a7a8e2c5ae553f9f$export$16fa2f45be04daa8.prototype.render = $a7a8e2c5ae553f9f$export$ffb0004e005737fa, $a7a8e2c5ae553f9f$var$i = [], $a7a8e2c5ae553f9f$var$f = 0, $a7a8e2c5ae553f9f$var$e = function(n, t) {
    return n.__v.__b - t.__v.__b;
}, $a7a8e2c5ae553f9f$var$o = Symbol(), $a7a8e2c5ae553f9f$var$l = /(PointerCapture)$|Capture$/i, $a7a8e2c5ae553f9f$var$c = 0, $a7a8e2c5ae553f9f$var$a = {}, $a7a8e2c5ae553f9f$var$s = 0;



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
    return (0, $a7a8e2c5ae553f9f$export$e530037191fcd5d7)(e, n);
}
function $6f0b21dd6dcd5f7b$var$d(o) {
    var r = new CustomEvent("_preact", {
        detail: {},
        bubbles: !0,
        cancelable: !0
    });
    this.dispatchEvent(r), this._vdom = (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)($6f0b21dd6dcd5f7b$var$u, $6f0b21dd6dcd5f7b$var$i({}, this._props, {
        context: r.detail.context
    }), $6f0b21dd6dcd5f7b$var$v(this, this._vdomComponent, o)), (this.hasAttribute("hydrate") ? (0, $a7a8e2c5ae553f9f$export$fa8d919ba61d84db) : (0, $a7a8e2c5ae553f9f$export$b3890eb0ae9dca99))(this._vdom, this._root);
}
function $6f0b21dd6dcd5f7b$var$p(t) {
    return t.replace(/-(\w)/g, function(t, e) {
        return e ? e.toUpperCase() : "";
    });
}
function $6f0b21dd6dcd5f7b$var$h(t, e, r) {
    if (this._vdom) {
        var i = {};
        i[t] = r = null == r ? void 0 : r, i[$6f0b21dd6dcd5f7b$var$p(t)] = r, this._vdom = (0, $a7a8e2c5ae553f9f$export$e530037191fcd5d7)(this._vdom, i), (0, $a7a8e2c5ae553f9f$export$b3890eb0ae9dca99)(this._vdom, this._root);
    }
}
function $6f0b21dd6dcd5f7b$var$f() {
    (0, $a7a8e2c5ae553f9f$export$b3890eb0ae9dca99)(this._vdom = null, this._root);
}
function $6f0b21dd6dcd5f7b$var$m(e, n) {
    var o = this, a = e.useFragment, c = $6f0b21dd6dcd5f7b$var$s(e, $6f0b21dd6dcd5f7b$var$l);
    return (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)(a ? (0, $a7a8e2c5ae553f9f$export$ffb0004e005737fa) : "slot", $6f0b21dd6dcd5f7b$var$i({}, c, {
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
        u ? i[u] = (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)($6f0b21dd6dcd5f7b$var$m, {
            name: u
        }, c) : r[s] = c;
    }
    var d = !(!o || !o.shadow), h = n ? (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)($6f0b21dd6dcd5f7b$var$m, {
        useFragment: !d
    }, r) : r;
    return !d && n && (e.innerHTML = ""), (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)(n || e.nodeName.toLowerCase(), i, h);
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


const $aa43cbaf8926a599$var$v = "0.8.1";
const $aa43cbaf8926a599$var$googleFontsMonospace = (0, (/*@__PURE__*/$parcel$interopDefault($b2927e49b2707936$exports)))?.allowFonts ?? [];
class $aa43cbaf8926a599$var$SimpleDigitalClockWidget extends (0, $a7a8e2c5ae553f9f$export$16fa2f45be04daa8) {
    constructor(props){
        super(props), this.fontLoadId = 0, this.fontStylesheetSettled = false, this.fontRequestedText = "", this.hundredthsMetadataAt = 0, this.hundredthsFormatterFailed = false, this.containerRef = null, this.zoneContainerRef = null, this.dateContainerRef = null, this.isHundredthsEnabled = ()=>this.normalizeBool(this.props.hundredths) === true, this.resetHundredthsFormatter = ()=>{
            this.hundredthsFormatter = undefined;
            this.hundredthsFormatterFailed = false;
        }, this.getHundredthsFormatter = ()=>{
            if (this.hundredthsFormatter) return this.hundredthsFormatter;
            if (this.hundredthsFormatterFailed) return undefined;
            const { locale: locale, timeZone: timeZone } = this.props;
            const periodPref = this.normalizeBool(this.props.period);
            try {
                this.hundredthsFormatter = new Intl.DateTimeFormat(locale, {
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
                return this.hundredthsFormatter;
            } catch (e) {
                this.hundredthsFormatterFailed = true;
                if (!this.state.isError) {
                    console.error("Error: ", e);
                    this.setState({
                        isError: true
                    });
                }
                return undefined;
            }
        }, this.stopClock = ()=>{
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
            const formatter = this.getHundredthsFormatter();
            if (!formatter) return;
            try {
                const timeString = formatter.format(date);
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
        }, this.resizeAfterFontLoad = ()=>{
            const ownerDocument = this.containerRef?.ownerDocument;
            if (!this.fontStylesheetSettled || !ownerDocument) return;
            if (!ownerDocument.fonts) {
                this.scheduleResize();
                return;
            }
            // Include actual localized glyphs; the default space only loads the Latin subset.
            const text = Array.from(new Set(`0123456789${this.fontRequestedText}${this.state.timeString}`)).join("");
            if (text === this.fontRequestedText) return;
            this.fontRequestedText = text;
            const requestId = this.fontLoadId;
            const fontFamily = this.props.fontFamily;
            const isCurrent = ()=>requestId === this.fontLoadId && this.containerRef?.isConnected;
            // WebKit may omit loadingdone; await this font, then measure in the next frame.
            ownerDocument.fonts.load(`700 16px "${fontFamily}"`, text).then(()=>{
                if (isCurrent()) this.scheduleResize();
            }).catch((error)=>{
                if (isCurrent()) console.error("Unable to load clock font:", fontFamily, error);
            });
        }, this.loadGoogleFont = (fontFamily)=>{
            this.clearFontLoadHandlers();
            const ownerDocument = this.containerRef?.ownerDocument;
            if (!ownerDocument || !$aa43cbaf8926a599$var$googleFontsMonospace.includes(fontFamily)) return;
            const requestId = this.fontLoadId;
            const isCurrent = ()=>requestId === this.fontLoadId && this.containerRef?.isConnected;
            const link = ownerDocument.createElement("link");
            this.fontStylesheet = link;
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, "+")}:wght@700&display=swap`;
            link.rel = "stylesheet";
            link.onload = ()=>{
                if (!isCurrent()) return;
                this.fontStylesheetSettled = true;
                this.resizeAfterFontLoad();
            };
            link.onerror = ()=>{
                if (!isCurrent()) return;
                // A theme can provide this face even when the Google stylesheet is unavailable.
                this.fontStylesheetSettled = true;
                this.resizeAfterFontLoad();
                console.error("Unable to load clock font stylesheet:", fontFamily);
            };
            ownerDocument.head.appendChild(link);
        }, this.scheduleResize = ()=>{
            if (this.resizeFrame === undefined) this.resizeFrame = requestAnimationFrame(()=>{
                this.resizeFrame = undefined;
                this.handleResize();
            });
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
                let fontSize = (width || 1) / fontSizeByLocale;
                const fontSizeTitle = (width || 1) / 15;
                const time = this.containerRef.querySelector("a");
                if (time) {
                    const availableWidth = this.containerRef.clientWidth - 1;
                    if (fontSize > 0 && availableWidth > 0) {
                        const previousFontSize = time.style.getPropertyValue("font-size");
                        const fontPriority = time.style.getPropertyPriority("font-size");
                        const whiteSpace = time.style.getPropertyValue("white-space");
                        const priority = time.style.getPropertyPriority("white-space");
                        try {
                            time.style.setProperty("font-size", `${fontSize}px`, "important");
                            time.style.setProperty("white-space", "nowrap", "important");
                            // Match clientWidth's layout pixels even under ancestor transforms.
                            const naturalWidth = time.offsetWidth;
                            if (Number.isFinite(naturalWidth) && naturalWidth > availableWidth) {
                                fontSize = fontSize * availableWidth / naturalWidth;
                                time.style.setProperty("font-size", `${fontSize}px`, "important");
                                // Hinted glyph widths can be quantized instead of scaling linearly.
                                if (time.offsetWidth > availableWidth) {
                                    let lower = 0;
                                    let upper = fontSize;
                                    for(let step = 0; step < 10; step += 1){
                                        const candidate = (lower + upper) / 2;
                                        time.style.setProperty("font-size", `${candidate}px`, "important");
                                        if (time.offsetWidth <= availableWidth) lower = candidate;
                                        else upper = candidate;
                                    }
                                    fontSize = lower;
                                }
                            }
                        } finally{
                            if (previousFontSize) time.style.setProperty("font-size", previousFontSize, fontPriority);
                            else time.style.removeProperty("font-size");
                            if (whiteSpace) time.style.setProperty("white-space", whiteSpace, priority);
                            else time.style.removeProperty("white-space");
                        }
                    }
                }
                if (fontSize !== this.state.fontSize || fontSizeTitle !== this.state.fontSizeTitle) this.setState({
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
    clearFontLoadHandlers() {
        this.fontLoadId += 1;
        this.fontStylesheetSettled = false;
        this.fontRequestedText = "";
        if (this.fontStylesheet) {
            this.fontStylesheet.onload = null;
            this.fontStylesheet.onerror = null;
            this.fontStylesheet = undefined;
        }
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
        if (this.containerRef && typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver((entries)=>{
                // A layout read during delivery can re-enter iframe layout in WebKit.
                const entry = entries[0];
                if (entry?.target !== this.containerRef) return;
                const width = entry.contentRect.width;
                if (width === this.observedWidth) return;
                this.observedWidth = width;
                // Fit outside observer delivery so height changes cannot cause a resize loop.
                this.scheduleResize();
            });
            this.resizeObserver.observe(this.containerRef);
        }
        // Load the Google Font
        this.loadGoogleFont(this.props.fontFamily);
    }
    componentDidUpdate(prevProps, prevState) {
        const hundredthsChanged = prevProps.hundredths !== this.props.hundredths;
        const formatChanged = prevProps.locale !== this.props.locale || prevProps.timeZone !== this.props.timeZone || prevProps.period !== this.props.period;
        if (formatChanged) this.resetHundredthsFormatter();
        if (prevProps.fontFamily !== this.props.fontFamily) this.loadGoogleFont(this.props.fontFamily);
        if (prevState.timeString !== this.state.timeString) this.resizeAfterFontLoad();
        if (prevProps.width !== this.props.width || hundredthsChanged || formatChanged || prevProps.fontFamily !== this.props.fontFamily || prevState.timeString.length !== this.state.timeString.length) this.scheduleResize();
        if (prevProps.prefers !== this.props.prefers) this.handlePrefers();
        // Recalc time immediately when formatting-related props change
        if (prevProps.locale !== this.props.locale || prevProps.timeZone !== this.props.timeZone || prevProps.second !== this.props.second || prevProps.hundredths !== this.props.hundredths || prevProps.period !== this.props.period || prevProps.timeZoneName !== this.props.timeZoneName) this.updateTimeAndDateString();
        if (hundredthsChanged) this.startClock();
    }
    componentWillUnmount() {
        // console.log("componentWillUnmount");
        this.stopClock();
        this.clearFontLoadHandlers();
        window.removeEventListener("resize", this.handleResize);
        this.resizeObserver?.disconnect();
        if (this.resizeFrame !== undefined) cancelAnimationFrame(this.resizeFrame);
    }
    render() {
        const { backgroundColor: backgroundColor, background: background, fontFamily: fontFamily, caption: caption, rounded: rounded, shadow: shadow, border: border, width: width, align: align, date: date } = this.props;
        const showDate = date !== undefined;
        const showCaption = caption || false;
        const parsedWidth = parseInt(width?.toString() || "80", 10) || undefined;
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
        return /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)((0, $a7a8e2c5ae553f9f$export$ffb0004e005737fa), null, /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("style", null, (0, (/*@__PURE__*/$parcel$interopDefault($311a3960f67ea2d3$exports)))), /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("div", {
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
                minWidth: "80px",
                ...width !== undefined && {
                    width: parsedWidth === undefined ? undefined : `${parsedWidth}px`
                }
            }
        }, /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("div", {
            className: (0, $c199437f4e4422ea$export$2e2bcd8739ae039)(`text-${align || "center"}`)
        }, this.state.timeString ? /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)((0, $a7a8e2c5ae553f9f$export$ffb0004e005737fa), null, showCaption && /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("div", {
            style: {
                fontSize: `${this.state.fontSizeTitle}px`
            }
        }, caption), /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("a", {
            title: this.state.timeZoneName,
            style: {
                fontSize: `${this.state.fontSize}px`,
                whiteSpace: "nowrap",
                ...fontStyles
            },
            href: "https://utctime.info/",
            target: "_blank",
            rel: "noopener noreferrer"
        }, this.state.timeString), showDate && /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)((0, $a7a8e2c5ae553f9f$export$ffb0004e005737fa), null, /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("div", {
            title: this.state.timeZoneName,
            ref: (el)=>{
                this.dateContainerRef = el;
            },
            onClick: ()=>{
                this.zoneContainerRef?.style.setProperty("display", "block");
                this.dateContainerRef?.style.setProperty("display", "none");
            },
            style: {
                fontSize: `${this.state.fontSizeTitle}px`,
                cursor: "pointer"
            }
        }, this.state.dateString), /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("div", {
            title: this.state.dateString,
            onClick: ()=>{
                this.zoneContainerRef?.style.setProperty("display", "none");
                this.dateContainerRef?.style.setProperty("display", "block");
            },
            ref: (el)=>{
                this.zoneContainerRef = el;
            },
            style: {
                fontSize: `${this.state.fontSizeTitle}px`,
                display: "none",
                cursor: "pointer"
            }
        }, this.state.timeZoneName))) : /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)((0, $a7a8e2c5ae553f9f$export$ffb0004e005737fa), null, "..."), this.state.isError && /*#__PURE__*/ (0, $a7a8e2c5ae553f9f$export$c8a8987d4410bf2d)("div", null, "Error, please check attributes of tag."))));
    }
}
var $aa43cbaf8926a599$export$2e2bcd8739ae039 = $aa43cbaf8926a599$var$SimpleDigitalClockWidget;
(0, $6f0b21dd6dcd5f7b$export$2e2bcd8739ae039)($aa43cbaf8926a599$var$SimpleDigitalClockWidget, undefined, undefined, {
    shadow: true
});

})();
//# sourceMappingURL=SimpleDigitalClockWidget.js.map
