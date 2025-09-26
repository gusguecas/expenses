var us=Object.defineProperty;var xa=e=>{throw TypeError(e)};var fs=(e,t,a)=>t in e?us(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var g=(e,t,a)=>fs(e,typeof t!="symbol"?t+"":t,a),Ut=(e,t,a)=>t.has(e)||xa("Cannot "+a);var u=(e,t,a)=>(Ut(e,t,"read from private field"),a?a.call(e):t.get(e)),E=(e,t,a)=>t.has(e)?xa("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,a),y=(e,t,a,r)=>(Ut(e,t,"write to private field"),r?r.call(e,a):t.set(e,a),a),C=(e,t,a)=>(Ut(e,t,"access private method"),a);var ha=(e,t,a,r)=>({set _(n){y(e,t,n,a)},get _(){return u(e,t,r)}});import ms from"crypto";var Za={Stringify:1},B=(e,t)=>{const a=new String(e);return a.isEscaped=!0,a.callbacks=t,a},xs=/[&<>'"]/,Qa=async(e,t)=>{let a="";t||(t=[]);const r=await Promise.all(e);for(let n=r.length-1;a+=r[n],n--,!(n<0);n--){let i=r[n];typeof i=="object"&&t.push(...i.callbacks||[]);const o=i.isEscaped;if(i=await(typeof i=="object"?i.toString():i),typeof i=="object"&&t.push(...i.callbacks||[]),i.isEscaped??o)a+=i;else{const c=[a];xe(i,c),a=c[0]}}return B(a,t)},xe=(e,t)=>{const a=e.search(xs);if(a===-1){t[0]+=e;return}let r,n,i=0;for(n=a;n<e.length;n++){switch(e.charCodeAt(n)){case 34:r="&quot;";break;case 39:r="&#39;";break;case 38:r="&amp;";break;case 60:r="&lt;";break;case 62:r="&gt;";break;default:continue}t[0]+=e.substring(i,n)+r,i=n+1}t[0]+=e.substring(i,n)},er=e=>{const t=e.callbacks;if(!(t!=null&&t.length))return e;const a=[e],r={};return t.forEach(n=>n({phase:Za.Stringify,buffer:a,context:r})),a[0]},tr=async(e,t,a,r,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const i=e.callbacks;return i!=null&&i.length?(n?n[0]+=e:n=[e],Promise.all(i.map(c=>c({phase:t,buffer:n,context:r}))).then(c=>Promise.all(c.filter(Boolean).map(l=>tr(l,t,!1,r,n))).then(()=>n[0]))):Promise.resolve(e)},hs=(e,...t)=>{const a=[""];for(let r=0,n=e.length-1;r<n;r++){a[0]+=e[r];const i=Array.isArray(t[r])?t[r].flat(1/0):[t[r]];for(let o=0,c=i.length;o<c;o++){const l=i[o];if(typeof l=="string")xe(l,a);else if(typeof l=="number")a[0]+=l;else{if(typeof l=="boolean"||l===null||l===void 0)continue;if(typeof l=="object"&&l.isEscaped)if(l.callbacks)a.unshift("",l);else{const d=l.toString();d instanceof Promise?a.unshift("",d):a[0]+=d}else l instanceof Promise?a.unshift("",l):xe(l.toString(),a)}}}return a[0]+=e.at(-1),a.length===1?"callbacks"in a?B(er(B(a[0],a.callbacks))):B(a[0]):Qa(a,a.callbacks)},sa=Symbol("RENDERER"),zt=Symbol("ERROR_HANDLER"),O=Symbol("STASH"),ar=Symbol("INTERNAL"),bs=Symbol("MEMO"),_t=Symbol("PERMALINK"),ba=e=>(e[ar]=!0,e),rr=e=>({value:t,children:a})=>{if(!a)return;const r={children:[{tag:ba(()=>{e.push(t)}),props:{}}]};Array.isArray(a)?r.children.push(...a.flat()):r.children.push(a),r.children.push({tag:ba(()=>{e.pop()}),props:{}});const n={tag:"",props:r,type:""};return n[zt]=i=>{throw e.pop(),i},n},sr=e=>{const t=[e],a=rr(t);return a.values=t,a.Provider=a,Xe.push(a),a},Xe=[],na=e=>{const t=[e],a=r=>{t.push(r.value);let n;try{n=r.children?(Array.isArray(r.children)?new cr("",{},r.children):r.children).toString():""}finally{t.pop()}return n instanceof Promise?n.then(i=>B(i,i.callbacks)):B(n)};return a.values=t,a.Provider=a,a[sa]=rr(t),Xe.push(a),a},ze=e=>e.values.at(-1),gt={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},Vt={},yt="data-precedence",ut=e=>Array.isArray(e)?e:[e],ga=new WeakMap,ya=(e,t,a,r)=>({buffer:n,context:i})=>{if(!n)return;const o=ga.get(i)||{};ga.set(i,o);const c=o[e]||(o[e]=[]);let l=!1;const d=gt[e];if(d.length>0){e:for(const[,p]of c)for(const f of d)if(((p==null?void 0:p[f])??null)===(a==null?void 0:a[f])){l=!0;break e}}if(l?n[0]=n[0].replaceAll(t,""):d.length>0?c.push([t,a,r]):c.unshift([t,a,r]),n[0].indexOf("</head>")!==-1){let p;if(r===void 0)p=c.map(([f])=>f);else{const f=[];p=c.map(([m,,x])=>{let b=f.indexOf(x);return b===-1&&(f.push(x),b=f.length-1),[m,b]}).sort((m,x)=>m[1]-x[1]).map(([m])=>m)}p.forEach(f=>{n[0]=n[0].replaceAll(f,"")}),n[0]=n[0].replace(/(?=<\/head>)/,p.join(""))}},ft=(e,t,a)=>B(new W(e,a,ut(t??[])).toString()),mt=(e,t,a,r)=>{if("itemProp"in a)return ft(e,t,a);let{precedence:n,blocking:i,...o}=a;n=r?n??"":void 0,r&&(o[yt]=n);const c=new W(e,o,ut(t||[])).toString();return c instanceof Promise?c.then(l=>B(c,[...l.callbacks||[],ya(e,l,o,n)])):B(c,[ya(e,c,o,n)])},gs=({children:e,...t})=>{const a=ia();if(a){const r=ze(a);if(r==="svg"||r==="head")return new W("title",t,ut(e??[]))}return mt("title",e,t,!1)},ys=({children:e,...t})=>{const a=ia();return["src","async"].some(r=>!t[r])||a&&ze(a)==="head"?ft("script",e,t):mt("script",e,t,!1)},vs=({children:e,...t})=>["href","precedence"].every(a=>a in t)?(t["data-href"]=t.href,delete t.href,mt("style",e,t,!0)):ft("style",e,t),Es=({children:e,...t})=>["onLoad","onError"].some(a=>a in t)||t.rel==="stylesheet"&&(!("precedence"in t)||"disabled"in t)?ft("link",e,t):mt("link",e,t,"precedence"in t),Ns=({children:e,...t})=>{const a=ia();return a&&ze(a)==="head"?ft("meta",e,t):mt("meta",e,t,!1)},nr=(e,{children:t,...a})=>new W(e,a,ut(t??[])),ws=e=>(typeof e.action=="function"&&(e.action=_t in e.action?e.action[_t]:void 0),nr("form",e)),ir=(e,t)=>(typeof t.formAction=="function"&&(t.formAction=_t in t.formAction?t.formAction[_t]:void 0),nr(e,t)),Ts=e=>ir("input",e),As=e=>ir("button",e);const Ft=Object.freeze(Object.defineProperty({__proto__:null,button:As,form:ws,input:Ts,link:Es,meta:Ns,script:ys,style:vs,title:gs},Symbol.toStringTag,{value:"Module"}));var Cs=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),St=e=>Cs.get(e)||e,or=(e,t)=>{for(const[a,r]of Object.entries(e)){const n=a[0]==="-"||!/[A-Z]/.test(a)?a:a.replace(/[A-Z]/g,i=>`-${i.toLowerCase()}`);t(n,r==null?null:typeof r=="number"?n.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${r}`:`${r}px`:r)}},Qe=void 0,ia=()=>Qe,_s=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Ss=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Rs=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],oa=(e,t)=>{for(let a=0,r=e.length;a<r;a++){const n=e[a];if(typeof n=="string")xe(n,t);else{if(typeof n=="boolean"||n===null||n===void 0)continue;n instanceof W?n.toStringToBuffer(t):typeof n=="number"||n.isEscaped?t[0]+=n:n instanceof Promise?t.unshift("",n):oa(n,t)}}},W=class{constructor(e,t,a){g(this,"tag");g(this,"props");g(this,"key");g(this,"children");g(this,"isEscaped",!0);g(this,"localContexts");this.tag=e,this.props=t,this.children=a}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){var t,a;const e=[""];(t=this.localContexts)==null||t.forEach(([r,n])=>{r.values.push(n)});try{this.toStringToBuffer(e)}finally{(a=this.localContexts)==null||a.forEach(([r])=>{r.values.pop()})}return e.length===1?"callbacks"in e?er(B(e[0],e.callbacks)).toString():e[0]:Qa(e,e.callbacks)}toStringToBuffer(e){const t=this.tag,a=this.props;let{children:r}=this;e[0]+=`<${t}`;const n=Qe&&ze(Qe)==="svg"?i=>_s(St(i)):i=>St(i);for(let[i,o]of Object.entries(a))if(i=n(i),i!=="children"){if(i==="style"&&typeof o=="object"){let c="";or(o,(l,d)=>{d!=null&&(c+=`${c?";":""}${l}:${d}`)}),e[0]+=' style="',xe(c,e),e[0]+='"'}else if(typeof o=="string")e[0]+=` ${i}="`,xe(o,e),e[0]+='"';else if(o!=null)if(typeof o=="number"||o.isEscaped)e[0]+=` ${i}="${o}"`;else if(typeof o=="boolean"&&Rs.includes(i))o&&(e[0]+=` ${i}=""`);else if(i==="dangerouslySetInnerHTML"){if(r.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");r=[B(o.__html)]}else if(o instanceof Promise)e[0]+=` ${i}="`,e.unshift('"',o);else if(typeof o=="function"){if(!i.startsWith("on")&&i!=="ref")throw new Error(`Invalid prop '${i}' of type 'function' supplied to '${t}'.`)}else e[0]+=` ${i}="`,xe(o.toString(),e),e[0]+='"'}if(Ss.includes(t)&&r.length===0){e[0]+="/>";return}e[0]+=">",oa(r,e),e[0]+=`</${t}>`}},Pt=class extends W{toStringToBuffer(e){const{children:t}=this,a=this.tag.call(null,{...this.props,children:t.length<=1?t[0]:t});if(!(typeof a=="boolean"||a==null))if(a instanceof Promise)if(Xe.length===0)e.unshift("",a);else{const r=Xe.map(n=>[n,n.values.at(-1)]);e.unshift("",a.then(n=>(n instanceof W&&(n.localContexts=r),n)))}else a instanceof W?a.toStringToBuffer(e):typeof a=="number"||a.isEscaped?(e[0]+=a,a.callbacks&&(e.callbacks||(e.callbacks=[]),e.callbacks.push(...a.callbacks))):xe(a,e)}},cr=class extends W{toStringToBuffer(e){oa(this.children,e)}},va=(e,t,...a)=>{t??(t={}),a.length&&(t.children=a.length===1?a[0]:a);const r=t.key;delete t.key;const n=vt(e,t,a);return n.key=r,n},Ea=!1,vt=(e,t,a)=>{if(!Ea){for(const r in Vt)Ft[r][sa]=Vt[r];Ea=!0}return typeof e=="function"?new Pt(e,t,a):Ft[e]?new Pt(Ft[e],t,a):e==="svg"||e==="head"?(Qe||(Qe=na("")),new W(e,t,[new Pt(Qe,{value:e},a)])):new W(e,t,a)},Os=({children:e})=>new cr("",{children:e},Array.isArray(e)?e:e?[e]:[]);function s(e,t,a){let r;if(!t||!("children"in t))r=vt(e,t,[]);else{const n=t.children;r=Array.isArray(n)?vt(e,t,n):vt(e,t,[n])}return r.key=a,r}var Na=(e,t,a)=>(r,n)=>{let i=-1;return o(0);async function o(c){if(c<=i)throw new Error("next() called multiple times");i=c;let l,d=!1,p;if(e[c]?(p=e[c][0][0],r.req.routeIndex=c):p=c===e.length&&n||void 0,p)try{l=await p(r,()=>o(c+1))}catch(f){if(f instanceof Error&&t)r.error=f,l=await t(f,r),d=!0;else throw f}else r.finalized===!1&&a&&(l=await a(r));return l&&(r.finalized===!1||d)&&(r.res=l),r}},Is=Symbol(),Ds=async(e,t=Object.create(null))=>{const{all:a=!1,dot:r=!1}=t,i=(e instanceof mr?e.raw.headers:e.headers).get("Content-Type");return i!=null&&i.startsWith("multipart/form-data")||i!=null&&i.startsWith("application/x-www-form-urlencoded")?Ms(e,{all:a,dot:r}):{}};async function Ms(e,t){const a=await e.formData();return a?Ls(a,t):{}}function Ls(e,t){const a=Object.create(null);return e.forEach((r,n)=>{t.all||n.endsWith("[]")?Us(a,n,r):a[n]=r}),t.dot&&Object.entries(a).forEach(([r,n])=>{r.includes(".")&&(Fs(a,r,n),delete a[r])}),a}var Us=(e,t,a)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(a):e[t]=[e[t],a]:t.endsWith("[]")?e[t]=[a]:e[t]=a},Fs=(e,t,a)=>{let r=e;const n=t.split(".");n.forEach((i,o)=>{o===n.length-1?r[i]=a:((!r[i]||typeof r[i]!="object"||Array.isArray(r[i])||r[i]instanceof File)&&(r[i]=Object.create(null)),r=r[i])})},lr=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Ps=e=>{const{groups:t,path:a}=ks(e),r=lr(a);return js(r,t)},ks=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(a,r)=>{const n=`@${r}`;return t.push([n,a]),n}),{groups:t,path:e}},js=(e,t)=>{for(let a=t.length-1;a>=0;a--){const[r]=t[a];for(let n=e.length-1;n>=0;n--)if(e[n].includes(r)){e[n]=e[n].replace(r,t[a][1]);break}}return e},ht={},Bs=(e,t)=>{if(e==="*")return"*";const a=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(a){const r=`${e}#${t}`;return ht[r]||(a[2]?ht[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,a[1],new RegExp(`^${a[2]}(?=/${t})`)]:[e,a[1],new RegExp(`^${a[2]}$`)]:ht[r]=[e,a[1],!0]),ht[r]}return null},ca=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,a=>{try{return t(a)}catch{return a}})}},$s=e=>ca(e,decodeURI),dr=e=>{const t=e.url,a=t.indexOf("/",t.indexOf(":")+4);let r=a;for(;r<t.length;r++){const n=t.charCodeAt(r);if(n===37){const i=t.indexOf("?",r),o=t.slice(a,i===-1?void 0:i);return $s(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(n===63)break}return t.slice(a,r)},Hs=e=>{const t=dr(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},De=(e,t,...a)=>(a.length&&(t=De(t,...a)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),pr=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),a=[];let r="";return t.forEach(n=>{if(n!==""&&!/\:/.test(n))r+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){a.length===0&&r===""?a.push("/"):a.push(r);const i=n.replace("?","");r+="/"+i,a.push(r)}else r+="/"+n}),a.filter((n,i,o)=>o.indexOf(n)===i)},kt=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?ca(e,fr):e):e,ur=(e,t,a)=>{let r;if(!a&&t&&!/[%+]/.test(t)){let o=e.indexOf(`?${t}`,8);for(o===-1&&(o=e.indexOf(`&${t}`,8));o!==-1;){const c=e.charCodeAt(o+t.length+1);if(c===61){const l=o+t.length+2,d=e.indexOf("&",l);return kt(e.slice(l,d===-1?void 0:d))}else if(c==38||isNaN(c))return"";o=e.indexOf(`&${t}`,o+1)}if(r=/[%+]/.test(e),!r)return}const n={};r??(r=/[%+]/.test(e));let i=e.indexOf("?",8);for(;i!==-1;){const o=e.indexOf("&",i+1);let c=e.indexOf("=",i);c>o&&o!==-1&&(c=-1);let l=e.slice(i+1,c===-1?o===-1?void 0:o:c);if(r&&(l=kt(l)),i=o,l==="")continue;let d;c===-1?d="":(d=e.slice(c+1,o===-1?void 0:o),r&&(d=kt(d))),a?(n[l]&&Array.isArray(n[l])||(n[l]=[]),n[l].push(d)):n[l]??(n[l]=d)}return t?n[t]:n},Gs=ur,Xs=(e,t)=>ur(e,t,!0),fr=decodeURIComponent,wa=e=>ca(e,fr),ke,k,re,xr,hr,qt,ce,Ga,mr=(Ga=class{constructor(e,t="/",a=[[]]){E(this,re);g(this,"raw");E(this,ke);E(this,k);g(this,"routeIndex",0);g(this,"path");g(this,"bodyCache",{});E(this,ce,e=>{const{bodyCache:t,raw:a}=this,r=t[e];if(r)return r;const n=Object.keys(t)[0];return n?t[n].then(i=>(n==="json"&&(i=JSON.stringify(i)),new Response(i)[e]())):t[e]=a[e]()});this.raw=e,this.path=t,y(this,k,a),y(this,ke,{})}param(e){return e?C(this,re,xr).call(this,e):C(this,re,hr).call(this)}query(e){return Gs(this.url,e)}queries(e){return Xs(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((a,r)=>{t[r]=a}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Ds(this,e))}json(){return u(this,ce).call(this,"text").then(e=>JSON.parse(e))}text(){return u(this,ce).call(this,"text")}arrayBuffer(){return u(this,ce).call(this,"arrayBuffer")}blob(){return u(this,ce).call(this,"blob")}formData(){return u(this,ce).call(this,"formData")}addValidatedData(e,t){u(this,ke)[e]=t}valid(e){return u(this,ke)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Is](){return u(this,k)}get matchedRoutes(){return u(this,k)[0].map(([[,e]])=>e)}get routePath(){return u(this,k)[0].map(([[,e]])=>e)[this.routeIndex].path}},ke=new WeakMap,k=new WeakMap,re=new WeakSet,xr=function(e){const t=u(this,k)[0][this.routeIndex][1][e],a=C(this,re,qt).call(this,t);return a&&/\%/.test(a)?wa(a):a},hr=function(){const e={},t=Object.keys(u(this,k)[0][this.routeIndex][1]);for(const a of t){const r=C(this,re,qt).call(this,u(this,k)[0][this.routeIndex][1][a]);r!==void 0&&(e[a]=/\%/.test(r)?wa(r):r)}return e},qt=function(e){return u(this,k)[1]?u(this,k)[1][e]:e},ce=new WeakMap,Ga),Ks="text/plain; charset=UTF-8",jt=(e,t)=>({"Content-Type":e,...t}),nt,it,Q,je,ee,F,ot,Be,$e,ve,ct,lt,le,Me,Xa,Ws=(Xa=class{constructor(e,t){E(this,le);E(this,nt);E(this,it);g(this,"env",{});E(this,Q);g(this,"finalized",!1);g(this,"error");E(this,je);E(this,ee);E(this,F);E(this,ot);E(this,Be);E(this,$e);E(this,ve);E(this,ct);E(this,lt);g(this,"render",(...e)=>(u(this,Be)??y(this,Be,t=>this.html(t)),u(this,Be).call(this,...e)));g(this,"setLayout",e=>y(this,ot,e));g(this,"getLayout",()=>u(this,ot));g(this,"setRenderer",e=>{y(this,Be,e)});g(this,"header",(e,t,a)=>{this.finalized&&y(this,F,new Response(u(this,F).body,u(this,F)));const r=u(this,F)?u(this,F).headers:u(this,ve)??y(this,ve,new Headers);t===void 0?r.delete(e):a!=null&&a.append?r.append(e,t):r.set(e,t)});g(this,"status",e=>{y(this,je,e)});g(this,"set",(e,t)=>{u(this,Q)??y(this,Q,new Map),u(this,Q).set(e,t)});g(this,"get",e=>u(this,Q)?u(this,Q).get(e):void 0);g(this,"newResponse",(...e)=>C(this,le,Me).call(this,...e));g(this,"body",(e,t,a)=>C(this,le,Me).call(this,e,t,a));g(this,"text",(e,t,a)=>!u(this,ve)&&!u(this,je)&&!t&&!a&&!this.finalized?new Response(e):C(this,le,Me).call(this,e,t,jt(Ks,a)));g(this,"json",(e,t,a)=>C(this,le,Me).call(this,JSON.stringify(e),t,jt("application/json",a)));g(this,"html",(e,t,a)=>{const r=n=>C(this,le,Me).call(this,n,t,jt("text/html; charset=UTF-8",a));return typeof e=="object"?tr(e,Za.Stringify,!1,{}).then(r):r(e)});g(this,"redirect",(e,t)=>{const a=String(e);return this.header("Location",/[^\x00-\xFF]/.test(a)?encodeURI(a):a),this.newResponse(null,t??302)});g(this,"notFound",()=>(u(this,$e)??y(this,$e,()=>new Response),u(this,$e).call(this,this)));y(this,nt,e),t&&(y(this,ee,t.executionCtx),this.env=t.env,y(this,$e,t.notFoundHandler),y(this,lt,t.path),y(this,ct,t.matchResult))}get req(){return u(this,it)??y(this,it,new mr(u(this,nt),u(this,lt),u(this,ct))),u(this,it)}get event(){if(u(this,ee)&&"respondWith"in u(this,ee))return u(this,ee);throw Error("This context has no FetchEvent")}get executionCtx(){if(u(this,ee))return u(this,ee);throw Error("This context has no ExecutionContext")}get res(){return u(this,F)||y(this,F,new Response(null,{headers:u(this,ve)??y(this,ve,new Headers)}))}set res(e){if(u(this,F)&&e){e=new Response(e.body,e);for(const[t,a]of u(this,F).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=u(this,F).headers.getSetCookie();e.headers.delete("set-cookie");for(const n of r)e.headers.append("set-cookie",n)}else e.headers.set(t,a)}y(this,F,e),this.finalized=!0}get var(){return u(this,Q)?Object.fromEntries(u(this,Q)):{}}},nt=new WeakMap,it=new WeakMap,Q=new WeakMap,je=new WeakMap,ee=new WeakMap,F=new WeakMap,ot=new WeakMap,Be=new WeakMap,$e=new WeakMap,ve=new WeakMap,ct=new WeakMap,lt=new WeakMap,le=new WeakSet,Me=function(e,t,a){const r=u(this,F)?new Headers(u(this,F).headers):u(this,ve)??new Headers;if(typeof t=="object"&&"headers"in t){const i=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,c]of i)o.toLowerCase()==="set-cookie"?r.append(o,c):r.set(o,c)}if(a)for(const[i,o]of Object.entries(a))if(typeof o=="string")r.set(i,o);else{r.delete(i);for(const c of o)r.append(i,c)}const n=typeof t=="number"?t:(t==null?void 0:t.status)??u(this,je);return new Response(e,{status:n,headers:r})},Xa),I="ALL",zs="all",Vs=["get","post","put","delete","options","patch"],br="Can not add a route since the matcher is already built.",gr=class extends Error{},qs="__COMPOSED_HANDLER",Js=e=>e.text("404 Not Found",404),Ta=(e,t)=>{if("getResponse"in e){const a=e.getResponse();return t.newResponse(a.body,a)}return console.error(e),t.text("Internal Server Error",500)},H,D,vr,G,ge,Et,Nt,Ka,yr=(Ka=class{constructor(t={}){E(this,D);g(this,"get");g(this,"post");g(this,"put");g(this,"delete");g(this,"options");g(this,"patch");g(this,"all");g(this,"on");g(this,"use");g(this,"router");g(this,"getPath");g(this,"_basePath","/");E(this,H,"/");g(this,"routes",[]);E(this,G,Js);g(this,"errorHandler",Ta);g(this,"onError",t=>(this.errorHandler=t,this));g(this,"notFound",t=>(y(this,G,t),this));g(this,"fetch",(t,...a)=>C(this,D,Nt).call(this,t,a[1],a[0],t.method));g(this,"request",(t,a,r,n)=>t instanceof Request?this.fetch(a?new Request(t,a):t,r,n):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${De("/",t)}`,a),r,n)));g(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(C(this,D,Nt).call(this,t.request,t,void 0,t.request.method))})});[...Vs,zs].forEach(i=>{this[i]=(o,...c)=>(typeof o=="string"?y(this,H,o):C(this,D,ge).call(this,i,u(this,H),o),c.forEach(l=>{C(this,D,ge).call(this,i,u(this,H),l)}),this)}),this.on=(i,o,...c)=>{for(const l of[o].flat()){y(this,H,l);for(const d of[i].flat())c.map(p=>{C(this,D,ge).call(this,d.toUpperCase(),u(this,H),p)})}return this},this.use=(i,...o)=>(typeof i=="string"?y(this,H,i):(y(this,H,"*"),o.unshift(i)),o.forEach(c=>{C(this,D,ge).call(this,I,u(this,H),c)}),this);const{strict:r,...n}=t;Object.assign(this,n),this.getPath=r??!0?t.getPath??dr:Hs}route(t,a){const r=this.basePath(t);return a.routes.map(n=>{var o;let i;a.errorHandler===Ta?i=n.handler:(i=async(c,l)=>(await Na([],a.errorHandler)(c,()=>n.handler(c,l))).res,i[qs]=n.handler),C(o=r,D,ge).call(o,n.method,n.path,i)}),this}basePath(t){const a=C(this,D,vr).call(this);return a._basePath=De(this._basePath,t),a}mount(t,a,r){let n,i;r&&(typeof r=="function"?i=r:(i=r.optionHandler,r.replaceRequest===!1?n=l=>l:n=r.replaceRequest));const o=i?l=>{const d=i(l);return Array.isArray(d)?d:[d]}:l=>{let d;try{d=l.executionCtx}catch{}return[l.env,d]};n||(n=(()=>{const l=De(this._basePath,t),d=l==="/"?0:l.length;return p=>{const f=new URL(p.url);return f.pathname=f.pathname.slice(d)||"/",new Request(f,p)}})());const c=async(l,d)=>{const p=await a(n(l.req.raw),...o(l));if(p)return p;await d()};return C(this,D,ge).call(this,I,De(t,"*"),c),this}},H=new WeakMap,D=new WeakSet,vr=function(){const t=new yr({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,y(t,G,u(this,G)),t.routes=this.routes,t},G=new WeakMap,ge=function(t,a,r){t=t.toUpperCase(),a=De(this._basePath,a);const n={basePath:this._basePath,path:a,method:t,handler:r};this.router.add(t,a,[r,n]),this.routes.push(n)},Et=function(t,a){if(t instanceof Error)return this.errorHandler(t,a);throw t},Nt=function(t,a,r,n){if(n==="HEAD")return(async()=>new Response(null,await C(this,D,Nt).call(this,t,a,r,"GET")))();const i=this.getPath(t,{env:r}),o=this.router.match(n,i),c=new Ws(t,{path:i,matchResult:o,env:r,executionCtx:a,notFoundHandler:u(this,G)});if(o[0].length===1){let d;try{d=o[0][0][0][0](c,async()=>{c.res=await u(this,G).call(this,c)})}catch(p){return C(this,D,Et).call(this,p,c)}return d instanceof Promise?d.then(p=>p||(c.finalized?c.res:u(this,G).call(this,c))).catch(p=>C(this,D,Et).call(this,p,c)):d??u(this,G).call(this,c)}const l=Na(o[0],this.errorHandler,u(this,G));return(async()=>{try{const d=await l(c);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return C(this,D,Et).call(this,d,c)}})()},Ka),Rt="[^/]+",Je=".*",Ye="(?:|/.*)",Le=Symbol(),Ys=new Set(".\\+*[^]$()");function Zs(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===Je||e===Ye?1:t===Je||t===Ye?-1:e===Rt?1:t===Rt?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var Ee,Ne,X,Wa,Jt=(Wa=class{constructor(){E(this,Ee);E(this,Ne);E(this,X,Object.create(null))}insert(t,a,r,n,i){if(t.length===0){if(u(this,Ee)!==void 0)throw Le;if(i)return;y(this,Ee,a);return}const[o,...c]=t,l=o==="*"?c.length===0?["","",Je]:["","",Rt]:o==="/*"?["","",Ye]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(l){const p=l[1];let f=l[2]||Rt;if(p&&l[2]&&(f===".*"||(f=f.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(f))))throw Le;if(d=u(this,X)[f],!d){if(Object.keys(u(this,X)).some(m=>m!==Je&&m!==Ye))throw Le;if(i)return;d=u(this,X)[f]=new Jt,p!==""&&y(d,Ne,n.varIndex++)}!i&&p!==""&&r.push([p,u(d,Ne)])}else if(d=u(this,X)[o],!d){if(Object.keys(u(this,X)).some(p=>p.length>1&&p!==Je&&p!==Ye))throw Le;if(i)return;d=u(this,X)[o]=new Jt}d.insert(c,a,r,n,i)}buildRegExpStr(){const a=Object.keys(u(this,X)).sort(Zs).map(r=>{const n=u(this,X)[r];return(typeof u(n,Ne)=="number"?`(${r})@${u(n,Ne)}`:Ys.has(r)?`\\${r}`:r)+n.buildRegExpStr()});return typeof u(this,Ee)=="number"&&a.unshift(`#${u(this,Ee)}`),a.length===0?"":a.length===1?a[0]:"(?:"+a.join("|")+")"}},Ee=new WeakMap,Ne=new WeakMap,X=new WeakMap,Wa),It,dt,za,Qs=(za=class{constructor(){E(this,It,{varIndex:0});E(this,dt,new Jt)}insert(e,t,a){const r=[],n=[];for(let o=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const d=`@\\${o}`;return n[o]=[d,l],o++,c=!0,d}),!c)break}const i=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=n.length-1;o>=0;o--){const[c]=n[o];for(let l=i.length-1;l>=0;l--)if(i[l].indexOf(c)!==-1){i[l]=i[l].replace(c,n[o][1]);break}}return u(this,dt).insert(i,t,r,u(this,It),a),r}buildRegExp(){let e=u(this,dt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const a=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,i,o)=>i!==void 0?(a[++t]=Number(i),"$()"):(o!==void 0&&(r[Number(o)]=++t),"")),[new RegExp(`^${e}`),a,r]}},It=new WeakMap,dt=new WeakMap,za),Er=[],en=[/^$/,[],Object.create(null)],wt=Object.create(null);function Nr(e){return wt[e]??(wt[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,a)=>a?`\\${a}`:"(?:|/.*)")}$`))}function tn(){wt=Object.create(null)}function an(e){var d;const t=new Qs,a=[];if(e.length===0)return en;const r=e.map(p=>[!/\*|\/:/.test(p[0]),...p]).sort(([p,f],[m,x])=>p?1:m?-1:f.length-x.length),n=Object.create(null);for(let p=0,f=-1,m=r.length;p<m;p++){const[x,b,h]=r[p];x?n[b]=[h.map(([N])=>[N,Object.create(null)]),Er]:f++;let v;try{v=t.insert(b,f,x)}catch(N){throw N===Le?new gr(b):N}x||(a[f]=h.map(([N,T])=>{const _=Object.create(null);for(T-=1;T>=0;T--){const[A,L]=v[T];_[A]=L}return[N,_]}))}const[i,o,c]=t.buildRegExp();for(let p=0,f=a.length;p<f;p++)for(let m=0,x=a[p].length;m<x;m++){const b=(d=a[p][m])==null?void 0:d[1];if(!b)continue;const h=Object.keys(b);for(let v=0,N=h.length;v<N;v++)b[h[v]]=c[b[h[v]]]}const l=[];for(const p in o)l[p]=a[o[p]];return[i,l,n]}function Se(e,t){if(e){for(const a of Object.keys(e).sort((r,n)=>n.length-r.length))if(Nr(a).test(t))return[...e[a]]}}var de,pe,We,wr,Tr,Va,rn=(Va=class{constructor(){E(this,We);g(this,"name","RegExpRouter");E(this,de);E(this,pe);y(this,de,{[I]:Object.create(null)}),y(this,pe,{[I]:Object.create(null)})}add(e,t,a){var c;const r=u(this,de),n=u(this,pe);if(!r||!n)throw new Error(br);r[e]||[r,n].forEach(l=>{l[e]=Object.create(null),Object.keys(l[I]).forEach(d=>{l[e][d]=[...l[I][d]]})}),t==="/*"&&(t="*");const i=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const l=Nr(t);e===I?Object.keys(r).forEach(d=>{var p;(p=r[d])[t]||(p[t]=Se(r[d],t)||Se(r[I],t)||[])}):(c=r[e])[t]||(c[t]=Se(r[e],t)||Se(r[I],t)||[]),Object.keys(r).forEach(d=>{(e===I||e===d)&&Object.keys(r[d]).forEach(p=>{l.test(p)&&r[d][p].push([a,i])})}),Object.keys(n).forEach(d=>{(e===I||e===d)&&Object.keys(n[d]).forEach(p=>l.test(p)&&n[d][p].push([a,i]))});return}const o=pr(t)||[t];for(let l=0,d=o.length;l<d;l++){const p=o[l];Object.keys(n).forEach(f=>{var m;(e===I||e===f)&&((m=n[f])[p]||(m[p]=[...Se(r[f],p)||Se(r[I],p)||[]]),n[f][p].push([a,i-d+l+1]))})}}match(e,t){tn();const a=C(this,We,wr).call(this);return this.match=(r,n)=>{const i=a[r]||a[I],o=i[2][n];if(o)return o;const c=n.match(i[0]);if(!c)return[[],Er];const l=c.indexOf("",1);return[i[1][l],c]},this.match(e,t)}},de=new WeakMap,pe=new WeakMap,We=new WeakSet,wr=function(){const e=Object.create(null);return Object.keys(u(this,pe)).concat(Object.keys(u(this,de))).forEach(t=>{e[t]||(e[t]=C(this,We,Tr).call(this,t))}),y(this,de,y(this,pe,void 0)),e},Tr=function(e){const t=[];let a=e===I;return[u(this,de),u(this,pe)].forEach(r=>{const n=r[e]?Object.keys(r[e]).map(i=>[i,r[e][i]]):[];n.length!==0?(a||(a=!0),t.push(...n)):e!==I&&t.push(...Object.keys(r[I]).map(i=>[i,r[I][i]]))}),a?an(t):null},Va),ue,te,qa,sn=(qa=class{constructor(e){g(this,"name","SmartRouter");E(this,ue,[]);E(this,te,[]);y(this,ue,e.routers)}add(e,t,a){if(!u(this,te))throw new Error(br);u(this,te).push([e,t,a])}match(e,t){if(!u(this,te))throw new Error("Fatal error");const a=u(this,ue),r=u(this,te),n=a.length;let i=0,o;for(;i<n;i++){const c=a[i];try{for(let l=0,d=r.length;l<d;l++)c.add(...r[l]);o=c.match(e,t)}catch(l){if(l instanceof gr)continue;throw l}this.match=c.match.bind(c),y(this,ue,[c]),y(this,te,void 0);break}if(i===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(u(this,te)||u(this,ue).length!==1)throw new Error("No active router has been determined yet.");return u(this,ue)[0]}},ue=new WeakMap,te=new WeakMap,qa),Ve=Object.create(null),fe,U,we,He,M,ae,ye,Ja,Ar=(Ja=class{constructor(e,t,a){E(this,ae);E(this,fe);E(this,U);E(this,we);E(this,He,0);E(this,M,Ve);if(y(this,U,a||Object.create(null)),y(this,fe,[]),e&&t){const r=Object.create(null);r[e]={handler:t,possibleKeys:[],score:0},y(this,fe,[r])}y(this,we,[])}insert(e,t,a){y(this,He,++ha(this,He)._);let r=this;const n=Ps(t),i=[];for(let o=0,c=n.length;o<c;o++){const l=n[o],d=n[o+1],p=Bs(l,d),f=Array.isArray(p)?p[0]:l;if(f in u(r,U)){r=u(r,U)[f],p&&i.push(p[1]);continue}u(r,U)[f]=new Ar,p&&(u(r,we).push(p),i.push(p[1])),r=u(r,U)[f]}return u(r,fe).push({[e]:{handler:a,possibleKeys:i.filter((o,c,l)=>l.indexOf(o)===c),score:u(this,He)}}),r}search(e,t){var c;const a=[];y(this,M,Ve);let n=[this];const i=lr(t),o=[];for(let l=0,d=i.length;l<d;l++){const p=i[l],f=l===d-1,m=[];for(let x=0,b=n.length;x<b;x++){const h=n[x],v=u(h,U)[p];v&&(y(v,M,u(h,M)),f?(u(v,U)["*"]&&a.push(...C(this,ae,ye).call(this,u(v,U)["*"],e,u(h,M))),a.push(...C(this,ae,ye).call(this,v,e,u(h,M)))):m.push(v));for(let N=0,T=u(h,we).length;N<T;N++){const _=u(h,we)[N],A=u(h,M)===Ve?{}:{...u(h,M)};if(_==="*"){const se=u(h,U)["*"];se&&(a.push(...C(this,ae,ye).call(this,se,e,u(h,M))),y(se,M,A),m.push(se));continue}const[L,_e,he]=_;if(!p&&!(he instanceof RegExp))continue;const J=u(h,U)[L],ps=i.slice(l).join("/");if(he instanceof RegExp){const se=he.exec(ps);if(se){if(A[_e]=se[0],a.push(...C(this,ae,ye).call(this,J,e,u(h,M),A)),Object.keys(u(J,U)).length){y(J,M,A);const Lt=((c=se[0].match(/\//))==null?void 0:c.length)??0;(o[Lt]||(o[Lt]=[])).push(J)}continue}}(he===!0||he.test(p))&&(A[_e]=p,f?(a.push(...C(this,ae,ye).call(this,J,e,A,u(h,M))),u(J,U)["*"]&&a.push(...C(this,ae,ye).call(this,u(J,U)["*"],e,A,u(h,M)))):(y(J,M,A),m.push(J)))}}n=m.concat(o.shift()??[])}return a.length>1&&a.sort((l,d)=>l.score-d.score),[a.map(({handler:l,params:d})=>[l,d])]}},fe=new WeakMap,U=new WeakMap,we=new WeakMap,He=new WeakMap,M=new WeakMap,ae=new WeakSet,ye=function(e,t,a,r){const n=[];for(let i=0,o=u(e,fe).length;i<o;i++){const c=u(e,fe)[i],l=c[t]||c[I],d={};if(l!==void 0&&(l.params=Object.create(null),n.push(l),a!==Ve||r&&r!==Ve))for(let p=0,f=l.possibleKeys.length;p<f;p++){const m=l.possibleKeys[p],x=d[l.score];l.params[m]=r!=null&&r[m]&&!x?r[m]:a[m]??(r==null?void 0:r[m]),d[l.score]=!0}}return n},Ja),Te,Ya,nn=(Ya=class{constructor(){g(this,"name","TrieRouter");E(this,Te);y(this,Te,new Ar)}add(e,t,a){const r=pr(t);if(r){for(let n=0,i=r.length;n<i;n++)u(this,Te).insert(e,r[n],a);return}u(this,Te).insert(e,t,a)}match(e,t){return u(this,Te).search(e,t)}},Te=new WeakMap,Ya),Cr=class extends yr{constructor(e={}){super(e),this.router=e.router??new sn({routers:[new rn,new nn]})}},on=e=>{const a={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(i=>typeof i=="string"?i==="*"?()=>i:o=>i===o?o:null:typeof i=="function"?i:o=>i.includes(o)?o:null)(a.origin),n=(i=>typeof i=="function"?i:Array.isArray(i)?()=>i:()=>[])(a.allowMethods);return async function(o,c){var p;function l(f,m){o.res.headers.set(f,m)}const d=await r(o.req.header("origin")||"",o);if(d&&l("Access-Control-Allow-Origin",d),a.origin!=="*"){const f=o.req.header("Vary");f?l("Vary",f):l("Vary","Origin")}if(a.credentials&&l("Access-Control-Allow-Credentials","true"),(p=a.exposeHeaders)!=null&&p.length&&l("Access-Control-Expose-Headers",a.exposeHeaders.join(",")),o.req.method==="OPTIONS"){a.maxAge!=null&&l("Access-Control-Max-Age",a.maxAge.toString());const f=await n(o.req.header("origin")||"",o);f.length&&l("Access-Control-Allow-Methods",f.join(","));let m=a.allowHeaders;if(!(m!=null&&m.length)){const x=o.req.header("Access-Control-Request-Headers");x&&(m=x.split(/\s*,\s*/))}return m!=null&&m.length&&(l("Access-Control-Allow-Headers",m.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await c()}};function cn(){const{process:e,Deno:t}=globalThis;return!(typeof(t==null?void 0:t.noColor)=="boolean"?t.noColor:e!==void 0?"NO_COLOR"in(e==null?void 0:e.env):!1)}async function ln(){const{navigator:e}=globalThis,t="cloudflare:workers";return!(e!==void 0&&e.userAgent==="Cloudflare-Workers"?await(async()=>{try{return"NO_COLOR"in((await import(t)).env??{})}catch{return!1}})():!cn())}var dn=e=>{const[t,a]=[",","."];return e.map(n=>n.replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+t)).join(a)},pn=e=>{const t=Date.now()-e;return dn([t<1e3?t+"ms":Math.round(t/1e3)+"s"])},un=async e=>{if(await ln())switch(e/100|0){case 5:return`\x1B[31m${e}\x1B[0m`;case 4:return`\x1B[33m${e}\x1B[0m`;case 3:return`\x1B[36m${e}\x1B[0m`;case 2:return`\x1B[32m${e}\x1B[0m`}return`${e}`};async function Aa(e,t,a,r,n=0,i){const o=t==="<--"?`${t} ${a} ${r}`:`${t} ${a} ${r} ${await un(n)} ${i}`;e(o)}var fn=(e=console.log)=>async function(a,r){const{method:n,url:i}=a.req,o=i.slice(i.indexOf("/",8));await Aa(e,"<--",n,o);const c=Date.now();await r(),await Aa(e,"-->",n,o,a.res.status,pn(c))},mn=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,Ca=(e,t=hn)=>{const a=/\.([a-zA-Z0-9]+?)$/,r=e.match(a);if(!r)return;let n=t[r[1]];return n&&n.startsWith("text")&&(n+="; charset=utf-8"),n},xn={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},hn=xn,bn=(...e)=>{let t=e.filter(n=>n!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const a=t.split("/"),r=[];for(const n of a)n===".."&&r.length>0&&r.at(-1)!==".."?r.pop():n!=="."&&r.push(n);return r.join("/")||"."},_r={br:".br",zstd:".zst",gzip:".gz"},gn=Object.keys(_r),yn="index.html",vn=e=>{const t=e.root??"./",a=e.path,r=e.join??bn;return async(n,i)=>{var p,f,m,x;if(n.finalized)return i();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(n.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((p=e.onNotFound)==null?void 0:p.call(e,n.req.path,n)),i()}let c=r(t,!a&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(c)&&(c=r(c,yn));const l=e.getContent;let d=await l(c,n);if(d instanceof Response)return n.newResponse(d.body,d);if(d){const b=e.mimes&&Ca(c,e.mimes)||Ca(c);if(n.header("Content-Type",b||"application/octet-stream"),e.precompressed&&(!b||mn.test(b))){const h=new Set((f=n.req.header("Accept-Encoding"))==null?void 0:f.split(",").map(v=>v.trim()));for(const v of gn){if(!h.has(v))continue;const N=await l(c+_r[v],n);if(N){d=N,n.header("Content-Encoding",v),n.header("Vary","Accept-Encoding",{append:!0});break}}}return await((m=e.onFound)==null?void 0:m.call(e,c,n)),n.body(d)}await((x=e.onNotFound)==null?void 0:x.call(e,c,n)),await i()}},En=async(e,t)=>{let a;t&&t.manifest?typeof t.manifest=="string"?a=JSON.parse(t.manifest):a=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?a=JSON.parse(__STATIC_CONTENT_MANIFEST):a=__STATIC_CONTENT_MANIFEST;let r;t&&t.namespace?r=t.namespace:r=__STATIC_CONTENT;const n=a[e]||e;if(!n)return null;const i=await r.get(n,{type:"stream"});return i||null},Nn=e=>async function(a,r){return vn({...e,getContent:async i=>En(i,{manifest:e.manifest,namespace:e.namespace?e.namespace:a.env?a.env.__STATIC_CONTENT:void 0})})(a,r)},wn=e=>Nn(e),et="_hp",Tn={Change:"Input",DoubleClick:"DblClick"},An={svg:"2000/svg",math:"1998/Math/MathML"},tt=[],Yt=new WeakMap,Ke=void 0,Cn=()=>Ke,Z=e=>"t"in e,Bt={onClick:["click",!1]},_a=e=>{if(!e.startsWith("on"))return;if(Bt[e])return Bt[e];const t=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(t){const[,a,r]=t;return Bt[e]=[(Tn[a]||a).toLowerCase(),!!r]}},Sa=(e,t)=>Ke&&e instanceof SVGElement&&/[A-Z]/.test(t)&&(t in e.style||t.match(/^(?:o|pai|str|u|ve)/))?t.replace(/([A-Z])/g,"-$1").toLowerCase():t,_n=(e,t,a)=>{var r;t||(t={});for(let n in t){const i=t[n];if(n!=="children"&&(!a||a[n]!==i)){n=St(n);const o=_a(n);if(o){if((a==null?void 0:a[n])!==i&&(a&&e.removeEventListener(o[0],a[n],o[1]),i!=null)){if(typeof i!="function")throw new Error(`Event handler for "${n}" is not a function`);e.addEventListener(o[0],i,o[1])}}else if(n==="dangerouslySetInnerHTML"&&i)e.innerHTML=i.__html;else if(n==="ref"){let c;typeof i=="function"?c=i(e)||(()=>i(null)):i&&"current"in i&&(i.current=e,c=()=>i.current=null),Yt.set(e,c)}else if(n==="style"){const c=e.style;typeof i=="string"?c.cssText=i:(c.cssText="",i!=null&&or(i,c.setProperty.bind(c)))}else{if(n==="value"){const l=e.nodeName;if(l==="INPUT"||l==="TEXTAREA"||l==="SELECT"){if(e.value=i==null||i===!1?null:i,l==="TEXTAREA"){e.textContent=i;continue}else if(l==="SELECT"){e.selectedIndex===-1&&(e.selectedIndex=0);continue}}}else(n==="checked"&&e.nodeName==="INPUT"||n==="selected"&&e.nodeName==="OPTION")&&(e[n]=i);const c=Sa(e,n);i==null||i===!1?e.removeAttribute(c):i===!0?e.setAttribute(c,""):typeof i=="string"||typeof i=="number"?e.setAttribute(c,i):e.setAttribute(c,i.toString())}}}if(a)for(let n in a){const i=a[n];if(n!=="children"&&!(n in t)){n=St(n);const o=_a(n);o?e.removeEventListener(o[0],i,o[1]):n==="ref"?(r=Yt.get(e))==null||r():e.removeAttribute(Sa(e,n))}}},Sn=(e,t)=>{t[O][0]=0,tt.push([e,t]);const a=t.tag[sa]||t.tag,r=a.defaultProps?{...a.defaultProps,...t.props}:t.props;try{return[a.call(null,r)]}finally{tt.pop()}},Sr=(e,t,a,r,n)=>{var i,o;(i=e.vR)!=null&&i.length&&(r.push(...e.vR),delete e.vR),typeof e.tag=="function"&&((o=e[O][1][Dr])==null||o.forEach(c=>n.push(c))),e.vC.forEach(c=>{var l;if(Z(c))a.push(c);else if(typeof c.tag=="function"||c.tag===""){c.c=t;const d=a.length;if(Sr(c,t,a,r,n),c.s){for(let p=d;p<a.length;p++)a[p].s=!0;c.s=!1}}else a.push(c),(l=c.vR)!=null&&l.length&&(r.push(...c.vR),delete c.vR)})},Rn=e=>{for(;;e=e.tag===et||!e.vC||!e.pP?e.nN:e.vC[0]){if(!e)return null;if(e.tag!==et&&e.e)return e.e}},Rr=e=>{var t,a,r,n,i,o;Z(e)||((a=(t=e[O])==null?void 0:t[1][Dr])==null||a.forEach(c=>{var l;return(l=c[2])==null?void 0:l.call(c)}),(r=Yt.get(e.e))==null||r(),e.p===2&&((n=e.vC)==null||n.forEach(c=>c.p=2)),(i=e.vC)==null||i.forEach(Rr)),e.p||((o=e.e)==null||o.remove(),delete e.e),typeof e.tag=="function"&&(qe.delete(e),Tt.delete(e),delete e[O][3],e.a=!0)},Or=(e,t,a)=>{e.c=t,Ir(e,t,a)},Ra=(e,t)=>{if(t){for(let a=0,r=e.length;a<r;a++)if(e[a]===t)return a}},Oa=Symbol(),Ir=(e,t,a)=>{var d;const r=[],n=[],i=[];Sr(e,t,r,n,i),n.forEach(Rr);const o=a?void 0:t.childNodes;let c,l=null;if(a)c=-1;else if(!o.length)c=0;else{const p=Ra(o,Rn(e.nN));p!==void 0?(l=o[p],c=p):c=Ra(o,(d=r.find(f=>f.tag!==et&&f.e))==null?void 0:d.e)??-1,c===-1&&(a=!0)}for(let p=0,f=r.length;p<f;p++,c++){const m=r[p];let x;if(m.s&&m.e)x=m.e,m.s=!1;else{const b=a||!m.e;Z(m)?(m.e&&m.d&&(m.e.textContent=m.t),m.d=!1,x=m.e||(m.e=document.createTextNode(m.t))):(x=m.e||(m.e=m.n?document.createElementNS(m.n,m.tag):document.createElement(m.tag)),_n(x,m.props,m.pP),Ir(m,x,b))}m.tag===et?c--:a?x.parentNode||t.appendChild(x):o[c]!==x&&o[c-1]!==x&&(o[c+1]===x?t.appendChild(o[c]):t.insertBefore(x,l||o[c]||null))}if(e.pP&&delete e.pP,i.length){const p=[],f=[];i.forEach(([,m,,x,b])=>{m&&p.push(m),x&&f.push(x),b==null||b()}),p.forEach(m=>m()),f.length&&requestAnimationFrame(()=>{f.forEach(m=>m())})}},On=(e,t)=>!!(e&&e.length===t.length&&e.every((a,r)=>a[1]===t[r][1])),Tt=new WeakMap,Zt=(e,t,a)=>{var i,o,c,l,d,p;const r=!a&&t.pC;a&&(t.pC||(t.pC=t.vC));let n;try{a||(a=typeof t.tag=="function"?Sn(e,t):ut(t.props.children)),((i=a[0])==null?void 0:i.tag)===""&&a[0][zt]&&(n=a[0][zt],e[5].push([e,n,t]));const f=r?[...t.pC]:t.vC?[...t.vC]:void 0,m=[];let x;for(let b=0;b<a.length;b++){Array.isArray(a[b])&&a.splice(b,1,...a[b].flat());let h=In(a[b]);if(h){typeof h.tag=="function"&&!h.tag[ar]&&(Xe.length>0&&(h[O][2]=Xe.map(N=>[N,N.values.at(-1)])),(o=e[5])!=null&&o.length&&(h[O][3]=e[5].at(-1)));let v;if(f&&f.length){const N=f.findIndex(Z(h)?T=>Z(T):h.key!==void 0?T=>T.key===h.key&&T.tag===h.tag:T=>T.tag===h.tag);N!==-1&&(v=f[N],f.splice(N,1))}if(v)if(Z(h))v.t!==h.t&&(v.t=h.t,v.d=!0),h=v;else{const N=v.pP=v.props;if(v.props=h.props,v.f||(v.f=h.f||t.f),typeof h.tag=="function"){const T=v[O][2];v[O][2]=h[O][2]||[],v[O][3]=h[O][3],!v.f&&((v.o||v)===h.o||(l=(c=v.tag)[bs])!=null&&l.call(c,N,v.props))&&On(T,v[O][2])&&(v.s=!0)}h=v}else if(!Z(h)&&Ke){const N=ze(Ke);N&&(h.n=N)}if(!Z(h)&&!h.s&&(Zt(e,h),delete h.f),m.push(h),x&&!x.s&&!h.s)for(let N=x;N&&!Z(N);N=(d=N.vC)==null?void 0:d.at(-1))N.nN=h;x=h}}t.vR=r?[...t.vC,...f||[]]:f||[],t.vC=m,r&&delete t.pC}catch(f){if(t.f=!0,f===Oa){if(n)return;throw f}const[m,x,b]=((p=t[O])==null?void 0:p[3])||[];if(x){const h=()=>At([0,!1,e[2]],b),v=Tt.get(b)||[];v.push(h),Tt.set(b,v);const N=x(f,()=>{const T=Tt.get(b);if(T){const _=T.indexOf(h);if(_!==-1)return T.splice(_,1),h()}});if(N){if(e[0]===1)e[1]=!0;else if(Zt(e,b,[N]),(x.length===1||e!==m)&&b.c){Or(b,b.c,!1);return}throw Oa}}throw f}finally{n&&e[5].pop()}},In=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[O]=[0,[]];else{const t=An[e.tag];t&&(Ke||(Ke=sr("")),e.props.children=[{tag:Ke,props:{value:e.n=`http://www.w3.org/${t}`,children:e.props.children}}])}return e}},Ia=(e,t)=>{var a,r;(a=t[O][2])==null||a.forEach(([n,i])=>{n.values.push(i)});try{Zt(e,t,void 0)}catch{return}if(t.a){delete t.a;return}(r=t[O][2])==null||r.forEach(([n])=>{n.values.pop()}),(e[0]!==1||!e[1])&&Or(t,t.c,!1)},qe=new WeakMap,Da=[],At=async(e,t)=>{e[5]||(e[5]=[]);const a=qe.get(t);a&&a[0](void 0);let r;const n=new Promise(i=>r=i);if(qe.set(t,[r,()=>{e[2]?e[2](e,t,i=>{Ia(i,t)}).then(()=>r(t)):(Ia(e,t),r(t))}]),Da.length)Da.at(-1).add(t);else{await Promise.resolve();const i=qe.get(t);i&&(qe.delete(t),i[1]())}return n},Dn=(e,t,a)=>({tag:et,props:{children:e},key:a,e:t,p:1}),$t=0,Dr=1,Ht=2,Gt=3,Xt=new WeakMap,Mr=(e,t)=>!e||!t||e.length!==t.length||t.some((a,r)=>a!==e[r]),Mn=void 0,Ma=[],Ln=e=>{var o;const t=()=>typeof e=="function"?e():e,a=tt.at(-1);if(!a)return[t(),()=>{}];const[,r]=a,n=(o=r[O][1])[$t]||(o[$t]=[]),i=r[O][0]++;return n[i]||(n[i]=[t(),c=>{const l=Mn,d=n[i];if(typeof c=="function"&&(c=c(d[0])),!Object.is(c,d[0]))if(d[0]=c,Ma.length){const[p,f]=Ma.at(-1);Promise.all([p===3?r:At([p,!1,l],r),f]).then(([m])=>{if(!m||!(p===2||p===3))return;const x=m.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===m.vC&&At([p===3?1:0,!1,l],m)})})})}else At([0,!1,l],r)}])},la=(e,t)=>{var c;const a=tt.at(-1);if(!a)return e;const[,r]=a,n=(c=r[O][1])[Ht]||(c[Ht]=[]),i=r[O][0]++,o=n[i];return Mr(o==null?void 0:o[1],t)?n[i]=[e,t]:e=n[i][0],e},Un=e=>{const t=Xt.get(e);if(t){if(t.length===2)throw t[1];return t[0]}throw e.then(a=>Xt.set(e,[a]),a=>Xt.set(e,[void 0,a])),e},Fn=(e,t)=>{var c;const a=tt.at(-1);if(!a)return e();const[,r]=a,n=(c=r[O][1])[Gt]||(c[Gt]=[]),i=r[O][0]++,o=n[i];return Mr(o==null?void 0:o[1],t)&&(n[i]=[e(),t]),n[i][0]},Pn=sr({pending:!1,data:null,method:null,action:null}),La=new Set,kn=e=>{La.add(e),e.finally(()=>La.delete(e))},da=(e,t)=>Fn(()=>a=>{let r;e&&(typeof e=="function"?r=e(a)||(()=>{e(null)}):e&&"current"in e&&(e.current=a,r=()=>{e.current=null}));const n=t(a);return()=>{n==null||n(),r==null||r()}},[e]),Re=Object.create(null),bt=Object.create(null),xt=(e,t,a,r,n)=>{if(t!=null&&t.itemProp)return{tag:e,props:t,type:e,ref:t.ref};const i=document.head;let{onLoad:o,onError:c,precedence:l,blocking:d,...p}=t,f=null,m=!1;const x=gt[e];let b;if(x.length>0){const T=i.querySelectorAll(e);e:for(const _ of T)for(const A of gt[e])if(_.getAttribute(A)===t[A]){f=_;break e}if(!f){const _=x.reduce((A,L)=>t[L]===void 0?A:`${A}-${L}-${t[L]}`,e);m=!bt[_],f=bt[_]||(bt[_]=(()=>{const A=document.createElement(e);for(const L of x)t[L]!==void 0&&A.setAttribute(L,t[L]),t.rel&&A.setAttribute("rel",t.rel);return A})())}}else b=i.querySelectorAll(e);l=r?l??"":void 0,r&&(p[yt]=l);const h=la(T=>{if(x.length>0){let _=!1;for(const A of i.querySelectorAll(e)){if(_&&A.getAttribute(yt)!==l){i.insertBefore(T,A);return}A.getAttribute(yt)===l&&(_=!0)}i.appendChild(T)}else if(b){let _=!1;for(const A of b)if(A===T){_=!0;break}_||i.insertBefore(T,i.contains(b[0])?b[0]:i.querySelector(e)),b=void 0}},[l]),v=da(t.ref,T=>{var L;const _=x[0];if(a===2&&(T.innerHTML=""),(m||b)&&h(T),!c&&!o)return;let A=Re[L=T.getAttribute(_)]||(Re[L]=new Promise((_e,he)=>{T.addEventListener("load",_e),T.addEventListener("error",he)}));o&&(A=A.then(o)),c&&(A=A.catch(c)),A.catch(()=>{})});if(n&&d==="render"){const T=gt[e][0];if(t[T]){const _=t[T],A=Re[_]||(Re[_]=new Promise((L,_e)=>{h(f),f.addEventListener("load",L),f.addEventListener("error",_e)}));Un(A)}}const N={tag:e,type:e,props:{...p,ref:v},ref:v};return N.p=a,f&&(N.e=f),Dn(N,i)},jn=e=>{const t=Cn(),a=t&&ze(t);return a!=null&&a.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:xt("title",e,void 0,!1,!1)},Bn=e=>!e||["src","async"].some(t=>!e[t])?{tag:"script",props:e,type:"script",ref:e.ref}:xt("script",e,1,!1,!0),$n=e=>!e||!["href","precedence"].every(t=>t in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,xt("style",e,2,!0,!0)),Hn=e=>!e||["onLoad","onError"].some(t=>t in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:xt("link",e,1,"precedence"in e,!0),Gn=e=>xt("meta",e,void 0,!1,!1),Lr=Symbol(),Xn=e=>{const{action:t,...a}=e;typeof t!="function"&&(a.action=t);const[r,n]=Ln([null,!1]),i=la(async d=>{const p=d.isTrusted?t:d.detail[Lr];if(typeof p!="function")return;d.preventDefault();const f=new FormData(d.target);n([f,!0]);const m=p(f);m instanceof Promise&&(kn(m),await m),n([null,!0])},[]),o=da(e.ref,d=>(d.addEventListener("submit",i),()=>{d.removeEventListener("submit",i)})),[c,l]=r;return r[1]=!1,{tag:Pn,props:{value:{pending:c!==null,data:c,method:c?"post":null,action:c?t:null},children:{tag:"form",props:{...a,ref:o},type:"form",ref:o}},f:l}},Ur=(e,{formAction:t,...a})=>{if(typeof t=="function"){const r=la(n=>{n.preventDefault(),n.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Lr]:t}}))},[]);a.ref=da(a.ref,n=>(n.addEventListener("click",r),()=>{n.removeEventListener("click",r)}))}return{tag:e,props:a,type:e,ref:a.ref}},Kn=e=>Ur("input",e),Wn=e=>Ur("button",e);Object.assign(Vt,{title:jn,script:Bn,style:$n,link:Hn,meta:Gn,form:Xn,input:Kn,button:Wn});na(null);new TextEncoder;var zn=na(null),Vn=(e,t,a,r)=>(n,i)=>{const o="<!DOCTYPE html>",c=a?va(d=>a(d,e),{Layout:t,...i},n):n,l=hs`${B(o)}${va(zn.Provider,{value:e},c)}`;return e.html(l)},qn=(e,t)=>function(r,n){const i=r.getLayout()??Os;return e&&r.setLayout(o=>e({...o,Layout:i},r)),r.setRenderer(Vn(r,i,e)),n()};const Jn=qn(({children:e})=>s("html",{lang:"es",children:[s("head",{children:[s("meta",{charset:"UTF-8"}),s("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"}),s("title",{children:"Lyra Expenses - Sistema de Gastos y Viáticos"}),s("script",{src:"https://cdn.tailwindcss.com"}),s("link",{href:"https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",rel:"stylesheet"}),s("link",{href:"/static/styles.css",rel:"stylesheet"}),s("script",{src:"https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"}),s("script",{src:"https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"}),s("script",{src:"https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"}),s("meta",{name:"description",content:"Sistema ejecutivo de gestión de gastos y viáticos multiempresa con soporte multimoneda. Basado en el modelo 4-D: Dinero, Decisión, Dirección, Disciplina."}),s("meta",{name:"author",content:"Lyra - Asistente Estratégico"}),s("link",{rel:"icon",type:"image/x-icon",href:"data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAA"})]}),s("body",{className:"bg-primary",children:e})]})),q=new TextEncoder,Ae=new TextDecoder;function Fr(...e){const t=e.reduce((n,{length:i})=>n+i,0),a=new Uint8Array(t);let r=0;for(const n of e)a.set(n,r),r+=n.length;return a}function Yn(e){if(Uint8Array.prototype.toBase64)return e.toBase64();const t=32768,a=[];for(let r=0;r<e.length;r+=t)a.push(String.fromCharCode.apply(null,e.subarray(r,r+t)));return btoa(a.join(""))}function Zn(e){if(Uint8Array.fromBase64)return Uint8Array.fromBase64(e);const t=atob(e),a=new Uint8Array(t.length);for(let r=0;r<t.length;r++)a[r]=t.charCodeAt(r);return a}function Ct(e){if(Uint8Array.fromBase64)return Uint8Array.fromBase64(typeof e=="string"?e:Ae.decode(e),{alphabet:"base64url"});let t=e;t instanceof Uint8Array&&(t=Ae.decode(t)),t=t.replace(/-/g,"+").replace(/_/g,"/").replace(/\s/g,"");try{return Zn(t)}catch{throw new TypeError("The input to be decoded is not correctly encoded.")}}function Kt(e){let t=e;return typeof t=="string"&&(t=q.encode(t)),Uint8Array.prototype.toBase64?t.toBase64({alphabet:"base64url",omitPadding:!0}):Yn(t).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}class Ce extends Error{constructor(a,r){var n;super(a,r);g(this,"code","ERR_JOSE_GENERIC");this.name=this.constructor.name,(n=Error.captureStackTrace)==null||n.call(Error,this,this.constructor)}}g(Ce,"code","ERR_JOSE_GENERIC");class $ extends Ce{constructor(a,r,n="unspecified",i="unspecified"){super(a,{cause:{claim:n,reason:i,payload:r}});g(this,"code","ERR_JWT_CLAIM_VALIDATION_FAILED");g(this,"claim");g(this,"reason");g(this,"payload");this.claim=n,this.reason=i,this.payload=r}}g($,"code","ERR_JWT_CLAIM_VALIDATION_FAILED");class Qt extends Ce{constructor(a,r,n="unspecified",i="unspecified"){super(a,{cause:{claim:n,reason:i,payload:r}});g(this,"code","ERR_JWT_EXPIRED");g(this,"claim");g(this,"reason");g(this,"payload");this.claim=n,this.reason=i,this.payload=r}}g(Qt,"code","ERR_JWT_EXPIRED");class oe extends Ce{constructor(){super(...arguments);g(this,"code","ERR_JOSE_NOT_SUPPORTED")}}g(oe,"code","ERR_JOSE_NOT_SUPPORTED");class S extends Ce{constructor(){super(...arguments);g(this,"code","ERR_JWS_INVALID")}}g(S,"code","ERR_JWS_INVALID");class Dt extends Ce{constructor(){super(...arguments);g(this,"code","ERR_JWT_INVALID")}}g(Dt,"code","ERR_JWT_INVALID");class Pr extends Ce{constructor(a="signature verification failed",r){super(a,r);g(this,"code","ERR_JWS_SIGNATURE_VERIFICATION_FAILED")}}g(Pr,"code","ERR_JWS_SIGNATURE_VERIFICATION_FAILED");function z(e,t="algorithm.name"){return new TypeError(`CryptoKey does not support this operation, its ${t} must be ${e}`)}function Oe(e,t){return e.name===t}function Wt(e){return parseInt(e.name.slice(4),10)}function Qn(e){switch(e){case"ES256":return"P-256";case"ES384":return"P-384";case"ES512":return"P-521";default:throw new Error("unreachable")}}function ei(e,t){if(t&&!e.usages.includes(t))throw new TypeError(`CryptoKey does not support this operation, its usages must include ${t}.`)}function ti(e,t,a){switch(t){case"HS256":case"HS384":case"HS512":{if(!Oe(e.algorithm,"HMAC"))throw z("HMAC");const r=parseInt(t.slice(2),10);if(Wt(e.algorithm.hash)!==r)throw z(`SHA-${r}`,"algorithm.hash");break}case"RS256":case"RS384":case"RS512":{if(!Oe(e.algorithm,"RSASSA-PKCS1-v1_5"))throw z("RSASSA-PKCS1-v1_5");const r=parseInt(t.slice(2),10);if(Wt(e.algorithm.hash)!==r)throw z(`SHA-${r}`,"algorithm.hash");break}case"PS256":case"PS384":case"PS512":{if(!Oe(e.algorithm,"RSA-PSS"))throw z("RSA-PSS");const r=parseInt(t.slice(2),10);if(Wt(e.algorithm.hash)!==r)throw z(`SHA-${r}`,"algorithm.hash");break}case"Ed25519":case"EdDSA":{if(!Oe(e.algorithm,"Ed25519"))throw z("Ed25519");break}case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":{if(!Oe(e.algorithm,t))throw z(t);break}case"ES256":case"ES384":case"ES512":{if(!Oe(e.algorithm,"ECDSA"))throw z("ECDSA");const r=Qn(t);if(e.algorithm.namedCurve!==r)throw z(r,"algorithm.namedCurve");break}default:throw new TypeError("CryptoKey does not support this operation")}ei(e,a)}function kr(e,t,...a){var r;if(a=a.filter(Boolean),a.length>2){const n=a.pop();e+=`one of type ${a.join(", ")}, or ${n}.`}else a.length===2?e+=`one of type ${a[0]} or ${a[1]}.`:e+=`of type ${a[0]}.`;return t==null?e+=` Received ${t}`:typeof t=="function"&&t.name?e+=` Received function ${t.name}`:typeof t=="object"&&t!=null&&(r=t.constructor)!=null&&r.name&&(e+=` Received an instance of ${t.constructor.name}`),e}const ai=(e,...t)=>kr("Key must be ",e,...t);function jr(e,t,...a){return kr(`Key for the ${e} algorithm must be `,t,...a)}function Br(e){return(e==null?void 0:e[Symbol.toStringTag])==="CryptoKey"}function $r(e){return(e==null?void 0:e[Symbol.toStringTag])==="KeyObject"}const Hr=e=>Br(e)||$r(e),Gr=(...e)=>{const t=e.filter(Boolean);if(t.length===0||t.length===1)return!0;let a;for(const r of t){const n=Object.keys(r);if(!a||a.size===0){a=new Set(n);continue}for(const i of n){if(a.has(i))return!1;a.add(i)}}return!0};function ri(e){return typeof e=="object"&&e!==null}const at=e=>{if(!ri(e)||Object.prototype.toString.call(e)!=="[object Object]")return!1;if(Object.getPrototypeOf(e)===null)return!0;let t=e;for(;Object.getPrototypeOf(t)!==null;)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t},Xr=(e,t)=>{if(e.startsWith("RS")||e.startsWith("PS")){const{modulusLength:a}=t.algorithm;if(typeof a!="number"||a<2048)throw new TypeError(`${e} requires key modulusLength to be 2048 bits or larger`)}};function si(e){let t,a;switch(e.kty){case"AKP":{switch(e.alg){case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":t={name:e.alg},a=e.priv?["sign"]:["verify"];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"RSA":{switch(e.alg){case"PS256":case"PS384":case"PS512":t={name:"RSA-PSS",hash:`SHA-${e.alg.slice(-3)}`},a=e.d?["sign"]:["verify"];break;case"RS256":case"RS384":case"RS512":t={name:"RSASSA-PKCS1-v1_5",hash:`SHA-${e.alg.slice(-3)}`},a=e.d?["sign"]:["verify"];break;case"RSA-OAEP":case"RSA-OAEP-256":case"RSA-OAEP-384":case"RSA-OAEP-512":t={name:"RSA-OAEP",hash:`SHA-${parseInt(e.alg.slice(-3),10)||1}`},a=e.d?["decrypt","unwrapKey"]:["encrypt","wrapKey"];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"EC":{switch(e.alg){case"ES256":t={name:"ECDSA",namedCurve:"P-256"},a=e.d?["sign"]:["verify"];break;case"ES384":t={name:"ECDSA",namedCurve:"P-384"},a=e.d?["sign"]:["verify"];break;case"ES512":t={name:"ECDSA",namedCurve:"P-521"},a=e.d?["sign"]:["verify"];break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":t={name:"ECDH",namedCurve:e.crv},a=e.d?["deriveBits"]:[];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"OKP":{switch(e.alg){case"Ed25519":case"EdDSA":t={name:"Ed25519"},a=e.d?["sign"]:["verify"];break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":t={name:e.crv},a=e.d?["deriveBits"]:[];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}default:throw new oe('Invalid or unsupported JWK "kty" (Key Type) Parameter value')}return{algorithm:t,keyUsages:a}}const ni=async e=>{if(!e.alg)throw new TypeError('"alg" argument is required when "jwk.alg" is not present');const{algorithm:t,keyUsages:a}=si(e),r={...e};return r.kty!=="AKP"&&delete r.alg,delete r.use,crypto.subtle.importKey("jwk",r,t,e.ext??!(e.d||e.priv),e.key_ops??a)},Kr=(e,t,a,r,n)=>{if(n.crit!==void 0&&(r==null?void 0:r.crit)===void 0)throw new e('"crit" (Critical) Header Parameter MUST be integrity protected');if(!r||r.crit===void 0)return new Set;if(!Array.isArray(r.crit)||r.crit.length===0||r.crit.some(o=>typeof o!="string"||o.length===0))throw new e('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');let i;a!==void 0?i=new Map([...Object.entries(a),...t.entries()]):i=t;for(const o of r.crit){if(!i.has(o))throw new oe(`Extension Header Parameter "${o}" is not recognized`);if(n[o]===void 0)throw new e(`Extension Header Parameter "${o}" is missing`);if(i.get(o)&&r[o]===void 0)throw new e(`Extension Header Parameter "${o}" MUST be integrity protected`)}return new Set(r.crit)};function pa(e){return at(e)&&typeof e.kty=="string"}function ii(e){return e.kty!=="oct"&&(e.kty==="AKP"&&typeof e.priv=="string"||typeof e.d=="string")}function oi(e){return e.kty!=="oct"&&typeof e.d>"u"&&typeof e.priv>"u"}function ci(e){return e.kty==="oct"&&typeof e.k=="string"}let Pe;const Ua=async(e,t,a,r=!1)=>{Pe||(Pe=new WeakMap);let n=Pe.get(e);if(n!=null&&n[a])return n[a];const i=await ni({...t,alg:a});return r&&Object.freeze(e),n?n[a]=i:Pe.set(e,{[a]:i}),i},li=(e,t)=>{var o;Pe||(Pe=new WeakMap);let a=Pe.get(e);if(a!=null&&a[t])return a[t];const r=e.type==="public",n=!!r;let i;if(e.asymmetricKeyType==="x25519"){switch(t){case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":break;default:throw new TypeError("given KeyObject instance cannot be used for this algorithm")}i=e.toCryptoKey(e.asymmetricKeyType,n,r?[]:["deriveBits"])}if(e.asymmetricKeyType==="ed25519"){if(t!=="EdDSA"&&t!=="Ed25519")throw new TypeError("given KeyObject instance cannot be used for this algorithm");i=e.toCryptoKey(e.asymmetricKeyType,n,[r?"verify":"sign"])}switch(e.asymmetricKeyType){case"ml-dsa-44":case"ml-dsa-65":case"ml-dsa-87":{if(t!==e.asymmetricKeyType.toUpperCase())throw new TypeError("given KeyObject instance cannot be used for this algorithm");i=e.toCryptoKey(e.asymmetricKeyType,n,[r?"verify":"sign"])}}if(e.asymmetricKeyType==="rsa"){let c;switch(t){case"RSA-OAEP":c="SHA-1";break;case"RS256":case"PS256":case"RSA-OAEP-256":c="SHA-256";break;case"RS384":case"PS384":case"RSA-OAEP-384":c="SHA-384";break;case"RS512":case"PS512":case"RSA-OAEP-512":c="SHA-512";break;default:throw new TypeError("given KeyObject instance cannot be used for this algorithm")}if(t.startsWith("RSA-OAEP"))return e.toCryptoKey({name:"RSA-OAEP",hash:c},n,r?["encrypt"]:["decrypt"]);i=e.toCryptoKey({name:t.startsWith("PS")?"RSA-PSS":"RSASSA-PKCS1-v1_5",hash:c},n,[r?"verify":"sign"])}if(e.asymmetricKeyType==="ec"){const l=new Map([["prime256v1","P-256"],["secp384r1","P-384"],["secp521r1","P-521"]]).get((o=e.asymmetricKeyDetails)==null?void 0:o.namedCurve);if(!l)throw new TypeError("given KeyObject instance cannot be used for this algorithm");t==="ES256"&&l==="P-256"&&(i=e.toCryptoKey({name:"ECDSA",namedCurve:l},n,[r?"verify":"sign"])),t==="ES384"&&l==="P-384"&&(i=e.toCryptoKey({name:"ECDSA",namedCurve:l},n,[r?"verify":"sign"])),t==="ES512"&&l==="P-521"&&(i=e.toCryptoKey({name:"ECDSA",namedCurve:l},n,[r?"verify":"sign"])),t.startsWith("ECDH-ES")&&(i=e.toCryptoKey({name:"ECDH",namedCurve:l},n,r?[]:["deriveBits"]))}if(!i)throw new TypeError("given KeyObject instance cannot be used for this algorithm");return a?a[t]=i:Pe.set(e,{[t]:i}),i},Wr=async(e,t)=>{if(e instanceof Uint8Array||Br(e))return e;if($r(e)){if(e.type==="secret")return e.export();if("toCryptoKey"in e&&typeof e.toCryptoKey=="function")try{return li(e,t)}catch(r){if(r instanceof TypeError)throw r}let a=e.export({format:"jwk"});return Ua(e,a,t)}if(pa(e))return e.k?Ct(e.k):Ua(e,e,t,!0);throw new Error("unreachable")},Ue=e=>e==null?void 0:e[Symbol.toStringTag],ea=(e,t,a)=>{var r,n;if(t.use!==void 0){let i;switch(a){case"sign":case"verify":i="sig";break;case"encrypt":case"decrypt":i="enc";break}if(t.use!==i)throw new TypeError(`Invalid key for this operation, its "use" must be "${i}" when present`)}if(t.alg!==void 0&&t.alg!==e)throw new TypeError(`Invalid key for this operation, its "alg" must be "${e}" when present`);if(Array.isArray(t.key_ops)){let i;switch(!0){case(a==="sign"||a==="verify"):case e==="dir":case e.includes("CBC-HS"):i=a;break;case e.startsWith("PBES2"):i="deriveBits";break;case/^A\d{3}(?:GCM)?(?:KW)?$/.test(e):!e.includes("GCM")&&e.endsWith("KW")?i=a==="encrypt"?"wrapKey":"unwrapKey":i=a;break;case(a==="encrypt"&&e.startsWith("RSA")):i="wrapKey";break;case a==="decrypt":i=e.startsWith("RSA")?"unwrapKey":"deriveBits";break}if(i&&((n=(r=t.key_ops)==null?void 0:r.includes)==null?void 0:n.call(r,i))===!1)throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${i}" when present`)}return!0},di=(e,t,a)=>{if(!(t instanceof Uint8Array)){if(pa(t)){if(ci(t)&&ea(e,t,a))return;throw new TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present')}if(!Hr(t))throw new TypeError(jr(e,t,"CryptoKey","KeyObject","JSON Web Key","Uint8Array"));if(t.type!=="secret")throw new TypeError(`${Ue(t)} instances for symmetric algorithms must be of type "secret"`)}},pi=(e,t,a)=>{if(pa(t))switch(a){case"decrypt":case"sign":if(ii(t)&&ea(e,t,a))return;throw new TypeError("JSON Web Key for this operation be a private JWK");case"encrypt":case"verify":if(oi(t)&&ea(e,t,a))return;throw new TypeError("JSON Web Key for this operation be a public JWK")}if(!Hr(t))throw new TypeError(jr(e,t,"CryptoKey","KeyObject","JSON Web Key"));if(t.type==="secret")throw new TypeError(`${Ue(t)} instances for asymmetric algorithms must not be of type "secret"`);if(t.type==="public")switch(a){case"sign":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm signing must be of type "private"`);case"decrypt":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm decryption must be of type "private"`)}if(t.type==="private")switch(a){case"verify":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm verifying must be of type "public"`);case"encrypt":throw new TypeError(`${Ue(t)} instances for asymmetric algorithm encryption must be of type "public"`)}},zr=(e,t,a)=>{e.startsWith("HS")||e==="dir"||e.startsWith("PBES2")||/^A(?:128|192|256)(?:GCM)?(?:KW)?$/.test(e)||/^A(?:128|192|256)CBC-HS(?:256|384|512)$/.test(e)?di(e,t,a):pi(e,t,a)},Vr=(e,t)=>{const a=`SHA-${e.slice(-3)}`;switch(e){case"HS256":case"HS384":case"HS512":return{hash:a,name:"HMAC"};case"PS256":case"PS384":case"PS512":return{hash:a,name:"RSA-PSS",saltLength:parseInt(e.slice(-3),10)>>3};case"RS256":case"RS384":case"RS512":return{hash:a,name:"RSASSA-PKCS1-v1_5"};case"ES256":case"ES384":case"ES512":return{hash:a,name:"ECDSA",namedCurve:t.namedCurve};case"Ed25519":case"EdDSA":return{name:"Ed25519"};case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":return{name:e};default:throw new oe(`alg ${e} is not supported either by JOSE or your javascript runtime`)}},qr=async(e,t,a)=>{if(t instanceof Uint8Array){if(!e.startsWith("HS"))throw new TypeError(ai(t,"CryptoKey","KeyObject","JSON Web Key"));return crypto.subtle.importKey("raw",t,{hash:`SHA-${e.slice(-3)}`,name:"HMAC"},!1,[a])}return ti(t,e,a),t},ui=async(e,t,a,r)=>{const n=await qr(e,t,"verify");Xr(e,n);const i=Vr(e,n.algorithm);try{return await crypto.subtle.verify(i,n,a,r)}catch{return!1}};async function fi(e,t,a){if(!at(e))throw new S("Flattened JWS must be an object");if(e.protected===void 0&&e.header===void 0)throw new S('Flattened JWS must have either of the "protected" or "header" members');if(e.protected!==void 0&&typeof e.protected!="string")throw new S("JWS Protected Header incorrect type");if(e.payload===void 0)throw new S("JWS Payload missing");if(typeof e.signature!="string")throw new S("JWS Signature missing or incorrect type");if(e.header!==void 0&&!at(e.header))throw new S("JWS Unprotected Header incorrect type");let r={};if(e.protected)try{const h=Ct(e.protected);r=JSON.parse(Ae.decode(h))}catch{throw new S("JWS Protected Header is invalid")}if(!Gr(r,e.header))throw new S("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const n={...r,...e.header},i=Kr(S,new Map([["b64",!0]]),a==null?void 0:a.crit,r,n);let o=!0;if(i.has("b64")&&(o=r.b64,typeof o!="boolean"))throw new S('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:c}=n;if(typeof c!="string"||!c)throw new S('JWS "alg" (Algorithm) Header Parameter missing or invalid');if(o){if(typeof e.payload!="string")throw new S("JWS Payload must be a string")}else if(typeof e.payload!="string"&&!(e.payload instanceof Uint8Array))throw new S("JWS Payload must be a string or an Uint8Array instance");let l=!1;typeof t=="function"&&(t=await t(r,e),l=!0),zr(c,t,"verify");const d=Fr(q.encode(e.protected??""),q.encode("."),typeof e.payload=="string"?q.encode(e.payload):e.payload);let p;try{p=Ct(e.signature)}catch{throw new S("Failed to base64url decode the signature")}const f=await Wr(t,c);if(!await ui(c,f,p,d))throw new Pr;let x;if(o)try{x=Ct(e.payload)}catch{throw new S("Failed to base64url decode the payload")}else typeof e.payload=="string"?x=q.encode(e.payload):x=e.payload;const b={payload:x};return e.protected!==void 0&&(b.protectedHeader=r),e.header!==void 0&&(b.unprotectedHeader=e.header),l?{...b,key:f}:b}async function mi(e,t,a){if(e instanceof Uint8Array&&(e=Ae.decode(e)),typeof e!="string")throw new S("Compact JWS must be a string or Uint8Array");const{0:r,1:n,2:i,length:o}=e.split(".");if(o!==3)throw new S("Invalid Compact JWS");const c=await fi({payload:n,protected:r,signature:i},t,a),l={payload:c.payload,protectedHeader:c.protectedHeader};return typeof t=="function"?{...l,key:c.key}:l}const ie=e=>Math.floor(e.getTime()/1e3),Jr=60,Yr=Jr*60,ua=Yr*24,xi=ua*7,hi=ua*365.25,bi=/^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i,Ze=e=>{const t=bi.exec(e);if(!t||t[4]&&t[1])throw new TypeError("Invalid time period format");const a=parseFloat(t[2]),r=t[3].toLowerCase();let n;switch(r){case"sec":case"secs":case"second":case"seconds":case"s":n=Math.round(a);break;case"minute":case"minutes":case"min":case"mins":case"m":n=Math.round(a*Jr);break;case"hour":case"hours":case"hr":case"hrs":case"h":n=Math.round(a*Yr);break;case"day":case"days":case"d":n=Math.round(a*ua);break;case"week":case"weeks":case"w":n=Math.round(a*xi);break;default:n=Math.round(a*hi);break}return t[1]==="-"||t[4]==="ago"?-n:n};function be(e,t){if(!Number.isFinite(t))throw new TypeError(`Invalid ${e} input`);return t}const Fa=e=>e.includes("/")?e.toLowerCase():`application/${e.toLowerCase()}`,gi=(e,t)=>typeof e=="string"?t.includes(e):Array.isArray(e)?t.some(Set.prototype.has.bind(new Set(e))):!1;function yi(e,t,a={}){let r;try{r=JSON.parse(Ae.decode(t))}catch{}if(!at(r))throw new Dt("JWT Claims Set must be a top-level JSON object");const{typ:n}=a;if(n&&(typeof e.typ!="string"||Fa(e.typ)!==Fa(n)))throw new $('unexpected "typ" JWT header value',r,"typ","check_failed");const{requiredClaims:i=[],issuer:o,subject:c,audience:l,maxTokenAge:d}=a,p=[...i];d!==void 0&&p.push("iat"),l!==void 0&&p.push("aud"),c!==void 0&&p.push("sub"),o!==void 0&&p.push("iss");for(const b of new Set(p.reverse()))if(!(b in r))throw new $(`missing required "${b}" claim`,r,b,"missing");if(o&&!(Array.isArray(o)?o:[o]).includes(r.iss))throw new $('unexpected "iss" claim value',r,"iss","check_failed");if(c&&r.sub!==c)throw new $('unexpected "sub" claim value',r,"sub","check_failed");if(l&&!gi(r.aud,typeof l=="string"?[l]:l))throw new $('unexpected "aud" claim value',r,"aud","check_failed");let f;switch(typeof a.clockTolerance){case"string":f=Ze(a.clockTolerance);break;case"number":f=a.clockTolerance;break;case"undefined":f=0;break;default:throw new TypeError("Invalid clockTolerance option type")}const{currentDate:m}=a,x=ie(m||new Date);if((r.iat!==void 0||d)&&typeof r.iat!="number")throw new $('"iat" claim must be a number',r,"iat","invalid");if(r.nbf!==void 0){if(typeof r.nbf!="number")throw new $('"nbf" claim must be a number',r,"nbf","invalid");if(r.nbf>x+f)throw new $('"nbf" claim timestamp check failed',r,"nbf","check_failed")}if(r.exp!==void 0){if(typeof r.exp!="number")throw new $('"exp" claim must be a number',r,"exp","invalid");if(r.exp<=x-f)throw new Qt('"exp" claim timestamp check failed',r,"exp","check_failed")}if(d){const b=x-r.iat,h=typeof d=="number"?d:Ze(d);if(b-f>h)throw new Qt('"iat" claim timestamp check failed (too far in the past)',r,"iat","check_failed");if(b<0-f)throw new $('"iat" claim timestamp check failed (it should be in the past)',r,"iat","check_failed")}return r}var R;class vi{constructor(t){E(this,R);if(!at(t))throw new TypeError("JWT Claims Set MUST be an object");y(this,R,structuredClone(t))}data(){return q.encode(JSON.stringify(u(this,R)))}get iss(){return u(this,R).iss}set iss(t){u(this,R).iss=t}get sub(){return u(this,R).sub}set sub(t){u(this,R).sub=t}get aud(){return u(this,R).aud}set aud(t){u(this,R).aud=t}set jti(t){u(this,R).jti=t}set nbf(t){typeof t=="number"?u(this,R).nbf=be("setNotBefore",t):t instanceof Date?u(this,R).nbf=be("setNotBefore",ie(t)):u(this,R).nbf=ie(new Date)+Ze(t)}set exp(t){typeof t=="number"?u(this,R).exp=be("setExpirationTime",t):t instanceof Date?u(this,R).exp=be("setExpirationTime",ie(t)):u(this,R).exp=ie(new Date)+Ze(t)}set iat(t){typeof t>"u"?u(this,R).iat=ie(new Date):t instanceof Date?u(this,R).iat=be("setIssuedAt",ie(t)):typeof t=="string"?u(this,R).iat=be("setIssuedAt",ie(new Date)+Ze(t)):u(this,R).iat=be("setIssuedAt",t)}}R=new WeakMap;async function Ei(e,t,a){var o;const r=await mi(e,t,a);if((o=r.protectedHeader.crit)!=null&&o.includes("b64")&&r.protectedHeader.b64===!1)throw new Dt("JWTs MUST NOT use unencoded payload");const i={payload:yi(r.protectedHeader,r.payload,a),protectedHeader:r.protectedHeader};return typeof t=="function"?{...i,key:r.key}:i}const Ni=async(e,t,a)=>{const r=await qr(e,t,"sign");Xr(e,r);const n=await crypto.subtle.sign(Vr(e,r.algorithm),r,a);return new Uint8Array(n)};var pt,P,V;class wi{constructor(t){E(this,pt);E(this,P);E(this,V);if(!(t instanceof Uint8Array))throw new TypeError("payload must be an instance of Uint8Array");y(this,pt,t)}setProtectedHeader(t){if(u(this,P))throw new TypeError("setProtectedHeader can only be called once");return y(this,P,t),this}setUnprotectedHeader(t){if(u(this,V))throw new TypeError("setUnprotectedHeader can only be called once");return y(this,V,t),this}async sign(t,a){if(!u(this,P)&&!u(this,V))throw new S("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");if(!Gr(u(this,P),u(this,V)))throw new S("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const r={...u(this,P),...u(this,V)},n=Kr(S,new Map([["b64",!0]]),a==null?void 0:a.crit,u(this,P),r);let i=!0;if(n.has("b64")&&(i=u(this,P).b64,typeof i!="boolean"))throw new S('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:o}=r;if(typeof o!="string"||!o)throw new S('JWS "alg" (Algorithm) Header Parameter missing or invalid');zr(o,t,"sign");let c=u(this,pt);i&&(c=q.encode(Kt(c)));let l;u(this,P)?l=q.encode(Kt(JSON.stringify(u(this,P)))):l=q.encode("");const d=Fr(l,q.encode("."),c),p=await Wr(t,o),f=await Ni(o,p,d),m={signature:Kt(f),payload:""};return i&&(m.payload=Ae.decode(c)),u(this,V)&&(m.header=u(this,V)),u(this,P)&&(m.protected=Ae.decode(l)),m}}pt=new WeakMap,P=new WeakMap,V=new WeakMap;var Ge;class Ti{constructor(t){E(this,Ge);y(this,Ge,new wi(t))}setProtectedHeader(t){return u(this,Ge).setProtectedHeader(t),this}async sign(t,a){const r=await u(this,Ge).sign(t,a);if(r.payload===void 0)throw new TypeError("use the flattened module for creating JWS with b64: false");return`${r.protected}.${r.payload}.${r.signature}`}}Ge=new WeakMap;var me,j;class Pa{constructor(t={}){E(this,me);E(this,j);y(this,j,new vi(t))}setIssuer(t){return u(this,j).iss=t,this}setSubject(t){return u(this,j).sub=t,this}setAudience(t){return u(this,j).aud=t,this}setJti(t){return u(this,j).jti=t,this}setNotBefore(t){return u(this,j).nbf=t,this}setExpirationTime(t){return u(this,j).exp=t,this}setIssuedAt(t){return u(this,j).iat=t,this}setProtectedHeader(t){return y(this,me,t),this}async sign(t,a){var n;const r=new Ti(u(this,j).data());if(r.setProtectedHeader(u(this,me)),Array.isArray((n=u(this,me))==null?void 0:n.crit)&&u(this,me).crit.includes("b64")&&u(this,me).b64===!1)throw new Dt("JWTs MUST NOT use unencoded payload");return r.sign(t,a)}}me=new WeakMap,j=new WeakMap;var ta=null;function Ai(e){try{return crypto.getRandomValues(new Uint8Array(e))}catch{}try{return ms.randomBytes(e)}catch{}if(!ta)throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");return ta(e)}function Ci(e){ta=e}function fa(e,t){if(e=e||ma,typeof e!="number")throw Error("Illegal arguments: "+typeof e+", "+typeof t);e<4?e=4:e>31&&(e=31);var a=[];return a.push("$2b$"),e<10&&a.push("0"),a.push(e.toString()),a.push("$"),a.push(Ot(Ai(rt),rt)),a.join("")}function Zr(e,t,a){if(typeof t=="function"&&(a=t,t=void 0),typeof e=="function"&&(a=e,e=void 0),typeof e>"u")e=ma;else if(typeof e!="number")throw Error("illegal arguments: "+typeof e);function r(n){K(function(){try{n(null,fa(e))}catch(i){n(i)}})}if(a){if(typeof a!="function")throw Error("Illegal callback: "+typeof a);r(a)}else return new Promise(function(n,i){r(function(o,c){if(o){i(o);return}n(c)})})}function Qr(e,t){if(typeof t>"u"&&(t=ma),typeof t=="number"&&(t=fa(t)),typeof e!="string"||typeof t!="string")throw Error("Illegal arguments: "+typeof e+", "+typeof t);return aa(e,t)}function es(e,t,a,r){function n(i){typeof e=="string"&&typeof t=="number"?Zr(t,function(o,c){aa(e,c,i,r)}):typeof e=="string"&&typeof t=="string"?aa(e,t,i,r):K(i.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof t)))}if(a){if(typeof a!="function")throw Error("Illegal callback: "+typeof a);n(a)}else return new Promise(function(i,o){n(function(c,l){if(c){o(c);return}i(l)})})}function ts(e,t){for(var a=e.length^t.length,r=0;r<e.length;++r)a|=e.charCodeAt(r)^t.charCodeAt(r);return a===0}function _i(e,t){if(typeof e!="string"||typeof t!="string")throw Error("Illegal arguments: "+typeof e+", "+typeof t);return t.length!==60?!1:ts(Qr(e,t.substring(0,t.length-31)),t)}function Si(e,t,a,r){function n(i){if(typeof e!="string"||typeof t!="string"){K(i.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof t)));return}if(t.length!==60){K(i.bind(this,null,!1));return}es(e,t.substring(0,29),function(o,c){o?i(o):i(null,ts(c,t))},r)}if(a){if(typeof a!="function")throw Error("Illegal callback: "+typeof a);n(a)}else return new Promise(function(i,o){n(function(c,l){if(c){o(c);return}i(l)})})}function Ri(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);return parseInt(e.split("$")[2],10)}function Oi(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);if(e.length!==60)throw Error("Illegal hash length: "+e.length+" != 60");return e.substring(0,29)}function Ii(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);return as(e)>72}var K=typeof process<"u"&&process&&typeof process.nextTick=="function"?typeof setImmediate=="function"?setImmediate:process.nextTick:setTimeout;function as(e){for(var t=0,a=0,r=0;r<e.length;++r)a=e.charCodeAt(r),a<128?t+=1:a<2048?t+=2:(a&64512)===55296&&(e.charCodeAt(r+1)&64512)===56320?(++r,t+=4):t+=3;return t}function Di(e){for(var t=0,a,r,n=new Array(as(e)),i=0,o=e.length;i<o;++i)a=e.charCodeAt(i),a<128?n[t++]=a:a<2048?(n[t++]=a>>6|192,n[t++]=a&63|128):(a&64512)===55296&&((r=e.charCodeAt(i+1))&64512)===56320?(a=65536+((a&1023)<<10)+(r&1023),++i,n[t++]=a>>18|240,n[t++]=a>>12&63|128,n[t++]=a>>6&63|128,n[t++]=a&63|128):(n[t++]=a>>12|224,n[t++]=a>>6&63|128,n[t++]=a&63|128);return n}var Ie="./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),ne=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,54,55,56,57,58,59,60,61,62,63,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,-1,-1,-1,-1,-1];function Ot(e,t){var a=0,r=[],n,i;if(t<=0||t>e.length)throw Error("Illegal len: "+t);for(;a<t;){if(n=e[a++]&255,r.push(Ie[n>>2&63]),n=(n&3)<<4,a>=t){r.push(Ie[n&63]);break}if(i=e[a++]&255,n|=i>>4&15,r.push(Ie[n&63]),n=(i&15)<<2,a>=t){r.push(Ie[n&63]);break}i=e[a++]&255,n|=i>>6&3,r.push(Ie[n&63]),r.push(Ie[i&63])}return r.join("")}function rs(e,t){var a=0,r=e.length,n=0,i=[],o,c,l,d,p,f;if(t<=0)throw Error("Illegal len: "+t);for(;a<r-1&&n<t&&(f=e.charCodeAt(a++),o=f<ne.length?ne[f]:-1,f=e.charCodeAt(a++),c=f<ne.length?ne[f]:-1,!(o==-1||c==-1||(p=o<<2>>>0,p|=(c&48)>>4,i.push(String.fromCharCode(p)),++n>=t||a>=r)||(f=e.charCodeAt(a++),l=f<ne.length?ne[f]:-1,l==-1)||(p=(c&15)<<4>>>0,p|=(l&60)>>2,i.push(String.fromCharCode(p)),++n>=t||a>=r)));)f=e.charCodeAt(a++),d=f<ne.length?ne[f]:-1,p=(l&3)<<6>>>0,p|=d,i.push(String.fromCharCode(p)),++n;var m=[];for(a=0;a<n;a++)m.push(i[a].charCodeAt(0));return m}var rt=16,ma=10,Mi=16,Li=100,ka=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],ja=[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946,1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055,3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504,976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462],ss=[1332899944,1700884034,1701343084,1684370003,1668446532,1869963892];function st(e,t,a,r){var n,i=e[t],o=e[t+1];return i^=a[0],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[1],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[2],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[3],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[4],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[5],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[6],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[7],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[8],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[9],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[10],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[11],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[12],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[13],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[14],n=r[i>>>24],n+=r[256|i>>16&255],n^=r[512|i>>8&255],n+=r[768|i&255],o^=n^a[15],n=r[o>>>24],n+=r[256|o>>16&255],n^=r[512|o>>8&255],n+=r[768|o&255],i^=n^a[16],e[t]=o^a[Mi+1],e[t+1]=i,e}function Fe(e,t){for(var a=0,r=0;a<4;++a)r=r<<8|e[t]&255,t=(t+1)%e.length;return{key:r,offp:t}}function Ba(e,t,a){for(var r=0,n=[0,0],i=t.length,o=a.length,c,l=0;l<i;l++)c=Fe(e,r),r=c.offp,t[l]=t[l]^c.key;for(l=0;l<i;l+=2)n=st(n,0,t,a),t[l]=n[0],t[l+1]=n[1];for(l=0;l<o;l+=2)n=st(n,0,t,a),a[l]=n[0],a[l+1]=n[1]}function Ui(e,t,a,r){for(var n=0,i=[0,0],o=a.length,c=r.length,l,d=0;d<o;d++)l=Fe(t,n),n=l.offp,a[d]=a[d]^l.key;for(n=0,d=0;d<o;d+=2)l=Fe(e,n),n=l.offp,i[0]^=l.key,l=Fe(e,n),n=l.offp,i[1]^=l.key,i=st(i,0,a,r),a[d]=i[0],a[d+1]=i[1];for(d=0;d<c;d+=2)l=Fe(e,n),n=l.offp,i[0]^=l.key,l=Fe(e,n),n=l.offp,i[1]^=l.key,i=st(i,0,a,r),r[d]=i[0],r[d+1]=i[1]}function $a(e,t,a,r,n){var i=ss.slice(),o=i.length,c;if(a<4||a>31)if(c=Error("Illegal number of rounds (4-31): "+a),r){K(r.bind(this,c));return}else throw c;if(t.length!==rt)if(c=Error("Illegal salt length: "+t.length+" != "+rt),r){K(r.bind(this,c));return}else throw c;a=1<<a>>>0;var l,d,p=0,f;typeof Int32Array=="function"?(l=new Int32Array(ka),d=new Int32Array(ja)):(l=ka.slice(),d=ja.slice()),Ui(t,e,l,d);function m(){if(n&&n(p/a),p<a)for(var b=Date.now();p<a&&(p=p+1,Ba(e,l,d),Ba(t,l,d),!(Date.now()-b>Li)););else{for(p=0;p<64;p++)for(f=0;f<o>>1;f++)st(i,f<<1,l,d);var h=[];for(p=0;p<o;p++)h.push((i[p]>>24&255)>>>0),h.push((i[p]>>16&255)>>>0),h.push((i[p]>>8&255)>>>0),h.push((i[p]&255)>>>0);if(r){r(null,h);return}else return h}r&&K(m)}if(typeof r<"u")m();else for(var x;;)if(typeof(x=m())<"u")return x||[]}function aa(e,t,a,r){var n;if(typeof e!="string"||typeof t!="string")if(n=Error("Invalid string / salt: Not a string"),a){K(a.bind(this,n));return}else throw n;var i,o;if(t.charAt(0)!=="$"||t.charAt(1)!=="2")if(n=Error("Invalid salt version: "+t.substring(0,2)),a){K(a.bind(this,n));return}else throw n;if(t.charAt(2)==="$")i="\0",o=3;else{if(i=t.charAt(2),i!=="a"&&i!=="b"&&i!=="y"||t.charAt(3)!=="$")if(n=Error("Invalid salt revision: "+t.substring(2,4)),a){K(a.bind(this,n));return}else throw n;o=4}if(t.charAt(o+2)>"$")if(n=Error("Missing salt rounds"),a){K(a.bind(this,n));return}else throw n;var c=parseInt(t.substring(o,o+1),10)*10,l=parseInt(t.substring(o+1,o+2),10),d=c+l,p=t.substring(o+3,o+25);e+=i>="a"?"\0":"";var f=Di(e),m=rs(p,rt);function x(b){var h=[];return h.push("$2"),i>="a"&&h.push(i),h.push("$"),d<10&&h.push("0"),h.push(d.toString()),h.push("$"),h.push(Ot(m,m.length)),h.push(Ot(b,ss.length*4-1)),h.join("")}if(typeof a>"u")return x($a(f,m,d));$a(f,m,d,function(b,h){b?a(b,null):a(null,x(h))},r)}function Fi(e,t){return Ot(e,t)}function Pi(e,t){return rs(e,t)}const ki={setRandomFallback:Ci,genSaltSync:fa,genSalt:Zr,hashSync:Qr,hash:es,compareSync:_i,compare:Si,getRounds:Ri,getSalt:Oi,truncates:Ii,encodeBase64:Fi,decodeBase64:Pi},w=new Cr;w.use("*",fn());w.use("/api/*",on());w.use(Jn);w.use("/static/*",wn({root:"./public"}));w.get("/api/health",async e=>{const{env:t}=e;try{const a=await t.DB.prepare("SELECT 1 as test").first();return e.json({status:"healthy",database:"connected",environment:t.ENVIRONMENT||"development",timestamp:new Date().toISOString()})}catch(a){return e.json({status:"unhealthy",database:"disconnected",error:a.message},500)}});w.post("/api/init-db",async e=>{const{env:t}=e;if(t.ENVIRONMENT==="production")return e.json({error:"Not available in production"},403);try{const a=[`CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        country TEXT NOT NULL CHECK (country IN ('MX', 'ES')), 
        logo_url TEXT,
        primary_currency TEXT NOT NULL DEFAULT 'MXN' CHECK (primary_currency IN ('MXN', 'EUR', 'USD')),
        tax_id TEXT,
        address TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'advanced', 'admin')),
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
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed', 'invoiced')),
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
      )`];for(const r of a)await t.DB.prepare(r).run();return await t.DB.prepare(`
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
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, password_hash, role, active) VALUES 
        (1, 'admin@techmx.com', 'Alejandro Rodríguez', '$2b$10$yvsqabOwKIXJf5cu2nCIq.LDZQAKQPusEN2pvncvnTgO9lHfgE1F6', 'admin', TRUE),
        (2, 'maria.lopez@techmx.com', 'María López', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE),
        (3, 'carlos.martinez@innovacion.mx', 'Carlos Martínez', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'advanced', TRUE),
        (4, 'ana.garcia@consultoria.mx', 'Ana García', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE),
        (5, 'pedro.sanchez@techespana.es', 'Pedro Sánchez', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'advanced', TRUE),
        (6, 'elena.torres@madrid.es', 'Elena Torres', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE)
    `).run(),await t.DB.prepare(`
      INSERT OR IGNORE INTO user_companies (user_id, company_id, can_view, can_edit, can_admin) VALUES 
        (1, 1, TRUE, TRUE, TRUE), (1, 2, TRUE, TRUE, TRUE), (1, 3, TRUE, TRUE, TRUE),
        (1, 4, TRUE, TRUE, TRUE), (1, 5, TRUE, TRUE, TRUE), (1, 6, TRUE, TRUE, TRUE),
        (2, 1, TRUE, TRUE, FALSE), (3, 2, TRUE, TRUE, FALSE), (4, 3, TRUE, TRUE, FALSE),
        (5, 4, TRUE, TRUE, FALSE), (6, 5, TRUE, TRUE, FALSE)
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
    `).run(),e.json({success:!0,message:"Base de datos inicializada con datos de prueba (incluyendo CFDI validations)",timestamp:new Date().toISOString()})}catch(a){return e.json({error:"Failed to initialize database",details:a.message},500)}});w.get("/api/companies",async e=>{const{env:t}=e;try{const a=await t.DB.prepare(`
      SELECT id, name, country, primary_currency, logo_url, active, created_at
      FROM companies 
      WHERE active = TRUE
      ORDER BY country, name
    `).all();return e.json({companies:a.results})}catch{return e.json({error:"Failed to fetch companies"},500)}});w.get("/api/users",async e=>{const{env:t}=e;try{const a=await t.DB.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.active, u.created_at,
             GROUP_CONCAT(c.name, '|') as companies
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.active = TRUE
      GROUP BY u.id
      ORDER BY u.name
    `).all();return e.json({users:a.results})}catch{return e.json({error:"Failed to fetch users"},500)}});w.get("/api/expenses",async e=>{const{env:t}=e,a=e.req.query();let r=`
    SELECT e.*, c.name as company_name, u.name as user_name, et.name as expense_type_name,
           c.country, c.primary_currency as company_currency
    FROM expenses e
    JOIN companies c ON e.company_id = c.id
    JOIN users u ON e.user_id = u.id
    JOIN expense_types et ON e.expense_type_id = et.id
    WHERE 1=1
  `;const n=[];a.company_id&&(r+=" AND e.company_id = ?",n.push(a.company_id)),a.user_id&&(r+=" AND e.user_id = ?",n.push(a.user_id)),a.status&&(r+=" AND e.status = ?",n.push(a.status)),a.currency&&(r+=" AND e.currency = ?",n.push(a.currency)),a.date_from&&(r+=" AND e.expense_date >= ?",n.push(a.date_from)),a.date_to&&(r+=" AND e.expense_date <= ?",n.push(a.date_to)),r+=" ORDER BY e.expense_date DESC, e.created_at DESC",a.limit&&(r+=" LIMIT ?",n.push(parseInt(a.limit)||50));try{const o=await t.DB.prepare(r).bind(...n).all();return e.json({expenses:o.results,total:o.results.length})}catch{return e.json({error:"Failed to fetch expenses"},500)}});w.post("/api/expenses",async e=>{const{env:t}=e;try{const a=await e.req.json(),r=["company_id","expense_type_id","description","expense_date","amount","currency"];for(const c of r)if(!a[c])return e.json({error:`Missing required field: ${c}`},400);let n=a.amount,i=1;a.currency==="USD"?(i=18.25,n=a.amount*i):a.currency==="EUR"&&(i=20.15,n=a.amount*i);const o=await t.DB.prepare(`
      INSERT INTO expenses (
        company_id, user_id, expense_type_id, description, expense_date, 
        amount, currency, exchange_rate, amount_mxn, payment_method, 
        vendor, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(a.company_id,a.user_id||1,a.expense_type_id,a.description,a.expense_date,a.amount,a.currency,i,n,a.payment_method||"cash",a.vendor||"",a.notes||"","pending",a.user_id||1).run();return e.json({success:!0,expense_id:o.meta.last_row_id,message:"Gasto creado exitosamente"})}catch(a){return e.json({error:"Failed to create expense",details:a.message},500)}});w.get("/api/dashboard/metrics",async e=>{const{env:t}=e,a=e.req.query();try{let r="WHERE 1=1";const n=[];a.company_id&&(r+=" AND e.company_id = ?",n.push(a.company_id)),a.user_id&&(r+=" AND e.user_id = ?",n.push(a.user_id)),a.status&&(r+=" AND e.status = ?",n.push(a.status)),a.currency&&(r+=" AND e.currency = ?",n.push(a.currency)),a.date_from&&(r+=" AND e.expense_date >= ?",n.push(a.date_from)),a.date_to&&(r+=" AND e.expense_date <= ?",n.push(a.date_to)),a.user_id&&(r+=" AND e.user_id = ?",n.push(a.user_id)),a.status&&(r+=" AND e.status = ?",n.push(a.status));const i=await t.DB.prepare(`
      SELECT status, COUNT(*) as count, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${r}
      GROUP BY status
    `).bind(...n).all(),o=await t.DB.prepare(`
      SELECT c.name as company, c.country, COUNT(*) as count, SUM(e.amount_mxn) as total_mxn
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      ${r}
      GROUP BY c.id, c.name, c.country
      ORDER BY total_mxn DESC
    `).bind(...n).all(),c=await t.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${r}
      GROUP BY currency
    `).bind(...n).all(),l=await t.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      ${r}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).bind(...n).all();return e.json({status_metrics:i.results||[],company_metrics:o.results||[],currency_metrics:c.results||[],recent_expenses:l.results||[],filters_applied:{company_id:a.company_id,user_id:a.user_id,status:a.status,currency:a.currency,date_from:a.date_from,date_to:a.date_to,period:a.period}})}catch(r){return e.json({error:"Failed to fetch dashboard metrics",details:r.message},500)}});w.get("/api/expense-types",async e=>{const{env:t}=e;try{const a=await t.DB.prepare(`
      SELECT id, name, description, category, active
      FROM expense_types
      WHERE active = TRUE
      ORDER BY category, name
    `).all();return e.json({expense_types:a.results})}catch{return e.json({error:"Failed to fetch expense types"},500)}});w.get("/api/exchange-rates",async e=>{const{env:t}=e,a=e.req.query();try{const r=await t.DB.prepare(`
      SELECT from_currency, to_currency, rate, rate_date, source
      FROM exchange_rates
      WHERE rate_date = (
        SELECT MAX(rate_date) FROM exchange_rates
      )
      ORDER BY from_currency, to_currency
    `).all();if(a.from&&a.to){const n=r.results.find(i=>i.from_currency===a.from&&i.to_currency===a.to);if(n)return e.json({rate:n.rate,date:n.rate_date,source:n.source});{const i=r.results.find(o=>o.from_currency===a.to&&o.to_currency===a.from);if(i)return e.json({rate:(1/i.rate).toFixed(6),date:i.rate_date,source:i.source+" (inverse)"})}return e.json({error:"Exchange rate not found"},404)}return e.json({exchange_rates:r.results})}catch{return e.json({error:"Failed to fetch exchange rates"},500)}});w.post("/api/exchange-rates/update",async e=>{const{env:t}=e;try{const a=new Date().toISOString().split("T")[0],r=[{from:"USD",to:"MXN",rate:18.25,source:"banxico"},{from:"EUR",to:"MXN",rate:20.15,source:"banxico"},{from:"EUR",to:"USD",rate:1.1,source:"ecb"},{from:"USD",to:"EUR",rate:.91,source:"ecb"},{from:"MXN",to:"USD",rate:.055,source:"banxico"},{from:"MXN",to:"EUR",rate:.05,source:"banxico"}];for(const n of r)await t.DB.prepare(`
        INSERT OR REPLACE INTO exchange_rates 
        (from_currency, to_currency, rate, rate_date, source, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(n.from,n.to,n.rate,a,n.source).run();return e.json({success:!0,message:"Exchange rates updated successfully",date:a})}catch{return e.json({error:"Failed to update exchange rates"},500)}});w.post("/api/attachments",async e=>{const{env:t}=e;try{const a=await e.req.formData(),r=a.get("file"),n=a.get("expense_id"),i=a.get("process_ocr")==="true";if(!r||!n)return e.json({error:"File and expense_id are required"},400);const o=`/uploads/${Date.now()}-${r.name}`,c=r.type.startsWith("image/")?"image":r.type==="application/pdf"?"pdf":"xml";let l=null;i&&(c==="image"||c==="pdf")&&(l=await ns(r,c));const d=await t.DB.prepare(`
      INSERT INTO attachments (
        expense_id, file_name, file_type, file_url, file_size, 
        mime_type, ocr_text, ocr_confidence, uploaded_by, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(n,r.name,c,o,r.size,r.type,(l==null?void 0:l.text)||null,(l==null?void 0:l.confidence)||null,1).run();return e.json({success:!0,attachment_id:d.meta.last_row_id,file_url:o,ocr_data:l,message:"File uploaded successfully"+(l?" with OCR processing":"")})}catch(a){return e.json({error:"Failed to upload attachment",details:a.message},500)}});w.post("/api/attachments/:id/ocr",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT * FROM attachments WHERE id = ?
    `).bind(a).first();if(!r)return e.json({error:"Attachment not found"},404);if(r.file_type!=="image"&&r.file_type!=="pdf")return e.json({error:"OCR only supported for images and PDFs"},400);const n=await ns(null,r.file_type,r.file_name);return await t.DB.prepare(`
      UPDATE attachments 
      SET ocr_text = ?, ocr_confidence = ?
      WHERE id = ?
    `).bind(n.text,n.confidence,a).run(),e.json({success:!0,ocr_data:n,message:"OCR processing completed"})}catch(r){return e.json({error:"Failed to process OCR",details:r.message},500)}});w.post("/api/ocr/extract-expense-data",async e=>{const{env:t}=e;try{const{ocr_text:a,attachment_id:r}=await e.req.json();if(!a)return e.json({error:"OCR text is required"},400);const n=await $i(a);return e.json({success:!0,extracted_data:n,message:"Expense data extracted successfully"})}catch(a){return e.json({error:"Failed to extract expense data",details:a.message},500)}});async function ns(e,t,a=null){const r={ticket:{text:`RESTAURANTE PUJOL
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
ID VIAJE: 1234-5678-9012`,confidence:.89}};let n="ticket";return a&&(a.toLowerCase().includes("factura")||a.toLowerCase().includes("invoice")?n="factura":(a.toLowerCase().includes("uber")||a.toLowerCase().includes("taxi"))&&(n="uber")),await new Promise(i=>setTimeout(i,1500)),r[n]||r.ticket}w.post("/api/cfdi/validate",async e=>{const{env:t}=e;try{const a=await e.req.formData(),r=a.get("file"),n=a.get("expense_id");if(!r)return e.json({error:"XML or PDF file is required for CFDI validation"},400);let i=null;if(r.type==="application/xml"||r.type==="text/xml")i=await ji(r);else if(r.type==="application/pdf")i=await Bi(r);else return e.json({error:"Only XML and PDF files are supported for CFDI validation"},400);const o=await is(i);return n&&i.uuid&&await t.DB.prepare(`
        UPDATE attachments 
        SET is_cfdi_valid = ?, cfdi_uuid = ?
        WHERE expense_id = ? AND id = (
          SELECT id FROM attachments WHERE expense_id = ? ORDER BY uploaded_at DESC LIMIT 1
        )
      `).bind(o.valid,i.uuid,n,n).run(),e.json({success:!0,cfdi_data:i,sat_validation:o,message:o.valid?"CFDI válido":"CFDI inválido o con errores"})}catch(a){return e.json({error:"Failed to validate CFDI",details:a.message},500)}});w.post("/api/cfdi/validate-data",async e=>{const{env:t}=e;try{const a=await e.req.json(),{company_id:r,rfc_emisor:n,rfc_receptor:i,uuid:o,total:c}=a;if(!r||!n||!i||!o)return e.json({error:"company_id, rfc_emisor, rfc_receptor, and uuid are required"},400);if(!await t.DB.prepare("SELECT * FROM companies WHERE id = ? AND country = ?").bind(r,"MX").first())return e.json({error:"Company not found or not a Mexican company"},400);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o))return e.json({error:"Invalid UUID format"},400);const p={rfc_emisor:n,rfc_receptor:i,uuid:o,total:parseFloat(c)||0,fecha_emision:new Date().toISOString(),serie:"A",folio:"001"},f=await is(p),m=await t.DB.prepare(`
      INSERT INTO cfdi_validations (
        company_id, uuid, rfc_emisor, rfc_receptor, total, 
        is_valid, validation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(r,o,n,i,c||0,f.valid?1:0,f.mensaje).run();return e.json({success:!0,validation_id:m.meta.last_row_id,cfdi_data:p,sat_valid:f.valid,validation_details:f.mensaje,message:f.valid?"CFDI validado exitosamente":"CFDI con errores de validación"})}catch(a){return e.json({error:"Failed to validate CFDI data",details:a.message},500)}});w.get("/api/expenses/:id/cfdi-status",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT id, file_name, is_cfdi_valid, cfdi_uuid, uploaded_at
      FROM attachments
      WHERE expense_id = ? AND (file_type = 'xml' OR file_type = 'pdf')
      ORDER BY uploaded_at DESC
    `).bind(a).all();return e.json({success:!0,cfdi_attachments:r.results,has_valid_cfdi:r.results.some(n=>n.is_cfdi_valid===1)})}catch{return e.json({error:"Failed to get CFDI status"},500)}});async function ji(e){return{version:"4.0",uuid:os(),rfc_emisor:"ABC123456789",razon_social_emisor:"Empresa Emisora S.A. de C.V.",rfc_receptor:"XYZ987654321",razon_social_receptor:"TechMX Solutions S.A. de C.V.",fecha:new Date().toISOString(),folio:"A001-"+Math.floor(Math.random()*1e5),serie:"A",forma_pago:"04",metodo_pago:"PUE",uso_cfdi:"G03",lugar_expedicion:"06600",moneda:"MXN",tipo_cambio:"1.000000",conceptos:[{clave_prod_serv:"84111506",no_identificacion:null,cantidad:"1.000000",clave_unidad:"ACT",unidad:"Actividad",descripcion:"Servicios de consultoría",valor_unitario:"2500.00",importe:"2500.00"}],subtotal:"2500.00",iva:"400.00",total:"2900.00",sello_digital:"ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ...",certificado_sat:"DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567ABC...",fecha_timbrado:new Date().toISOString(),no_certificado_sat:"30001000000400002495"}}async function Bi(e){return{version:"4.0",uuid:os(),rfc_emisor:"PDF123456789",razon_social_emisor:"Empresa PDF S.A. de C.V.",rfc_receptor:"TMX123456789",razon_social_receptor:"TechMX Solutions S.A. de C.V.",fecha:new Date().toISOString(),folio:"P001-"+Math.floor(Math.random()*1e5),serie:"P",forma_pago:"01",metodo_pago:"PUE",uso_cfdi:"G01",lugar_expedicion:"06600",moneda:"MXN",subtotal:"850.00",iva:"136.00",total:"986.00",extracted_from:"PDF",confidence:.85}}async function is(e){await new Promise(r=>setTimeout(r,1500));const t={uuid_format:/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(e.uuid),rfc_format:/^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/.test(e.rfc_emisor),date_valid:e.fecha_emision?new Date(e.fecha_emision)<=new Date:!0,amounts_valid:parseFloat(e.total)>0,version_supported:e.version?["3.3","4.0"].includes(e.version):!0},a=Object.values(t).every(r=>r);return{valid:a,timestamp:new Date().toISOString(),checks:t,sat_status:a?"VIGENTE":"INVALIDO",cancelable:a,estado_sat:a?"Activo":"Cancelado",mensaje:a?"CFDI válido y vigente en el SAT":"CFDI inválido o con errores en la estructura"}}function os(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){const t=Math.random()*16|0;return(e=="x"?t:t&3|8).toString(16)})}async function $i(e){const t={amount:null,currency:"MXN",date:null,vendor:null,description:null,tax_amount:null,payment_method:null,invoice_number:null,confidence_score:.85,is_cfdi:!1,cfdi_uuid:null,rfc_emisor:null};if(e.includes("CFDI")||e.includes("UUID")||e.includes("FOLIO FISCAL")){t.is_cfdi=!0,t.confidence_score+=.1;const l=e.match(/UUID[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);l&&(t.cfdi_uuid=l[1]);const d=e.match(/FOLIO FISCAL[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);d&&(t.cfdi_uuid=d[1])}const a=e.match(/(?:TOTAL|Total|total)[\s:]*\$?([\d,]+\.?\d*)/i);a&&(t.amount=parseFloat(a[1].replace(",","")),t.confidence_score+=.1);const r=e.match(/(?:FECHA|Fecha|fecha)[\s:]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);r&&(t.date=r[1],t.confidence_score+=.05);const n=e.split(`
`);if(n.length>0){const l=n.find(d=>d.trim()&&!d.includes("TICKET")&&!d.includes("FACTURA"));l&&(t.vendor=l.trim(),t.description=`Gasto en ${l.trim()}`)}const i=e.match(/RFC[\s:]*([A-Z]{3,4}\d{6}[A-Z0-9]{3})/i);i&&(t.rfc_emisor=i[1],t.confidence_score+=.05),e.toLowerCase().includes("efectivo")||e.toLowerCase().includes("cash")?t.payment_method="cash":(e.toLowerCase().includes("tarjeta")||e.toLowerCase().includes("card"))&&(t.payment_method="credit_card");const o=e.match(/(?:FOLIO|Folio|folio)[\s:]*([A-Z0-9\-]+)/i);o&&(t.invoice_number=o[1]);const c=e.match(/(?:IVA|iva)[\s:]*\$?([\d,]+\.?\d*)/i);return c&&(t.tax_amount=parseFloat(c[1].replace(",",""))),t}w.get("/api/expenses/:id/attachments",async e=>{const{env:t}=e,a=e.req.param("id");try{const r=await t.DB.prepare(`
      SELECT id, file_name, file_type, file_url, file_size, 
             mime_type, ocr_text, uploaded_at
      FROM attachments
      WHERE expense_id = ?
      ORDER BY uploaded_at ASC
    `).bind(a).all();return e.json({attachments:r.results})}catch{return e.json({error:"Failed to fetch attachments"},500)}});w.post("/api/reports/pdf",async e=>{const{env:t}=e;try{const a=await e.req.json(),{company_id:r,date_from:n,date_to:i,status:o,currency:c,user_id:l,expense_type_id:d,format:p="detailed"}=a;let f=`
      SELECT e.*, c.name as company_name, c.country, c.logo_url, c.primary_currency,
             u.name as user_name, et.name as expense_type_name, et.category,
             COUNT(a.id) as attachments_count
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      JOIN expense_types et ON e.expense_type_id = et.id
      LEFT JOIN attachments a ON e.id = a.expense_id
      WHERE 1=1
    `;const m=[];r&&(f+=" AND e.company_id = ?",m.push(r)),n&&(f+=" AND e.expense_date >= ?",m.push(n)),i&&(f+=" AND e.expense_date <= ?",m.push(i)),o&&(f+=" AND e.status = ?",m.push(o)),c&&(f+=" AND e.currency = ?",m.push(c)),l&&(f+=" AND e.user_id = ?",m.push(l)),d&&(f+=" AND e.expense_type_id = ?",m.push(d)),f+=" GROUP BY e.id ORDER BY e.expense_date DESC, e.created_at DESC";const x=await t.DB.prepare(f).bind(...m).all();let b=null;r&&(b=await t.DB.prepare("SELECT * FROM companies WHERE id = ?").bind(r).first());const h=Hi(x.results,b,p,{date_from:n,date_to:i,status:o,currency:c});return e.json({success:!0,html_content:h,total_expenses:x.results.length,total_amount:x.results.reduce((v,N)=>v+parseFloat(N.amount_mxn||0),0),filters:{company_id:r,date_from:n,date_to:i,status:o,currency:c,user_id:l,expense_type_id:d},message:"PDF content generated successfully"})}catch(a){return e.json({error:"Failed to generate PDF report",details:a.message},500)}});w.post("/api/reports/excel",async e=>{const{env:t}=e;try{const r=await e.req.json();let n=`
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
    `;const i=[];r.company_id&&(n+=" AND e.company_id = ?",i.push(r.company_id)),r.date_from&&(n+=" AND e.expense_date >= ?",i.push(r.date_from)),r.date_to&&(n+=" AND e.expense_date <= ?",i.push(r.date_to)),r.status&&(n+=" AND e.status = ?",i.push(r.status)),n+=" ORDER BY e.expense_date DESC";const o=await t.DB.prepare(n).bind(...i).all();return e.json({success:!0,data:o.results,total_records:o.results.length,total_amount_mxn:o.results.reduce((c,l)=>c+parseFloat(l.amount_mxn||0),0),export_date:new Date().toISOString(),filters:r})}catch(a){return e.json({error:"Failed to generate Excel export",details:a.message},500)}});w.post("/api/import/excel",async e=>{const{env:t}=e;try{const a=await e.req.json(),{data:r,mappings:n,company_id:i,user_id:o=1}=a;if(!r||!Array.isArray(r)||!n)return e.json({error:"Data and column mappings are required"},400);const c={total:r.length,imported:0,errors:[],skipped:0};for(let l=0;l<r.length;l++){const d=r[l];try{const p={company_id:i||Y(d,n.company_id),expense_type_id:Y(d,n.expense_type_id)||10,description:Y(d,n.description)||"Importado desde Excel",expense_date:Y(d,n.expense_date)||new Date().toISOString().split("T")[0],amount:parseFloat(Y(d,n.amount))||0,currency:Y(d,n.currency)||"MXN",payment_method:Y(d,n.payment_method)||"cash",vendor:Y(d,n.vendor)||"",notes:Y(d,n.notes)||"Importado desde Excel",status:"pending",user_id:o,created_by:o};let f=1,m=p.amount;p.currency==="USD"?(f=18.25,m=p.amount*f):p.currency==="EUR"&&(f=20.15,m=p.amount*f);const x=await t.DB.prepare(`
          INSERT INTO expenses (
            company_id, user_id, expense_type_id, description, expense_date, 
            amount, currency, exchange_rate, amount_mxn, payment_method, 
            vendor, notes, status, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(p.company_id,p.user_id,p.expense_type_id,p.description,p.expense_date,p.amount,p.currency,f,m,p.payment_method,p.vendor,p.notes,p.status,p.created_by).run();c.imported++}catch(p){c.errors.push({row:l+1,error:p.message,data:d})}}return e.json({success:!0,results:c,message:`Importación completada: ${c.imported} gastos importados, ${c.errors.length} errores`})}catch(a){return e.json({error:"Failed to import Excel data",details:a.message},500)}});function Y(e,t){return t&&e[t]||null}function Hi(e,t,a,r){const n=new Date().toLocaleDateString("es-MX"),i=(t==null?void 0:t.name)||"Consolidado Multiempresa",o=(t==null?void 0:t.country)==="MX"?"🇲🇽":(t==null?void 0:t.country)==="ES"?"🇪🇸":"🌍",c=i.substring(0,2).toUpperCase();let l=`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Ejecutivo - ${i}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * { box-sizing: border-box; }
            
            body { 
                font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);
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
                    <div class="logo">${c}</div>
                </div>
                <div class="company-title">
                    <h1>${o} ${i}</h1>
                    <h2>Reporte Ejecutivo de Gastos y Viáticos</h2>
                    <p class="company-info">
                        Sistema Lyra Expenses • Análisis Inteligente de Gestión Financiera<br>
                        Generado el ${n} • Formato Premium
                    </p>
                </div>
            </div>
            
            <div class="filters">
                <h3>📊 Parámetros del Análisis</h3>
                <p><strong>Período de Análisis:</strong> ${r.date_from||"Desde el inicio"} - ${r.date_to||"Hasta la fecha actual"}</p>
                ${r.status?`<p><strong>Estado de Gastos:</strong> ${r.status.toUpperCase()}</p>`:""}
                ${r.currency?`<p><strong>Moneda Base:</strong> ${r.currency}</p>`:""}
                <p><strong>Fecha de Generación:</strong> ${n} • <strong>Formato:</strong> ${a.toUpperCase()}</p>
            </div>
        </div>
  `;const d=e.reduce((x,b)=>x+parseFloat(b.amount_mxn||0),0),p=e.length,f=e.filter(x=>x.status==="pending").length,m=e.reduce((x,b)=>(x[b.currency]=(x[b.currency]||0)+parseFloat(b.amount||0),x),{});return l+=`
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
                    <div class="summary-number">${f}</div>
                    <div class="summary-label">Gastos Pendientes</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${Object.keys(m).length}</div>
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
  `,e.forEach(x=>{l+=`
      <tr>
          <td>${new Date(x.expense_date).toLocaleDateString("es-MX")}</td>
          <td>${x.description}</td>
          <td>${x.user_name}</td>
          <td>${x.expense_type_name}</td>
          <td class="currency-${x.currency.toLowerCase()}">${x.currency} $${parseFloat(x.amount).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
          <td class="currency-mxn">MXN $${parseFloat(x.amount_mxn).toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
          <td><span class="status-${x.status}">${Gi(x.status)}</span></td>
          <td>${Xi(x.payment_method)}</td>
      </tr>
    `}),l+=`
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
                
                <p><strong>Métricas del Reporte:</strong> ${p} transacciones analizadas • ${Object.keys(m).length} divisas operativas</p>
                <p><strong>Generado:</strong> ${n} • <strong>Modelo:</strong> ${a.toUpperCase()} • <strong>Sistema:</strong> v2.1 Premium</p>
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    Este reporte ha sido generado automáticamente por el sistema Lyra Expenses.<br>
                    Todos los datos están actualizados en tiempo real y han sido validados por nuestros algoritmos de control financiero.
                </p>
            </div>
        </div>
    </body>
    </html>
  `,l}function Gi(e){return{pending:"Pendiente",approved:"Aprobado",rejected:"Rechazado",reimbursed:"Reembolsado",invoiced:"Facturado"}[e]||e}function Xi(e){return{cash:"Efectivo",credit_card:"Tarjeta de Crédito",debit_card:"Tarjeta de Débito",bank_transfer:"Transferencia",company_card:"Tarjeta Empresarial",petty_cash:"Caja Chica"}[e]||e}w.get("/",e=>e.html(`<!DOCTYPE html>
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
                    <a href="/" class="text-white font-medium px-3 py-2 rounded-md bg-white bg-opacity-20">
                        <i class="fas fa-chart-pie mr-2"></i>Dashboard
                    </a>
                    <a href="/companies" class="text-white hover:text-purple-200 font-medium px-3 py-2 rounded-md hover:bg-white hover:bg-opacity-10 transition">
                        <i class="fas fa-building mr-2"></i>Empresas
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
</html>`));w.get("/companies",e=>e.render(s("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);",children:[s("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:s("div",{className:"flex justify-between items-center py-6",children:[s("div",{className:"flex items-center space-x-6",children:[s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"relative",children:[s("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),s("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),s("div",{children:[s("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),s("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),s("span",{className:"nav-badge",children:"Sistema 4-D Premium"})]}),s("div",{className:"flex items-center space-x-8",children:[s("nav",{className:"flex space-x-6",children:[s("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-chart-pie"}),s("span",{children:"Dashboard"})]}),s("a",{href:"/companies",className:"nav-link text-gold active flex items-center space-x-2",children:[s("i",{className:"fas fa-building"}),s("span",{children:"Empresas"})]}),s("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-receipt"}),s("span",{children:"Gastos"})]}),s("a",{href:"/analytics",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-chart-line"}),s("span",{children:"Analytics"})]})]}),s("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[s("div",{id:"auth-indicator"}),s("select",{id:"currency-selector",className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:[s("option",{value:"MXN",children:"💎 MXN"}),s("option",{value:"USD",children:"🔹 USD"}),s("option",{value:"EUR",children:"🔸 EUR"})]}),s("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[s("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[s("div",{className:"text-center mb-12",children:[s("h2",{className:"text-4xl font-bold gradient-text-gold mb-3",children:[s("i",{className:"fas fa-building-columns mr-3"}),"Portfolio Corporativo"]}),s("p",{className:"text-secondary text-lg",children:"Gestión multiempresa internacional • MX + ES"}),s("div",{className:"flex justify-center mt-4",children:s("div",{className:"flex items-center space-x-6 text-sm text-tertiary",children:[s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),"6 empresas activas"]}),s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),"Operaciones globales"]}),s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Multimoneda: MXN • USD • EUR"]})]})})]}),s("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:[s("div",{className:"company-card-premium animate-slide-up group cursor-pointer",onClick:"window.location.href='/company/1'",children:[s("div",{className:"flex items-center justify-between mb-6",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:s("span",{className:"text-3xl",children:"🇲🇽"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"TechMX Solutions"}),s("p",{className:"text-sm text-secondary",children:"Tecnología • México"})]})]}),s("div",{className:"text-right",children:[s("div",{className:"status-badge-premium status-approved-premium mb-2",children:[s("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),s("p",{className:"text-xs text-tertiary",children:"MXN Principal"})]})]}),s("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-emerald",children:"24"}),s("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-gold",children:"$485K"}),s("div",{className:"text-xs text-tertiary",children:"Gastos MXN"})]})]}),s("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[s("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),s("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),s("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.1s",onClick:"window.location.href='/company/2'",children:[s("div",{className:"flex items-center justify-between mb-6",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:s("span",{className:"text-3xl",children:"🇲🇽"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Innovación Digital MX"}),s("p",{className:"text-sm text-secondary",children:"Digital • México"})]})]}),s("div",{className:"text-right",children:[s("div",{className:"status-badge-premium status-approved-premium mb-2",children:[s("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),s("p",{className:"text-xs text-tertiary",children:"MXN Principal"})]})]}),s("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-emerald",children:"18"}),s("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-gold",children:"$325K"}),s("div",{className:"text-xs text-tertiary",children:"Gastos MXN"})]})]}),s("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[s("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),s("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),s("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.2s",onClick:"window.location.href='/company/3'",children:[s("div",{className:"flex items-center justify-between mb-6",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:s("span",{className:"text-3xl",children:"🇲🇽"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Consultoría Estratégica MX"}),s("p",{className:"text-sm text-secondary",children:"Consultoría • México"})]})]}),s("div",{className:"text-right",children:[s("div",{className:"status-badge-premium status-approved-premium mb-2",children:[s("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),s("p",{className:"text-xs text-tertiary",children:"MXN Principal"})]})]}),s("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-emerald",children:"12"}),s("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-gold",children:"$195K"}),s("div",{className:"text-xs text-tertiary",children:"Gastos MXN"})]})]}),s("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[s("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),s("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),s("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.3s",onClick:"window.location.href='/company/4'",children:[s("div",{className:"flex items-center justify-between mb-6",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:s("span",{className:"text-3xl",children:"🇪🇸"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"TechES Barcelona"}),s("p",{className:"text-sm text-secondary",children:"Tecnología • España"})]})]}),s("div",{className:"text-right",children:[s("div",{className:"status-badge-premium status-approved-premium mb-2",children:[s("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),s("p",{className:"text-xs text-tertiary",children:"EUR Principal"})]})]}),s("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-emerald",children:"32"}),s("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-gold",children:"€85K"}),s("div",{className:"text-xs text-tertiary",children:"Gastos EUR"})]})]}),s("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[s("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),s("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),s("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.4s",onClick:"window.location.href='/company/5'",children:[s("div",{className:"flex items-center justify-between mb-6",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:s("span",{className:"text-3xl",children:"🇪🇸"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Innovación Madrid SL"}),s("p",{className:"text-sm text-secondary",children:"Innovación • España"})]})]}),s("div",{className:"text-right",children:[s("div",{className:"status-badge-premium status-approved-premium mb-2",children:[s("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),s("p",{className:"text-xs text-tertiary",children:"EUR Principal"})]})]}),s("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-emerald",children:"28"}),s("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-gold",children:"€72K"}),s("div",{className:"text-xs text-tertiary",children:"Gastos EUR"})]})]}),s("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[s("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),s("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),s("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.5s",onClick:"window.location.href='/company/6'",children:[s("div",{className:"flex items-center justify-between mb-6",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:s("span",{className:"text-3xl",children:"🇪🇸"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Digital Valencia S.A."}),s("p",{className:"text-sm text-secondary",children:"Digital • España"})]})]}),s("div",{className:"text-right",children:[s("div",{className:"status-badge-premium status-approved-premium mb-2",children:[s("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),s("p",{className:"text-xs text-tertiary",children:"EUR Principal"})]})]}),s("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-emerald",children:"22"}),s("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),s("div",{className:"text-center p-3 bg-glass rounded-lg",children:[s("div",{className:"text-2xl font-bold text-gold",children:"€58K"}),s("div",{className:"text-xs text-tertiary",children:"Gastos EUR"})]})]}),s("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[s("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),s("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]})]}),s("div",{className:"mt-16 glass-panel p-8",children:[s("div",{className:"text-center mb-8",children:[s("h3",{className:"text-2xl font-bold text-primary mb-2",children:"Resumen Consolidado"}),s("p",{className:"text-secondary",children:"Vista general del portfolio corporativo"})]}),s("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-6",children:[s("div",{className:"text-center",children:[s("div",{className:"text-3xl font-bold text-emerald mb-2",children:"136"}),s("div",{className:"text-sm text-secondary",children:"Total Empleados"})]}),s("div",{className:"text-center",children:[s("div",{className:"text-3xl font-bold text-gold mb-2",children:"$1,120K"}),s("div",{className:"text-sm text-secondary",children:"Gastos Totales MXN"})]}),s("div",{className:"text-center",children:[s("div",{className:"text-3xl font-bold text-sapphire mb-2",children:"€215K"}),s("div",{className:"text-sm text-secondary",children:"Gastos Totales EUR"})]}),s("div",{className:"text-center",children:[s("div",{className:"text-3xl font-bold text-ruby mb-2",children:"6"}),s("div",{className:"text-sm text-secondary",children:"Empresas Activas"})]})]})]})]}),s("script",{src:"/static/app.js"})]})));w.get("/company/:id",e=>{const t=e.req.param("id"),r={1:{name:"TechMX Solutions",country:"MX",currency:"MXN",flag:"🇲🇽",employees:24,expenses:"485K",category:"Tecnología"},2:{name:"Innovación Digital MX",country:"MX",currency:"MXN",flag:"🇲🇽",employees:18,expenses:"325K",category:"Digital"},3:{name:"Consultoría Estratégica MX",country:"MX",currency:"MXN",flag:"🇲🇽",employees:12,expenses:"195K",category:"Consultoría"},4:{name:"TechES Barcelona",country:"ES",currency:"EUR",flag:"🇪🇸",employees:32,expenses:"85K",category:"Tecnología"},5:{name:"Innovación Madrid SL",country:"ES",currency:"EUR",flag:"🇪🇸",employees:28,expenses:"72K",category:"Innovación"},6:{name:"Digital Valencia S.A.",country:"ES",currency:"EUR",flag:"🇪🇸",employees:22,expenses:"58K",category:"Digital"}}[t];return r?e.render(s("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);",children:[s("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:s("div",{className:"flex justify-between items-center py-6",children:[s("div",{className:"flex items-center space-x-6",children:[s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"relative",children:[s("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),s("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),s("div",{children:[s("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),s("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),s("span",{className:"nav-badge",children:[r.flag," ",r.name]})]}),s("div",{className:"flex items-center space-x-8",children:[s("nav",{className:"flex space-x-6",children:[s("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-chart-pie"}),s("span",{children:"Dashboard"})]}),s("a",{href:"/companies",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-building"}),s("span",{children:"Empresas"})]}),s("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-receipt"}),s("span",{children:"Gastos"})]})]}),s("div",{className:"flex items-center space-x-2 text-sm text-tertiary",children:[s("a",{href:"/companies",className:"hover:text-gold",children:"Empresas"}),s("i",{className:"fas fa-chevron-right"}),s("span",{className:"text-gold",children:r.name})]}),s("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[s("select",{className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:s("option",{children:[r.flag," ",r.currency]})}),s("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[s("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[s("div",{className:"text-center mb-12",children:[s("div",{className:"inline-flex items-center space-x-4 mb-4",children:[s("div",{className:"p-4 rounded-2xl bg-glass",children:s("span",{className:"text-6xl",children:r.flag})}),s("div",{className:"text-left",children:[s("h2",{className:"text-4xl font-bold gradient-text-gold",children:r.name}),s("p",{className:"text-xl text-secondary",children:[r.category," • ",r.country==="MX"?"México":"España"]})]})]}),s("div",{className:"flex justify-center mt-4",children:s("div",{className:"flex items-center space-x-8 text-sm text-tertiary",children:[s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),r.employees," empleados activos"]}),s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),r.currency," ",r.expenses," en gastos"]}),s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Operativa desde 2019"]})]})})]}),s("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12",children:[s("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.1s",children:[s("div",{className:"flex items-center justify-between mb-4",children:s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"p-3 rounded-xl bg-glass",children:s("i",{className:"fas fa-coins text-emerald text-xl"})}),s("div",{children:[s("p",{className:"metric-label text-emerald",children:"Gastos Mensuales"}),s("p",{className:"text-xs text-tertiary",children:"Este mes"})]})]})}),s("div",{className:"metric-value text-emerald",children:[r.currency," ",r.expenses]}),s("div",{className:"text-xs text-tertiary mt-2",children:"+8.5% vs mes anterior"})]}),s("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.2s",children:[s("div",{className:"flex items-center justify-between mb-4",children:s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"p-3 rounded-xl bg-glass",children:s("i",{className:"fas fa-users text-sapphire text-xl"})}),s("div",{children:[s("p",{className:"metric-label text-sapphire",children:"Empleados"}),s("p",{className:"text-xs text-tertiary",children:"Plantilla actual"})]})]})}),s("div",{className:"metric-value text-sapphire",children:r.employees}),s("div",{className:"text-xs text-tertiary mt-2",children:"+2 nuevas contrataciones"})]}),s("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.3s",children:[s("div",{className:"flex items-center justify-between mb-4",children:s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"p-3 rounded-xl bg-glass",children:s("i",{className:"fas fa-clock text-gold text-xl"})}),s("div",{children:[s("p",{className:"metric-label text-gold",children:"Pendientes"}),s("p",{className:"text-xs text-tertiary",children:"Por revisar"})]})]})}),s("div",{className:"metric-value text-gold",children:"7"}),s("div",{className:"text-xs text-tertiary mt-2",children:"2 urgentes"})]}),s("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.4s",children:[s("div",{className:"flex items-center justify-between mb-4",children:s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"p-3 rounded-xl bg-glass",children:s("i",{className:"fas fa-percentage text-ruby text-xl"})}),s("div",{children:[s("p",{className:"metric-label text-ruby",children:"Eficiencia"}),s("p",{className:"text-xs text-tertiary",children:"Aprobación"})]})]})}),s("div",{className:"metric-value text-ruby",children:"94.2%"}),s("div",{className:"text-xs text-tertiary mt-2",children:"Excelente performance"})]})]}),s("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12",children:[s("div",{className:"glass-panel p-8",children:[s("div",{className:"flex justify-between items-center mb-6",children:s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"p-2 rounded-lg bg-glass",children:s("i",{className:"fas fa-chart-line text-emerald text-xl"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary",children:"Tendencia de Gastos"}),s("p",{className:"text-xs text-tertiary",children:["Últimos 6 meses • ",r.name]})]})]})}),s("div",{id:"company-trend-chart",className:"h-64 rounded-lg bg-glass p-4",children:s("div",{className:"flex items-center justify-center h-full",children:s("div",{className:"text-center",children:[s("i",{className:"fas fa-chart-line text-4xl text-emerald mb-4"}),s("p",{className:"text-secondary",children:"Gráfica de tendencias específica"}),s("p",{className:"text-xs text-tertiary",children:["Datos de ",r.name]})]})})})]}),s("div",{className:"glass-panel p-8",children:[s("div",{className:"flex justify-between items-center mb-6",children:s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"p-2 rounded-lg bg-glass",children:s("i",{className:"fas fa-chart-pie text-gold text-xl"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary",children:"Distribución por Categoría"}),s("p",{className:"text-xs text-tertiary",children:"Análisis de tipos de gasto"})]})]})}),s("div",{id:"company-category-chart",className:"h-64 rounded-lg bg-glass p-4",children:s("div",{className:"flex items-center justify-center h-full",children:s("div",{className:"text-center",children:[s("i",{className:"fas fa-chart-pie text-4xl text-gold mb-4"}),s("p",{className:"text-secondary",children:"Distribución por categoría"}),s("p",{className:"text-xs text-tertiary",children:"Viajes, comidas, tecnología, etc."})]})})})]})]}),s("div",{className:"glass-panel p-8",children:[s("div",{className:"flex justify-between items-center mb-6",children:[s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"p-2 rounded-lg bg-glass",children:s("i",{className:"fas fa-history text-sapphire text-xl"})}),s("div",{children:[s("h3",{className:"text-xl font-bold text-primary",children:"Actividad Reciente"}),s("p",{className:"text-xs text-tertiary",children:["Últimos movimientos en ",r.name]})]})]}),s("a",{href:"/expenses",className:"btn-premium btn-sapphire text-sm",children:[s("i",{className:"fas fa-external-link-alt mr-2"}),"Ver todos los gastos"]})]}),s("div",{className:"space-y-4",children:[s("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-2 rounded-lg bg-emerald bg-opacity-20",children:s("i",{className:"fas fa-plane text-emerald"})}),s("div",{children:[s("p",{className:"font-semibold text-primary",children:"Vuelo Madrid-Barcelona"}),s("p",{className:"text-sm text-tertiary",children:"María López • Hace 2 horas"})]})]}),s("div",{className:"text-right",children:[s("p",{className:"font-bold text-emerald",children:[r.currency," 250"]}),s("p",{className:"text-xs text-tertiary",children:"Aprobado"})]})]}),s("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-2 rounded-lg bg-gold bg-opacity-20",children:s("i",{className:"fas fa-utensils text-gold"})}),s("div",{children:[s("p",{className:"font-semibold text-primary",children:"Comida con cliente"}),s("p",{className:"text-sm text-tertiary",children:"Carlos Martínez • Hace 4 horas"})]})]}),s("div",{className:"text-right",children:[s("p",{className:"font-bold text-gold",children:[r.currency," 125"]}),s("p",{className:"text-xs text-tertiary",children:"Pendiente"})]})]}),s("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"p-2 rounded-lg bg-sapphire bg-opacity-20",children:s("i",{className:"fas fa-laptop text-sapphire"})}),s("div",{children:[s("p",{className:"font-semibold text-primary",children:"Software Adobe Creative Suite"}),s("p",{className:"text-sm text-tertiary",children:"Ana García • Hace 1 día"})]})]}),s("div",{className:"text-right",children:[s("p",{className:"font-bold text-sapphire",children:[r.currency," 89"]}),s("p",{className:"text-xs text-tertiary",children:"Aprobado"})]})]})]})]})]}),s("script",{src:"/static/app.js"})]})):e.redirect("/companies")});w.get("/expenses",e=>e.html(`
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
  `));w.get("/expenses-old",e=>e.render(s("div",{className:"min-h-screen bg-primary",children:[s("div",{className:"bg-glass border-b border-glass-border backdrop-blur-sm",children:s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:s("div",{className:"flex justify-between items-center py-6",children:[s("div",{className:"flex items-center space-x-6",children:[s("a",{href:"/",className:"text-gold hover:text-gold-light transition-colors duration-200 text-xl",children:s("i",{className:"fas fa-arrow-left"})}),s("div",{children:[s("h1",{className:"text-3xl font-bold text-primary flex items-center",children:[s("i",{className:"fas fa-receipt mr-3 text-gold"}),"Gestión de Gastos"]}),s("p",{className:"text-sm text-tertiary mt-1",children:"Control integral de gastos y viáticos empresariales"})]})]}),s("div",{className:"flex items-center space-x-4",children:[s("button",{className:"btn-premium btn-emerald",onclick:"showExpenseForm()",children:[s("i",{className:"fas fa-plus mr-2"}),"Registrar Gasto"]}),s("button",{className:"btn-premium btn-sapphire",onclick:"showImportExcel()",children:[s("i",{className:"fas fa-file-excel mr-2"}),"Importar Excel"]})]})]})})}),s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[s("div",{className:"card-premium mb-8",children:[s("div",{className:"flex items-center justify-between mb-6",children:s("div",{children:[s("h3",{className:"text-xl font-bold text-primary flex items-center",children:[s("i",{className:"fas fa-filter mr-3 text-gold"}),"Filtros Avanzados de Gastos"]}),s("p",{className:"text-sm text-tertiary mt-1",children:"Personaliza tu búsqueda con filtros multidimensionales"})]})}),s("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:[s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"🏢 Empresa"}),s("select",{id:"filter-company",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_COMPANY(this.value)",style:"background-color: white !important; color: black !important;",children:[s("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todas las empresas"}),s("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"🇲🇽 TechMX Solutions"}),s("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"🇲🇽 Innovación Digital MX"}),s("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"🇲🇽 Consultoría Estratégica MX"}),s("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"🇪🇸 TechES Barcelona"}),s("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"🇪🇸 Innovación Madrid SL"}),s("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"🇪🇸 Digital Valencia S.A."})]})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"👤 Usuario Responsable"}),s("select",{id:"filter-user",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_USER(this.value)",style:"background-color: white !important; color: black !important;",children:[s("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los usuarios"}),s("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"👑 Alejandro Rodríguez (Admin)"}),s("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"✏️ María López (Editor)"}),s("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"⭐ Carlos Martínez (Advanced)"}),s("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"✏️ Ana García (Editor)"}),s("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"⭐ Pedro Sánchez (Advanced)"}),s("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"✏️ Elena Torres (Editor)"})]})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📋 Estado del Gasto"}),s("select",{id:"filter-status",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_STATUS(this.value)",style:"background-color: white !important; color: black !important;",children:[s("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los estados"}),s("option",{value:"pending",style:"background-color: white !important; color: black !important;",children:"⏳ Pendiente"}),s("option",{value:"approved",style:"background-color: white !important; color: black !important;",children:"✅ Aprobado"}),s("option",{value:"rejected",style:"background-color: white !important; color: black !important;",children:"❌ Rechazado"}),s("option",{value:"reimbursed",style:"background-color: white !important; color: black !important;",children:"💰 Reembolsado"}),s("option",{value:"invoiced",style:"background-color: white !important; color: black !important;",children:"📄 Facturado"})]})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"💰 Moneda"}),s("select",{id:"filter-currency",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;",children:[s("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todas las monedas"}),s("option",{value:"MXN",style:"background-color: white !important; color: black !important;",children:"🇲🇽 MXN"}),s("option",{value:"USD",style:"background-color: white !important; color: black !important;",children:"🇺🇸 USD"}),s("option",{value:"EUR",style:"background-color: white !important; color: black !important;",children:"🇪🇺 EUR"})]})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"🏷️ Tipo de Gasto"}),s("select",{id:"filter-expense-type",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_TYPE(this.value)",style:"background-color: white !important; color: black !important;",children:[s("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los tipos"}),s("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"🍽️ Comidas de Trabajo"}),s("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"🚕 Transporte Terrestre"}),s("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"⛽ Combustible"}),s("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"🏨 Hospedaje"}),s("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"✈️ Vuelos"}),s("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"📄 Material de Oficina"}),s("option",{value:"7",style:"background-color: white !important; color: black !important;",children:"💻 Software y Licencias"}),s("option",{value:"8",style:"background-color: white !important; color: black !important;",children:"🎓 Capacitación"}),s("option",{value:"9",style:"background-color: white !important; color: black !important;",children:"📊 Marketing"}),s("option",{value:"10",style:"background-color: white !important; color: black !important;",children:"📂 Otros Gastos"})]})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📅 Fecha Desde"}),s("input",{type:"date",id:"filter-date-from",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📅 Fecha Hasta"}),s("input",{type:"date",id:"filter-date-to",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-secondary mb-3",children:"💳 Método de Pago"}),s("select",{id:"filter-payment-method",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;",children:[s("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los métodos"}),s("option",{value:"cash",style:"background-color: white !important; color: black !important;",children:"💵 Efectivo"}),s("option",{value:"credit_card",style:"background-color: white !important; color: black !important;",children:"💳 Tarjeta de Crédito"}),s("option",{value:"debit_card",style:"background-color: white !important; color: black !important;",children:"💳 Tarjeta de Débito"}),s("option",{value:"bank_transfer",style:"background-color: white !important; color: black !important;",children:"🏦 Transferencia"}),s("option",{value:"company_card",style:"background-color: white !important; color: black !important;",children:"🏢 Tarjeta Empresarial"}),s("option",{value:"petty_cash",style:"background-color: white !important; color: black !important;",children:"💰 Caja Chica"})]})]})]}),s("div",{className:"flex flex-wrap gap-3 mt-6",children:[s("button",{onclick:"EXPENSES_APPLY_ALL_FILTERS()",className:"btn-premium btn-sapphire",children:[s("i",{className:"fas fa-search mr-2"}),"Aplicar Filtros"]}),s("button",{onclick:"EXPENSES_CLEAR_ALL()",className:"btn-premium btn-slate",children:[s("i",{className:"fas fa-eraser mr-2"}),"Limpiar Todo"]}),s("button",{onclick:"EXPENSES_TEST_MARIA()",className:"btn-premium btn-emerald text-sm",children:[s("i",{className:"fas fa-user mr-2"}),"Probar María"]}),s("button",{onclick:"EXPENSES_TEST_PENDING()",className:"btn-premium btn-gold text-sm",children:[s("i",{className:"fas fa-clock mr-2"}),"Solo Pendientes"]}),s("button",{onclick:"QUITAR_MARIA()",className:"btn-premium btn-ruby text-sm",children:[s("i",{className:"fas fa-user-slash mr-2"}),"Quitar María"]})]})]}),s("div",{className:"card-premium",children:[s("div",{className:"flex items-center justify-between mb-6",children:[s("div",{children:[s("h3",{className:"text-xl font-bold text-primary flex items-center",children:[s("i",{className:"fas fa-list-alt mr-3 text-gold"}),"Lista de Gastos y Viáticos"]}),s("p",{className:"text-sm text-tertiary mt-1",children:"Registro completo de transacciones empresariales"})]}),s("div",{className:"flex items-center space-x-4",children:[s("div",{className:"text-center",children:[s("div",{id:"expenses-count",className:"text-lg font-bold text-emerald",children:"0 gastos"}),s("div",{className:"text-xs text-tertiary",children:"Total registros"})]}),s("div",{className:"text-center",children:[s("div",{id:"expenses-total",className:"text-lg font-bold text-gold",children:"$0.00"}),s("div",{className:"text-xs text-tertiary",children:"Monto total"})]})]})]}),s("div",{className:"overflow-x-auto bg-glass rounded-lg border border-glass-border",children:s("table",{className:"min-w-full",children:[s("thead",{className:"bg-quaternary border-b border-glass-border",children:s("tr",{children:[s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("input",{type:"checkbox",id:"select-all",className:"mr-2 accent-gold",onclick:"toggleSelectAll()"}),s("i",{className:"fas fa-hashtag mr-1 text-gold"}),"ID"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-file-text mr-1 text-gold"}),"Descripción"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-building mr-1 text-gold"}),"Empresa"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-user mr-1 text-gold"}),"Usuario"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-money-bill mr-1 text-gold"}),"Monto Original"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-peso-sign mr-1 text-gold"}),"Monto MXN"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-flag mr-1 text-gold"}),"Estado"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-calendar mr-1 text-gold"}),"Fecha"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-paperclip mr-1 text-gold"}),"Adjuntos"]}),s("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[s("i",{className:"fas fa-cogs mr-1 text-gold"}),"Acciones"]})]})}),s("tbody",{id:"expenses-table",className:"divide-y divide-glass-border",children:s("tr",{className:"hover:bg-glass-hover transition-colors duration-200",children:s("td",{colspan:"10",className:"px-6 py-8 text-center",children:s("div",{className:"flex flex-col items-center",children:[s("i",{className:"fas fa-spinner fa-spin text-2xl text-gold mb-3"}),s("span",{className:"text-secondary",children:"Cargando gastos..."})]})})})})]})})]})]}),s("div",{id:"expense-modal",className:"fixed inset-0 z-50 hidden",children:[s("div",{className:"fixed inset-0 bg-black bg-opacity-50",onclick:"closeExpenseForm()"}),s("div",{className:"fixed inset-0 overflow-y-auto",children:s("div",{className:"flex min-h-full items-center justify-center p-4",children:s("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",children:[s("div",{className:"px-6 py-4 border-b border-gray-200",children:[s("div",{className:"flex items-center justify-between",children:[s("h3",{className:"text-lg font-semibold text-gray-900",children:[s("i",{className:"fas fa-plus-circle mr-2 text-green-600"}),"Registrar Nuevo Gasto o Viático"]}),s("button",{onclick:"closeExpenseForm()",className:"text-gray-400 hover:text-gray-600",children:s("i",{className:"fas fa-times text-xl"})})]}),s("p",{className:"text-sm text-gray-500 mt-1",children:"Complete todos los campos requeridos. Los campos marcados con * son obligatorios."})]}),s("form",{id:"expense-form",className:"px-6 py-4",children:[s("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[s("div",{className:"space-y-4",children:[s("h4",{className:"font-semibold text-gray-900 border-b pb-2",children:"📋 Información Básica"}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Empresa * ",s("i",{className:"fas fa-building ml-1 text-blue-500"})]}),s("select",{id:"form-company",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:s("option",{value:"",children:"Seleccione una empresa..."})})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Tipo de Gasto * ",s("i",{className:"fas fa-tags ml-1 text-purple-500"})]}),s("select",{id:"form-expense-type",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:s("option",{value:"",children:"Seleccione tipo de gasto..."})})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Descripción * ",s("i",{className:"fas fa-edit ml-1 text-green-500"})]}),s("textarea",{id:"form-description",required:!0,rows:"3",placeholder:"Ej: Comida con cliente - Proyecto Alpha",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Fecha del Gasto * ",s("i",{className:"fas fa-calendar ml-1 text-red-500"})]}),s("input",{type:"date",id:"form-expense-date",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Responsable ",s("i",{className:"fas fa-user ml-1 text-indigo-500"})]}),s("select",{id:"form-responsible",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:s("option",{value:"",children:"Yo (usuario actual)"})})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Integrantes ",s("i",{className:"fas fa-users ml-1 text-orange-500"})]}),s("textarea",{id:"form-attendees",rows:"2",placeholder:"Ej: María López, Carlos Martínez (opcional)",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]})]}),s("div",{className:"space-y-4",children:[s("h4",{className:"font-semibold text-gray-900 border-b pb-2",children:"💰 Información Financiera"}),s("div",{className:"grid grid-cols-2 gap-3",children:[s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Monto * ",s("i",{className:"fas fa-dollar-sign ml-1 text-green-600"})]}),s("input",{type:"number",step:"0.01",id:"form-amount",required:!0,placeholder:"0.00",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Moneda * ",s("i",{className:"fas fa-coins ml-1 text-yellow-600"})]}),s("select",{id:"form-currency",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",onchange:"updateExchangeRate()",children:[s("option",{value:"",children:"Seleccionar..."}),s("option",{value:"MXN",children:"🇲🇽 MXN"}),s("option",{value:"USD",children:"🇺🇸 USD"}),s("option",{value:"EUR",children:"🇪🇺 EUR"})]})]})]}),s("div",{id:"exchange-rate-section",className:"hidden",children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Tipo de Cambio ",s("i",{className:"fas fa-exchange-alt ml-1 text-blue-600"})]}),s("div",{className:"flex items-center space-x-2",children:[s("input",{type:"number",step:"0.000001",id:"form-exchange-rate",readonly:!0,className:"flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"}),s("button",{type:"button",onclick:"refreshExchangeRate()",className:"px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",children:s("i",{className:"fas fa-sync-alt"})})]}),s("p",{id:"exchange-rate-info",className:"text-xs text-gray-500 mt-1"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Método de Pago * ",s("i",{className:"fas fa-credit-card ml-1 text-purple-600"})]}),s("select",{id:"form-payment-method",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:[s("option",{value:"",children:"Seleccione método..."}),s("option",{value:"cash",children:"💵 Efectivo"}),s("option",{value:"credit_card",children:"💳 Tarjeta de Crédito"}),s("option",{value:"debit_card",children:"💳 Tarjeta de Débito"}),s("option",{value:"bank_transfer",children:"🏦 Transferencia Bancaria"}),s("option",{value:"company_card",children:"🏢 Tarjeta Empresarial"}),s("option",{value:"petty_cash",children:"🪙 Caja Chica"})]})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Proveedor/Establecimiento ",s("i",{className:"fas fa-store ml-1 text-teal-500"})]}),s("input",{type:"text",id:"form-vendor",placeholder:"Ej: Restaurante Pujol, Uber, Adobe Inc",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Número de Factura/Folio ",s("i",{className:"fas fa-receipt ml-1 text-gray-600"})]}),s("input",{type:"text",id:"form-invoice-number",placeholder:"Ej: A123456789",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Estado Inicial ",s("i",{className:"fas fa-flag ml-1 text-yellow-500"})]}),s("select",{id:"form-status",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:[s("option",{value:"pending",children:"⏳ Pendiente"}),s("option",{value:"approved",children:"✅ Aprobado"})]})]}),s("div",{className:"flex items-center space-x-2",children:[s("input",{type:"checkbox",id:"form-billable",className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),s("label",{for:"form-billable",className:"text-sm font-medium text-gray-700",children:[s("i",{className:"fas fa-file-invoice-dollar mr-1 text-green-600"}),"Gasto Facturable al Cliente"]})]})]})]}),s("div",{className:"mt-6",children:[s("h4",{className:"font-semibold text-gray-900 border-b pb-2 mb-4",children:"📝 Información Adicional"}),s("div",{children:[s("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Notas y Comentarios ",s("i",{className:"fas fa-sticky-note ml-1 text-yellow-500"})]}),s("textarea",{id:"form-notes",rows:"3",placeholder:"Información adicional, contexto del gasto, observaciones...",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]})]}),s("div",{className:"mt-6",children:[s("h4",{className:"font-semibold text-gray-900 border-b pb-2 mb-4",children:"📎 Archivos Adjuntos con OCR Inteligente"}),s("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:[s("div",{className:"flex items-center space-x-3",children:[s("input",{type:"checkbox",id:"enable-ocr",checked:!0,className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),s("label",{for:"enable-ocr",className:"text-sm font-medium text-blue-900",children:[s("i",{className:"fas fa-robot mr-1"}),"Activar OCR - Extracción Automática de Datos"]})]}),s("p",{className:"text-xs text-blue-700 mt-1 ml-6",children:"El sistema extraerá automáticamente: monto, fecha, proveedor, y método de pago desde tickets y facturas"})]}),s("div",{className:"border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors",ondrop:"handleFileDrop(event)",ondragover:"handleDragOver(event)",ondragleave:"handleDragLeave(event)",children:[s("i",{className:"fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"}),s("p",{className:"text-gray-600 mb-2",children:[s("strong",{children:"Arrastra archivos aquí"})," o haz clic para seleccionar"]}),s("p",{className:"text-sm text-gray-500 mb-3",children:"📸 Tickets • 📄 Facturas PDF/XML • 🖼️ Fotografías (Max: 10MB por archivo)"}),s("div",{className:"flex justify-center space-x-3",children:[s("input",{type:"file",id:"form-attachments",multiple:!0,accept:".pdf,.xml,.jpg,.jpeg,.png,.gif",className:"hidden",onchange:"handleFileSelect(event)"}),s("button",{type:"button",onclick:"document.getElementById('form-attachments').click()",className:"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",children:[s("i",{className:"fas fa-paperclip mr-2"}),"Seleccionar Archivos"]}),s("button",{type:"button",onclick:"captureFromCamera()",className:"px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 md:hidden min-h-12",children:[s("i",{className:"fas fa-camera mr-2"}),"📸 Tomar Foto"]}),s("button",{type:"button",onclick:"captureLocationForExpense()",className:"px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 md:hidden min-h-12",children:[s("i",{className:"fas fa-map-marker-alt mr-2"}),"📍 Ubicación"]})]}),s("input",{type:"file",id:"camera-capture",accept:"image/*",capture:"environment",className:"hidden",onchange:"handleCameraCapture(event)"})]}),s("div",{id:"ocr-status",className:"mt-3 hidden",children:s("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-3",children:s("div",{className:"flex items-center",children:[s("i",{className:"fas fa-cog fa-spin text-yellow-600 mr-2"}),s("span",{class:"text-yellow-800",children:"Procesando OCR..."})]})})}),s("div",{id:"attachments-preview",className:"mt-4 hidden",children:[s("h5",{className:"font-medium text-gray-900 mb-2",children:"Archivos y Datos Extraídos:"}),s("div",{id:"attachments-list",className:"space-y-2"})]}),s("div",{id:"ocr-results",className:"mt-4 hidden",children:[s("h5",{className:"font-medium text-gray-900 mb-2",children:[s("i",{className:"fas fa-magic mr-1 text-purple-600"}),"Datos Extraídos Automáticamente:"]}),s("div",{id:"ocr-data-preview",className:"bg-green-50 border border-green-200 rounded-lg p-4"}),s("div",{className:"flex space-x-2 mt-2",children:[s("button",{type:"button",onclick:"applyOcrData()",className:"text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700",children:[s("i",{className:"fas fa-check mr-1"}),"Aplicar Datos"]}),s("button",{type:"button",onclick:"clearOcrData()",className:"text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700",children:[s("i",{className:"fas fa-times mr-1"}),"Descartar"]})]})]})]}),s("div",{className:"mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200",children:[s("button",{type:"button",onclick:"closeExpenseForm()",className:"px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50",children:[s("i",{className:"fas fa-times mr-2"}),"Cancelar"]}),s("button",{type:"button",onclick:"saveDraft()",className:"px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700",children:[s("i",{className:"fas fa-save mr-2"}),"Guardar Borrador"]}),s("button",{type:"submit",className:"px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700",children:[s("i",{className:"fas fa-check mr-2"}),"Registrar Gasto"]})]})]})]})})})]})]})));w.get("/api/dashboard-metrics",Mt,async e=>{const{env:t}=e;try{const a=e.get("userId"),r=e.get("userRole");let n="";r!=="admin"&&(n=`
        AND e.company_id IN (
          SELECT company_id FROM user_companies WHERE user_id = ${a}
        )
      `);const i=await t.DB.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount_mxn), 0) as total
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${n}
    `).first(),o=await t.DB.prepare(`
      SELECT COUNT(*) as count
      FROM expenses e
      WHERE e.status = 'pending'
      ${n}
    `).first(),c=await t.DB.prepare(`
      SELECT c.name as company, COUNT(e.id) as count, 
             COALESCE(SUM(e.amount_mxn), 0) as total_mxn
      FROM companies c
      LEFT JOIN expenses e ON c.id = e.company_id
      WHERE c.active = TRUE
      ${r!=="admin"?`AND c.id IN (SELECT company_id FROM user_companies WHERE user_id = ${a})`:""}
      GROUP BY c.id, c.name
      ORDER BY total_mxn DESC
    `).all(),l=await t.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${n}
      GROUP BY currency
      ORDER BY total_mxn DESC
    `).all(),d=await t.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM expenses e
      WHERE 1=1 ${n}
      GROUP BY status
    `).all(),p=await t.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      WHERE 1=1 ${n}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).all();return e.json({success:!0,total_expenses:i,pending_expenses:o,company_metrics:c.results||[],currency_metrics:l.results||[],status_metrics:d.results||[],recent_expenses:p.results||[]})}catch(a){return e.json({error:"Failed to load dashboard metrics",details:a.message},500)}});const ra=new TextEncoder().encode("lyra-expenses-jwt-secret-2024-very-secure-key-change-in-production");async function cs(e,t){const a=Math.floor(Date.now()/1e3),r=await new Pa({sub:e.toString(),role:t,type:"access"}).setProtectedHeader({alg:"HS256"}).setIssuedAt(a).setExpirationTime(a+900).sign(ra),n=await new Pa({sub:e.toString(),role:t,type:"refresh"}).setProtectedHeader({alg:"HS256"}).setIssuedAt(a).setExpirationTime(a+10080*60).sign(ra);return{accessToken:r,refreshToken:n}}async function ls(e,t="access"){try{const{payload:a}=await Ei(e,ra);if(a.type!==t)throw new Error("Invalid token type");return a}catch{return null}}async function Mt(e,t){const a=e.req.header("Authorization");if(!a||!a.startsWith("Bearer "))return e.json({error:"Authentication required"},401);const r=a.split(" ")[1],n=await ls(r,"access");if(!n)return e.json({error:"Invalid or expired token"},401);e.set("userId",parseInt(n.sub)),e.set("userRole",n.role),await t()}w.post("/api/auth/login",async e=>{const{env:t}=e;try{const{email:a,password:r}=await e.req.json();if(!a||!r)return e.json({error:"Email and password are required"},400);const n=await t.DB.prepare("SELECT * FROM users WHERE email = ? AND active = TRUE").bind(a.toLowerCase()).first();if(!n)return e.json({error:"Invalid credentials"},401);if(!await ki.compare(r,n.password_hash))return e.json({error:"Invalid credentials"},401);const o=await cs(n.id,n.role);await t.DB.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").bind(n.id).run();const c=crypto.randomUUID();return await t.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, ip_address, user_agent) 
      VALUES (?, ?, datetime('now', '+7 days'), ?, ?)
    `).bind(c,n.id,e.req.header("CF-Connecting-IP")||e.req.header("X-Forwarded-For")||"unknown",e.req.header("User-Agent")||"unknown").run(),e.json({success:!0,user:{id:n.id,email:n.email,name:n.name,role:n.role},tokens:o,session_id:c})}catch(a){return e.json({error:"Login failed",details:a.message},500)}});w.post("/api/auth/refresh",async e=>{const{env:t}=e;try{const{refresh_token:a}=await e.req.json();if(!a)return e.json({error:"Refresh token is required"},400);const r=await ls(a,"refresh");if(!r)return e.json({error:"Invalid or expired refresh token"},401);const n=parseInt(r.sub),i=await t.DB.prepare("SELECT * FROM users WHERE id = ? AND active = TRUE").bind(n).first();if(!i)return e.json({error:"User not found or inactive"},401);const o=await cs(i.id,i.role);return e.json({success:!0,tokens:o})}catch(a){return e.json({error:"Token refresh failed",details:a.message},500)}});w.post("/api/auth/logout",Mt,async e=>{const{env:t}=e;try{const{session_id:a}=await e.req.json(),r=e.get("userId");return a?await t.DB.prepare("DELETE FROM user_sessions WHERE id = ? AND user_id = ?").bind(a,r).run():await t.DB.prepare("DELETE FROM user_sessions WHERE user_id = ?").bind(r).run(),e.json({success:!0,message:"Logged out successfully"})}catch(a){return e.json({error:"Logout failed",details:a.message},500)}});w.get("/api/auth/profile",Mt,async e=>{const{env:t}=e;try{const a=e.get("userId"),r=await t.DB.prepare(`
      SELECT u.*, 
             GROUP_CONCAT(DISTINCT c.id || ':' || c.name) as companies
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.id = ? AND u.active = TRUE
      GROUP BY u.id
    `).bind(a).first();if(!r)return e.json({error:"User not found"},404);const n=r.companies?r.companies.split(",").map(i=>{const[o,c]=i.split(":");return{id:parseInt(o),name:c}}):[];return e.json({success:!0,user:{id:r.id,email:r.email,name:r.name,role:r.role,companies:n,last_login:r.last_login,created_at:r.created_at}})}catch(a){return e.json({error:"Failed to get profile",details:a.message},500)}});w.get("/api/auth/companies",Mt,async e=>{const{env:t}=e;try{const a=e.get("userId"),r=e.get("userRole");let n;return r==="admin"?n=await t.DB.prepare("SELECT * FROM companies WHERE active = TRUE").all():n=await t.DB.prepare(`
        SELECT c.* 
        FROM companies c
        JOIN user_companies uc ON c.id = uc.company_id
        WHERE uc.user_id = ? AND c.active = TRUE
      `).bind(a).all(),e.json({success:!0,companies:n.results})}catch(a){return e.json({error:"Failed to get companies",details:a.message},500)}});w.get("/analytics",e=>e.render(s("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);",children:[s("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:s("div",{className:"flex justify-between items-center py-6",children:[s("div",{className:"flex items-center space-x-6",children:[s("div",{className:"flex items-center space-x-3",children:[s("div",{className:"relative",children:[s("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),s("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),s("div",{children:[s("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),s("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),s("span",{className:"nav-badge",children:"Sistema 4-D Premium"})]}),s("div",{className:"flex items-center space-x-8",children:[s("nav",{className:"flex space-x-6",children:[s("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-chart-pie"}),s("span",{children:"Dashboard"})]}),s("a",{href:"/companies",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-building"}),s("span",{children:"Empresas"})]}),s("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[s("i",{className:"fas fa-receipt"}),s("span",{children:"Gastos"})]}),s("a",{href:"/analytics",className:"nav-link text-gold active flex items-center space-x-2",children:[s("i",{className:"fas fa-chart-line"}),s("span",{children:"Analytics"})]})]}),s("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[s("div",{id:"auth-indicator"}),s("select",{id:"currency-selector",className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:[s("option",{value:"MXN",children:"💎 MXN"}),s("option",{value:"USD",children:"🔹 USD"}),s("option",{value:"EUR",children:"🔸 EUR"})]}),s("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[s("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),s("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[s("div",{className:"text-center mb-12",children:[s("h2",{className:"text-4xl font-bold gradient-text-gold mb-3",children:[s("i",{className:"fas fa-chart-line mr-3"}),"Analytics Avanzado"]}),s("p",{className:"text-secondary text-lg",children:"Análisis profundo y reportes inteligentes multiempresa"}),s("div",{className:"flex justify-center mt-4",children:s("div",{className:"flex items-center space-x-6 text-sm text-tertiary",children:[s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),"Datos en tiempo real"]}),s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),"Machine Learning activo"]}),s("span",{className:"flex items-center",children:[s("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Predicciones inteligentes"]})]})})]}),s("div",{className:"glass-panel p-16 text-center",children:[s("div",{className:"mb-8",children:[s("i",{className:"fas fa-rocket text-6xl text-gold mb-6"}),s("h3",{className:"text-3xl font-bold text-primary mb-4",children:"Próximamente"}),s("p",{className:"text-xl text-secondary mb-6",children:"Analytics Avanzado con IA"})]}),s("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",children:[s("div",{className:"p-6 bg-glass rounded-lg",children:[s("i",{className:"fas fa-brain text-3xl text-emerald mb-4"}),s("h4",{className:"text-lg font-bold text-primary mb-2",children:"Machine Learning"}),s("p",{className:"text-sm text-tertiary",children:"Predicciones automáticas de gastos y detección de anomalías"})]}),s("div",{className:"p-6 bg-glass rounded-lg",children:[s("i",{className:"fas fa-chart-network text-3xl text-gold mb-4"}),s("h4",{className:"text-lg font-bold text-primary mb-2",children:"Analytics Predictivo"}),s("p",{className:"text-sm text-tertiary",children:"Forecasting inteligente y optimización de presupuestos"})]}),s("div",{className:"p-6 bg-glass rounded-lg",children:[s("i",{className:"fas fa-file-chart-line text-3xl text-sapphire mb-4"}),s("h4",{className:"text-lg font-bold text-primary mb-2",children:"Reportes Avanzados"}),s("p",{className:"text-sm text-tertiary",children:"Reportes ejecutivos automatizados con insights accionables"})]})]}),s("div",{className:"flex justify-center space-x-4",children:[s("a",{href:"/",className:"btn-premium btn-gold",children:[s("i",{className:"fas fa-chart-pie mr-2"}),"Volver al Dashboard"]}),s("a",{href:"/companies",className:"btn-premium btn-sapphire",children:[s("i",{className:"fas fa-building mr-2"}),"Ver Empresas"]})]})]})]}),s("script",{src:"https://cdn.tailwindcss.com"}),s("link",{href:"https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",rel:"stylesheet"}),s("link",{href:"/static/styles.css",rel:"stylesheet"}),s("script",{src:"/static/app.js"}),s("script",{children:`
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
      `})]})));w.get("/analytics-morado",e=>e.html(`<!DOCTYPE html>
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
</html>`));const Ha=new Cr,Ki=Object.assign({"/src/index.tsx":w});let ds=!1;for(const[,e]of Object.entries(Ki))e&&(Ha.all("*",t=>{let a;try{a=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,a)}),Ha.notFound(t=>{let a;try{a=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,a)}),ds=!0);if(!ds)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Ha as default};
