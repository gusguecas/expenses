var gs=Object.defineProperty;var ga=e=>{throw TypeError(e)};var hs=(e,t,a)=>t in e?gs(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var h=(e,t,a)=>hs(e,typeof t!="symbol"?t+"":t,a),kt=(e,t,a)=>t.has(e)||ga("Cannot "+a);var u=(e,t,a)=>(kt(e,t,"read from private field"),a?a.call(e):t.get(e)),w=(e,t,a)=>t.has(e)?ga("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),E=(e,t,a,r)=>(kt(e,t,"write to private field"),r?r.call(e,a):t.set(e,a),a),A=(e,t,a)=>(kt(e,t,"access private method"),a);var ha=(e,t,a,r)=>({set _(s){E(e,t,s,a)},get _(){return u(e,t,r)}});import ys from"crypto";var tr={Stringify:1},B=(e,t)=>{const a=new String(e);return a.isEscaped=!0,a.callbacks=t,a},vs=/[&<>'"]/,ar=async(e,t)=>{let a="";t||(t=[]);const r=await Promise.all(e);for(let s=r.length-1;a+=r[s],s--,!(s<0);s--){let o=r[s];typeof o=="object"&&t.push(...o.callbacks||[]);const i=o.isEscaped;if(o=await(typeof o=="object"?o.toString():o),typeof o=="object"&&t.push(...o.callbacks||[]),o.isEscaped??i)a+=o;else{const l=[a];be(o,l),a=l[0]}}return B(a,t)},be=(e,t)=>{const a=e.search(vs);if(a===-1){t[0]+=e;return}let r,s,o=0;for(s=a;s<e.length;s++){switch(e.charCodeAt(s)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(o,s)+r,o=s+1}t[0]+=e.substring(o,s)},rr=e=>{const t=e.callbacks;if(!(t!=null&&t.length))return e;const a=[e],r={};return t.forEach(s=>s({phase:tr.Stringify,buffer:a,context:r})),a[0]},sr=async(e,t,a,r,s)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const o=e.callbacks;return o!=null&&o.length?(s?s[0]+=e:s=[e],Promise.all(o.map(l=>l({phase:t,buffer:s,context:r}))).then(l=>Promise.all(l.filter(Boolean).map(c=>sr(c,t,!1,r,s))).then(()=>s[0]))):Promise.resolve(e)},Es=(e,...t)=>{const a=[""];for(let r=0,s=e.length-1;r<s;r++){a[0]+=e[r];const o=Array.isArray(t[r])?t[r].flat(1/0):[t[r]];for(let i=0,l=o.length;i<l;i++){const c=o[i];if(typeof c=="string")be(c,a);else if(typeof c=="number")a[0]+=c;else{if(typeof c=="boolean"||c===null||c===void 0)continue;if(typeof c=="object"&&c.isEscaped)if(c.callbacks)a.unshift("",c);else{const d=c.toString();d instanceof Promise?a.unshift("",d):a[0]+=d}else c instanceof Promise?a.unshift("",c):be(c.toString(),a)}}}return a[0]+=e.at(-1),a.length===1?"callbacks"in a?B(rr(B(a[0],a.callbacks))):B(a[0]):ar(a,a.callbacks)},na=Symbol("RENDERER"),Vt=Symbol("ERROR_HANDLER"),I=Symbol("STASH"),or=Symbol("INTERNAL"),ws=Symbol("MEMO"),Rt=Symbol("PERMALINK"),ya=e=>(e[or]=!0,e),nr=e=>({value:t,children:a})=>{if(!a)return;const r={children:[{tag:ya(()=>{e.push(t)}),props:{}}]};Array.isArray(a)?r.children.push(...a.flat()):r.children.push(a),r.children.push({tag:ya(()=>{e.pop()}),props:{}});const s={tag:"",props:r,type:""};return s[Vt]=o=>{throw e.pop(),o},s},ir=e=>{const t=[e],a=nr(t);return a.values=t,a.Provider=a,ze.push(a),a},ze=[],ia=e=>{const t=[e],a=r=>{t.push(r.value);let s;try{s=r.children?(Array.isArray(r.children)?new pr("",{},r.children):r.children).toString():""}finally{t.pop()}return s instanceof Promise?s.then(o=>B(o,o.callbacks)):B(s)};return a.values=t,a.Provider=a,a[na]=nr(t),ze.push(a),a},qe=e=>e.values.at(-1),vt={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},Jt={},Et="data-precedence",ft=e=>Array.isArray(e)?e:[e],va=new WeakMap,Ea=(e,t,a,r)=>({buffer:s,context:o})=>{if(!s)return;const i=va.get(o)||{};va.set(o,i);const l=i[e]||(i[e]=[]);let c=!1;const d=vt[e];if(d.length>0){e:for(const[,p]of l)for(const m of d)if(((p==null?void 0:p[m])??null)===(a==null?void 0:a[m])){c=!0;break e}}if(c?s[0]=s[0].replaceAll(t,""):d.length>0?l.push([t,a,r]):l.unshift([t,a,r]),s[0].indexOf("</head>")!==-1){let p;if(r===void 0)p=l.map(([m])=>m);else{const m=[];p=l.map(([f,,x])=>{let g=m.indexOf(x);return g===-1&&(m.push(x),g=m.length-1),[f,g]}).sort((f,x)=>f[1]-x[1]).map(([f])=>f)}p.forEach(m=>{s[0]=s[0].replaceAll(m,"")}),s[0]=s[0].replace(/(?=<\/head>)/,p.join(""))}},xt=(e,t,a)=>B(new W(e,a,ft(t??[])).toString()),bt=(e,t,a,r)=>{if("itemProp"in a)return xt(e,t,a);let{precedence:s,blocking:o,...i}=a;s=r?s??"":void 0,r&&(i[Et]=s);const l=new W(e,i,ft(t||[])).toString();return l instanceof Promise?l.then(c=>B(l,[...c.callbacks||[],Ea(e,c,i,s)])):B(l,[Ea(e,l,i,s)])},Ts=({children:e,...t})=>{const a=la();if(a){const r=qe(a);if(r==="svg"||r==="head")return new W("title",t,ft(e??[]))}return bt("title",e,t,!1)},Ns=({children:e,...t})=>{const a=la();return["src","async"].some(r=>!t[r])||a&&qe(a)==="head"?xt("script",e,t):bt("script",e,t,!1)},_s=({children:e,...t})=>["href","precedence"].every(a=>a in t)?(t["data-href"]=t.href,delete t.href,bt("style",e,t,!0)):xt("style",e,t),As=({children:e,...t})=>["onLoad","onError"].some(a=>a in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?xt("link",e,t):bt("link",e,t,"precedence"in t),Cs=({children:e,...t})=>{const a=la();return a&&qe(a)==="head"?xt("meta",e,t):bt("meta",e,t,!1)},lr=(e,{children:t,...a})=>new W(e,a,ft(t??[])),Ss=e=>(typeof e.action=="function"&&(e.action=Rt in e.action?e.action[Rt]:void 0),lr("form",e)),cr=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=Rt in t.formAction?t.formAction[Rt]:void 0),lr(e,t)),Rs=e=>cr("input",e),Is=e=>cr("button",e);const Pt=Object.freeze(Object.defineProperty({__proto__:null,button:Is,form:Ss,input:Rs,link:As,meta:Cs,script:Ns,style:_s,title:Ts},Symbol.toStringTag,{value:"Module"}));var Ds=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),It=e=>Ds.get(e)||e,dr=(e,t)=>{for(const[a,r]of Object.entries(e)){const s=a[0]==="-"||!/[A-Z]/.test(a)?a:a.replace(/[A-Z]/g,o=>`-${o.toLowerCase()}`);t(s,r==null?null:typeof r=="number"?s.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}},tt=void 0,la=()=>tt,Ms=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Os=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Ls=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],ca=(e,t)=>{for(let a=0,r=e.length;a<r;a++){const s=e[a];if(typeof s=="string")be(s,t);else{if(typeof s=="boolean"||s===null||s===void 0)continue;s instanceof W?s.toStringToBuffer(t):typeof s=="number"||s.isEscaped?t[0]+=s:s instanceof Promise?t.unshift("",s):ca(s,t)}}},W=class{constructor(e,t,a){h(this,"tag");h(this,"props");h(this,"key");h(this,"children");h(this,"isEscaped",!0);h(this,"localContexts");this.tag=e,this.props=t,this.children=a}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){var t,a;const e=[""];(t=this.localContexts)==null||t.forEach(([r,s])=>{r.values.push(s)});try{this.toStringToBuffer(e)}finally{(a=this.localContexts)==null||a.forEach(([r])=>{r.values.pop()})}return e.length===1?"callbacks"in e?rr(B(e[0],e.callbacks)).toString():e[0]:ar(e,e.callbacks)}toStringToBuffer(e){const t=this.tag,a=this.props;let{children:r}=this;e[0]+=`<${t}`;const s=tt&&qe(tt)==="svg"?o=>Ms(It(o)):o=>It(o);for(let[o,i]of Object.entries(a))if(o=s(o),o!=="children"){if(o==="style"&&typeof i=="object"){let l="";dr(i,(c,d)=>{d!=null&&(l+=`${l?";":""}${c}:${d}`)}),e[0]+=' style="',be(l,e),e[0]+='"'}else if(typeof i=="string")e[0]+=` ${o}="`,be(i,e),e[0]+='"';else if(i!=null)if(typeof i=="number"||i.isEscaped)e[0]+=` ${o}="${i}"`;else if(typeof i=="boolean"&&Ls.includes(o))i&&(e[0]+=` ${o}=""`);else if(o==="dangerouslySetInnerHTML"){if(r.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");r=[B(i.__html)]}else if(i instanceof Promise)e[0]+=` ${o}="`,e.unshift('"',i);else if(typeof i=="function"){if(!o.startsWith("on")&&o!=="ref")throw new Error(`Invalid prop '${o}' of type 'function' supplied to '${t}'.`)}else e[0]+=` ${o}="`,be(i.toString(),e),e[0]+='"'}if(Os.includes(t)&&r.length===0){e[0]+="/>";return}e[0]+=">",ca(r,e),e[0]+=`</${t}>`}},jt=class extends W{toStringToBuffer(e){const{children:t}=this,a=this.tag.call(null,{...this.props,children:t.length<=1?t[0]:t});if(!(typeof a=="boolean"||a==null))if(a instanceof Promise)if(ze.length===0)e.unshift("",a);else{const r=ze.map(s=>[s,s.values.at(-1)]);e.unshift("",a.then(s=>(s instanceof W&&(s.localContexts=r),s)))}else a instanceof W?a.toStringToBuffer(e):typeof a=="number"||a.isEscaped?(e[0]+=a,a.callbacks&&(e.callbacks||(e.callbacks=[]),e.callbacks.push(...a.callbacks))):be(a,e)}},pr=class extends W{toStringToBuffer(e){ca(this.children,e)}},wa=(e,t,...a)=>{t??(t={}),a.length&&(t.children=a.length===1?a[0]:a);const r=t.key;delete t.key;const s=wt(e,t,a);return s.key=r,s},Ta=!1,wt=(e,t,a)=>{if(!Ta){for(const r in Jt)Pt[r][na]=Jt[r];Ta=!0}return typeof e=="function"?new jt(e,t,a):Pt[e]?new jt(Pt[e],t,a):e==="svg"||e==="head"?(tt||(tt=ia("")),new W(e,t,[new jt(tt,{value:e},a)])):new W(e,t,a)},Fs=({children:e})=>new pr("",{children:e},Array.isArray(e)?e:e?[e]:[]);function n(e,t,a){let r;if(!t||!("children"in t))r=wt(e,t,[]);else{const s=t.children;r=Array.isArray(s)?wt(e,t,s):wt(e,t,[s])}return r.key=a,r}var Na=(e,t,a)=>(r,s)=>{let o=-1;return i(0);async function i(l){if(l<=o)throw new Error("next() called multiple times");o=l;let c,d=!1,p;if(e[l]?(p=e[l][0][0],r.req.routeIndex=l):p=l===e.length&&s||void 0,p)try{c=await p(r,()=>i(l+1))}catch(m){if(m instanceof Error&&t)r.error=m,c=await t(m,r),d=!0;else throw m}else r.finalized===!1&&a&&(c=await a(r));return c&&(r.finalized===!1||d)&&(r.res=c),r}},Us=Symbol(),ks=async(e,t=Object.create(null))=>{const{all:a=!1,dot:r=!1}=t,o=(e instanceof gr?e.raw.headers:e.headers).get("Content-Type");return o!=null&&o.startsWith("multipart/form-data")||o!=null&&o.startsWith("application/x-www-form-urlencoded")?Ps(e,{all:a,dot:r}):{}};async function Ps(e,t){const a=await e.formData();return a?js(a,t):{}}function js(e,t){const a=Object.create(null);return e.forEach((r,s)=>{t.all||s.endsWith("[]")?Bs(a,s,r):a[s]=r}),t.dot&&Object.entries(a).forEach(([r,s])=>{r.includes(".")&&(Hs(a,r,s),delete a[r])}),a}var Bs=(e,t,a)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(a):e[t]=[e[t],a]:t.endsWith("[]")?e[t]=[a]:e[t]=a},Hs=(e,t,a)=>{let r=e;const s=t.split(".");s.forEach((o,i)=>{i===s.length-1?r[o]=a:((!r[o]||typeof r[o]!="object"||Array.isArray(r[o])||r[o]instanceof File)&&(r[o]=Object.create(null)),r=r[o])})},ur=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},$s=e=>{const{groups:t,path:a}=Gs(e),r=ur(a);return Xs(r,t)},Gs=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(a,r)=>{const s=`@${r}`;return t.push([s,a]),s}),{groups:t,path:e}},Xs=(e,t)=>{for(let a=t.length-1;a>=0;a--){const[r]=t[a];for(let s=e.length-1;s>=0;s--)if(e[s].includes(r)){e[s]=e[s].replace(r,t[a][1]);break}}return e},ht={},zs=(e,t)=>{if(e==="*")return"*";const a=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(a){const r=`${e}#${t}`;return ht[r]||(a[2]?ht[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,a[1],new RegExp(`^${a[2]}(?=/${t})`)]:[e,a[1],new RegExp(`^${a[2]}$`)]:ht[r]=[e,a[1],!0]),ht[r]}return null},da=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,a=>{try{return t(a)}catch{return a}})}},Ws=e=>da(e,decodeURI),mr=e=>{const t=e.url,a=t.indexOf("/",t.indexOf(":")+4);let r=a;for(;r<t.length;r++){const s=t.charCodeAt(r);if(s===37){const o=t.indexOf("?",r),i=t.slice(a,o===-1?void 0:o);return Ws(i.includes("%25")?i.replace(/%25/g,"%2525"):i)}else if(s===63)break}return t.slice(a,r)},Ks=e=>{const t=mr(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},Oe=(e,t,...a)=>(a.length&&(t=Oe(t,...a)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),fr=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),a=[];let r="";return t.forEach(s=>{if(s!==""&&!/\:/.test(s))r+="/"+s;else if(/\:/.test(s))if(/\?/.test(s)){a.length===0&&r===""?a.push("/"):a.push(r);const o=s.replace("?","");r+="/"+o,a.push(r)}else r+="/"+s}),a.filter((s,o,i)=>i.indexOf(s)===o)},Bt=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?da(e,br):e):e,xr=(e,t,a)=>{let r;if(!a&&t&&!/[%+]/.test(t)){let i=e.indexOf(`?${t}`,8);for(i===-1&&(i=e.indexOf(`&${t}`,8));i!==-1;){const l=e.charCodeAt(i+t.length+1);if(l===61){const c=i+t.length+2,d=e.indexOf("&",c);return Bt(e.slice(c,d===-1?void 0:d))}else if(l==38||isNaN(l))return"";i=e.indexOf(`&${t}`,i+1)}if(r=/[%+]/.test(e),!r)return}const s={};r??(r=/[%+]/.test(e));let o=e.indexOf("?",8);for(;o!==-1;){const i=e.indexOf("&",o+1);let l=e.indexOf("=",o);l>i&&i!==-1&&(l=-1);let c=e.slice(o+1,l===-1?i===-1?void 0:i:l);if(r&&(c=Bt(c)),o=i,c==="")continue;let d;l===-1?d="":(d=e.slice(l+1,i===-1?void 0:i),r&&(d=Bt(d))),a?(s[c]&&Array.isArray(s[c])||(s[c]=[]),s[c].push(d)):s[c]??(s[c]=d)}return t?s[t]:s},qs=xr,Vs=(e,t)=>xr(e,t,!0),br=decodeURIComponent,_a=e=>da(e,br),je,P,se,hr,yr,Yt,ce,Wa,gr=(Wa=class{constructor(e,t="/",a=[[]]){w(this,se);h(this,"raw");w(this,je);w(this,P);h(this,"routeIndex",0);h(this,"path");h(this,"bodyCache",{});w(this,ce,e=>{const{bodyCache:t,raw:a}=this,r=t[e];if(r)return r;const s=Object.keys(t)[0];return s?t[s].then(o=>(s==="json"&&(o=JSON.stringify(o)),new Response(o)[e]())):t[e]=a[e]()});this.raw=e,this.path=t,E(this,P,a),E(this,je,{})}param(e){return e?A(this,se,hr).call(this,e):A(this,se,yr).call(this)}query(e){return qs(this.url,e)}queries(e){return Vs(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((a,r)=>{t[r]=a}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await ks(this,e))}json(){return u(this,ce).call(this,"text").then(e=>JSON.parse(e))}text(){return u(this,ce).call(this,"text")}arrayBuffer(){return u(this,ce).call(this,"arrayBuffer")}blob(){return u(this,ce).call(this,"blob")}formData(){return u(this,ce).call(this,"formData")}addValidatedData(e,t){u(this,je)[e]=t}valid(e){return u(this,je)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Us](){return u(this,P)}get matchedRoutes(){return u(this,P)[0].map(([[,e]])=>e)}get routePath(){return u(this,P)[0].map(([[,e]])=>e)[this.routeIndex].path}},je=new WeakMap,P=new WeakMap,se=new WeakSet,hr=function(e){const t=u(this,P)[0][this.routeIndex][1][e],a=A(this,se,Yt).call(this,t);return a&&/\%/.test(a)?_a(a):a},yr=function(){const e={},t=Object.keys(u(this,P)[0][this.routeIndex][1]);for(const a of t){const r=A(this,se,Yt).call(this,u(this,P)[0][this.routeIndex][1][a]);r!==void 0&&(e[a]=/\%/.test(r)?_a(r):r)}return e},Yt=function(e){return u(this,P)[1]?u(this,P)[1][e]:e},ce=new WeakMap,Wa),Js="text/plain; charset=UTF-8",Ht=(e,t)=>({"Content-Type":e,...t}),it,lt,ee,Be,te,U,ct,He,$e,Ee,dt,pt,de,Le,Ka,Ys=(Ka=class{constructor(e,t){w(this,de);w(this,it);w(this,lt);h(this,"env",{});w(this,ee);h(this,"finalized",!1);h(this,"error");w(this,Be);w(this,te);w(this,U);w(this,ct);w(this,He);w(this,$e);w(this,Ee);w(this,dt);w(this,pt);h(this,"render",(...e)=>(u(this,He)??E(this,He,t=>this.html(t)),u(this,He).call(this,...e)));h(this,"setLayout",e=>E(this,ct,e));h(this,"getLayout",()=>u(this,ct));h(this,"setRenderer",e=>{E(this,He,e)});h(this,"header",(e,t,a)=>{this.finalized&&E(this,U,new Response(u(this,U).body,u(this,U)));const r=u(this,U)?u(this,U).headers:u(this,Ee)??E(this,Ee,new Headers);t===void 0?r.delete(e):a!=null&&a.append?r.append(e,t):r.set(e,t)});h(this,"status",e=>{E(this,Be,e)});h(this,"set",(e,t)=>{u(this,ee)??E(this,ee,new Map),u(this,ee).set(e,t)});h(this,"get",e=>u(this,ee)?u(this,ee).get(e):void 0);h(this,"newResponse",(...e)=>A(this,de,Le).call(this,...e));h(this,"body",(e,t,a)=>A(this,de,Le).call(this,e,t,a));h(this,"text",(e,t,a)=>!u(this,Ee)&&!u(this,Be)&&!t&&!a&&!this.finalized?new Response(e):A(this,de,Le).call(this,e,t,Ht(Js,a)));h(this,"json",(e,t,a)=>A(this,de,Le).call(this,JSON.stringify(e),t,Ht("application/json",a)));h(this,"html",(e,t,a)=>{const r=s=>A(this,de,Le).call(this,s,t,Ht("text/html; charset=UTF-8",a));return typeof e=="object"?sr(e,tr.Stringify,!1,{}).then(r):r(e)});h(this,"redirect",(e,t)=>{const a=String(e);return this.header("Location",/[^\x00-\xFF]/.test(a)?encodeURI(a):a),this.newResponse(null,t??302)});h(this,"notFound",()=>(u(this,$e)??E(this,$e,()=>new Response),u(this,$e).call(this,this)));E(this,it,e),t&&(E(this,te,t.executionCtx),this.env=t.env,E(this,$e,t.notFoundHandler),E(this,pt,t.path),E(this,dt,t.matchResult))}get req(){return u(this,lt)??E(this,lt,new gr(u(this,it),u(this,pt),u(this,dt))),u(this,lt)}get event(){if(u(this,te)&&"respondWith"in u(this,te))return u(this,te);throw Error("This context has no FetchEvent")}get executionCtx(){if(u(this,te))return u(this,te);throw Error("This context has no ExecutionContext")}get res(){return u(this,U)||E(this,U,new Response(null,{headers:u(this,Ee)??E(this,Ee,new Headers)}))}set res(e){if(u(this,U)&&e){e=new Response(e.body,e);for(const[t,a]of u(this,U).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=u(this,U).headers.getSetCookie();e.headers.delete("set-cookie");for(const s of r)e.headers.append("set-cookie",s)}else e.headers.set(t,a)}E(this,U,e),this.finalized=!0}get var(){return u(this,ee)?Object.fromEntries(u(this,ee)):{}}},it=new WeakMap,lt=new WeakMap,ee=new WeakMap,Be=new WeakMap,te=new WeakMap,U=new WeakMap,ct=new WeakMap,He=new WeakMap,$e=new WeakMap,Ee=new WeakMap,dt=new WeakMap,pt=new WeakMap,de=new WeakSet,Le=function(e,t,a){const r=u(this,U)?new Headers(u(this,U).headers):u(this,Ee)??new Headers;if(typeof t=="object"&&"headers"in t){const o=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[i,l]of o)i.toLowerCase()==="set-cookie"?r.append(i,l):r.set(i,l)}if(a)for(const[o,i]of Object.entries(a))if(typeof i=="string")r.set(o,i);else{r.delete(o);for(const l of i)r.append(o,l)}const s=typeof t=="number"?t:(t==null?void 0:t.status)??u(this,Be);return new Response(e,{status:s,headers:r})},Ka),D="ALL",Zs="all",Qs=["get","post","put","delete","options","patch"],vr="Can not add a route since the matcher is already built.",Er=class extends Error{},eo="__COMPOSED_HANDLER",to=e=>e.text("404 Not Found",404),Aa=(e,t)=>{if("getResponse"in e){const a=e.getResponse();return t.newResponse(a.body,a)}return console.error(e),t.text("Internal Server Error",500)},$,M,Tr,G,ye,Tt,Nt,qa,wr=(qa=class{constructor(t={}){w(this,M);h(this,"get");h(this,"post");h(this,"put");h(this,"delete");h(this,"options");h(this,"patch");h(this,"all");h(this,"on");h(this,"use");h(this,"router");h(this,"getPath");h(this,"_basePath","/");w(this,$,"/");h(this,"routes",[]);w(this,G,to);h(this,"errorHandler",Aa);h(this,"onError",t=>(this.errorHandler=t,this));h(this,"notFound",t=>(E(this,G,t),this));h(this,"fetch",(t,...a)=>A(this,M,Nt).call(this,t,a[1],a[0],t.method));h(this,"request",(t,a,r,s)=>t instanceof Request?this.fetch(a?new Request(t,a):t,r,s):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${Oe("/",t)}`,a),r,s)));h(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(A(this,M,Nt).call(this,t.request,t,void 0,t.request.method))})});[...Qs,Zs].forEach(o=>{this[o]=(i,...l)=>(typeof i=="string"?E(this,$,i):A(this,M,ye).call(this,o,u(this,$),i),l.forEach(c=>{A(this,M,ye).call(this,o,u(this,$),c)}),this)}),this.on=(o,i,...l)=>{for(const c of[i].flat()){E(this,$,c);for(const d of[o].flat())l.map(p=>{A(this,M,ye).call(this,d.toUpperCase(),u(this,$),p)})}return this},this.use=(o,...i)=>(typeof o=="string"?E(this,$,o):(E(this,$,"*"),i.unshift(o)),i.forEach(l=>{A(this,M,ye).call(this,D,u(this,$),l)}),this);const{strict:r,...s}=t;Object.assign(this,s),this.getPath=r??!0?t.getPath??mr:Ks}route(t,a){const r=this.basePath(t);return a.routes.map(s=>{var i;let o;a.errorHandler===Aa?o=s.handler:(o=async(l,c)=>(await Na([],a.errorHandler)(l,()=>s.handler(l,c))).res,o[eo]=s.handler),A(i=r,M,ye).call(i,s.method,s.path,o)}),this}basePath(t){const a=A(this,M,Tr).call(this);return a._basePath=Oe(this._basePath,t),a}mount(t,a,r){let s,o;r&&(typeof r=="function"?o=r:(o=r.optionHandler,r.replaceRequest===!1?s=c=>c:s=r.replaceRequest));const i=o?c=>{const d=o(c);return Array.isArray(d)?d:[d]}:c=>{let d;try{d=c.executionCtx}catch{}return[c.env,d]};s||(s=(()=>{const c=Oe(this._basePath,t),d=c==="/"?0:c.length;return p=>{const m=new URL(p.url);return m.pathname=m.pathname.slice(d)||"/",new Request(m,p)}})());const l=async(c,d)=>{const p=await a(s(c.req.raw),...i(c));if(p)return p;await d()};return A(this,M,ye).call(this,D,Oe(t,"*"),l),this}},$=new WeakMap,M=new WeakSet,Tr=function(){const t=new wr({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,E(t,G,u(this,G)),t.routes=this.routes,t},G=new WeakMap,ye=function(t,a,r){t=t.toUpperCase(),a=Oe(this._basePath,a);const s={basePath:this._basePath,path:a,method:t,handler:r};this.router.add(t,a,[r,s]),this.routes.push(s)},Tt=function(t,a){if(t instanceof Error)return this.errorHandler(t,a);throw t},Nt=function(t,a,r,s){if(s==="HEAD")return(async()=>new Response(null,await A(this,M,Nt).call(this,t,a,r,"GET")))();const o=this.getPath(t,{env:r}),i=this.router.match(s,o),l=new Ys(t,{path:o,matchResult:i,env:r,executionCtx:a,notFoundHandler:u(this,G)});if(i[0].length===1){let d;try{d=i[0][0][0][0](l,async()=>{l.res=await u(this,G).call(this,l)})}catch(p){return A(this,M,Tt).call(this,p,l)}return d instanceof Promise?d.then(p=>p||(l.finalized?l.res:u(this,G).call(this,l))).catch(p=>A(this,M,Tt).call(this,p,l)):d??u(this,G).call(this,l)}const c=Na(i[0],this.errorHandler,u(this,G));return(async()=>{try{const d=await c(l);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return A(this,M,Tt).call(this,d,l)}})()},qa),Dt="[^/]+",Ye=".*",Ze="(?:|/.*)",Fe=Symbol(),ao=new Set(".\\+*[^]$()");function ro(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===Ye||e===Ze?1:t===Ye||t===Ze?-1:e===Dt?1:t===Dt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var we,Te,X,Va,Zt=(Va=class{constructor(){w(this,we);w(this,Te);w(this,X,Object.create(null))}insert(t,a,r,s,o){if(t.length===0){if(u(this,we)!==void 0)throw Fe;if(o)return;E(this,we,a);return}const[i,...l]=t,c=i==="*"?l.length===0?["","",Ye]:["","",Dt]:i==="/*"?["","",Ze]:i.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(c){const p=c[1];let m=c[2]||Dt;if(p&&c[2]&&(m===".*"||(m=m.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(m))))throw Fe;if(d=u(this,X)[m],!d){if(Object.keys(u(this,X)).some(f=>f!==Ye&&f!==Ze))throw Fe;if(o)return;d=u(this,X)[m]=new Zt,p!==""&&E(d,Te,s.varIndex++)}!o&&p!==""&&r.push([p,u(d,Te)])}else if(d=u(this,X)[i],!d){if(Object.keys(u(this,X)).some(p=>p.length>1&&p!==Ye&&p!==Ze))throw Fe;if(o)return;d=u(this,X)[i]=new Zt}d.insert(l,a,r,s,o)}buildRegExpStr(){const a=Object.keys(u(this,X)).sort(ro).map(r=>{const s=u(this,X)[r];return(typeof u(s,Te)=="number"?`(${r})@${u(s,Te)}`:ao.has(r)?`\\${r}`:r)+s.buildRegExpStr()});return typeof u(this,we)=="number"&&a.unshift(`#${u(this,we)}`),a.length===0?"":a.length===1?a[0]:"(?:"+a.join("|")+")"}},we=new WeakMap,Te=new WeakMap,X=new WeakMap,Va),Ot,ut,Ja,so=(Ja=class{constructor(){w(this,Ot,{varIndex:0});w(this,ut,new Zt)}insert(e,t,a){const r=[],s=[];for(let i=0;;){let l=!1;if(e=e.replace(/\{[^}]+\}/g,c=>{const d=`@\\${i}`;return s[i]=[d,c],i++,l=!0,d}),!l)break}const o=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=s.length-1;i>=0;i--){const[l]=s[i];for(let c=o.length-1;c>=0;c--)if(o[c].indexOf(l)!==-1){o[c]=o[c].replace(l,s[i][1]);break}}return u(this,ut).insert(o,t,r,u(this,Ot),a),r}buildRegExp(){let e=u(this,ut).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const a=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(s,o,i)=>o!==void 0?(a[++t]=Number(o),"$()"):(i!==void 0&&(r[Number(i)]=++t),"")),[new RegExp(`^${e}`),a,r]}},Ot=new WeakMap,ut=new WeakMap,Ja),Nr=[],oo=[/^$/,[],Object.create(null)],_t=Object.create(null);function _r(e){return _t[e]??(_t[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,a)=>a?`\\${a}`:"(?:|/.*)")}$`))}function no(){_t=Object.create(null)}function io(e){var d;const t=new so,a=[];if(e.length===0)return oo;const r=e.map(p=>[!/\*|\/:/.test(p[0]),...p]).sort(([p,m],[f,x])=>p?1:f?-1:m.length-x.length),s=Object.create(null);for(let p=0,m=-1,f=r.length;p<f;p++){const[x,g,b]=r[p];x?s[g]=[b.map(([T])=>[T,Object.create(null)]),Nr]:m++;let v;try{v=t.insert(g,m,x)}catch(T){throw T===Fe?new Er(g):T}x||(a[m]=b.map(([T,N])=>{const C=Object.create(null);for(N-=1;N>=0;N--){const[_,L]=v[N];C[_]=L}return[T,C]}))}const[o,i,l]=t.buildRegExp();for(let p=0,m=a.length;p<m;p++)for(let f=0,x=a[p].length;f<x;f++){const g=(d=a[p][f])==null?void 0:d[1];if(!g)continue;const b=Object.keys(g);for(let v=0,T=b.length;v<T;v++)g[b[v]]=l[g[b[v]]]}const c=[];for(const p in i)c[p]=a[i[p]];return[o,c,s]}function Re(e,t){if(e){for(const a of Object.keys(e).sort((r,s)=>s.length-r.length))if(_r(a).test(t))return[...e[a]]}}var pe,ue,Ke,Ar,Cr,Ya,lo=(Ya=class{constructor(){w(this,Ke);h(this,"name","RegExpRouter");w(this,pe);w(this,ue);E(this,pe,{[D]:Object.create(null)}),E(this,ue,{[D]:Object.create(null)})}add(e,t,a){var l;const r=u(this,pe),s=u(this,ue);if(!r||!s)throw new Error(vr);r[e]||[r,s].forEach(c=>{c[e]=Object.create(null),Object.keys(c[D]).forEach(d=>{c[e][d]=[...c[D][d]]})}),t==="/*"&&(t="*");const o=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const c=_r(t);e===D?Object.keys(r).forEach(d=>{var p;(p=r[d])[t]||(p[t]=Re(r[d],t)||Re(r[D],t)||[])}):(l=r[e])[t]||(l[t]=Re(r[e],t)||Re(r[D],t)||[]),Object.keys(r).forEach(d=>{(e===D||e===d)&&Object.keys(r[d]).forEach(p=>{c.test(p)&&r[d][p].push([a,o])})}),Object.keys(s).forEach(d=>{(e===D||e===d)&&Object.keys(s[d]).forEach(p=>c.test(p)&&s[d][p].push([a,o]))});return}const i=fr(t)||[t];for(let c=0,d=i.length;c<d;c++){const p=i[c];Object.keys(s).forEach(m=>{var f;(e===D||e===m)&&((f=s[m])[p]||(f[p]=[...Re(r[m],p)||Re(r[D],p)||[]]),s[m][p].push([a,o-d+c+1]))})}}match(e,t){no();const a=A(this,Ke,Ar).call(this);return this.match=(r,s)=>{const o=a[r]||a[D],i=o[2][s];if(i)return i;const l=s.match(o[0]);if(!l)return[[],Nr];const c=l.indexOf("",1);return[o[1][c],l]},this.match(e,t)}},pe=new WeakMap,ue=new WeakMap,Ke=new WeakSet,Ar=function(){const e=Object.create(null);return Object.keys(u(this,ue)).concat(Object.keys(u(this,pe))).forEach(t=>{e[t]||(e[t]=A(this,Ke,Cr).call(this,t))}),E(this,pe,E(this,ue,void 0)),e},Cr=function(e){const t=[];let a=e===D;return[u(this,pe),u(this,ue)].forEach(r=>{const s=r[e]?Object.keys(r[e]).map(o=>[o,r[e][o]]):[];s.length!==0?(a||(a=!0),t.push(...s)):e!==D&&t.push(...Object.keys(r[D]).map(o=>[o,r[D][o]]))}),a?io(t):null},Ya),me,ae,Za,co=(Za=class{constructor(e){h(this,"name","SmartRouter");w(this,me,[]);w(this,ae,[]);E(this,me,e.routers)}add(e,t,a){if(!u(this,ae))throw new Error(vr);u(this,ae).push([e,t,a])}match(e,t){if(!u(this,ae))throw new Error("Fatal error");const a=u(this,me),r=u(this,ae),s=a.length;let o=0,i;for(;o<s;o++){const l=a[o];try{for(let c=0,d=r.length;c<d;c++)l.add(...r[c]);i=l.match(e,t)}catch(c){if(c instanceof Er)continue;throw c}this.match=l.match.bind(l),E(this,me,[l]),E(this,ae,void 0);break}if(o===s)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(u(this,ae)||u(this,me).length!==1)throw new Error("No active router has been determined yet.");return u(this,me)[0]}},me=new WeakMap,ae=new WeakMap,Za),Ve=Object.create(null),fe,F,Ne,Ge,O,re,ve,Qa,Sr=(Qa=class{constructor(e,t,a){w(this,re);w(this,fe);w(this,F);w(this,Ne);w(this,Ge,0);w(this,O,Ve);if(E(this,F,a||Object.create(null)),E(this,fe,[]),e&&t){const r=Object.create(null);r[e]={handler:t,possibleKeys:[],score:0},E(this,fe,[r])}E(this,Ne,[])}insert(e,t,a){E(this,Ge,++ha(this,Ge)._);let r=this;const s=$s(t),o=[];for(let i=0,l=s.length;i<l;i++){const c=s[i],d=s[i+1],p=zs(c,d),m=Array.isArray(p)?p[0]:c;if(m in u(r,F)){r=u(r,F)[m],p&&o.push(p[1]);continue}u(r,F)[m]=new Sr,p&&(u(r,Ne).push(p),o.push(p[1])),r=u(r,F)[m]}return u(r,fe).push({[e]:{handler:a,possibleKeys:o.filter((i,l,c)=>c.indexOf(i)===l),score:u(this,Ge)}}),r}search(e,t){var l;const a=[];E(this,O,Ve);let s=[this];const o=ur(t),i=[];for(let c=0,d=o.length;c<d;c++){const p=o[c],m=c===d-1,f=[];for(let x=0,g=s.length;x<g;x++){const b=s[x],v=u(b,F)[p];v&&(E(v,O,u(b,O)),m?(u(v,F)["*"]&&a.push(...A(this,re,ve).call(this,u(v,F)["*"],e,u(b,O))),a.push(...A(this,re,ve).call(this,v,e,u(b,O)))):f.push(v));for(let T=0,N=u(b,Ne).length;T<N;T++){const C=u(b,Ne)[T],_=u(b,O)===Ve?{}:{...u(b,O)};if(C==="*"){const oe=u(b,F)["*"];oe&&(a.push(...A(this,re,ve).call(this,oe,e,u(b,O))),E(oe,O,_),f.push(oe));continue}const[L,Se,ge]=C;if(!p&&!(ge instanceof RegExp))continue;const Y=u(b,F)[L],bs=o.slice(c).join("/");if(ge instanceof RegExp){const oe=ge.exec(bs);if(oe){if(_[Se]=oe[0],a.push(...A(this,re,ve).call(this,Y,e,u(b,O),_)),Object.keys(u(Y,F)).length){E(Y,O,_);const Ut=((l=oe[0].match(/\//))==null?void 0:l.length)??0;(i[Ut]||(i[Ut]=[])).push(Y)}continue}}(ge===!0||ge.test(p))&&(_[Se]=p,m?(a.push(...A(this,re,ve).call(this,Y,e,_,u(b,O))),u(Y,F)["*"]&&a.push(...A(this,re,ve).call(this,u(Y,F)["*"],e,_,u(b,O)))):(E(Y,O,_),f.push(Y)))}}s=f.concat(i.shift()??[])}return a.length>1&&a.sort((c,d)=>c.score-d.score),[a.map(({handler:c,params:d})=>[c,d])]}},fe=new WeakMap,F=new WeakMap,Ne=new WeakMap,Ge=new WeakMap,O=new WeakMap,re=new WeakSet,ve=function(e,t,a,r){const s=[];for(let o=0,i=u(e,fe).length;o<i;o++){const l=u(e,fe)[o],c=l[t]||l[D],d={};if(c!==void 0&&(c.params=Object.create(null),s.push(c),a!==Ve||r&&r!==Ve))for(let p=0,m=c.possibleKeys.length;p<m;p++){const f=c.possibleKeys[p],x=d[c.score];c.params[f]=r!=null&&r[f]&&!x?r[f]:a[f]??(r==null?void 0:r[f]),d[c.score]=!0}}return s},Qa),_e,er,po=(er=class{constructor(){h(this,"name","TrieRouter");w(this,_e);E(this,_e,new Sr)}add(e,t,a){const r=fr(t);if(r){for(let s=0,o=r.length;s<o;s++)u(this,_e).insert(e,r[s],a);return}u(this,_e).insert(e,t,a)}match(e,t){return u(this,_e).search(e,t)}},_e=new WeakMap,er),Rr=class extends wr{constructor(e={}){super(e),this.router=e.router??new co({routers:[new lo,new po]})}},uo=e=>{const a={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(o=>typeof o=="string"?o==="*"?()=>o:i=>o===i?i:null:typeof o=="function"?o:i=>o.includes(i)?i:null)(a.origin),s=(o=>typeof o=="function"?o:Array.isArray(o)?()=>o:()=>[])(a.allowMethods);return async function(i,l){var p;function c(m,f){i.res.headers.set(m,f)}const d=await r(i.req.header("origin")||"",i);if(d&&c("Access-Control-Allow-Origin",d),a.origin!=="*"){const m=i.req.header("Vary");m?c("Vary",m):c("Vary","Origin")}if(a.credentials&&c("Access-Control-Allow-Credentials","true"),(p=a.exposeHeaders)!=null&&p.length&&c("Access-Control-Expose-Headers",a.exposeHeaders.join(",")),i.req.method==="OPTIONS"){a.maxAge!=null&&c("Access-Control-Max-Age",a.maxAge.toString());const m=await s(i.req.header("origin")||"",i);m.length&&c("Access-Control-Allow-Methods",m.join(","));let f=a.allowHeaders;if(!(f!=null&&f.length)){const x=i.req.header("Access-Control-Request-Headers");x&&(f=x.split(/\s*,\s*/))}return f!=null&&f.length&&(c("Access-Control-Allow-Headers",f.join(",")),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await l()}};function mo(){const{process:e,Deno:t}=globalThis;return!(typeof(t==null?void 0:t.noColor)=="boolean"?t.noColor:e!==void 0?"NO_COLOR"in(e==null?void 0:e.env):!1)}async function fo(){const{navigator:e}=globalThis,t="cloudflare:workers";return!(e!==void 0&&e.userAgent==="Cloudflare-Workers"?await(async()=>{try{return"NO_COLOR"in((await import(t)).env??{})}catch{return!1}})():!mo())}var xo=e=>{const[t,a]=[",","."];return e.map(s=>s.replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+t)).join(a)},bo=e=>{const t=Date.now()-e;return xo([t<1e3?t+"ms":Math.round(t/1e3)+"s"])},go=async e=>{if(await fo())switch(e/100|0){case 5:return`\x1B[31m${e}\x1B[0m`;case 4:return`\x1B[33m${e}\x1B[0m`;case 3:return`\x1B[36m${e}\x1B[0m`;case 2:return`\x1B[32m${e}\x1B[0m`}return`${e}`};async function Ca(e,t,a,r,s=0,o){const i=t==="<--"?`${t} ${a} ${r}`:`${t} ${a} ${r} ${await go(s)} ${o}`;e(i)}var ho=(e=console.log)=>async function(a,r){const{method:s,url:o}=a.req,i=o.slice(o.indexOf("/",8));await Ca(e,"<--",s,i);const l=Date.now();await r(),await Ca(e,"-->",s,i,a.res.status,bo(l))},yo=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Sa=(e,t=Eo)=>{const a=/\.([a-zA-Z0-9]+?)$/,r=e.match(a);if(!r)return;let s=t[r[1]];return s&&s.startsWith("text")&&(s+="; charset=utf-8"),s},vo={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},Eo=vo,wo=(...e)=>{let t=e.filter(s=>s!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const a=t.split("/"),r=[];for(const s of a)s===".."&&r.length>0&&r.at(-1)!==".."?r.pop():s!=="."&&r.push(s);return r.join("/")||"."},Ir={br:".br",zstd:".zst",gzip:".gz"},To=Object.keys(Ir),No="index.html",_o=e=>{const t=e.root??"./",a=e.path,r=e.join??wo;return async(s,o)=>{var p,m,f,x;if(s.finalized)return o();let i;if(e.path)i=e.path;else try{if(i=decodeURIComponent(s.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(i))throw new Error}catch{return await((p=e.onNotFound)==null?void 0:p.call(e,s.req.path,s)),o()}let l=r(t,!a&&e.rewriteRequestPath?e.rewriteRequestPath(i):i);e.isDir&&await e.isDir(l)&&(l=r(l,No));const c=e.getContent;let d=await c(l,s);if(d instanceof Response)return s.newResponse(d.body,d);if(d){const g=e.mimes&&Sa(l,e.mimes)||Sa(l);if(s.header("Content-Type",g||"application/octet-stream"),e.precompressed&&(!g||yo.test(g))){const b=new Set((m=s.req.header("Accept-Encoding"))==null?void 0:m.split(",").map(v=>v.trim()));for(const v of To){if(!b.has(v))continue;const T=await c(l+Ir[v],s);if(T){d=T,s.header("Content-Encoding",v),s.header("Vary","Accept-Encoding",{append:!0});break}}}return await((f=e.onFound)==null?void 0:f.call(e,l,s)),s.body(d)}await((x=e.onNotFound)==null?void 0:x.call(e,l,s)),await o()}},Ao=async(e,t)=>{let a;t&&t.manifest?typeof t.manifest=="string"?a=JSON.parse(t.manifest):a=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?a=JSON.parse(__STATIC_CONTENT_MANIFEST):a=__STATIC_CONTENT_MANIFEST;let r;t&&t.namespace?r=t.namespace:r=__STATIC_CONTENT;const s=a[e]||e;if(!s)return null;const o=await r.get(s,{type:"stream"});return o||null},Co=e=>async function(a,r){return _o({...e,getContent:async o=>Ao(o,{manifest:e.manifest,namespace:e.namespace?e.namespace:a.env?a.env.__STATIC_CONTENT:void 0})})(a,r)},So=e=>Co(e),at="_hp",Ro={Change:"Input",DoubleClick:"DblClick"},Io={svg:"2000/svg",math:"1998/Math/MathML"},rt=[],Qt=new WeakMap,We=void 0,Do=()=>We,Q=e=>"t"in e,$t={onClick:["click",!1]},Ra=e=>{if(!e.startsWith("on"))return;if($t[e])return $t[e];const t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){const[,a,r]=t;return $t[e]=[(Ro[a]||a).toLowerCase(),!!r]}},Ia=(e,t)=>We&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,Mo=(e,t,a)=>{var r;t||(t={});for(let s in t){const o=t[s];if(s!=="children"&&(!a||a[s]!==o)){s=It(s);const i=Ra(s);if(i){if((a==null?void 0:a[s])!==o&&(a&&e.removeEventListener(i[0],a[s],i[1]),o!=null)){if(typeof o!="function")throw new Error(`Event handler for "${s}" is not a function`);e.addEventListener(i[0],o,i[1])}}else if(s==="dangerouslySetInnerHTML"&&o)e.innerHTML=o.__html;else if(s==="ref"){let l;typeof o=="function"?l=o(e)||(()=>o(null)):o&&"current"in o&&(o.current=e,l=()=>o.current=null),Qt.set(e,l)}else if(s==="style"){const l=e.style;typeof o=="string"?l.cssText=o:(l.cssText="",o!=null&&dr(o,l.setProperty.bind(l)))}else{if(s==="value"){const c=e.nodeName;if(c==="INPUT"||c==="TEXTAREA"||c==="SELECT"){if(e.value=o==null||o===!1?null:o,c==="TEXTAREA"){e.textContent=o;continue}else if(c==="SELECT"){e.selectedIndex===-1&&(e.selectedIndex=0);continue}}}else(s==="checked"&&e.nodeName==="INPUT"||s==="selected"&&e.nodeName==="OPTION")&&(e[s]=o);const l=Ia(e,s);o==null||o===!1?e.removeAttribute(l):o===!0?e.setAttribute(l,""):typeof o=="string"||typeof o=="number"?e.setAttribute(l,o):e.setAttribute(l,o.toString())}}}if(a)for(let s in a){const o=a[s];if(s!=="children"&&!(s in t)){s=It(s);const i=Ra(s);i?e.removeEventListener(i[0],o,i[1]):s==="ref"?(r=Qt.get(e))==null||r():e.removeAttribute(Ia(e,s))}}},Oo=(e,t)=>{t[I][0]=0,rt.push([e,t]);const a=t.tag[na]||t.tag,r=a.defaultProps?{...a.defaultProps,...t.props}:t.props;try{return[a.call(null,r)]}finally{rt.pop()}},Dr=(e,t,a,r,s)=>{var o,i;(o=e.vR)!=null&&o.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&((i=e[I][1][Fr])==null||i.forEach(l=>s.push(l))),e.vC.forEach(l=>{var c;if(Q(l))a.push(l);else if(typeof l.tag=="function"||l.tag===""){l.c=t;const d=a.length;if(Dr(l,t,a,r,s),l.s){for(let p=d;p<a.length;p++)a[p].s=!0;l.s=!1}}else a.push(l),(c=l.vR)!=null&&c.length&&(r.push(...l.vR),delete l.vR)})},Lo=e=>{for(;;e=e.tag===at||!e.vC||!e.pP?e.nN:e.vC[0]){if(!e)return null;if(e.tag!==at&&e.e)return e.e}},Mr=e=>{var t,a,r,s,o,i;Q(e)||((a=(t=e[I])==null?void 0:t[1][Fr])==null||a.forEach(l=>{var c;return(c=l[2])==null?void 0:c.call(l)}),(r=Qt.get(e.e))==null||r(),e.p===2&&((s=e.vC)==null||s.forEach(l=>l.p=2)),(o=e.vC)==null||o.forEach(Mr)),e.p||((i=e.e)==null||i.remove(),delete e.e),typeof e.tag=="function"&&(Je.delete(e),At.delete(e),delete e[I][3],e.a=!0)},Or=(e,t,a)=>{e.c=t,Lr(e,t,a)},Da=(e,t)=>{if(t){for(let a=0,r=e.length;a<r;a++)if(e[a]===t)return a}},Ma=Symbol(),Lr=(e,t,a)=>{var d;const r=[],s=[],o=[];Dr(e,t,r,s,o),s.forEach(Mr);const i=a?void 0:t.childNodes;let l,c=null;if(a)l=-1;else if(!i.length)l=0;else{const p=Da(i,Lo(e.nN));p!==void 0?(c=i[p],l=p):l=Da(i,(d=r.find(m=>m.tag!==at&&m.e))==null?void 0:d.e)??-1,l===-1&&(a=!0)}for(let p=0,m=r.length;p<m;p++,l++){const f=r[p];let x;if(f.s&&f.e)x=f.e,f.s=!1;else{const g=a||!f.e;Q(f)?(f.e&&f.d&&(f.e.textContent=f.t),f.d=!1,x=f.e||(f.e=document.createTextNode(f.t))):(x=f.e||(f.e=f.n?document.createElementNS(f.n,f.tag):document.createElement(f.tag)),Mo(x,f.props,f.pP),Lr(f,x,g))}f.tag===at?l--:a?x.parentNode||t.appendChild(x):i[l]!==x&&i[l-1]!==x&&(i[l+1]===x?t.appendChild(i[l]):t.insertBefore(x,c||i[l]||null))}if(e.pP&&delete e.pP,o.length){const p=[],m=[];o.forEach(([,f,,x,g])=>{f&&p.push(f),x&&m.push(x),g==null||g()}),p.forEach(f=>f()),m.length&&requestAnimationFrame(()=>{m.forEach(f=>f())})}},Fo=(e,t)=>!!(e&&e.length===t.length&&e.every((a,r)=>a[1]===t[r][1])),At=new WeakMap,ea=(e,t,a)=>{var o,i,l,c,d,p;const r=!a&&t.pC;a&&(t.pC||(t.pC=t.vC));let s;try{a||(a=typeof t.tag=="function"?Oo(e,t):ft(t.props.children)),((o=a[0])==null?void 0:o.tag)===""&&a[0][Vt]&&(s=a[0][Vt],e[5].push([e,s,t]));const m=r?[...t.pC]:t.vC?[...t.vC]:void 0,f=[];let x;for(let g=0;g<a.length;g++){Array.isArray(a[g])&&a.splice(g,1,...a[g].flat());let b=Uo(a[g]);if(b){typeof b.tag=="function"&&!b.tag[or]&&(ze.length>0&&(b[I][2]=ze.map(T=>[T,T.values.at(-1)])),(i=e[5])!=null&&i.length&&(b[I][3]=e[5].at(-1)));let v;if(m&&m.length){const T=m.findIndex(Q(b)?N=>Q(N):b.key!==void 0?N=>N.key===b.key&&N.tag===b.tag:N=>N.tag===b.tag);T!==-1&&(v=m[T],m.splice(T,1))}if(v)if(Q(b))v.t!==b.t&&(v.t=b.t,v.d=!0),b=v;else{const T=v.pP=v.props;if(v.props=b.props,v.f||(v.f=b.f||t.f),typeof b.tag=="function"){const N=v[I][2];v[I][2]=b[I][2]||[],v[I][3]=b[I][3],!v.f&&((v.o||v)===b.o||(c=(l=v.tag)[ws])!=null&&c.call(l,T,v.props))&&Fo(N,v[I][2])&&(v.s=!0)}b=v}else if(!Q(b)&&We){const T=qe(We);T&&(b.n=T)}if(!Q(b)&&!b.s&&(ea(e,b),delete b.f),f.push(b),x&&!x.s&&!b.s)for(let T=x;T&&!Q(T);T=(d=T.vC)==null?void 0:d.at(-1))T.nN=b;x=b}}t.vR=r?[...t.vC,...m||[]]:m||[],t.vC=f,r&&delete t.pC}catch(m){if(t.f=!0,m===Ma){if(s)return;throw m}const[f,x,g]=((p=t[I])==null?void 0:p[3])||[];if(x){const b=()=>Ct([0,!1,e[2]],g),v=At.get(g)||[];v.push(b),At.set(g,v);const T=x(m,()=>{const N=At.get(g);if(N){const C=N.indexOf(b);if(C!==-1)return N.splice(C,1),b()}});if(T){if(e[0]===1)e[1]=!0;else if(ea(e,g,[T]),(x.length===1||e!==f)&&g.c){Or(g,g.c,!1);return}throw Ma}}throw m}finally{s&&e[5].pop()}},Uo=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[I]=[0,[]];else{const t=Io[e.tag];t&&(We||(We=ir("")),e.props.children=[{tag:We,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Oa=(e,t)=>{var a,r;(a=t[I][2])==null||a.forEach(([s,o])=>{s.values.push(o)});try{ea(e,t,void 0)}catch{return}if(t.a){delete t.a;return}(r=t[I][2])==null||r.forEach(([s])=>{s.values.pop()}),(e[0]!==1||!e[1])&&Or(t,t.c,!1)},Je=new WeakMap,La=[],Ct=async(e,t)=>{e[5]||(e[5]=[]);const a=Je.get(t);a&&a[0](void 0);let r;const s=new Promise(o=>r=o);if(Je.set(t,[r,()=>{e[2]?e[2](e,t,o=>{Oa(o,t)}).then(()=>r(t)):(Oa(e,t),r(t))}]),La.length)La.at(-1).add(t);else{await Promise.resolve();const o=Je.get(t);o&&(Je.delete(t),o[1]())}return s},ko=(e,t,a)=>({tag:at,props:{children:e},key:a,e:t,p:1}),Gt=0,Fr=1,Xt=2,zt=3,Wt=new WeakMap,Ur=(e,t)=>!e||!t||e.length!==t.length||t.some((a,r)=>a!==e[r]),Po=void 0,Fa=[],jo=e=>{var i;const t=()=>typeof e=="function"?e():e,a=rt.at(-1);if(!a)return[t(),()=>{}];const[,r]=a,s=(i=r[I][1])[Gt]||(i[Gt]=[]),o=r[I][0]++;return s[o]||(s[o]=[t(),l=>{const c=Po,d=s[o];if(typeof l=="function"&&(l=l(d[0])),!Object.is(l,d[0]))if(d[0]=l,Fa.length){const[p,m]=Fa.at(-1);Promise.all([p===3?r:Ct([p,!1,c],r),m]).then(([f])=>{if(!f||!(p===2||p===3))return;const x=f.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===f.vC&&Ct([p===3?1:0,!1,c],f)})})})}else Ct([0,!1,c],r)}])},pa=(e,t)=>{var l;const a=rt.at(-1);if(!a)return e;const[,r]=a,s=(l=r[I][1])[Xt]||(l[Xt]=[]),o=r[I][0]++,i=s[o];return Ur(i==null?void 0:i[1],t)?s[o]=[e,t]:e=s[o][0],e},Bo=e=>{const t=Wt.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(a=>Wt.set(e,[a]),a=>Wt.set(e,[void 0,a])),e},Ho=(e,t)=>{var l;const a=rt.at(-1);if(!a)return e();const[,r]=a,s=(l=r[I][1])[zt]||(l[zt]=[]),o=r[I][0]++,i=s[o];return Ur(i==null?void 0:i[1],t)&&(s[o]=[e(),t]),s[o][0]},$o=ir({pending:!1,data:null,method:null,action:null}),Ua=new Set,Go=e=>{Ua.add(e),e.finally(()=>Ua.delete(e))},ua=(e,t)=>Ho(()=>a=>{let r;e&&(typeof e=="function"?r=e(a)||(()=>{e(null)}):e&&"current"in e&&(e.current=a,r=()=>{e.current=null}));const s=t(a);return()=>{s==null||s(),r==null||r()}},[e]),Ie=Object.create(null),yt=Object.create(null),gt=(e,t,a,r,s)=>{if(t!=null&&t.itemProp)return{tag:e,props:t,type:e,ref:t.ref};const o=document.head;let{onLoad:i,onError:l,precedence:c,blocking:d,...p}=t,m=null,f=!1;const x=vt[e];let g;if(x.length>0){const N=o.querySelectorAll(e);e:for(const C of N)for(const _ of vt[e])if(C.getAttribute(_)===t[_]){m=C;break e}if(!m){const C=x.reduce((_,L)=>t[L]===void 0?_:`${_}-${L}-${t[L]}`,e);f=!yt[C],m=yt[C]||(yt[C]=(()=>{const _=document.createElement(e);for(const L of x)t[L]!==void 0&&_.setAttribute(L,t[L]),t.rel&&_.setAttribute("rel",t.rel);return _})())}}else g=o.querySelectorAll(e);c=r?c??"":void 0,r&&(p[Et]=c);const b=pa(N=>{if(x.length>0){let C=!1;for(const _ of o.querySelectorAll(e)){if(C&&_.getAttribute(Et)!==c){o.insertBefore(N,_);return}_.getAttribute(Et)===c&&(C=!0)}o.appendChild(N)}else if(g){let C=!1;for(const _ of g)if(_===N){C=!0;break}C||o.insertBefore(N,o.contains(g[0])?g[0]:o.querySelector(e)),g=void 0}},[c]),v=ua(t.ref,N=>{var L;const C=x[0];if(a===2&&(N.innerHTML=""),(f||g)&&b(N),!l&&!i)return;let _=Ie[L=N.getAttribute(C)]||(Ie[L]=new Promise((Se,ge)=>{N.addEventListener("load",Se),N.addEventListener("error",ge)}));i&&(_=_.then(i)),l&&(_=_.catch(l)),_.catch(()=>{})});if(s&&d==="render"){const N=vt[e][0];if(t[N]){const C=t[N],_=Ie[C]||(Ie[C]=new Promise((L,Se)=>{b(m),m.addEventListener("load",L),m.addEventListener("error",Se)}));Bo(_)}}const T={tag:e,type:e,props:{...p,ref:v},ref:v};return T.p=a,m&&(T.e=m),ko(T,o)},Xo=e=>{const t=Do(),a=t&&qe(t);return a!=null&&a.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:gt("title",e,void 0,!1,!1)},zo=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:gt("script",e,1,!1,!0),Wo=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,gt("style",e,2,!0,!0)),Ko=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:gt("link",e,1,"precedence"in e,!0),qo=e=>gt("meta",e,void 0,!1,!1),kr=Symbol(),Vo=e=>{const{action:t,...a}=e;typeof t!="function"&&(a.action=t);const[r,s]=jo([null,!1]),o=pa(async d=>{const p=d.isTrusted?t:d.detail[kr];if(typeof p!="function")return;d.preventDefault();const m=new FormData(d.target);s([m,!0]);const f=p(m);f instanceof Promise&&(Go(f),await f),s([null,!0])},[]),i=ua(e.ref,d=>(d.addEventListener("submit",o),()=>{d.removeEventListener("submit",o)})),[l,c]=r;return r[1]=!1,{tag:$o,props:{value:{pending:l!==null,data:l,method:l?"post":null,action:l?t:null},children:{tag:"form",props:{...a,ref:i},type:"form",ref:i}},f:c}},Pr=(e,{formAction:t,...a})=>{if(typeof t=="function"){const r=pa(s=>{s.preventDefault(),s.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[kr]:t}}))},[]);a.ref=ua(a.ref,s=>(s.addEventListener("click",r),()=>{s.removeEventListener("click",r)}))}return{tag:e,props:a,type:e,ref:a.ref}},Jo=e=>Pr("input",e),Yo=e=>Pr("button",e);Object.assign(Jt,{title:Xo,script:zo,style:Wo,link:Ko,meta:qo,form:Vo,input:Jo,button:Yo});ia(null);new TextEncoder;var Zo=ia(null),Qo=(e,t,a,r)=>(s,o)=>{const i="<!DOCTYPE html>",l=a?wa(d=>a(d,e),{Layout:t,...o},s):s,c=Es`${B(i)}${wa(Zo.Provider,{value:e},l)}`;return e.html(c)},en=(e,t)=>function(r,s){const o=r.getLayout()??Fs;return e&&r.setLayout(i=>e({...i,Layout:o},r)),r.setRenderer(Qo(r,o,e)),s()};const tn=en(({children:e})=>n("html",{lang:"es",children:[n("head",{children:[n("meta",{charset:"UTF-8"}),n("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"}),n("title",{children:"Lyra Expenses - Sistema de Gastos y Viáticos"}),n("script",{src:"https://cdn.tailwindcss.com"}),n("link",{href:"https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",rel:"stylesheet"}),n("link",{href:"/static/styles.css",rel:"stylesheet"}),n("script",{src:"https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"}),n("script",{src:"https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"}),n("script",{src:"https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"}),n("meta",{name:"description",content:"Sistema ejecutivo de gestión de gastos y viáticos multiempresa con soporte multimoneda. Basado en el modelo 4-D: Dinero, Decisión, Dirección, Disciplina."}),n("meta",{name:"author",content:"Lyra - Asistente Estratégico"}),n("link",{rel:"icon",type:"image/x-icon",href:"data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAA"})]}),n("body",{className:"bg-primary",children:e})]})),J=new TextEncoder,Ae=new TextDecoder;function jr(...e){const t=e.reduce((s,{length:o})=>s+o,0),a=new Uint8Array(t);let r=0;for(const s of e)a.set(s,r),r+=s.length;return a}function an(e){if(Uint8Array.prototype.toBase64)return e.toBase64();const t=32768,a=[];for(let r=0;r<e.length;r+=t)a.push(String.fromCharCode.apply(null,e.subarray(r,r+t)));return btoa(a.join(""))}function rn(e){if(Uint8Array.fromBase64)return Uint8Array.fromBase64(e);const t=atob(e),a=new Uint8Array(t.length);for(let r=0;r<t.length;r++)a[r]=t.charCodeAt(r);return a}function St(e){if(Uint8Array.fromBase64)return Uint8Array.fromBase64(typeof e=="string"?e:Ae.decode(e),{alphabet:"base64url"});let t=e;t instanceof Uint8Array&&(t=Ae.decode(t)),t=t.replace(/-/g,"+").replace(/_/g,"/").replace(/\s/g,"");try{return rn(t)}catch{throw new TypeError("The input to be decoded is not correctly encoded.")}}function Kt(e){let t=e;return typeof t=="string"&&(t=J.encode(t)),Uint8Array.prototype.toBase64?t.toBase64({alphabet:"base64url",omitPadding:!0}):an(t).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}class Ce extends Error{constructor(a,r){var s;super(a,r);h(this,"code","ERR_JOSE_GENERIC");this.name=this.constructor.name,(s=Error.captureStackTrace)==null||s.call(Error,this,this.constructor)}}h(Ce,"code","ERR_JOSE_GENERIC");class H extends Ce{constructor(a,r,s="unspecified",o="unspecified"){super(a,{cause:{claim:s,reason:o,payload:r}});h(this,"code","ERR_JWT_CLAIM_VALIDATION_FAILED");h(this,"claim");h(this,"reason");h(this,"payload");this.claim=s,this.reason=o,this.payload=r}}h(H,"code","ERR_JWT_CLAIM_VALIDATION_FAILED");class ta extends Ce{constructor(a,r,s="unspecified",o="unspecified"){super(a,{cause:{claim:s,reason:o,payload:r}});h(this,"code","ERR_JWT_EXPIRED");h(this,"claim");h(this,"reason");h(this,"payload");this.claim=s,this.reason=o,this.payload=r}}h(ta,"code","ERR_JWT_EXPIRED");class le extends Ce{constructor(){super(...arguments);h(this,"code","ERR_JOSE_NOT_SUPPORTED")}}h(le,"code","ERR_JOSE_NOT_SUPPORTED");class S extends Ce{constructor(){super(...arguments);h(this,"code","ERR_JWS_INVALID")}}h(S,"code","ERR_JWS_INVALID");class Lt extends Ce{constructor(){super(...arguments);h(this,"code","ERR_JWT_INVALID")}}h(Lt,"code","ERR_JWT_INVALID");class Br extends Ce{constructor(a="signature verification failed",r){super(a,r);h(this,"code","ERR_JWS_SIGNATURE_VERIFICATION_FAILED")}}h(Br,"code","ERR_JWS_SIGNATURE_VERIFICATION_FAILED");function q(e,t="algorithm.name"){return new TypeError(`CryptoKey does not support this operation, its ${t} must be ${e}`)}function De(e,t){return e.name===t}function qt(e){return parseInt(e.name.slice(4),10)}function sn(e){switch(e){case"ES256":return"P-256";case"ES384":return"P-384";case"ES512":return"P-521";default:throw new Error("unreachable")}}function on(e,t){if(t&&!e.usages.includes(t))throw new TypeError(`CryptoKey does not support this operation, its usages must include ${t}.`)}function nn(e,t,a){switch(t){case"HS256":case"HS384":case"HS512":{if(!De(e.algorithm,"HMAC"))throw q("HMAC");const r=parseInt(t.slice(2),10);if(qt(e.algorithm.hash)!==r)throw q(`SHA-${r}`,"algorithm.hash");break}case"RS256":case"RS384":case"RS512":{if(!De(e.algorithm,"RSASSA-PKCS1-v1_5"))throw q("RSASSA-PKCS1-v1_5");const r=parseInt(t.slice(2),10);if(qt(e.algorithm.hash)!==r)throw q(`SHA-${r}`,"algorithm.hash");break}case"PS256":case"PS384":case"PS512":{if(!De(e.algorithm,"RSA-PSS"))throw q("RSA-PSS");const r=parseInt(t.slice(2),10);if(qt(e.algorithm.hash)!==r)throw q(`SHA-${r}`,"algorithm.hash");break}case"Ed25519":case"EdDSA":{if(!De(e.algorithm,"Ed25519"))throw q("Ed25519");break}case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":{if(!De(e.algorithm,t))throw q(t);break}case"ES256":case"ES384":case"ES512":{if(!De(e.algorithm,"ECDSA"))throw q("ECDSA");const r=sn(t);if(e.algorithm.namedCurve!==r)throw q(r,"algorithm.namedCurve");break}default:throw new TypeError("CryptoKey does not support this operation")}on(e,a)}function Hr(e,t,...a){var r;if(a=a.filter(Boolean),a.length>2){const s=a.pop();e+=`one of type ${a.join(", ")}, or ${s}.`}else a.length===2?e+=`one of type ${a[0]} or ${a[1]}.`:e+=`of type ${a[0]}.`;return t==null?e+=` Received ${t}`:typeof t=="function"&&t.name?e+=` Received function ${t.name}`:typeof t=="object"&&t!=null&&(r=t.constructor)!=null&&r.name&&(e+=` Received an instance of ${t.constructor.name}`),e}const ln=(e,...t)=>Hr("Key must be ",e,...t);function $r(e,t,...a){return Hr(`Key for the ${e} algorithm must be `,t,...a)}function Gr(e){return(e==null?void 0:e[Symbol.toStringTag])==="CryptoKey"}function Xr(e){return(e==null?void 0:e[Symbol.toStringTag])==="KeyObject"}const zr=e=>Gr(e)||Xr(e),Wr=(...e)=>{const t=e.filter(Boolean);if(t.length===0||t.length===1)return!0;let a;for(const r of t){const s=Object.keys(r);if(!a||a.size===0){a=new Set(s);continue}for(const o of s){if(a.has(o))return!1;a.add(o)}}return!0};function cn(e){return typeof e=="object"&&e!==null}const st=e=>{if(!cn(e)||Object.prototype.toString.call(e)!=="[object Object]")return!1;if(Object.getPrototypeOf(e)===null)return!0;let t=e;for(;Object.getPrototypeOf(t)!==null;)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t},Kr=(e,t)=>{if(e.startsWith("RS")||e.startsWith("PS")){const{modulusLength:a}=t.algorithm;if(typeof a!="number"||a<2048)throw new TypeError(`${e} requires key modulusLength to be 2048 bits or larger`)}};function dn(e){let t,a;switch(e.kty){case"AKP":{switch(e.alg){case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":t={name:e.alg},a=e.priv?["sign"]:["verify"];break;default:throw new le('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"RSA":{switch(e.alg){case"PS256":case"PS384":case"PS512":t={name:"RSA-PSS",hash:`SHA-${e.alg.slice(-3)}`},a=e.d?["sign"]:["verify"];break;case"RS256":case"RS384":case"RS512":t={name:"RSASSA-PKCS1-v1_5",hash:`SHA-${e.alg.slice(-3)}`},a=e.d?["sign"]:["verify"];break;case"RSA-OAEP":case"RSA-OAEP-256":case"RSA-OAEP-384":case"RSA-OAEP-512":t={name:"RSA-OAEP",hash:`SHA-${parseInt(e.alg.slice(-3),10)||1}`},a=e.d?["decrypt","unwrapKey"]:["encrypt","wrapKey"];break;default:throw new le('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"EC":{switch(e.alg){case"ES256":t={name:"ECDSA",namedCurve:"P-256"},a=e.d?["sign"]:["verify"];break;case"ES384":t={name:"ECDSA",namedCurve:"P-384"},a=e.d?["sign"]:["verify"];break;case"ES512":t={name:"ECDSA",namedCurve:"P-521"},a=e.d?["sign"]:["verify"];break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":t={name:"ECDH",namedCurve:e.crv},a=e.d?["deriveBits"]:[];break;default:throw new le('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"OKP":{switch(e.alg){case"Ed25519":case"EdDSA":t={name:"Ed25519"},a=e.d?["sign"]:["verify"];break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":t={name:e.crv},a=e.d?["deriveBits"]:[];break;default:throw new le('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}default:throw new le('Invalid or unsupported JWK "kty" (Key Type) Parameter value')}return{algorithm:t,keyUsages:a}}const pn=async e=>{if(!e.alg)throw new TypeError('"alg" argument is required when "jwk.alg" is not present');const{algorithm:t,keyUsages:a}=dn(e),r={...e};return r.kty!=="AKP"&&delete r.alg,delete r.use,crypto.subtle.importKey("jwk",r,t,e.ext??!(e.d||e.priv),e.key_ops??a)},qr=(e,t,a,r,s)=>{if(s.crit!==void 0&&(r==null?void 0:r.crit)===void 0)throw new e('"crit" (Critical) Header Parameter MUST be integrity protected');if(!r||r.crit===void 0)return new Set;if(!Array.isArray(r.crit)||r.crit.length===0||r.crit.some(i=>typeof i!="string"||i.length===0))throw new e('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');let o;a!==void 0?o=new Map([...Object.entries(a),...t.entries()]):o=t;for(const i of r.crit){if(!o.has(i))throw new le(`Extension Header Parameter "${i}" is not recognized`);if(s[i]===void 0)throw new e(`Extension Header Parameter "${i}" is missing`);if(o.get(i)&&r[i]===void 0)throw new e(`Extension Header Parameter "${i}" MUST be integrity protected`)}return new Set(r.crit)};function ma(e){return st(e)&&typeof e.kty=="string"}function un(e){return e.kty!=="oct"&&(e.kty==="AKP"&&typeof e.priv=="string"||typeof e.d=="string")}function mn(e){return e.kty!=="oct"&&typeof e.d>"u"&&typeof e.priv>"u"}function fn(e){return e.kty==="oct"&&typeof e.k=="string"}let Pe;const ka=async(e,t,a,r=!1)=>{Pe||(Pe=new WeakMap);let s=Pe.get(e);if(s!=null&&s[a])return s[a];const o=await pn({...t,alg:a});return r&&Object.freeze(e),s?s[a]=o:Pe.set(e,{[a]:o}),o},xn=(e,t)=>{var i;Pe||(Pe=new WeakMap);let a=Pe.get(e);if(a!=null&&a[t])return a[t];const r=e.type==="public",s=!!r;let o;if(e.asymmetricKeyType==="x25519"){switch(t){case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":break;default:throw new TypeError("given KeyObject instance cannot be used for this algorithm")}o=e.toCryptoKey(e.asymmetricKeyType,s,r?[]:["deriveBits"])}if(e.asymmetricKeyType==="ed25519"){if(t!=="EdDSA"&&t!=="Ed25519")throw new TypeError("given KeyObject instance cannot be used for this algorithm");o=e.toCryptoKey(e.asymmetricKeyType,s,[r?"verify":"sign"])}switch(e.asymmetricKeyType){case"ml-dsa-44":case"ml-dsa-65":case"ml-dsa-87":{if(t!==e.asymmetricKeyType.toUpperCase())throw new TypeError("given KeyObject instance cannot be used for this algorithm");o=e.toCryptoKey(e.asymmetricKeyType,s,[r?"verify":"sign"])}}if(e.asymmetricKeyType==="rsa"){let l;switch(t){case"RSA-OAEP":l="SHA-1";break;case"RS256":case"PS256":case"RSA-OAEP-256":l="SHA-256";break;case"RS384":case"PS384":case"RSA-OAEP-384":l="SHA-384";break;case"RS512":case"PS512":case"RSA-OAEP-512":l="SHA-512";break;default:throw new TypeError("given KeyObject instance cannot be used for this algorithm")}if(t.startsWith("RSA-OAEP"))return e.toCryptoKey({name:"RSA-OAEP",hash:l},s,r?["encrypt"]:["decrypt"]);o=e.toCryptoKey({name:t.startsWith("PS")?"RSA-PSS":"RSASSA-PKCS1-v1_5",hash:l},s,[r?"verify":"sign"])}if(e.asymmetricKeyType==="ec"){const c=new Map([["prime256v1","P-256"],["secp384r1","P-384"],["secp521r1","P-521"]]).get((i=e.asymmetricKeyDetails)==null?void 0:i.namedCurve);if(!c)throw new TypeError("given KeyObject instance cannot be used for this algorithm");t==="ES256"&&c==="P-256"&&(o=e.toCryptoKey({name:"ECDSA",namedCurve:c},s,[r?"verify":"sign"])),t==="ES384"&&c==="P-384"&&(o=e.toCryptoKey({name:"ECDSA",namedCurve:c},s,[r?"verify":"sign"])),t==="ES512"&&c==="P-521"&&(o=e.toCryptoKey({name:"ECDSA",namedCurve:c},s,[r?"verify":"sign"])),t.startsWith("ECDH-ES")&&(o=e.toCryptoKey({name:"ECDH",namedCurve:c},s,r?[]:["deriveBits"]))}if(!o)throw new TypeError("given KeyObject instance cannot be used for this algorithm");return a?a[t]=o:Pe.set(e,{[t]:o}),o},Vr=async(e,t)=>{if(e instanceof Uint8Array||Gr(e))return e;if(Xr(e)){if(e.type==="secret")return e.export();if("toCryptoKey"in e&&typeof e.toCryptoKey=="function")try{return xn(e,t)}catch(r){if(r instanceof TypeError)throw r}let a=e.export({format:"jwk"});return ka(e,a,t)}if(ma(e))return e.k?St(e.k):ka(e,e,t,!0);throw new Error("unreachable")},Ue=e=>e==null?void 0:e[Symbol.toStringTag],aa=(e,t,a)=>{var r,s;if(t.use!==void 0){let o;switch(a){case"sign":case"verify":o="sig";break;case"encrypt":case"decrypt":o="enc";break}if(t.use!==o)throw new TypeError(`Invalid key for this operation, its "use" must be "${o}" when present`)}if(t.alg!==void 0&&t.alg!==e)throw new TypeError(`Invalid key for this operation, its "alg" must be "${e}" when present`);if(Array.isArray(t.key_ops)){let o;switch(!0){case(a==="sign"||a==="verify"):case e==="dir":case e.includes("CBC-HS"):o=a;break;case e.startsWith("PBES2"):o="deriveBits";break;case/^A\d{3}(?:GCM)?(?:KW)?$/.test(e):!e.includes("GCM")&&e.endsWith("KW")?o=a==="encrypt"?"wrapKey":"unwrapKey":o=a;break;case(a==="encrypt"&&e.startsWith("RSA")):o="wrapKey";break;case a==="decrypt":o=e.startsWith("RSA")?"unwrapKey":"deriveBits";break}if(o&&((s=(r=t.key_ops)==null?void 0:r.includes)==null?void 0:s.call(r,o))===!1)throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${o}" when present`)}return!0},bn=(e,t,a)=>{if(!(t instanceof Uint8Array)){if(ma(t)){if(fn(t)&&aa(e,t,a))return;throw new TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present')}if(!zr(t))throw new TypeError($r(e,t,"CryptoKey","KeyObject","JSON Web Key","Uint8Array"));if(t.type!=="secret")throw new TypeError(`${Ue(t)} instances for symmetric algorithms must be of type "secret"`)}},gn=(e,t,a)=>{if(ma(t))switch(a){case"decrypt":case"sign":if(un(t)&&aa(e,t,a))return;throw new TypeError("JSON Web Key for this operation be a private JWK");case"encrypt":case"verify":if(mn(t)&&aa(e,t,a))return;throw new TypeError("JSON Web Key for this operation be a public JWK")}if(!zr(t))throw new TypeError($r(e,t,"CryptoKey","KeyObject","JSON Web Key"));if(t.type==="secret")throw new TypeError(`${Ue(t)} instances for asymmetric algorithms must not be of type "secret"`);if(t.type==="public")switch(a){case"sign":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm signing must be of type "private"`);case"decrypt":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm decryption must be of type "private"`)}if(t.type==="private")switch(a){case"verify":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm verifying must be of type "public"`);case"encrypt":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm encryption must be of type "public"`)}},Jr=(e,t,a)=>{e.startsWith("HS")||e==="dir"||e.startsWith("PBES2")||/^A(?:128|192|256)(?:GCM)?(?:KW)?$/.test(e)||/^A(?:128|192|256)CBC-HS(?:256|384|512)$/.test(e)?bn(e,t,a):gn(e,t,a)},Yr=(e,t)=>{const a=`SHA-${e.slice(-3)}`;switch(e){case"HS256":case"HS384":case"HS512":return{hash:a,name:"HMAC"};case"PS256":case"PS384":case"PS512":return{hash:a,name:"RSA-PSS",saltLength:parseInt(e.slice(-3),10)>>3};case"RS256":case"RS384":case"RS512":return{hash:a,name:"RSASSA-PKCS1-v1_5"};case"ES256":case"ES384":case"ES512":return{hash:a,name:"ECDSA",namedCurve:t.namedCurve};case"Ed25519":case"EdDSA":return{name:"Ed25519"};case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":return{name:e};default:throw new le(`alg ${e} is not supported either by JOSE or your javascript runtime`)}},Zr=async(e,t,a)=>{if(t instanceof Uint8Array){if(!e.startsWith("HS"))throw new TypeError(ln(t,"CryptoKey","KeyObject","JSON Web Key"));return crypto.subtle.importKey("raw",t,{hash:`SHA-${e.slice(-3)}`,name:"HMAC"},!1,[a])}return nn(t,e,a),t},hn=async(e,t,a,r)=>{const s=await Zr(e,t,"verify");Kr(e,s);const o=Yr(e,s.algorithm);try{return await crypto.subtle.verify(o,s,a,r)}catch{return!1}};async function yn(e,t,a){if(!st(e))throw new S("Flattened JWS must be an object");if(e.protected===void 0&&e.header===void 0)throw new S('Flattened JWS must have either of the "protected" or "header" members');if(e.protected!==void 0&&typeof e.protected!="string")throw new S("JWS Protected Header incorrect type");if(e.payload===void 0)throw new S("JWS Payload missing");if(typeof e.signature!="string")throw new S("JWS Signature missing or incorrect type");if(e.header!==void 0&&!st(e.header))throw new S("JWS Unprotected Header incorrect type");let r={};if(e.protected)try{const b=St(e.protected);r=JSON.parse(Ae.decode(b))}catch{throw new S("JWS Protected Header is invalid")}if(!Wr(r,e.header))throw new S("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const s={...r,...e.header},o=qr(S,new Map([["b64",!0]]),a==null?void 0:a.crit,r,s);let i=!0;if(o.has("b64")&&(i=r.b64,typeof i!="boolean"))throw new S('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:l}=s;if(typeof l!="string"||!l)throw new S('JWS "alg" (Algorithm) Header Parameter missing or invalid');if(i){if(typeof e.payload!="string")throw new S("JWS Payload must be a string")}else if(typeof e.payload!="string"&&!(e.payload instanceof Uint8Array))throw new S("JWS Payload must be a string or an Uint8Array instance");let c=!1;typeof t=="function"&&(t=await t(r,e),c=!0),Jr(l,t,"verify");const d=jr(J.encode(e.protected??""),J.encode("."),typeof e.payload=="string"?J.encode(e.payload):e.payload);let p;try{p=St(e.signature)}catch{throw new S("Failed to base64url decode the signature")}const m=await Vr(t,l);if(!await hn(l,m,p,d))throw new Br;let x;if(i)try{x=St(e.payload)}catch{throw new S("Failed to base64url decode the payload")}else typeof e.payload=="string"?x=J.encode(e.payload):x=e.payload;const g={payload:x};return e.protected!==void 0&&(g.protectedHeader=r),e.header!==void 0&&(g.unprotectedHeader=e.header),c?{...g,key:m}:g}async function vn(e,t,a){if(e instanceof Uint8Array&&(e=Ae.decode(e)),typeof e!="string")throw new S("Compact JWS must be a string or Uint8Array");const{0:r,1:s,2:o,length:i}=e.split(".");if(i!==3)throw new S("Invalid Compact JWS");const l=await yn({payload:s,protected:r,signature:o},t,a),c={payload:l.payload,protectedHeader:l.protectedHeader};return typeof t=="function"?{...c,key:l.key}:c}const ie=e=>Math.floor(e.getTime()/1e3),Qr=60,es=Qr*60,fa=es*24,En=fa*7,wn=fa*365.25,Tn=/^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i,Qe=e=>{const t=Tn.exec(e);if(!t||t[4]&&t[1])throw new TypeError("Invalid time period format");const a=parseFloat(t[2]),r=t[3].toLowerCase();let s;switch(r){case"sec":case"secs":case"second":case"seconds":case"s":s=Math.round(a);break;case"minute":case"minutes":case"min":case"mins":case"m":s=Math.round(a*Qr);break;case"hour":case"hours":case"hr":case"hrs":case"h":s=Math.round(a*es);break;case"day":case"days":case"d":s=Math.round(a*fa);break;case"week":case"weeks":case"w":s=Math.round(a*En);break;default:s=Math.round(a*wn);break}return t[1]==="-"||t[4]==="ago"?-s:s};function he(e,t){if(!Number.isFinite(t))throw new TypeError(`Invalid ${e} input`);return t}const Pa=e=>e.includes("/")?e.toLowerCase():`application/${e.toLowerCase()}`,Nn=(e,t)=>typeof e=="string"?t.includes(e):Array.isArray(e)?t.some(Set.prototype.has.bind(new Set(e))):!1;function _n(e,t,a={}){let r;try{r=JSON.parse(Ae.decode(t))}catch{}if(!st(r))throw new Lt("JWT Claims Set must be a top-level JSON object");const{typ:s}=a;if(s&&(typeof e.typ!="string"||Pa(e.typ)!==Pa(s)))throw new H('unexpected "typ" JWT header value',r,"typ","check_failed");const{requiredClaims:o=[],issuer:i,subject:l,audience:c,maxTokenAge:d}=a,p=[...o];d!==void 0&&p.push("iat"),c!==void 0&&p.push("aud"),l!==void 0&&p.push("sub"),i!==void 0&&p.push("iss");for(const g of new Set(p.reverse()))if(!(g in r))throw new H(`missing required "${g}" claim`,r,g,"missing");if(i&&!(Array.isArray(i)?i:[i]).includes(r.iss))throw new H('unexpected "iss" claim value',r,"iss","check_failed");if(l&&r.sub!==l)throw new H('unexpected "sub" claim value',r,"sub","check_failed");if(c&&!Nn(r.aud,typeof c=="string"?[c]:c))throw new H('unexpected "aud" claim value',r,"aud","check_failed");let m;switch(typeof a.clockTolerance){case"string":m=Qe(a.clockTolerance);break;case"number":m=a.clockTolerance;break;case"undefined":m=0;break;default:throw new TypeError("Invalid clockTolerance option type")}const{currentDate:f}=a,x=ie(f||new Date);if((r.iat!==void 0||d)&&typeof r.iat!="number")throw new H('"iat" claim must be a number',r,"iat","invalid");if(r.nbf!==void 0){if(typeof r.nbf!="number")throw new H('"nbf" claim must be a number',r,"nbf","invalid");if(r.nbf>x+m)throw new H('"nbf" claim timestamp check failed',r,"nbf","check_failed")}if(r.exp!==void 0){if(typeof r.exp!="number")throw new H('"exp" claim must be a number',r,"exp","invalid");if(r.exp<=x-m)throw new ta('"exp" claim timestamp check failed',r,"exp","check_failed")}if(d){const g=x-r.iat,b=typeof d=="number"?d:Qe(d);if(g-m>b)throw new ta('"iat" claim timestamp check failed (too far in the past)',r,"iat","check_failed");if(g<0-m)throw new H('"iat" claim timestamp check failed (it should be in the past)',r,"iat","check_failed")}return r}var R;class An{constructor(t){w(this,R);if(!st(t))throw new TypeError("JWT Claims Set MUST be an object");E(this,R,structuredClone(t))}data(){return J.encode(JSON.stringify(u(this,R)))}get iss(){return u(this,R).iss}set iss(t){u(this,R).iss=t}get sub(){return u(this,R).sub}set sub(t){u(this,R).sub=t}get aud(){return u(this,R).aud}set aud(t){u(this,R).aud=t}set jti(t){u(this,R).jti=t}set nbf(t){typeof t=="number"?u(this,R).nbf=he("setNotBefore",t):t instanceof Date?u(this,R).nbf=he("setNotBefore",ie(t)):u(this,R).nbf=ie(new Date)+Qe(t)}set exp(t){typeof t=="number"?u(this,R).exp=he("setExpirationTime",t):t instanceof Date?u(this,R).exp=he("setExpirationTime",ie(t)):u(this,R).exp=ie(new Date)+Qe(t)}set iat(t){typeof t>"u"?u(this,R).iat=ie(new Date):t instanceof Date?u(this,R).iat=he("setIssuedAt",ie(t)):typeof t=="string"?u(this,R).iat=he("setIssuedAt",ie(new Date)+Qe(t)):u(this,R).iat=he("setIssuedAt",t)}}R=new WeakMap;async function Cn(e,t,a){var i;const r=await vn(e,t,a);if((i=r.protectedHeader.crit)!=null&&i.includes("b64")&&r.protectedHeader.b64===!1)throw new Lt("JWTs MUST NOT use unencoded payload");const o={payload:_n(r.protectedHeader,r.payload,a),protectedHeader:r.protectedHeader};return typeof t=="function"?{...o,key:r.key}:o}const Sn=async(e,t,a)=>{const r=await Zr(e,t,"sign");Kr(e,r);const s=await crypto.subtle.sign(Yr(e,r.algorithm),r,a);return new Uint8Array(s)};var mt,k,V;class Rn{constructor(t){w(this,mt);w(this,k);w(this,V);if(!(t instanceof Uint8Array))throw new TypeError("payload must be an instance of Uint8Array");E(this,mt,t)}setProtectedHeader(t){if(u(this,k))throw new TypeError("setProtectedHeader can only be called once");return E(this,k,t),this}setUnprotectedHeader(t){if(u(this,V))throw new TypeError("setUnprotectedHeader can only be called once");return E(this,V,t),this}async sign(t,a){if(!u(this,k)&&!u(this,V))throw new S("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");if(!Wr(u(this,k),u(this,V)))throw new S("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const r={...u(this,k),...u(this,V)},s=qr(S,new Map([["b64",!0]]),a==null?void 0:a.crit,u(this,k),r);let o=!0;if(s.has("b64")&&(o=u(this,k).b64,typeof o!="boolean"))throw new S('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:i}=r;if(typeof i!="string"||!i)throw new S('JWS "alg" (Algorithm) Header Parameter missing or invalid');Jr(i,t,"sign");let l=u(this,mt);o&&(l=J.encode(Kt(l)));let c;u(this,k)?c=J.encode(Kt(JSON.stringify(u(this,k)))):c=J.encode("");const d=jr(c,J.encode("."),l),p=await Vr(t,i),m=await Sn(i,p,d),f={signature:Kt(m),payload:""};return o&&(f.payload=Ae.decode(l)),u(this,V)&&(f.header=u(this,V)),u(this,k)&&(f.protected=Ae.decode(c)),f}}mt=new WeakMap,k=new WeakMap,V=new WeakMap;var Xe;class In{constructor(t){w(this,Xe);E(this,Xe,new Rn(t))}setProtectedHeader(t){return u(this,Xe).setProtectedHeader(t),this}async sign(t,a){const r=await u(this,Xe).sign(t,a);if(r.payload===void 0)throw new TypeError("use the flattened module for creating JWS with b64: false");return`${r.protected}.${r.payload}.${r.signature}`}}Xe=new WeakMap;var xe,j;class ja{constructor(t={}){w(this,xe);w(this,j);E(this,j,new An(t))}setIssuer(t){return u(this,j).iss=t,this}setSubject(t){return u(this,j).sub=t,this}setAudience(t){return u(this,j).aud=t,this}setJti(t){return u(this,j).jti=t,this}setNotBefore(t){return u(this,j).nbf=t,this}setExpirationTime(t){return u(this,j).exp=t,this}setIssuedAt(t){return u(this,j).iat=t,this}setProtectedHeader(t){return E(this,xe,t),this}async sign(t,a){var s;const r=new In(u(this,j).data());if(r.setProtectedHeader(u(this,xe)),Array.isArray((s=u(this,xe))==null?void 0:s.crit)&&u(this,xe).crit.includes("b64")&&u(this,xe).b64===!1)throw new Lt("JWTs MUST NOT use unencoded payload");return r.sign(t,a)}}xe=new WeakMap,j=new WeakMap;var ra=null;function Dn(e){try{return crypto.getRandomValues(new Uint8Array(e))}catch{}try{return ys.randomBytes(e)}catch{}if(!ra)throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");return ra(e)}function Mn(e){ra=e}function xa(e,t){if(e=e||ba,typeof e!="number")throw Error("Illegal arguments: "+typeof e+", "+typeof t);e<4?e=4:e>31&&(e=31);var a=[];return a.push("$2b$"),e<10&&a.push("0"),a.push(e.toString()),a.push("$"),a.push(Mt(Dn(ot),ot)),a.join("")}function ts(e,t,a){if(typeof t=="function"&&(a=t,t=void 0),typeof e=="function"&&(a=e,e=void 0),typeof e>"u")e=ba;else if(typeof e!="number")throw Error("illegal arguments: "+typeof e);function r(s){z(function(){try{s(null,xa(e))}catch(o){s(o)}})}if(a){if(typeof a!="function")throw Error("Illegal callback: "+typeof a);r(a)}else return new Promise(function(s,o){r(function(i,l){if(i){o(i);return}s(l)})})}function as(e,t){if(typeof t>"u"&&(t=ba),typeof t=="number"&&(t=xa(t)),typeof e!="string"||typeof t!="string")throw Error("Illegal arguments: "+typeof e+", "+typeof t);return sa(e,t)}function rs(e,t,a,r){function s(o){typeof e=="string"&&typeof t=="number"?ts(t,function(i,l){sa(e,l,o,r)}):typeof e=="string"&&typeof t=="string"?sa(e,t,o,r):z(o.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof t)))}if(a){if(typeof a!="function")throw Error("Illegal callback: "+typeof a);s(a)}else return new Promise(function(o,i){s(function(l,c){if(l){i(l);return}o(c)})})}function ss(e,t){for(var a=e.length^t.length,r=0;r<e.length;++r)a|=e.charCodeAt(r)^t.charCodeAt(r);return a===0}function On(e,t){if(typeof e!="string"||typeof t!="string")throw Error("Illegal arguments: "+typeof e+", "+typeof t);return t.length!==60?!1:ss(as(e,t.substring(0,t.length-31)),t)}function Ln(e,t,a,r){function s(o){if(typeof e!="string"||typeof t!="string"){z(o.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof t)));return}if(t.length!==60){z(o.bind(this,null,!1));return}rs(e,t.substring(0,29),function(i,l){i?o(i):o(null,ss(l,t))},r)}if(a){if(typeof a!="function")throw Error("Illegal callback: "+typeof a);s(a)}else return new Promise(function(o,i){s(function(l,c){if(l){i(l);return}o(c)})})}function Fn(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);return parseInt(e.split("$")[2],10)}function Un(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);if(e.length!==60)throw Error("Illegal hash length: "+e.length+" != 60");return e.substring(0,29)}function kn(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);return os(e)>72}var z=typeof process<"u"&&process&&typeof process.nextTick=="function"?typeof setImmediate=="function"?setImmediate:process.nextTick:setTimeout;function os(e){for(var t=0,a=0,r=0;r<e.length;++r)a=e.charCodeAt(r),a<128?t+=1:a<2048?t+=2:(a&64512)===55296&&(e.charCodeAt(r+1)&64512)===56320?(++r,t+=4):t+=3;return t}function Pn(e){for(var t=0,a,r,s=new Array(os(e)),o=0,i=e.length;o<i;++o)a=e.charCodeAt(o),a<128?s[t++]=a:a<2048?(s[t++]=a>>6|192,s[t++]=a&63|128):(a&64512)===55296&&((r=e.charCodeAt(o+1))&64512)===56320?(a=65536+((a&1023)<<10)+(r&1023),++o,s[t++]=a>>18|240,s[t++]=a>>12&63|128,s[t++]=a>>6&63|128,s[t++]=a&63|128):(s[t++]=a>>12|224,s[t++]=a>>6&63|128,s[t++]=a&63|128);return s}var Me="./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),ne=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,54,55,56,57,58,59,60,61,62,63,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,-1,-1,-1,-1,-1];function Mt(e,t){var a=0,r=[],s,o;if(t<=0||t>e.length)throw Error("Illegal len: "+t);for(;a<t;){if(s=e[a++]&255,r.push(Me[s>>2&63]),s=(s&3)<<4,a>=t){r.push(Me[s&63]);break}if(o=e[a++]&255,s|=o>>4&15,r.push(Me[s&63]),s=(o&15)<<2,a>=t){r.push(Me[s&63]);break}o=e[a++]&255,s|=o>>6&3,r.push(Me[s&63]),r.push(Me[o&63])}return r.join("")}function ns(e,t){var a=0,r=e.length,s=0,o=[],i,l,c,d,p,m;if(t<=0)throw Error("Illegal len: "+t);for(;a<r-1&&s<t&&(m=e.charCodeAt(a++),i=m<ne.length?ne[m]:-1,m=e.charCodeAt(a++),l=m<ne.length?ne[m]:-1,!(i==-1||l==-1||(p=i<<2>>>0,p|=(l&48)>>4,o.push(String.fromCharCode(p)),++s>=t||a>=r)||(m=e.charCodeAt(a++),c=m<ne.length?ne[m]:-1,c==-1)||(p=(l&15)<<4>>>0,p|=(c&60)>>2,o.push(String.fromCharCode(p)),++s>=t||a>=r)));)m=e.charCodeAt(a++),d=m<ne.length?ne[m]:-1,p=(c&3)<<6>>>0,p|=d,o.push(String.fromCharCode(p)),++s;var f=[];for(a=0;a<s;a++)f.push(o[a].charCodeAt(0));return f}var ot=16,ba=10,jn=16,Bn=100,Ba=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],Ha=[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946,1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055,3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504,976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462],is=[1332899944,1700884034,1701343084,1684370003,1668446532,1869963892];function nt(e,t,a,r){var s,o=e[t],i=e[t+1];return o^=a[0],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[1],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[2],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[3],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[4],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[5],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[6],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[7],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[8],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[9],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[10],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[11],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[12],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[13],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[14],s=r[o>>>24],s+=r[256|o>>16&255],s^=r[512|o>>8&255],s+=r[768|o&255],i^=s^a[15],s=r[i>>>24],s+=r[256|i>>16&255],s^=r[512|i>>8&255],s+=r[768|i&255],o^=s^a[16],e[t]=i^a[jn+1],e[t+1]=o,e}function ke(e,t){for(var a=0,r=0;a<4;++a)r=r<<8|e[t]&255,t=(t+1)%e.length;return{key:r,offp:t}}function $a(e,t,a){for(var r=0,s=[0,0],o=t.length,i=a.length,l,c=0;c<o;c++)l=ke(e,r),r=l.offp,t[c]=t[c]^l.key;for(c=0;c<o;c+=2)s=nt(s,0,t,a),t[c]=s[0],t[c+1]=s[1];for(c=0;c<i;c+=2)s=nt(s,0,t,a),a[c]=s[0],a[c+1]=s[1]}function Hn(e,t,a,r){for(var s=0,o=[0,0],i=a.length,l=r.length,c,d=0;d<i;d++)c=ke(t,s),s=c.offp,a[d]=a[d]^c.key;for(s=0,d=0;d<i;d+=2)c=ke(e,s),s=c.offp,o[0]^=c.key,c=ke(e,s),s=c.offp,o[1]^=c.key,o=nt(o,0,a,r),a[d]=o[0],a[d+1]=o[1];for(d=0;d<l;d+=2)c=ke(e,s),s=c.offp,o[0]^=c.key,c=ke(e,s),s=c.offp,o[1]^=c.key,o=nt(o,0,a,r),r[d]=o[0],r[d+1]=o[1]}function Ga(e,t,a,r,s){var o=is.slice(),i=o.length,l;if(a<4||a>31)if(l=Error("Illegal number of rounds (4-31): "+a),r){z(r.bind(this,l));return}else throw l;if(t.length!==ot)if(l=Error("Illegal salt length: "+t.length+" != "+ot),r){z(r.bind(this,l));return}else throw l;a=1<<a>>>0;var c,d,p=0,m;typeof Int32Array=="function"?(c=new Int32Array(Ba),d=new Int32Array(Ha)):(c=Ba.slice(),d=Ha.slice()),Hn(t,e,c,d);function f(){if(s&&s(p/a),p<a)for(var g=Date.now();p<a&&(p=p+1,$a(e,c,d),$a(t,c,d),!(Date.now()-g>Bn)););else{for(p=0;p<64;p++)for(m=0;m<i>>1;m++)nt(o,m<<1,c,d);var b=[];for(p=0;p<i;p++)b.push((o[p]>>24&255)>>>0),b.push((o[p]>>16&255)>>>0),b.push((o[p]>>8&255)>>>0),b.push((o[p]&255)>>>0);if(r){r(null,b);return}else return b}r&&z(f)}if(typeof r<"u")f();else for(var x;;)if(typeof(x=f())<"u")return x||[]}function sa(e,t,a,r){var s;if(typeof e!="string"||typeof t!="string")if(s=Error("Invalid string / salt: Not a string"),a){z(a.bind(this,s));return}else throw s;var o,i;if(t.charAt(0)!=="$"||t.charAt(1)!=="2")if(s=Error("Invalid salt version: "+t.substring(0,2)),a){z(a.bind(this,s));return}else throw s;if(t.charAt(2)==="$")o="\0",i=3;else{if(o=t.charAt(2),o!=="a"&&o!=="b"&&o!=="y"||t.charAt(3)!=="$")if(s=Error("Invalid salt revision: "+t.substring(2,4)),a){z(a.bind(this,s));return}else throw s;i=4}if(t.charAt(i+2)>"$")if(s=Error("Missing salt rounds"),a){z(a.bind(this,s));return}else throw s;var l=parseInt(t.substring(i,i+1),10)*10,c=parseInt(t.substring(i+1,i+2),10),d=l+c,p=t.substring(i+3,i+25);e+=o>="a"?"\0":"";var m=Pn(e),f=ns(p,ot);function x(g){var b=[];return b.push("$2"),o>="a"&&b.push(o),b.push("$"),d<10&&b.push("0"),b.push(d.toString()),b.push("$"),b.push(Mt(f,f.length)),b.push(Mt(g,is.length*4-1)),b.join("")}if(typeof a>"u")return x(Ga(m,f,d));Ga(m,f,d,function(g,b){g?a(g,null):a(null,x(b))},r)}function $n(e,t){return Mt(e,t)}function Gn(e,t){return ns(e,t)}const Xn={setRandomFallback:Mn,genSaltSync:xa,genSalt:ts,hashSync:as,hash:rs,compareSync:On,compare:Ln,getRounds:Fn,getSalt:Un,truncates:kn,encodeBase64:$n,decodeBase64:Gn},y=new Rr;y.use("*",ho());y.use("/api/*",uo());y.use(tn);y.use("/static/*",So({root:"./public"}));function ls(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){const t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}async function cs(e,t){const r=btoa(JSON.stringify({alg:"HS256",typ:"JWT"})).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_"),s=btoa(JSON.stringify(e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_"),o=`${r}.${s}`,i=await crypto.subtle.importKey("raw",new TextEncoder().encode(t),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),l=await crypto.subtle.sign("HMAC",i,new TextEncoder().encode(o)),c=btoa(String.fromCharCode(...new Uint8Array(l))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");return`${o}.${c}`}async function zn(e,t){const a=e.split(".");if(a.length!==3)throw new Error("Invalid token");const[r,s,o]=a,i=`${r}.${s}`,l=await crypto.subtle.importKey("raw",new TextEncoder().encode(t),{name:"HMAC",hash:"SHA-256"},!1,["verify"]),c=Uint8Array.from(atob(o.replace(/-/g,"+").replace(/_/g,"/")),p=>p.charCodeAt(0));if(!await crypto.subtle.verify("HMAC",l,c,new TextEncoder().encode(i)))throw new Error("Invalid signature");return JSON.parse(atob(s.replace(/-/g,"+").replace(/_/g,"/")))}async function et(e){const a=new TextEncoder().encode(e+"LYRA_SALT_2024"),r=await crypto.subtle.digest("SHA-256",a);return Array.from(new Uint8Array(r)).map(i=>i.toString(16).padStart(2,"0")).join("")}async function Wn(e,t){try{return await et(e)===t}catch{return!1}}async function K(e){const t=e.req.header("Authorization");if(!t||!t.startsWith("Bearer "))return null;const a=t.substring(7),r="lyra-jwt-secret-key-2024";try{const s=await zn(a,r),{env:o}=e,i=await o.DB.prepare(`
      SELECT s.*, u.id, u.name, u.email, u.is_cfo, u.created_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > datetime('now')
    `).bind(s.sessionId).first();if(!i)return null;const l=await o.DB.prepare(`
      SELECT p.*, c.name as company_name, c.country, c.primary_currency
      FROM user_permissions p
      JOIN companies c ON p.company_id = c.id
      WHERE p.user_id = ? AND c.active = 1
    `).bind(i.id).all();return{id:i.id,name:i.name,email:i.email,is_cfo:i.is_cfo,sessionId:i.sessionId,created_at:i.created_at,permissions:l.results||[]}}catch{return null}}function Kn(e,t){return e.is_cfo?!0:e.permissions.some(a=>a.company_id===t&&a.can_view_all)}function qn(e,t){return e.is_cfo?!0:e.permissions.some(a=>a.company_id===t&&a.can_create)}function Xa(e,t){return e.is_cfo?!0:e.permissions.some(a=>a.company_id===t&&a.can_approve)}y.post("/api/auth/register",async e=>{const{env:t}=e;try{const{name:a,email:r,password:s}=await e.req.json();if(!a||!r||!s)return e.json({error:"Todos los campos son requeridos"},400);if(s.length<6)return e.json({error:"La contraseña debe tener al menos 6 caracteres"},400);if(await t.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(r).first())return e.json({error:"Este correo ya está registrado"},400);const i=await et(s),c=(await t.DB.prepare("SELECT COUNT(*) as count FROM users").first()).count===0,p=(await t.DB.prepare(`
      INSERT INTO users (name, email, password_hash, is_cfo, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(a,r,i,c?1:0).run()).meta.last_row_id,m=ls(),f=new Date(Date.now()+10080*60*1e3).toISOString();await t.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(m,p,f).run();const g=await cs({sessionId:m},"lyra-jwt-secret-key-2024");return e.json({token:g,user:{id:p,name:a,email:r,is_cfo:c}})}catch(a){return console.error("Registration error:",a),e.json({error:"Error interno del servidor"},500)}});y.post("/api/auth/login",async e=>{const{env:t}=e,{email:a,password:r}=await e.req.json();if(!a||!r)return e.json({error:"Email y contraseña son requeridos"},400);try{const s=await t.DB.prepare(`
      SELECT id, name, email, password_hash, is_cfo, created_at
      FROM users WHERE email = ?
    `).bind(a).first();if(!s)return e.json({error:"Credenciales inválidas"},401);if(!await Wn(r,s.password_hash))return e.json({error:"Credenciales inválidas"},401);const i=ls(),l=new Date(Date.now()+10080*60*1e3).toISOString();await t.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(i,s.id,l).run();const d=await cs({sessionId:i},"lyra-jwt-secret-key-2024");return e.json({token:d,user:{id:s.id,name:s.name,email:s.email,is_cfo:s.is_cfo}})}catch(s){return console.error("Login error:",s),e.json({error:"Error interno del servidor"},500)}});y.post("/api/auth/verify",async e=>{const t=await K(e);return t?e.json({user:t}):e.json({error:"Token inválido o expirado"},401)});y.post("/api/auth/logout",async e=>{const t=await K(e);if(t){const{env:a}=e;await a.DB.prepare(`
      DELETE FROM user_sessions WHERE id = ?
    `).bind(t.sessionId).run()}return e.json({success:!0})});y.get("/api/user/needs-setup",async e=>{const t=await K(e);if(!t)return e.json({error:"No autorizado"},401);try{const{env:a}=e,s=(await a.DB.prepare(`
      SELECT COUNT(*) as count FROM user_permissions WHERE user_id = ?
    `).bind(t.id).first()).count===0;return e.json({needsSetup:s,user:t})}catch(a){return console.error("Check setup error:",a),e.json({error:"Error interno del servidor"},500)}});y.get("/api/user/permissions",async e=>{const t=await K(e);if(!t)return e.json({error:"No autorizado"},401);try{return e.json({user:{id:t.id,name:t.name,email:t.email,is_cfo:t.is_cfo},permissions:t.permissions,capabilities:{can_view_all_expenses:t.is_cfo||t.permissions.some(a=>a.can_view_all),can_create_expenses:t.is_cfo||t.permissions.some(a=>a.can_create),can_approve_expenses:t.is_cfo||t.permissions.some(a=>a.can_approve),can_manage_users:t.is_cfo||t.permissions.some(a=>a.can_manage_users),accessible_companies:t.is_cfo?"all":t.permissions.map(a=>a.company_id)}})}catch(a){return console.error("User permissions error:",a),e.json({error:"Error interno del servidor"},500)}});y.post("/api/user/setup-permissions",async e=>{const t=await K(e);if(!t)return e.json({error:"No autorizado"},401);try{const{env:a}=e,{permissions:r}=await e.req.json();if(!r||!Array.isArray(r)||r.length===0)return e.json({error:"Debe especificar al menos una empresa"},400);await a.DB.prepare(`
      DELETE FROM user_permissions WHERE user_id = ?
    `).bind(t.id).run();for(const s of r)await a.DB.prepare(`
        INSERT INTO user_permissions (user_id, company_id, can_view_all, can_create, can_approve, can_manage_users, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(t.id,s.company_id,s.can_view_all?1:0,s.can_create?1:0,s.can_approve?1:0,s.can_manage_users?1:0).run();return e.json({success:!0,message:"Permisos configurados exitosamente"})}catch(a){return console.error("Setup permissions error:",a),e.json({error:"Error interno del servidor"},500)}});y.get("/api/health",async e=>{const{env:t}=e;try{const a=await t.DB.prepare("SELECT 1 as test").first();return e.json({status:"healthy",database:"connected",environment:t.ENVIRONMENT||"development",timestamp:new Date().toISOString()})}catch(a){return e.json({status:"unhealthy",database:"disconnected",error:a.message},500)}});y.post("/api/init-db",async e=>{const{env:t}=e;if(t.ENVIRONMENT==="production")return e.json({error:"Not available in production"},403);try{const a=[`CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        -- Información Básica
        name TEXT NOT NULL,
        commercial_name TEXT,
        razon_social TEXT,
        country TEXT NOT NULL CHECK (country IN ('MX', 'ES', 'US', 'CA')), 
        tax_id TEXT,
        primary_currency TEXT NOT NULL DEFAULT 'MXN' CHECK (primary_currency IN ('MXN', 'EUR', 'USD', 'CAD')),
        employees_count INTEGER,
        
        -- Información Comercial
        business_category TEXT,
        website TEXT,
        business_description TEXT,
        
        -- Dirección Fiscal
        address_street TEXT,
        address_city TEXT,
        address_state TEXT,
        address_postal TEXT,
        phone TEXT,
        
        -- Branding Corporativo
        logo_url TEXT,
        brand_color TEXT DEFAULT '#D4AF37',
        
        -- Sistema
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Legacy field for backward compatibility
        address TEXT
      )`,`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'advanced', 'admin')),
        is_cfo BOOLEAN NOT NULL DEFAULT FALSE,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )`,`CREATE TABLE IF NOT EXISTS user_companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        can_view BOOLEAN NOT NULL DEFAULT TRUE,
        can_edit BOOLEAN NOT NULL DEFAULT FALSE,
        can_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id)
      )`,`CREATE TABLE IF NOT EXISTS expense_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('travel', 'meals', 'transport', 'accommodation', 'supplies', 'services', 'general')),
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        expense_type_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        expense_date DATE NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency TEXT NOT NULL CHECK (currency IN ('MXN', 'EUR', 'USD')),
        exchange_rate DECIMAL(10,6) NOT NULL DEFAULT 1.0,
        amount_mxn DECIMAL(12,2) NOT NULL,
        payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'company_card', 'petty_cash')),
        vendor TEXT,
        invoice_number TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info', 'reimbursed', 'invoiced')),
        approved_by INTEGER,
        approved_at DATETIME,
        notes TEXT,
        tags TEXT,
        is_billable BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL,
        updated_by INTEGER
      )`,`CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'xml')),
        file_url TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        ocr_text TEXT,
        ocr_confidence DECIMAL(3,2),
        is_cfdi_valid BOOLEAN,
        cfdi_uuid TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        uploaded_by INTEGER NOT NULL
      )`,`CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_currency TEXT NOT NULL CHECK (from_currency IN ('MXN', 'EUR', 'USD')),
        to_currency TEXT NOT NULL CHECK (to_currency IN ('MXN', 'EUR', 'USD')),
        rate DECIMAL(10,6) NOT NULL,
        rate_date DATE NOT NULL,
        source TEXT NOT NULL DEFAULT 'banxico',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_currency, to_currency, rate_date)
      )`,`CREATE TABLE IF NOT EXISTS cfdi_validations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        expense_id INTEGER,
        uuid TEXT NOT NULL,
        rfc_emisor TEXT NOT NULL,
        rfc_receptor TEXT NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        fecha_emision DATETIME,
        serie TEXT,
        folio TEXT,
        is_valid BOOLEAN NOT NULL DEFAULT FALSE,
        validation_details TEXT,
        validation_source TEXT DEFAULT 'manual',
        validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        validated_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(uuid, company_id)
      )`,`CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        rfc TEXT,
        birthdate DATE,
        address TEXT,
        company_id INTEGER NOT NULL,
        position TEXT NOT NULL,
        department TEXT NOT NULL CHECK (department IN ('it', 'sales', 'hr', 'finance', 'operations', 'management')),
        employee_number TEXT,
        hire_date DATE,
        manager_id INTEGER,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (manager_id) REFERENCES employees(id)
      )`];for(const i of a)await t.DB.prepare(i).run();await t.DB.prepare(`
      INSERT OR IGNORE INTO companies (id, name, country, primary_currency, tax_id, active) VALUES 
        (1, 'TechMX Solutions', 'MX', 'MXN', 'TMX123456789', TRUE),
        (2, 'Innovación Digital MX', 'MX', 'MXN', 'IDM987654321', TRUE),
        (3, 'Consultoría Estratégica MX', 'MX', 'MXN', 'CEM555666777', TRUE),
        (4, 'TechES Barcelona', 'ES', 'EUR', 'B-12345678', TRUE),
        (5, 'Innovación Madrid SL', 'ES', 'EUR', 'B-87654321', TRUE),
        (6, 'Digital Valencia S.A.', 'ES', 'EUR', 'A-11223344', TRUE)
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO expense_types (id, name, description, category, active) VALUES 
        (1, 'Comidas de Trabajo', 'Gastos en restaurantes por reuniones de trabajo', 'meals', TRUE),
        (2, 'Transporte Terrestre', 'Taxis, Uber, autobuses, metro', 'transport', TRUE),
        (3, 'Combustible', 'Gasolina y gastos de vehículos', 'transport', TRUE),
        (4, 'Hospedaje', 'Hoteles y alojamientos', 'accommodation', TRUE),
        (5, 'Vuelos', 'Boletos de avión nacionales e internacionales', 'travel', TRUE),
        (6, 'Material de Oficina', 'Papelería, suministros de oficina', 'supplies', TRUE),
        (7, 'Software y Licencias', 'Suscripciones y licencias de software', 'services', TRUE),
        (8, 'Capacitación', 'Cursos, conferencias, workshops', 'services', TRUE),
        (9, 'Marketing', 'Publicidad, eventos, promociones', 'services', TRUE),
        (10, 'Otros Gastos', 'Gastos diversos no categorizados', 'general', TRUE)
    `).run();const r=await et("admin123"),s=await et("partner123"),o=await et("employee123");return await t.DB.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, password_hash, role, active, is_cfo) VALUES 
        (1, 'admin@techmx.com', 'Alejandro Rodríguez', ?, 'admin', TRUE, FALSE),
        (2, 'maria.lopez@techmx.com', 'María López', ?, 'editor', TRUE, FALSE),
        (3, 'carlos.martinez@innovacion.mx', 'Carlos Martínez', ?, 'advanced', TRUE, FALSE),
        (4, 'ana.garcia@consultoria.mx', 'Ana García', ?, 'editor', TRUE, FALSE),
        (5, 'pedro.sanchez@techespana.es', 'Pedro Sánchez', ?, 'advanced', TRUE, FALSE),
        (6, 'elena.torres@madrid.es', 'Elena Torres', ?, 'editor', TRUE, FALSE),
        (7, 'gus@lyraexpenses.com', 'Gus', ?, 'admin', TRUE, TRUE),
        (8, 'maria@lyraexpenses.com', 'María Partner', ?, 'editor', TRUE, FALSE),
        (9, 'carlos@lyraexpenses.com', 'Carlos Employee', ?, 'viewer', TRUE, FALSE)
    `).bind(r,s,o,r,s,o,r,s,o).run(),await t.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        can_view_all BOOLEAN NOT NULL DEFAULT FALSE,
        can_create BOOLEAN NOT NULL DEFAULT FALSE,
        can_approve BOOLEAN NOT NULL DEFAULT FALSE,
        can_manage_users BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO user_companies (user_id, company_id, can_view, can_edit, can_admin) VALUES 
        (1, 1, TRUE, TRUE, TRUE), (1, 2, TRUE, TRUE, TRUE), (1, 3, TRUE, TRUE, TRUE),
        (1, 4, TRUE, TRUE, TRUE), (1, 5, TRUE, TRUE, TRUE), (1, 6, TRUE, TRUE, TRUE),
        (2, 1, TRUE, TRUE, FALSE), (3, 2, TRUE, TRUE, FALSE), (4, 3, TRUE, TRUE, FALSE),
        (5, 4, TRUE, TRUE, FALSE), (6, 5, TRUE, TRUE, FALSE)
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO user_permissions (user_id, company_id, can_view_all, can_create, can_approve, can_manage_users) VALUES 
        -- Gus (CFO) - Control total de todas las empresas
        (7, 1, TRUE, TRUE, TRUE, TRUE), (7, 2, TRUE, TRUE, TRUE, TRUE), (7, 3, TRUE, TRUE, TRUE, TRUE),
        (7, 4, TRUE, TRUE, TRUE, TRUE), (7, 5, TRUE, TRUE, TRUE, TRUE), (7, 6, TRUE, TRUE, TRUE, TRUE),
        -- María (Partner) - LYRA México (crear gastos) + LYRA España (solo ver)
        (8, 1, TRUE, TRUE, FALSE, FALSE), (8, 4, TRUE, FALSE, FALSE, FALSE),
        -- Carlos (Employee) - Solo LYRA México (read-only)
        (9, 1, FALSE, FALSE, FALSE, FALSE)
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO employees (
        id, name, email, phone, rfc, birthdate, address,
        company_id, position, department, employee_number, hire_date, manager_id, active
      ) VALUES 
        (1, 'Alejandro Rodríguez', 'alejandro@techmx.com', '+52 555 123 4567', 'ROGA850101ABC', '1985-01-01', 'Av. Reforma 123, CDMX', 1, 'Director General', 'management', 'EMP001', '2020-01-15', NULL, TRUE),
        (2, 'María López García', 'maria.lopez@techmx.com', '+52 555 234 5678', 'LOGM880215DEF', '1988-02-15', 'Calle Insurgentes 456, CDMX', 1, 'Gerente de Finanzas', 'finance', 'EMP002', '2020-03-01', 1, TRUE),
        (3, 'Carlos Martínez Ruiz', 'carlos@innovacion.mx', '+52 555 345 6789', 'MARC920310GHI', '1992-03-10', 'Col. Roma Norte 789, CDMX', 2, 'Developer Senior', 'it', 'EMP003', '2021-06-15', NULL, TRUE),
        (4, 'Ana García Hernández', 'ana@consultoria.mx', '+52 555 456 7890', 'GAHA900520JKL', '1990-05-20', 'Polanco 321, CDMX', 3, 'Coordinadora de RH', 'hr', 'EMP004', '2021-08-01', NULL, TRUE),
        (5, 'Pedro Sánchez Vila', 'pedro@techespana.es', '+34 915 123 456', '12345678Z', '1987-07-12', 'Calle Gran Vía 45, Madrid', 4, 'Jefe de Ventas', 'sales', 'EMP005', '2020-11-01', NULL, TRUE),
        (6, 'Elena Torres López', 'elena@madrid.es', '+34 915 234 567', '87654321Y', '1991-09-25', 'Barrio Salamanca 67, Madrid', 5, 'Especialista en Marketing', 'sales', 'EMP006', '2022-02-15', 5, TRUE),
        (7, 'Roberto Silva Castro', 'roberto@techmx.com', '+52 555 567 8901', 'SICR890430MNO', '1989-04-30', 'Santa Fe 890, CDMX', 1, 'Analista de Sistemas', 'it', 'EMP007', '2022-07-01', 1, TRUE),
        (8, 'Sofía Mendoza Ruiz', 'sofia@innovacion.mx', '+52 555 678 9012', 'MERS940615PQR', '1994-06-15', 'Condesa 234, CDMX', 2, 'Coordinadora de Operaciones', 'operations', 'EMP008', '2023-01-10', NULL, TRUE),
        (9, 'Miguel Ángel Jiménez', 'miguel@consultoria.mx', '+52 555 789 0123', 'JIMM860825STU', '1986-08-25', 'Del Valle 567, CDMX', 3, 'Contador Senior', 'finance', 'EMP009', '2021-12-01', NULL, TRUE),
        (10, 'Carmen Vega Morales', 'carmen@techespana.es', '+34 915 345 678', '45678912X', '1993-11-08', 'Calle Alcalá 123, Madrid', 4, 'Desarrolladora Frontend', 'it', 'EMP010', '2023-04-01', NULL, TRUE)
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO exchange_rates (from_currency, to_currency, rate, rate_date, source) VALUES 
        ('USD', 'MXN', 18.25, '2024-09-24', 'banxico'),
        ('EUR', 'MXN', 20.15, '2024-09-24', 'banxico'),
        ('EUR', 'USD', 1.10, '2024-09-24', 'ecb'),
        ('USD', 'EUR', 0.91, '2024-09-24', 'ecb'),
        ('MXN', 'USD', 0.055, '2024-09-24', 'banxico'),
        ('MXN', 'EUR', 0.050, '2024-09-24', 'banxico')
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO expenses (
        id, company_id, user_id, expense_type_id, description, expense_date, 
        amount, currency, exchange_rate, amount_mxn, payment_method, vendor, 
        status, notes, is_billable, created_by
      ) VALUES 
        (1, 1, 2, 1, 'Comida con cliente - Proyecto Alpha', '2024-09-20', 850.00, 'MXN', 1.0, 850.00, 'company_card', 'Restaurante Pujol', 'approved', 'Reunión de cierre de proyecto', TRUE, 2),
        (2, 1, 2, 2, 'Taxi al aeropuerto', '2024-09-21', 320.50, 'MXN', 1.0, 320.50, 'cash', 'Uber', 'pending', NULL, FALSE, 2),
        (3, 2, 3, 7, 'Licencia Adobe Creative Suite', '2024-09-22', 2500.00, 'MXN', 1.0, 2500.00, 'credit_card', 'Adobe Inc', 'approved', 'Renovación anual', FALSE, 3),
        (4, 4, 5, 5, 'Vuelo Barcelona-Madrid', '2024-09-18', 120.00, 'EUR', 20.15, 2418.00, 'company_card', 'Iberia', 'reimbursed', 'Reunión con cliente en Madrid', TRUE, 5),
        (5, 5, 6, 4, 'Hotel NH Collection Madrid', '2024-09-19', 180.00, 'EUR', 20.15, 3627.00, 'credit_card', 'NH Hotels', 'approved', 'Estadía 2 noches', TRUE, 6),
        (6, 1, 1, 8, 'Conferencia AWS Re:Invent', '2024-09-15', 1500.00, 'USD', 18.25, 27375.00, 'company_card', 'Amazon Web Services', 'approved', 'Capacitación en cloud computing', FALSE, 1),
        (7, 3, 4, 6, 'Material de oficina importado', '2024-09-23', 250.00, 'USD', 18.25, 4562.50, 'bank_transfer', 'Office Depot USA', 'pending', 'Material especializado', FALSE, 4)
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO cfdi_validations (
        company_id, expense_id, uuid, rfc_emisor, rfc_receptor, total, 
        fecha_emision, serie, folio, is_valid, validation_details, 
        validation_source, validated_by
      ) VALUES 
        (1, 1, '12345678-1234-1234-1234-123456789012', 'RPU123456789', 'TMX123456789', 850.00, 
         '2024-09-20T14:30:00', 'A', '001', TRUE, 'CFDI válido - Verificado en SAT', 'xml', 1),
        (2, 3, '87654321-4321-4321-4321-210987654321', 'ADO987654321', 'IDM987654321', 2500.00, 
         '2024-09-22T09:15:00', 'B', '002', TRUE, 'CFDI válido - Factura de software', 'pdf', 3),
        (3, 7, 'ABCDEFGH-1111-2222-3333-444455556666', 'ODP555666777', 'CEM555666777', 4562.50, 
         '2024-09-23T16:45:00', 'C', '003', FALSE, 'Error: Receptor no coincide', 'manual', 4)
    `).run(),e.json({success:!0,message:"Base de datos inicializada con datos de prueba (incluyendo CFDI validations)",timestamp:new Date().toISOString()})}catch(a){return e.json({error:"Failed to initialize database",details:a.message},500)}});y.get("/api/companies",async e=>{const{env:t}=e,a=await K(e);if(!a)return e.json({error:"No autorizado"},401);try{let r,s=[];if(a.is_cfo)r=`
        SELECT id, name, country, primary_currency, logo_url, active, created_at
        FROM companies 
        WHERE active = TRUE
        ORDER BY country, name
      `;else{const i=a.permissions.map(c=>c.company_id);if(i.length===0)return e.json({companies:[]});r=`
        SELECT id, name, country, primary_currency, logo_url, active, created_at
        FROM companies 
        WHERE active = TRUE AND id IN (${i.map(()=>"?").join(",")})
        ORDER BY country, name
      `,s=i}const o=await t.DB.prepare(r).bind(...s).all();return e.json({companies:o.results,user_role:a.is_cfo?"cfo":"user",accessible_count:o.results.length})}catch(r){return console.error("Companies API error:",r),e.json({error:"Failed to fetch companies"},500)}});y.post("/api/companies",async e=>{const{env:t}=e,a=await K(e);if(!a)return e.json({error:"No autorizado"},401);if(!a.is_cfo)return e.json({error:"Solo CFOs pueden crear nuevas empresas"},403);try{const r=await e.req.json(),s=["razon_social","commercial_name","country","tax_id","primary_currency"];for(const d of s)if(!r[d])return e.json({error:`El campo ${d} es requerido`},400);if(!["MX","ES","US","CA"].includes(r.country))return e.json({error:"País no válido"},400);if(!["MXN","EUR","USD","CAD"].includes(r.primary_currency))return e.json({error:"Moneda no válida"},400);if(await t.DB.prepare(`
      SELECT id FROM companies WHERE tax_id = ? AND active = TRUE
    `).bind(r.tax_id).first())return e.json({error:"Ya existe una empresa con ese RFC/NIF/EIN/BN"},409);const l=(await t.DB.prepare(`
      INSERT INTO companies (
        name, commercial_name, razon_social, country, tax_id, primary_currency, employees_count,
        business_category, website, business_description,
        address_street, address_city, address_state, address_postal, phone,
        logo_url, brand_color, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(r.commercial_name||r.razon_social,r.commercial_name,r.razon_social,r.country,r.tax_id,r.primary_currency,r.employees_count||null,r.business_category||null,r.website||null,r.business_description||null,r.address_street||null,r.address_city||null,r.address_state||null,r.address_postal||null,r.phone||null,r.logo_url||null,r.brand_color||"#D4AF37",!0).run()).meta.last_row_id,c=await t.DB.prepare(`
      SELECT * FROM companies WHERE id = ?
    `).bind(l).first();return console.log(`✅ Nueva empresa creada: ${r.commercial_name} (ID: ${l})`),e.json({success:!0,message:"Empresa creada exitosamente",company:c,id:l})}catch(r){return console.error("Error creating company:",r),e.json({error:"Error interno del servidor",details:r.message},500)}});y.get("/api/users",async e=>{const{env:t}=e,a=await K(e);if(!a)return e.json({error:"No autorizado"},401);if(!a.is_cfo&&!a.permissions.some(r=>r.can_manage_users))return e.json({error:"No tienes permisos para ver usuarios"},403);try{let r=`
      SELECT DISTINCT u.id, u.email, u.name, u.role, u.active, u.created_at, u.is_cfo,
             GROUP_CONCAT(DISTINCT c.name || ' (' || up.can_view_all || ',' || up.can_create || ',' || up.can_approve || ')') as companies_permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      LEFT JOIN companies c ON up.company_id = c.id
      WHERE u.active = TRUE
    `;if(a.is_cfo){r+=" GROUP BY u.id ORDER BY u.name";const s=await t.DB.prepare(r).all();return e.json({users:s.results})}else{const s=a.permissions.filter(l=>l.can_manage_users).map(l=>l.company_id);if(s.length===0)return e.json({users:[]});const o=s.map(()=>"?").join(",");r+=` AND u.id IN (
        SELECT DISTINCT user_id FROM user_permissions 
        WHERE company_id IN (${o})
      )`,r+=" GROUP BY u.id ORDER BY u.name";const i=await t.DB.prepare(r).bind(...s).all();return e.json({users:i.results})}}catch(r){return console.error("Users API error:",r),e.json({error:"Failed to fetch users"},500)}});y.get("/api/expenses",async e=>{const{env:t}=e,a=await K(e);if(!a)return e.json({error:"No autorizado"},401);const r=e.req.query();let s=`
    SELECT e.*, c.name as company_name, u.name as user_name, et.name as expense_type_name,
           c.country, c.primary_currency as company_currency
    FROM expenses e
    JOIN companies c ON e.company_id = c.id
    JOIN users u ON e.user_id = u.id
    JOIN expense_types et ON e.expense_type_id = et.id
    WHERE 1=1
  `;const o=[];if(a.is_cfo)console.log("CFO access: viewing all expenses");else{const i=a.permissions.filter(l=>l.can_view_all).map(l=>l.company_id);if(i.length===0)s+=" AND e.user_id = ?",o.push(a.id);else{const l=i.map(()=>"?").join(",");s+=` AND (e.user_id = ? OR e.company_id IN (${l}))`,o.push(a.id,...i)}console.log(`User ${a.email}: accessing expenses with companies [${i.join(",")}]`)}if(r.company_id){const i=parseInt(r.company_id);if(!a.is_cfo&&!Kn(a,i))return e.json({error:"No tienes acceso a esta empresa"},403);s+=" AND e.company_id = ?",o.push(i)}if(r.user_id){const i=parseInt(r.user_id);if(!a.is_cfo&&i!==a.id)return e.json({error:"No puedes ver gastos de otros usuarios"},403);s+=" AND e.user_id = ?",o.push(i)}r.status&&(s+=" AND e.status = ?",o.push(r.status)),r.currency&&(s+=" AND e.currency = ?",o.push(r.currency)),r.date_from&&(s+=" AND e.expense_date >= ?",o.push(r.date_from)),r.date_to&&(s+=" AND e.expense_date <= ?",o.push(r.date_to)),s+=" ORDER BY e.expense_date DESC, e.created_at DESC",r.limit&&(s+=" LIMIT ?",o.push(parseInt(r.limit)||50));try{const l=await t.DB.prepare(s).bind(...o).all();return e.json({expenses:l.results,total:l.results.length})}catch{return e.json({error:"Failed to fetch expenses"},500)}});y.post("/api/expenses",async e=>{const{env:t}=e,a=await K(e);if(!a)return e.json({error:"No autorizado"},401);try{const r=await e.req.json(),s=["company_id","expense_type_id","description","expense_date","amount","currency"];for(const d of s)if(!r[d])return e.json({error:`Missing required field: ${d}`},400);const o=parseInt(r.company_id);if(!a.is_cfo&&!qn(a,o))return e.json({error:"No tienes permisos para crear gastos en esta empresa"},403);r.user_id=a.id,console.log(`User ${a.email} creating expense in company ${o}`);let i=r.amount,l=1;r.currency==="USD"?(l=18.25,i=r.amount*l):r.currency==="EUR"&&(l=20.15,i=r.amount*l);const c=await t.DB.prepare(`
      INSERT INTO expenses (
        company_id, user_id, expense_type_id, description, expense_date, 
        amount, currency, exchange_rate, amount_mxn, payment_method, 
        vendor, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(r.company_id,r.user_id||1,r.expense_type_id,r.description,r.expense_date,r.amount,r.currency,l,i,r.payment_method||"cash",r.vendor||"",r.notes||"","pending",r.user_id||1).run();return e.json({success:!0,expense_id:c.meta.last_row_id,message:"Gasto creado exitosamente"})}catch(r){return e.json({error:"Failed to create expense",details:r.message},500)}});y.put("/api/expenses/:id/status",async e=>{const{env:t}=e,a=await K(e),r=e.req.param("id");if(!a)return e.json({error:"No autorizado"},401);try{const{status:s}=await e.req.json();if(!["pending","approved","rejected","more_info","reimbursed","invoiced"].includes(s))return e.json({error:"Invalid status"},400);const i=await t.DB.prepare(`
      SELECT e.*, c.name as company_name 
      FROM expenses e 
      JOIN companies c ON e.company_id = c.id 
      WHERE e.id = ?
    `).bind(r).first();if(!i)return e.json({error:"Gasto no encontrado"},404);const l=i.company_id;return["approved","rejected","reimbursed","invoiced"].includes(s)&&!a.is_cfo&&!Xa(a,l)?e.json({error:`No tienes permisos para ${s==="approved"?"aprobar":"cambiar estado de"} gastos en ${i.company_name}`},403):["pending","more_info"].includes(s)&&i.user_id!==a.id&&!a.is_cfo&&!Xa(a,l)?e.json({error:"Solo puedes modificar tus propios gastos"},403):(console.log(`User ${a.email} changing expense ${r} status to ${s} in company ${l}`),(await t.DB.prepare(`
      UPDATE expenses 
      SET status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? 
      WHERE id = ?
    `).bind(s,a.id,r).run()).changes===0?e.json({error:"Expense not found"},404):e.json({success:!0,message:"Status updated successfully",new_status:s}))}catch(s){return e.json({error:"Failed to update status",details:s.message},500)}});y.get("/api/dashboard/metrics",async e=>{const{env:t}=e,a=e.req.query();try{let r="WHERE 1=1";const s=[];a.company_id&&(r+=" AND e.company_id = ?",s.push(a.company_id)),a.user_id&&(r+=" AND e.user_id = ?",s.push(a.user_id)),a.status&&(r+=" AND e.status = ?",s.push(a.status)),a.currency&&(r+=" AND e.currency = ?",s.push(a.currency)),a.date_from&&(r+=" AND e.expense_date >= ?",s.push(a.date_from)),a.date_to&&(r+=" AND e.expense_date <= ?",s.push(a.date_to)),a.user_id&&(r+=" AND e.user_id = ?",s.push(a.user_id)),a.status&&(r+=" AND e.status = ?",s.push(a.status));const o=await t.DB.prepare(`
      SELECT status, COUNT(*) as count, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${r}
      GROUP BY status
    `).bind(...s).all(),i=await t.DB.prepare(`
      SELECT c.name as company, c.country, COUNT(*) as count, SUM(e.amount_mxn) as total_mxn
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      ${r}
      GROUP BY c.id, c.name, c.country
      ORDER BY total_mxn DESC
    `).bind(...s).all(),l=await t.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${r}
      GROUP BY currency
    `).bind(...s).all(),c=await t.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      ${r}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).bind(...s).all();return e.json({status_metrics:o.results||[],company_metrics:i.results||[],currency_metrics:l.results||[],recent_expenses:c.results||[],filters_applied:{company_id:a.company_id,user_id:a.user_id,status:a.status,currency:a.currency,date_from:a.date_from,date_to:a.date_to,period:a.period}})}catch(r){return e.json({error:"Failed to fetch dashboard metrics",details:r.message},500)}});y.get("/api/expense-types",async e=>{const{env:t}=e;try{const a=await t.DB.prepare(`
      SELECT id, name, description, category, active
      FROM expense_types
      WHERE active = TRUE
      ORDER BY category, name
    `).all();return e.json({expense_types:a.results})}catch{return e.json({error:"Failed to fetch expense types"},500)}});y.get("/api/exchange-rates",async e=>{const{env:t}=e,a=e.req.query();try{const r=await t.DB.prepare(`
      SELECT from_currency, to_currency, rate, rate_date, source
      FROM exchange_rates
      WHERE rate_date = (
        SELECT MAX(rate_date) FROM exchange_rates
      )
      ORDER BY from_currency, to_currency
    `).all();if(a.from&&a.to){const s=r.results.find(o=>o.from_currency===a.from&&o.to_currency===a.to);if(s)return e.json({rate:s.rate,date:s.rate_date,source:s.source});{const o=r.results.find(i=>i.from_currency===a.to&&i.to_currency===a.from);if(o)return e.json({rate:(1/o.rate).toFixed(6),date:o.rate_date,source:o.source+" (inverse)"})}return e.json({error:"Exchange rate not found"},404)}return e.json({exchange_rates:r.results})}catch{return e.json({error:"Failed to fetch exchange rates"},500)}});y.post("/api/exchange-rates/update",async e=>{const{env:t}=e;try{const a=new Date().toISOString().split("T")[0],r=[{from:"USD",to:"MXN",rate:18.25,source:"banxico"},{from:"EUR",to:"MXN",rate:20.15,source:"banxico"},{from:"EUR",to:"USD",rate:1.1,source:"ecb"},{from:"USD",to:"EUR",rate:.91,source:"ecb"},{from:"MXN",to:"USD",rate:.055,source:"banxico"},{from:"MXN",to:"EUR",rate:.05,source:"banxico"}];for(const s of r)await t.DB.prepare(`
        INSERT OR REPLACE INTO exchange_rates 
        (from_currency, to_currency, rate, rate_date, source, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(s.from,s.to,s.rate,a,s.source).run();return e.json({success:!0,message:"Exchange rates updated successfully",date:a})}catch{return e.json({error:"Failed to update exchange rates"},500)}});y.post("/api/attachments",async e=>{const{env:t}=e;try{const a=await e.req.formData(),r=a.get("file"),s=a.get("expense_id"),o=a.get("process_ocr")==="true";if(!r||!s)return e.json({error:"File and expense_id are required"},400);const i=`/uploads/${Date.now()}-${r.name}`,l=r.type.startsWith("image/")?"image":r.type==="application/pdf"?"pdf":"xml";let c=null;o&&(l==="image"||l==="pdf")&&(c=await ds(r,l));const d=await t.DB.prepare(`
      INSERT INTO attachments (
        expense_id, file_name, file_type, file_url, file_size, 
        mime_type, ocr_text, ocr_confidence, uploaded_by, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(s,r.name,l,i,r.size,r.type,(c==null?void 0:c.text)||null,(c==null?void 0:c.confidence)||null,1).run();return e.json({success:!0,attachment_id:d.meta.last_row_id,file_url:i,ocr_data:c,message:"File uploaded successfully"+(c?" with OCR processing":"")})}catch(a){return e.json({error:"Failed to upload attachment",details:a.message},500)}});y.post("/api/attachments/:id/ocr",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT * FROM attachments WHERE id = ?
    `).bind(a).first();if(!r)return e.json({error:"Attachment not found"},404);if(r.file_type!=="image"&&r.file_type!=="pdf")return e.json({error:"OCR only supported for images and PDFs"},400);const s=await ds(null,r.file_type,r.file_name);return await t.DB.prepare(`
      UPDATE attachments 
      SET ocr_text = ?, ocr_confidence = ?
      WHERE id = ?
    `).bind(s.text,s.confidence,a).run(),e.json({success:!0,ocr_data:s,message:"OCR processing completed"})}catch(r){return e.json({error:"Failed to process OCR",details:r.message},500)}});y.post("/api/ocr/extract-expense-data",async e=>{const{env:t}=e;try{const{ocr_text:a,attachment_id:r}=await e.req.json();if(!a)return e.json({error:"OCR text is required"},400);const s=await Yn(a);return e.json({success:!0,extracted_data:s,message:"Expense data extracted successfully"})}catch(a){return e.json({error:"Failed to extract expense data",details:a.message},500)}});async function ds(e,t,a=null){const r={ticket:{text:`RESTAURANTE PUJOL
Tennyson 133, Polanco
Ciudad de México
RFC: RPU890123ABC

FECHA: ${new Date().toLocaleDateString("es-MX")}
HORA: ${new Date().toLocaleTimeString("es-MX")}

MESA: 12
MESERO: Carlos Martinez

CONSUMO:
1x Menú Degustación     $1,200.00
2x Vino Tinto Casa      $400.00
1x Postre Especial      $250.00

SUBTOTAL:               $1,850.00
IVA (16%):              $296.00
PROPINA SUGERIDA:       $277.50

TOTAL:                  $2,146.00

FORMA DE PAGO: TARJETA ****1234
AUTORIZACIÓN: 123456

GRACIAS POR SU VISITA
www.pujol.com.mx`,confidence:.94},factura:{text:`FACTURA ELECTRÓNICA
Adobe Systems Incorporated
RFC: ASI123456789

LUGAR DE EXPEDICIÓN: 06600
FECHA: ${new Date().toLocaleDateString("es-MX")}
FOLIO FISCAL: 12345678-ABCD-1234-EFGH-123456789012

RECEPTOR:
TechMX Solutions S.A. de C.V.
RFC: TMX123456789
USO CFDI: G03 - Gastos en General

CONCEPTO:
Licencia Adobe Creative Suite Anual
Cantidad: 1
Precio Unitario: $2,500.00
Importe: $2,500.00

SUBTOTAL: $2,500.00
IVA (16%): $400.00
TOTAL: $2,900.00

MÉTODO DE PAGO: 04 - Tarjeta de Crédito
MONEDA: MXN

SELLO DIGITAL SAT: ABC123DEF456...`,confidence:.97},uber:{text:`Uber
VIAJE COMPLETADO

DOMINGO, ${new Date().toLocaleDateString("es-MX")}
${new Date().toLocaleTimeString("es-MX")}

DESDE: Torre Reforma
HASTA: Aeropuerto Internacional

CONDUCTOR: Miguel Hernández
AUTO: Nissan Versa Blanco
PLACAS: ABC-123-D

DISTANCIA: 32.5 km
DURACIÓN: 45 min

TARIFA BASE:     $45.00
TIEMPO Y DIST:   $235.50
PEAJE:          $40.00

SUBTOTAL:       $320.50
PROPINA:        $0.00
TOTAL:          $320.50

MÉTODO DE PAGO: Efectivo
ID VIAJE: 1234-5678-9012`,confidence:.89}};let s="ticket";return a&&(a.toLowerCase().includes("factura")||a.toLowerCase().includes("invoice")?s="factura":(a.toLowerCase().includes("uber")||a.toLowerCase().includes("taxi"))&&(s="uber")),await new Promise(o=>setTimeout(o,1500)),r[s]||r.ticket}y.post("/api/cfdi/validate",async e=>{const{env:t}=e;try{const a=await e.req.formData(),r=a.get("file"),s=a.get("expense_id");if(!r)return e.json({error:"XML or PDF file is required for CFDI validation"},400);let o=null;if(r.type==="application/xml"||r.type==="text/xml")o=await Vn(r);else if(r.type==="application/pdf")o=await Jn(r);else return e.json({error:"Only XML and PDF files are supported for CFDI validation"},400);const i=await ps(o);return s&&o.uuid&&await t.DB.prepare(`
        UPDATE attachments 
        SET is_cfdi_valid = ?, cfdi_uuid = ?
        WHERE expense_id = ? AND id = (
          SELECT id FROM attachments WHERE expense_id = ? ORDER BY uploaded_at DESC LIMIT 1
        )
      `).bind(i.valid,o.uuid,s,s).run(),e.json({success:!0,cfdi_data:o,sat_validation:i,message:i.valid?"CFDI válido":"CFDI inválido o con errores"})}catch(a){return e.json({error:"Failed to validate CFDI",details:a.message},500)}});y.post("/api/cfdi/validate-data",async e=>{const{env:t}=e;try{const a=await e.req.json(),{company_id:r,rfc_emisor:s,rfc_receptor:o,uuid:i,total:l}=a;if(!r||!s||!o||!i)return e.json({error:"company_id, rfc_emisor, rfc_receptor, and uuid are required"},400);if(!await t.DB.prepare("SELECT * FROM companies WHERE id = ? AND country = ?").bind(r,"MX").first())return e.json({error:"Company not found or not a Mexican company"},400);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(i))return e.json({error:"Invalid UUID format"},400);const p={rfc_emisor:s,rfc_receptor:o,uuid:i,total:parseFloat(l)||0,fecha_emision:new Date().toISOString(),serie:"A",folio:"001"},m=await ps(p),f=await t.DB.prepare(`
      INSERT INTO cfdi_validations (
        company_id, uuid, rfc_emisor, rfc_receptor, total, 
        is_valid, validation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(r,i,s,o,l||0,m.valid?1:0,m.mensaje).run();return e.json({success:!0,validation_id:f.meta.last_row_id,cfdi_data:p,sat_valid:m.valid,validation_details:m.mensaje,message:m.valid?"CFDI validado exitosamente":"CFDI con errores de validación"})}catch(a){return e.json({error:"Failed to validate CFDI data",details:a.message},500)}});y.get("/api/expenses/:id/cfdi-status",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT id, file_name, is_cfdi_valid, cfdi_uuid, uploaded_at
      FROM attachments
      WHERE expense_id = ? AND (file_type = 'xml' OR file_type = 'pdf')
      ORDER BY uploaded_at DESC
    `).bind(a).all();return e.json({success:!0,cfdi_attachments:r.results,has_valid_cfdi:r.results.some(s=>s.is_cfdi_valid===1)})}catch{return e.json({error:"Failed to get CFDI status"},500)}});async function Vn(e){return{version:"4.0",uuid:us(),rfc_emisor:"ABC123456789",razon_social_emisor:"Empresa Emisora S.A. de C.V.",rfc_receptor:"XYZ987654321",razon_social_receptor:"TechMX Solutions S.A. de C.V.",fecha:new Date().toISOString(),folio:"A001-"+Math.floor(Math.random()*1e5),serie:"A",forma_pago:"04",metodo_pago:"PUE",uso_cfdi:"G03",lugar_expedicion:"06600",moneda:"MXN",tipo_cambio:"1.000000",conceptos:[{clave_prod_serv:"84111506",no_identificacion:null,cantidad:"1.000000",clave_unidad:"ACT",unidad:"Actividad",descripcion:"Servicios de consultoría",valor_unitario:"2500.00",importe:"2500.00"}],subtotal:"2500.00",iva:"400.00",total:"2900.00",sello_digital:"ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ...",certificado_sat:"DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567ABC...",fecha_timbrado:new Date().toISOString(),no_certificado_sat:"30001000000400002495"}}async function Jn(e){return{version:"4.0",uuid:us(),rfc_emisor:"PDF123456789",razon_social_emisor:"Empresa PDF S.A. de C.V.",rfc_receptor:"TMX123456789",razon_social_receptor:"TechMX Solutions S.A. de C.V.",fecha:new Date().toISOString(),folio:"P001-"+Math.floor(Math.random()*1e5),serie:"P",forma_pago:"01",metodo_pago:"PUE",uso_cfdi:"G01",lugar_expedicion:"06600",moneda:"MXN",subtotal:"850.00",iva:"136.00",total:"986.00",extracted_from:"PDF",confidence:.85}}async function ps(e){await new Promise(r=>setTimeout(r,1500));const t={uuid_format:/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(e.uuid),rfc_format:/^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/.test(e.rfc_emisor),date_valid:e.fecha_emision?new Date(e.fecha_emision)<=new Date:!0,amounts_valid:parseFloat(e.total)>0,version_supported:e.version?["3.3","4.0"].includes(e.version):!0},a=Object.values(t).every(r=>r);return{valid:a,timestamp:new Date().toISOString(),checks:t,sat_status:a?"VIGENTE":"INVALIDO",cancelable:a,estado_sat:a?"Activo":"Cancelado",mensaje:a?"CFDI válido y vigente en el SAT":"CFDI inválido o con errores en la estructura"}}function us(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){const t=Math.random()*16|0;return(e=="x"?t:t&3|8).toString(16)})}async function Yn(e){const t={amount:null,currency:"MXN",date:null,vendor:null,description:null,tax_amount:null,payment_method:null,invoice_number:null,confidence_score:.85,is_cfdi:!1,cfdi_uuid:null,rfc_emisor:null};if(e.includes("CFDI")||e.includes("UUID")||e.includes("FOLIO FISCAL")){t.is_cfdi=!0,t.confidence_score+=.1;const c=e.match(/UUID[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);c&&(t.cfdi_uuid=c[1]);const d=e.match(/FOLIO FISCAL[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);d&&(t.cfdi_uuid=d[1])}const a=e.match(/(?:TOTAL|Total|total)[\s:]*\$?([\d,]+\.?\d*)/i);a&&(t.amount=parseFloat(a[1].replace(",","")),t.confidence_score+=.1);const r=e.match(/(?:FECHA|Fecha|fecha)[\s:]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);r&&(t.date=r[1],t.confidence_score+=.05);const s=e.split(`
`);if(s.length>0){const c=s.find(d=>d.trim()&&!d.includes("TICKET")&&!d.includes("FACTURA"));c&&(t.vendor=c.trim(),t.description=`Gasto en ${c.trim()}`)}const o=e.match(/RFC[\s:]*([A-Z]{3,4}\d{6}[A-Z0-9]{3})/i);o&&(t.rfc_emisor=o[1],t.confidence_score+=.05),e.toLowerCase().includes("efectivo")||e.toLowerCase().includes("cash")?t.payment_method="cash":(e.toLowerCase().includes("tarjeta")||e.toLowerCase().includes("card"))&&(t.payment_method="credit_card");const i=e.match(/(?:FOLIO|Folio|folio)[\s:]*([A-Z0-9\-]+)/i);i&&(t.invoice_number=i[1]);const l=e.match(/(?:IVA|iva)[\s:]*\$?([\d,]+\.?\d*)/i);return l&&(t.tax_amount=parseFloat(l[1].replace(",",""))),t}y.get("/api/expenses/:id/attachments",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT id, file_name, file_type, file_url, file_size, 
             mime_type, ocr_text, uploaded_at
      FROM attachments
      WHERE expense_id = ?
      ORDER BY uploaded_at ASC
    `).bind(a).all();return e.json({attachments:r.results})}catch{return e.json({error:"Failed to fetch attachments"},500)}});y.post("/api/reports/pdf",async e=>{const{env:t}=e;try{const a=await e.req.json(),{company_id:r,date_from:s,date_to:o,status:i,currency:l,user_id:c,expense_type_id:d,format:p="detailed"}=a;let m=`
      SELECT e.*, c.name as company_name, c.country, c.logo_url, c.primary_currency,
             u.name as user_name, et.name as expense_type_name, et.category,
             COUNT(a.id) as attachments_count
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      JOIN expense_types et ON e.expense_type_id = et.id
      LEFT JOIN attachments a ON e.id = a.expense_id
      WHERE 1=1
    `;const f=[];r&&(m+=" AND e.company_id = ?",f.push(r)),s&&(m+=" AND e.expense_date >= ?",f.push(s)),o&&(m+=" AND e.expense_date <= ?",f.push(o)),i&&(m+=" AND e.status = ?",f.push(i)),l&&(m+=" AND e.currency = ?",f.push(l)),c&&(m+=" AND e.user_id = ?",f.push(c)),d&&(m+=" AND e.expense_type_id = ?",f.push(d)),m+=" GROUP BY e.id ORDER BY e.expense_date DESC, e.created_at DESC";const x=await t.DB.prepare(m).bind(...f).all();let g=null;r&&(g=await t.DB.prepare("SELECT * FROM companies WHERE id = ?").bind(r).first());const b=Zn(x.results,g,p,{date_from:s,date_to:o,status:i,currency:l});return e.json({success:!0,html_content:b,total_expenses:x.results.length,total_amount:x.results.reduce((v,T)=>v+parseFloat(T.amount_mxn||0),0),filters:{company_id:r,date_from:s,date_to:o,status:i,currency:l,user_id:c,expense_type_id:d},message:"PDF content generated successfully"})}catch(a){return e.json({error:"Failed to generate PDF report",details:a.message},500)}});y.post("/api/reports/excel",async e=>{const{env:t}=e;try{const r=await e.req.json();let s=`
      SELECT e.id, e.description, e.expense_date, e.amount, e.currency, e.exchange_rate, 
             e.amount_mxn, e.payment_method, e.vendor, e.invoice_number, e.status, e.notes,
             e.is_billable, e.created_at,
             c.name as company_name, c.country, c.primary_currency,
             u.name as user_name, u.email as user_email,
             et.name as expense_type_name, et.category
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      JOIN expense_types et ON e.expense_type_id = et.id
      WHERE 1=1
    `;const o=[];r.company_id&&(s+=" AND e.company_id = ?",o.push(r.company_id)),r.date_from&&(s+=" AND e.expense_date >= ?",o.push(r.date_from)),r.date_to&&(s+=" AND e.expense_date <= ?",o.push(r.date_to)),r.status&&(s+=" AND e.status = ?",o.push(r.status)),s+=" ORDER BY e.expense_date DESC";const i=await t.DB.prepare(s).bind(...o).all();return e.json({success:!0,data:i.results,total_records:i.results.length,total_amount_mxn:i.results.reduce((l,c)=>l+parseFloat(c.amount_mxn||0),0),export_date:new Date().toISOString(),filters:r})}catch(a){return e.json({error:"Failed to generate Excel export",details:a.message},500)}});y.post("/api/import/excel",async e=>{const{env:t}=e;try{const a=await e.req.json(),{data:r,mappings:s,company_id:o,user_id:i=1}=a;if(!r||!Array.isArray(r)||!s)return e.json({error:"Data and column mappings are required"},400);const l={total:r.length,imported:0,errors:[],skipped:0};for(let c=0;c<r.length;c++){const d=r[c];try{const p={company_id:o||Z(d,s.company_id),expense_type_id:Z(d,s.expense_type_id)||10,description:Z(d,s.description)||"Importado desde Excel",expense_date:Z(d,s.expense_date)||new Date().toISOString().split("T")[0],amount:parseFloat(Z(d,s.amount))||0,currency:Z(d,s.currency)||"MXN",payment_method:Z(d,s.payment_method)||"cash",vendor:Z(d,s.vendor)||"",notes:Z(d,s.notes)||"Importado desde Excel",status:"pending",user_id:i,created_by:i};let m=1,f=p.amount;p.currency==="USD"?(m=18.25,f=p.amount*m):p.currency==="EUR"&&(m=20.15,f=p.amount*m);const x=await t.DB.prepare(`
          INSERT INTO expenses (
            company_id, user_id, expense_type_id, description, expense_date, 
            amount, currency, exchange_rate, amount_mxn, payment_method, 
            vendor, notes, status, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(p.company_id,p.user_id,p.expense_type_id,p.description,p.expense_date,p.amount,p.currency,m,f,p.payment_method,p.vendor,p.notes,p.status,p.created_by).run();l.imported++}catch(p){l.errors.push({row:c+1,error:p.message,data:d})}}return e.json({success:!0,results:l,message:`Importación completada: ${l.imported} gastos importados, ${l.errors.length} errores`})}catch(a){return e.json({error:"Failed to import Excel data",details:a.message},500)}});y.get("/api/users",async e=>{const{env:t}=e;try{const a=await t.DB.prepare(`
      SELECT id, email, name, role, active, created_at, updated_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all();return e.json({users:a.results})}catch(a){return e.json({error:"Failed to fetch users",details:a.message},500)}});y.get("/api/users/:id",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT id, email, name, role, active, created_at, updated_at, last_login
      FROM users
      WHERE id = ?
    `).bind(a).first();if(!r)return e.json({error:"User not found"},404);const s=await t.DB.prepare(`
      SELECT uc.*, c.name as company_name, c.country
      FROM user_companies uc
      JOIN companies c ON uc.company_id = c.id
      WHERE uc.user_id = ?
    `).bind(a).all();return e.json({...r,company_permissions:s.results})}catch(r){return e.json({error:"Failed to fetch user",details:r.message},500)}});y.post("/api/users",async e=>{const{env:t}=e;try{const a=await e.req.json(),{name:r,email:s,password:o,role:i,active:l,company_permissions:c}=a;if(!r||!s||!o||!i)return e.json({error:"Name, email, password, and role are required"},400);if(await t.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(s).first())return e.json({error:"User with this email already exists"},400);const p=`hash_${o}_${Date.now()}`,f=(await t.DB.prepare(`
      INSERT INTO users (name, email, password_hash, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(r,s,p,i,l).run()).meta.last_row_id;if(c&&Array.isArray(c))for(const x of c)await t.DB.prepare(`
          INSERT INTO user_companies (user_id, company_id, can_view, can_edit, can_admin)
          VALUES (?, ?, ?, ?, ?)
        `).bind(f,x.company_id,x.can_view,x.can_edit,x.can_admin).run();return e.json({id:f,message:"User created successfully"})}catch(a){return e.json({error:"Failed to create user",details:a.message},500)}});y.put("/api/users/:id",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await e.req.json(),{name:s,email:o,password:i,role:l,active:c,company_permissions:d}=r;let p=[],m=[];if(s!==void 0&&(p.push("name = ?"),m.push(s)),o!==void 0&&(p.push("email = ?"),m.push(o)),i&&(p.push("password_hash = ?"),m.push(`hash_${i}_${Date.now()}`)),l!==void 0&&(p.push("role = ?"),m.push(l)),c!==void 0&&(p.push("active = ?"),m.push(c)),p.push("updated_at = CURRENT_TIMESTAMP"),m.push(a),await t.DB.prepare(`
      UPDATE users 
      SET ${p.join(", ")}
      WHERE id = ?
    `).bind(...m).run(),d&&Array.isArray(d)){await t.DB.prepare(`
        DELETE FROM user_companies WHERE user_id = ?
      `).bind(a).run();for(const f of d)await t.DB.prepare(`
          INSERT INTO user_companies (user_id, company_id, can_view, can_edit, can_admin)
          VALUES (?, ?, ?, ?, ?)
        `).bind(a,f.company_id,f.can_view,f.can_edit,f.can_admin).run()}return e.json({message:"User updated successfully"})}catch(r){return e.json({error:"Failed to update user",details:r.message},500)}});y.put("/api/users/:id/status",async e=>{const{env:t}=e,a=e.req.param("id");try{const{active:r}=await e.req.json();return await t.DB.prepare(`
      UPDATE users 
      SET active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(r,a).run(),e.json({message:"User status updated successfully"})}catch(r){return e.json({error:"Failed to update user status",details:r.message},500)}});y.get("/api/employees",async e=>{const{env:t}=e;try{const r=(await t.DB.prepare(`
      SELECT 
        e.id, e.name, e.email, e.phone, e.rfc, e.birthdate, e.address,
        e.company_id, e.position, e.department, e.employee_number, 
        e.hire_date, e.manager_id, e.active, e.created_at,
        c.name as company_name, c.country,
        m.name as manager_name,
        COUNT(ex.id) as expense_count
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN employees m ON e.manager_id = m.id
      LEFT JOIN expenses ex ON ex.user_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `).all()).results.map(s=>({...s,has_expenses:s.expense_count>0}));return e.json({employees:r})}catch(a){return e.json({error:"Failed to fetch employees",details:a.message},500)}});y.get("/api/employees/:id",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT 
        e.*,
        c.name as company_name, c.country,
        m.name as manager_name
      FROM employees e
      LEFT JOIN companies c ON e.company_id = c.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
    `).bind(a).first();return r?e.json(r):e.json({error:"Employee not found"},404)}catch(r){return e.json({error:"Failed to fetch employee",details:r.message},500)}});y.post("/api/employees",async e=>{const{env:t}=e;try{const a=await e.req.json(),{name:r,email:s,phone:o,rfc:i,birthdate:l,address:c,company_id:d,position:p,department:m,employee_number:f,hire_date:x,manager_id:g,active:b}=a;if(!r||!d||!p||!m)return e.json({error:"Name, company, position, and department are required"},400);const v=await t.DB.prepare(`
      INSERT INTO employees (
        name, email, phone, rfc, birthdate, address,
        company_id, position, department, employee_number,
        hire_date, manager_id, active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(r,s,o,i,l,c,d,p,m,f,x,g,b).run();return e.json({id:v.meta.last_row_id,message:"Employee created successfully"})}catch(a){return e.json({error:"Failed to create employee",details:a.message},500)}});y.put("/api/employees/:id",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await e.req.json(),s=["name","email","phone","rfc","birthdate","address","company_id","position","department","employee_number","hire_date","manager_id","active"];let o=[],i=[];return s.forEach(l=>{r[l]!==void 0&&(o.push(`${l} = ?`),i.push(r[l]))}),o.push("updated_at = CURRENT_TIMESTAMP"),i.push(a),await t.DB.prepare(`
      UPDATE employees 
      SET ${o.join(", ")}
      WHERE id = ?
    `).bind(...i).run(),e.json({message:"Employee updated successfully"})}catch(r){return e.json({error:"Failed to update employee",details:r.message},500)}});function Z(e,t){return t&&e[t]||null}function Zn(e,t,a,r){const s=new Date().toLocaleDateString("es-MX"),o=(t==null?void 0:t.name)||"Consolidado Multiempresa",i=(t==null?void 0:t.country)==="MX"?"🇲🇽":(t==null?void 0:t.country)==="ES"?"🇪🇸":"🌍",l=o.substring(0,2).toUpperCase();let c=`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Ejecutivo - ${o}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { box-sizing: border-box; }
            
            body { 
                font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
                color: #e5e7eb;
                line-height: 1.6;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px;
                background: rgba(255, 255, 255, 0.95);
                color: #1f2937;
                min-height: 100vh;
            }
            
            .header { 
                position: relative;
                text-align: center; 
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 50px 40px;
                border-radius: 20px;
                margin-bottom: 40px;
                box-shadow: 0 20px 40px rgba(245, 158, 11, 0.3);
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="60" cy="60" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="20" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                border-radius: 20px;
                pointer-events: none;
            }
            
            .logo-container {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 30px;
            }
            
            .logo { 
                width: 120px; 
                height: 120px; 
                margin: 0 auto;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 30px;
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-size: 36px; 
                font-weight: 700;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                box-shadow: 0 15px 30px rgba(0,0,0,0.3);
                position: relative;
                overflow: hidden;
            }
            
            .logo::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: logoShine 3s infinite;
            }
            
            @keyframes logoShine {
                0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            }
            
            .company-title {
                position: relative;
                z-index: 1;
            }
            
            .company-title h1 { 
                font-size: 48px; 
                font-weight: 700; 
                margin: 0 0 10px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                letter-spacing: -1px;
            }
            
            .company-title h2 { 
                font-size: 24px; 
                font-weight: 500; 
                margin: 0 0 20px 0;
                opacity: 0.9;
                letter-spacing: 0.5px;
            }
            
            .company-info { 
                font-size: 16px; 
                font-weight: 500;
                opacity: 0.8;
                border-top: 1px solid rgba(255,255,255,0.2);
                padding-top: 20px;
                margin-top: 20px;
            }
            
            .filters { 
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
                backdrop-filter: blur(10px);
                border: 1px solid rgba(59, 130, 246, 0.2);
                padding: 30px; 
                border-radius: 20px; 
                margin-bottom: 40px;
                box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
            }
            
            .filters h3 {
                color: #1e40af;
                font-size: 20px;
                font-weight: 600;
                margin: 0 0 20px 0;
            }
            
            .filters p {
                margin: 8px 0;
                font-weight: 500;
            }
            
            .summary { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                gap: 25px; 
                margin-bottom: 40px; 
            }
            
            .summary-card { 
                background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8));
                backdrop-filter: blur(20px);
                padding: 30px; 
                border-radius: 20px; 
                text-align: center; 
                border: 1px solid rgba(156, 163, 175, 0.2);
                box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .summary-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #f59e0b, #d97706, #059669);
            }
            
            .summary-number { 
                font-size: 36px; 
                font-weight: 700; 
                color: #1f2937;
                margin-bottom: 8px;
                font-family: 'Inter', monospace;
            }
            
            .summary-label { 
                font-size: 14px; 
                color: #6b7280; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .table-container {
                background: rgba(255,255,255,0.95);
                border-radius: 20px;
                padding: 0;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
                margin-bottom: 40px;
            }
            
            table { 
                width: 100%; 
                border-collapse: collapse;
            }
            
            th { 
                background: linear-gradient(135deg, #1f2937, #374151); 
                color: white;
                font-weight: 600; 
                padding: 20px 15px;
                text-align: left;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            td { 
                padding: 18px 15px; 
                border-bottom: 1px solid #f3f4f6;
                font-weight: 500;
                font-size: 14px;
            }
            
            tr:nth-child(even) {
                background: rgba(249, 250, 251, 0.5);
            }
            
            tr:hover {
                background: rgba(59, 130, 246, 0.05);
            }
            
            .currency-mxn { color: #059669; font-weight: 600; }
            .currency-usd { color: #3b82f6; font-weight: 600; }
            .currency-eur { color: #8b5cf6; font-weight: 600; }
            
            .status-pending { 
                background: linear-gradient(135deg, #fef3c7, #fde68a); 
                color: #92400e; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .status-approved { 
                background: linear-gradient(135deg, #d1fae5, #a7f3d0); 
                color: #065f46; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .status-rejected { 
                background: linear-gradient(135deg, #fee2e2, #fca5a5); 
                color: #991b1b; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .status-reimbursed { 
                background: linear-gradient(135deg, #dbeafe, #93c5fd); 
                color: #1e40af; 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .footer { 
                text-align: center; 
                margin-top: 60px; 
                padding: 40px;
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                border-radius: 20px;
                border-top: 4px solid #f59e0b;
            }
            
            .footer h3 {
                color: #1f2937;
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 15px;
            }
            
            .footer p {
                font-size: 14px; 
                color: #6b7280; 
                margin: 8px 0;
                font-weight: 500;
            }
            
            .model-4d {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin: 25px 0;
                flex-wrap: wrap;
            }
            
            .model-item {
                text-align: center;
                padding: 15px;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
                border-radius: 15px;
                border: 1px solid rgba(245, 158, 11, 0.2);
                min-width: 120px;
            }
            
            .model-item h4 {
                color: #f59e0b;
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 5px 0;
            }
            
            .model-item p {
                color: #6b7280;
                font-size: 12px;
                margin: 0;
                font-weight: 600;
            }
            
            @media print { 
                body { margin: 0; background: white; } 
                .container { box-shadow: none; }
                .header { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <div class="logo">${l}</div>
                </div>
                <div class="company-title">
                    <h1>${i} ${o}</h1>
                    <h2>Reporte Ejecutivo de Gastos y Viáticos</h2>
                    <p class="company-info">
                        Sistema Lyra Expenses • Análisis Inteligente de Gestión Financiera<br>
                        Generado el ${s} • Formato Premium
                    </p>
                </div>
            </div>
            
            <div class="filters">
                <h3>📊 Parámetros del Análisis</h3>
                <p><strong>Período de Análisis:</strong> ${r.date_from||"Desde el inicio"} - ${r.date_to||"Hasta la fecha actual"}</p>
                ${r.status?`<p><strong>Estado de Gastos:</strong> ${r.status.toUpperCase()}</p>`:""}
                ${r.currency?`<p><strong>Moneda Base:</strong> ${r.currency}</p>`:""}
                <p><strong>Fecha de Generación:</strong> ${s} • <strong>Formato:</strong> ${a.toUpperCase()}</p>
            </div>
        </div>
  `;const d=e.reduce((x,g)=>x+parseFloat(g.amount_mxn||0),0),p=e.length,m=e.filter(x=>x.status==="pending").length,f=e.reduce((x,g)=>(x[g.currency]=(x[g.currency]||0)+parseFloat(g.amount||0),x),{});return c+=`
            <div class="summary">
                <div class="summary-card">
                    <div class="summary-number">${p}</div>
                    <div class="summary-label">Total de Transacciones</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">$${d.toLocaleString("es-MX",{minimumFractionDigits:2})}</div>
                    <div class="summary-label">Volumen Total (MXN)</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${m}</div>
                    <div class="summary-label">Gastos Pendientes</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${Object.keys(f).length}</div>
                    <div class="summary-label">Monedas Operativas</div>
                </div>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Usuario Responsable</th>
                            <th>Categoría</th>
                            <th>Monto Original</th>
                            <th>Equivalente MXN</th>
                            <th>Status</th>
                            <th>Método de Pago</th>
                        </tr>
                    </thead>
                    <tbody>
  `,e.forEach(x=>{c+=`
      <tr>
          <td>${new Date(x.expense_date).toLocaleDateString("es-MX")}</td>
          <td>${x.description}</td>
          <td>${x.user_name}</td>
          <td>${x.expense_type_name}</td>
          <td class="currency-${x.currency.toLowerCase()}">${x.currency} $${parseFloat(x.amount).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
          <td class="currency-mxn">MXN $${parseFloat(x.amount_mxn).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
          <td><span class="status-${x.status}">${Qn(x.status)}</span></td>
          <td>${ei(x.payment_method)}</td>
      </tr>
    `}),c+=`
        </tbody>
    </table>
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <h3>🚀 Sistema Lyra Expenses</h3>
                <p><strong>Plataforma Inteligente de Gestión Financiera Empresarial</strong></p>
                
                <div class="model-4d">
                    <div class="model-item">
                        <h4>Dinero</h4>
                        <p>Control Total</p>
                    </div>
                    <div class="model-item">
                        <h4>Decisión</h4>
                        <p>Análisis Inteligente</p>
                    </div>
                    <div class="model-item">
                        <h4>Dirección</h4>
                        <p>Estrategia Ejecutiva</p>
                    </div>
                    <div class="model-item">
                        <h4>Disciplina</h4>
                        <p>Proceso Optimizado</p>
                    </div>
                </div>
                
                <p><strong>Métricas del Reporte:</strong> ${p} transacciones analizadas • ${Object.keys(f).length} divisas operativas</p>
                <p><strong>Generado:</strong> ${s} • <strong>Modelo:</strong> ${a.toUpperCase()} • <strong>Sistema:</strong> v2.1 Premium</p>
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    Este reporte ha sido generado automáticamente por el sistema Lyra Expenses.<br>
                    Todos los datos están actualizados en tiempo real y han sido validados por nuestros algoritmos de control financiero.
                </p>
            </div>
        </div>
    </body>
    </html>
  `,c}function Qn(e){return{pending:"Pendiente",approved:"Aprobado",rejected:"Rechazado",reimbursed:"Reembolsado",invoiced:"Facturado"}[e]||e}function ei(e){return{cash:"Efectivo",credit_card:"Tarjeta de Crédito",debit_card:"Tarjeta de Débito",bank_transfer:"Transferencia",company_card:"Tarjeta Empresarial",petty_cash:"Caja Chica"}[e]||e}y.get("/setup",e=>e.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Configuración Inicial - LYRA</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 min-h-screen flex items-center justify-center p-4">
        <!-- Setup Container -->
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 backdrop-blur-sm bg-opacity-95">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-4">
                    <i class="fas fa-cogs text-white text-2xl"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800">¡Bienvenido a LYRA!</h1>
                <p class="text-gray-600 mt-2">Configuremos tu acceso a las empresas</p>
            </div>

            <!-- Progress Bar -->
            <div class="mb-8">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Cuenta Creada</span>
                    <span>Configurando Empresas</span>
                    <span>¡Listo!</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full" style="width: 60%"></div>
                </div>
            </div>

            <!-- User Info -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-user text-white"></i>
                    </div>
                    <div>
                        <div id="userName" class="font-semibold text-gray-800">Cargando...</div>
                        <div id="userEmail" class="text-sm text-gray-600">Cargando...</div>
                        <div id="userRole" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">Cargando...</div>
                    </div>
                </div>
            </div>

            <!-- Company Permissions -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    <i class="fas fa-building mr-2"></i>Acceso a Empresas
                </h2>
                <p class="text-gray-600 mb-6">Selecciona a qué empresas necesitas acceso y define tus permisos:</p>
                
                <div id="companiesContainer" class="space-y-4">
                    <div class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                        <p class="text-gray-500">Cargando empresas disponibles...</p>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 justify-between">
                <button onclick="skipSetup()" class="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium">
                    Omitir por ahora
                </button>
                <div class="flex gap-4">
                    <button onclick="goBack()" class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium">
                        <i class="fas fa-arrow-left mr-2"></i>Volver
                    </button>
                    <button onclick="completeSetup()" class="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-medium">
                        <i class="fas fa-check mr-2"></i>Completar Configuración
                    </button>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="/static/login.js"><\/script>
        <script>
            let allCompanies = [];
            let currentUser = null;

            document.addEventListener('DOMContentLoaded', function() {
                // Check if user is logged in
                if (!requireAuth()) return;
                
                // Load user data
                currentUser = getCurrentUser();
                if (currentUser) {
                    document.getElementById('userName').textContent = currentUser.name;
                    document.getElementById('userEmail').textContent = currentUser.email;
                    document.getElementById('userRole').textContent = currentUser.is_cfo ? 'CFO - Director Financiero' : 'Usuario';
                }
                
                // Load companies
                loadCompanies();
            });

            async function loadCompanies() {
                try {
                    const response = await fetch('/api/companies', {
                        headers: getAuthHeader()
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        allCompanies = data.companies || [];
                        displayCompanies();
                    } else {
                        throw new Error('Error cargando empresas');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('companiesContainer').innerHTML = \`
                        <div class="text-center py-8">
                            <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-4"></i>
                            <p class="text-red-600">Error cargando empresas. <button onclick="loadCompanies()" class="text-blue-600 underline">Reintentar</button></p>
                        </div>
                    \`;
                }
            }

            function displayCompanies() {
                const container = document.getElementById('companiesContainer');
                
                if (allCompanies.length === 0) {
                    container.innerHTML = \`
                        <div class="text-center py-8">
                            <i class="fas fa-building text-3xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600">No hay empresas disponibles aún.</p>
                            <button onclick="goToDashboard()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Ir al Dashboard
                            </button>
                        </div>
                    \`;
                    return;
                }

                container.innerHTML = allCompanies.map(company => \`
                    <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">\${company.country === 'MX' ? '🇲🇽' : '🇪🇸'}</span>
                                <div>
                                    <h3 class="font-semibold text-gray-800">\${company.name}</h3>
                                    <p class="text-sm text-gray-600">\${company.primary_currency} • \${company.country}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-gray-500">Empresa \${company.country === 'MX' ? 'Mexicana' : 'Española'}</div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm text-gray-600 mb-3">¿Qué tipo de acceso necesitas?</p>
                            <div class="flex gap-4">
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="company-\${company.id}-view" class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                    👀 <span class="ml-1">Solo Ver</span>
                                </label>
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="company-\${company.id}-edit" class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                    ✏️ <span class="ml-1">Crear/Editar</span>
                                </label>
                                \${currentUser && currentUser.is_cfo ? \`
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="company-\${company.id}-admin" class="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
                                    👑 <span class="ml-1">Administrar</span>
                                </label>
                                \` : ''}
                            </div>
                        </div>
                    </div>
                \`).join('');
            }

            async function completeSetup() {
                // Collect selected permissions
                const permissions = [];
                
                allCompanies.forEach(company => {
                    const canView = document.querySelector(\`input[name="company-\${company.id}-view"]\`)?.checked || false;
                    const canEdit = document.querySelector(\`input[name="company-\${company.id}-edit"]\`)?.checked || false;
                    const canAdmin = document.querySelector(\`input[name="company-\${company.id}-admin"]\`)?.checked || false;
                    
                    if (canView || canEdit || canAdmin) {
                        permissions.push({
                            company_id: company.id,
                            can_view_all: canView || canEdit || canAdmin,
                            can_create: canEdit || canAdmin,
                            can_approve: canAdmin,
                            can_manage_users: canAdmin
                        });
                    }
                });

                if (permissions.length === 0) {
                    alert('Debes seleccionar al menos una empresa y permiso para continuar.');
                    return;
                }

                try {
                    const response = await fetch('/api/user/setup-permissions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getAuthHeader()
                        },
                        body: JSON.stringify({ permissions })
                    });

                    if (response.ok) {
                        alert('¡Configuración completada exitosamente!');
                        goToDashboard();
                    } else {
                        const error = await response.json();
                        throw new Error(error.error || 'Error configurando permisos');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error completando configuración: ' + error.message);
                }
            }

            function skipSetup() {
                if (confirm('¿Estás seguro de omitir la configuración? Podrás configurar el acceso a empresas más tarde desde la sección de Usuarios.')) {
                    goToDashboard();
                }
            }

            function goBack() {
                window.history.back();
            }

            function goToDashboard() {
                window.location.href = '/';
            }
        <\/script>
    </body>
    </html>
  `));y.get("/login",e=>e.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - LYRA</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 min-h-screen flex items-center justify-center p-4">
        <!-- Login Container -->
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 backdrop-blur-sm bg-opacity-95">
            <!-- Logo and Title -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                    <i class="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h1 id="formTitle" class="text-2xl font-bold text-gray-800">Iniciar Sesión - LYRA</h1>
                <p class="text-gray-600 mt-2">Sistema de Gestión de Gastos</p>
            </div>

            <!-- Error Message -->
            <div id="errorMessage" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            </div>

            <!-- Success Message -->
            <div id="successMessage" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            </div>

            <!-- Login Form -->
            <form onsubmit="handleAuth(event)" class="space-y-6">
                <!-- Name Field (hidden by default) -->
                <div id="nameField" style="display: none;">
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-user mr-2"></i>Nombre Completo
                    </label>
                    <input type="text" id="name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200" placeholder="Ingresa tu nombre completo">
                </div>

                <!-- Email Field -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-envelope mr-2"></i>Correo Electrónico
                    </label>
                    <input type="email" id="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200" placeholder="tu@empresa.com">
                </div>

                <!-- Password Field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-lock mr-2"></i>Contraseña
                    </label>
                    <input type="password" id="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200" placeholder="••••••••">
                </div>

                <!-- Submit Button -->
                <button type="submit" id="submitButton" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium">
                    <i class="fas fa-sign-in-alt mr-2"></i>Iniciar Sesión
                </button>
            </form>

            <!-- Toggle Link -->
            <div id="toggleLink" class="text-center mt-6 text-sm text-gray-600">
                ¿No tienes cuenta? <span class="text-blue-600 cursor-pointer hover:text-blue-800" onclick="toggleAuthMode()">Regístrate</span>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 text-xs text-gray-500">
                LYRA © 2024 - Sistema de Gestión de Gastos Empresarial
            </div>
        </div>

        <script src="/static/login.js"><\/script>
    </body>
    </html>
  `));y.get("/",e=>e.html(`<!DOCTYPE html>
<html lang="es">
<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Gastos Premium</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: 1px solid var(--color-glass-border);
            border-radius: var(--radius-md);
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
            background: var(--gradient-gold);
        }
        </style>
    </head>
<body>
    <!-- Authentication Check -->
    <script>
        // Check authentication on page load
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/login';
        } else {
            // Verify token with server
            fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                if (!response.ok) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                }
                return response.json();
            })
            .then(data => {
                if (data.user) {
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                    // Update UI based on user role
                    updateUIForUser(data.user);
                    // Check if user needs setup
                    checkUserSetup();
                }
            })
            .catch(error => {
                console.error('Auth verification error:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            });
        }
        
        function updateUIForUser(user) {
            // Show user info in header
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.innerHTML = \`
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <div class="font-semibold text-white">\${user.name}</div>
                            <div class="text-sm text-gray-300">\${user.is_cfo ? 'CFO' : 'Usuario'}</div>
                        </div>
                        <button onclick="logout()" class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white text-sm">
                            <i class="fas fa-sign-out-alt"></i> Salir
                        </button>
                    </div>
                \`;
            }
        }
        
        function logout() {
            const token = localStorage.getItem('auth_token');
            if (token) {
                fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).finally(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                });
            }
        }
        
        function checkUserSetup() {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            
            fetch('/api/user/needs-setup', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.needsSetup && !data.user.is_cfo) {
                    // Non-CFO users who need setup should go to setup page
                    if (confirm('Necesitas configurar tu acceso a las empresas. ¿Deseas hacerlo ahora?')) {
                        window.location.href = '/setup';
                    }
                }
            })
            .catch(error => {
                console.error('Error checking user setup:', error);
            });
        }
    <\/script>

    <!-- Navigation Header (estilo gastos) -->
    <div class="container mx-auto px-6 py-8">
        <div class="glass-panel p-8 mb-8">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-4xl font-bold text-accent-gold">
                        <i class="fas fa-chart-pie mr-4"></i>
                        Dashboard Analítico - Lyra Expenses
                    </h1>
                    <p class="text-text-secondary text-lg mt-2">
                        Sistema ejecutivo de control financiero empresarial
                    </p>
                </div>
                <div id="userInfo" class="text-white">
                    <!-- User info will be populated by JavaScript -->
                </div>
            </div>
            <div class="flex gap-4 justify-center">
                <a href="/" class="premium-button style="background: var(--gradient-gold);"">
                    <i class="fas fa-chart-pie mr-3"></i>Dashboard
                </a>
                <a href="/companies" class="premium-button ">
                    <i class="fas fa-building mr-3"></i>Empresas
                </a>
                <a href="/users" class="premium-button ">
                    <i class="fas fa-users mr-3"></i>Usuarios
                </a>
                <a href="/employees" class="premium-button ">
                    <i class="fas fa-user-tie mr-3"></i>Empleados
                </a>
                <a href="/expenses" class="premium-button ">
                    <i class="fas fa-receipt mr-3"></i>Gastos
                </a>
            </div>
        </div>
    </div>
    
    <!-- Contenido Principal -->
   
 <div class="container mx-auto px-6 pb-8">
        <!-- Dashboard Content con estilo gastos -->
        <div class="glass-panel p-6 mb-8">
            <h3 class="text-xl font-bold text-accent-gold flex items-center mb-4">
                <i class="fas fa-chart-pie mr-3"></i>
                KPIs Principales
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="glass-panel p-4 text-center">
                    <div id="totalAmount" class="text-3xl font-bold text-accent-gold">Cargando...</div>
                    <div class="text-text-secondary text-sm">Total Gastos (MXN)</div>
                </div>
                <div class="glass-panel p-4 text-center">
                    <div id="totalExpenses" class="text-3xl font-bold text-accent-emerald">-</div>
                    <div class="text-text-secondary text-sm">Total Gastos</div>
                </div>
                <div class="glass-panel p-4 text-center">
                    <div id="pendingExpenses" class="text-3xl font-bold text-accent-gold">-</div>
                    <div class="text-text-secondary text-sm">Pendiente Autorización</div>
                </div>
                <div class="glass-panel p-4 text-center">
                    <div id="approvalRate" class="text-3xl font-bold text-accent-emerald">-</div>
                    <div class="text-text-secondary text-sm">% Aprobación</div>
                </div>
            </div>
        </div>

        <!-- Filtros de Gasto (sidebar style) -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-1">
                <div class="glass-panel p-6">
                    <h3 class="text-xl font-bold text-accent-gold mb-6">
                        <i class="fas fa-filter mr-2"></i>Ficha de Gasto
                    </h3>
                    
                    <div class="space-y-4">
                        <!-- Filtro por Fecha -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">📅 Fecha</label>
                            <div class="flex gap-2">
                                <input type="date" id="filter-date-from" class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm">
                                <input type="date" id="filter-date-to" class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm">
                            </div>
                        </div>

                        <!-- Filtro por Empresa -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">🏢 Empresa</label>
                            <select id="companyFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todas las empresas</option>
                            </select>
                        </div>

                        <!-- Filtro por Usuario -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">👤 Usuario</label>
                            <select id="userFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todos los usuarios</option>
                                <option value="1">👑 Alejandro Rodríguez</option>
                                <option value="2">✏️ María López</option>
                                <option value="3">⭐ Carlos Martínez</option>
                                <option value="4">✏️ Ana García</option>
                                <option value="5">⭐ Pedro Sánchez</option>
                                <option value="6">✏️ Elena Torres</option>
                            </select>
                        </div>

                        <!-- Filtro por Tipo -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">🏷️ Tipo</label>
                            <select id="typeFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todos los tipos</option>
                                <option value="G">💼 Gastos</option>
                                <option value="V">✈️ Viáticos</option>
                            </select>
                        </div>

                        <!-- Filtro por Categoría -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">📂 Categoría</label>
                            <select id="categoryFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todas las categorías</option>
                                <option value="meals">🍽️ Comidas</option>
                                <option value="transport">🚗 Transporte</option>
                                <option value="accommodation">🏨 Hospedaje</option>
                                <option value="travel">✈️ Viajes</option>
                                <option value="supplies">📋 Suministros</option>
                                <option value="services">💻 Servicios</option>
                                <option value="general">📦 General</option>
                            </select>
                        </div>

                        <!-- Filtro por Status -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">📊 Status</label>
                            <select id="statusFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todos los estados</option>
                                <option value="pending">⏳ Pendiente</option>
                                <option value="approved">✅ Aprobado</option>
                                <option value="rejected">❌ Rechazado</option>
                                <option value="more_info">❓ Pedir Más Información</option>
                                <option value="reimbursed">💰 Reembolsado</option>
                                <option value="invoiced">📄 Facturado</option>
                            </select>
                        </div>

                        <!-- Filtro por Moneda -->
                        <div>
                            <label class="block text-sm font-medium text-accent-gold mb-2">💱 Moneda</label>
                            <select id="currencyFilter" class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                                <option value="">Todas las monedas</option>
                                <option value="MXN">🇲🇽 MXN</option>
                                <option value="USD">🇺🇸 USD</option>
                                <option value="EUR">🇪🇺 EUR</option>
                            </select>
                        </div>

                        <button id="applyFilters" class="w-full premium-button">
                            <i class="fas fa-search mr-2"></i>Aplicar Filtros
                        </button>
                        
                        <button id="clearFilters" class="w-full premium-button" style="background: var(--gradient-accent);">
                            <i class="fas fa-broom mr-2"></i>Limpiar Filtros
                        </button>
                    </div></div>
            </div>

            <div class="lg:col-span-3">
                <div class="glass-panel p-6">
                    <h3 class="text-xl font-bold text-accent-gold mb-4">
                        <i class="fas fa-chart-pie mr-3"></i>Distribución por Estado
                    </h3>
                    <div class="h-96 flex items-center justify-center">
                        <canvas id="statusChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <div class="glass-panel p-6 mt-8">
                    <h3 class="text-xl font-bold text-accent-gold mb-4">
                        <i class="fas fa-table mr-3"></i>Tabla de Gastos Recientes
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b border-glass-border">
                                    <th class="text-left py-3 px-4 text-accent-gold">Descripción</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Empresa</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Monto</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Estado</th>
                                    <th class="text-left py-3 px-4 text-accent-gold">Fecha</th>
                                </tr>
                            </thead>
                            <tbody id="recentExpensesTable">
                                <tr>
                                    <td colspan="5" class="py-8 text-center text-text-secondary">
                                        <i class="fas fa-spinner fa-spin mr-2"></i>Cargando gastos recientes...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Botones de Acción Dashboard -->
                    <div class="mt-6 flex gap-4 justify-end">
                        <button onclick="printDashboardExpenses()" class="premium-button" style="background: var(--gradient-accent);">
                            <i class="fas fa-print mr-2"></i>Imprimir Lista
                        </button>
                        <button onclick="generateDashboardPDF()" class="premium-button">
                            <i class="fas fa-file-pdf mr-2"></i>Generar PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal Detalle de Gasto -->
    <div id="expenseDetailModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
        <div class="glass-panel p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold text-accent-gold flex items-center">
                    <i class="fas fa-receipt mr-3"></i>Detalle del Gasto
                </h2>
                <button onclick="closeExpenseModal()" class="text-text-secondary hover:text-accent-gold transition-colors">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <!-- Información Principal del Gasto -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Columna Izquierda -->
                <div class="space-y-6">
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">📋 Información General</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">Descripción</label>
                                <p id="modal-description" class="text-text-primary font-medium text-lg"></p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📅 Fecha</label>
                                    <p id="modal-date" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🏷️ Tipo</label>
                                    <p id="modal-type" class="text-text-primary"></p>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">🏢 Empresa</label>
                                <p id="modal-company" class="text-text-primary font-medium"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">👤 Usuario Responsable</label>
                                <p id="modal-user" class="text-text-primary"></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">💰 Información Financiera</h3>
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">💵 Monto Original</label>
                                    <p id="modal-amount" class="text-accent-emerald font-bold text-xl"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">💱 Moneda</label>
                                    <p id="modal-currency" class="text-text-primary"></p>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">🇲🇽 Equivalente MXN</label>
                                <p id="modal-amount-mxn" class="text-accent-emerald font-bold text-lg"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">💳 Método de Pago</label>
                                <p id="modal-payment-method" class="text-text-primary"></p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Columna Derecha -->
                <div class="space-y-6">
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">🏪 Detalles Comerciales</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">🏪 Proveedor/Lugar</label>
                                <p id="modal-vendor" class="text-text-primary"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">📄 Número de Factura</label>
                                <p id="modal-invoice" class="text-text-primary"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">📂 Categoría</label>
                                <p id="modal-category" class="text-text-primary"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">📊 Estado Actual</label>
                                <p id="modal-status" class="font-bold"></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="glass-panel p-6">
                        <h3 class="text-lg font-semibold text-accent-gold mb-4">📝 Observaciones</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-accent-gold mb-1">Notas</label>
                                <p id="modal-notes" class="text-text-primary text-sm bg-glass p-3 rounded-lg min-h-[60px]"></p>
                            </div>
                            <div class="text-sm">
                                <div>
                                    <label class="block text-xs font-medium text-accent-gold mb-1">Creado</label>
                                    <p id="modal-created" class="text-text-secondary"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Acciones del Gasto -->
            <div class="border-t border-glass-border pt-6">
                <h3 class="text-lg font-semibold text-accent-gold mb-4">⚡ Acciones</h3>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onclick="authorizeExpense()" class="premium-button bg-green-600 hover:bg-green-700">
                        <i class="fas fa-check mr-2"></i>Autorizar
                    </button>
                    <button onclick="rejectExpense()" class="premium-button bg-red-600 hover:bg-red-700">
                        <i class="fas fa-times mr-2"></i>Rechazar
                    </button>
                    <button onclick="requestMoreInfo()" class="premium-button bg-blue-600 hover:bg-blue-700">
                        <i class="fas fa-question-circle mr-2"></i>Pedir Info
                    </button>
                    <button onclick="setPendingExpense()" class="premium-button bg-yellow-600 hover:bg-yellow-700">
                        <i class="fas fa-clock mr-2"></i>Dejar Pendiente
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <script>
        // Variables globales para filtros y gráfica
        let currentFilters = {};
        let statusChart = null;
        
        // Inicializar al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            initializeEventListeners();
            loadCompanies();
            initializeChart();
            loadDashboardData();
        });
        
        // Event listeners para filtros
        function initializeEventListeners() {
            const applyBtn = document.getElementById('applyFilters');
            const clearBtn = document.getElementById('clearFilters');
            
            if (applyBtn) {
                applyBtn.addEventListener('click', applyFilters);
            }
            
            if (clearBtn) {
                clearBtn.addEventListener('click', clearFilters);
            }
        }
        
        // Aplicar filtros
        function applyFilters() {
            const dateFromFilter = document.getElementById('filter-date-from');
            const dateToFilter = document.getElementById('filter-date-to');
            const companyFilter = document.getElementById('companyFilter');
            const userFilter = document.getElementById('userFilter');
            const typeFilter = document.getElementById('typeFilter');
            const categoryFilter = document.getElementById('categoryFilter');
            const statusFilter = document.getElementById('statusFilter');
            const currencyFilter = document.getElementById('currencyFilter');
            
            currentFilters = {
                date_from: dateFromFilter ? dateFromFilter.value : '',
                date_to: dateToFilter ? dateToFilter.value : '',
                company_id: companyFilter ? companyFilter.value : '',
                user_id: userFilter ? userFilter.value : '',
                type: typeFilter ? typeFilter.value : '',
                category: categoryFilter ? categoryFilter.value : '',
                status: statusFilter ? statusFilter.value : '',
                currency: currencyFilter ? currencyFilter.value : ''
            };
            
            console.log('🔍 Aplicando filtros:', currentFilters);
            
            // Mostrar feedback visual
            const applyBtn = document.getElementById('applyFilters');
            if (applyBtn) {
                applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Filtrando...';
                setTimeout(() => {
                    applyBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Aplicar Filtros';
                }, 1000);
            }
            
            loadDashboardData();
        }
        
        // Limpiar filtros
        function clearFilters() {
            const dateFromFilter = document.getElementById('filter-date-from');
            const dateToFilter = document.getElementById('filter-date-to');
            const companyFilter = document.getElementById('companyFilter');
            const userFilter = document.getElementById('userFilter');
            const typeFilter = document.getElementById('typeFilter');
            const categoryFilter = document.getElementById('categoryFilter');
            const statusFilter = document.getElementById('statusFilter');
            const currencyFilter = document.getElementById('currencyFilter');
            
            if (dateFromFilter) dateFromFilter.value = '';
            if (dateToFilter) dateToFilter.value = '';
            if (companyFilter) companyFilter.value = '';
            if (userFilter) userFilter.value = '';
            if (typeFilter) typeFilter.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            if (currencyFilter) currencyFilter.value = '';
            
            currentFilters = {};
            
            console.log('🧹 Filtros limpiados');
            
            // Mostrar feedback visual
            const clearBtn = document.getElementById('clearFilters');
            if (clearBtn) {
                clearBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Limpiando...';
                setTimeout(() => {
                    clearBtn.innerHTML = '<i class="fas fa-broom mr-2"></i>Limpiar Filtros';
                }, 1000);
            }
            
            loadDashboardData();
        }
        
        // Cargar empresas para el filtro
        function loadCompanies() {
            fetch('/api/companies')
                .then(response => response.json())
                .then(data => {
                    const companySelect = document.getElementById('companyFilter');
                    if (companySelect && data.companies) {
                        // Limpiar opciones existentes excepto la primera
                        companySelect.innerHTML = '<option value="">Todas las empresas</option>';
                        
                        data.companies.forEach(company => {
                            const option = document.createElement('option');
                            option.value = company.id;
                            const flag = company.country === 'MX' ? '🇲🇽' : company.country === 'ES' ? '🇪🇸' : '🌍';
                            option.textContent = flag + ' ' + company.name;
                            companySelect.appendChild(option);
                        });
                        
                        console.log('✅ Empresas cargadas en filtro:', data.companies.length);
                    }
                })
                .catch(error => {
                    console.error('❌ Error cargando empresas:', error);
                });
        }
        
        // Cargar datos del dashboard
        function loadDashboardData() {
            console.log('📊 Cargando datos del dashboard con filtros:', currentFilters);
            
            // Construir query string con filtros
            const queryParams = new URLSearchParams();
            Object.keys(currentFilters).forEach(key => {
                if (currentFilters[key]) {
                    queryParams.append(key, currentFilters[key]);
                }
            });
            
            // Cargar métricas del dashboard
            fetch('/api/dashboard/metrics?' + queryParams.toString())
                .then(response => response.json())
                .then(metrics => {
                    updateDashboardMetrics(metrics);
                })
                .catch(error => {
                    console.error('❌ Error cargando métricas:', error);
                });
                
            // Cargar gastos recientes
            fetch('/api/expenses?' + queryParams.toString())
                .then(response => response.json())
                .then(expenses => {
                    updateExpensesTable(expenses);
                })
                .catch(error => {
                    console.error('❌ Error cargando gastos:', error);
                });
        }
        
        // Actualizar métricas en el dashboard
        function updateDashboardMetrics(data) {
            console.log('📊 Datos recibidos para métricas:', data);
            
            // Calcular total en MXN de todos los gastos
            let totalAmountMxn = 0;
            let totalExpenses = 0;
            let pendingCount = 0;
            let approvedCount = 0;
            
            if (data.status_metrics && data.status_metrics.length > 0) {
                data.status_metrics.forEach(status => {
                    totalAmountMxn += parseFloat(status.total_mxn || 0);
                    totalExpenses += parseInt(status.count || 0);
                    
                    if (status.status === 'pending') {
                        pendingCount += parseInt(status.count || 0);
                    }
                    if (status.status === 'approved') {
                        approvedCount += parseInt(status.count || 0);
                    }
                });
            }
            
            // Calcular porcentaje de aprobación
            const approvalRate = totalExpenses > 0 ? Math.round((approvedCount / totalExpenses) * 100) : 0;
            
            // Actualizar elementos del DOM
            const totalAmountEl = document.getElementById('totalAmount');
            const totalExpensesEl = document.getElementById('totalExpenses');
            const pendingExpensesEl = document.getElementById('pendingExpenses');
            const approvalRateEl = document.getElementById('approvalRate');
            
            if (totalAmountEl) {
                totalAmountEl.textContent = '$' + totalAmountMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 });
            }
            
            if (totalExpensesEl) {
                totalExpensesEl.textContent = totalExpenses;
            }
            
            if (pendingExpensesEl) {
                pendingExpensesEl.textContent = pendingCount;
            }
            
            if (approvalRateEl) {
                approvalRateEl.textContent = approvalRate + '%';
            }
            
            // Actualizar también la gráfica de pie
            updateChart(data);
            
            console.log('✅ KPIs actualizados:', {
                totalAmountMxn,
                totalExpenses,
                pendingCount,
                approvalRate
            });
        }
        
        // Actualizar tabla de gastos
        function updateExpensesTable(data) {
            const tableBody = document.getElementById('recentExpensesTable');
            if (!tableBody) {
                console.error('❌ No se encontró el elemento recentExpensesTable');
                return;
            }
            
            const expenses = data.expenses || [];
            
            if (expenses.length === 0) {
                tableBody.innerHTML = 
                    '<tr>' +
                        '<td colspan="5" class="py-8 text-center text-text-secondary">' +
                            '<i class="fas fa-info-circle mr-2"></i>' +
                            'No se encontraron gastos con los filtros aplicados' +
                        '</td>' +
                    '</tr>';
                return;
            }
            
            // Generar filas de la tabla (limitar a 10 gastos recientes)
            const rows = expenses.slice(0, 10).map((expense, index) => 
                '<tr class="border-b border-glass-border hover:bg-glass transition-colors cursor-pointer" onclick="openExpenseModal(' + 
                    "expenseData[" + index + "]" + ')">' +
                    '<td class="py-3 px-4 text-text-primary">' + (expense.description || 'Sin descripción') + '</td>' +
                    '<td class="py-3 px-4 text-text-secondary">' + 
                        (expense.company_name || 'N/A') + 
                        (expense.country ? ' ' + (expense.country === 'MX' ? '🇲🇽' : expense.country === 'ES' ? '🇪🇸' : '') : '') +
                    '</td>' +
                    '<td class="py-3 px-4 text-accent-emerald font-bold">$' +
                        parseFloat(expense.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) + 
                        ' ' + (expense.currency || 'MXN') +
                    '</td>' +
                    '<td class="py-3 px-4">' +
                        '<span class="status-badge status-' + expense.status + '">' +
                            getStatusIcon(expense.status) + ' ' + getStatusText(expense.status) +
                        '</span>' +
                    '</td>' +
                    '<td class="py-3 px-4 text-text-secondary">' +
                        new Date(expense.expense_date || expense.created_at).toLocaleDateString('es-ES') +
                    '</td>' +
                '</tr>'
            ).join('');
            
            tableBody.innerHTML = rows;
            
            // Hacer los datos disponibles globalmente para el modal
            window.expenseData = expenses.slice(0, 10);
            
            console.log('✅ Tabla actualizada con', expenses.length, 'gastos (mostrando max 10)');
        }
        
        // Helper functions para estados
        function getStatusClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'approved': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800',
                'reimbursed': 'bg-blue-100 text-blue-800',
                'more_info': 'bg-purple-100 text-purple-800',
                'invoiced': 'bg-indigo-100 text-indigo-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function getStatusText(status) {
            const texts = {
                'pending': 'Pendiente',
                'approved': 'Aprobado', 
                'rejected': 'Rechazado',
                'reimbursed': 'Reembolsado',
                'more_info': 'Pedir Más Info',
                'invoiced': 'Facturado'
            };
            return texts[status] || status;
        }
        
        // Función para íconos de estatus (igual que en sección Gastos)
        function getStatusIcon(status) {
            const icons = {
                'pending': '⏳',
                'approved': '✅',
                'rejected': '❌',
                'more_info': '❓',
                'reimbursed': '💰',
                'invoiced': '📄'
            };
            return icons[status] || '📋';
        }
        
        // Inicializar gráfica de pie
        function initializeChart() {
            const ctx = document.getElementById('statusChart');
            if (!ctx) {
                console.error('❌ No se encontró el canvas para la gráfica');
                return;
            }
            
            statusChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Cargando...'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#e5e7eb'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return label + ': ' + value + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfica de pie inicializada');
        }
        
        // Actualizar gráfica de pie con datos reales
        function updateChart(data) {
            if (!statusChart || !data.status_metrics) {
                console.log('⚠️ Gráfica o datos no disponibles');
                return;
            }
            
            const statusData = data.status_metrics;
            const labels = [];
            const values = [];
            const colors = [];
            
            const statusConfig = {
                'pending': { 
                    label: '⏳ Pendiente', 
                    color: '#f59e0b' 
                },
                'approved': { 
                    label: '✅ Aprobado', 
                    color: '#10b981' 
                },
                'rejected': { 
                    label: '❌ Rechazado', 
                    color: '#ef4444' 
                },
                'reimbursed': { 
                    label: '💰 Reembolsado', 
                    color: '#3b82f6' 
                },
                'invoiced': { 
                    label: '📄 Facturado', 
                    color: '#8b5cf6' 
                }
            };
            
            statusData.forEach(status => {
                const config = statusConfig[status.status] || { 
                    label: status.status, 
                    color: '#6b7280' 
                };
                labels.push(config.label);
                values.push(status.count);
                colors.push(config.color);
            });
            
            // Actualizar datos de la gráfica
            statusChart.data.labels = labels;
            statusChart.data.datasets[0].data = values;
            statusChart.data.datasets[0].backgroundColor = colors;
            
            // Animar la actualización
            statusChart.update('active');
            
            console.log('📊 Gráfica actualizada:', { labels, values });
        }
        
        // Funciones de Impresión y PDF
        function printDashboardExpenses() {
            const printContent = document.querySelector('#recentExpensesTable').parentElement;
            const originalContent = document.body.innerHTML;
            
            const printWindow = window.open('', '_blank');
            const htmlContent = 
                '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                    '<title>Gastos Recientes - Dashboard</title>' +
                    '<style>' +
                        'body { font-family: Arial, sans-serif; margin: 20px; }' +
                        'table { width: 100%; border-collapse: collapse; margin-top: 20px; }' +
                        'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }' +
                        'th { background-color: #f4f4f4; font-weight: bold; }' +
                        '.header { text-align: center; margin-bottom: 30px; }' +
                        '.date { color: #666; }' +
                    '</style>' +
                '</head>' +
                '<body>' +
                    '<div class="header">' +
                        '<h1>📊 Gastos Recientes - Dashboard</h1>' +
                        '<p class="date">Generado el: ' + new Date().toLocaleDateString('es-ES') + ' a las ' + new Date().toLocaleTimeString('es-ES') + '</p>' +
                    '</div>' +
                    printContent.outerHTML +
                '</body>' +
                '</html>';
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }
        
        function generateDashboardPDF() {
            const queryParams = new URLSearchParams(currentFilters).toString();
            
            fetch('/api/reports/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...currentFilters,
                    format: 'dashboard_summary',
                    title: 'Reporte Dashboard - Gastos Recientes'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Crear y descargar PDF
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(data.html_content);
                    printWindow.document.close();
                    printWindow.print();
                    printWindow.close();
                    
                    console.log('✅ PDF generado exitosamente');
                } else {
                    alert('Error al generar PDF: ' + (data.error || 'Error desconocido'));
                }
            })
            .catch(error => {
                console.error('❌ Error generando PDF:', error);
                alert('Error al generar el PDF. Por favor intente nuevamente.');
            });
        }
        
        // Variables para el modal
        let currentExpenseId = null;
        
        // Funciones del Modal de Detalle
        function openExpenseModal(expense) {
            currentExpenseId = expense.id;
            
            // Llenar información general
            document.getElementById('modal-description').textContent = expense.description || 'Sin descripción';
            document.getElementById('modal-date').textContent = new Date(expense.expense_date).toLocaleDateString('es-ES');
            document.getElementById('modal-type').textContent = expense.expense_type_name || 'No especificado';
            document.getElementById('modal-company').textContent = (expense.country === 'MX' ? '🇲🇽 ' : '🇪🇸 ') + (expense.company_name || 'Sin empresa');
            document.getElementById('modal-user').textContent = expense.user_name || 'Usuario desconocido';
            
            // Llenar información financiera
            document.getElementById('modal-amount').textContent = '$' + parseFloat(expense.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
            document.getElementById('modal-currency').textContent = expense.currency || 'MXN';
            document.getElementById('modal-amount-mxn').textContent = '$' + parseFloat(expense.amount_mxn || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) + ' MXN';
            document.getElementById('modal-payment-method').textContent = getPaymentMethodText(expense.payment_method);
            
            // Llenar detalles comerciales
            document.getElementById('modal-vendor').textContent = expense.vendor || 'No especificado';
            document.getElementById('modal-invoice').textContent = expense.invoice_number || 'Sin número';
            document.getElementById('modal-category').textContent = getCategoryText(expense.expense_type_name);
            
            const statusElement = document.getElementById('modal-status');
            statusElement.textContent = getStatusText(expense.status);
            statusElement.className = 'font-bold ' + getStatusColorClass(expense.status);
            
            // Llenar observaciones
            document.getElementById('modal-notes').textContent = expense.description || 'Sin descripción disponible';
            document.getElementById('modal-created').textContent = new Date(expense.created_at).toLocaleDateString('es-ES');
            
            // Mostrar modal
            document.getElementById('expenseDetailModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            console.log('📋 Modal abierto para gasto ID:', expense.id);
        }
        
        function closeExpenseModal() {
            document.getElementById('expenseDetailModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            currentExpenseId = null;
        }
        
        // Función para formatear las notas GUSBit de manera legible
        function formatGusbitNotes(notes) {
            if (!notes || (!notes.includes('REGISTRO GUSBIT NUEVO ORDEN') && !notes.includes('REGISTRO GUSBIT COMPLETO'))) {
                return '<div class="text-text-secondary italic">Sin información detallada de registro GUSBit disponible</div>';
            }
            
            // Extraer la información línea por línea
            const lines = notes.split('\\n').filter(line => line.trim() !== '' && !line.includes('═══'));
            
            let formattedHtml = '<div class="space-y-3">';
            formattedHtml += '<div class="text-accent-gold font-semibold mb-3">📋 Información Completa del Registro GUSBit:</div>';
            
            lines.forEach((line, index) => {
                if (index === 0) return; // Skip the header line
                
                const cleanLine = line.trim();
                if (cleanLine && cleanLine.includes(':')) {
                    const [label, value] = cleanLine.split(':', 2);
                    const fieldNumber = label.match(/^\\d+\\./);
                    
                    if (fieldNumber) {
                        const fieldName = label.replace(/^\\d+\\.\\s*/, '').trim();
                        const fieldValue = value.trim();
                        
                        formattedHtml += \`
                            <div class="flex justify-between items-center py-2 px-3 bg-glass rounded-lg">
                                <span class="text-accent-gold text-sm font-medium">\${getFieldIcon(fieldName)} \${fieldName}:</span>
                                <span class="text-text-primary font-semibold">\${fieldValue}</span>
                            </div>
                        \`;
                    }
                }
            });
            
            formattedHtml += '</div>';
            return formattedHtml;
        }
        
        // Función helper para obtener iconos por campo
        function getFieldIcon(fieldName) {
            const icons = {
                'Fecha': '📅',
                'Empresa': '🏢',
                'Usuario': '👤',
                'Tipo': '🏷️',
                'Categoría': '📂',
                'Destino': '🎯',
                'Lugar/Negocio': '📍',
                'Lugar': '📍',
                'Descripción': '📝',
                'Monto': '💰',
                'Moneda': '💱',
                'Forma de Pago': '💳',
                'Quién lo Capturó': '👨‍💻',
                'Status': '📊'
            };
            
            // Buscar coincidencia exacta o parcial
            for (const [key, icon] of Object.entries(icons)) {
                if (fieldName.includes(key) || key.includes(fieldName)) {
                    return icon;
                }
            }
            
            return '📋'; // Icono por defecto
        }
        
        // Funciones de acciones del gasto
        function authorizeExpense() {
            updateExpenseStatus('approved', '✅ Gasto autorizado exitosamente');
        }
        
        function rejectExpense() {
            updateExpenseStatus('rejected', '❌ Gasto rechazado');
        }
        
        function requestMoreInfo() {
            updateExpenseStatus('more_info', '❓ Se solicitó más información');
        }
        
        function setPendingExpense() {
            updateExpenseStatus('pending', '⏳ Gasto marcado como pendiente');
        }
        
        function updateExpenseStatus(newStatus, message) {
            if (!currentExpenseId) return;
            
            fetch('/api/expenses/' + currentExpenseId + '/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(message);
                    closeExpenseModal();
                    loadDashboardData(); // Recargar datos
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar el estado'));
                }
            })
            .catch(error => {
                console.error('❌ Error actualizando estado:', error);
                alert('Error de conexión. Intente nuevamente.');
            });
        }
        
        // Helper functions para el modal
        function getPaymentMethodText(method) {
            const methods = {
                'cash': '💵 Efectivo',
                'credit_card': '💳 Tarjeta de Crédito',
                'debit_card': '💳 Tarjeta de Débito',
                'bank_transfer': '🏦 Transferencia',
                'company_card': '🏢 Tarjeta Empresa',
                'petty_cash': '💰 Caja Chica'
            };
            return methods[method] || method || 'No especificado';
        }
        
        function getCategoryText(typeName) {
            // Mapear tipos de gastos a categorías más amigables
            const categories = {
                'Comidas de Trabajo': '🍽️ Alimentación',
                'Transporte Terrestre': '🚗 Transporte',
                'Hospedaje': '🏨 Alojamiento',
                'Vuelos': '✈️ Viajes Aéreos',
                'Material de Oficina': '📋 Suministros',
                'Software y Licencias': '💻 Tecnología',
                'Capacitación': '📚 Formación'
            };
            return categories[typeName] || typeName || 'General';
        }
        
        function getStatusColorClass(status) {
            const colors = {
                'pending': 'text-yellow-600',
                'approved': 'text-green-600',
                'rejected': 'text-red-600',
                'reimbursed': 'text-blue-600',
                'invoiced': 'text-purple-600'
            };
            return colors[status] || 'text-gray-600';
        }
    <\/script>
    </body>
</html>`));y.get("/companies",e=>e.html(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Empresas Premium</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css" rel="stylesheet">
    <style>
    body {
        background: linear-gradient(135deg, 
            var(--color-bg-primary) 0%, 
            var(--color-bg-secondary) 50%, 
            var(--color-bg-tertiary) 100%);
        min-height: 100vh;
        color: var(--color-text-primary);
    }
    
    .premium-button {
        background: var(--gradient-emerald);
        border: 1px solid var(--color-glass-border);
        border-radius: var(--radius-md);
        padding: 12px 24px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
    }
    
    .premium-button:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow);
        background: var(--gradient-gold);
    }
    </style>
</head>
<body>
    <!-- Navigation Header -->
    <div class="container mx-auto px-6 py-8">
        <div class="glass-panel p-8 mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-4xl font-bold text-accent-gold">
                        <i class="fas fa-building mr-4"></i>
                        Gestión de Empresas Premium
                    </h1>
                    <p class="text-text-secondary text-lg mt-2">
                        Sistema ejecutivo de control corporativo empresarial
                    </p>
                </div>
                <div class="flex gap-4">
                    <a href="/" class="premium-button">
                        <i class="fas fa-chart-pie mr-3"></i>Dashboard
                    </a>
                    <a href="/companies" class="premium-button" style="background: var(--gradient-gold);">
                        <i class="fas fa-building mr-3"></i>Empresas
                    </a>
                    <a href="/users" class="premium-button">
                        <i class="fas fa-users mr-3"></i>Usuarios
                    </a>
                    <a href="/employees" class="premium-button">
                        <i class="fas fa-user-tie mr-3"></i>Empleados
                    </a>
                    <a href="/expenses" class="premium-button">
                        <i class="fas fa-receipt mr-3"></i>Gastos
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 pb-8">
        <!-- Header with Add Button -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h2 class="text-3xl font-bold text-accent-gold mb-2">
                    <i class="fas fa-building-columns mr-3"></i>
                    Portfolio Corporativo
                </h2>
                <p class="text-text-secondary">Gestión multiempresa internacional • MX + ES + US + CA</p>
            </div>
            <button onclick="showAddCompanyModal()" class="premium-button">
                <i class="fas fa-plus mr-3"></i>Nueva Empresa
            </button>
        </div>

        <!-- Company Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-emerald mb-2" id="total-companies">0</div>
                <div class="text-sm text-text-secondary">Empresas Activas</div>
            </div>
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-gold mb-2" id="total-employees">0</div>
                <div class="text-sm text-text-secondary">Empleados Totales</div>
            </div>
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-sapphire mb-2" id="countries-count">0</div>
                <div class="text-sm text-text-secondary">Países</div>
            </div>
            <div class="glass-panel p-6 text-center">
                <div class="text-2xl font-bold text-accent-emerald mb-2" id="currencies-count">0</div>
                <div class="text-sm text-text-secondary">Monedas</div>
            </div>
        </div>

        <!-- Companies Grid -->
        <div id="companies-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Companies will be loaded here dynamically -->
            <div class="col-span-full text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-accent-gold mb-4"></i>
                <p class="text-text-secondary">Cargando empresas...</p>
            </div>
        </div>
    </div>

    <!-- Modal - Agregar/Editar Empresa -->
    <div id="company-modal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="p-8">
                <!-- Modal Header -->
                <div class="flex justify-between items-center mb-8">
                    <h2 id="modal-title" class="text-3xl font-bold text-accent-gold">
                        <i class="fas fa-building mr-3"></i>Nueva Empresa
                    </h2>
                    <button onclick="closeCompanyModal()" class="text-text-secondary hover:text-accent-gold transition-colors text-2xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Company Form -->
                <form id="company-form" onsubmit="saveCompany(event)" class="space-y-8">
                    
                    <!-- Sección 1: Información Básica -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-info-circle mr-3"></i>Información Básica
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-building mr-2"></i>Razón Social *
                                </label>
                                <input type="text" id="razon-social" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: TechMX Solutions S.A. de C.V.">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-tag mr-2"></i>Nombre Comercial *
                                </label>
                                <input type="text" id="commercial-name" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: TechMX">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-globe mr-2"></i>País *
                                </label>
                                <select id="country" required onchange="updateCountryFields()"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent">
                                    <option value="">Seleccionar país...</option>
                                    <option value="MX">🇲🇽 México</option>
                                    <option value="ES">🇪🇸 España</option>
                                    <option value="US">🇺🇸 Estados Unidos</option>
                                    <option value="CA">🇨🇦 Canadá</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-id-card mr-2"></i><span id="tax-id-label">RFC/NIF *</span>
                                </label>
                                <input type="text" id="tax-id" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="RFC, NIF, EIN, BN">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-money-bill-wave mr-2"></i>Moneda Principal *
                                </label>
                                <select id="primary-currency" required
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent">
                                    <option value="">Seleccionar moneda...</option>
                                    <option value="MXN">💲 Peso Mexicano (MXN)</option>
                                    <option value="EUR">💶 Euro (EUR)</option>
                                    <option value="USD">💵 Dólar USD</option>
                                    <option value="CAD">💴 Dólar Canadiense (CAD)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-users mr-2"></i>Número de Empleados
                                </label>
                                <input type="number" id="employees-count" min="1"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: 25">
                            </div>
                        </div>
                    </div>

                    <!-- Sección 2: Información Comercial -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-sapphire mb-6 flex items-center">
                            <i class="fas fa-briefcase mr-3"></i>Información Comercial
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-industry mr-2"></i>Giro Empresarial
                                </label>
                                <select id="business-category"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-sapphire focus:border-transparent">
                                    <option value="">Seleccionar giro...</option>
                                    <option value="technology">💻 Tecnología</option>
                                    <option value="consulting">📊 Consultoría</option>
                                    <option value="finance">💰 Financiero</option>
                                    <option value="healthcare">🏥 Salud</option>
                                    <option value="education">🎓 Educación</option>
                                    <option value="retail">🏪 Comercio</option>
                                    <option value="manufacturing">🏭 Manufactura</option>
                                    <option value="services">🔧 Servicios</option>
                                    <option value="other">📁 Otros</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-globe-americas mr-2"></i>Sitio Web
                                </label>
                                <input type="url" id="website"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-sapphire focus:border-transparent"
                                    placeholder="https://www.empresa.com">
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-file-alt mr-2"></i>Descripción del Negocio
                            </label>
                            <textarea id="business-description" rows="3"
                                class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-sapphire focus:border-transparent resize-none"
                                placeholder="Breve descripción de la actividad comercial de la empresa..."></textarea>
                        </div>
                    </div>

                    <!-- Sección 3: Dirección Fiscal -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-gold mb-6 flex items-center">
                            <i class="fas fa-map-marker-alt mr-3"></i>Dirección Fiscal
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-road mr-2"></i>Calle y Número
                                </label>
                                <input type="text" id="address-street"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: Av. Insurgentes Sur 1234, Col. Del Valle">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-city mr-2"></i>Ciudad
                                </label>
                                <input type="text" id="address-city"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: Ciudad de México">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-map mr-2"></i><span id="state-label">Estado/Provincia</span>
                                </label>
                                <input type="text" id="address-state"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: CDMX, Madrid, California">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-mail-bulk mr-2"></i><span id="postal-code-label">Código Postal</span>
                                </label>
                                <input type="text" id="address-postal"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: 03100, 28001, 90210">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-phone mr-2"></i>Teléfono Principal
                                </label>
                                <input type="tel" id="phone"
                                    class="w-full p-3 bg-glass border border-glass-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                                    placeholder="Ej: +52 555 123 4567">
                            </div>
                        </div>
                    </div>

                    <!-- Sección 4: Branding Corporativo -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-palette mr-3"></i>Branding Corporativo
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Logo Upload -->
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-image mr-2"></i>Logo Corporativo
                                </label>
                                <div id="logo-dropzone" class="border-2 border-dashed border-glass-border rounded-lg p-6 text-center cursor-pointer hover:border-accent-emerald transition-colors bg-glass">
                                    <div id="logo-preview" class="hidden">
                                        <img id="logo-img" src="" alt="Logo preview" class="max-h-20 mx-auto mb-2">
                                        <p class="text-sm text-text-secondary">Click para cambiar</p>
                                    </div>
                                    <div id="logo-placeholder">
                                        <i class="fas fa-cloud-upload-alt text-3xl text-accent-emerald mb-2"></i>
                                        <p class="text-text-primary font-medium">Arrastra tu logo aquí</p>
                                        <p class="text-sm text-text-secondary">PNG, JPG, SVG hasta 5MB</p>
                                    </div>
                                    <input type="file" id="logo-file" accept="image/*" class="hidden">
                                </div>
                            </div>
                            
                            <!-- Color Corporativo -->
                            <div>
                                <label class="block text-sm font-medium text-text-primary mb-2">
                                    <i class="fas fa-fill-drip mr-2"></i>Color Corporativo
                                </label>
                                <div class="space-y-4">
                                    <input type="color" id="brand-color" value="#D4AF37"
                                        class="w-full h-12 bg-glass border border-glass-border rounded-lg cursor-pointer">
                                    <div class="grid grid-cols-6 gap-2">
                                        <button type="button" onclick="setBrandColor('#D4AF37')" class="w-8 h-8 rounded-full bg-yellow-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#10B981')" class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#3B82F6')" class="w-8 h-8 rounded-full bg-blue-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#8B5CF6')" class="w-8 h-8 rounded-full bg-purple-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#EF4444')" class="w-8 h-8 rounded-full bg-red-500 border-2 border-transparent hover:border-white"></button>
                                        <button type="button" onclick="setBrandColor('#F59E0B')" class="w-8 h-8 rounded-full bg-amber-500 border-2 border-transparent hover:border-white"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-4 pt-6">
                        <button type="button" onclick="closeCompanyModal()" 
                            class="px-6 py-3 border border-glass-border rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" 
                            class="premium-button">
                            <i class="fas fa-save mr-2"></i>Guardar Empresa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
          
            <!-- TechMX Solutions -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/1'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇲🇽</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">TechMX Solutions</h3>
                            <p class="text-sm text-text-secondary">Tecnología • México</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">MXN Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">24</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">$485K</div>
                        <div class="text-xs text-text-secondary">Gastos MXN</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Innovación Digital MX -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/2'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇲🇽</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Innovación Digital MX</h3>
                            <p class="text-sm text-text-secondary">Digital • México</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">MXN Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">18</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">$325K</div>
                        <div class="text-xs text-text-secondary">Gastos MXN</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Consultoría Estratégica MX -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/3'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇲🇽</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Consultoría Estratégica MX</h3>
                            <p class="text-sm text-text-secondary">Consultoría • México</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">MXN Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">12</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">$195K</div>
                        <div class="text-xs text-text-secondary">Gastos MXN</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- TechES Barcelona -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/4'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇪🇸</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">TechES Barcelona</h3>
                            <p class="text-sm text-text-secondary">Tecnología • España</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">EUR Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">32</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">€85K</div>
                        <div class="text-xs text-text-secondary">Gastos EUR</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Innovación Madrid SL -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/5'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇪🇸</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Innovación Madrid SL</h3>
                            <p class="text-sm text-text-secondary">Innovación • España</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">EUR Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">28</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">€72K</div>
                        <div class="text-xs text-text-secondary">Gastos EUR</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

            <!-- Digital Valencia S.A. -->
            <div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer" onclick="window.location.href='/company/6'">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">
                            <span class="text-3xl">🇪🇸</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">Digital Valencia S.A.</h3>
                            <p class="text-sm text-text-secondary">Digital • España</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="premium-badge mb-2">
                            <i class="fas fa-check-circle mr-1"></i>
                            Activa
                        </div>
                        <p class="text-xs text-text-secondary">EUR Principal</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-emerald">22</div>
                        <div class="text-xs text-text-secondary">Empleados</div>
                    </div>
                    <div class="text-center p-3 bg-glass rounded-lg">
                        <div class="text-2xl font-bold text-accent-gold">€58K</div>
                        <div class="text-xs text-text-secondary">Gastos EUR</div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-glass-border">
                    <span class="text-sm text-text-secondary">Ver dashboard completo</span>
                    <i class="fas fa-arrow-right text-accent-gold group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>

    
    <!-- JavaScript -->
    <script>
        let companies = [];
        let currentEditingCompany = null;

        // Load companies on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadCompanies();
            setupLogoUpload();
        });

        // Load companies from API
        async function loadCompanies() {
            try {
                const token = localStorage.getItem('auth_token');
                const headers = token ? { 'Authorization': \`Bearer \${token}\` } : {};
                
                const response = await fetch('/api/companies', { headers });
                if (response.ok) {
                    const data = await response.json();
                    companies = data.companies || [];
                    displayCompanies();
                    updateStatistics();
                } else {
                    throw new Error('Error al cargar empresas');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error al cargar empresas: ' + error.message, 'error');
            }
        }

        // Display companies in grid
        function displayCompanies() {
            const grid = document.getElementById('companies-grid');
            
            if (companies.length === 0) {
                grid.innerHTML = \`
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-building text-6xl text-text-secondary mb-4"></i>
                        <h3 class="text-xl font-bold text-text-primary mb-2">No hay empresas registradas</h3>
                        <p class="text-text-secondary mb-6">Comienza agregando tu primera empresa al sistema</p>
                        <button onclick="showAddCompanyModal()" class="premium-button">
                            <i class="fas fa-plus mr-2"></i>Agregar Primera Empresa
                        </button>
                    </div>
                \`;
                return;
            }

            const companyCards = companies.map(company => {
                const countryFlag = {
                    'MX': '🇲🇽',
                    'ES': '🇪🇸', 
                    'US': '🇺🇸',
                    'CA': '🇨🇦'
                }[company.country] || '🏢';

                const currencySymbol = {
                    'MXN': '$',
                    'EUR': '€',
                    'USD': '$',
                    'CAD': 'C$'
                }[company.primary_currency] || '';

                const logoHtml = company.logo_url ? 
                    '<img src="' + company.logo_url + '" alt="' + company.name + '" class="w-8 h-8 object-contain">' :
                    '<span class="text-2xl">' + countryFlag + '</span>';

                return '<div class="glass-panel p-6 hover:shadow-xl transition-all group cursor-pointer">' +
                    '<div class="flex items-center justify-between mb-6">' +
                        '<div class="flex items-center space-x-4">' +
                            '<div class="p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all">' +
                                logoHtml +
                            '</div>' +
                            '<div>' +
                                '<h3 class="text-lg font-bold text-accent-gold group-hover:text-accent-emerald transition-colors">' + company.name + '</h3>' +
                                '<p class="text-sm text-text-secondary">' + company.country + '</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="text-right">' +
                            '<div class="premium-badge mb-2">' +
                                '<i class="fas fa-check-circle mr-1"></i>' +
                                (company.active ? 'Activa' : 'Inactiva') +
                            '</div>' +
                            '<p class="text-xs text-text-secondary">' + company.primary_currency + '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="grid grid-cols-2 gap-4 mb-6">' +
                        '<div class="text-center p-3 bg-glass rounded-lg">' +
                            '<div class="text-xl font-bold text-accent-emerald">' + (company.employees_count || 0) + '</div>' +
                            '<div class="text-xs text-text-secondary">Empleados</div>' +
                        '</div>' +
                        '<div class="text-center p-3 bg-glass rounded-lg">' +
                            '<div class="text-xl font-bold text-accent-gold">' + currencySymbol + '0</div>' +
                            '<div class="text-xs text-text-secondary">Gastos</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="flex items-center justify-between pt-4 border-t border-glass-border">' +
                        '<button onclick="editCompany(' + company.id + ')" class="text-sm text-accent-sapphire hover:text-accent-gold transition-colors">' +
                            '<i class="fas fa-edit mr-1"></i>Editar' +
                        '</button>' +
                        '<button onclick="viewCompany(' + company.id + ')" class="text-sm text-accent-gold hover:text-accent-emerald transition-colors">' +
                            'Ver detalles <i class="fas fa-arrow-right ml-1"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>';
            });
            
            grid.innerHTML = companyCards.join('');
        }

        // Update statistics
        function updateStatistics() {
            document.getElementById('total-companies').textContent = companies.length;
            document.getElementById('countries-count').textContent = new Set(companies.map(c => c.country)).size;
            document.getElementById('currencies-count').textContent = new Set(companies.map(c => c.primary_currency)).size;
        }

        // Show add company modal
        function showAddCompanyModal() {
            currentEditingCompany = null;
            document.getElementById('modal-title').innerHTML = '<i class="fas fa-building mr-3"></i>Nueva Empresa';
            document.getElementById('company-form').reset();
            document.getElementById('company-modal').classList.remove('hidden');
            resetLogoPreview();
        }

        // Close modal
        function closeCompanyModal() {
            document.getElementById('company-modal').classList.add('hidden');
            currentEditingCompany = null;
        }

        // Save company
        async function saveCompany(event) {
            event.preventDefault();
            
            const formData = new FormData();
            const companyData = {
                razon_social: document.getElementById('razon-social').value,
                commercial_name: document.getElementById('commercial-name').value,
                country: document.getElementById('country').value,
                tax_id: document.getElementById('tax-id').value,
                primary_currency: document.getElementById('primary-currency').value,
                employees_count: parseInt(document.getElementById('employees-count').value) || null,
                business_category: document.getElementById('business-category').value,
                website: document.getElementById('website').value,
                business_description: document.getElementById('business-description').value,
                address_street: document.getElementById('address-street').value,
                address_city: document.getElementById('address-city').value,
                address_state: document.getElementById('address-state').value,
                address_postal: document.getElementById('address-postal').value,
                phone: document.getElementById('phone').value,
                brand_color: document.getElementById('brand-color').value
            };

            try {
                const token = localStorage.getItem('auth_token');
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
                };

                const url = currentEditingCompany ? \`/api/companies/\${currentEditingCompany}\` : '/api/companies';
                const method = currentEditingCompany ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(companyData)
                });

                if (response.ok) {
                    const result = await response.json();
                    showMessage('Empresa ' + (currentEditingCompany ? 'actualizada' : 'creada') + ' exitosamente', 'success');
                    closeCompanyModal();
                    await loadCompanies();
                } else {
                    let errorMessage = 'Error desconocido';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } catch (e) {
                        errorMessage = 'Error del servidor (status: ' + response.status + ')';
                    }
                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error al guardar empresa: ' + error.message, 'error');
            }
        }

        // Update country-specific fields
        function updateCountryFields() {
            const country = document.getElementById('country').value;
            const taxIdLabel = document.getElementById('tax-id-label');
            const stateLabel = document.getElementById('state-label');
            const postalLabel = document.getElementById('postal-code-label');
            const currencySelect = document.getElementById('primary-currency');

            switch(country) {
                case 'MX':
                    taxIdLabel.textContent = 'RFC *';
                    stateLabel.textContent = 'Estado';
                    postalLabel.textContent = 'Código Postal';
                    currencySelect.value = 'MXN';
                    break;
                case 'ES':
                    taxIdLabel.textContent = 'NIF/CIF *';
                    stateLabel.textContent = 'Provincia';
                    postalLabel.textContent = 'Código Postal';
                    currencySelect.value = 'EUR';
                    break;
                case 'US':
                    taxIdLabel.textContent = 'EIN *';
                    stateLabel.textContent = 'State';
                    postalLabel.textContent = 'ZIP Code';
                    currencySelect.value = 'USD';
                    break;
                case 'CA':
                    taxIdLabel.textContent = 'BN *';
                    stateLabel.textContent = 'Province';
                    postalLabel.textContent = 'Postal Code';
                    currencySelect.value = 'CAD';
                    break;
            }
        }

        // Setup logo upload
        function setupLogoUpload() {
            const dropzone = document.getElementById('logo-dropzone');
            const fileInput = document.getElementById('logo-file');

            dropzone.addEventListener('click', () => fileInput.click());
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('border-accent-emerald');
            });
            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('border-accent-emerald');
            });
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('border-accent-emerald');
                const files = e.dataTransfer.files;
                if (files.length > 0) handleLogoFile(files[0]);
            });
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) handleLogoFile(e.target.files[0]);
            });
        }

        // Handle logo file
        function handleLogoFile(file) {
            if (file.size > 5 * 1024 * 1024) {
                showMessage('El archivo es muy grande. Máximo 5MB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('logo-img').src = e.target.result;
                document.getElementById('logo-preview').classList.remove('hidden');
                document.getElementById('logo-placeholder').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }

        // Reset logo preview
        function resetLogoPreview() {
            document.getElementById('logo-preview').classList.add('hidden');
            document.getElementById('logo-placeholder').classList.remove('hidden');
            document.getElementById('logo-file').value = '';
        }

        // Set brand color
        function setBrandColor(color) {
            document.getElementById('brand-color').value = color;
        }

        // View company details
        function viewCompany(companyId) {
            window.location.href = \`/company/\${companyId}\`;
        }

        // Edit company
        function editCompany(companyId) {
            // TODO: Implement edit functionality
            showMessage('Función de edición en desarrollo', 'info');
        }

        // Show message helper
        function showMessage(message, type) {
            // Simple alert for now, can be enhanced with toast notifications
            if (type === 'error') {
                alert('❌ ' + message);
            } else if (type === 'success') {
                alert('✅ ' + message);
            } else {
                alert('ℹ️ ' + message);
            }
        }

        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeCompanyModal();
            }
        });
    <\/script>
    
</body>
</html>`));y.get("/company/:id",e=>{const t=e.req.param("id"),r={1:{name:"TechMX Solutions",country:"MX",currency:"MXN",flag:"🇲🇽",employees:24,expenses:"485K",category:"Tecnología"},2:{name:"Innovación Digital MX",country:"MX",currency:"MXN",flag:"🇲🇽",employees:18,expenses:"325K",category:"Digital"},3:{name:"Consultoría Estratégica MX",country:"MX",currency:"MXN",flag:"🇲🇽",employees:12,expenses:"195K",category:"Consultoría"},4:{name:"TechES Barcelona",country:"ES",currency:"EUR",flag:"🇪🇸",employees:32,expenses:"85K",category:"Tecnología"},5:{name:"Innovación Madrid SL",country:"ES",currency:"EUR",flag:"🇪🇸",employees:28,expenses:"72K",category:"Innovación"},6:{name:"Digital Valencia S.A.",country:"ES",currency:"EUR",flag:"🇪🇸",employees:22,expenses:"58K",category:"Digital"}}[t];return r?e.render(n("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);",children:[n("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:n("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:n("div",{className:"flex justify-between items-center py-6",children:[n("div",{className:"flex items-center space-x-6",children:[n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"relative",children:[n("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),n("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),n("div",{children:[n("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),n("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),n("span",{className:"nav-badge",children:[r.flag," ",r.name]})]}),n("div",{className:"flex items-center space-x-8",children:[n("nav",{className:"flex space-x-6",children:[n("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[n("i",{className:"fas fa-chart-pie"}),n("span",{children:"Dashboard"})]}),n("a",{href:"/companies",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[n("i",{className:"fas fa-building"}),n("span",{children:"Empresas"})]}),n("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[n("i",{className:"fas fa-receipt"}),n("span",{children:"Gastos"})]})]}),n("div",{className:"flex items-center space-x-2 text-sm text-tertiary",children:[n("a",{href:"/companies",className:"hover:text-gold",children:"Empresas"}),n("i",{className:"fas fa-chevron-right"}),n("span",{className:"text-gold",children:r.name})]}),n("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[n("select",{className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:n("option",{children:[r.flag," ",r.currency]})}),n("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[n("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),n("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[n("div",{className:"text-center mb-12",children:[n("div",{className:"inline-flex items-center space-x-4 mb-4",children:[n("div",{className:"p-4 rounded-2xl bg-glass",children:n("span",{className:"text-6xl",children:r.flag})}),n("div",{className:"text-left",children:[n("h2",{className:"text-4xl font-bold gradient-text-gold",children:r.name}),n("p",{className:"text-xl text-secondary",children:[r.category," • ",r.country==="MX"?"México":"España"]})]})]}),n("div",{className:"flex justify-center mt-4",children:n("div",{className:"flex items-center space-x-8 text-sm text-tertiary",children:[n("span",{className:"flex items-center",children:[n("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),r.employees," empleados activos"]}),n("span",{className:"flex items-center",children:[n("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),r.currency," ",r.expenses," en gastos"]}),n("span",{className:"flex items-center",children:[n("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Operativa desde 2019"]})]})})]}),n("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12",children:[n("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.1s",children:[n("div",{className:"flex items-center justify-between mb-4",children:n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"p-3 rounded-xl bg-glass",children:n("i",{className:"fas fa-coins text-emerald text-xl"})}),n("div",{children:[n("p",{className:"metric-label text-emerald",children:"Gastos Mensuales"}),n("p",{className:"text-xs text-tertiary",children:"Este mes"})]})]})}),n("div",{className:"metric-value text-emerald",children:[r.currency," ",r.expenses]}),n("div",{className:"text-xs text-tertiary mt-2",children:"+8.5% vs mes anterior"})]}),n("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.2s",children:[n("div",{className:"flex items-center justify-between mb-4",children:n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"p-3 rounded-xl bg-glass",children:n("i",{className:"fas fa-users text-sapphire text-xl"})}),n("div",{children:[n("p",{className:"metric-label text-sapphire",children:"Empleados"}),n("p",{className:"text-xs text-tertiary",children:"Plantilla actual"})]})]})}),n("div",{className:"metric-value text-sapphire",children:r.employees}),n("div",{className:"text-xs text-tertiary mt-2",children:"+2 nuevas contrataciones"})]}),n("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.3s",children:[n("div",{className:"flex items-center justify-between mb-4",children:n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"p-3 rounded-xl bg-glass",children:n("i",{className:"fas fa-clock text-gold text-xl"})}),n("div",{children:[n("p",{className:"metric-label text-gold",children:"Pendientes"}),n("p",{className:"text-xs text-tertiary",children:"Por revisar"})]})]})}),n("div",{className:"metric-value text-gold",children:"7"}),n("div",{className:"text-xs text-tertiary mt-2",children:"2 urgentes"})]}),n("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.4s",children:[n("div",{className:"flex items-center justify-between mb-4",children:n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"p-3 rounded-xl bg-glass",children:n("i",{className:"fas fa-percentage text-ruby text-xl"})}),n("div",{children:[n("p",{className:"metric-label text-ruby",children:"Eficiencia"}),n("p",{className:"text-xs text-tertiary",children:"Aprobación"})]})]})}),n("div",{className:"metric-value text-ruby",children:"94.2%"}),n("div",{className:"text-xs text-tertiary mt-2",children:"Excelente performance"})]})]}),n("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12",children:[n("div",{className:"glass-panel p-8",children:[n("div",{className:"flex justify-between items-center mb-6",children:n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"p-2 rounded-lg bg-glass",children:n("i",{className:"fas fa-chart-line text-emerald text-xl"})}),n("div",{children:[n("h3",{className:"text-xl font-bold text-primary",children:"Tendencia de Gastos"}),n("p",{className:"text-xs text-tertiary",children:["Últimos 6 meses • ",r.name]})]})]})}),n("div",{id:"company-trend-chart",className:"h-64 rounded-lg bg-glass p-4",children:n("div",{className:"flex items-center justify-center h-full",children:n("div",{className:"text-center",children:[n("i",{className:"fas fa-chart-line text-4xl text-emerald mb-4"}),n("p",{className:"text-secondary",children:"Gráfica de tendencias específica"}),n("p",{className:"text-xs text-tertiary",children:["Datos de ",r.name]})]})})})]}),n("div",{className:"glass-panel p-8",children:[n("div",{className:"flex justify-between items-center mb-6",children:n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"p-2 rounded-lg bg-glass",children:n("i",{className:"fas fa-chart-pie text-gold text-xl"})}),n("div",{children:[n("h3",{className:"text-xl font-bold text-primary",children:"Distribución por Categoría"}),n("p",{className:"text-xs text-tertiary",children:"Análisis de tipos de gasto"})]})]})}),n("div",{id:"company-category-chart",className:"h-64 rounded-lg bg-glass p-4",children:n("div",{className:"flex items-center justify-center h-full",children:n("div",{className:"text-center",children:[n("i",{className:"fas fa-chart-pie text-4xl text-gold mb-4"}),n("p",{className:"text-secondary",children:"Distribución por categoría"}),n("p",{className:"text-xs text-tertiary",children:"Viajes, comidas, tecnología, etc."})]})})})]})]}),n("div",{className:"glass-panel p-8",children:[n("div",{className:"flex justify-between items-center mb-6",children:[n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"p-2 rounded-lg bg-glass",children:n("i",{className:"fas fa-history text-sapphire text-xl"})}),n("div",{children:[n("h3",{className:"text-xl font-bold text-primary",children:"Actividad Reciente"}),n("p",{className:"text-xs text-tertiary",children:["Últimos movimientos en ",r.name]})]})]}),n("a",{href:"/expenses",className:"btn-premium btn-sapphire text-sm",children:[n("i",{className:"fas fa-external-link-alt mr-2"}),"Ver todos los gastos"]})]}),n("div",{className:"space-y-4",children:[n("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[n("div",{className:"flex items-center space-x-4",children:[n("div",{className:"p-2 rounded-lg bg-emerald bg-opacity-20",children:n("i",{className:"fas fa-plane text-emerald"})}),n("div",{children:[n("p",{className:"font-semibold text-primary",children:"Vuelo Madrid-Barcelona"}),n("p",{className:"text-sm text-tertiary",children:"María López • Hace 2 horas"})]})]}),n("div",{className:"text-right",children:[n("p",{className:"font-bold text-emerald",children:[r.currency," 250"]}),n("p",{className:"text-xs text-tertiary",children:"Aprobado"})]})]}),n("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[n("div",{className:"flex items-center space-x-4",children:[n("div",{className:"p-2 rounded-lg bg-gold bg-opacity-20",children:n("i",{className:"fas fa-utensils text-gold"})}),n("div",{children:[n("p",{className:"font-semibold text-primary",children:"Comida con cliente"}),n("p",{className:"text-sm text-tertiary",children:"Carlos Martínez • Hace 4 horas"})]})]}),n("div",{className:"text-right",children:[n("p",{className:"font-bold text-gold",children:[r.currency," 125"]}),n("p",{className:"text-xs text-tertiary",children:"Pendiente"})]})]}),n("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[n("div",{className:"flex items-center space-x-4",children:[n("div",{className:"p-2 rounded-lg bg-sapphire bg-opacity-20",children:n("i",{className:"fas fa-laptop text-sapphire"})}),n("div",{children:[n("p",{className:"font-semibold text-primary",children:"Software Adobe Creative Suite"}),n("p",{className:"text-sm text-tertiary",children:"Ana García • Hace 1 día"})]})]}),n("div",{className:"text-right",children:[n("p",{className:"font-bold text-sapphire",children:[r.currency," 89"]}),n("p",{className:"text-xs text-tertiary",children:"Aprobado"})]})]})]})]})]}),n("script",{src:"/static/app.js"})]})):e.redirect("/companies")});y.get("/expenses",e=>e.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Gastos Premium</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: 1px solid var(--color-glass-border);
            border-radius: var(--radius-md);
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
            background: var(--gradient-gold);
        }
        </style>
    </head>
    <body>
        <div class="container mx-auto px-6 py-8">
            <!-- Premium Header -->
            <div class="glass-panel p-8 mb-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-4xl font-bold text-accent-gold">
                            <i class="fas fa-receipt mr-4"></i>
                            Gestión de Gastos Premium
                        </h1>
                        <p class="text-text-secondary text-lg mt-2">
                            Sistema ejecutivo de control financiero empresarial
                        </p>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="showAddExpenseModal()" class="premium-button">
                            <i class="fas fa-plus mr-3"></i>AGREGAR GASTO
                        </button>
                        <a href="/" class="premium-button" style="background: var(--gradient-primary);">
                            <i class="fas fa-home mr-3"></i>Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- FILTROS Y TABLA DE GASTOS -->
        <div class="container mx-auto px-6 pb-8">
            <!-- Filtros Avanzados -->
            <div class="glass-panel p-6 mb-8">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-accent-gold flex items-center">
                            <i class="fas fa-filter mr-3"></i>
                            Filtros Avanzados de Gastos
                        </h3>
                        <p class="text-text-secondary">Personaliza tu búsqueda con filtros multidimensionales</p>
                    </div>
                    <button onclick="clearAllFilters()" class="premium-button" style="background: var(--gradient-accent);">
                        <i class="fas fa-broom mr-2"></i>Limpiar Filtros
                    </button>
                </div>
                
                <!-- Primera fila de filtros -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <!-- Filtro por Fecha (PRIMERO) -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">📅 Fecha</label>
                        <div class="flex gap-2">
                            <input type="date" id="filter-date-from" onchange="applyFilters()" 
                                   class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm"
                                   placeholder="Desde">
                            <input type="date" id="filter-date-to" onchange="applyFilters()" 
                                   class="flex-1 p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none text-sm"
                                   placeholder="Hasta">
                        </div>
                    </div>
                    
                    <!-- Filtro por Empresa -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">🏢 Empresa</label>
                        <select id="filter-company" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todas las Empresas</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Usuario -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">👤 Usuario</label>
                        <select id="filter-user" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todos los Usuarios</option>
                            <option value="1">👑 Alejandro Rodríguez</option>
                            <option value="2">✏️ María López</option>
                            <option value="3">⭐ Carlos Martínez</option>
                            <option value="4">✏️ Ana García</option>
                            <option value="5">⭐ Pedro Sánchez</option>
                            <option value="6">✏️ Elena Torres</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Tipo de Gasto -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">🏷️ Tipo</label>
                        <select id="filter-type" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todos los Tipos</option>
                            <option value="G">💼 Gastos</option>
                            <option value="V">✈️ Viáticos</option>
                        </select>
                    </div>
                </div>
                
                <!-- Segunda fila de filtros -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Filtro por Categoría -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">📂 Categoría</label>
                        <select id="filter-category" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todas las Categorías</option>
                            <option value="meals">🍽️ Comidas</option>
                            <option value="transport">🚗 Transporte</option>
                            <option value="accommodation">🏨 Hospedaje</option>
                            <option value="travel">✈️ Viajes</option>
                            <option value="supplies">📋 Suministros</option>
                            <option value="services">💻 Servicios</option>
                            <option value="general">📦 General</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Status -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">📊 Status</label>
                        <select id="filter-status" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todos los Status</option>
                            <option value="pending">⏳ Pendiente</option>
                            <option value="approved">✅ Aprobado</option>
                            <option value="rejected">❌ Rechazado</option>
                            <option value="more_info">💬 Pedir Más Información</option>
                            <option value="reimbursed">💰 Reembolsado</option>
                            <option value="invoiced">📄 Facturado</option>
                        </select>
                    </div>
                    
                    <!-- Filtro por Moneda -->
                    <div>
                        <label class="block text-sm font-semibold text-accent-gold mb-2">💱 Moneda</label>
                        <select id="filter-currency" onchange="applyFilters()" 
                                class="w-full p-3 rounded-lg border border-glass-border bg-glass text-text-primary focus:border-accent-gold focus:outline-none">
                            <option value="">Todas las Monedas</option>
                            <option value="MXN">🇲🇽 MXN</option>
                            <option value="USD">🇺🇸 USD</option>
                            <option value="EUR">🇪🇺 EUR</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Estadísticas KPI Compactas -->
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <!-- Total Gastos -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-chart-bar text-accent-emerald text-lg"></i>
                        <span class="text-xs text-text-secondary">Total</span>
                    </div>
                    <div class="text-xl font-bold text-accent-gold">
                        <span id="total-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">gastos</div>
                </div>
                
                <!-- Monto Total -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-calculator text-accent-emerald text-lg"></i>
                        <span class="text-xs text-text-secondary">Monto</span>
                    </div>
                    <div class="text-lg font-bold text-accent-emerald" id="total-amount">
                        $0.00
                    </div>
                    <div class="text-xs text-text-secondary">total</div>
                </div>

                <!-- Pendientes por Autorizar -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-clock text-yellow-400 text-lg"></i>
                        <span class="text-xs text-text-secondary">Pendientes</span>
                    </div>
                    <div class="text-xl font-bold text-yellow-400">
                        <span id="pending-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">por autorizar</div>
                </div>

                <!-- Aprobados -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-check-circle text-green-400 text-lg"></i>
                        <span class="text-xs text-text-secondary">Aprobados</span>
                    </div>
                    <div class="text-xl font-bold text-green-400">
                        <span id="approved-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">gastos</div>
                </div>

                <!-- Empresas Activas -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-building text-sapphire text-lg"></i>
                        <span class="text-xs text-text-secondary">Empresas</span>
                    </div>
                    <div class="text-xl font-bold text-sapphire">
                        <span id="companies-count">0</span>
                    </div>
                    <div class="text-xs text-text-secondary">activas</div>
                </div>

                <!-- Total por Reembolsar -->
                <div class="glass-panel p-4">
                    <div class="flex items-center justify-between mb-2">
                        <i class="fas fa-money-bill-wave text-purple-400 text-lg"></i>
                        <span class="text-xs text-text-secondary">Reembolsar</span>
                    </div>
                    <div class="text-lg font-bold text-purple-400" id="reimbursed-amount">
                        $0.00
                    </div>
                    <div class="text-xs text-text-secondary">por reembolsar</div>
                </div>
            </div>

            <!-- Tabla de Gastos -->
            <div class="glass-panel p-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-accent-gold flex items-center">
                            <i class="fas fa-table mr-3"></i>
                            Registro de Gastos GUSBit
                        </h3>
                        <p class="text-text-secondary">Sistema completo de 13 campos con validación avanzada</p>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-accent-gold/30">
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold w-32 min-w-32">📅 Fecha</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">🏢 Empresa</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">👤 Usuario</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">🏷️ Tipo</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📂 Categoría</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📍 Destino</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">🏪 Lugar</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📝 Descripción</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">💰 Monto</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">💱 Moneda</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">💳 Forma Pago</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">👨‍💼 Capturó</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">📊 Status</th>
                                <th class="text-left py-4 px-4 font-semibold text-accent-gold">⚙️ Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="expenses-list">
                            <tr>
                                <td colspan="14" class="text-center py-12 text-text-secondary">
                                    <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                                    <p>Cargando sistema GUSBit...</p>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot id="expenses-totals">
                            <!-- Los totales se generan dinámicamente -->
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- MODAL GUSBIT COMPLETO (13 CAMPOS) CON OCR Y ADJUNTOS -->
        <div id="add-expense-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10000; overflow-y: auto;">
            <div class="glass-panel" style="max-width: 1200px; margin: 20px auto; border: 3px solid var(--color-accent-gold);">
                <!-- Modal Header -->
                <div class="flex justify-between items-center p-6 border-b border-accent-gold bg-gradient-to-r from-accent-gold/10 to-accent-emerald/10">
                    <div>
                        <h2 class="text-2xl font-bold text-accent-gold flex items-center">
                            <i class="fas fa-plus-circle mr-3"></i>
                            SISTEMA GUSBIT - Registro Completo de Gasto
                        </h2>
                        <p class="text-text-secondary mt-1">
                            🏆 Información Principal del Gasto (13 Campos GUSBit) + Comprobantes y Procesamiento OCR Automático
                        </p>
                    </div>
                    <button onclick="closeAddExpenseModal()" class="text-accent-gold hover:text-red-400 text-3xl font-bold transition-colors">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>

                <form id="expense-form" onsubmit="submitExpenseGusbit(event)" class="p-6">
                    <!-- SECCIÓN 1: INFORMACIÓN PRINCIPAL DEL GASTO (13 CAMPOS GUSBIT) -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-list-ol mr-3"></i>
                            📋 INFORMACIÓN PRINCIPAL DEL GASTO (13 Campos GUSBit)
                        </h3>
                        
                        <!-- Fila 1: Fecha, Empresa, Usuario, Tipo -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <!-- Campo 1: FECHA -->
                            <div>
                                <label for="gusbit-fecha" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🗓️ 1. FECHA *
                                </label>
                                <input type="date" id="gusbit-fecha" required 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                            
                            <!-- Campo 2: EMPRESA -->
                            <div>
                                <label for="gusbit-empresa" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🏢 2. EMPRESA *
                                </label>
                                <select id="gusbit-empresa" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR EMPRESA...</option>
                                </select>
                            </div>
                            
                            <!-- Campo 3: USUARIO -->
                            <div>
                                <label for="gusbit-usuario" class="block text-sm font-semibold text-accent-gold mb-2">
                                    👤 3. USUARIO *
                                </label>
                                <select id="gusbit-usuario" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR USUARIO...</option>
                                    <option value="1">👑 Alejandro Rodríguez</option>
                                    <option value="2">✏️ María López</option>
                                    <option value="3">⭐ Carlos Martínez</option>
                                    <option value="4">✏️ Ana García</option>
                                    <option value="5">⭐ Pedro Sánchez</option>
                                    <option value="6">✏️ Elena Torres</option>
                                </select>
                            </div>
                            
                            <!-- Campo 4: TIPO (V=Viático, G=Gasto) -->
                            <div>
                                <label for="gusbit-tipo" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🏷️ 4. TIPO *
                                </label>
                                <select id="gusbit-tipo" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR TIPO...</option>
                                    <option value="V">✈️ V - Viático</option>
                                    <option value="G">💰 G - Gasto</option>
                                </select>
                            </div>
                        </div>

                        <!-- Fila 2: Categoría, Destino, Lugar, Descripción -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Campo 5: CATEGORÍA -->
                            <div>
                                <label for="gusbit-categoria" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📂 5. CATEGORÍA *
                                </label>
                                <select id="gusbit-categoria" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR CATEGORÍA...</option>
                                    <option value="1">🍽️ Comidas de Trabajo</option>
                                    <option value="2">🚗 Transporte Terrestre</option>
                                    <option value="3">⛽ Combustible</option>
                                    <option value="4">🏨 Hospedaje</option>
                                    <option value="5">✈️ Vuelos</option>
                                    <option value="6">📋 Material de Oficina</option>
                                    <option value="7">💻 Software y Licencias</option>
                                    <option value="8">📚 Capacitación</option>
                                    <option value="9">📢 Marketing</option>
                                    <option value="10">📦 Otros Gastos</option>
                                </select>
                            </div>
                            
                            <!-- Campo 6: DESTINO -->
                            <div>
                                <label for="gusbit-destino" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📍 6. DESTINO *
                                </label>
                                <input type="text" id="gusbit-destino" required placeholder="Ej: Ciudad de México, Madrid, Nueva York" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                        </div>

                        <!-- Fila 3: Lugar y Descripción -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Campo 7: LUGAR/NEGOCIO -->
                            <div>
                                <label for="gusbit-lugar" class="block text-sm font-semibold text-accent-gold mb-2">
                                    🏪 7. LUGAR/NEGOCIO *
                                </label>
                                <input type="text" id="gusbit-lugar" required placeholder="Ej: Restaurante Pujol, Uber, Hotel Marriott" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                            
                            <!-- Campo 8: DESCRIPCIÓN -->
                            <div>
                                <label for="gusbit-descripcion" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📝 8. DESCRIPCIÓN *
                                </label>
                                <input type="text" id="gusbit-descripcion" required placeholder="Ej: Comida con cliente potencial" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                        </div>

                        <!-- Fila 4: Monto, Moneda, Forma de Pago -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <!-- Campo 9: MONTO -->
                            <div>
                                <label for="gusbit-monto" class="block text-sm font-semibold text-accent-gold mb-2">
                                    💰 9. MONTO *
                                </label>
                                <input type="number" step="0.01" min="0.01" id="gusbit-monto" required placeholder="0.00" 
                                       class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                            </div>
                            
                            <!-- Campo 10: MONEDA -->
                            <div>
                                <label for="gusbit-moneda" class="block text-sm font-semibold text-accent-gold mb-2">
                                    💱 10. MONEDA *
                                </label>
                                <select id="gusbit-moneda" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR MONEDA...</option>
                                    <option value="MXN">🇲🇽 MXN - Peso Mexicano</option>
                                    <option value="USD">🇺🇸 USD - Dólar Americano</option>
                                    <option value="EUR">🇪🇺 EUR - Euro</option>
                                </select>
                            </div>
                            
                            <!-- Campo 11: FORMA DE PAGO -->
                            <div>
                                <label for="gusbit-forma-pago" class="block text-sm font-semibold text-accent-gold mb-2">
                                    💳 11. FORMA DE PAGO *
                                </label>
                                <select id="gusbit-forma-pago" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR FORMA DE PAGO...</option>
                                    <option value="efectivo">💵 Efectivo</option>
                                    <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                                    <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                                    <option value="tarjeta_empresarial">🏢 Tarjeta Empresarial</option>
                                    <option value="transferencia">🏦 Transferencia Bancaria</option>
                                    <option value="cheque">📄 Cheque</option>
                                    <option value="vales">🎫 Vales de Despensa</option>
                                    <option value="caja_chica">💰 Caja Chica</option>
                                </select>
                            </div>
                        </div>

                        <!-- Fila 5: Quién lo Capturó y Status -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Campo 12: QUIÉN LO CAPTURÓ -->
                            <div>
                                <label for="gusbit-quien-capturo" class="block text-sm font-semibold text-accent-gold mb-2">
                                    👨‍💼 12. QUIÉN LO CAPTURÓ *
                                </label>
                                <select id="gusbit-quien-capturo" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR QUIÉN CAPTURÓ...</option>
                                    <option value="alejandro">👑 Alejandro Rodríguez</option>
                                    <option value="maria">✏️ María López</option>
                                    <option value="carlos">⭐ Carlos Martínez</option>
                                    <option value="ana">✏️ Ana García</option>
                                    <option value="pedro">⭐ Pedro Sánchez</option>
                                    <option value="elena">✏️ Elena Torres</option>
                                </select>
                            </div>
                            
                            <!-- Campo 13: STATUS -->
                            <div>
                                <label for="gusbit-status" class="block text-sm font-semibold text-accent-gold mb-2">
                                    📊 13. STATUS *
                                </label>
                                <select id="gusbit-status" required 
                                        class="w-full p-3 rounded-lg border-2 border-accent-gold/30 bg-glass text-text-primary focus:border-accent-gold focus:outline-none transition-colors">
                                    <option value="">⚠️ SELECCIONAR STATUS...</option>
                                    <option value="pending">⏳ Pendiente de Autorización</option>
                                    <option value="approved">✅ Aprobado</option>
                                    <option value="rejected">❌ Rechazado</option>
                                    <option value="reimbursed">💰 Reembolsado</option>
                                    <option value="invoiced">📄 Facturado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- SECCIÓN 2: COMPROBANTES Y PROCESAMIENTO OCR AUTOMÁTICO -->
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-accent-emerald mb-6 flex items-center">
                            <i class="fas fa-camera mr-3"></i>
                            📸 COMPROBANTES Y PROCESAMIENTO OCR AUTOMÁTICO
                        </h3>
                        
                        <!-- Upload Section -->
                        <div class="glass-panel p-6 mb-4">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h4 class="text-lg font-semibold text-accent-gold">📎 Adjuntar Tickets y Facturas</h4>
                                    <p class="text-text-secondary text-sm">Sube tickets, facturas o recibos para procesamiento OCR automático</p>
                                </div>
                                <label class="premium-button cursor-pointer">
                                    <i class="fas fa-upload mr-2"></i>
                                    SELECCIONAR ARCHIVOS
                                    <input type="file" multiple accept="image/*,.pdf" style="display: none;" onchange="handleFileUpload(this)">
                                </label>
                            </div>
                            
                            <!-- Uploaded Files Display -->
                            <div id="uploaded-files" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"></div>
                            
                            <!-- OCR Results -->
                            <div id="ocr-results" style="display: none;" class="glass-panel p-4">
                                <h5 class="text-lg font-semibold text-accent-emerald mb-3">
                                    <i class="fas fa-eye mr-2"></i>
                                    🤖 Resultados del Procesamiento OCR
                                </h5>
                                <div id="ocr-content" class="space-y-3"></div>
                            </div>
                        </div>
                    </div>

                    <!-- BOTONES DE ACCIÓN -->
                    <div class="flex justify-between items-center pt-6 border-t border-accent-gold/30">
                        <button type="button" onclick="closeAddExpenseModal()" 
                                class="premium-button" style="background: var(--gradient-accent);">
                            <i class="fas fa-times mr-3"></i>
                            ❌ CANCELAR
                        </button>
                        
                        <button type="submit" id="gusbit-submit-button" 
                                class="premium-button text-lg px-8" 
                                style="background: var(--gradient-gold);" disabled>
                            <i class="fas fa-save mr-3"></i>
                            ❌ COMPLETAR TODOS LOS CAMPOS
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Modal Detalle de Gasto (Expenses) -->
        <div id="expenseDetailModalExpenses" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
            <div class="glass-panel p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-bold text-accent-gold flex items-center">
                        <i class="fas fa-receipt mr-3"></i>Detalle del Gasto
                    </h2>
                    <button onclick="closeExpenseModalExpenses()" class="text-text-secondary hover:text-accent-gold transition-colors">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <!-- Contenido idéntico al modal del dashboard -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Columna Izquierda -->
                    <div class="space-y-6">
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">📋 Información General</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">Descripción</label>
                                    <p id="modal-description-exp" class="text-text-primary font-medium text-lg"></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">📅 Fecha</label>
                                        <p id="modal-date-exp" class="text-text-primary"></p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">🏷️ Tipo</label>
                                        <p id="modal-type-exp" class="text-text-primary"></p>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🏢 Empresa</label>
                                    <p id="modal-company-exp" class="text-text-primary font-medium"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">👤 Usuario Responsable</label>
                                    <p id="modal-user-exp" class="text-text-primary"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">💰 Información Financiera</h3>
                            <div class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">💵 Monto Original</label>
                                        <p id="modal-amount-exp" class="text-accent-emerald font-bold text-xl"></p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-accent-gold mb-1">💱 Moneda</label>
                                        <p id="modal-currency-exp" class="text-text-primary"></p>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🇲🇽 Equivalente MXN</label>
                                    <p id="modal-amount-mxn-exp" class="text-accent-emerald font-bold text-lg"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">💳 Método de Pago</label>
                                    <p id="modal-payment-method-exp" class="text-text-primary"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Columna Derecha -->
                    <div class="space-y-6">
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">🏪 Detalles Comerciales</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">🏪 Proveedor/Lugar</label>
                                    <p id="modal-vendor-exp" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📄 Número de Factura</label>
                                    <p id="modal-invoice-exp" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📂 Categoría</label>
                                    <p id="modal-category-exp" class="text-text-primary"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">📊 Estado Actual</label>
                                    <p id="modal-status-exp" class="font-bold"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="glass-panel p-6">
                            <h3 class="text-lg font-semibold text-accent-gold mb-4">📝 Observaciones</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-accent-gold mb-1">Notas</label>
                                    <p id="modal-notes-exp" class="text-text-primary text-sm bg-glass p-3 rounded-lg min-h-[60px]"></p>
                                </div>
                                <div class="text-sm">
                                    <div>
                                        <label class="block text-xs font-medium text-accent-gold mb-1">Creado</label>
                                        <p id="modal-created-exp" class="text-text-secondary"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Acciones del Gasto -->
                <div class="border-t border-glass-border pt-6">
                    <h3 class="text-lg font-semibold text-accent-gold mb-4">⚡ Acciones</h3>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="authorizeExpenseExp()" class="premium-button bg-green-600 hover:bg-green-700">
                            <i class="fas fa-check mr-2"></i>Autorizar
                        </button>
                        <button onclick="rejectExpenseExp()" class="premium-button bg-red-600 hover:bg-red-700">
                            <i class="fas fa-times mr-2"></i>Rechazar
                        </button>
                        <button onclick="requestMoreInfoExpenses()" class="premium-button bg-blue-600 hover:bg-blue-700">
                            <i class="fas fa-question-circle mr-2"></i>Pedir Info
                        </button>
                        <button onclick="leavePendingExpenses()" class="premium-button bg-yellow-600 hover:bg-yellow-700">
                            <i class="fas fa-clock mr-2"></i>Dejar Pendiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- CARGAR SISTEMA GUSBIT COMPLETO -->
        <script src="/static/expenses.js"><\/script>
        
        <script>
            // INICIALIZACIÓN INMEDIATA DEL SISTEMA GUSBIT
            document.addEventListener('DOMContentLoaded', function() {
                // Cargar gastos y empresas inmediatamente
                if (typeof loadExpenses === 'function') {
                    loadExpenses();
                } else {
                    console.error('❌ loadExpenses no está definido');
                }
                
                // Configurar fecha actual por defecto
                const today = new Date().toISOString().split('T')[0];
                const fechaField = document.getElementById('gusbit-fecha');
                if (fechaField) {
                    fechaField.value = today;
                }
            });
            
            // FUNCIONES DE FORMATEO DE NÚMEROS PARA MONTOS
            function formatNumber(num) {
                if (!num) return '';
                // Eliminar todo excepto números y puntos
                const cleanNum = num.toString().replace(/[^0-9.]/g, '');
                
                // Dividir en parte entera y decimales
                const parts = cleanNum.split('.');
                const integerPart = parts[0];
                const decimalPart = parts[1];
                
                // Formatear parte entera con comas cada 3 dígitos
                const formattedInteger = integerPart.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
                
                // Retornar con decimales si existen
                if (decimalPart !== undefined) {
                    return formattedInteger + '.' + decimalPart.slice(0, 2); // Máximo 2 decimales
                }
                
                return formattedInteger;
            }
            
            function unformatNumber(formattedNum) {
                if (!formattedNum) return '';
                return formattedNum.replace(/,/g, '');
            }
            
            // CONFIGURAR FORMATEO AUTOMÁTICO DEL CAMPO MONTO
            document.addEventListener('DOMContentLoaded', function() {
                // Esperar a que el modal se cargue y luego configurar el evento
                setTimeout(() => {
                    const montoField = document.getElementById('gusbit-monto');
                    if (montoField) {
                        // Formatear mientras escribe
                        montoField.addEventListener('input', function(e) {
                            const cursorPos = e.target.selectionStart;
                            const oldValue = e.target.value;
                            const newValue = formatNumber(oldValue);
                            
                            if (oldValue !== newValue) {
                                e.target.value = newValue;
                                // Ajustar cursor
                                const newCursorPos = cursorPos + (newValue.length - oldValue.length);
                                e.target.setSelectionRange(newCursorPos, newCursorPos);
                            }
                        });
                        
                        // Al salir del campo, asegurar formato correcto
                        montoField.addEventListener('blur', function(e) {
                            const value = parseFloat(unformatNumber(e.target.value));
                            if (!isNaN(value)) {
                                e.target.value = formatNumber(value.toFixed(2));
                            }
                        });

                    }
                }, 2000);
            });
            
            // NOTA: Las funciones closeAddExpenseModal(), handleFileUpload() y fillFormWithOCR() 
            // ya están definidas en expenses.js - No las redefinimos aquí para evitar duplicación
            
        <\/script>
    </body>
    </html>
  `));y.get("/expenses-old",e=>e.render(n("div",{className:"min-h-screen bg-primary",children:[n("div",{className:"bg-glass border-b border-glass-border backdrop-blur-sm",children:n("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:n("div",{className:"flex justify-between items-center py-6",children:[n("div",{className:"flex items-center space-x-6",children:[n("a",{href:"/",className:"text-gold hover:text-gold-light transition-colors duration-200 text-xl",children:n("i",{className:"fas fa-arrow-left"})}),n("div",{children:[n("h1",{className:"text-3xl font-bold text-primary flex items-center",children:[n("i",{className:"fas fa-receipt mr-3 text-gold"}),"Gestión de Gastos"]}),n("p",{className:"text-sm text-tertiary mt-1",children:"Control integral de gastos y viáticos empresariales"})]})]}),n("div",{className:"flex items-center space-x-4",children:[n("button",{className:"btn-premium btn-emerald",onclick:"showExpenseForm()",children:[n("i",{className:"fas fa-plus mr-2"}),"Registrar Gasto"]}),n("button",{className:"btn-premium btn-sapphire",onclick:"showImportExcel()",children:[n("i",{className:"fas fa-file-excel mr-2"}),"Importar Excel"]})]})]})})}),n("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[n("div",{className:"card-premium mb-8",children:[n("div",{className:"flex items-center justify-between mb-6",children:n("div",{children:[n("h3",{className:"text-xl font-bold text-primary flex items-center",children:[n("i",{className:"fas fa-filter mr-3 text-gold"}),"Filtros Avanzados de Gastos"]}),n("p",{className:"text-sm text-tertiary mt-1",children:"Personaliza tu búsqueda con filtros multidimensionales"})]})}),n("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:[n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"🏢 Empresa"}),n("select",{id:"filter-company",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_COMPANY(this.value)",style:"background-color: white !important; color: black !important;",children:[n("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todas las empresas"}),n("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"🇲🇽 TechMX Solutions"}),n("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"🇲🇽 Innovación Digital MX"}),n("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"🇲🇽 Consultoría Estratégica MX"}),n("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"🇪🇸 TechES Barcelona"}),n("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"🇪🇸 Innovación Madrid SL"}),n("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"🇪🇸 Digital Valencia S.A."})]})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"👤 Usuario Responsable"}),n("select",{id:"filter-user",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_USER(this.value)",style:"background-color: white !important; color: black !important;",children:[n("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los usuarios"}),n("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"👑 Alejandro Rodríguez (Admin)"}),n("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"✏️ María López (Editor)"}),n("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"⭐ Carlos Martínez (Advanced)"}),n("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"✏️ Ana García (Editor)"}),n("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"⭐ Pedro Sánchez (Advanced)"}),n("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"✏️ Elena Torres (Editor)"})]})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📋 Estado del Gasto"}),n("select",{id:"filter-status",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_STATUS(this.value)",style:"background-color: white !important; color: black !important;",children:[n("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los estados"}),n("option",{value:"pending",style:"background-color: white !important; color: black !important;",children:"⏳ Pendiente"}),n("option",{value:"approved",style:"background-color: white !important; color: black !important;",children:"✅ Aprobado"}),n("option",{value:"rejected",style:"background-color: white !important; color: black !important;",children:"❌ Rechazado"}),n("option",{value:"more_info",style:"background-color: white !important; color: black !important;",children:"💬 Pedir Más Información"}),n("option",{value:"reimbursed",style:"background-color: white !important; color: black !important;",children:"💰 Reembolsado"}),n("option",{value:"invoiced",style:"background-color: white !important; color: black !important;",children:"📄 Facturado"})]})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"💰 Moneda"}),n("select",{id:"filter-currency",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;",children:[n("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todas las monedas"}),n("option",{value:"MXN",style:"background-color: white !important; color: black !important;",children:"🇲🇽 MXN"}),n("option",{value:"USD",style:"background-color: white !important; color: black !important;",children:"🇺🇸 USD"}),n("option",{value:"EUR",style:"background-color: white !important; color: black !important;",children:"🇪🇺 EUR"})]})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"🏷️ Tipo de Gasto"}),n("select",{id:"filter-expense-type",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_TYPE(this.value)",style:"background-color: white !important; color: black !important;",children:[n("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los tipos"}),n("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"🍽️ Comidas de Trabajo"}),n("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"🚕 Transporte Terrestre"}),n("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"⛽ Combustible"}),n("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"🏨 Hospedaje"}),n("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"✈️ Vuelos"}),n("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"📄 Material de Oficina"}),n("option",{value:"7",style:"background-color: white !important; color: black !important;",children:"💻 Software y Licencias"}),n("option",{value:"8",style:"background-color: white !important; color: black !important;",children:"🎓 Capacitación"}),n("option",{value:"9",style:"background-color: white !important; color: black !important;",children:"📊 Marketing"}),n("option",{value:"10",style:"background-color: white !important; color: black !important;",children:"📂 Otros Gastos"})]})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📅 Fecha Desde"}),n("input",{type:"date",id:"filter-date-from",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📅 Fecha Hasta"}),n("input",{type:"date",id:"filter-date-to",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-secondary mb-3",children:"💳 Método de Pago"}),n("select",{id:"filter-payment-method",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;",children:[n("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los métodos"}),n("option",{value:"cash",style:"background-color: white !important; color: black !important;",children:"💵 Efectivo"}),n("option",{value:"credit_card",style:"background-color: white !important; color: black !important;",children:"💳 Tarjeta de Crédito"}),n("option",{value:"debit_card",style:"background-color: white !important; color: black !important;",children:"💳 Tarjeta de Débito"}),n("option",{value:"bank_transfer",style:"background-color: white !important; color: black !important;",children:"🏦 Transferencia"}),n("option",{value:"company_card",style:"background-color: white !important; color: black !important;",children:"🏢 Tarjeta Empresarial"}),n("option",{value:"petty_cash",style:"background-color: white !important; color: black !important;",children:"💰 Caja Chica"})]})]})]}),n("div",{className:"flex flex-wrap gap-3 mt-6",children:[n("button",{onclick:"EXPENSES_APPLY_ALL_FILTERS()",className:"btn-premium btn-sapphire",children:[n("i",{className:"fas fa-search mr-2"}),"Aplicar Filtros"]}),n("button",{onclick:"EXPENSES_CLEAR_ALL()",className:"btn-premium btn-slate",children:[n("i",{className:"fas fa-eraser mr-2"}),"Limpiar Todo"]}),n("button",{onclick:"EXPENSES_TEST_MARIA()",className:"btn-premium btn-emerald text-sm",children:[n("i",{className:"fas fa-user mr-2"}),"Probar María"]}),n("button",{onclick:"EXPENSES_TEST_PENDING()",className:"btn-premium btn-gold text-sm",children:[n("i",{className:"fas fa-clock mr-2"}),"Solo Pendientes"]}),n("button",{onclick:"QUITAR_MARIA()",className:"btn-premium btn-ruby text-sm",children:[n("i",{className:"fas fa-user-slash mr-2"}),"Quitar María"]})]})]}),n("div",{className:"card-premium",children:[n("div",{className:"flex items-center justify-between mb-6",children:[n("div",{children:[n("h3",{className:"text-xl font-bold text-primary flex items-center",children:[n("i",{className:"fas fa-list-alt mr-3 text-gold"}),"Lista de Gastos y Viáticos"]}),n("p",{className:"text-sm text-tertiary mt-1",children:"Registro completo de transacciones empresariales"})]}),n("div",{className:"flex items-center space-x-4",children:[n("div",{className:"text-center",children:[n("div",{id:"expenses-count",className:"text-lg font-bold text-emerald",children:"0 gastos"}),n("div",{className:"text-xs text-tertiary",children:"Total registros"})]}),n("div",{className:"text-center",children:[n("div",{id:"expenses-total",className:"text-lg font-bold text-gold",children:"$0.00"}),n("div",{className:"text-xs text-tertiary",children:"Monto total"})]})]})]}),n("div",{className:"overflow-x-auto bg-glass rounded-lg border border-glass-border",children:n("table",{className:"min-w-full",children:[n("thead",{className:"bg-quaternary border-b border-glass-border",children:n("tr",{children:[n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("input",{type:"checkbox",id:"select-all",className:"mr-2 accent-gold",onclick:"toggleSelectAll()"}),n("i",{className:"fas fa-hashtag mr-1 text-gold"}),"ID"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-file-text mr-1 text-gold"}),"Descripción"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-building mr-1 text-gold"}),"Empresa"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-user mr-1 text-gold"}),"Usuario"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-money-bill mr-1 text-gold"}),"Monto Original"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-peso-sign mr-1 text-gold"}),"Monto MXN"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-flag mr-1 text-gold"}),"Estado"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-calendar mr-1 text-gold"}),"Fecha"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-paperclip mr-1 text-gold"}),"Adjuntos"]}),n("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[n("i",{className:"fas fa-cogs mr-1 text-gold"}),"Acciones"]})]})}),n("tbody",{id:"expenses-table",className:"divide-y divide-glass-border",children:n("tr",{className:"hover:bg-glass-hover transition-colors duration-200",children:n("td",{colspan:"10",className:"px-6 py-8 text-center",children:n("div",{className:"flex flex-col items-center",children:[n("i",{className:"fas fa-spinner fa-spin text-2xl text-gold mb-3"}),n("span",{className:"text-secondary",children:"Cargando gastos..."})]})})})})]})})]})]}),n("div",{id:"expense-modal",className:"fixed inset-0 z-50 hidden",children:[n("div",{className:"fixed inset-0 bg-black bg-opacity-50",onclick:"closeExpenseForm()"}),n("div",{className:"fixed inset-0 overflow-y-auto",children:n("div",{className:"flex min-h-full items-center justify-center p-4",children:n("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",children:[n("div",{className:"px-6 py-4 border-b border-gray-200",children:[n("div",{className:"flex items-center justify-between",children:[n("h3",{className:"text-lg font-semibold text-gray-900",children:[n("i",{className:"fas fa-plus-circle mr-2 text-green-600"}),"Registrar Nuevo Gasto o Viático"]}),n("button",{onclick:"closeExpenseForm()",className:"text-gray-400 hover:text-gray-600",children:n("i",{className:"fas fa-times text-xl"})})]}),n("p",{className:"text-sm text-gray-500 mt-1",children:"Complete todos los campos requeridos. Los campos marcados con * son obligatorios."})]}),n("form",{id:"expense-form",className:"px-6 py-4",children:[n("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[n("div",{className:"space-y-4",children:[n("h4",{className:"font-semibold text-gray-900 border-b pb-2",children:"📋 Información Básica"}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Empresa * ",n("i",{className:"fas fa-building ml-1 text-blue-500"})]}),n("select",{id:"form-company",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:n("option",{value:"",children:"Seleccione una empresa..."})})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Tipo de Gasto * ",n("i",{className:"fas fa-tags ml-1 text-purple-500"})]}),n("select",{id:"form-expense-type",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:n("option",{value:"",children:"Seleccione tipo de gasto..."})})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Descripción * ",n("i",{className:"fas fa-edit ml-1 text-green-500"})]}),n("textarea",{id:"form-description",required:!0,rows:"3",placeholder:"Ej: Comida con cliente - Proyecto Alpha",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Fecha del Gasto * ",n("i",{className:"fas fa-calendar ml-1 text-red-500"})]}),n("input",{type:"date",id:"form-expense-date",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Responsable ",n("i",{className:"fas fa-user ml-1 text-indigo-500"})]}),n("select",{id:"form-responsible",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:n("option",{value:"",children:"Yo (usuario actual)"})})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Integrantes ",n("i",{className:"fas fa-users ml-1 text-orange-500"})]}),n("textarea",{id:"form-attendees",rows:"2",placeholder:"Ej: María López, Carlos Martínez (opcional)",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]})]}),n("div",{className:"space-y-4",children:[n("h4",{className:"font-semibold text-gray-900 border-b pb-2",children:"💰 Información Financiera"}),n("div",{className:"grid grid-cols-2 gap-3",children:[n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Monto * ",n("i",{className:"fas fa-dollar-sign ml-1 text-green-600"})]}),n("input",{type:"number",step:"0.01",id:"form-amount",required:!0,placeholder:"0.00",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Moneda * ",n("i",{className:"fas fa-coins ml-1 text-yellow-600"})]}),n("select",{id:"form-currency",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",onchange:"updateExchangeRate()",children:[n("option",{value:"",children:"Seleccionar..."}),n("option",{value:"MXN",children:"🇲🇽 MXN"}),n("option",{value:"USD",children:"🇺🇸 USD"}),n("option",{value:"EUR",children:"🇪🇺 EUR"})]})]})]}),n("div",{id:"exchange-rate-section",className:"hidden",children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Tipo de Cambio ",n("i",{className:"fas fa-exchange-alt ml-1 text-blue-600"})]}),n("div",{className:"flex items-center space-x-2",children:[n("input",{type:"number",step:"0.000001",id:"form-exchange-rate",readonly:!0,className:"flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"}),n("button",{type:"button",onclick:"refreshExchangeRate()",className:"px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",children:n("i",{className:"fas fa-sync-alt"})})]}),n("p",{id:"exchange-rate-info",className:"text-xs text-gray-500 mt-1"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Método de Pago * ",n("i",{className:"fas fa-credit-card ml-1 text-purple-600"})]}),n("select",{id:"form-payment-method",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:[n("option",{value:"",children:"Seleccione método..."}),n("option",{value:"cash",children:"💵 Efectivo"}),n("option",{value:"credit_card",children:"💳 Tarjeta de Crédito"}),n("option",{value:"debit_card",children:"💳 Tarjeta de Débito"}),n("option",{value:"bank_transfer",children:"🏦 Transferencia Bancaria"}),n("option",{value:"company_card",children:"🏢 Tarjeta Empresarial"}),n("option",{value:"petty_cash",children:"🪙 Caja Chica"})]})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Proveedor/Establecimiento ",n("i",{className:"fas fa-store ml-1 text-teal-500"})]}),n("input",{type:"text",id:"form-vendor",placeholder:"Ej: Restaurante Pujol, Uber, Adobe Inc",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Número de Factura/Folio ",n("i",{className:"fas fa-receipt ml-1 text-gray-600"})]}),n("input",{type:"text",id:"form-invoice-number",placeholder:"Ej: A123456789",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Estado Inicial ",n("i",{className:"fas fa-flag ml-1 text-yellow-500"})]}),n("select",{id:"form-status",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:[n("option",{value:"pending",children:"⏳ Pendiente"}),n("option",{value:"approved",children:"✅ Aprobado"})]})]}),n("div",{className:"flex items-center space-x-2",children:[n("input",{type:"checkbox",id:"form-billable",className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),n("label",{for:"form-billable",className:"text-sm font-medium text-gray-700",children:[n("i",{className:"fas fa-file-invoice-dollar mr-1 text-green-600"}),"Gasto Facturable al Cliente"]})]})]})]}),n("div",{className:"mt-6",children:[n("h4",{className:"font-semibold text-gray-900 border-b pb-2 mb-4",children:"📝 Información Adicional"}),n("div",{children:[n("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Notas y Comentarios ",n("i",{className:"fas fa-sticky-note ml-1 text-yellow-500"})]}),n("textarea",{id:"form-notes",rows:"3",placeholder:"Información adicional, contexto del gasto, observaciones...",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]})]}),n("div",{className:"mt-6",children:[n("h4",{className:"font-semibold text-gray-900 border-b pb-2 mb-4",children:"📎 Archivos Adjuntos con OCR Inteligente"}),n("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:[n("div",{className:"flex items-center space-x-3",children:[n("input",{type:"checkbox",id:"enable-ocr",checked:!0,className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),n("label",{for:"enable-ocr",className:"text-sm font-medium text-blue-900",children:[n("i",{className:"fas fa-robot mr-1"}),"Activar OCR - Extracción Automática de Datos"]})]}),n("p",{className:"text-xs text-blue-700 mt-1 ml-6",children:"El sistema extraerá automáticamente: monto, fecha, proveedor, y método de pago desde tickets y facturas"})]}),n("div",{className:"border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors",ondrop:"handleFileDrop(event)",ondragover:"handleDragOver(event)",ondragleave:"handleDragLeave(event)",children:[n("i",{className:"fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"}),n("p",{className:"text-gray-600 mb-2",children:[n("strong",{children:"Arrastra archivos aquí"})," o haz clic para seleccionar"]}),n("p",{className:"text-sm text-gray-500 mb-3",children:"📸 Tickets • 📄 Facturas PDF/XML • 🖼️ Fotografías (Max: 10MB por archivo)"}),n("div",{className:"flex justify-center space-x-3",children:[n("input",{type:"file",id:"form-attachments",multiple:!0,accept:".pdf,.xml,.jpg,.jpeg,.png,.gif",className:"hidden",onchange:"handleFileSelect(event)"}),n("button",{type:"button",onclick:"document.getElementById('form-attachments').click()",className:"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",children:[n("i",{className:"fas fa-paperclip mr-2"}),"Seleccionar Archivos"]}),n("button",{type:"button",onclick:"captureFromCamera()",className:"px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 md:hidden min-h-12",children:[n("i",{className:"fas fa-camera mr-2"}),"📸 Tomar Foto"]}),n("button",{type:"button",onclick:"captureLocationForExpense()",className:"px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 md:hidden min-h-12",children:[n("i",{className:"fas fa-map-marker-alt mr-2"}),"📍 Ubicación"]})]}),n("input",{type:"file",id:"camera-capture",accept:"image/*",capture:"environment",className:"hidden",onchange:"handleCameraCapture(event)"})]}),n("div",{id:"ocr-status",className:"mt-3 hidden",children:n("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-3",children:n("div",{className:"flex items-center",children:[n("i",{className:"fas fa-cog fa-spin text-yellow-600 mr-2"}),n("span",{class:"text-yellow-800",children:"Procesando OCR..."})]})})}),n("div",{id:"attachments-preview",className:"mt-4 hidden",children:[n("h5",{className:"font-medium text-gray-900 mb-2",children:"Archivos y Datos Extraídos:"}),n("div",{id:"attachments-list",className:"space-y-2"})]}),n("div",{id:"ocr-results",className:"mt-4 hidden",children:[n("h5",{className:"font-medium text-gray-900 mb-2",children:[n("i",{className:"fas fa-magic mr-1 text-purple-600"}),"Datos Extraídos Automáticamente:"]}),n("div",{id:"ocr-data-preview",className:"bg-green-50 border border-green-200 rounded-lg p-4"}),n("div",{className:"flex space-x-2 mt-2",children:[n("button",{type:"button",onclick:"applyOcrData()",className:"text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700",children:[n("i",{className:"fas fa-check mr-1"}),"Aplicar Datos"]}),n("button",{type:"button",onclick:"clearOcrData()",className:"text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700",children:[n("i",{className:"fas fa-times mr-1"}),"Descartar"]})]})]})]}),n("div",{className:"mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200",children:[n("button",{type:"button",onclick:"closeExpenseForm()",className:"px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50",children:[n("i",{className:"fas fa-times mr-2"}),"Cancelar"]}),n("button",{type:"button",onclick:"saveDraft()",className:"px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700",children:[n("i",{className:"fas fa-save mr-2"}),"Guardar Borrador"]}),n("button",{type:"submit",className:"px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700",children:[n("i",{className:"fas fa-check mr-2"}),"Registrar Gasto"]})]})]})]})})})]})]})));y.get("/api/dashboard-metrics",Ft,async e=>{const{env:t}=e;try{const a=e.get("userId"),r=e.get("userRole");let s="";r!=="admin"&&(s=`
        AND e.company_id IN (
          SELECT company_id FROM user_companies WHERE user_id = ${a}
        )
      `);const o=await t.DB.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount_mxn), 0) as total
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${s}
    `).first(),i=await t.DB.prepare(`
      SELECT COUNT(*) as count
      FROM expenses e
      WHERE e.status = 'pending'
      ${s}
    `).first(),l=await t.DB.prepare(`
      SELECT c.name as company, COUNT(e.id) as count, 
             COALESCE(SUM(e.amount_mxn), 0) as total_mxn
      FROM companies c
      LEFT JOIN expenses e ON c.id = e.company_id
      WHERE c.active = TRUE
      ${r!=="admin"?`AND c.id IN (SELECT company_id FROM user_companies WHERE user_id = ${a})`:""}
      GROUP BY c.id, c.name
      ORDER BY total_mxn DESC
    `).all(),c=await t.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${s}
      GROUP BY currency
      ORDER BY total_mxn DESC
    `).all(),d=await t.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM expenses e
      WHERE 1=1 ${s}
      GROUP BY status
    `).all(),p=await t.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      WHERE 1=1 ${s}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).all();return e.json({success:!0,total_expenses:o,pending_expenses:i,company_metrics:l.results||[],currency_metrics:c.results||[],status_metrics:d.results||[],recent_expenses:p.results||[]})}catch(a){return e.json({error:"Failed to load dashboard metrics",details:a.message},500)}});const oa=new TextEncoder().encode("lyra-expenses-jwt-secret-2024-very-secure-key-change-in-production");async function ms(e,t){const a=Math.floor(Date.now()/1e3),r=await new ja({sub:e.toString(),role:t,type:"access"}).setProtectedHeader({alg:"HS256"}).setIssuedAt(a).setExpirationTime(a+900).sign(oa),s=await new ja({sub:e.toString(),role:t,type:"refresh"}).setProtectedHeader({alg:"HS256"}).setIssuedAt(a).setExpirationTime(a+10080*60).sign(oa);return{accessToken:r,refreshToken:s}}async function fs(e,t="access"){try{const{payload:a}=await Cn(e,oa);if(a.type!==t)throw new Error("Invalid token type");return a}catch{return null}}async function Ft(e,t){const a=e.req.header("Authorization");if(!a||!a.startsWith("Bearer "))return e.json({error:"Authentication required"},401);const r=a.split(" ")[1],s=await fs(r,"access");if(!s)return e.json({error:"Invalid or expired token"},401);e.set("userId",parseInt(s.sub)),e.set("userRole",s.role),await t()}y.post("/api/auth/login",async e=>{const{env:t}=e;try{const{email:a,password:r}=await e.req.json();if(!a||!r)return e.json({error:"Email and password are required"},400);const s=await t.DB.prepare("SELECT * FROM users WHERE email = ? AND active = TRUE").bind(a.toLowerCase()).first();if(!s)return e.json({error:"Invalid credentials"},401);if(!await Xn.compare(r,s.password_hash))return e.json({error:"Invalid credentials"},401);const i=await ms(s.id,s.role);await t.DB.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").bind(s.id).run();const l=crypto.randomUUID();return await t.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, ip_address, user_agent) 
      VALUES (?, ?, datetime('now', '+7 days'), ?, ?)
    `).bind(l,s.id,e.req.header("CF-Connecting-IP")||e.req.header("X-Forwarded-For")||"unknown",e.req.header("User-Agent")||"unknown").run(),e.json({success:!0,user:{id:s.id,email:s.email,name:s.name,role:s.role},tokens:i,session_id:l})}catch(a){return e.json({error:"Login failed",details:a.message},500)}});y.post("/api/auth/refresh",async e=>{const{env:t}=e;try{const{refresh_token:a}=await e.req.json();if(!a)return e.json({error:"Refresh token is required"},400);const r=await fs(a,"refresh");if(!r)return e.json({error:"Invalid or expired refresh token"},401);const s=parseInt(r.sub),o=await t.DB.prepare("SELECT * FROM users WHERE id = ? AND active = TRUE").bind(s).first();if(!o)return e.json({error:"User not found or inactive"},401);const i=await ms(o.id,o.role);return e.json({success:!0,tokens:i})}catch(a){return e.json({error:"Token refresh failed",details:a.message},500)}});y.post("/api/auth/logout",Ft,async e=>{const{env:t}=e;try{const{session_id:a}=await e.req.json(),r=e.get("userId");return a?await t.DB.prepare("DELETE FROM user_sessions WHERE id = ? AND user_id = ?").bind(a,r).run():await t.DB.prepare("DELETE FROM user_sessions WHERE user_id = ?").bind(r).run(),e.json({success:!0,message:"Logged out successfully"})}catch(a){return e.json({error:"Logout failed",details:a.message},500)}});y.get("/api/auth/profile",Ft,async e=>{const{env:t}=e;try{const a=e.get("userId"),r=await t.DB.prepare(`
      SELECT u.*, 
             GROUP_CONCAT(DISTINCT c.id || ':' || c.name) as companies
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.id = ? AND u.active = TRUE
      GROUP BY u.id
    `).bind(a).first();if(!r)return e.json({error:"User not found"},404);const s=r.companies?r.companies.split(",").map(o=>{const[i,l]=o.split(":");return{id:parseInt(i),name:l}}):[];return e.json({success:!0,user:{id:r.id,email:r.email,name:r.name,role:r.role,companies:s,last_login:r.last_login,created_at:r.created_at}})}catch(a){return e.json({error:"Failed to get profile",details:a.message},500)}});y.get("/api/auth/companies",Ft,async e=>{const{env:t}=e;try{const a=e.get("userId"),r=e.get("userRole");let s;return r==="admin"?s=await t.DB.prepare("SELECT * FROM companies WHERE active = TRUE").all():s=await t.DB.prepare(`
        SELECT c.* 
        FROM companies c
        JOIN user_companies uc ON c.id = uc.company_id
        WHERE uc.user_id = ? AND c.active = TRUE
      `).bind(a).all(),e.json({success:!0,companies:s.results})}catch(a){return e.json({error:"Failed to get companies",details:a.message},500)}});y.get("/analytics",e=>e.render(n("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);",children:[n("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:n("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:n("div",{className:"flex justify-between items-center py-6",children:[n("div",{className:"flex items-center space-x-6",children:[n("div",{className:"flex items-center space-x-3",children:[n("div",{className:"relative",children:[n("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),n("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),n("div",{children:[n("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),n("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),n("span",{className:"nav-badge",children:"Sistema 4-D Premium"})]}),n("div",{className:"flex items-center space-x-8",children:[n("nav",{className:"flex space-x-6",children:[n("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[n("i",{className:"fas fa-chart-pie"}),n("span",{children:"Dashboard"})]}),n("a",{href:"/companies",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[n("i",{className:"fas fa-building"}),n("span",{children:"Empresas"})]}),n("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[n("i",{className:"fas fa-receipt"}),n("span",{children:"Gastos"})]}),n("a",{href:"/analytics",className:"nav-link text-gold active flex items-center space-x-2",children:[n("i",{className:"fas fa-chart-line"}),n("span",{children:"Analytics"})]})]}),n("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[n("div",{id:"auth-indicator"}),n("select",{id:"currency-selector",className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:[n("option",{value:"MXN",children:"💎 MXN"}),n("option",{value:"USD",children:"🔹 USD"}),n("option",{value:"EUR",children:"🔸 EUR"})]}),n("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[n("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),n("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[n("div",{className:"text-center mb-12",children:[n("h2",{className:"text-4xl font-bold gradient-text-gold mb-3",children:[n("i",{className:"fas fa-chart-line mr-3"}),"Analytics Avanzado"]}),n("p",{className:"text-secondary text-lg",children:"Análisis profundo y reportes inteligentes multiempresa"}),n("div",{className:"flex justify-center mt-4",children:n("div",{className:"flex items-center space-x-6 text-sm text-tertiary",children:[n("span",{className:"flex items-center",children:[n("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),"Datos en tiempo real"]}),n("span",{className:"flex items-center",children:[n("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),"Machine Learning activo"]}),n("span",{className:"flex items-center",children:[n("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Predicciones inteligentes"]})]})})]}),n("div",{className:"glass-panel p-16 text-center",children:[n("div",{className:"mb-8",children:[n("i",{className:"fas fa-rocket text-6xl text-gold mb-6"}),n("h3",{className:"text-3xl font-bold text-primary mb-4",children:"Próximamente"}),n("p",{className:"text-xl text-secondary mb-6",children:"Analytics Avanzado con IA"})]}),n("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",children:[n("div",{className:"p-6 bg-glass rounded-lg",children:[n("i",{className:"fas fa-brain text-3xl text-emerald mb-4"}),n("h4",{className:"text-lg font-bold text-primary mb-2",children:"Machine Learning"}),n("p",{className:"text-sm text-tertiary",children:"Predicciones automáticas de gastos y detección de anomalías"})]}),n("div",{className:"p-6 bg-glass rounded-lg",children:[n("i",{className:"fas fa-chart-network text-3xl text-gold mb-4"}),n("h4",{className:"text-lg font-bold text-primary mb-2",children:"Analytics Predictivo"}),n("p",{className:"text-sm text-tertiary",children:"Forecasting inteligente y optimización de presupuestos"})]}),n("div",{className:"p-6 bg-glass rounded-lg",children:[n("i",{className:"fas fa-file-chart-line text-3xl text-sapphire mb-4"}),n("h4",{className:"text-lg font-bold text-primary mb-2",children:"Reportes Avanzados"}),n("p",{className:"text-sm text-tertiary",children:"Reportes ejecutivos automatizados con insights accionables"})]})]}),n("div",{className:"flex justify-center space-x-4",children:[n("a",{href:"/",className:"btn-premium btn-gold",children:[n("i",{className:"fas fa-chart-pie mr-2"}),"Volver al Dashboard"]}),n("a",{href:"/companies",className:"btn-premium btn-sapphire",children:[n("i",{className:"fas fa-building mr-2"}),"Ver Empresas"]})]})]})]}),n("script",{src:"https://cdn.tailwindcss.com"}),n("link",{href:"https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",rel:"stylesheet"}),n("link",{href:"/static/styles.css",rel:"stylesheet"}),n("script",{src:"/static/app.js"}),n("script",{children:`
        // Initialize expenses page IMMEDIATELY
        console.log('🚀 Expenses page script loaded');
        
        // Function to load expenses with retry
        function loadExpensesNow() {
          console.log('🔄 Attempting to load expenses...');
          
          fetch('/api/expenses')
            .then(response => response.json())
            .then(data => {
              console.log('✅ Expenses loaded:', data);
              
              // Update counters
              const count = data.expenses?.length || 0;
              const total = data.expenses?.reduce((sum, e) => sum + parseFloat(e.amount_mxn || 0), 0) || 0;
              
              document.getElementById('expenses-count').textContent = count + ' gastos';
              document.getElementById('expenses-total').textContent = '$' + total.toLocaleString('es-MX');
              
              // Update table
              EXPENSES_UPDATE_TABLE(data.expenses || []);
            })
            .catch(error => {
              console.error('❌ Error loading expenses:', error);
              
              // Show error in table
              const tableBody = document.getElementById('expenses-table');
              if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-red-500"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar gastos</td></tr>';
              }
            });
        }
        
        // Load immediately
        loadExpensesNow();
        
        // Also try after DOM loaded
        document.addEventListener('DOMContentLoaded', function() {
          console.log('🚀 DOM loaded - retrying expenses load');
          setTimeout(loadExpensesNow, 500);
        });
        
        // Try again after 2 seconds as backup
        setTimeout(loadExpensesNow, 2000);
      `})]})));y.get("/analytics-morado",e=>e.html(`<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Dashboard Analítico - Lyra Expenses</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .purple-gradient { 
            background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%); 
        }
        .purple-glass { 
            background: rgba(139, 92, 246, 0.1); 
            backdrop-filter: blur(10px); 
            border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .purple-card {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05));
            border: 1px solid rgba(139, 92, 246, 0.15);
        }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <!-- Navigation Header -->
    <header class="purple-gradient shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <i class="fas fa-chart-line text-white text-xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-white">Lyra Expenses</h1>
                </div>
                <nav class="flex space-x-6">
                    <a href="/analytics-morado" class="text-white font-medium px-3 py-2 rounded-md bg-white bg-opacity-20">
                        <i class="fas fa-chart-pie mr-2"></i>Analytics
                    </a>
                    <a href="/" class="text-white hover:text-purple-200 font-medium px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10 transition">
                        <i class="fas fa-building mr-2"></i>Dashboard
                    </a>
                    <a href="/expenses" class="text-white hover:text-purple-200 font-medium px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10 transition">
                        <i class="fas fa-receipt mr-2"></i>Gastos
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <div class="flex h-screen pt-0">
        <!-- Sidebar: Ficha de Gasto -->
        <div class="w-80 purple-glass shadow-xl overflow-y-auto">
            <div class="p-6">
                <h2 class="text-xl font-bold text-purple-900 mb-6">
                    <i class="fas fa-filter mr-2"></i>Ficha de Gasto
                </h2>
                
                <!-- Filters -->
                <div class="space-y-4">
                    <!-- Company Filter -->
                    <div>
                        <label class="block text-sm font-medium text-purple-800 mb-2">Empresa</label>
                        <select id="companyFilter" class="w-full px-3 py-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Todas las empresas</option>
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div>
                        <label class="block text-sm font-medium text-purple-800 mb-2">Estado</label>
                        <select id="statusFilter" class="w-full px-3 py-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                            <option value="reimbursed">Reembolsado</option>
                        </select>
                    </div>

                    <!-- Currency Filter -->
                    <div>
                        <label class="block text-sm font-medium text-purple-800 mb-2">Moneda</label>
                        <select id="currencyFilter" class="w-full px-3 py-2 border border-purple-200 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Todas las monedas</option>
                            <option value="MXN">MXN - Peso Mexicano</option>
                            <option value="USD">USD - Dólar</option>
                            <option value="EUR">EUR - Euro</option>
                        </select>
                    </div>

                    <!-- Apply Filters Button -->
                    <button id="applyFilters" class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition font-medium">
                        <i class="fas fa-search mr-2"></i>Aplicar Filtros
                    </button>
                    
                    <!-- Clear Filters Button -->
                    <button id="clearFilters" class="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition font-medium">
                        <i class="fas fa-eraser mr-2"></i>Limpiar Filtros
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-auto bg-gray-50">
            <div class="p-6">
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <!-- Total Amount -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-purple-100 rounded-full mr-4">
                                <i class="fas fa-euro-sign text-purple-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Total Gastos</p>
                                <p id="totalAmount" class="text-2xl font-bold text-purple-900">4,563 €</p>
                            </div>
                        </div>
                    </div>

                    <!-- Total Companies -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-purple-100 rounded-full mr-4">
                                <i class="fas fa-building text-purple-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Empresas</p>
                                <p id="totalCompanies" class="text-2xl font-bold text-purple-900">1</p>
                            </div>
                        </div>
                    </div>

                    <!-- Pending Authorization -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-orange-100 rounded-full mr-4">
                                <i class="fas fa-clock text-orange-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Pend. Autorización</p>
                                <p id="pendingAuth" class="text-2xl font-bold text-purple-900">1</p>
                            </div>
                        </div>
                    </div>

                    <!-- Approved Expenses -->
                    <div class="purple-card rounded-xl p-6 shadow-sm">
                        <div class="flex items-center">
                            <div class="p-3 bg-green-100 rounded-full mr-4">
                                <i class="fas fa-check-circle text-green-600 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-purple-600">Aprobados</p>
                                <p id="approvedCount" class="text-2xl font-bold text-purple-900">6</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Donut Chart -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                        <h3 class="text-lg font-semibold text-purple-900 mb-4">
                            <i class="fas fa-chart-pie mr-2 text-purple-600"></i>Gastos por Estado
                        </h3>
                        <div class="relative" style="height: 300px;">
                            <canvas id="statusChart"></canvas>
                        </div>
                    </div>

                    <!-- Bar Chart -->
                    <div class="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                        <h3 class="text-lg font-semibold text-purple-900 mb-4">
                            <i class="fas fa-chart-bar mr-2 text-purple-600"></i>Gastos por Empresa
                        </h3>
                        <div class="relative" style="height: 300px;">
                            <canvas id="companyChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Expenses Table -->
                <div class="bg-white rounded-xl shadow-sm border border-purple-100">
                    <div class="px-6 py-4 border-b border-purple-100">
                        <h3 class="text-lg font-semibold text-purple-900">
                            <i class="fas fa-table mr-2 text-purple-600"></i>Gastos Recientes
                        </h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-purple-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Fecha</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Descripción</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Empresa</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Monto</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody id="expensesTableBody" class="bg-white divide-y divide-gray-200">
                                <!-- Table rows will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Dashboard variables
        let currentFilters = {};
        let dashboardData = {};
        let statusChart, companyChart;

        // Initialize dashboard on load
        document.addEventListener('DOMContentLoaded', function() {
            loadCompanies();
            loadDashboardData();
            initializeEventListeners();
        });

        // Load companies for filter
        async function loadCompanies() {
            try {
                const response = await axios.get('/api/companies');
                const companies = response.data.companies;
                
                const select = document.getElementById('companyFilter');
                companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.id;
                    option.textContent = company.name + ' (' + company.country + ')';
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading companies:', error);
            }
        }

        // Load dashboard data
        async function loadDashboardData() {
            try {
                const response = await axios.get('/api/dashboard/metrics', {
                    params: currentFilters
                });
                
                dashboardData = response.data;
                updateKPIs();
                updateCharts();
                updateTable();
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        // Update KPI cards
        function updateKPIs() {
            const statusMetrics = dashboardData.status_metrics || [];
            const companyMetrics = dashboardData.company_metrics || [];
            
            // Calculate totals
            const totalAmount = statusMetrics.reduce((sum, metric) => sum + (metric.total_mxn || 0), 0);
            const totalCompanies = companyMetrics.length;
            const pendingCount = statusMetrics.find(m => m.status === 'pending')?.count || 0;
            const approvedCount = statusMetrics.find(m => m.status === 'approved')?.count || 0;
            
            // Update KPI displays (convert to EUR for display)
            document.getElementById('totalAmount').textContent = Math.round(totalAmount / 20.15).toLocaleString() + ' €';
            document.getElementById('totalCompanies').textContent = totalCompanies;
            document.getElementById('pendingAuth').textContent = pendingCount;
            document.getElementById('approvedCount').textContent = approvedCount;
        }

        // Update charts
        function updateCharts() {
            updateStatusChart();
            updateCompanyChart();
        }

        // Update status donut chart with purple theme
        function updateStatusChart() {
            const ctx = document.getElementById('statusChart').getContext('2d');
            
            if (statusChart) {
                statusChart.destroy();
            }
            
            const statusMetrics = dashboardData.status_metrics || [];
            const labels = statusMetrics.map(m => getStatusLabel(m.status));
            const data = statusMetrics.map(m => m.count);
            
            statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#8b5cf6', // Purple
                            '#a855f7', // Purple variant
                            '#c084fc', // Light purple
                            '#e879f9', // Pink purple
                            '#f3e8ff'  // Very light purple
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#6b21a8',
                                font: {
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            });
        }

        // Update company bar chart with purple theme
        function updateCompanyChart() {
            const ctx = document.getElementById('companyChart').getContext('2d');
            
            if (companyChart) {
                companyChart.destroy();
            }
            
            const companyMetrics = dashboardData.company_metrics || [];
            const labels = companyMetrics.map(m => m.company);
            const data = companyMetrics.map(m => Math.round((m.total_mxn || 0) / 20.15)); // Convert to EUR
            
            companyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Gastos (EUR)',
                        data: data,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderColor: '#8b5cf6',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#6b21a8',
                                font: {
                                    weight: 'bold'
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#6b21a8'
                            },
                            grid: {
                                color: 'rgba(139, 92, 246, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#6b21a8'
                            },
                            grid: {
                                color: 'rgba(139, 92, 246, 0.1)'
                            }
                        }
                    }
                }
            });
        }

        // Update expenses table
        function updateTable() {
            const tableBody = document.getElementById('expensesTableBody');
            const expenses = dashboardData.recent_expenses || [];
            
            tableBody.innerHTML = '';
            
            expenses.forEach(expense => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-purple-50 transition-colors';
                row.innerHTML = 
                    '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + formatDate(expense.expense_date) + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + expense.description + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">' + expense.company_name + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">' + expense.currency + ' ' + parseFloat(expense.amount).toLocaleString() + '</td>' +
                    '<td class="px-6 py-4 whitespace-nowrap">' +
                        '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ' + getStatusBadgeClass(expense.status) + '">' +
                            getStatusLabel(expense.status) +
                        '</span>' +
                    '</td>';
                tableBody.appendChild(row);
            });
        }

        // Event listeners for filters
        function initializeEventListeners() {
            document.getElementById('applyFilters').addEventListener('click', applyFilters);
            document.getElementById('clearFilters').addEventListener('click', clearFilters);
        }

        // Apply filters
        function applyFilters() {
            currentFilters = {
                company_id: document.getElementById('companyFilter').value,
                status: document.getElementById('statusFilter').value,
                currency: document.getElementById('currencyFilter').value
            };
            
            // Remove empty filters
            Object.keys(currentFilters).forEach(key => {
                if (!currentFilters[key]) {
                    delete currentFilters[key];
                }
            });
            
            loadDashboardData();
        }

        // Clear all filters
        function clearFilters() {
            document.getElementById('companyFilter').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('currencyFilter').value = '';
            
            currentFilters = {};
            loadDashboardData();
        }

        // Utility functions
        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('es-ES');
        }

        function getStatusLabel(status) {
            const labels = {
                'pending': 'Pendiente',
                'approved': 'Aprobado',
                'rejected': 'Rechazado',
                'reimbursed': 'Reembolsado'
            };
            return labels[status] || status;
        }

        function getStatusBadgeClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'approved': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800',
                'reimbursed': 'bg-blue-100 text-blue-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
    <\/script>
</body>
</html>`));y.get("/users",e=>e.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Usuarios del Sistema</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        .premium-button.secondary {
            background: var(--gradient-sapphire);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .premium-button.secondary:hover {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .premium-button.danger {
            background: var(--gradient-accent);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .premium-button.danger:hover {
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }
        
        .glass-panel {
            background: var(--color-glass);
            backdrop-filter: blur(10px);
            border: 1px solid var(--color-border);
            border-radius: 12px;
            box-shadow: var(--shadow-glass);
        }
        
        .role-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .role-viewer { background-color: #e0f2fe; color: #0277bd; }
        .role-editor { background-color: #e8f5e8; color: #2e7d32; }
        .role-advanced { background-color: #fff3e0; color: #f57c00; }
        .role-admin { background-color: #fce4ec; color: #c2185b; }
        
        .status-active { color: #10b981; }
        .status-inactive { color: #ef4444; }
        </style>
    </head>
    <body>
        <!-- Navigation -->
        <nav class="glass-panel border-b sticky top-0 z-40 mb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="text-2xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent">
                            <i class="fas fa-gem mr-2"></i>LYRA
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-chart-line mr-2"></i>Dashboard
                            </a>
                            <a href="/expenses" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-receipt mr-2"></i>Gastos
                            </a>
                            <a href="/users" class="text-accent-emerald font-semibold">
                                <i class="fas fa-users-cog mr-2"></i>Usuarios del Sistema
                            </a>
                            <a href="/employees" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-id-card mr-2"></i>Empleados
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 class="text-4xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent mb-4">
                            <i class="fas fa-users-cog mr-3"></i>
                            Gestión de Usuarios del Sistema
                        </h1>
                        <p class="text-text-secondary text-lg">
                            Administra usuarios con acceso al sistema de gastos • Roles y Privilegios
                        </p>
                    </div>
                    <div class="flex gap-3 mt-4 md:mt-0">
                        <button onclick="showAddUserModal()" class="premium-button">
                            <i class="fas fa-user-plus"></i>
                            Nuevo Usuario
                        </button>
                        <button onclick="exportUsers()" class="premium-button secondary">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                        <i class="fas fa-users text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="total-users-count">-</p>
                    <p class="text-text-secondary">Total Usuarios</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                        <i class="fas fa-user-check text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="active-users-count">-</p>
                    <p class="text-text-secondary">Usuarios Activos</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
                        <i class="fas fa-crown text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="admin-users-count">-</p>
                    <p class="text-text-secondary">Administradores</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                        <i class="fas fa-clock text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="recent-logins-count">-</p>
                    <p class="text-text-secondary">Últimos 30 días</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="glass-panel p-6 mb-8">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Buscar Usuario</label>
                        <input 
                            type="text" 
                            id="search-user" 
                            placeholder="Nombre, email o ID..."
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Filtrar por Rol</label>
                        <select 
                            id="filter-role" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todos los Roles</option>
                            <option value="viewer">👀 Solo Lectura</option>
                            <option value="editor">✏️ Editor</option>
                            <option value="advanced">⭐ Avanzado</option>
                            <option value="admin">👑 Administrador</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Estado</label>
                        <select 
                            id="filter-status" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            <option value="active">✅ Activo</option>
                            <option value="inactive">❌ Inactivo</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="applyUserFilters()" class="premium-button">
                            <i class="fas fa-filter"></i>
                            Filtrar
                        </button>
                        <button onclick="clearUserFilters()" class="premium-button secondary">
                            <i class="fas fa-eraser"></i>
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="glass-panel overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gradient-to-r from-accent-gold/10 to-accent-emerald/10">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Usuario</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Email</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Rol</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Estado</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Último Acceso</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Empresas Asignadas</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="users-list" class="divide-y divide-border-primary">
                            <!-- Users will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Add/Edit User Modal -->
        <div id="userModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
            <div class="glass-panel p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-text-primary">
                        <i class="fas fa-user-plus mr-2 text-accent-emerald"></i>
                        <span id="modal-title">Nuevo Usuario del Sistema</span>
                    </h3>
                    <button onclick="closeUserModal()" class="text-text-secondary hover:text-accent-gold">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="userForm" onsubmit="saveUser(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <!-- Basic Info -->
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-user mr-2 text-accent-emerald"></i>
                                Nombre Completo *
                            </label>
                            <input 
                                type="text" 
                                id="user-name" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Ej: Juan Pérez García"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-envelope mr-2 text-accent-emerald"></i>
                                Email *
                            </label>
                            <input 
                                type="email" 
                                id="user-email" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="juan.perez@empresa.com"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-lock mr-2 text-accent-emerald"></i>
                                Contraseña *
                            </label>
                            <input 
                                type="password" 
                                id="user-password" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Mínimo 8 caracteres"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                <i class="fas fa-user-tag mr-2 text-accent-emerald"></i>
                                Rol del Usuario *
                            </label>
                            <select 
                                id="user-role" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Seleccionar Rol...</option>
                                <option value="viewer">👀 Solo Lectura - Puede ver gastos y reportes</option>
                                <option value="editor">✏️ Editor - Puede crear y editar gastos</option>
                                <option value="advanced">⭐ Avanzado - Editor + Aprobaciones limitadas</option>
                                <option value="admin">👑 Administrador - Acceso completo</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Company Permissions -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-text-primary mb-4">
                            <i class="fas fa-building mr-2 text-accent-emerald"></i>
                            Permisos por Empresa
                        </label>
                        <div id="company-permissions" class="space-y-3">
                            <!-- Company permissions will be loaded here -->
                        </div>
                    </div>
                    
                    <!-- Status -->
                    <div class="mb-6">
                        <label class="flex items-center text-sm font-medium text-text-primary">
                            <input 
                                type="checkbox" 
                                id="user-active" 
                                checked
                                class="mr-3 w-4 h-4 text-accent-emerald bg-glass-input border-border-primary rounded focus:ring-accent-emerald focus:ring-2"
                            >
                            <i class="fas fa-check-circle mr-2 text-accent-emerald"></i>
                            Usuario Activo (puede iniciar sesión)
                        </label>
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button type="button" onclick="closeUserModal()" class="premium-button secondary">
                            <i class="fas fa-times mr-2"></i>
                            Cancelar
                        </button>
                        <button type="submit" class="premium-button">
                            <i class="fas fa-save mr-2"></i>
                            Guardar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <script src="/static/permissions-ui.js"><\/script>
        <script src="/static/users.js"><\/script><\/script>
    </body>
    </html>`));y.get("/employees",e=>e.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestión de Empleados</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        <style>
        body {
            background: linear-gradient(135deg, 
                var(--color-bg-primary) 0%, 
                var(--color-bg-secondary) 50%, 
                var(--color-bg-tertiary) 100%);
            min-height: 100vh;
            color: var(--color-text-primary);
        }
        
        .premium-button {
            background: var(--gradient-emerald);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .premium-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        
        .premium-button.secondary {
            background: var(--gradient-sapphire);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .premium-button.secondary:hover {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .premium-button.danger {
            background: var(--gradient-accent);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        
        .premium-button.danger:hover {
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }
        
        .glass-panel {
            background: var(--color-glass);
            backdrop-filter: blur(10px);
            border: 1px solid var(--color-border);
            border-radius: 12px;
            box-shadow: var(--shadow-glass);
        }
        
        .department-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .dept-it { background-color: #e3f2fd; color: #1565c0; }
        .dept-sales { background-color: #e8f5e8; color: #2e7d32; }
        .dept-hr { background-color: #fff3e0; color: #f57c00; }
        .dept-finance { background-color: #fce4ec; color: #c2185b; }
        .dept-operations { background-color: #f3e5f5; color: #7b1fa2; }
        .dept-management { background-color: #fff8e1; color: #f9a825; }
        </style>
    </head>
    <body>
        <!-- Navigation -->
        <nav class="glass-panel border-b sticky top-0 z-40 mb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-8">
                        <a href="/" class="text-2xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent">
                            <i class="fas fa-gem mr-2"></i>LYRA
                        </a>
                        <div class="hidden md:flex space-x-6">
                            <a href="/" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-chart-line mr-2"></i>Dashboard
                            </a>
                            <a href="/expenses" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-receipt mr-2"></i>Gastos
                            </a>
                            <a href="/users" class="text-text-secondary hover:text-accent-emerald transition-colors">
                                <i class="fas fa-users-cog mr-2"></i>Usuarios del Sistema
                            </a>
                            <a href="/employees" class="text-accent-emerald font-semibold">
                                <i class="fas fa-id-card mr-2"></i>Empleados
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header Section -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 class="text-4xl font-bold bg-gradient-to-r from-accent-gold to-accent-emerald bg-clip-text text-transparent mb-4">
                            <i class="fas fa-id-card mr-3"></i>
                            Gestión de Empleados
                        </h1>
                        <p class="text-text-secondary text-lg">
                            Administra empleados que generan gastos y viáticos • Información Personal y Laboral
                        </p>
                    </div>
                    <div class="flex gap-3 mt-4 md:mt-0">
                        <button onclick="showAddEmployeeModal()" class="premium-button">
                            <i class="fas fa-user-plus"></i>
                            Nuevo Empleado
                        </button>
                        <button onclick="exportEmployees()" class="premium-button secondary">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                        <i class="fas fa-users text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="total-employees-count">-</p>
                    <p class="text-text-secondary">Total Empleados</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                        <i class="fas fa-user-check text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="active-employees-count">-</p>
                    <p class="text-text-secondary">Empleados Activos</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
                        <i class="fas fa-building text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="departments-count">-</p>
                    <p class="text-text-secondary">Departamentos</p>
                </div>
                
                <div class="glass-panel p-6 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                        <i class="fas fa-receipt text-2xl text-white"></i>
                    </div>
                    <p class="text-2xl font-bold text-accent-emerald" id="with-expenses-count">-</p>
                    <p class="text-text-secondary">Con Gastos</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="glass-panel p-6 mb-8">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Buscar Empleado</label>
                        <input 
                            type="text" 
                            id="search-employee" 
                            placeholder="Nombre, email, ID o puesto..."
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Filtrar por Departamento</label>
                        <select 
                            id="filter-department" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todos los Departamentos</option>
                            <option value="it">💻 Tecnología</option>
                            <option value="sales">💼 Ventas</option>
                            <option value="hr">👥 Recursos Humanos</option>
                            <option value="finance">💰 Finanzas</option>
                            <option value="operations">⚙️ Operaciones</option>
                            <option value="management">👔 Dirección</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-text-primary mb-2">Empresa</label>
                        <select 
                            id="filter-company" 
                            class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:border-transparent"
                        >
                            <option value="">Todas las Empresas</option>
                            <!-- Companies will be loaded here -->
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="applyEmployeeFilters()" class="premium-button">
                            <i class="fas fa-filter"></i>
                            Filtrar
                        </button>
                        <button onclick="clearEmployeeFilters()" class="premium-button secondary">
                            <i class="fas fa-eraser"></i>
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Employees Table -->
            <div class="glass-panel overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gradient-to-r from-accent-gold/10 to-accent-emerald/10">
                            <tr>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Empleado</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Puesto</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Departamento</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Empresa</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Email</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Teléfono</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Estado</th>
                                <th class="px-6 py-4 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="employees-list" class="divide-y divide-border-primary">
                            <!-- Employees will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Add/Edit Employee Modal -->
        <div id="employeeModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden flex items-center justify-center">
            <div class="glass-panel p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-text-primary">
                        <i class="fas fa-user-plus mr-2 text-accent-emerald"></i>
                        <span id="employee-modal-title">Nuevo Empleado</span>
                    </h3>
                    <button onclick="closeEmployeeModal()" class="text-text-secondary hover:text-accent-gold">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="employeeForm" onsubmit="saveEmployee(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <!-- Personal Info -->
                        <div class="lg:col-span-3">
                            <h4 class="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-primary">
                                <i class="fas fa-user mr-2 text-accent-emerald"></i>
                                Información Personal
                            </h4>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Nombre Completo *
                            </label>
                            <input 
                                type="text" 
                                id="employee-name" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Nombre y apellidos"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Email Personal
                            </label>
                            <input 
                                type="email" 
                                id="employee-email" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="email@personal.com"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Teléfono
                            </label>
                            <input 
                                type="tel" 
                                id="employee-phone" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="+52 555 123 4567"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                RFC/Identificación Fiscal
                            </label>
                            <input 
                                type="text" 
                                id="employee-rfc" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="XAXX010101000"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Fecha de Nacimiento
                            </label>
                            <input 
                                type="date" 
                                id="employee-birthdate" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Dirección
                            </label>
                            <input 
                                type="text" 
                                id="employee-address" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Calle, número, colonia, ciudad"
                            >
                        </div>
                        
                        <!-- Work Info -->
                        <div class="lg:col-span-3">
                            <h4 class="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-primary mt-6">
                                <i class="fas fa-briefcase mr-2 text-accent-emerald"></i>
                                Información Laboral
                            </h4>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Empresa *
                            </label>
                            <select 
                                id="employee-company" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Seleccionar Empresa...</option>
                                <!-- Companies will be loaded here -->
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Puesto de Trabajo *
                            </label>
                            <input 
                                type="text" 
                                id="employee-position" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="Ej: Gerente de Ventas, Developer Senior"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Departamento *
                            </label>
                            <select 
                                id="employee-department" 
                                required
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Seleccionar Departamento...</option>
                                <option value="it">💻 Tecnología</option>
                                <option value="sales">💼 Ventas</option>
                                <option value="hr">👥 Recursos Humanos</option>
                                <option value="finance">💰 Finanzas</option>
                                <option value="operations">⚙️ Operaciones</option>
                                <option value="management">👔 Dirección</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Número de Empleado
                            </label>
                            <input 
                                type="text" 
                                id="employee-number" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                                placeholder="ID interno de empleado"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Fecha de Ingreso
                            </label>
                            <input 
                                type="date" 
                                id="employee-hire-date" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-text-primary mb-2">
                                Jefe Directo
                            </label>
                            <select 
                                id="employee-manager" 
                                class="w-full px-4 py-3 rounded-lg border border-border-primary bg-glass-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald"
                            >
                                <option value="">Sin jefe directo...</option>
                                <!-- Managers will be loaded here -->
                            </select>
                        </div>
                    </div>
                    
                    <!-- Status -->
                    <div class="mb-6">
                        <label class="flex items-center text-sm font-medium text-text-primary">
                            <input 
                                type="checkbox" 
                                id="employee-active" 
                                checked
                                class="mr-3 w-4 h-4 text-accent-emerald bg-glass-input border-border-primary rounded focus:ring-accent-emerald focus:ring-2"
                            >
                            <i class="fas fa-check-circle mr-2 text-accent-emerald"></i>
                            Empleado Activo (puede generar gastos)
                        </label>
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button type="button" onclick="closeEmployeeModal()" class="premium-button secondary">
                            <i class="fas fa-times mr-2"></i>
                            Cancelar
                        </button>
                        <button type="submit" class="premium-button">
                            <i class="fas fa-save mr-2"></i>
                            Guardar Empleado
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <script src="/static/permissions-ui.js"><\/script>
        <script src="/static/employees.js"><\/script>
    </body>
    </html>`));const za=new Rr,ti=Object.assign({"/src/index.tsx":y});let xs=!1;for(const[,e]of Object.entries(ti))e&&(za.all("*",t=>{let a;try{a=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,a)}),za.notFound(t=>{let a;try{a=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,a)}),xs=!0);if(!xs)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{za as default};
