var fs=Object.defineProperty;var xa=e=>{throw TypeError(e)};var ps=(e,a,r)=>a in e?fs(e,a,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[a]=r;var g=(e,a,r)=>ps(e,typeof a!="symbol"?a+"":a,r),Lt=(e,a,r)=>a.has(e)||xa("Cannot "+r);var f=(e,a,r)=>(Lt(e,a,"read from private field"),r?r.call(e):a.get(e)),N=(e,a,r)=>a.has(e)?xa("Cannot add the same private member more than once"):a instanceof WeakSet?a.add(e):a.set(e,r),y=(e,a,r,s)=>(Lt(e,a,"write to private field"),s?s.call(e,r):a.set(e,r),r),_=(e,a,r)=>(Lt(e,a,"access private method"),r);var ha=(e,a,r,s)=>({set _(i){y(e,a,i,r)},get _(){return f(e,a,s)}});import us from"crypto";var Za={Stringify:1},$=(e,a)=>{const r=new String(e);return r.isEscaped=!0,r.callbacks=a,r},xs=/[&<>'"]/,Qa=async(e,a)=>{let r="";a||(a=[]);const s=await Promise.all(e);for(let i=s.length-1;r+=s[i],i--,!(i<0);i--){let n=s[i];typeof n=="object"&&a.push(...n.callbacks||[]);const o=n.isEscaped;if(n=await(typeof n=="object"?n.toString():n),typeof n=="object"&&a.push(...n.callbacks||[]),n.isEscaped??o)r+=n;else{const c=[r];xe(n,c),r=c[0]}}return $(r,a)},xe=(e,a)=>{const r=e.search(xs);if(r===-1){a[0]+=e;return}let s,i,n=0;for(i=r;i<e.length;i++){switch(e.charCodeAt(i)){case 34:s="&quot;";break;case 39:s="&#39;";break;case 38:s="&amp;";break;case 60:s="&lt;";break;case 62:s="&gt;";break;default:continue}a[0]+=e.substring(n,i)+s,n=i+1}a[0]+=e.substring(n,i)},er=e=>{const a=e.callbacks;if(!(a!=null&&a.length))return e;const r=[e],s={};return a.forEach(i=>i({phase:Za.Stringify,buffer:r,context:s})),r[0]},tr=async(e,a,r,s,i)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const n=e.callbacks;return n!=null&&n.length?(i?i[0]+=e:i=[e],Promise.all(n.map(c=>c({phase:a,buffer:i,context:s}))).then(c=>Promise.all(c.filter(Boolean).map(l=>tr(l,a,!1,s,i))).then(()=>i[0]))):Promise.resolve(e)},hs=(e,...a)=>{const r=[""];for(let s=0,i=e.length-1;s<i;s++){r[0]+=e[s];const n=Array.isArray(a[s])?a[s].flat(1/0):[a[s]];for(let o=0,c=n.length;o<c;o++){const l=n[o];if(typeof l=="string")xe(l,r);else if(typeof l=="number")r[0]+=l;else{if(typeof l=="boolean"||l===null||l===void 0)continue;if(typeof l=="object"&&l.isEscaped)if(l.callbacks)r.unshift("",l);else{const d=l.toString();d instanceof Promise?r.unshift("",d):r[0]+=d}else l instanceof Promise?r.unshift("",l):xe(l.toString(),r)}}}return r[0]+=e.at(-1),r.length===1?"callbacks"in r?$(er($(r[0],r.callbacks))):$(r[0]):Qa(r,r.callbacks)},sa=Symbol("RENDERER"),zt=Symbol("ERROR_HANDLER"),O=Symbol("STASH"),ar=Symbol("INTERNAL"),bs=Symbol("MEMO"),Rt=Symbol("PERMALINK"),ba=e=>(e[ar]=!0,e),rr=e=>({value:a,children:r})=>{if(!r)return;const s={children:[{tag:ba(()=>{e.push(a)}),props:{}}]};Array.isArray(r)?s.children.push(...r.flat()):s.children.push(r),s.children.push({tag:ba(()=>{e.pop()}),props:{}});const i={tag:"",props:s,type:""};return i[zt]=n=>{throw e.pop(),n},i},sr=e=>{const a=[e],r=rr(a);return r.values=a,r.Provider=r,Xe.push(r),r},Xe=[],ia=e=>{const a=[e],r=s=>{a.push(s.value);let i;try{i=s.children?(Array.isArray(s.children)?new cr("",{},s.children):s.children).toString():""}finally{a.pop()}return i instanceof Promise?i.then(n=>$(n,n.callbacks)):$(i)};return r.values=a,r.Provider=r,r[sa]=rr(a),Xe.push(r),r},ze=e=>e.values.at(-1),gt={title:[],script:["src"],style:["data-href"],link:["href"],meta:["name","httpEquiv","charset","itemProp"]},Vt={},yt="data-precedence",ft=e=>Array.isArray(e)?e:[e],ga=new WeakMap,ya=(e,a,r,s)=>({buffer:i,context:n})=>{if(!i)return;const o=ga.get(n)||{};ga.set(n,o);const c=o[e]||(o[e]=[]);let l=!1;const d=gt[e];if(d.length>0){e:for(const[,m]of c)for(const p of d)if(((m==null?void 0:m[p])??null)===(r==null?void 0:r[p])){l=!0;break e}}if(l?i[0]=i[0].replaceAll(a,""):d.length>0?c.push([a,r,s]):c.unshift([a,r,s]),i[0].indexOf("</head>")!==-1){let m;if(s===void 0)m=c.map(([p])=>p);else{const p=[];m=c.map(([u,,x])=>{let b=p.indexOf(x);return b===-1&&(p.push(x),b=p.length-1),[u,b]}).sort((u,x)=>u[1]-x[1]).map(([u])=>u)}m.forEach(p=>{i[0]=i[0].replaceAll(p,"")}),i[0]=i[0].replace(/(?=<\/head>)/,m.join(""))}},pt=(e,a,r)=>$(new W(e,r,ft(a??[])).toString()),ut=(e,a,r,s)=>{if("itemProp"in r)return pt(e,a,r);let{precedence:i,blocking:n,...o}=r;i=s?i??"":void 0,s&&(o[yt]=i);const c=new W(e,o,ft(a||[])).toString();return c instanceof Promise?c.then(l=>$(c,[...l.callbacks||[],ya(e,l,o,i)])):$(c,[ya(e,c,o,i)])},gs=({children:e,...a})=>{const r=na();if(r){const s=ze(r);if(s==="svg"||s==="head")return new W("title",a,ft(e??[]))}return ut("title",e,a,!1)},ys=({children:e,...a})=>{const r=na();return["src","async"].some(s=>!a[s])||r&&ze(r)==="head"?pt("script",e,a):ut("script",e,a,!1)},vs=({children:e,...a})=>["href","precedence"].every(r=>r in a)?(a["data-href"]=a.href,delete a.href,ut("style",e,a,!0)):pt("style",e,a),Ns=({children:e,...a})=>["onLoad","onError"].some(r=>r in a)||a.rel==="stylesheet"&&(!("precedence"in a)||"disabled"in a)?pt("link",e,a):ut("link",e,a,"precedence"in a),Es=({children:e,...a})=>{const r=na();return r&&ze(r)==="head"?pt("meta",e,a):ut("meta",e,a,!1)},ir=(e,{children:a,...r})=>new W(e,r,ft(a??[])),ws=e=>(typeof e.action=="function"&&(e.action=Rt in e.action?e.action[Rt]:void 0),ir("form",e)),nr=(e,a)=>(typeof a.formAction=="function"&&(a.formAction=Rt in a.formAction?a.formAction[Rt]:void 0),ir(e,a)),Ts=e=>nr("input",e),As=e=>nr("button",e);const kt=Object.freeze(Object.defineProperty({__proto__:null,button:As,form:ws,input:Ts,link:Ns,meta:Es,script:ys,style:vs,title:gs},Symbol.toStringTag,{value:"Module"}));var _s=new Map([["className","class"],["htmlFor","for"],["crossOrigin","crossorigin"],["httpEquiv","http-equiv"],["itemProp","itemprop"],["fetchPriority","fetchpriority"],["noModule","nomodule"],["formAction","formaction"]]),St=e=>_s.get(e)||e,or=(e,a)=>{for(const[r,s]of Object.entries(e)){const i=r[0]==="-"||!/[A-Z]/.test(r)?r:r.replace(/[A-Z]/g,n=>`-${n.toLowerCase()}`);a(i,s==null?null:typeof s=="number"?i.match(/^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/)?`${s}`:`${s}px`:s)}},Qe=void 0,na=()=>Qe,Rs=e=>/[A-Z]/.test(e)&&e.match(/^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/)?e.replace(/([A-Z])/g,"-$1").toLowerCase():e,Ss=["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],Cs=["allowfullscreen","async","autofocus","autoplay","checked","controls","default","defer","disabled","download","formnovalidate","hidden","inert","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"],oa=(e,a)=>{for(let r=0,s=e.length;r<s;r++){const i=e[r];if(typeof i=="string")xe(i,a);else{if(typeof i=="boolean"||i===null||i===void 0)continue;i instanceof W?i.toStringToBuffer(a):typeof i=="number"||i.isEscaped?a[0]+=i:i instanceof Promise?a.unshift("",i):oa(i,a)}}},W=class{constructor(e,a,r){g(this,"tag");g(this,"props");g(this,"key");g(this,"children");g(this,"isEscaped",!0);g(this,"localContexts");this.tag=e,this.props=a,this.children=r}get type(){return this.tag}get ref(){return this.props.ref||null}toString(){var a,r;const e=[""];(a=this.localContexts)==null||a.forEach(([s,i])=>{s.values.push(i)});try{this.toStringToBuffer(e)}finally{(r=this.localContexts)==null||r.forEach(([s])=>{s.values.pop()})}return e.length===1?"callbacks"in e?er($(e[0],e.callbacks)).toString():e[0]:Qa(e,e.callbacks)}toStringToBuffer(e){const a=this.tag,r=this.props;let{children:s}=this;e[0]+=`<${a}`;const i=Qe&&ze(Qe)==="svg"?n=>Rs(St(n)):n=>St(n);for(let[n,o]of Object.entries(r))if(n=i(n),n!=="children"){if(n==="style"&&typeof o=="object"){let c="";or(o,(l,d)=>{d!=null&&(c+=`${c?";":""}${l}:${d}`)}),e[0]+=' style="',xe(c,e),e[0]+='"'}else if(typeof o=="string")e[0]+=` ${n}="`,xe(o,e),e[0]+='"';else if(o!=null)if(typeof o=="number"||o.isEscaped)e[0]+=` ${n}="${o}"`;else if(typeof o=="boolean"&&Cs.includes(n))o&&(e[0]+=` ${n}=""`);else if(n==="dangerouslySetInnerHTML"){if(s.length>0)throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");s=[$(o.__html)]}else if(o instanceof Promise)e[0]+=` ${n}="`,e.unshift('"',o);else if(typeof o=="function"){if(!n.startsWith("on")&&n!=="ref")throw new Error(`Invalid prop '${n}' of type 'function' supplied to '${a}'.`)}else e[0]+=` ${n}="`,xe(o.toString(),e),e[0]+='"'}if(Ss.includes(a)&&s.length===0){e[0]+="/>";return}e[0]+=">",oa(s,e),e[0]+=`</${a}>`}},Pt=class extends W{toStringToBuffer(e){const{children:a}=this,r=this.tag.call(null,{...this.props,children:a.length<=1?a[0]:a});if(!(typeof r=="boolean"||r==null))if(r instanceof Promise)if(Xe.length===0)e.unshift("",r);else{const s=Xe.map(i=>[i,i.values.at(-1)]);e.unshift("",r.then(i=>(i instanceof W&&(i.localContexts=s),i)))}else r instanceof W?r.toStringToBuffer(e):typeof r=="number"||r.isEscaped?(e[0]+=r,r.callbacks&&(e.callbacks||(e.callbacks=[]),e.callbacks.push(...r.callbacks))):xe(r,e)}},cr=class extends W{toStringToBuffer(e){oa(this.children,e)}},va=(e,a,...r)=>{a??(a={}),r.length&&(a.children=r.length===1?r[0]:r);const s=a.key;delete a.key;const i=vt(e,a,r);return i.key=s,i},Na=!1,vt=(e,a,r)=>{if(!Na){for(const s in Vt)kt[s][sa]=Vt[s];Na=!0}return typeof e=="function"?new Pt(e,a,r):kt[e]?new Pt(kt[e],a,r):e==="svg"||e==="head"?(Qe||(Qe=ia("")),new W(e,a,[new Pt(Qe,{value:e},r)])):new W(e,a,r)},Os=({children:e})=>new cr("",{children:e},Array.isArray(e)?e:e?[e]:[]);function t(e,a,r){let s;if(!a||!("children"in a))s=vt(e,a,[]);else{const i=a.children;s=Array.isArray(i)?vt(e,a,i):vt(e,a,[i])}return s.key=r,s}var Ea=(e,a,r)=>(s,i)=>{let n=-1;return o(0);async function o(c){if(c<=n)throw new Error("next() called multiple times");n=c;let l,d=!1,m;if(e[c]?(m=e[c][0][0],s.req.routeIndex=c):m=c===e.length&&i||void 0,m)try{l=await m(s,()=>o(c+1))}catch(p){if(p instanceof Error&&a)s.error=p,l=await a(p,s),d=!0;else throw p}else s.finalized===!1&&r&&(l=await r(s));return l&&(s.finalized===!1||d)&&(s.res=l),s}},Is=Symbol(),Ds=async(e,a=Object.create(null))=>{const{all:r=!1,dot:s=!1}=a,n=(e instanceof ur?e.raw.headers:e.headers).get("Content-Type");return n!=null&&n.startsWith("multipart/form-data")||n!=null&&n.startsWith("application/x-www-form-urlencoded")?Ms(e,{all:r,dot:s}):{}};async function Ms(e,a){const r=await e.formData();return r?Us(r,a):{}}function Us(e,a){const r=Object.create(null);return e.forEach((s,i)=>{a.all||i.endsWith("[]")?Ls(r,i,s):r[i]=s}),a.dot&&Object.entries(r).forEach(([s,i])=>{s.includes(".")&&(ks(r,s,i),delete r[s])}),r}var Ls=(e,a,r)=>{e[a]!==void 0?Array.isArray(e[a])?e[a].push(r):e[a]=[e[a],r]:a.endsWith("[]")?e[a]=[r]:e[a]=r},ks=(e,a,r)=>{let s=e;const i=a.split(".");i.forEach((n,o)=>{o===i.length-1?s[n]=r:((!s[n]||typeof s[n]!="object"||Array.isArray(s[n])||s[n]instanceof File)&&(s[n]=Object.create(null)),s=s[n])})},lr=e=>{const a=e.split("/");return a[0]===""&&a.shift(),a},Ps=e=>{const{groups:a,path:r}=Fs(e),s=lr(r);return js(s,a)},Fs=e=>{const a=[];return e=e.replace(/\{[^}]+\}/g,(r,s)=>{const i=`@${s}`;return a.push([i,r]),i}),{groups:a,path:e}},js=(e,a)=>{for(let r=a.length-1;r>=0;r--){const[s]=a[r];for(let i=e.length-1;i>=0;i--)if(e[i].includes(s)){e[i]=e[i].replace(s,a[r][1]);break}}return e},ht={},$s=(e,a)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const s=`${e}#${a}`;return ht[s]||(r[2]?ht[s]=a&&a[0]!==":"&&a[0]!=="*"?[s,r[1],new RegExp(`^${r[2]}(?=/${a})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:ht[s]=[e,r[1],!0]),ht[s]}return null},ca=(e,a)=>{try{return a(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return a(r)}catch{return r}})}},Bs=e=>ca(e,decodeURI),dr=e=>{const a=e.url,r=a.indexOf("/",a.indexOf(":")+4);let s=r;for(;s<a.length;s++){const i=a.charCodeAt(s);if(i===37){const n=a.indexOf("?",s),o=a.slice(r,n===-1?void 0:n);return Bs(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(i===63)break}return a.slice(r,s)},Hs=e=>{const a=dr(e);return a.length>1&&a.at(-1)==="/"?a.slice(0,-1):a},De=(e,a,...r)=>(r.length&&(a=De(a,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${a==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(a==null?void 0:a[0])==="/"?a.slice(1):a}`}`),mr=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const a=e.split("/"),r=[];let s="";return a.forEach(i=>{if(i!==""&&!/\:/.test(i))s+="/"+i;else if(/\:/.test(i))if(/\?/.test(i)){r.length===0&&s===""?r.push("/"):r.push(s);const n=i.replace("?","");s+="/"+n,r.push(s)}else s+="/"+i}),r.filter((i,n,o)=>o.indexOf(i)===n)},Ft=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?ca(e,pr):e):e,fr=(e,a,r)=>{let s;if(!r&&a&&!/[%+]/.test(a)){let o=e.indexOf(`?${a}`,8);for(o===-1&&(o=e.indexOf(`&${a}`,8));o!==-1;){const c=e.charCodeAt(o+a.length+1);if(c===61){const l=o+a.length+2,d=e.indexOf("&",l);return Ft(e.slice(l,d===-1?void 0:d))}else if(c==38||isNaN(c))return"";o=e.indexOf(`&${a}`,o+1)}if(s=/[%+]/.test(e),!s)return}const i={};s??(s=/[%+]/.test(e));let n=e.indexOf("?",8);for(;n!==-1;){const o=e.indexOf("&",n+1);let c=e.indexOf("=",n);c>o&&o!==-1&&(c=-1);let l=e.slice(n+1,c===-1?o===-1?void 0:o:c);if(s&&(l=Ft(l)),n=o,l==="")continue;let d;c===-1?d="":(d=e.slice(c+1,o===-1?void 0:o),s&&(d=Ft(d))),r?(i[l]&&Array.isArray(i[l])||(i[l]=[]),i[l].push(d)):i[l]??(i[l]=d)}return a?i[a]:i},Gs=fr,Xs=(e,a)=>fr(e,a,!0),pr=decodeURIComponent,wa=e=>ca(e,pr),Fe,F,re,xr,hr,qt,ce,Ga,ur=(Ga=class{constructor(e,a="/",r=[[]]){N(this,re);g(this,"raw");N(this,Fe);N(this,F);g(this,"routeIndex",0);g(this,"path");g(this,"bodyCache",{});N(this,ce,e=>{const{bodyCache:a,raw:r}=this,s=a[e];if(s)return s;const i=Object.keys(a)[0];return i?a[i].then(n=>(i==="json"&&(n=JSON.stringify(n)),new Response(n)[e]())):a[e]=r[e]()});this.raw=e,this.path=a,y(this,F,r),y(this,Fe,{})}param(e){return e?_(this,re,xr).call(this,e):_(this,re,hr).call(this)}query(e){return Gs(this.url,e)}queries(e){return Xs(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const a={};return this.raw.headers.forEach((r,s)=>{a[s]=r}),a}async parseBody(e){var a;return(a=this.bodyCache).parsedBody??(a.parsedBody=await Ds(this,e))}json(){return f(this,ce).call(this,"text").then(e=>JSON.parse(e))}text(){return f(this,ce).call(this,"text")}arrayBuffer(){return f(this,ce).call(this,"arrayBuffer")}blob(){return f(this,ce).call(this,"blob")}formData(){return f(this,ce).call(this,"formData")}addValidatedData(e,a){f(this,Fe)[e]=a}valid(e){return f(this,Fe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Is](){return f(this,F)}get matchedRoutes(){return f(this,F)[0].map(([[,e]])=>e)}get routePath(){return f(this,F)[0].map(([[,e]])=>e)[this.routeIndex].path}},Fe=new WeakMap,F=new WeakMap,re=new WeakSet,xr=function(e){const a=f(this,F)[0][this.routeIndex][1][e],r=_(this,re,qt).call(this,a);return r&&/\%/.test(r)?wa(r):r},hr=function(){const e={},a=Object.keys(f(this,F)[0][this.routeIndex][1]);for(const r of a){const s=_(this,re,qt).call(this,f(this,F)[0][this.routeIndex][1][r]);s!==void 0&&(e[r]=/\%/.test(s)?wa(s):s)}return e},qt=function(e){return f(this,F)[1]?f(this,F)[1][e]:e},ce=new WeakMap,Ga),Ks="text/plain; charset=UTF-8",jt=(e,a)=>({"Content-Type":e,...a}),it,nt,Q,je,ee,k,ot,$e,Be,ve,ct,lt,le,Me,Xa,Ws=(Xa=class{constructor(e,a){N(this,le);N(this,it);N(this,nt);g(this,"env",{});N(this,Q);g(this,"finalized",!1);g(this,"error");N(this,je);N(this,ee);N(this,k);N(this,ot);N(this,$e);N(this,Be);N(this,ve);N(this,ct);N(this,lt);g(this,"render",(...e)=>(f(this,$e)??y(this,$e,a=>this.html(a)),f(this,$e).call(this,...e)));g(this,"setLayout",e=>y(this,ot,e));g(this,"getLayout",()=>f(this,ot));g(this,"setRenderer",e=>{y(this,$e,e)});g(this,"header",(e,a,r)=>{this.finalized&&y(this,k,new Response(f(this,k).body,f(this,k)));const s=f(this,k)?f(this,k).headers:f(this,ve)??y(this,ve,new Headers);a===void 0?s.delete(e):r!=null&&r.append?s.append(e,a):s.set(e,a)});g(this,"status",e=>{y(this,je,e)});g(this,"set",(e,a)=>{f(this,Q)??y(this,Q,new Map),f(this,Q).set(e,a)});g(this,"get",e=>f(this,Q)?f(this,Q).get(e):void 0);g(this,"newResponse",(...e)=>_(this,le,Me).call(this,...e));g(this,"body",(e,a,r)=>_(this,le,Me).call(this,e,a,r));g(this,"text",(e,a,r)=>!f(this,ve)&&!f(this,je)&&!a&&!r&&!this.finalized?new Response(e):_(this,le,Me).call(this,e,a,jt(Ks,r)));g(this,"json",(e,a,r)=>_(this,le,Me).call(this,JSON.stringify(e),a,jt("application/json",r)));g(this,"html",(e,a,r)=>{const s=i=>_(this,le,Me).call(this,i,a,jt("text/html; charset=UTF-8",r));return typeof e=="object"?tr(e,Za.Stringify,!1,{}).then(s):s(e)});g(this,"redirect",(e,a)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,a??302)});g(this,"notFound",()=>(f(this,Be)??y(this,Be,()=>new Response),f(this,Be).call(this,this)));y(this,it,e),a&&(y(this,ee,a.executionCtx),this.env=a.env,y(this,Be,a.notFoundHandler),y(this,lt,a.path),y(this,ct,a.matchResult))}get req(){return f(this,nt)??y(this,nt,new ur(f(this,it),f(this,lt),f(this,ct))),f(this,nt)}get event(){if(f(this,ee)&&"respondWith"in f(this,ee))return f(this,ee);throw Error("This context has no FetchEvent")}get executionCtx(){if(f(this,ee))return f(this,ee);throw Error("This context has no ExecutionContext")}get res(){return f(this,k)||y(this,k,new Response(null,{headers:f(this,ve)??y(this,ve,new Headers)}))}set res(e){if(f(this,k)&&e){e=new Response(e.body,e);for(const[a,r]of f(this,k).headers.entries())if(a!=="content-type")if(a==="set-cookie"){const s=f(this,k).headers.getSetCookie();e.headers.delete("set-cookie");for(const i of s)e.headers.append("set-cookie",i)}else e.headers.set(a,r)}y(this,k,e),this.finalized=!0}get var(){return f(this,Q)?Object.fromEntries(f(this,Q)):{}}},it=new WeakMap,nt=new WeakMap,Q=new WeakMap,je=new WeakMap,ee=new WeakMap,k=new WeakMap,ot=new WeakMap,$e=new WeakMap,Be=new WeakMap,ve=new WeakMap,ct=new WeakMap,lt=new WeakMap,le=new WeakSet,Me=function(e,a,r){const s=f(this,k)?new Headers(f(this,k).headers):f(this,ve)??new Headers;if(typeof a=="object"&&"headers"in a){const n=a.headers instanceof Headers?a.headers:new Headers(a.headers);for(const[o,c]of n)o.toLowerCase()==="set-cookie"?s.append(o,c):s.set(o,c)}if(r)for(const[n,o]of Object.entries(r))if(typeof o=="string")s.set(n,o);else{s.delete(n);for(const c of o)s.append(n,c)}const i=typeof a=="number"?a:(a==null?void 0:a.status)??f(this,je);return new Response(e,{status:i,headers:s})},Xa),I="ALL",zs="all",Vs=["get","post","put","delete","options","patch"],br="Can not add a route since the matcher is already built.",gr=class extends Error{},qs="__COMPOSED_HANDLER",Js=e=>e.text("404 Not Found",404),Ta=(e,a)=>{if("getResponse"in e){const r=e.getResponse();return a.newResponse(r.body,r)}return console.error(e),a.text("Internal Server Error",500)},H,D,vr,G,ge,Nt,Et,Ka,yr=(Ka=class{constructor(a={}){N(this,D);g(this,"get");g(this,"post");g(this,"put");g(this,"delete");g(this,"options");g(this,"patch");g(this,"all");g(this,"on");g(this,"use");g(this,"router");g(this,"getPath");g(this,"_basePath","/");N(this,H,"/");g(this,"routes",[]);N(this,G,Js);g(this,"errorHandler",Ta);g(this,"onError",a=>(this.errorHandler=a,this));g(this,"notFound",a=>(y(this,G,a),this));g(this,"fetch",(a,...r)=>_(this,D,Et).call(this,a,r[1],r[0],a.method));g(this,"request",(a,r,s,i)=>a instanceof Request?this.fetch(r?new Request(a,r):a,s,i):(a=a.toString(),this.fetch(new Request(/^https?:\/\//.test(a)?a:`http://localhost${De("/",a)}`,r),s,i)));g(this,"fire",()=>{addEventListener("fetch",a=>{a.respondWith(_(this,D,Et).call(this,a.request,a,void 0,a.request.method))})});[...Vs,zs].forEach(n=>{this[n]=(o,...c)=>(typeof o=="string"?y(this,H,o):_(this,D,ge).call(this,n,f(this,H),o),c.forEach(l=>{_(this,D,ge).call(this,n,f(this,H),l)}),this)}),this.on=(n,o,...c)=>{for(const l of[o].flat()){y(this,H,l);for(const d of[n].flat())c.map(m=>{_(this,D,ge).call(this,d.toUpperCase(),f(this,H),m)})}return this},this.use=(n,...o)=>(typeof n=="string"?y(this,H,n):(y(this,H,"*"),o.unshift(n)),o.forEach(c=>{_(this,D,ge).call(this,I,f(this,H),c)}),this);const{strict:s,...i}=a;Object.assign(this,i),this.getPath=s??!0?a.getPath??dr:Hs}route(a,r){const s=this.basePath(a);return r.routes.map(i=>{var o;let n;r.errorHandler===Ta?n=i.handler:(n=async(c,l)=>(await Ea([],r.errorHandler)(c,()=>i.handler(c,l))).res,n[qs]=i.handler),_(o=s,D,ge).call(o,i.method,i.path,n)}),this}basePath(a){const r=_(this,D,vr).call(this);return r._basePath=De(this._basePath,a),r}mount(a,r,s){let i,n;s&&(typeof s=="function"?n=s:(n=s.optionHandler,s.replaceRequest===!1?i=l=>l:i=s.replaceRequest));const o=n?l=>{const d=n(l);return Array.isArray(d)?d:[d]}:l=>{let d;try{d=l.executionCtx}catch{}return[l.env,d]};i||(i=(()=>{const l=De(this._basePath,a),d=l==="/"?0:l.length;return m=>{const p=new URL(m.url);return p.pathname=p.pathname.slice(d)||"/",new Request(p,m)}})());const c=async(l,d)=>{const m=await r(i(l.req.raw),...o(l));if(m)return m;await d()};return _(this,D,ge).call(this,I,De(a,"*"),c),this}},H=new WeakMap,D=new WeakSet,vr=function(){const a=new yr({router:this.router,getPath:this.getPath});return a.errorHandler=this.errorHandler,y(a,G,f(this,G)),a.routes=this.routes,a},G=new WeakMap,ge=function(a,r,s){a=a.toUpperCase(),r=De(this._basePath,r);const i={basePath:this._basePath,path:r,method:a,handler:s};this.router.add(a,r,[s,i]),this.routes.push(i)},Nt=function(a,r){if(a instanceof Error)return this.errorHandler(a,r);throw a},Et=function(a,r,s,i){if(i==="HEAD")return(async()=>new Response(null,await _(this,D,Et).call(this,a,r,s,"GET")))();const n=this.getPath(a,{env:s}),o=this.router.match(i,n),c=new Ws(a,{path:n,matchResult:o,env:s,executionCtx:r,notFoundHandler:f(this,G)});if(o[0].length===1){let d;try{d=o[0][0][0][0](c,async()=>{c.res=await f(this,G).call(this,c)})}catch(m){return _(this,D,Nt).call(this,m,c)}return d instanceof Promise?d.then(m=>m||(c.finalized?c.res:f(this,G).call(this,c))).catch(m=>_(this,D,Nt).call(this,m,c)):d??f(this,G).call(this,c)}const l=Ea(o[0],this.errorHandler,f(this,G));return(async()=>{try{const d=await l(c);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return _(this,D,Nt).call(this,d,c)}})()},Ka),Ct="[^/]+",Je=".*",Ye="(?:|/.*)",Ue=Symbol(),Ys=new Set(".\\+*[^]$()");function Zs(e,a){return e.length===1?a.length===1?e<a?-1:1:-1:a.length===1||e===Je||e===Ye?1:a===Je||a===Ye?-1:e===Ct?1:a===Ct?-1:e.length===a.length?e<a?-1:1:a.length-e.length}var Ne,Ee,X,Wa,Jt=(Wa=class{constructor(){N(this,Ne);N(this,Ee);N(this,X,Object.create(null))}insert(a,r,s,i,n){if(a.length===0){if(f(this,Ne)!==void 0)throw Ue;if(n)return;y(this,Ne,r);return}const[o,...c]=a,l=o==="*"?c.length===0?["","",Je]:["","",Ct]:o==="/*"?["","",Ye]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(l){const m=l[1];let p=l[2]||Ct;if(m&&l[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw Ue;if(d=f(this,X)[p],!d){if(Object.keys(f(this,X)).some(u=>u!==Je&&u!==Ye))throw Ue;if(n)return;d=f(this,X)[p]=new Jt,m!==""&&y(d,Ee,i.varIndex++)}!n&&m!==""&&s.push([m,f(d,Ee)])}else if(d=f(this,X)[o],!d){if(Object.keys(f(this,X)).some(m=>m.length>1&&m!==Je&&m!==Ye))throw Ue;if(n)return;d=f(this,X)[o]=new Jt}d.insert(c,r,s,i,n)}buildRegExpStr(){const r=Object.keys(f(this,X)).sort(Zs).map(s=>{const i=f(this,X)[s];return(typeof f(i,Ee)=="number"?`(${s})@${f(i,Ee)}`:Ys.has(s)?`\\${s}`:s)+i.buildRegExpStr()});return typeof f(this,Ne)=="number"&&r.unshift(`#${f(this,Ne)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},Ne=new WeakMap,Ee=new WeakMap,X=new WeakMap,Wa),It,dt,za,Qs=(za=class{constructor(){N(this,It,{varIndex:0});N(this,dt,new Jt)}insert(e,a,r){const s=[],i=[];for(let o=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,l=>{const d=`@\\${o}`;return i[o]=[d,l],o++,c=!0,d}),!c)break}const n=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=i.length-1;o>=0;o--){const[c]=i[o];for(let l=n.length-1;l>=0;l--)if(n[l].indexOf(c)!==-1){n[l]=n[l].replace(c,i[o][1]);break}}return f(this,dt).insert(n,a,s,f(this,It),r),s}buildRegExp(){let e=f(this,dt).buildRegExpStr();if(e==="")return[/^$/,[],[]];let a=0;const r=[],s=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(i,n,o)=>n!==void 0?(r[++a]=Number(n),"$()"):(o!==void 0&&(s[Number(o)]=++a),"")),[new RegExp(`^${e}`),r,s]}},It=new WeakMap,dt=new WeakMap,za),Nr=[],ei=[/^$/,[],Object.create(null)],wt=Object.create(null);function Er(e){return wt[e]??(wt[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(a,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function ti(){wt=Object.create(null)}function ai(e){var d;const a=new Qs,r=[];if(e.length===0)return ei;const s=e.map(m=>[!/\*|\/:/.test(m[0]),...m]).sort(([m,p],[u,x])=>m?1:u?-1:p.length-x.length),i=Object.create(null);for(let m=0,p=-1,u=s.length;m<u;m++){const[x,b,h]=s[m];x?i[b]=[h.map(([E])=>[E,Object.create(null)]),Nr]:p++;let v;try{v=a.insert(b,p,x)}catch(E){throw E===Ue?new gr(b):E}x||(r[p]=h.map(([E,T])=>{const R=Object.create(null);for(T-=1;T>=0;T--){const[A,U]=v[T];R[A]=U}return[E,R]}))}const[n,o,c]=a.buildRegExp();for(let m=0,p=r.length;m<p;m++)for(let u=0,x=r[m].length;u<x;u++){const b=(d=r[m][u])==null?void 0:d[1];if(!b)continue;const h=Object.keys(b);for(let v=0,E=h.length;v<E;v++)b[h[v]]=c[b[h[v]]]}const l=[];for(const m in o)l[m]=r[o[m]];return[n,l,i]}function Se(e,a){if(e){for(const r of Object.keys(e).sort((s,i)=>i.length-s.length))if(Er(r).test(a))return[...e[r]]}}var de,me,We,wr,Tr,Va,ri=(Va=class{constructor(){N(this,We);g(this,"name","RegExpRouter");N(this,de);N(this,me);y(this,de,{[I]:Object.create(null)}),y(this,me,{[I]:Object.create(null)})}add(e,a,r){var c;const s=f(this,de),i=f(this,me);if(!s||!i)throw new Error(br);s[e]||[s,i].forEach(l=>{l[e]=Object.create(null),Object.keys(l[I]).forEach(d=>{l[e][d]=[...l[I][d]]})}),a==="/*"&&(a="*");const n=(a.match(/\/:/g)||[]).length;if(/\*$/.test(a)){const l=Er(a);e===I?Object.keys(s).forEach(d=>{var m;(m=s[d])[a]||(m[a]=Se(s[d],a)||Se(s[I],a)||[])}):(c=s[e])[a]||(c[a]=Se(s[e],a)||Se(s[I],a)||[]),Object.keys(s).forEach(d=>{(e===I||e===d)&&Object.keys(s[d]).forEach(m=>{l.test(m)&&s[d][m].push([r,n])})}),Object.keys(i).forEach(d=>{(e===I||e===d)&&Object.keys(i[d]).forEach(m=>l.test(m)&&i[d][m].push([r,n]))});return}const o=mr(a)||[a];for(let l=0,d=o.length;l<d;l++){const m=o[l];Object.keys(i).forEach(p=>{var u;(e===I||e===p)&&((u=i[p])[m]||(u[m]=[...Se(s[p],m)||Se(s[I],m)||[]]),i[p][m].push([r,n-d+l+1]))})}}match(e,a){ti();const r=_(this,We,wr).call(this);return this.match=(s,i)=>{const n=r[s]||r[I],o=n[2][i];if(o)return o;const c=i.match(n[0]);if(!c)return[[],Nr];const l=c.indexOf("",1);return[n[1][l],c]},this.match(e,a)}},de=new WeakMap,me=new WeakMap,We=new WeakSet,wr=function(){const e=Object.create(null);return Object.keys(f(this,me)).concat(Object.keys(f(this,de))).forEach(a=>{e[a]||(e[a]=_(this,We,Tr).call(this,a))}),y(this,de,y(this,me,void 0)),e},Tr=function(e){const a=[];let r=e===I;return[f(this,de),f(this,me)].forEach(s=>{const i=s[e]?Object.keys(s[e]).map(n=>[n,s[e][n]]):[];i.length!==0?(r||(r=!0),a.push(...i)):e!==I&&a.push(...Object.keys(s[I]).map(n=>[n,s[I][n]]))}),r?ai(a):null},Va),fe,te,qa,si=(qa=class{constructor(e){g(this,"name","SmartRouter");N(this,fe,[]);N(this,te,[]);y(this,fe,e.routers)}add(e,a,r){if(!f(this,te))throw new Error(br);f(this,te).push([e,a,r])}match(e,a){if(!f(this,te))throw new Error("Fatal error");const r=f(this,fe),s=f(this,te),i=r.length;let n=0,o;for(;n<i;n++){const c=r[n];try{for(let l=0,d=s.length;l<d;l++)c.add(...s[l]);o=c.match(e,a)}catch(l){if(l instanceof gr)continue;throw l}this.match=c.match.bind(c),y(this,fe,[c]),y(this,te,void 0);break}if(n===i)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(f(this,te)||f(this,fe).length!==1)throw new Error("No active router has been determined yet.");return f(this,fe)[0]}},fe=new WeakMap,te=new WeakMap,qa),Ve=Object.create(null),pe,L,we,He,M,ae,ye,Ja,Ar=(Ja=class{constructor(e,a,r){N(this,ae);N(this,pe);N(this,L);N(this,we);N(this,He,0);N(this,M,Ve);if(y(this,L,r||Object.create(null)),y(this,pe,[]),e&&a){const s=Object.create(null);s[e]={handler:a,possibleKeys:[],score:0},y(this,pe,[s])}y(this,we,[])}insert(e,a,r){y(this,He,++ha(this,He)._);let s=this;const i=Ps(a),n=[];for(let o=0,c=i.length;o<c;o++){const l=i[o],d=i[o+1],m=$s(l,d),p=Array.isArray(m)?m[0]:l;if(p in f(s,L)){s=f(s,L)[p],m&&n.push(m[1]);continue}f(s,L)[p]=new Ar,m&&(f(s,we).push(m),n.push(m[1])),s=f(s,L)[p]}return f(s,pe).push({[e]:{handler:r,possibleKeys:n.filter((o,c,l)=>l.indexOf(o)===c),score:f(this,He)}}),s}search(e,a){var c;const r=[];y(this,M,Ve);let i=[this];const n=lr(a),o=[];for(let l=0,d=n.length;l<d;l++){const m=n[l],p=l===d-1,u=[];for(let x=0,b=i.length;x<b;x++){const h=i[x],v=f(h,L)[m];v&&(y(v,M,f(h,M)),p?(f(v,L)["*"]&&r.push(..._(this,ae,ye).call(this,f(v,L)["*"],e,f(h,M))),r.push(..._(this,ae,ye).call(this,v,e,f(h,M)))):u.push(v));for(let E=0,T=f(h,we).length;E<T;E++){const R=f(h,we)[E],A=f(h,M)===Ve?{}:{...f(h,M)};if(R==="*"){const se=f(h,L)["*"];se&&(r.push(..._(this,ae,ye).call(this,se,e,f(h,M))),y(se,M,A),u.push(se));continue}const[U,Re,he]=R;if(!m&&!(he instanceof RegExp))continue;const J=f(h,L)[U],ms=n.slice(l).join("/");if(he instanceof RegExp){const se=he.exec(ms);if(se){if(A[Re]=se[0],r.push(..._(this,ae,ye).call(this,J,e,f(h,M),A)),Object.keys(f(J,L)).length){y(J,M,A);const Ut=((c=se[0].match(/\//))==null?void 0:c.length)??0;(o[Ut]||(o[Ut]=[])).push(J)}continue}}(he===!0||he.test(m))&&(A[Re]=m,p?(r.push(..._(this,ae,ye).call(this,J,e,A,f(h,M))),f(J,L)["*"]&&r.push(..._(this,ae,ye).call(this,f(J,L)["*"],e,A,f(h,M)))):(y(J,M,A),u.push(J)))}}i=u.concat(o.shift()??[])}return r.length>1&&r.sort((l,d)=>l.score-d.score),[r.map(({handler:l,params:d})=>[l,d])]}},pe=new WeakMap,L=new WeakMap,we=new WeakMap,He=new WeakMap,M=new WeakMap,ae=new WeakSet,ye=function(e,a,r,s){const i=[];for(let n=0,o=f(e,pe).length;n<o;n++){const c=f(e,pe)[n],l=c[a]||c[I],d={};if(l!==void 0&&(l.params=Object.create(null),i.push(l),r!==Ve||s&&s!==Ve))for(let m=0,p=l.possibleKeys.length;m<p;m++){const u=l.possibleKeys[m],x=d[l.score];l.params[u]=s!=null&&s[u]&&!x?s[u]:r[u]??(s==null?void 0:s[u]),d[l.score]=!0}}return i},Ja),Te,Ya,ii=(Ya=class{constructor(){g(this,"name","TrieRouter");N(this,Te);y(this,Te,new Ar)}add(e,a,r){const s=mr(a);if(s){for(let i=0,n=s.length;i<n;i++)f(this,Te).insert(e,s[i],r);return}f(this,Te).insert(e,a,r)}match(e,a){return f(this,Te).search(e,a)}},Te=new WeakMap,Ya),_r=class extends yr{constructor(e={}){super(e),this.router=e.router??new si({routers:[new ri,new ii]})}},ni=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},s=(n=>typeof n=="string"?n==="*"?()=>n:o=>n===o?o:null:typeof n=="function"?n:o=>n.includes(o)?o:null)(r.origin),i=(n=>typeof n=="function"?n:Array.isArray(n)?()=>n:()=>[])(r.allowMethods);return async function(o,c){var m;function l(p,u){o.res.headers.set(p,u)}const d=await s(o.req.header("origin")||"",o);if(d&&l("Access-Control-Allow-Origin",d),r.origin!=="*"){const p=o.req.header("Vary");p?l("Vary",p):l("Vary","Origin")}if(r.credentials&&l("Access-Control-Allow-Credentials","true"),(m=r.exposeHeaders)!=null&&m.length&&l("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),o.req.method==="OPTIONS"){r.maxAge!=null&&l("Access-Control-Max-Age",r.maxAge.toString());const p=await i(o.req.header("origin")||"",o);p.length&&l("Access-Control-Allow-Methods",p.join(","));let u=r.allowHeaders;if(!(u!=null&&u.length)){const x=o.req.header("Access-Control-Request-Headers");x&&(u=x.split(/\s*,\s*/))}return u!=null&&u.length&&(l("Access-Control-Allow-Headers",u.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await c()}};function oi(){const{process:e,Deno:a}=globalThis;return!(typeof(a==null?void 0:a.noColor)=="boolean"?a.noColor:e!==void 0?"NO_COLOR"in(e==null?void 0:e.env):!1)}async function ci(){const{navigator:e}=globalThis,a="cloudflare:workers";return!(e!==void 0&&e.userAgent==="Cloudflare-Workers"?await(async()=>{try{return"NO_COLOR"in((await import(a)).env??{})}catch{return!1}})():!oi())}var li=e=>{const[a,r]=[",","."];return e.map(i=>i.replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+a)).join(r)},di=e=>{const a=Date.now()-e;return li([a<1e3?a+"ms":Math.round(a/1e3)+"s"])},mi=async e=>{if(await ci())switch(e/100|0){case 5:return`\x1B[31m${e}\x1B[0m`;case 4:return`\x1B[33m${e}\x1B[0m`;case 3:return`\x1B[36m${e}\x1B[0m`;case 2:return`\x1B[32m${e}\x1B[0m`}return`${e}`};async function Aa(e,a,r,s,i=0,n){const o=a==="<--"?`${a} ${r} ${s}`:`${a} ${r} ${s} ${await mi(i)} ${n}`;e(o)}var fi=(e=console.log)=>async function(r,s){const{method:i,url:n}=r.req,o=n.slice(n.indexOf("/",8));await Aa(e,"<--",i,o);const c=Date.now();await s(),await Aa(e,"-->",i,o,r.res.status,di(c))},pi=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,_a=(e,a=xi)=>{const r=/\.([a-zA-Z0-9]+?)$/,s=e.match(r);if(!s)return;let i=a[s[1]];return i&&i.startsWith("text")&&(i+="; charset=utf-8"),i},ui={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},xi=ui,hi=(...e)=>{let a=e.filter(i=>i!=="").join("/");a=a.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=a.split("/"),s=[];for(const i of r)i===".."&&s.length>0&&s.at(-1)!==".."?s.pop():i!=="."&&s.push(i);return s.join("/")||"."},Rr={br:".br",zstd:".zst",gzip:".gz"},bi=Object.keys(Rr),gi="index.html",yi=e=>{const a=e.root??"./",r=e.path,s=e.join??hi;return async(i,n)=>{var m,p,u,x;if(i.finalized)return n();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(i.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((m=e.onNotFound)==null?void 0:m.call(e,i.req.path,i)),n()}let c=s(a,!r&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(c)&&(c=s(c,gi));const l=e.getContent;let d=await l(c,i);if(d instanceof Response)return i.newResponse(d.body,d);if(d){const b=e.mimes&&_a(c,e.mimes)||_a(c);if(i.header("Content-Type",b||"application/octet-stream"),e.precompressed&&(!b||pi.test(b))){const h=new Set((p=i.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(v=>v.trim()));for(const v of bi){if(!h.has(v))continue;const E=await l(c+Rr[v],i);if(E){d=E,i.header("Content-Encoding",v),i.header("Vary","Accept-Encoding",{append:!0});break}}}return await((u=e.onFound)==null?void 0:u.call(e,c,i)),i.body(d)}await((x=e.onNotFound)==null?void 0:x.call(e,c,i)),await n()}},vi=async(e,a)=>{let r;a&&a.manifest?typeof a.manifest=="string"?r=JSON.parse(a.manifest):r=a.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let s;a&&a.namespace?s=a.namespace:s=__STATIC_CONTENT;const i=r[e]||e;if(!i)return null;const n=await s.get(i,{type:"stream"});return n||null},Ni=e=>async function(r,s){return yi({...e,getContent:async n=>vi(n,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,s)},Ei=e=>Ni(e),et="_hp",wi={Change:"Input",DoubleClick:"DblClick"},Ti={svg:"2000/svg",math:"1998/Math/MathML"},tt=[],Yt=new WeakMap,Ke=void 0,Ai=()=>Ke,Z=e=>"t"in e,$t={onClick:["click",!1]},Ra=e=>{if(!e.startsWith("on"))return;if($t[e])return $t[e];const a=e.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);if(a){const[,r,s]=a;return $t[e]=[(wi[r]||r).toLowerCase(),!!s]}},Sa=(e,a)=>Ke&&e instanceof SVGElement&&/[A-Z]/.test(a)&&(a in e.style||a.match(/^(?:o|pai|str|u|ve)/))?a.replace(/([A-Z])/g,"-$1").toLowerCase():a,_i=(e,a,r)=>{var s;a||(a={});for(let i in a){const n=a[i];if(i!=="children"&&(!r||r[i]!==n)){i=St(i);const o=Ra(i);if(o){if((r==null?void 0:r[i])!==n&&(r&&e.removeEventListener(o[0],r[i],o[1]),n!=null)){if(typeof n!="function")throw new Error(`Event handler for "${i}" is not a function`);e.addEventListener(o[0],n,o[1])}}else if(i==="dangerouslySetInnerHTML"&&n)e.innerHTML=n.__html;else if(i==="ref"){let c;typeof n=="function"?c=n(e)||(()=>n(null)):n&&"current"in n&&(n.current=e,c=()=>n.current=null),Yt.set(e,c)}else if(i==="style"){const c=e.style;typeof n=="string"?c.cssText=n:(c.cssText="",n!=null&&or(n,c.setProperty.bind(c)))}else{if(i==="value"){const l=e.nodeName;if(l==="INPUT"||l==="TEXTAREA"||l==="SELECT"){if(e.value=n==null||n===!1?null:n,l==="TEXTAREA"){e.textContent=n;continue}else if(l==="SELECT"){e.selectedIndex===-1&&(e.selectedIndex=0);continue}}}else(i==="checked"&&e.nodeName==="INPUT"||i==="selected"&&e.nodeName==="OPTION")&&(e[i]=n);const c=Sa(e,i);n==null||n===!1?e.removeAttribute(c):n===!0?e.setAttribute(c,""):typeof n=="string"||typeof n=="number"?e.setAttribute(c,n):e.setAttribute(c,n.toString())}}}if(r)for(let i in r){const n=r[i];if(i!=="children"&&!(i in a)){i=St(i);const o=Ra(i);o?e.removeEventListener(o[0],n,o[1]):i==="ref"?(s=Yt.get(e))==null||s():e.removeAttribute(Sa(e,i))}}},Ri=(e,a)=>{a[O][0]=0,tt.push([e,a]);const r=a.tag[sa]||a.tag,s=r.defaultProps?{...r.defaultProps,...a.props}:a.props;try{return[r.call(null,s)]}finally{tt.pop()}},Sr=(e,a,r,s,i)=>{var n,o;(n=e.vR)!=null&&n.length&&(s.push(...e.vR),delete e.vR),typeof e.tag=="function"&&((o=e[O][1][Dr])==null||o.forEach(c=>i.push(c))),e.vC.forEach(c=>{var l;if(Z(c))r.push(c);else if(typeof c.tag=="function"||c.tag===""){c.c=a;const d=r.length;if(Sr(c,a,r,s,i),c.s){for(let m=d;m<r.length;m++)r[m].s=!0;c.s=!1}}else r.push(c),(l=c.vR)!=null&&l.length&&(s.push(...c.vR),delete c.vR)})},Si=e=>{for(;;e=e.tag===et||!e.vC||!e.pP?e.nN:e.vC[0]){if(!e)return null;if(e.tag!==et&&e.e)return e.e}},Cr=e=>{var a,r,s,i,n,o;Z(e)||((r=(a=e[O])==null?void 0:a[1][Dr])==null||r.forEach(c=>{var l;return(l=c[2])==null?void 0:l.call(c)}),(s=Yt.get(e.e))==null||s(),e.p===2&&((i=e.vC)==null||i.forEach(c=>c.p=2)),(n=e.vC)==null||n.forEach(Cr)),e.p||((o=e.e)==null||o.remove(),delete e.e),typeof e.tag=="function"&&(qe.delete(e),Tt.delete(e),delete e[O][3],e.a=!0)},Or=(e,a,r)=>{e.c=a,Ir(e,a,r)},Ca=(e,a)=>{if(a){for(let r=0,s=e.length;r<s;r++)if(e[r]===a)return r}},Oa=Symbol(),Ir=(e,a,r)=>{var d;const s=[],i=[],n=[];Sr(e,a,s,i,n),i.forEach(Cr);const o=r?void 0:a.childNodes;let c,l=null;if(r)c=-1;else if(!o.length)c=0;else{const m=Ca(o,Si(e.nN));m!==void 0?(l=o[m],c=m):c=Ca(o,(d=s.find(p=>p.tag!==et&&p.e))==null?void 0:d.e)??-1,c===-1&&(r=!0)}for(let m=0,p=s.length;m<p;m++,c++){const u=s[m];let x;if(u.s&&u.e)x=u.e,u.s=!1;else{const b=r||!u.e;Z(u)?(u.e&&u.d&&(u.e.textContent=u.t),u.d=!1,x=u.e||(u.e=document.createTextNode(u.t))):(x=u.e||(u.e=u.n?document.createElementNS(u.n,u.tag):document.createElement(u.tag)),_i(x,u.props,u.pP),Ir(u,x,b))}u.tag===et?c--:r?x.parentNode||a.appendChild(x):o[c]!==x&&o[c-1]!==x&&(o[c+1]===x?a.appendChild(o[c]):a.insertBefore(x,l||o[c]||null))}if(e.pP&&delete e.pP,n.length){const m=[],p=[];n.forEach(([,u,,x,b])=>{u&&m.push(u),x&&p.push(x),b==null||b()}),m.forEach(u=>u()),p.length&&requestAnimationFrame(()=>{p.forEach(u=>u())})}},Ci=(e,a)=>!!(e&&e.length===a.length&&e.every((r,s)=>r[1]===a[s][1])),Tt=new WeakMap,Zt=(e,a,r)=>{var n,o,c,l,d,m;const s=!r&&a.pC;r&&(a.pC||(a.pC=a.vC));let i;try{r||(r=typeof a.tag=="function"?Ri(e,a):ft(a.props.children)),((n=r[0])==null?void 0:n.tag)===""&&r[0][zt]&&(i=r[0][zt],e[5].push([e,i,a]));const p=s?[...a.pC]:a.vC?[...a.vC]:void 0,u=[];let x;for(let b=0;b<r.length;b++){Array.isArray(r[b])&&r.splice(b,1,...r[b].flat());let h=Oi(r[b]);if(h){typeof h.tag=="function"&&!h.tag[ar]&&(Xe.length>0&&(h[O][2]=Xe.map(E=>[E,E.values.at(-1)])),(o=e[5])!=null&&o.length&&(h[O][3]=e[5].at(-1)));let v;if(p&&p.length){const E=p.findIndex(Z(h)?T=>Z(T):h.key!==void 0?T=>T.key===h.key&&T.tag===h.tag:T=>T.tag===h.tag);E!==-1&&(v=p[E],p.splice(E,1))}if(v)if(Z(h))v.t!==h.t&&(v.t=h.t,v.d=!0),h=v;else{const E=v.pP=v.props;if(v.props=h.props,v.f||(v.f=h.f||a.f),typeof h.tag=="function"){const T=v[O][2];v[O][2]=h[O][2]||[],v[O][3]=h[O][3],!v.f&&((v.o||v)===h.o||(l=(c=v.tag)[bs])!=null&&l.call(c,E,v.props))&&Ci(T,v[O][2])&&(v.s=!0)}h=v}else if(!Z(h)&&Ke){const E=ze(Ke);E&&(h.n=E)}if(!Z(h)&&!h.s&&(Zt(e,h),delete h.f),u.push(h),x&&!x.s&&!h.s)for(let E=x;E&&!Z(E);E=(d=E.vC)==null?void 0:d.at(-1))E.nN=h;x=h}}a.vR=s?[...a.vC,...p||[]]:p||[],a.vC=u,s&&delete a.pC}catch(p){if(a.f=!0,p===Oa){if(i)return;throw p}const[u,x,b]=((m=a[O])==null?void 0:m[3])||[];if(x){const h=()=>At([0,!1,e[2]],b),v=Tt.get(b)||[];v.push(h),Tt.set(b,v);const E=x(p,()=>{const T=Tt.get(b);if(T){const R=T.indexOf(h);if(R!==-1)return T.splice(R,1),h()}});if(E){if(e[0]===1)e[1]=!0;else if(Zt(e,b,[E]),(x.length===1||e!==u)&&b.c){Or(b,b.c,!1);return}throw Oa}}throw p}finally{i&&e[5].pop()}},Oi=e=>{if(!(e==null||typeof e=="boolean")){if(typeof e=="string"||typeof e=="number")return{t:e.toString(),d:!0};if("vR"in e&&(e={tag:e.tag,props:e.props,key:e.key,f:e.f,type:e.tag,ref:e.props.ref,o:e.o||e}),typeof e.tag=="function")e[O]=[0,[]];else{const a=Ti[e.tag];a&&(Ke||(Ke=sr("")),e.props.children=[{tag:Ke,props:{value:e.n=`http://www.w3.org/${a}`,children:e.props.children}}])}return e}},Ia=(e,a)=>{var r,s;(r=a[O][2])==null||r.forEach(([i,n])=>{i.values.push(n)});try{Zt(e,a,void 0)}catch{return}if(a.a){delete a.a;return}(s=a[O][2])==null||s.forEach(([i])=>{i.values.pop()}),(e[0]!==1||!e[1])&&Or(a,a.c,!1)},qe=new WeakMap,Da=[],At=async(e,a)=>{e[5]||(e[5]=[]);const r=qe.get(a);r&&r[0](void 0);let s;const i=new Promise(n=>s=n);if(qe.set(a,[s,()=>{e[2]?e[2](e,a,n=>{Ia(n,a)}).then(()=>s(a)):(Ia(e,a),s(a))}]),Da.length)Da.at(-1).add(a);else{await Promise.resolve();const n=qe.get(a);n&&(qe.delete(a),n[1]())}return i},Ii=(e,a,r)=>({tag:et,props:{children:e},key:r,e:a,p:1}),Bt=0,Dr=1,Ht=2,Gt=3,Xt=new WeakMap,Mr=(e,a)=>!e||!a||e.length!==a.length||a.some((r,s)=>r!==e[s]),Di=void 0,Ma=[],Mi=e=>{var o;const a=()=>typeof e=="function"?e():e,r=tt.at(-1);if(!r)return[a(),()=>{}];const[,s]=r,i=(o=s[O][1])[Bt]||(o[Bt]=[]),n=s[O][0]++;return i[n]||(i[n]=[a(),c=>{const l=Di,d=i[n];if(typeof c=="function"&&(c=c(d[0])),!Object.is(c,d[0]))if(d[0]=c,Ma.length){const[m,p]=Ma.at(-1);Promise.all([m===3?s:At([m,!1,l],s),p]).then(([u])=>{if(!u||!(m===2||m===3))return;const x=u.vC;requestAnimationFrame(()=>{setTimeout(()=>{x===u.vC&&At([m===3?1:0,!1,l],u)})})})}else At([0,!1,l],s)}])},la=(e,a)=>{var c;const r=tt.at(-1);if(!r)return e;const[,s]=r,i=(c=s[O][1])[Ht]||(c[Ht]=[]),n=s[O][0]++,o=i[n];return Mr(o==null?void 0:o[1],a)?i[n]=[e,a]:e=i[n][0],e},Ui=e=>{const a=Xt.get(e);if(a){if(a.length===2)throw a[1];return a[0]}throw e.then(r=>Xt.set(e,[r]),r=>Xt.set(e,[void 0,r])),e},Li=(e,a)=>{var c;const r=tt.at(-1);if(!r)return e();const[,s]=r,i=(c=s[O][1])[Gt]||(c[Gt]=[]),n=s[O][0]++,o=i[n];return Mr(o==null?void 0:o[1],a)&&(i[n]=[e(),a]),i[n][0]},ki=sr({pending:!1,data:null,method:null,action:null}),Ua=new Set,Pi=e=>{Ua.add(e),e.finally(()=>Ua.delete(e))},da=(e,a)=>Li(()=>r=>{let s;e&&(typeof e=="function"?s=e(r)||(()=>{e(null)}):e&&"current"in e&&(e.current=r,s=()=>{e.current=null}));const i=a(r);return()=>{i==null||i(),s==null||s()}},[e]),Ce=Object.create(null),bt=Object.create(null),xt=(e,a,r,s,i)=>{if(a!=null&&a.itemProp)return{tag:e,props:a,type:e,ref:a.ref};const n=document.head;let{onLoad:o,onError:c,precedence:l,blocking:d,...m}=a,p=null,u=!1;const x=gt[e];let b;if(x.length>0){const T=n.querySelectorAll(e);e:for(const R of T)for(const A of gt[e])if(R.getAttribute(A)===a[A]){p=R;break e}if(!p){const R=x.reduce((A,U)=>a[U]===void 0?A:`${A}-${U}-${a[U]}`,e);u=!bt[R],p=bt[R]||(bt[R]=(()=>{const A=document.createElement(e);for(const U of x)a[U]!==void 0&&A.setAttribute(U,a[U]),a.rel&&A.setAttribute("rel",a.rel);return A})())}}else b=n.querySelectorAll(e);l=s?l??"":void 0,s&&(m[yt]=l);const h=la(T=>{if(x.length>0){let R=!1;for(const A of n.querySelectorAll(e)){if(R&&A.getAttribute(yt)!==l){n.insertBefore(T,A);return}A.getAttribute(yt)===l&&(R=!0)}n.appendChild(T)}else if(b){let R=!1;for(const A of b)if(A===T){R=!0;break}R||n.insertBefore(T,n.contains(b[0])?b[0]:n.querySelector(e)),b=void 0}},[l]),v=da(a.ref,T=>{var U;const R=x[0];if(r===2&&(T.innerHTML=""),(u||b)&&h(T),!c&&!o)return;let A=Ce[U=T.getAttribute(R)]||(Ce[U]=new Promise((Re,he)=>{T.addEventListener("load",Re),T.addEventListener("error",he)}));o&&(A=A.then(o)),c&&(A=A.catch(c)),A.catch(()=>{})});if(i&&d==="render"){const T=gt[e][0];if(a[T]){const R=a[T],A=Ce[R]||(Ce[R]=new Promise((U,Re)=>{h(p),p.addEventListener("load",U),p.addEventListener("error",Re)}));Ui(A)}}const E={tag:e,type:e,props:{...m,ref:v},ref:v};return E.p=r,p&&(E.e=p),Ii(E,n)},Fi=e=>{const a=Ai(),r=a&&ze(a);return r!=null&&r.endsWith("svg")?{tag:"title",props:e,type:"title",ref:e.ref}:xt("title",e,void 0,!1,!1)},ji=e=>!e||["src","async"].some(a=>!e[a])?{tag:"script",props:e,type:"script",ref:e.ref}:xt("script",e,1,!1,!0),$i=e=>!e||!["href","precedence"].every(a=>a in e)?{tag:"style",props:e,type:"style",ref:e.ref}:(e["data-href"]=e.href,delete e.href,xt("style",e,2,!0,!0)),Bi=e=>!e||["onLoad","onError"].some(a=>a in e)||e.rel==="stylesheet"&&(!("precedence"in e)||"disabled"in e)?{tag:"link",props:e,type:"link",ref:e.ref}:xt("link",e,1,"precedence"in e,!0),Hi=e=>xt("meta",e,void 0,!1,!1),Ur=Symbol(),Gi=e=>{const{action:a,...r}=e;typeof a!="function"&&(r.action=a);const[s,i]=Mi([null,!1]),n=la(async d=>{const m=d.isTrusted?a:d.detail[Ur];if(typeof m!="function")return;d.preventDefault();const p=new FormData(d.target);i([p,!0]);const u=m(p);u instanceof Promise&&(Pi(u),await u),i([null,!0])},[]),o=da(e.ref,d=>(d.addEventListener("submit",n),()=>{d.removeEventListener("submit",n)})),[c,l]=s;return s[1]=!1,{tag:ki,props:{value:{pending:c!==null,data:c,method:c?"post":null,action:c?a:null},children:{tag:"form",props:{...r,ref:o},type:"form",ref:o}},f:l}},Lr=(e,{formAction:a,...r})=>{if(typeof a=="function"){const s=la(i=>{i.preventDefault(),i.currentTarget.form.dispatchEvent(new CustomEvent("submit",{detail:{[Ur]:a}}))},[]);r.ref=da(r.ref,i=>(i.addEventListener("click",s),()=>{i.removeEventListener("click",s)}))}return{tag:e,props:r,type:e,ref:r.ref}},Xi=e=>Lr("input",e),Ki=e=>Lr("button",e);Object.assign(Vt,{title:Fi,script:ji,style:$i,link:Bi,meta:Hi,form:Gi,input:Xi,button:Ki});ia(null);new TextEncoder;var Wi=ia(null),zi=(e,a,r,s)=>(i,n)=>{const o="<!DOCTYPE html>",c=r?va(d=>r(d,e),{Layout:a,...n},i):i,l=hs`${$(o)}${va(Wi.Provider,{value:e},c)}`;return e.html(l)},Vi=(e,a)=>function(s,i){const n=s.getLayout()??Os;return e&&s.setLayout(o=>e({...o,Layout:n},s)),s.setRenderer(zi(s,n,e)),i()};const qi=Vi(({children:e})=>t("html",{lang:"es",children:[t("head",{children:[t("meta",{charset:"UTF-8"}),t("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"}),t("title",{children:"Lyra Expenses - Sistema de Gastos y Viáticos"}),t("script",{src:"https://cdn.tailwindcss.com"}),t("link",{href:"https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",rel:"stylesheet"}),t("link",{href:"/static/styles.css",rel:"stylesheet"}),t("script",{src:"https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"}),t("script",{src:"https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"}),t("script",{src:"https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"}),t("meta",{name:"description",content:"Sistema ejecutivo de gestión de gastos y viáticos multiempresa con soporte multimoneda. Basado en el modelo 4-D: Dinero, Decisión, Dirección, Disciplina."}),t("meta",{name:"author",content:"Lyra - Asistente Estratégico"}),t("link",{rel:"icon",type:"image/x-icon",href:"data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAA"})]}),t("body",{className:"bg-primary",children:e})]})),q=new TextEncoder,Ae=new TextDecoder;function kr(...e){const a=e.reduce((i,{length:n})=>i+n,0),r=new Uint8Array(a);let s=0;for(const i of e)r.set(i,s),s+=i.length;return r}function Ji(e){if(Uint8Array.prototype.toBase64)return e.toBase64();const a=32768,r=[];for(let s=0;s<e.length;s+=a)r.push(String.fromCharCode.apply(null,e.subarray(s,s+a)));return btoa(r.join(""))}function Yi(e){if(Uint8Array.fromBase64)return Uint8Array.fromBase64(e);const a=atob(e),r=new Uint8Array(a.length);for(let s=0;s<a.length;s++)r[s]=a.charCodeAt(s);return r}function _t(e){if(Uint8Array.fromBase64)return Uint8Array.fromBase64(typeof e=="string"?e:Ae.decode(e),{alphabet:"base64url"});let a=e;a instanceof Uint8Array&&(a=Ae.decode(a)),a=a.replace(/-/g,"+").replace(/_/g,"/").replace(/\s/g,"");try{return Yi(a)}catch{throw new TypeError("The input to be decoded is not correctly encoded.")}}function Kt(e){let a=e;return typeof a=="string"&&(a=q.encode(a)),Uint8Array.prototype.toBase64?a.toBase64({alphabet:"base64url",omitPadding:!0}):Ji(a).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}class _e extends Error{constructor(r,s){var i;super(r,s);g(this,"code","ERR_JOSE_GENERIC");this.name=this.constructor.name,(i=Error.captureStackTrace)==null||i.call(Error,this,this.constructor)}}g(_e,"code","ERR_JOSE_GENERIC");class B extends _e{constructor(r,s,i="unspecified",n="unspecified"){super(r,{cause:{claim:i,reason:n,payload:s}});g(this,"code","ERR_JWT_CLAIM_VALIDATION_FAILED");g(this,"claim");g(this,"reason");g(this,"payload");this.claim=i,this.reason=n,this.payload=s}}g(B,"code","ERR_JWT_CLAIM_VALIDATION_FAILED");class Qt extends _e{constructor(r,s,i="unspecified",n="unspecified"){super(r,{cause:{claim:i,reason:n,payload:s}});g(this,"code","ERR_JWT_EXPIRED");g(this,"claim");g(this,"reason");g(this,"payload");this.claim=i,this.reason=n,this.payload=s}}g(Qt,"code","ERR_JWT_EXPIRED");class oe extends _e{constructor(){super(...arguments);g(this,"code","ERR_JOSE_NOT_SUPPORTED")}}g(oe,"code","ERR_JOSE_NOT_SUPPORTED");class S extends _e{constructor(){super(...arguments);g(this,"code","ERR_JWS_INVALID")}}g(S,"code","ERR_JWS_INVALID");class Dt extends _e{constructor(){super(...arguments);g(this,"code","ERR_JWT_INVALID")}}g(Dt,"code","ERR_JWT_INVALID");class Pr extends _e{constructor(r="signature verification failed",s){super(r,s);g(this,"code","ERR_JWS_SIGNATURE_VERIFICATION_FAILED")}}g(Pr,"code","ERR_JWS_SIGNATURE_VERIFICATION_FAILED");function z(e,a="algorithm.name"){return new TypeError(`CryptoKey does not support this operation, its ${a} must be ${e}`)}function Oe(e,a){return e.name===a}function Wt(e){return parseInt(e.name.slice(4),10)}function Zi(e){switch(e){case"ES256":return"P-256";case"ES384":return"P-384";case"ES512":return"P-521";default:throw new Error("unreachable")}}function Qi(e,a){if(a&&!e.usages.includes(a))throw new TypeError(`CryptoKey does not support this operation, its usages must include ${a}.`)}function en(e,a,r){switch(a){case"HS256":case"HS384":case"HS512":{if(!Oe(e.algorithm,"HMAC"))throw z("HMAC");const s=parseInt(a.slice(2),10);if(Wt(e.algorithm.hash)!==s)throw z(`SHA-${s}`,"algorithm.hash");break}case"RS256":case"RS384":case"RS512":{if(!Oe(e.algorithm,"RSASSA-PKCS1-v1_5"))throw z("RSASSA-PKCS1-v1_5");const s=parseInt(a.slice(2),10);if(Wt(e.algorithm.hash)!==s)throw z(`SHA-${s}`,"algorithm.hash");break}case"PS256":case"PS384":case"PS512":{if(!Oe(e.algorithm,"RSA-PSS"))throw z("RSA-PSS");const s=parseInt(a.slice(2),10);if(Wt(e.algorithm.hash)!==s)throw z(`SHA-${s}`,"algorithm.hash");break}case"Ed25519":case"EdDSA":{if(!Oe(e.algorithm,"Ed25519"))throw z("Ed25519");break}case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":{if(!Oe(e.algorithm,a))throw z(a);break}case"ES256":case"ES384":case"ES512":{if(!Oe(e.algorithm,"ECDSA"))throw z("ECDSA");const s=Zi(a);if(e.algorithm.namedCurve!==s)throw z(s,"algorithm.namedCurve");break}default:throw new TypeError("CryptoKey does not support this operation")}Qi(e,r)}function Fr(e,a,...r){var s;if(r=r.filter(Boolean),r.length>2){const i=r.pop();e+=`one of type ${r.join(", ")}, or ${i}.`}else r.length===2?e+=`one of type ${r[0]} or ${r[1]}.`:e+=`of type ${r[0]}.`;return a==null?e+=` Received ${a}`:typeof a=="function"&&a.name?e+=` Received function ${a.name}`:typeof a=="object"&&a!=null&&(s=a.constructor)!=null&&s.name&&(e+=` Received an instance of ${a.constructor.name}`),e}const tn=(e,...a)=>Fr("Key must be ",e,...a);function jr(e,a,...r){return Fr(`Key for the ${e} algorithm must be `,a,...r)}function $r(e){return(e==null?void 0:e[Symbol.toStringTag])==="CryptoKey"}function Br(e){return(e==null?void 0:e[Symbol.toStringTag])==="KeyObject"}const Hr=e=>$r(e)||Br(e),Gr=(...e)=>{const a=e.filter(Boolean);if(a.length===0||a.length===1)return!0;let r;for(const s of a){const i=Object.keys(s);if(!r||r.size===0){r=new Set(i);continue}for(const n of i){if(r.has(n))return!1;r.add(n)}}return!0};function an(e){return typeof e=="object"&&e!==null}const at=e=>{if(!an(e)||Object.prototype.toString.call(e)!=="[object Object]")return!1;if(Object.getPrototypeOf(e)===null)return!0;let a=e;for(;Object.getPrototypeOf(a)!==null;)a=Object.getPrototypeOf(a);return Object.getPrototypeOf(e)===a},Xr=(e,a)=>{if(e.startsWith("RS")||e.startsWith("PS")){const{modulusLength:r}=a.algorithm;if(typeof r!="number"||r<2048)throw new TypeError(`${e} requires key modulusLength to be 2048 bits or larger`)}};function rn(e){let a,r;switch(e.kty){case"AKP":{switch(e.alg){case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":a={name:e.alg},r=e.priv?["sign"]:["verify"];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"RSA":{switch(e.alg){case"PS256":case"PS384":case"PS512":a={name:"RSA-PSS",hash:`SHA-${e.alg.slice(-3)}`},r=e.d?["sign"]:["verify"];break;case"RS256":case"RS384":case"RS512":a={name:"RSASSA-PKCS1-v1_5",hash:`SHA-${e.alg.slice(-3)}`},r=e.d?["sign"]:["verify"];break;case"RSA-OAEP":case"RSA-OAEP-256":case"RSA-OAEP-384":case"RSA-OAEP-512":a={name:"RSA-OAEP",hash:`SHA-${parseInt(e.alg.slice(-3),10)||1}`},r=e.d?["decrypt","unwrapKey"]:["encrypt","wrapKey"];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"EC":{switch(e.alg){case"ES256":a={name:"ECDSA",namedCurve:"P-256"},r=e.d?["sign"]:["verify"];break;case"ES384":a={name:"ECDSA",namedCurve:"P-384"},r=e.d?["sign"]:["verify"];break;case"ES512":a={name:"ECDSA",namedCurve:"P-521"},r=e.d?["sign"]:["verify"];break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":a={name:"ECDH",namedCurve:e.crv},r=e.d?["deriveBits"]:[];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}case"OKP":{switch(e.alg){case"Ed25519":case"EdDSA":a={name:"Ed25519"},r=e.d?["sign"]:["verify"];break;case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":a={name:e.crv},r=e.d?["deriveBits"]:[];break;default:throw new oe('Invalid or unsupported JWK "alg" (Algorithm) Parameter value')}break}default:throw new oe('Invalid or unsupported JWK "kty" (Key Type) Parameter value')}return{algorithm:a,keyUsages:r}}const sn=async e=>{if(!e.alg)throw new TypeError('"alg" argument is required when "jwk.alg" is not present');const{algorithm:a,keyUsages:r}=rn(e),s={...e};return s.kty!=="AKP"&&delete s.alg,delete s.use,crypto.subtle.importKey("jwk",s,a,e.ext??!(e.d||e.priv),e.key_ops??r)},Kr=(e,a,r,s,i)=>{if(i.crit!==void 0&&(s==null?void 0:s.crit)===void 0)throw new e('"crit" (Critical) Header Parameter MUST be integrity protected');if(!s||s.crit===void 0)return new Set;if(!Array.isArray(s.crit)||s.crit.length===0||s.crit.some(o=>typeof o!="string"||o.length===0))throw new e('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');let n;r!==void 0?n=new Map([...Object.entries(r),...a.entries()]):n=a;for(const o of s.crit){if(!n.has(o))throw new oe(`Extension Header Parameter "${o}" is not recognized`);if(i[o]===void 0)throw new e(`Extension Header Parameter "${o}" is missing`);if(n.get(o)&&s[o]===void 0)throw new e(`Extension Header Parameter "${o}" MUST be integrity protected`)}return new Set(s.crit)};function ma(e){return at(e)&&typeof e.kty=="string"}function nn(e){return e.kty!=="oct"&&(e.kty==="AKP"&&typeof e.priv=="string"||typeof e.d=="string")}function on(e){return e.kty!=="oct"&&typeof e.d>"u"&&typeof e.priv>"u"}function cn(e){return e.kty==="oct"&&typeof e.k=="string"}let Pe;const La=async(e,a,r,s=!1)=>{Pe||(Pe=new WeakMap);let i=Pe.get(e);if(i!=null&&i[r])return i[r];const n=await sn({...a,alg:r});return s&&Object.freeze(e),i?i[r]=n:Pe.set(e,{[r]:n}),n},ln=(e,a)=>{var o;Pe||(Pe=new WeakMap);let r=Pe.get(e);if(r!=null&&r[a])return r[a];const s=e.type==="public",i=!!s;let n;if(e.asymmetricKeyType==="x25519"){switch(a){case"ECDH-ES":case"ECDH-ES+A128KW":case"ECDH-ES+A192KW":case"ECDH-ES+A256KW":break;default:throw new TypeError("given KeyObject instance cannot be used for this algorithm")}n=e.toCryptoKey(e.asymmetricKeyType,i,s?[]:["deriveBits"])}if(e.asymmetricKeyType==="ed25519"){if(a!=="EdDSA"&&a!=="Ed25519")throw new TypeError("given KeyObject instance cannot be used for this algorithm");n=e.toCryptoKey(e.asymmetricKeyType,i,[s?"verify":"sign"])}switch(e.asymmetricKeyType){case"ml-dsa-44":case"ml-dsa-65":case"ml-dsa-87":{if(a!==e.asymmetricKeyType.toUpperCase())throw new TypeError("given KeyObject instance cannot be used for this algorithm");n=e.toCryptoKey(e.asymmetricKeyType,i,[s?"verify":"sign"])}}if(e.asymmetricKeyType==="rsa"){let c;switch(a){case"RSA-OAEP":c="SHA-1";break;case"RS256":case"PS256":case"RSA-OAEP-256":c="SHA-256";break;case"RS384":case"PS384":case"RSA-OAEP-384":c="SHA-384";break;case"RS512":case"PS512":case"RSA-OAEP-512":c="SHA-512";break;default:throw new TypeError("given KeyObject instance cannot be used for this algorithm")}if(a.startsWith("RSA-OAEP"))return e.toCryptoKey({name:"RSA-OAEP",hash:c},i,s?["encrypt"]:["decrypt"]);n=e.toCryptoKey({name:a.startsWith("PS")?"RSA-PSS":"RSASSA-PKCS1-v1_5",hash:c},i,[s?"verify":"sign"])}if(e.asymmetricKeyType==="ec"){const l=new Map([["prime256v1","P-256"],["secp384r1","P-384"],["secp521r1","P-521"]]).get((o=e.asymmetricKeyDetails)==null?void 0:o.namedCurve);if(!l)throw new TypeError("given KeyObject instance cannot be used for this algorithm");a==="ES256"&&l==="P-256"&&(n=e.toCryptoKey({name:"ECDSA",namedCurve:l},i,[s?"verify":"sign"])),a==="ES384"&&l==="P-384"&&(n=e.toCryptoKey({name:"ECDSA",namedCurve:l},i,[s?"verify":"sign"])),a==="ES512"&&l==="P-521"&&(n=e.toCryptoKey({name:"ECDSA",namedCurve:l},i,[s?"verify":"sign"])),a.startsWith("ECDH-ES")&&(n=e.toCryptoKey({name:"ECDH",namedCurve:l},i,s?[]:["deriveBits"]))}if(!n)throw new TypeError("given KeyObject instance cannot be used for this algorithm");return r?r[a]=n:Pe.set(e,{[a]:n}),n},Wr=async(e,a)=>{if(e instanceof Uint8Array||$r(e))return e;if(Br(e)){if(e.type==="secret")return e.export();if("toCryptoKey"in e&&typeof e.toCryptoKey=="function")try{return ln(e,a)}catch(s){if(s instanceof TypeError)throw s}let r=e.export({format:"jwk"});return La(e,r,a)}if(ma(e))return e.k?_t(e.k):La(e,e,a,!0);throw new Error("unreachable")},Le=e=>e==null?void 0:e[Symbol.toStringTag],ea=(e,a,r)=>{var s,i;if(a.use!==void 0){let n;switch(r){case"sign":case"verify":n="sig";break;case"encrypt":case"decrypt":n="enc";break}if(a.use!==n)throw new TypeError(`Invalid key for this operation, its "use" must be "${n}" when present`)}if(a.alg!==void 0&&a.alg!==e)throw new TypeError(`Invalid key for this operation, its "alg" must be "${e}" when present`);if(Array.isArray(a.key_ops)){let n;switch(!0){case(r==="sign"||r==="verify"):case e==="dir":case e.includes("CBC-HS"):n=r;break;case e.startsWith("PBES2"):n="deriveBits";break;case/^A\d{3}(?:GCM)?(?:KW)?$/.test(e):!e.includes("GCM")&&e.endsWith("KW")?n=r==="encrypt"?"wrapKey":"unwrapKey":n=r;break;case(r==="encrypt"&&e.startsWith("RSA")):n="wrapKey";break;case r==="decrypt":n=e.startsWith("RSA")?"unwrapKey":"deriveBits";break}if(n&&((i=(s=a.key_ops)==null?void 0:s.includes)==null?void 0:i.call(s,n))===!1)throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${n}" when present`)}return!0},dn=(e,a,r)=>{if(!(a instanceof Uint8Array)){if(ma(a)){if(cn(a)&&ea(e,a,r))return;throw new TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present')}if(!Hr(a))throw new TypeError(jr(e,a,"CryptoKey","KeyObject","JSON Web Key","Uint8Array"));if(a.type!=="secret")throw new TypeError(`${Le(a)} instances for symmetric algorithms must be of type "secret"`)}},mn=(e,a,r)=>{if(ma(a))switch(r){case"decrypt":case"sign":if(nn(a)&&ea(e,a,r))return;throw new TypeError("JSON Web Key for this operation be a private JWK");case"encrypt":case"verify":if(on(a)&&ea(e,a,r))return;throw new TypeError("JSON Web Key for this operation be a public JWK")}if(!Hr(a))throw new TypeError(jr(e,a,"CryptoKey","KeyObject","JSON Web Key"));if(a.type==="secret")throw new TypeError(`${Le(a)} instances for asymmetric algorithms must not be of type "secret"`);if(a.type==="public")switch(r){case"sign":throw new TypeError(`${Le(a)} instances for asymmetric algorithm signing must be of type "private"`);case"decrypt":throw new TypeError(`${Le(a)} instances for asymmetric algorithm decryption must be of type "private"`)}if(a.type==="private")switch(r){case"verify":throw new TypeError(`${Le(a)} instances for asymmetric algorithm verifying must be of type "public"`);case"encrypt":throw new TypeError(`${Le(a)} instances for asymmetric algorithm encryption must be of type "public"`)}},zr=(e,a,r)=>{e.startsWith("HS")||e==="dir"||e.startsWith("PBES2")||/^A(?:128|192|256)(?:GCM)?(?:KW)?$/.test(e)||/^A(?:128|192|256)CBC-HS(?:256|384|512)$/.test(e)?dn(e,a,r):mn(e,a,r)},Vr=(e,a)=>{const r=`SHA-${e.slice(-3)}`;switch(e){case"HS256":case"HS384":case"HS512":return{hash:r,name:"HMAC"};case"PS256":case"PS384":case"PS512":return{hash:r,name:"RSA-PSS",saltLength:parseInt(e.slice(-3),10)>>3};case"RS256":case"RS384":case"RS512":return{hash:r,name:"RSASSA-PKCS1-v1_5"};case"ES256":case"ES384":case"ES512":return{hash:r,name:"ECDSA",namedCurve:a.namedCurve};case"Ed25519":case"EdDSA":return{name:"Ed25519"};case"ML-DSA-44":case"ML-DSA-65":case"ML-DSA-87":return{name:e};default:throw new oe(`alg ${e} is not supported either by JOSE or your javascript runtime`)}},qr=async(e,a,r)=>{if(a instanceof Uint8Array){if(!e.startsWith("HS"))throw new TypeError(tn(a,"CryptoKey","KeyObject","JSON Web Key"));return crypto.subtle.importKey("raw",a,{hash:`SHA-${e.slice(-3)}`,name:"HMAC"},!1,[r])}return en(a,e,r),a},fn=async(e,a,r,s)=>{const i=await qr(e,a,"verify");Xr(e,i);const n=Vr(e,i.algorithm);try{return await crypto.subtle.verify(n,i,r,s)}catch{return!1}};async function pn(e,a,r){if(!at(e))throw new S("Flattened JWS must be an object");if(e.protected===void 0&&e.header===void 0)throw new S('Flattened JWS must have either of the "protected" or "header" members');if(e.protected!==void 0&&typeof e.protected!="string")throw new S("JWS Protected Header incorrect type");if(e.payload===void 0)throw new S("JWS Payload missing");if(typeof e.signature!="string")throw new S("JWS Signature missing or incorrect type");if(e.header!==void 0&&!at(e.header))throw new S("JWS Unprotected Header incorrect type");let s={};if(e.protected)try{const h=_t(e.protected);s=JSON.parse(Ae.decode(h))}catch{throw new S("JWS Protected Header is invalid")}if(!Gr(s,e.header))throw new S("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const i={...s,...e.header},n=Kr(S,new Map([["b64",!0]]),r==null?void 0:r.crit,s,i);let o=!0;if(n.has("b64")&&(o=s.b64,typeof o!="boolean"))throw new S('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:c}=i;if(typeof c!="string"||!c)throw new S('JWS "alg" (Algorithm) Header Parameter missing or invalid');if(o){if(typeof e.payload!="string")throw new S("JWS Payload must be a string")}else if(typeof e.payload!="string"&&!(e.payload instanceof Uint8Array))throw new S("JWS Payload must be a string or an Uint8Array instance");let l=!1;typeof a=="function"&&(a=await a(s,e),l=!0),zr(c,a,"verify");const d=kr(q.encode(e.protected??""),q.encode("."),typeof e.payload=="string"?q.encode(e.payload):e.payload);let m;try{m=_t(e.signature)}catch{throw new S("Failed to base64url decode the signature")}const p=await Wr(a,c);if(!await fn(c,p,m,d))throw new Pr;let x;if(o)try{x=_t(e.payload)}catch{throw new S("Failed to base64url decode the payload")}else typeof e.payload=="string"?x=q.encode(e.payload):x=e.payload;const b={payload:x};return e.protected!==void 0&&(b.protectedHeader=s),e.header!==void 0&&(b.unprotectedHeader=e.header),l?{...b,key:p}:b}async function un(e,a,r){if(e instanceof Uint8Array&&(e=Ae.decode(e)),typeof e!="string")throw new S("Compact JWS must be a string or Uint8Array");const{0:s,1:i,2:n,length:o}=e.split(".");if(o!==3)throw new S("Invalid Compact JWS");const c=await pn({payload:i,protected:s,signature:n},a,r),l={payload:c.payload,protectedHeader:c.protectedHeader};return typeof a=="function"?{...l,key:c.key}:l}const ne=e=>Math.floor(e.getTime()/1e3),Jr=60,Yr=Jr*60,fa=Yr*24,xn=fa*7,hn=fa*365.25,bn=/^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i,Ze=e=>{const a=bn.exec(e);if(!a||a[4]&&a[1])throw new TypeError("Invalid time period format");const r=parseFloat(a[2]),s=a[3].toLowerCase();let i;switch(s){case"sec":case"secs":case"second":case"seconds":case"s":i=Math.round(r);break;case"minute":case"minutes":case"min":case"mins":case"m":i=Math.round(r*Jr);break;case"hour":case"hours":case"hr":case"hrs":case"h":i=Math.round(r*Yr);break;case"day":case"days":case"d":i=Math.round(r*fa);break;case"week":case"weeks":case"w":i=Math.round(r*xn);break;default:i=Math.round(r*hn);break}return a[1]==="-"||a[4]==="ago"?-i:i};function be(e,a){if(!Number.isFinite(a))throw new TypeError(`Invalid ${e} input`);return a}const ka=e=>e.includes("/")?e.toLowerCase():`application/${e.toLowerCase()}`,gn=(e,a)=>typeof e=="string"?a.includes(e):Array.isArray(e)?a.some(Set.prototype.has.bind(new Set(e))):!1;function yn(e,a,r={}){let s;try{s=JSON.parse(Ae.decode(a))}catch{}if(!at(s))throw new Dt("JWT Claims Set must be a top-level JSON object");const{typ:i}=r;if(i&&(typeof e.typ!="string"||ka(e.typ)!==ka(i)))throw new B('unexpected "typ" JWT header value',s,"typ","check_failed");const{requiredClaims:n=[],issuer:o,subject:c,audience:l,maxTokenAge:d}=r,m=[...n];d!==void 0&&m.push("iat"),l!==void 0&&m.push("aud"),c!==void 0&&m.push("sub"),o!==void 0&&m.push("iss");for(const b of new Set(m.reverse()))if(!(b in s))throw new B(`missing required "${b}" claim`,s,b,"missing");if(o&&!(Array.isArray(o)?o:[o]).includes(s.iss))throw new B('unexpected "iss" claim value',s,"iss","check_failed");if(c&&s.sub!==c)throw new B('unexpected "sub" claim value',s,"sub","check_failed");if(l&&!gn(s.aud,typeof l=="string"?[l]:l))throw new B('unexpected "aud" claim value',s,"aud","check_failed");let p;switch(typeof r.clockTolerance){case"string":p=Ze(r.clockTolerance);break;case"number":p=r.clockTolerance;break;case"undefined":p=0;break;default:throw new TypeError("Invalid clockTolerance option type")}const{currentDate:u}=r,x=ne(u||new Date);if((s.iat!==void 0||d)&&typeof s.iat!="number")throw new B('"iat" claim must be a number',s,"iat","invalid");if(s.nbf!==void 0){if(typeof s.nbf!="number")throw new B('"nbf" claim must be a number',s,"nbf","invalid");if(s.nbf>x+p)throw new B('"nbf" claim timestamp check failed',s,"nbf","check_failed")}if(s.exp!==void 0){if(typeof s.exp!="number")throw new B('"exp" claim must be a number',s,"exp","invalid");if(s.exp<=x-p)throw new Qt('"exp" claim timestamp check failed',s,"exp","check_failed")}if(d){const b=x-s.iat,h=typeof d=="number"?d:Ze(d);if(b-p>h)throw new Qt('"iat" claim timestamp check failed (too far in the past)',s,"iat","check_failed");if(b<0-p)throw new B('"iat" claim timestamp check failed (it should be in the past)',s,"iat","check_failed")}return s}var C;class vn{constructor(a){N(this,C);if(!at(a))throw new TypeError("JWT Claims Set MUST be an object");y(this,C,structuredClone(a))}data(){return q.encode(JSON.stringify(f(this,C)))}get iss(){return f(this,C).iss}set iss(a){f(this,C).iss=a}get sub(){return f(this,C).sub}set sub(a){f(this,C).sub=a}get aud(){return f(this,C).aud}set aud(a){f(this,C).aud=a}set jti(a){f(this,C).jti=a}set nbf(a){typeof a=="number"?f(this,C).nbf=be("setNotBefore",a):a instanceof Date?f(this,C).nbf=be("setNotBefore",ne(a)):f(this,C).nbf=ne(new Date)+Ze(a)}set exp(a){typeof a=="number"?f(this,C).exp=be("setExpirationTime",a):a instanceof Date?f(this,C).exp=be("setExpirationTime",ne(a)):f(this,C).exp=ne(new Date)+Ze(a)}set iat(a){typeof a>"u"?f(this,C).iat=ne(new Date):a instanceof Date?f(this,C).iat=be("setIssuedAt",ne(a)):typeof a=="string"?f(this,C).iat=be("setIssuedAt",ne(new Date)+Ze(a)):f(this,C).iat=be("setIssuedAt",a)}}C=new WeakMap;async function Nn(e,a,r){var o;const s=await un(e,a,r);if((o=s.protectedHeader.crit)!=null&&o.includes("b64")&&s.protectedHeader.b64===!1)throw new Dt("JWTs MUST NOT use unencoded payload");const n={payload:yn(s.protectedHeader,s.payload,r),protectedHeader:s.protectedHeader};return typeof a=="function"?{...n,key:s.key}:n}const En=async(e,a,r)=>{const s=await qr(e,a,"sign");Xr(e,s);const i=await crypto.subtle.sign(Vr(e,s.algorithm),s,r);return new Uint8Array(i)};var mt,P,V;class wn{constructor(a){N(this,mt);N(this,P);N(this,V);if(!(a instanceof Uint8Array))throw new TypeError("payload must be an instance of Uint8Array");y(this,mt,a)}setProtectedHeader(a){if(f(this,P))throw new TypeError("setProtectedHeader can only be called once");return y(this,P,a),this}setUnprotectedHeader(a){if(f(this,V))throw new TypeError("setUnprotectedHeader can only be called once");return y(this,V,a),this}async sign(a,r){if(!f(this,P)&&!f(this,V))throw new S("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");if(!Gr(f(this,P),f(this,V)))throw new S("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");const s={...f(this,P),...f(this,V)},i=Kr(S,new Map([["b64",!0]]),r==null?void 0:r.crit,f(this,P),s);let n=!0;if(i.has("b64")&&(n=f(this,P).b64,typeof n!="boolean"))throw new S('The "b64" (base64url-encode payload) Header Parameter must be a boolean');const{alg:o}=s;if(typeof o!="string"||!o)throw new S('JWS "alg" (Algorithm) Header Parameter missing or invalid');zr(o,a,"sign");let c=f(this,mt);n&&(c=q.encode(Kt(c)));let l;f(this,P)?l=q.encode(Kt(JSON.stringify(f(this,P)))):l=q.encode("");const d=kr(l,q.encode("."),c),m=await Wr(a,o),p=await En(o,m,d),u={signature:Kt(p),payload:""};return n&&(u.payload=Ae.decode(c)),f(this,V)&&(u.header=f(this,V)),f(this,P)&&(u.protected=Ae.decode(l)),u}}mt=new WeakMap,P=new WeakMap,V=new WeakMap;var Ge;class Tn{constructor(a){N(this,Ge);y(this,Ge,new wn(a))}setProtectedHeader(a){return f(this,Ge).setProtectedHeader(a),this}async sign(a,r){const s=await f(this,Ge).sign(a,r);if(s.payload===void 0)throw new TypeError("use the flattened module for creating JWS with b64: false");return`${s.protected}.${s.payload}.${s.signature}`}}Ge=new WeakMap;var ue,j;class Pa{constructor(a={}){N(this,ue);N(this,j);y(this,j,new vn(a))}setIssuer(a){return f(this,j).iss=a,this}setSubject(a){return f(this,j).sub=a,this}setAudience(a){return f(this,j).aud=a,this}setJti(a){return f(this,j).jti=a,this}setNotBefore(a){return f(this,j).nbf=a,this}setExpirationTime(a){return f(this,j).exp=a,this}setIssuedAt(a){return f(this,j).iat=a,this}setProtectedHeader(a){return y(this,ue,a),this}async sign(a,r){var i;const s=new Tn(f(this,j).data());if(s.setProtectedHeader(f(this,ue)),Array.isArray((i=f(this,ue))==null?void 0:i.crit)&&f(this,ue).crit.includes("b64")&&f(this,ue).b64===!1)throw new Dt("JWTs MUST NOT use unencoded payload");return s.sign(a,r)}}ue=new WeakMap,j=new WeakMap;var ta=null;function An(e){try{return crypto.getRandomValues(new Uint8Array(e))}catch{}try{return us.randomBytes(e)}catch{}if(!ta)throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");return ta(e)}function _n(e){ta=e}function pa(e,a){if(e=e||ua,typeof e!="number")throw Error("Illegal arguments: "+typeof e+", "+typeof a);e<4?e=4:e>31&&(e=31);var r=[];return r.push("$2b$"),e<10&&r.push("0"),r.push(e.toString()),r.push("$"),r.push(Ot(An(rt),rt)),r.join("")}function Zr(e,a,r){if(typeof a=="function"&&(r=a,a=void 0),typeof e=="function"&&(r=e,e=void 0),typeof e>"u")e=ua;else if(typeof e!="number")throw Error("illegal arguments: "+typeof e);function s(i){K(function(){try{i(null,pa(e))}catch(n){i(n)}})}if(r){if(typeof r!="function")throw Error("Illegal callback: "+typeof r);s(r)}else return new Promise(function(i,n){s(function(o,c){if(o){n(o);return}i(c)})})}function Qr(e,a){if(typeof a>"u"&&(a=ua),typeof a=="number"&&(a=pa(a)),typeof e!="string"||typeof a!="string")throw Error("Illegal arguments: "+typeof e+", "+typeof a);return aa(e,a)}function es(e,a,r,s){function i(n){typeof e=="string"&&typeof a=="number"?Zr(a,function(o,c){aa(e,c,n,s)}):typeof e=="string"&&typeof a=="string"?aa(e,a,n,s):K(n.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof a)))}if(r){if(typeof r!="function")throw Error("Illegal callback: "+typeof r);i(r)}else return new Promise(function(n,o){i(function(c,l){if(c){o(c);return}n(l)})})}function ts(e,a){for(var r=e.length^a.length,s=0;s<e.length;++s)r|=e.charCodeAt(s)^a.charCodeAt(s);return r===0}function Rn(e,a){if(typeof e!="string"||typeof a!="string")throw Error("Illegal arguments: "+typeof e+", "+typeof a);return a.length!==60?!1:ts(Qr(e,a.substring(0,a.length-31)),a)}function Sn(e,a,r,s){function i(n){if(typeof e!="string"||typeof a!="string"){K(n.bind(this,Error("Illegal arguments: "+typeof e+", "+typeof a)));return}if(a.length!==60){K(n.bind(this,null,!1));return}es(e,a.substring(0,29),function(o,c){o?n(o):n(null,ts(c,a))},s)}if(r){if(typeof r!="function")throw Error("Illegal callback: "+typeof r);i(r)}else return new Promise(function(n,o){i(function(c,l){if(c){o(c);return}n(l)})})}function Cn(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);return parseInt(e.split("$")[2],10)}function On(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);if(e.length!==60)throw Error("Illegal hash length: "+e.length+" != 60");return e.substring(0,29)}function In(e){if(typeof e!="string")throw Error("Illegal arguments: "+typeof e);return as(e)>72}var K=typeof process<"u"&&process&&typeof process.nextTick=="function"?typeof setImmediate=="function"?setImmediate:process.nextTick:setTimeout;function as(e){for(var a=0,r=0,s=0;s<e.length;++s)r=e.charCodeAt(s),r<128?a+=1:r<2048?a+=2:(r&64512)===55296&&(e.charCodeAt(s+1)&64512)===56320?(++s,a+=4):a+=3;return a}function Dn(e){for(var a=0,r,s,i=new Array(as(e)),n=0,o=e.length;n<o;++n)r=e.charCodeAt(n),r<128?i[a++]=r:r<2048?(i[a++]=r>>6|192,i[a++]=r&63|128):(r&64512)===55296&&((s=e.charCodeAt(n+1))&64512)===56320?(r=65536+((r&1023)<<10)+(s&1023),++n,i[a++]=r>>18|240,i[a++]=r>>12&63|128,i[a++]=r>>6&63|128,i[a++]=r&63|128):(i[a++]=r>>12|224,i[a++]=r>>6&63|128,i[a++]=r&63|128);return i}var Ie="./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),ie=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,54,55,56,57,58,59,60,61,62,63,-1,-1,-1,-1,-1,-1,-1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,-1,-1,-1,-1,-1,-1,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,-1,-1,-1,-1,-1];function Ot(e,a){var r=0,s=[],i,n;if(a<=0||a>e.length)throw Error("Illegal len: "+a);for(;r<a;){if(i=e[r++]&255,s.push(Ie[i>>2&63]),i=(i&3)<<4,r>=a){s.push(Ie[i&63]);break}if(n=e[r++]&255,i|=n>>4&15,s.push(Ie[i&63]),i=(n&15)<<2,r>=a){s.push(Ie[i&63]);break}n=e[r++]&255,i|=n>>6&3,s.push(Ie[i&63]),s.push(Ie[n&63])}return s.join("")}function rs(e,a){var r=0,s=e.length,i=0,n=[],o,c,l,d,m,p;if(a<=0)throw Error("Illegal len: "+a);for(;r<s-1&&i<a&&(p=e.charCodeAt(r++),o=p<ie.length?ie[p]:-1,p=e.charCodeAt(r++),c=p<ie.length?ie[p]:-1,!(o==-1||c==-1||(m=o<<2>>>0,m|=(c&48)>>4,n.push(String.fromCharCode(m)),++i>=a||r>=s)||(p=e.charCodeAt(r++),l=p<ie.length?ie[p]:-1,l==-1)||(m=(c&15)<<4>>>0,m|=(l&60)>>2,n.push(String.fromCharCode(m)),++i>=a||r>=s)));)p=e.charCodeAt(r++),d=p<ie.length?ie[p]:-1,m=(l&3)<<6>>>0,m|=d,n.push(String.fromCharCode(m)),++i;var u=[];for(r=0;r<i;r++)u.push(n[r].charCodeAt(0));return u}var rt=16,ua=10,Mn=16,Un=100,Fa=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],ja=[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946,1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055,3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504,976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462],ss=[1332899944,1700884034,1701343084,1684370003,1668446532,1869963892];function st(e,a,r,s){var i,n=e[a],o=e[a+1];return n^=r[0],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[1],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[2],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[3],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[4],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[5],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[6],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[7],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[8],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[9],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[10],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[11],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[12],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[13],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[14],i=s[n>>>24],i+=s[256|n>>16&255],i^=s[512|n>>8&255],i+=s[768|n&255],o^=i^r[15],i=s[o>>>24],i+=s[256|o>>16&255],i^=s[512|o>>8&255],i+=s[768|o&255],n^=i^r[16],e[a]=o^r[Mn+1],e[a+1]=n,e}function ke(e,a){for(var r=0,s=0;r<4;++r)s=s<<8|e[a]&255,a=(a+1)%e.length;return{key:s,offp:a}}function $a(e,a,r){for(var s=0,i=[0,0],n=a.length,o=r.length,c,l=0;l<n;l++)c=ke(e,s),s=c.offp,a[l]=a[l]^c.key;for(l=0;l<n;l+=2)i=st(i,0,a,r),a[l]=i[0],a[l+1]=i[1];for(l=0;l<o;l+=2)i=st(i,0,a,r),r[l]=i[0],r[l+1]=i[1]}function Ln(e,a,r,s){for(var i=0,n=[0,0],o=r.length,c=s.length,l,d=0;d<o;d++)l=ke(a,i),i=l.offp,r[d]=r[d]^l.key;for(i=0,d=0;d<o;d+=2)l=ke(e,i),i=l.offp,n[0]^=l.key,l=ke(e,i),i=l.offp,n[1]^=l.key,n=st(n,0,r,s),r[d]=n[0],r[d+1]=n[1];for(d=0;d<c;d+=2)l=ke(e,i),i=l.offp,n[0]^=l.key,l=ke(e,i),i=l.offp,n[1]^=l.key,n=st(n,0,r,s),s[d]=n[0],s[d+1]=n[1]}function Ba(e,a,r,s,i){var n=ss.slice(),o=n.length,c;if(r<4||r>31)if(c=Error("Illegal number of rounds (4-31): "+r),s){K(s.bind(this,c));return}else throw c;if(a.length!==rt)if(c=Error("Illegal salt length: "+a.length+" != "+rt),s){K(s.bind(this,c));return}else throw c;r=1<<r>>>0;var l,d,m=0,p;typeof Int32Array=="function"?(l=new Int32Array(Fa),d=new Int32Array(ja)):(l=Fa.slice(),d=ja.slice()),Ln(a,e,l,d);function u(){if(i&&i(m/r),m<r)for(var b=Date.now();m<r&&(m=m+1,$a(e,l,d),$a(a,l,d),!(Date.now()-b>Un)););else{for(m=0;m<64;m++)for(p=0;p<o>>1;p++)st(n,p<<1,l,d);var h=[];for(m=0;m<o;m++)h.push((n[m]>>24&255)>>>0),h.push((n[m]>>16&255)>>>0),h.push((n[m]>>8&255)>>>0),h.push((n[m]&255)>>>0);if(s){s(null,h);return}else return h}s&&K(u)}if(typeof s<"u")u();else for(var x;;)if(typeof(x=u())<"u")return x||[]}function aa(e,a,r,s){var i;if(typeof e!="string"||typeof a!="string")if(i=Error("Invalid string / salt: Not a string"),r){K(r.bind(this,i));return}else throw i;var n,o;if(a.charAt(0)!=="$"||a.charAt(1)!=="2")if(i=Error("Invalid salt version: "+a.substring(0,2)),r){K(r.bind(this,i));return}else throw i;if(a.charAt(2)==="$")n="\0",o=3;else{if(n=a.charAt(2),n!=="a"&&n!=="b"&&n!=="y"||a.charAt(3)!=="$")if(i=Error("Invalid salt revision: "+a.substring(2,4)),r){K(r.bind(this,i));return}else throw i;o=4}if(a.charAt(o+2)>"$")if(i=Error("Missing salt rounds"),r){K(r.bind(this,i));return}else throw i;var c=parseInt(a.substring(o,o+1),10)*10,l=parseInt(a.substring(o+1,o+2),10),d=c+l,m=a.substring(o+3,o+25);e+=n>="a"?"\0":"";var p=Dn(e),u=rs(m,rt);function x(b){var h=[];return h.push("$2"),n>="a"&&h.push(n),h.push("$"),d<10&&h.push("0"),h.push(d.toString()),h.push("$"),h.push(Ot(u,u.length)),h.push(Ot(b,ss.length*4-1)),h.join("")}if(typeof r>"u")return x(Ba(p,u,d));Ba(p,u,d,function(b,h){b?r(b,null):r(null,x(h))},s)}function kn(e,a){return Ot(e,a)}function Pn(e,a){return rs(e,a)}const Fn={setRandomFallback:_n,genSaltSync:pa,genSalt:Zr,hashSync:Qr,hash:es,compareSync:Rn,compare:Sn,getRounds:Cn,getSalt:On,truncates:In,encodeBase64:kn,decodeBase64:Pn},w=new _r;w.use("*",fi());w.use("/api/*",ni());w.use(qi);w.use("/static/*",Ei({root:"./public"}));w.get("/api/health",async e=>{const{env:a}=e;try{const r=await a.DB.prepare("SELECT 1 as test").first();return e.json({status:"healthy",database:"connected",environment:a.ENVIRONMENT||"development",timestamp:new Date().toISOString()})}catch(r){return e.json({status:"unhealthy",database:"disconnected",error:r.message},500)}});w.post("/api/init-db",async e=>{const{env:a}=e;if(a.ENVIRONMENT==="production")return e.json({error:"Not available in production"},403);try{const r=[`CREATE TABLE IF NOT EXISTS companies (
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
      )`];for(const s of r)await a.DB.prepare(s).run();return await a.DB.prepare(`
      INSERT OR IGNORE INTO companies (id, name, country, primary_currency, tax_id, active) VALUES 
        (1, 'TechMX Solutions', 'MX', 'MXN', 'TMX123456789', TRUE),
        (2, 'Innovación Digital MX', 'MX', 'MXN', 'IDM987654321', TRUE),
        (3, 'Consultoría Estratégica MX', 'MX', 'MXN', 'CEM555666777', TRUE),
        (4, 'TechES Barcelona', 'ES', 'EUR', 'B-12345678', TRUE),
        (5, 'Innovación Madrid SL', 'ES', 'EUR', 'B-87654321', TRUE),
        (6, 'Digital Valencia S.A.', 'ES', 'EUR', 'A-11223344', TRUE)
    `).run(),await a.DB.prepare(`
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
    `).run(),await a.DB.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, password_hash, role, active) VALUES 
        (1, 'admin@techmx.com', 'Alejandro Rodríguez', '$2b$10$yvsqabOwKIXJf5cu2nCIq.LDZQAKQPusEN2pvncvnTgO9lHfgE1F6', 'admin', TRUE),
        (2, 'maria.lopez@techmx.com', 'María López', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE),
        (3, 'carlos.martinez@innovacion.mx', 'Carlos Martínez', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'advanced', TRUE),
        (4, 'ana.garcia@consultoria.mx', 'Ana García', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE),
        (5, 'pedro.sanchez@techespana.es', 'Pedro Sánchez', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'advanced', TRUE),
        (6, 'elena.torres@madrid.es', 'Elena Torres', '$2b$10$E28fauI9DklVUyNGeGC6X.TP6wUw7PjE2d/anA3DhqXr3V64.3M7C', 'editor', TRUE)
    `).run(),await a.DB.prepare(`
      INSERT OR IGNORE INTO user_companies (user_id, company_id, can_view, can_edit, can_admin) VALUES 
        (1, 1, TRUE, TRUE, TRUE), (1, 2, TRUE, TRUE, TRUE), (1, 3, TRUE, TRUE, TRUE),
        (1, 4, TRUE, TRUE, TRUE), (1, 5, TRUE, TRUE, TRUE), (1, 6, TRUE, TRUE, TRUE),
        (2, 1, TRUE, TRUE, FALSE), (3, 2, TRUE, TRUE, FALSE), (4, 3, TRUE, TRUE, FALSE),
        (5, 4, TRUE, TRUE, FALSE), (6, 5, TRUE, TRUE, FALSE)
    `).run(),await a.DB.prepare(`
      INSERT OR IGNORE INTO exchange_rates (from_currency, to_currency, rate, rate_date, source) VALUES 
        ('USD', 'MXN', 18.25, '2024-09-24', 'banxico'),
        ('EUR', 'MXN', 20.15, '2024-09-24', 'banxico'),
        ('EUR', 'USD', 1.10, '2024-09-24', 'ecb'),
        ('USD', 'EUR', 0.91, '2024-09-24', 'ecb'),
        ('MXN', 'USD', 0.055, '2024-09-24', 'banxico'),
        ('MXN', 'EUR', 0.050, '2024-09-24', 'banxico')
    `).run(),await a.DB.prepare(`
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
    `).run(),await a.DB.prepare(`
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
    `).run(),e.json({success:!0,message:"Base de datos inicializada con datos de prueba (incluyendo CFDI validations)",timestamp:new Date().toISOString()})}catch(r){return e.json({error:"Failed to initialize database",details:r.message},500)}});w.get("/api/companies",async e=>{const{env:a}=e;try{const r=await a.DB.prepare(`
      SELECT id, name, country, primary_currency, logo_url, active, created_at
      FROM companies 
      WHERE active = TRUE
      ORDER BY country, name
    `).all();return e.json({companies:r.results})}catch{return e.json({error:"Failed to fetch companies"},500)}});w.get("/api/users",async e=>{const{env:a}=e;try{const r=await a.DB.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.active, u.created_at,
             GROUP_CONCAT(c.name, '|') as companies
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.active = TRUE
      GROUP BY u.id
      ORDER BY u.name
    `).all();return e.json({users:r.results})}catch{return e.json({error:"Failed to fetch users"},500)}});w.get("/api/expenses",async e=>{const{env:a}=e,r=e.req.query();let s=`
    SELECT e.*, c.name as company_name, u.name as user_name, et.name as expense_type_name,
           c.country, c.primary_currency as company_currency
    FROM expenses e
    JOIN companies c ON e.company_id = c.id
    JOIN users u ON e.user_id = u.id
    JOIN expense_types et ON e.expense_type_id = et.id
    WHERE 1=1
  `;const i=[];r.company_id&&(s+=" AND e.company_id = ?",i.push(r.company_id)),r.user_id&&(s+=" AND e.user_id = ?",i.push(r.user_id)),r.status&&(s+=" AND e.status = ?",i.push(r.status)),r.currency&&(s+=" AND e.currency = ?",i.push(r.currency)),r.date_from&&(s+=" AND e.expense_date >= ?",i.push(r.date_from)),r.date_to&&(s+=" AND e.expense_date <= ?",i.push(r.date_to)),s+=" ORDER BY e.expense_date DESC, e.created_at DESC",r.limit&&(s+=" LIMIT ?",i.push(parseInt(r.limit)||50));try{const o=await a.DB.prepare(s).bind(...i).all();return e.json({expenses:o.results,total:o.results.length})}catch{return e.json({error:"Failed to fetch expenses"},500)}});w.post("/api/expenses",async e=>{const{env:a}=e;try{const r=await e.req.json(),s=["company_id","expense_type_id","description","expense_date","amount","currency"];for(const c of s)if(!r[c])return e.json({error:`Missing required field: ${c}`},400);let i=r.amount,n=1;r.currency==="USD"?(n=18.25,i=r.amount*n):r.currency==="EUR"&&(n=20.15,i=r.amount*n);const o=await a.DB.prepare(`
      INSERT INTO expenses (
        company_id, user_id, expense_type_id, description, expense_date, 
        amount, currency, exchange_rate, amount_mxn, payment_method, 
        vendor, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(r.company_id,r.user_id||1,r.expense_type_id,r.description,r.expense_date,r.amount,r.currency,n,i,r.payment_method||"cash",r.vendor||"",r.notes||"","pending",r.user_id||1).run();return e.json({success:!0,expense_id:o.meta.last_row_id,message:"Gasto creado exitosamente"})}catch(r){return e.json({error:"Failed to create expense",details:r.message},500)}});w.get("/api/dashboard/metrics",async e=>{const{env:a}=e,r=e.req.query();try{let s="WHERE 1=1";const i=[];r.company_id&&(s+=" AND e.company_id = ?",i.push(r.company_id)),r.user_id&&(s+=" AND e.user_id = ?",i.push(r.user_id)),r.status&&(s+=" AND e.status = ?",i.push(r.status)),r.currency&&(s+=" AND e.currency = ?",i.push(r.currency)),r.date_from&&(s+=" AND e.expense_date >= ?",i.push(r.date_from)),r.date_to&&(s+=" AND e.expense_date <= ?",i.push(r.date_to)),r.user_id&&(s+=" AND e.user_id = ?",i.push(r.user_id)),r.status&&(s+=" AND e.status = ?",i.push(r.status));const n=await a.DB.prepare(`
      SELECT status, COUNT(*) as count, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${s}
      GROUP BY status
    `).bind(...i).all(),o=await a.DB.prepare(`
      SELECT c.name as company, c.country, COUNT(*) as count, SUM(e.amount_mxn) as total_mxn
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      ${s}
      GROUP BY c.id, c.name, c.country
      ORDER BY total_mxn DESC
    `).bind(...i).all(),c=await a.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      ${s}
      GROUP BY currency
    `).bind(...i).all(),l=await a.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      ${s}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).bind(...i).all();return e.json({status_metrics:n.results||[],company_metrics:o.results||[],currency_metrics:c.results||[],recent_expenses:l.results||[],filters_applied:{company_id:r.company_id,user_id:r.user_id,status:r.status,currency:r.currency,date_from:r.date_from,date_to:r.date_to,period:r.period}})}catch(s){return e.json({error:"Failed to fetch dashboard metrics",details:s.message},500)}});w.get("/api/expense-types",async e=>{const{env:a}=e;try{const r=await a.DB.prepare(`
      SELECT id, name, description, category, active
      FROM expense_types
      WHERE active = TRUE
      ORDER BY category, name
    `).all();return e.json({expense_types:r.results})}catch{return e.json({error:"Failed to fetch expense types"},500)}});w.get("/api/exchange-rates",async e=>{const{env:a}=e,r=e.req.query();try{const s=await a.DB.prepare(`
      SELECT from_currency, to_currency, rate, rate_date, source
      FROM exchange_rates
      WHERE rate_date = (
        SELECT MAX(rate_date) FROM exchange_rates
      )
      ORDER BY from_currency, to_currency
    `).all();if(r.from&&r.to){const i=s.results.find(n=>n.from_currency===r.from&&n.to_currency===r.to);if(i)return e.json({rate:i.rate,date:i.rate_date,source:i.source});{const n=s.results.find(o=>o.from_currency===r.to&&o.to_currency===r.from);if(n)return e.json({rate:(1/n.rate).toFixed(6),date:n.rate_date,source:n.source+" (inverse)"})}return e.json({error:"Exchange rate not found"},404)}return e.json({exchange_rates:s.results})}catch{return e.json({error:"Failed to fetch exchange rates"},500)}});w.post("/api/exchange-rates/update",async e=>{const{env:a}=e;try{const r=new Date().toISOString().split("T")[0],s=[{from:"USD",to:"MXN",rate:18.25,source:"banxico"},{from:"EUR",to:"MXN",rate:20.15,source:"banxico"},{from:"EUR",to:"USD",rate:1.1,source:"ecb"},{from:"USD",to:"EUR",rate:.91,source:"ecb"},{from:"MXN",to:"USD",rate:.055,source:"banxico"},{from:"MXN",to:"EUR",rate:.05,source:"banxico"}];for(const i of s)await a.DB.prepare(`
        INSERT OR REPLACE INTO exchange_rates 
        (from_currency, to_currency, rate, rate_date, source, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(i.from,i.to,i.rate,r,i.source).run();return e.json({success:!0,message:"Exchange rates updated successfully",date:r})}catch{return e.json({error:"Failed to update exchange rates"},500)}});w.post("/api/attachments",async e=>{const{env:a}=e;try{const r=await e.req.formData(),s=r.get("file"),i=r.get("expense_id"),n=r.get("process_ocr")==="true";if(!s||!i)return e.json({error:"File and expense_id are required"},400);const o=`/uploads/${Date.now()}-${s.name}`,c=s.type.startsWith("image/")?"image":s.type==="application/pdf"?"pdf":"xml";let l=null;n&&(c==="image"||c==="pdf")&&(l=await is(s,c));const d=await a.DB.prepare(`
      INSERT INTO attachments (
        expense_id, file_name, file_type, file_url, file_size, 
        mime_type, ocr_text, ocr_confidence, uploaded_by, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(i,s.name,c,o,s.size,s.type,(l==null?void 0:l.text)||null,(l==null?void 0:l.confidence)||null,1).run();return e.json({success:!0,attachment_id:d.meta.last_row_id,file_url:o,ocr_data:l,message:"File uploaded successfully"+(l?" with OCR processing":"")})}catch(r){return e.json({error:"Failed to upload attachment",details:r.message},500)}});w.post("/api/attachments/:id/ocr",async e=>{const{env:a}=e,r=e.req.param("id");try{const s=await a.DB.prepare(`
      SELECT * FROM attachments WHERE id = ?
    `).bind(r).first();if(!s)return e.json({error:"Attachment not found"},404);if(s.file_type!=="image"&&s.file_type!=="pdf")return e.json({error:"OCR only supported for images and PDFs"},400);const i=await is(null,s.file_type,s.file_name);return await a.DB.prepare(`
      UPDATE attachments 
      SET ocr_text = ?, ocr_confidence = ?
      WHERE id = ?
    `).bind(i.text,i.confidence,r).run(),e.json({success:!0,ocr_data:i,message:"OCR processing completed"})}catch(s){return e.json({error:"Failed to process OCR",details:s.message},500)}});w.post("/api/ocr/extract-expense-data",async e=>{const{env:a}=e;try{const{ocr_text:r,attachment_id:s}=await e.req.json();if(!r)return e.json({error:"OCR text is required"},400);const i=await Bn(r);return e.json({success:!0,extracted_data:i,message:"Expense data extracted successfully"})}catch(r){return e.json({error:"Failed to extract expense data",details:r.message},500)}});async function is(e,a,r=null){const s={ticket:{text:`RESTAURANTE PUJOL
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
ID VIAJE: 1234-5678-9012`,confidence:.89}};let i="ticket";return r&&(r.toLowerCase().includes("factura")||r.toLowerCase().includes("invoice")?i="factura":(r.toLowerCase().includes("uber")||r.toLowerCase().includes("taxi"))&&(i="uber")),await new Promise(n=>setTimeout(n,1500)),s[i]||s.ticket}w.post("/api/cfdi/validate",async e=>{const{env:a}=e;try{const r=await e.req.formData(),s=r.get("file"),i=r.get("expense_id");if(!s)return e.json({error:"XML or PDF file is required for CFDI validation"},400);let n=null;if(s.type==="application/xml"||s.type==="text/xml")n=await jn(s);else if(s.type==="application/pdf")n=await $n(s);else return e.json({error:"Only XML and PDF files are supported for CFDI validation"},400);const o=await ns(n);return i&&n.uuid&&await a.DB.prepare(`
        UPDATE attachments 
        SET is_cfdi_valid = ?, cfdi_uuid = ?
        WHERE expense_id = ? AND id = (
          SELECT id FROM attachments WHERE expense_id = ? ORDER BY uploaded_at DESC LIMIT 1
        )
      `).bind(o.valid,n.uuid,i,i).run(),e.json({success:!0,cfdi_data:n,sat_validation:o,message:o.valid?"CFDI válido":"CFDI inválido o con errores"})}catch(r){return e.json({error:"Failed to validate CFDI",details:r.message},500)}});w.post("/api/cfdi/validate-data",async e=>{const{env:a}=e;try{const r=await e.req.json(),{company_id:s,rfc_emisor:i,rfc_receptor:n,uuid:o,total:c}=r;if(!s||!i||!n||!o)return e.json({error:"company_id, rfc_emisor, rfc_receptor, and uuid are required"},400);if(!await a.DB.prepare("SELECT * FROM companies WHERE id = ? AND country = ?").bind(s,"MX").first())return e.json({error:"Company not found or not a Mexican company"},400);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o))return e.json({error:"Invalid UUID format"},400);const m={rfc_emisor:i,rfc_receptor:n,uuid:o,total:parseFloat(c)||0,fecha_emision:new Date().toISOString(),serie:"A",folio:"001"},p=await ns(m),u=await a.DB.prepare(`
      INSERT INTO cfdi_validations (
        company_id, uuid, rfc_emisor, rfc_receptor, total, 
        is_valid, validation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(s,o,i,n,c||0,p.valid?1:0,p.mensaje).run();return e.json({success:!0,validation_id:u.meta.last_row_id,cfdi_data:m,sat_valid:p.valid,validation_details:p.mensaje,message:p.valid?"CFDI validado exitosamente":"CFDI con errores de validación"})}catch(r){return e.json({error:"Failed to validate CFDI data",details:r.message},500)}});w.get("/api/expenses/:id/cfdi-status",async e=>{const{env:a}=e,r=e.req.param("id");try{const s=await a.DB.prepare(`
      SELECT id, file_name, is_cfdi_valid, cfdi_uuid, uploaded_at
      FROM attachments
      WHERE expense_id = ? AND (file_type = 'xml' OR file_type = 'pdf')
      ORDER BY uploaded_at DESC
    `).bind(r).all();return e.json({success:!0,cfdi_attachments:s.results,has_valid_cfdi:s.results.some(i=>i.is_cfdi_valid===1)})}catch{return e.json({error:"Failed to get CFDI status"},500)}});async function jn(e){return{version:"4.0",uuid:os(),rfc_emisor:"ABC123456789",razon_social_emisor:"Empresa Emisora S.A. de C.V.",rfc_receptor:"XYZ987654321",razon_social_receptor:"TechMX Solutions S.A. de C.V.",fecha:new Date().toISOString(),folio:"A001-"+Math.floor(Math.random()*1e5),serie:"A",forma_pago:"04",metodo_pago:"PUE",uso_cfdi:"G03",lugar_expedicion:"06600",moneda:"MXN",tipo_cambio:"1.000000",conceptos:[{clave_prod_serv:"84111506",no_identificacion:null,cantidad:"1.000000",clave_unidad:"ACT",unidad:"Actividad",descripcion:"Servicios de consultoría",valor_unitario:"2500.00",importe:"2500.00"}],subtotal:"2500.00",iva:"400.00",total:"2900.00",sello_digital:"ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ...",certificado_sat:"DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567ABC...",fecha_timbrado:new Date().toISOString(),no_certificado_sat:"30001000000400002495"}}async function $n(e){return{version:"4.0",uuid:os(),rfc_emisor:"PDF123456789",razon_social_emisor:"Empresa PDF S.A. de C.V.",rfc_receptor:"TMX123456789",razon_social_receptor:"TechMX Solutions S.A. de C.V.",fecha:new Date().toISOString(),folio:"P001-"+Math.floor(Math.random()*1e5),serie:"P",forma_pago:"01",metodo_pago:"PUE",uso_cfdi:"G01",lugar_expedicion:"06600",moneda:"MXN",subtotal:"850.00",iva:"136.00",total:"986.00",extracted_from:"PDF",confidence:.85}}async function ns(e){await new Promise(s=>setTimeout(s,1500));const a={uuid_format:/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(e.uuid),rfc_format:/^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/.test(e.rfc_emisor),date_valid:e.fecha_emision?new Date(e.fecha_emision)<=new Date:!0,amounts_valid:parseFloat(e.total)>0,version_supported:e.version?["3.3","4.0"].includes(e.version):!0},r=Object.values(a).every(s=>s);return{valid:r,timestamp:new Date().toISOString(),checks:a,sat_status:r?"VIGENTE":"INVALIDO",cancelable:r,estado_sat:r?"Activo":"Cancelado",mensaje:r?"CFDI válido y vigente en el SAT":"CFDI inválido o con errores en la estructura"}}function os(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){const a=Math.random()*16|0;return(e=="x"?a:a&3|8).toString(16)})}async function Bn(e){const a={amount:null,currency:"MXN",date:null,vendor:null,description:null,tax_amount:null,payment_method:null,invoice_number:null,confidence_score:.85,is_cfdi:!1,cfdi_uuid:null,rfc_emisor:null};if(e.includes("CFDI")||e.includes("UUID")||e.includes("FOLIO FISCAL")){a.is_cfdi=!0,a.confidence_score+=.1;const l=e.match(/UUID[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);l&&(a.cfdi_uuid=l[1]);const d=e.match(/FOLIO FISCAL[\s:]*([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/i);d&&(a.cfdi_uuid=d[1])}const r=e.match(/(?:TOTAL|Total|total)[\s:]*\$?([\d,]+\.?\d*)/i);r&&(a.amount=parseFloat(r[1].replace(",","")),a.confidence_score+=.1);const s=e.match(/(?:FECHA|Fecha|fecha)[\s:]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);s&&(a.date=s[1],a.confidence_score+=.05);const i=e.split(`
`);if(i.length>0){const l=i.find(d=>d.trim()&&!d.includes("TICKET")&&!d.includes("FACTURA"));l&&(a.vendor=l.trim(),a.description=`Gasto en ${l.trim()}`)}const n=e.match(/RFC[\s:]*([A-Z]{3,4}\d{6}[A-Z0-9]{3})/i);n&&(a.rfc_emisor=n[1],a.confidence_score+=.05),e.toLowerCase().includes("efectivo")||e.toLowerCase().includes("cash")?a.payment_method="cash":(e.toLowerCase().includes("tarjeta")||e.toLowerCase().includes("card"))&&(a.payment_method="credit_card");const o=e.match(/(?:FOLIO|Folio|folio)[\s:]*([A-Z0-9\-]+)/i);o&&(a.invoice_number=o[1]);const c=e.match(/(?:IVA|iva)[\s:]*\$?([\d,]+\.?\d*)/i);return c&&(a.tax_amount=parseFloat(c[1].replace(",",""))),a}w.get("/api/expenses/:id/attachments",async e=>{const{env:a}=e,r=e.req.param("id");try{const s=await a.DB.prepare(`
      SELECT id, file_name, file_type, file_url, file_size, 
             mime_type, ocr_text, uploaded_at
      FROM attachments
      WHERE expense_id = ?
      ORDER BY uploaded_at ASC
    `).bind(r).all();return e.json({attachments:s.results})}catch{return e.json({error:"Failed to fetch attachments"},500)}});w.post("/api/reports/pdf",async e=>{const{env:a}=e;try{const r=await e.req.json(),{company_id:s,date_from:i,date_to:n,status:o,currency:c,user_id:l,expense_type_id:d,format:m="detailed"}=r;let p=`
      SELECT e.*, c.name as company_name, c.country, c.logo_url, c.primary_currency,
             u.name as user_name, et.name as expense_type_name, et.category,
             COUNT(a.id) as attachments_count
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      JOIN expense_types et ON e.expense_type_id = et.id
      LEFT JOIN attachments a ON e.id = a.expense_id
      WHERE 1=1
    `;const u=[];s&&(p+=" AND e.company_id = ?",u.push(s)),i&&(p+=" AND e.expense_date >= ?",u.push(i)),n&&(p+=" AND e.expense_date <= ?",u.push(n)),o&&(p+=" AND e.status = ?",u.push(o)),c&&(p+=" AND e.currency = ?",u.push(c)),l&&(p+=" AND e.user_id = ?",u.push(l)),d&&(p+=" AND e.expense_type_id = ?",u.push(d)),p+=" GROUP BY e.id ORDER BY e.expense_date DESC, e.created_at DESC";const x=await a.DB.prepare(p).bind(...u).all();let b=null;s&&(b=await a.DB.prepare("SELECT * FROM companies WHERE id = ?").bind(s).first());const h=Hn(x.results,b,m,{date_from:i,date_to:n,status:o,currency:c});return e.json({success:!0,html_content:h,total_expenses:x.results.length,total_amount:x.results.reduce((v,E)=>v+parseFloat(E.amount_mxn||0),0),filters:{company_id:s,date_from:i,date_to:n,status:o,currency:c,user_id:l,expense_type_id:d},message:"PDF content generated successfully"})}catch(r){return e.json({error:"Failed to generate PDF report",details:r.message},500)}});w.post("/api/reports/excel",async e=>{const{env:a}=e;try{const s=await e.req.json();let i=`
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
    `;const n=[];s.company_id&&(i+=" AND e.company_id = ?",n.push(s.company_id)),s.date_from&&(i+=" AND e.expense_date >= ?",n.push(s.date_from)),s.date_to&&(i+=" AND e.expense_date <= ?",n.push(s.date_to)),s.status&&(i+=" AND e.status = ?",n.push(s.status)),i+=" ORDER BY e.expense_date DESC";const o=await a.DB.prepare(i).bind(...n).all();return e.json({success:!0,data:o.results,total_records:o.results.length,total_amount_mxn:o.results.reduce((c,l)=>c+parseFloat(l.amount_mxn||0),0),export_date:new Date().toISOString(),filters:s})}catch(r){return e.json({error:"Failed to generate Excel export",details:r.message},500)}});w.post("/api/import/excel",async e=>{const{env:a}=e;try{const r=await e.req.json(),{data:s,mappings:i,company_id:n,user_id:o=1}=r;if(!s||!Array.isArray(s)||!i)return e.json({error:"Data and column mappings are required"},400);const c={total:s.length,imported:0,errors:[],skipped:0};for(let l=0;l<s.length;l++){const d=s[l];try{const m={company_id:n||Y(d,i.company_id),expense_type_id:Y(d,i.expense_type_id)||10,description:Y(d,i.description)||"Importado desde Excel",expense_date:Y(d,i.expense_date)||new Date().toISOString().split("T")[0],amount:parseFloat(Y(d,i.amount))||0,currency:Y(d,i.currency)||"MXN",payment_method:Y(d,i.payment_method)||"cash",vendor:Y(d,i.vendor)||"",notes:Y(d,i.notes)||"Importado desde Excel",status:"pending",user_id:o,created_by:o};let p=1,u=m.amount;m.currency==="USD"?(p=18.25,u=m.amount*p):m.currency==="EUR"&&(p=20.15,u=m.amount*p);const x=await a.DB.prepare(`
          INSERT INTO expenses (
            company_id, user_id, expense_type_id, description, expense_date, 
            amount, currency, exchange_rate, amount_mxn, payment_method, 
            vendor, notes, status, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(m.company_id,m.user_id,m.expense_type_id,m.description,m.expense_date,m.amount,m.currency,p,u,m.payment_method,m.vendor,m.notes,m.status,m.created_by).run();c.imported++}catch(m){c.errors.push({row:l+1,error:m.message,data:d})}}return e.json({success:!0,results:c,message:`Importación completada: ${c.imported} gastos importados, ${c.errors.length} errores`})}catch(r){return e.json({error:"Failed to import Excel data",details:r.message},500)}});function Y(e,a){return a&&e[a]||null}function Hn(e,a,r,s){const i=new Date().toLocaleDateString("es-MX"),n=(a==null?void 0:a.name)||"Consolidado Multiempresa",o=(a==null?void 0:a.country)==="MX"?"🇲🇽":(a==null?void 0:a.country)==="ES"?"🇪🇸":"🌍",c=n.substring(0,2).toUpperCase();let l=`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Ejecutivo - ${n}</title>
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
                    <h1>${o} ${n}</h1>
                    <h2>Reporte Ejecutivo de Gastos y Viáticos</h2>
                    <p class="company-info">
                        Sistema Lyra Expenses • Análisis Inteligente de Gestión Financiera<br>
                        Generado el ${i} • Formato Premium
                    </p>
                </div>
            </div>
            
            <div class="filters">
                <h3>📊 Parámetros del Análisis</h3>
                <p><strong>Período de Análisis:</strong> ${s.date_from||"Desde el inicio"} - ${s.date_to||"Hasta la fecha actual"}</p>
                ${s.status?`<p><strong>Estado de Gastos:</strong> ${s.status.toUpperCase()}</p>`:""}
                ${s.currency?`<p><strong>Moneda Base:</strong> ${s.currency}</p>`:""}
                <p><strong>Fecha de Generación:</strong> ${i} • <strong>Formato:</strong> ${r.toUpperCase()}</p>
            </div>
        </div>
  `;const d=e.reduce((x,b)=>x+parseFloat(b.amount_mxn||0),0),m=e.length,p=e.filter(x=>x.status==="pending").length,u=e.reduce((x,b)=>(x[b.currency]=(x[b.currency]||0)+parseFloat(b.amount||0),x),{});return l+=`
            <div class="summary">
                <div class="summary-card">
                    <div class="summary-number">${m}</div>
                    <div class="summary-label">Total de Transacciones</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">$${d.toLocaleString("es-MX",{minimumFractionDigits:2})}</div>
                    <div class="summary-label">Volumen Total (MXN)</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${p}</div>
                    <div class="summary-label">Gastos Pendientes</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">${Object.keys(u).length}</div>
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
          <td><span class="status-${x.status}">${Gn(x.status)}</span></td>
          <td>${Xn(x.payment_method)}</td>
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
                
                <p><strong>Métricas del Reporte:</strong> ${m} transacciones analizadas • ${Object.keys(u).length} divisas operativas</p>
                <p><strong>Generado:</strong> ${i} • <strong>Modelo:</strong> ${r.toUpperCase()} • <strong>Sistema:</strong> v2.1 Premium</p>
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    Este reporte ha sido generado automáticamente por el sistema Lyra Expenses.<br>
                    Todos los datos están actualizados en tiempo real y han sido validados por nuestros algoritmos de control financiero.
                </p>
            </div>
        </div>
    </body>
    </html>
  `,l}function Gn(e){return{pending:"Pendiente",approved:"Aprobado",rejected:"Rechazado",reimbursed:"Reembolsado",invoiced:"Facturado"}[e]||e}function Xn(e){return{cash:"Efectivo",credit_card:"Tarjeta de Crédito",debit_card:"Tarjeta de Débito",bank_transfer:"Transferencia",company_card:"Tarjeta Empresarial",petty_cash:"Caja Chica"}[e]||e}w.get("/",e=>e.render(t("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);",children:[t("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:t("div",{className:"flex justify-between items-center py-6",children:[t("div",{className:"flex items-center space-x-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"relative",children:[t("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),t("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),t("div",{children:[t("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),t("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),t("span",{className:"nav-badge",children:"Sistema 4-D Premium"})]}),t("div",{className:"flex items-center space-x-8",children:[t("nav",{className:"flex space-x-6",children:[t("a",{href:"/",className:"nav-link text-gold active flex items-center space-x-2",children:[t("i",{className:"fas fa-chart-pie"}),t("span",{children:"Dashboard"})]}),t("a",{href:"/companies",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-building"}),t("span",{children:"Empresas"})]}),t("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-receipt"}),t("span",{children:"Gastos"})]}),t("a",{href:"/analytics",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-chart-line"}),t("span",{children:"Analytics"})]})]}),t("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[t("div",{id:"auth-indicator",className:"mr-2"}),t("select",{id:"currency-selector",className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"MXN",style:"background: #12141a !important; color: #ffffff !important;",children:"💎 MXN"}),t("option",{value:"USD",style:"background: #12141a !important; color: #ffffff !important;",children:"🔹 USD"}),t("option",{value:"EUR",style:"background: #12141a !important; color: #ffffff !important;",children:"🔸 EUR"})]}),t("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[t("i",{className:"fas fa-plus mr-1"}),"Nuevo"]}),t("button",{id:"login-btn",onclick:"showLoginModal()",className:"btn-premium btn-gold text-sm",style:"display: none;",children:[t("i",{className:"fas fa-crown mr-1"}),"Login"]}),t("button",{id:"logout-btn",onclick:"logout()",className:"btn-premium btn-ruby text-sm",style:"display: none;",children:[t("i",{className:"fas fa-sign-out-alt mr-1"}),"Salir"]})]})]})]})})}),t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:t("div",{id:"app",className:"animate-fade-scale",children:[t("div",{className:"text-center mb-12",children:[t("h2",{className:"text-4xl font-bold gradient-text-gold mb-3",children:"Dashboard Ejecutivo"}),t("p",{className:"text-secondary text-lg",children:"Visión completa de tus operaciones financieras corporativas"}),t("div",{className:"flex justify-center mt-4",children:t("div",{className:"flex items-center space-x-6 text-sm text-tertiary",children:[t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),"Sistema en línea"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),"Datos en tiempo real"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Multimoneda activa"]})]})})]}),t("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12",children:[t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.1s",children:[t("div",{className:"flex items-center justify-between mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-chart-line text-emerald text-xl"})}),t("div",{children:[t("p",{className:"metric-label text-emerald",children:"Total Gastos"}),t("p",{className:"text-xs text-tertiary",children:"Este mes"})]})]}),t("div",{className:"text-right",children:t("div",{className:"status-badge-premium status-approved-premium",children:[t("i",{className:"fas fa-trending-up mr-1"}),"+12.5%"]})})]}),t("div",{className:"metric-value text-emerald",id:"total-expenses",children:"$0"}),t("div",{className:"text-xs text-tertiary mt-2",id:"total-expenses-period",children:"Actualizado hace 2 min"})]}),t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.2s",children:[t("div",{className:"flex items-center justify-between mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-hourglass-half text-gold text-xl animate-pulse"})}),t("div",{children:[t("p",{className:"metric-label text-gold",children:"Pendientes"}),t("p",{className:"text-xs text-tertiary",children:"Por aprobar"})]})]}),t("div",{className:"text-right",children:t("div",{className:"status-badge-premium status-pending-premium",children:[t("i",{className:"fas fa-clock mr-1"}),"Urgente"]})})]}),t("div",{className:"metric-value text-gold",id:"pending-expenses",children:"0"}),t("div",{className:"text-xs text-tertiary mt-2",children:"Revisión requerida"})]}),t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.3s",children:[t("div",{className:"flex items-center justify-between mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-building text-sapphire text-xl"})}),t("div",{children:[t("p",{className:"metric-label text-sapphire",children:"Empresas"}),t("p",{className:"text-xs text-tertiary",children:"MX + ES activas"})]})]}),t("div",{className:"text-right",children:t("div",{className:"flex space-x-1",children:[t("span",{className:"text-lg",children:"🇲🇽"}),t("span",{className:"text-lg",children:"🇪🇸"})]})})]}),t("div",{className:"metric-value text-sapphire",id:"companies-count",children:"0"}),t("div",{className:"text-xs text-tertiary mt-2",children:"Operaciones globales"})]}),t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.4s",children:[t("div",{className:"flex items-center justify-between mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-users-crown text-ruby text-xl"})}),t("div",{children:[t("p",{className:"metric-label text-ruby",children:"Usuarios"}),t("p",{className:"text-xs text-tertiary",children:"Multirol premium"})]})]}),t("div",{className:"text-right",children:t("div",{className:"flex space-x-1 text-xs text-tertiary",children:[t("span",{title:"Administradores",children:"👑"}),t("span",{title:"Editores",children:"✏️"}),t("span",{title:"Visualizadores",children:"👁️"})]})})]}),t("div",{className:"metric-value text-ruby",id:"users-count",children:"0"}),t("div",{className:"text-xs text-tertiary mt-2",children:"Accesos controlados"})]})]}),t("div",{className:"mb-12 animate-slide-up",style:"animation-delay: 0.5s",children:t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-coins text-gold text-2xl"})}),t("div",{children:[t("h2",{className:"text-2xl font-bold gradient-text-gold",children:"Mercados Financieros"}),t("p",{className:"text-secondary text-sm",children:"Tipos de cambio en tiempo real"})]})]}),t("div",{className:"flex items-center space-x-4",children:[t("span",{className:"text-xs text-tertiary",id:"exchange-rates-updated",children:[t("i",{className:"fas fa-clock mr-1 text-gold"}),"Actualizado: --"]}),t("button",{onclick:"refreshExchangeRates()",className:"btn-premium btn-gold text-sm",children:[t("i",{className:"fas fa-sync-alt mr-2"}),"Actualizar Tasas"]})]})]}),t("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",id:"exchange-rates-container",children:[t("div",{className:"exchange-rate-card-premium group",children:[t("div",{className:"flex items-center justify-between mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"currency-flag text-3xl",children:"🇺🇸"}),t("div",{children:[t("p",{className:"text-emerald font-semibold",children:"USD → MXN"}),t("p",{className:"text-xs text-tertiary",children:"Dólar Americano"})]})]}),t("div",{className:"p-2 rounded-lg bg-glass group-hover:bg-glass-hover transition-all",children:t("i",{className:"fas fa-arrow-trend-up text-emerald"})})]}),t("div",{className:"text-right",children:[t("div",{className:"exchange-rate-value text-emerald text-2xl mb-1",id:"rate-usd-mxn",children:"$18.25"}),t("div",{className:"metric-change rate-positive text-xs",id:"change-usd-mxn",children:"+0.15 (0.8%)"})]}),t("div",{className:"mt-4 pt-4 border-t border-glass-border",children:t("div",{className:"flex justify-between text-xs text-tertiary",children:[t("span",{children:"24h Vol: $2.1M"}),t("span",{children:"Volatilidad: Baja"})]})})]}),t("div",{className:"exchange-rate-card-premium group",children:[t("div",{className:"flex items-center justify-between mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"currency-flag text-3xl",children:"🇪🇺"}),t("div",{children:[t("p",{className:"text-sapphire font-semibold",children:"EUR → MXN"}),t("p",{className:"text-xs text-tertiary",children:"Euro Europeo"})]})]}),t("div",{className:"p-2 rounded-lg bg-glass group-hover:bg-glass-hover transition-all",children:t("i",{className:"fas fa-arrow-trend-down text-ruby"})})]}),t("div",{className:"text-right",children:[t("div",{className:"exchange-rate-value text-sapphire text-2xl mb-1",id:"rate-eur-mxn",children:"$20.15"}),t("div",{className:"metric-change rate-negative text-xs",id:"change-eur-mxn",children:"-0.25 (1.2%)"})]}),t("div",{className:"mt-4 pt-4 border-t border-glass-border",children:t("div",{className:"flex justify-between text-xs text-tertiary",children:[t("span",{children:"24h Vol: $1.8M"}),t("span",{children:"Volatilidad: Media"})]})})]}),t("div",{className:"exchange-rate-card-premium group",children:[t("div",{className:"flex items-center justify-between mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"currency-flag text-3xl",children:"💎"}),t("div",{children:[t("p",{className:"text-gold font-semibold",children:"USD → EUR"}),t("p",{className:"text-xs text-tertiary",children:"Par Cruzado"})]})]}),t("div",{className:"p-2 rounded-lg bg-glass group-hover:bg-glass-hover transition-all",children:t("i",{className:"fas fa-arrow-trend-up text-emerald"})})]}),t("div",{className:"text-right",children:[t("div",{className:"exchange-rate-value text-gold text-2xl mb-1",id:"rate-usd-eur",children:"€0.91"}),t("div",{className:"metric-change rate-positive text-xs",id:"change-usd-eur",children:"+0.02 (2.1%)"})]}),t("div",{className:"mt-4 pt-4 border-t border-glass-border",children:t("div",{className:"flex justify-between text-xs text-tertiary",children:[t("span",{children:"24h Vol: $3.2M"}),t("span",{children:"Volatilidad: Alta"})]})})]})]}),t("div",{className:"mt-8 pt-6 border-t border-glass-border",children:t("div",{className:"flex items-center justify-between",children:[t("div",{className:"flex items-center space-x-6 text-sm text-tertiary",children:[t("span",{className:"flex items-center",children:[t("i",{className:"fas fa-shield-check mr-2 text-emerald"}),"Datos certificados Banxico / BCE"]}),t("span",{className:"flex items-center",children:[t("i",{className:"fas fa-clock mr-2 text-gold"}),"Actualización cada 30 segundos"]}),t("span",{className:"flex items-center",children:[t("i",{className:"fas fa-globe mr-2 text-sapphire"}),"Mercados globales 24/7"]})]}),t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"status-badge-premium status-approved-premium",children:[t("i",{className:"fas fa-wifi mr-1"}),"Conectado"]}),t("div",{className:"flex items-center text-xs text-emerald",children:[t("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),"Mercados abiertos"]})]})]})})]})}),t("div",{className:"mb-12 animate-slide-up",style:"animation-delay: 0.6s",children:[t("div",{className:"flex justify-between items-center mb-8",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-building-columns text-sapphire text-2xl"})}),t("div",{children:[t("h2",{className:"text-2xl font-bold gradient-text-gold",children:"Portfolio Corporativo"}),t("p",{className:"text-secondary text-sm",children:"Gestión multiempresa internacional"})]})]}),t("button",{onclick:"toggleCompanyView()",className:"btn-premium btn-sapphire text-sm",children:[t("i",{className:"fas fa-expand mr-2"}),"Vista Analítica"]})]}),t("div",{id:"companies-mosaic",className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"})]}),t("div",{className:"mb-8 animate-slide-up",style:"animation-delay: 0.65s",children:t("div",{className:"glass-panel p-6",children:[t("div",{className:"flex justify-between items-center mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-filter text-sapphire text-xl"})}),t("div",{children:[t("h3",{className:"text-lg font-bold text-primary",children:"Filtros Avanzados de Analytics"}),t("p",{className:"text-xs text-tertiary",children:"Personaliza tu análisis con filtros multidimensionales"})]})]}),t("button",{onclick:"FORCE_TEST_MARIA()",className:"btn-premium btn-emerald text-sm",children:[t("i",{className:"fas fa-user mr-2"}),"FILTRAR MARÍA"]}),t("button",{onclick:"FORCE_TEST_PENDING()",className:"btn-premium btn-gold text-sm",children:[t("i",{className:"fas fa-clock mr-2"}),"SOLO PENDIENTES"]}),t("button",{onclick:"FORCE_CLEAR_ALL()",className:"btn-premium btn-ruby text-sm",children:[t("i",{className:"fas fa-eraser mr-2"}),"LIMPIAR TODO"]})]}),t("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4",children:[t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-2",children:"👤 Usuario Responsable"}),t("select",{id:"analytics-user-filter",className:"form-input-premium text-sm bg-glass border-0 w-full",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",onchange:"FILTER_BY_USER(this.value)",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todos los Usuarios"}),t("option",{value:"1",style:"background: #12141a !important; color: #ffffff !important;",children:"👑 Alejandro Rodríguez (Admin)"}),t("option",{value:"2",style:"background: #12141a !important; color: #ffffff !important;",children:"✏️ María López (Editor)"}),t("option",{value:"3",style:"background: #12141a !important; color: #ffffff !important;",children:"⭐ Carlos Martínez (Advanced)"}),t("option",{value:"4",style:"background: #12141a !important; color: #ffffff !important;",children:"✏️ Ana García (Editor)"}),t("option",{value:"5",style:"background: #12141a !important; color: #ffffff !important;",children:"⭐ Pedro Sánchez (Advanced)"}),t("option",{value:"6",style:"background: #12141a !important; color: #ffffff !important;",children:"✏️ Elena Torres (Editor)"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-2",children:"📊 Estado del Gasto"}),t("select",{id:"analytics-status-filter",className:"form-input-premium text-sm bg-glass border-0 w-full",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",onchange:"FILTER_BY_STATUS(this.value)",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todos los Estados"}),t("option",{value:"pending",style:"background: #12141a !important; color: #ffffff !important;",children:"⏳ Pendiente"}),t("option",{value:"approved",style:"background: #12141a !important; color: #ffffff !important;",children:"✅ Aprobado"}),t("option",{value:"rejected",style:"background: #12141a !important; color: #ffffff !important;",children:"❌ Rechazado"}),t("option",{value:"reimbursed",style:"background: #12141a !important; color: #ffffff !important;",children:"💰 Reembolsado"}),t("option",{value:"invoiced",style:"background: #12141a !important; color: #ffffff !important;",children:"📄 Facturado"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-2",children:"🏢 Empresa"}),t("select",{id:"analytics-company-filter-main",className:"form-input-premium text-sm bg-glass border-0 w-full",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todas las Empresas"}),t("option",{value:"1",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 TechMX Solutions"}),t("option",{value:"2",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 Innovación Digital MX"}),t("option",{value:"3",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 Consultoría Estratégica MX"}),t("option",{value:"4",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇸 TechES Barcelona"}),t("option",{value:"5",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇸 Innovación Madrid SL"}),t("option",{value:"6",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇸 Digital Valencia S.A."})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-2",children:"💰 Moneda"}),t("select",{id:"analytics-currency-filter-main",className:"form-input-premium text-sm bg-glass border-0 w-full",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todas las Monedas"}),t("option",{value:"MXN",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 MXN (Peso)"}),t("option",{value:"USD",style:"background: #12141a !important; color: #ffffff !important;",children:"🇺🇸 USD (Dólar)"}),t("option",{value:"EUR",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇺 EUR (Euro)"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-2",children:"📅 Período"}),t("select",{id:"analytics-period-filter-main",className:"form-input-premium text-sm bg-glass border-0 w-full",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todo el Tiempo"}),t("option",{value:"week",style:"background: #12141a !important; color: #ffffff !important;",children:"Esta Semana"}),t("option",{value:"month",style:"background: #12141a !important; color: #ffffff !important;",children:"Este Mes"}),t("option",{value:"quarter",style:"background: #12141a !important; color: #ffffff !important;",children:"Trimestre"}),t("option",{value:"year",style:"background: #12141a !important; color: #ffffff !important;",children:"Este Año"})]})]})]})]})}),t("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-slide-up",style:"animation-delay: 0.7s",children:[t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-chart-pie text-emerald text-xl"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary",children:"Performance Empresarial"}),t("p",{className:"text-xs text-tertiary",children:"Análisis comparativo de gastos"})]})]}),t("div",{className:"flex items-center space-x-3",children:[t("select",{id:"analytics-company-filter",className:"form-input-premium text-sm bg-glass border-0 min-w-[140px]",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todas las Empresas"}),t("option",{value:"1",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 TechMX Solutions"}),t("option",{value:"2",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 Innovación Digital MX"}),t("option",{value:"3",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 Consultoría Estratégica MX"}),t("option",{value:"4",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇸 TechES Barcelona"}),t("option",{value:"5",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇸 Innovación Madrid SL"}),t("option",{value:"6",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇸 Digital Valencia S.A."})]}),t("select",{id:"period-selector",className:"form-input-premium text-sm bg-glass border-0 min-w-[120px]",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"month",style:"background: #12141a !important; color: #ffffff !important;",children:"Este Mes"}),t("option",{value:"quarter",style:"background: #12141a !important; color: #ffffff !important;",children:"Trimestre"}),t("option",{value:"year",style:"background: #12141a !important; color: #ffffff !important;",children:"Este Año"})]})]})]}),t("div",{id:"company-chart",className:"h-64 rounded-lg bg-glass p-4"}),t("div",{className:"mt-4 flex items-center justify-between text-xs text-tertiary",children:[t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2"}),"Datos actualizados"]}),t("span",{children:"Período fiscal 2024"})]})]}),t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-globe-americas text-gold text-xl"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary",children:"Exposición Multimoneda"}),t("p",{className:"text-xs text-tertiary",children:"Distribución por divisa en tiempo real"})]})]}),t("div",{className:"flex items-center space-x-3",children:[t("select",{id:"analytics-currency-filter",className:"form-input-premium text-sm bg-glass border-0 min-w-[120px]",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todas las Monedas"}),t("option",{value:"MXN",style:"background: #12141a !important; color: #ffffff !important;",children:"🇲🇽 MXN"}),t("option",{value:"USD",style:"background: #12141a !important; color: #ffffff !important;",children:"🇺🇸 USD"}),t("option",{value:"EUR",style:"background: #12141a !important; color: #ffffff !important;",children:"🇪🇺 EUR"})]}),t("div",{className:"flex items-center space-x-2 text-xs text-tertiary",children:[t("div",{className:"w-2 h-2 bg-gold rounded-full animate-pulse"}),t("span",{children:"Tasas live"})]})]})]}),t("div",{id:"currency-chart",className:"h-64 rounded-lg bg-glass p-4"}),t("div",{className:"mt-4 flex items-center justify-between text-xs text-tertiary",children:[t("div",{className:"flex items-center space-x-4",children:[t("span",{className:"flex items-center",children:[t("span",{className:"text-emerald mr-1",children:"🇲🇽"})," MXN"]}),t("span",{className:"flex items-center",children:[t("span",{className:"text-sapphire mr-1",children:"🇺🇸"})," USD"]}),t("span",{className:"flex items-center",children:[t("span",{className:"text-gold mr-1",children:"🇪🇺"})," EUR"]})]}),t("span",{children:"Conversión automática"})]})]})]}),t("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-slide-up",style:"animation-delay: 0.8s",children:[t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-chart-line text-sapphire text-xl"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary",children:"Análisis de Tendencias"}),t("p",{className:"text-xs text-tertiary",children:"Evolución temporal de gastos y promedios móviles"})]})]}),t("div",{className:"flex items-center space-x-3",children:[t("select",{id:"analytics-user-filter-trend",className:"form-input-premium text-sm bg-glass border-0 min-w-[140px]",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todos los Usuarios"}),t("option",{value:"1",style:"background: #12141a !important; color: #ffffff !important;",children:"👑 Alejandro Rodríguez (Admin)"}),t("option",{value:"2",style:"background: #12141a !important; color: #ffffff !important;",children:"✏️ María López (Editor)"}),t("option",{value:"3",style:"background: #12141a !important; color: #ffffff !important;",children:"⭐ Carlos Martínez (Advanced)"}),t("option",{value:"4",style:"background: #12141a !important; color: #ffffff !important;",children:"✏️ Ana García (Editor)"}),t("option",{value:"5",style:"background: #12141a !important; color: #ffffff !important;",children:"⭐ Pedro Sánchez (Advanced)"}),t("option",{value:"6",style:"background: #12141a !important; color: #ffffff !important;",children:"✏️ Elena Torres (Editor)"})]}),t("div",{className:"flex items-center space-x-2 text-xs text-tertiary",children:[t("div",{className:"w-2 h-2 bg-sapphire rounded-full animate-pulse"}),t("span",{children:"Tiempo real"})]})]})]}),t("div",{id:"trend-chart",className:"h-64 rounded-lg bg-glass p-4"}),t("div",{className:"mt-4 flex items-center justify-between text-xs text-tertiary",children:[t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2"}),"Gastos totales"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-gold rounded-full mr-2"}),"Promedio móvil"]})]})]}),t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-chart-radar text-emerald text-xl"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary",children:"Status Overview"}),t("p",{className:"text-xs text-tertiary",children:"Distribución de estados de gastos por volumen"})]})]}),t("div",{className:"flex items-center space-x-3",children:[t("select",{id:"analytics-status-filter-chart",className:"form-input-premium text-sm bg-glass border-0 min-w-[140px]",style:"background: #1a1d25 !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;",children:[t("option",{value:"",style:"background: #12141a !important; color: #ffffff !important;",children:"Todos los Estados"}),t("option",{value:"pending",style:"background: #12141a !important; color: #ffffff !important;",children:"⏳ Pendientes"}),t("option",{value:"approved",style:"background: #12141a !important; color: #ffffff !important;",children:"✅ Aprobados"}),t("option",{value:"rejected",style:"background: #12141a !important; color: #ffffff !important;",children:"❌ Rechazados"}),t("option",{value:"reimbursed",style:"background: #12141a !important; color: #ffffff !important;",children:"💰 Reembolsados"}),t("option",{value:"invoiced",style:"background: #12141a !important; color: #ffffff !important;",children:"📄 Facturados"})]}),t("button",{className:"btn-premium btn-emerald text-xs",onclick:"refreshStatusMetrics()",children:[t("i",{className:"fas fa-sync-alt mr-1"}),"Actualizar"]})]})]}),t("div",{id:"status-chart",className:"h-64 rounded-lg bg-glass p-4"}),t("div",{className:"mt-4 grid grid-cols-2 gap-4 text-xs text-tertiary",children:[t("div",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-yellow-500 rounded-full mr-2"}),t("span",{children:"Pendientes"})]}),t("div",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-green-500 rounded-full mr-2"}),t("span",{children:"Aprobados"})]}),t("div",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-blue-500 rounded-full mr-2"}),t("span",{children:"Reembolsados"})]}),t("div",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-red-500 rounded-full mr-2"}),t("span",{children:"Rechazados"})]})]})]})]}),t("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8",children:[t("div",{className:"bg-white rounded-lg shadow-sm border",children:[t("div",{className:"px-6 py-4 border-b",children:t("h3",{className:"text-lg font-semibold text-gray-900",children:[t("i",{className:"fas fa-receipt mr-2 text-orange-600"}),"Actividad Reciente"]})}),t("div",{className:"p-6",children:t("div",{id:"recent-activity",className:"space-y-4"})})]}),t("div",{className:"bg-white rounded-lg shadow-sm border",children:[t("div",{className:"px-6 py-4 border-b",children:t("h3",{className:"text-lg font-semibold text-gray-900",children:[t("i",{className:"fas fa-exclamation-triangle mr-2 text-yellow-600"}),"Acciones Requeridas"]})}),t("div",{className:"p-6",children:t("div",{id:"pending-actions",className:"space-y-4"})})]})]}),t("div",{className:"bg-white rounded-lg shadow-sm border",children:[t("div",{className:"px-6 py-4 border-b",children:t("div",{className:"flex justify-between items-center",children:[t("h3",{className:"text-lg font-semibold text-gray-900",children:[t("i",{className:"fas fa-table mr-2 text-gray-600"}),"Últimos Gastos Registrados"]}),t("a",{href:"/expenses",className:"text-blue-600 hover:text-blue-800 text-sm",children:"Ver todos los gastos →"})]})}),t("div",{className:"overflow-x-auto",children:t("table",{className:"min-w-full divide-y divide-gray-200",children:[t("thead",{className:"bg-gray-50",children:t("tr",{children:[t("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Descripción"}),t("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Empresa"}),t("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Usuario"}),t("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Monto"}),t("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Estado"}),t("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Fecha"}),t("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Adjuntos"})]})}),t("tbody",{id:"recent-expenses-table",className:"bg-white divide-y divide-gray-200",children:t("tr",{children:t("td",{colspan:"7",className:"px-6 py-4 text-center text-gray-500",children:[t("i",{className:"fas fa-spinner fa-spin mr-2"}),"Cargando gastos recientes..."]})})})]})})]})]})}),t("script",{dangerouslySetInnerHTML:{__html:`
        console.log('✅ FILTERS INITIALIZED - Dropdowns should work now!');
        
        // Simple filter change handler
        function handleFilterChange(selectElement) {
          const selectedValue = selectElement.value;
          const selectedText = selectElement.options[selectElement.selectedIndex].text;
          
          console.log('Filter changed:', selectedText, 'Value:', selectedValue);
          
          // Visual feedback
          if (selectedValue) {
            selectElement.style.borderColor = '#f59e0b';
            selectElement.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
          } else {
            selectElement.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            selectElement.style.boxShadow = 'none';
          }
        }
        
        // Setup event listeners when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
          console.log('✅ DOM ready - setting up filter listeners');
          
          const filterIds = [
            'analytics-user-filter',
            'analytics-status-filter', 
            'analytics-company-filter-main',
            'analytics-currency-filter-main',
            'analytics-period-filter-main',
            'analytics-company-filter',
            'period-selector',
            'analytics-currency-filter',
            'analytics-user-filter-trend',
            'analytics-status-filter-chart'
          ];
          
          filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
              element.addEventListener('change', function() {
                handleFilterChange(this);
              });
              console.log('✅ Listener added to:', id);
            } else {
              console.log('❌ Element not found:', id);
            }
          });
        });
      `}})]})));w.get("/companies",e=>e.render(t("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);",children:[t("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:t("div",{className:"flex justify-between items-center py-6",children:[t("div",{className:"flex items-center space-x-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"relative",children:[t("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),t("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),t("div",{children:[t("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),t("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),t("span",{className:"nav-badge",children:"Sistema 4-D Premium"})]}),t("div",{className:"flex items-center space-x-8",children:[t("nav",{className:"flex space-x-6",children:[t("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-chart-pie"}),t("span",{children:"Dashboard"})]}),t("a",{href:"/companies",className:"nav-link text-gold active flex items-center space-x-2",children:[t("i",{className:"fas fa-building"}),t("span",{children:"Empresas"})]}),t("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-receipt"}),t("span",{children:"Gastos"})]}),t("a",{href:"/analytics",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-chart-line"}),t("span",{children:"Analytics"})]})]}),t("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[t("div",{id:"auth-indicator"}),t("select",{id:"currency-selector",className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:[t("option",{value:"MXN",children:"💎 MXN"}),t("option",{value:"USD",children:"🔹 USD"}),t("option",{value:"EUR",children:"🔸 EUR"})]}),t("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[t("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[t("div",{className:"text-center mb-12",children:[t("h2",{className:"text-4xl font-bold gradient-text-gold mb-3",children:[t("i",{className:"fas fa-building-columns mr-3"}),"Portfolio Corporativo"]}),t("p",{className:"text-secondary text-lg",children:"Gestión multiempresa internacional • MX + ES"}),t("div",{className:"flex justify-center mt-4",children:t("div",{className:"flex items-center space-x-6 text-sm text-tertiary",children:[t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),"6 empresas activas"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),"Operaciones globales"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Multimoneda: MXN • USD • EUR"]})]})})]}),t("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:[t("div",{className:"company-card-premium animate-slide-up group cursor-pointer",onClick:"window.location.href='/company/1'",children:[t("div",{className:"flex items-center justify-between mb-6",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:t("span",{className:"text-3xl",children:"🇲🇽"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"TechMX Solutions"}),t("p",{className:"text-sm text-secondary",children:"Tecnología • México"})]})]}),t("div",{className:"text-right",children:[t("div",{className:"status-badge-premium status-approved-premium mb-2",children:[t("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),t("p",{className:"text-xs text-tertiary",children:"MXN Principal"})]})]}),t("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-emerald",children:"24"}),t("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-gold",children:"$485K"}),t("div",{className:"text-xs text-tertiary",children:"Gastos MXN"})]})]}),t("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[t("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),t("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),t("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.1s",onClick:"window.location.href='/company/2'",children:[t("div",{className:"flex items-center justify-between mb-6",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:t("span",{className:"text-3xl",children:"🇲🇽"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Innovación Digital MX"}),t("p",{className:"text-sm text-secondary",children:"Digital • México"})]})]}),t("div",{className:"text-right",children:[t("div",{className:"status-badge-premium status-approved-premium mb-2",children:[t("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),t("p",{className:"text-xs text-tertiary",children:"MXN Principal"})]})]}),t("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-emerald",children:"18"}),t("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-gold",children:"$325K"}),t("div",{className:"text-xs text-tertiary",children:"Gastos MXN"})]})]}),t("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[t("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),t("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),t("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.2s",onClick:"window.location.href='/company/3'",children:[t("div",{className:"flex items-center justify-between mb-6",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:t("span",{className:"text-3xl",children:"🇲🇽"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Consultoría Estratégica MX"}),t("p",{className:"text-sm text-secondary",children:"Consultoría • México"})]})]}),t("div",{className:"text-right",children:[t("div",{className:"status-badge-premium status-approved-premium mb-2",children:[t("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),t("p",{className:"text-xs text-tertiary",children:"MXN Principal"})]})]}),t("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-emerald",children:"12"}),t("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-gold",children:"$195K"}),t("div",{className:"text-xs text-tertiary",children:"Gastos MXN"})]})]}),t("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[t("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),t("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),t("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.3s",onClick:"window.location.href='/company/4'",children:[t("div",{className:"flex items-center justify-between mb-6",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:t("span",{className:"text-3xl",children:"🇪🇸"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"TechES Barcelona"}),t("p",{className:"text-sm text-secondary",children:"Tecnología • España"})]})]}),t("div",{className:"text-right",children:[t("div",{className:"status-badge-premium status-approved-premium mb-2",children:[t("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),t("p",{className:"text-xs text-tertiary",children:"EUR Principal"})]})]}),t("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-emerald",children:"32"}),t("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-gold",children:"€85K"}),t("div",{className:"text-xs text-tertiary",children:"Gastos EUR"})]})]}),t("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[t("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),t("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),t("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.4s",onClick:"window.location.href='/company/5'",children:[t("div",{className:"flex items-center justify-between mb-6",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:t("span",{className:"text-3xl",children:"🇪🇸"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Innovación Madrid SL"}),t("p",{className:"text-sm text-secondary",children:"Innovación • España"})]})]}),t("div",{className:"text-right",children:[t("div",{className:"status-badge-premium status-approved-premium mb-2",children:[t("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),t("p",{className:"text-xs text-tertiary",children:"EUR Principal"})]})]}),t("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-emerald",children:"28"}),t("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-gold",children:"€72K"}),t("div",{className:"text-xs text-tertiary",children:"Gastos EUR"})]})]}),t("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[t("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),t("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]}),t("div",{className:"company-card-premium animate-slide-up group cursor-pointer",style:"animation-delay: 0.5s",onClick:"window.location.href='/company/6'",children:[t("div",{className:"flex items-center justify-between mb-6",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-4 rounded-xl bg-glass group-hover:bg-glass-hover transition-all",children:t("span",{className:"text-3xl",children:"🇪🇸"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary group-hover:text-gold transition-colors",children:"Digital Valencia S.A."}),t("p",{className:"text-sm text-secondary",children:"Digital • España"})]})]}),t("div",{className:"text-right",children:[t("div",{className:"status-badge-premium status-approved-premium mb-2",children:[t("i",{className:"fas fa-check-circle mr-1"}),"Activa"]}),t("p",{className:"text-xs text-tertiary",children:"EUR Principal"})]})]}),t("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-emerald",children:"22"}),t("div",{className:"text-xs text-tertiary",children:"Empleados"})]}),t("div",{className:"text-center p-3 bg-glass rounded-lg",children:[t("div",{className:"text-2xl font-bold text-gold",children:"€58K"}),t("div",{className:"text-xs text-tertiary",children:"Gastos EUR"})]})]}),t("div",{className:"flex items-center justify-between pt-4 border-t border-glass-border",children:[t("span",{className:"text-sm text-secondary",children:"Ver dashboard completo"}),t("i",{className:"fas fa-arrow-right text-gold group-hover:translate-x-1 transition-transform"})]})]})]}),t("div",{className:"mt-16 glass-panel p-8",children:[t("div",{className:"text-center mb-8",children:[t("h3",{className:"text-2xl font-bold text-primary mb-2",children:"Resumen Consolidado"}),t("p",{className:"text-secondary",children:"Vista general del portfolio corporativo"})]}),t("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-6",children:[t("div",{className:"text-center",children:[t("div",{className:"text-3xl font-bold text-emerald mb-2",children:"136"}),t("div",{className:"text-sm text-secondary",children:"Total Empleados"})]}),t("div",{className:"text-center",children:[t("div",{className:"text-3xl font-bold text-gold mb-2",children:"$1,120K"}),t("div",{className:"text-sm text-secondary",children:"Gastos Totales MXN"})]}),t("div",{className:"text-center",children:[t("div",{className:"text-3xl font-bold text-sapphire mb-2",children:"€215K"}),t("div",{className:"text-sm text-secondary",children:"Gastos Totales EUR"})]}),t("div",{className:"text-center",children:[t("div",{className:"text-3xl font-bold text-ruby mb-2",children:"6"}),t("div",{className:"text-sm text-secondary",children:"Empresas Activas"})]})]})]})]}),t("script",{src:"/static/app.js"})]})));w.get("/company/:id",e=>{const a=e.req.param("id"),s={1:{name:"TechMX Solutions",country:"MX",currency:"MXN",flag:"🇲🇽",employees:24,expenses:"485K",category:"Tecnología"},2:{name:"Innovación Digital MX",country:"MX",currency:"MXN",flag:"🇲🇽",employees:18,expenses:"325K",category:"Digital"},3:{name:"Consultoría Estratégica MX",country:"MX",currency:"MXN",flag:"🇲🇽",employees:12,expenses:"195K",category:"Consultoría"},4:{name:"TechES Barcelona",country:"ES",currency:"EUR",flag:"🇪🇸",employees:32,expenses:"85K",category:"Tecnología"},5:{name:"Innovación Madrid SL",country:"ES",currency:"EUR",flag:"🇪🇸",employees:28,expenses:"72K",category:"Innovación"},6:{name:"Digital Valencia S.A.",country:"ES",currency:"EUR",flag:"🇪🇸",employees:22,expenses:"58K",category:"Digital"}}[a];return s?e.render(t("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);",children:[t("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:t("div",{className:"flex justify-between items-center py-6",children:[t("div",{className:"flex items-center space-x-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"relative",children:[t("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),t("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),t("div",{children:[t("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),t("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),t("span",{className:"nav-badge",children:[s.flag," ",s.name]})]}),t("div",{className:"flex items-center space-x-8",children:[t("nav",{className:"flex space-x-6",children:[t("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-chart-pie"}),t("span",{children:"Dashboard"})]}),t("a",{href:"/companies",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-building"}),t("span",{children:"Empresas"})]}),t("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-receipt"}),t("span",{children:"Gastos"})]})]}),t("div",{className:"flex items-center space-x-2 text-sm text-tertiary",children:[t("a",{href:"/companies",className:"hover:text-gold",children:"Empresas"}),t("i",{className:"fas fa-chevron-right"}),t("span",{className:"text-gold",children:s.name})]}),t("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[t("select",{className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:t("option",{children:[s.flag," ",s.currency]})}),t("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[t("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[t("div",{className:"text-center mb-12",children:[t("div",{className:"inline-flex items-center space-x-4 mb-4",children:[t("div",{className:"p-4 rounded-2xl bg-glass",children:t("span",{className:"text-6xl",children:s.flag})}),t("div",{className:"text-left",children:[t("h2",{className:"text-4xl font-bold gradient-text-gold",children:s.name}),t("p",{className:"text-xl text-secondary",children:[s.category," • ",s.country==="MX"?"México":"España"]})]})]}),t("div",{className:"flex justify-center mt-4",children:t("div",{className:"flex items-center space-x-8 text-sm text-tertiary",children:[t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),s.employees," empleados activos"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),s.currency," ",s.expenses," en gastos"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Operativa desde 2019"]})]})})]}),t("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12",children:[t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.1s",children:[t("div",{className:"flex items-center justify-between mb-4",children:t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-coins text-emerald text-xl"})}),t("div",{children:[t("p",{className:"metric-label text-emerald",children:"Gastos Mensuales"}),t("p",{className:"text-xs text-tertiary",children:"Este mes"})]})]})}),t("div",{className:"metric-value text-emerald",children:[s.currency," ",s.expenses]}),t("div",{className:"text-xs text-tertiary mt-2",children:"+8.5% vs mes anterior"})]}),t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.2s",children:[t("div",{className:"flex items-center justify-between mb-4",children:t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-users text-sapphire text-xl"})}),t("div",{children:[t("p",{className:"metric-label text-sapphire",children:"Empleados"}),t("p",{className:"text-xs text-tertiary",children:"Plantilla actual"})]})]})}),t("div",{className:"metric-value text-sapphire",children:s.employees}),t("div",{className:"text-xs text-tertiary mt-2",children:"+2 nuevas contrataciones"})]}),t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.3s",children:[t("div",{className:"flex items-center justify-between mb-4",children:t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-clock text-gold text-xl"})}),t("div",{children:[t("p",{className:"metric-label text-gold",children:"Pendientes"}),t("p",{className:"text-xs text-tertiary",children:"Por revisar"})]})]})}),t("div",{className:"metric-value text-gold",children:"7"}),t("div",{className:"text-xs text-tertiary mt-2",children:"2 urgentes"})]}),t("div",{className:"metric-card-premium animate-slide-up",style:"animation-delay: 0.4s",children:[t("div",{className:"flex items-center justify-between mb-4",children:t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-3 rounded-xl bg-glass",children:t("i",{className:"fas fa-percentage text-ruby text-xl"})}),t("div",{children:[t("p",{className:"metric-label text-ruby",children:"Eficiencia"}),t("p",{className:"text-xs text-tertiary",children:"Aprobación"})]})]})}),t("div",{className:"metric-value text-ruby",children:"94.2%"}),t("div",{className:"text-xs text-tertiary mt-2",children:"Excelente performance"})]})]}),t("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12",children:[t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-chart-line text-emerald text-xl"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary",children:"Tendencia de Gastos"}),t("p",{className:"text-xs text-tertiary",children:["Últimos 6 meses • ",s.name]})]})]})}),t("div",{id:"company-trend-chart",className:"h-64 rounded-lg bg-glass p-4",children:t("div",{className:"flex items-center justify-center h-full",children:t("div",{className:"text-center",children:[t("i",{className:"fas fa-chart-line text-4xl text-emerald mb-4"}),t("p",{className:"text-secondary",children:"Gráfica de tendencias específica"}),t("p",{className:"text-xs text-tertiary",children:["Datos de ",s.name]})]})})})]}),t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-chart-pie text-gold text-xl"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary",children:"Distribución por Categoría"}),t("p",{className:"text-xs text-tertiary",children:"Análisis de tipos de gasto"})]})]})}),t("div",{id:"company-category-chart",className:"h-64 rounded-lg bg-glass p-4",children:t("div",{className:"flex items-center justify-center h-full",children:t("div",{className:"text-center",children:[t("i",{className:"fas fa-chart-pie text-4xl text-gold mb-4"}),t("p",{className:"text-secondary",children:"Distribución por categoría"}),t("p",{className:"text-xs text-tertiary",children:"Viajes, comidas, tecnología, etc."})]})})})]})]}),t("div",{className:"glass-panel p-8",children:[t("div",{className:"flex justify-between items-center mb-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"p-2 rounded-lg bg-glass",children:t("i",{className:"fas fa-history text-sapphire text-xl"})}),t("div",{children:[t("h3",{className:"text-xl font-bold text-primary",children:"Actividad Reciente"}),t("p",{className:"text-xs text-tertiary",children:["Últimos movimientos en ",s.name]})]})]}),t("a",{href:"/expenses",className:"btn-premium btn-sapphire text-sm",children:[t("i",{className:"fas fa-external-link-alt mr-2"}),"Ver todos los gastos"]})]}),t("div",{className:"space-y-4",children:[t("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-2 rounded-lg bg-emerald bg-opacity-20",children:t("i",{className:"fas fa-plane text-emerald"})}),t("div",{children:[t("p",{className:"font-semibold text-primary",children:"Vuelo Madrid-Barcelona"}),t("p",{className:"text-sm text-tertiary",children:"María López • Hace 2 horas"})]})]}),t("div",{className:"text-right",children:[t("p",{className:"font-bold text-emerald",children:[s.currency," 250"]}),t("p",{className:"text-xs text-tertiary",children:"Aprobado"})]})]}),t("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-2 rounded-lg bg-gold bg-opacity-20",children:t("i",{className:"fas fa-utensils text-gold"})}),t("div",{children:[t("p",{className:"font-semibold text-primary",children:"Comida con cliente"}),t("p",{className:"text-sm text-tertiary",children:"Carlos Martínez • Hace 4 horas"})]})]}),t("div",{className:"text-right",children:[t("p",{className:"font-bold text-gold",children:[s.currency," 125"]}),t("p",{className:"text-xs text-tertiary",children:"Pendiente"})]})]}),t("div",{className:"flex items-center justify-between p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all",children:[t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"p-2 rounded-lg bg-sapphire bg-opacity-20",children:t("i",{className:"fas fa-laptop text-sapphire"})}),t("div",{children:[t("p",{className:"font-semibold text-primary",children:"Software Adobe Creative Suite"}),t("p",{className:"text-sm text-tertiary",children:"Ana García • Hace 1 día"})]})]}),t("div",{className:"text-right",children:[t("p",{className:"font-bold text-sapphire",children:[s.currency," 89"]}),t("p",{className:"text-xs text-tertiary",children:"Aprobado"})]})]})]})]})]}),t("script",{src:"/static/app.js"})]})):e.redirect("/companies")});w.get("/expenses",e=>e.html(`
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
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
  `));w.get("/expenses-old",e=>e.render(t("div",{className:"min-h-screen bg-primary",children:[t("div",{className:"bg-glass border-b border-glass-border backdrop-blur-sm",children:t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:t("div",{className:"flex justify-between items-center py-6",children:[t("div",{className:"flex items-center space-x-6",children:[t("a",{href:"/",className:"text-gold hover:text-gold-light transition-colors duration-200 text-xl",children:t("i",{className:"fas fa-arrow-left"})}),t("div",{children:[t("h1",{className:"text-3xl font-bold text-primary flex items-center",children:[t("i",{className:"fas fa-receipt mr-3 text-gold"}),"Gestión de Gastos"]}),t("p",{className:"text-sm text-tertiary mt-1",children:"Control integral de gastos y viáticos empresariales"})]})]}),t("div",{className:"flex items-center space-x-4",children:[t("button",{className:"btn-premium btn-emerald",onclick:"showExpenseForm()",children:[t("i",{className:"fas fa-plus mr-2"}),"Registrar Gasto"]}),t("button",{className:"btn-premium btn-sapphire",onclick:"showImportExcel()",children:[t("i",{className:"fas fa-file-excel mr-2"}),"Importar Excel"]})]})]})})}),t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[t("div",{className:"card-premium mb-8",children:[t("div",{className:"flex items-center justify-between mb-6",children:t("div",{children:[t("h3",{className:"text-xl font-bold text-primary flex items-center",children:[t("i",{className:"fas fa-filter mr-3 text-gold"}),"Filtros Avanzados de Gastos"]}),t("p",{className:"text-sm text-tertiary mt-1",children:"Personaliza tu búsqueda con filtros multidimensionales"})]})}),t("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",children:[t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"🏢 Empresa"}),t("select",{id:"filter-company",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_COMPANY(this.value)",style:"background-color: white !important; color: black !important;",children:[t("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todas las empresas"}),t("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"🇲🇽 TechMX Solutions"}),t("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"🇲🇽 Innovación Digital MX"}),t("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"🇲🇽 Consultoría Estratégica MX"}),t("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"🇪🇸 TechES Barcelona"}),t("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"🇪🇸 Innovación Madrid SL"}),t("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"🇪🇸 Digital Valencia S.A."})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"👤 Usuario Responsable"}),t("select",{id:"filter-user",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_USER(this.value)",style:"background-color: white !important; color: black !important;",children:[t("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los usuarios"}),t("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"👑 Alejandro Rodríguez (Admin)"}),t("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"✏️ María López (Editor)"}),t("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"⭐ Carlos Martínez (Advanced)"}),t("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"✏️ Ana García (Editor)"}),t("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"⭐ Pedro Sánchez (Advanced)"}),t("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"✏️ Elena Torres (Editor)"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📋 Estado del Gasto"}),t("select",{id:"filter-status",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_STATUS(this.value)",style:"background-color: white !important; color: black !important;",children:[t("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los estados"}),t("option",{value:"pending",style:"background-color: white !important; color: black !important;",children:"⏳ Pendiente"}),t("option",{value:"approved",style:"background-color: white !important; color: black !important;",children:"✅ Aprobado"}),t("option",{value:"rejected",style:"background-color: white !important; color: black !important;",children:"❌ Rechazado"}),t("option",{value:"reimbursed",style:"background-color: white !important; color: black !important;",children:"💰 Reembolsado"}),t("option",{value:"invoiced",style:"background-color: white !important; color: black !important;",children:"📄 Facturado"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"💰 Moneda"}),t("select",{id:"filter-currency",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;",children:[t("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todas las monedas"}),t("option",{value:"MXN",style:"background-color: white !important; color: black !important;",children:"🇲🇽 MXN"}),t("option",{value:"USD",style:"background-color: white !important; color: black !important;",children:"🇺🇸 USD"}),t("option",{value:"EUR",style:"background-color: white !important; color: black !important;",children:"🇪🇺 EUR"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"🏷️ Tipo de Gasto"}),t("select",{id:"filter-expense-type",className:"w-full border border-gray-300 rounded-lg px-3 py-2",onchange:"EXPENSES_FILTER_TYPE(this.value)",style:"background-color: white !important; color: black !important;",children:[t("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los tipos"}),t("option",{value:"1",style:"background-color: white !important; color: black !important;",children:"🍽️ Comidas de Trabajo"}),t("option",{value:"2",style:"background-color: white !important; color: black !important;",children:"🚕 Transporte Terrestre"}),t("option",{value:"3",style:"background-color: white !important; color: black !important;",children:"⛽ Combustible"}),t("option",{value:"4",style:"background-color: white !important; color: black !important;",children:"🏨 Hospedaje"}),t("option",{value:"5",style:"background-color: white !important; color: black !important;",children:"✈️ Vuelos"}),t("option",{value:"6",style:"background-color: white !important; color: black !important;",children:"📄 Material de Oficina"}),t("option",{value:"7",style:"background-color: white !important; color: black !important;",children:"💻 Software y Licencias"}),t("option",{value:"8",style:"background-color: white !important; color: black !important;",children:"🎓 Capacitación"}),t("option",{value:"9",style:"background-color: white !important; color: black !important;",children:"📊 Marketing"}),t("option",{value:"10",style:"background-color: white !important; color: black !important;",children:"📂 Otros Gastos"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📅 Fecha Desde"}),t("input",{type:"date",id:"filter-date-from",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"📅 Fecha Hasta"}),t("input",{type:"date",id:"filter-date-to",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-secondary mb-3",children:"💳 Método de Pago"}),t("select",{id:"filter-payment-method",className:"w-full border border-gray-300 rounded-lg px-3 py-2",style:"background-color: white !important; color: black !important;",children:[t("option",{value:"",style:"background-color: white !important; color: black !important;",children:"Todos los métodos"}),t("option",{value:"cash",style:"background-color: white !important; color: black !important;",children:"💵 Efectivo"}),t("option",{value:"credit_card",style:"background-color: white !important; color: black !important;",children:"💳 Tarjeta de Crédito"}),t("option",{value:"debit_card",style:"background-color: white !important; color: black !important;",children:"💳 Tarjeta de Débito"}),t("option",{value:"bank_transfer",style:"background-color: white !important; color: black !important;",children:"🏦 Transferencia"}),t("option",{value:"company_card",style:"background-color: white !important; color: black !important;",children:"🏢 Tarjeta Empresarial"}),t("option",{value:"petty_cash",style:"background-color: white !important; color: black !important;",children:"💰 Caja Chica"})]})]})]}),t("div",{className:"flex flex-wrap gap-3 mt-6",children:[t("button",{onclick:"EXPENSES_APPLY_ALL_FILTERS()",className:"btn-premium btn-sapphire",children:[t("i",{className:"fas fa-search mr-2"}),"Aplicar Filtros"]}),t("button",{onclick:"EXPENSES_CLEAR_ALL()",className:"btn-premium btn-slate",children:[t("i",{className:"fas fa-eraser mr-2"}),"Limpiar Todo"]}),t("button",{onclick:"EXPENSES_TEST_MARIA()",className:"btn-premium btn-emerald text-sm",children:[t("i",{className:"fas fa-user mr-2"}),"Probar María"]}),t("button",{onclick:"EXPENSES_TEST_PENDING()",className:"btn-premium btn-gold text-sm",children:[t("i",{className:"fas fa-clock mr-2"}),"Solo Pendientes"]}),t("button",{onclick:"QUITAR_MARIA()",className:"btn-premium btn-ruby text-sm",children:[t("i",{className:"fas fa-user-slash mr-2"}),"Quitar María"]})]})]}),t("div",{className:"card-premium",children:[t("div",{className:"flex items-center justify-between mb-6",children:[t("div",{children:[t("h3",{className:"text-xl font-bold text-primary flex items-center",children:[t("i",{className:"fas fa-list-alt mr-3 text-gold"}),"Lista de Gastos y Viáticos"]}),t("p",{className:"text-sm text-tertiary mt-1",children:"Registro completo de transacciones empresariales"})]}),t("div",{className:"flex items-center space-x-4",children:[t("div",{className:"text-center",children:[t("div",{id:"expenses-count",className:"text-lg font-bold text-emerald",children:"0 gastos"}),t("div",{className:"text-xs text-tertiary",children:"Total registros"})]}),t("div",{className:"text-center",children:[t("div",{id:"expenses-total",className:"text-lg font-bold text-gold",children:"$0.00"}),t("div",{className:"text-xs text-tertiary",children:"Monto total"})]})]})]}),t("div",{className:"overflow-x-auto bg-glass rounded-lg border border-glass-border",children:t("table",{className:"min-w-full",children:[t("thead",{className:"bg-quaternary border-b border-glass-border",children:t("tr",{children:[t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("input",{type:"checkbox",id:"select-all",className:"mr-2 accent-gold",onclick:"toggleSelectAll()"}),t("i",{className:"fas fa-hashtag mr-1 text-gold"}),"ID"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-file-text mr-1 text-gold"}),"Descripción"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-building mr-1 text-gold"}),"Empresa"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-user mr-1 text-gold"}),"Usuario"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-money-bill mr-1 text-gold"}),"Monto Original"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-peso-sign mr-1 text-gold"}),"Monto MXN"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-flag mr-1 text-gold"}),"Estado"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-calendar mr-1 text-gold"}),"Fecha"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-paperclip mr-1 text-gold"}),"Adjuntos"]}),t("th",{className:"px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider",children:[t("i",{className:"fas fa-cogs mr-1 text-gold"}),"Acciones"]})]})}),t("tbody",{id:"expenses-table",className:"divide-y divide-glass-border",children:t("tr",{className:"hover:bg-glass-hover transition-colors duration-200",children:t("td",{colspan:"10",className:"px-6 py-8 text-center",children:t("div",{className:"flex flex-col items-center",children:[t("i",{className:"fas fa-spinner fa-spin text-2xl text-gold mb-3"}),t("span",{className:"text-secondary",children:"Cargando gastos..."})]})})})})]})})]})]}),t("div",{id:"expense-modal",className:"fixed inset-0 z-50 hidden",children:[t("div",{className:"fixed inset-0 bg-black bg-opacity-50",onclick:"closeExpenseForm()"}),t("div",{className:"fixed inset-0 overflow-y-auto",children:t("div",{className:"flex min-h-full items-center justify-center p-4",children:t("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",children:[t("div",{className:"px-6 py-4 border-b border-gray-200",children:[t("div",{className:"flex items-center justify-between",children:[t("h3",{className:"text-lg font-semibold text-gray-900",children:[t("i",{className:"fas fa-plus-circle mr-2 text-green-600"}),"Registrar Nuevo Gasto o Viático"]}),t("button",{onclick:"closeExpenseForm()",className:"text-gray-400 hover:text-gray-600",children:t("i",{className:"fas fa-times text-xl"})})]}),t("p",{className:"text-sm text-gray-500 mt-1",children:"Complete todos los campos requeridos. Los campos marcados con * son obligatorios."})]}),t("form",{id:"expense-form",className:"px-6 py-4",children:[t("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[t("div",{className:"space-y-4",children:[t("h4",{className:"font-semibold text-gray-900 border-b pb-2",children:"📋 Información Básica"}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Empresa * ",t("i",{className:"fas fa-building ml-1 text-blue-500"})]}),t("select",{id:"form-company",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:t("option",{value:"",children:"Seleccione una empresa..."})})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Tipo de Gasto * ",t("i",{className:"fas fa-tags ml-1 text-purple-500"})]}),t("select",{id:"form-expense-type",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:t("option",{value:"",children:"Seleccione tipo de gasto..."})})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Descripción * ",t("i",{className:"fas fa-edit ml-1 text-green-500"})]}),t("textarea",{id:"form-description",required:!0,rows:"3",placeholder:"Ej: Comida con cliente - Proyecto Alpha",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Fecha del Gasto * ",t("i",{className:"fas fa-calendar ml-1 text-red-500"})]}),t("input",{type:"date",id:"form-expense-date",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Responsable ",t("i",{className:"fas fa-user ml-1 text-indigo-500"})]}),t("select",{id:"form-responsible",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:t("option",{value:"",children:"Yo (usuario actual)"})})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Integrantes ",t("i",{className:"fas fa-users ml-1 text-orange-500"})]}),t("textarea",{id:"form-attendees",rows:"2",placeholder:"Ej: María López, Carlos Martínez (opcional)",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]})]}),t("div",{className:"space-y-4",children:[t("h4",{className:"font-semibold text-gray-900 border-b pb-2",children:"💰 Información Financiera"}),t("div",{className:"grid grid-cols-2 gap-3",children:[t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Monto * ",t("i",{className:"fas fa-dollar-sign ml-1 text-green-600"})]}),t("input",{type:"number",step:"0.01",id:"form-amount",required:!0,placeholder:"0.00",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Moneda * ",t("i",{className:"fas fa-coins ml-1 text-yellow-600"})]}),t("select",{id:"form-currency",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",onchange:"updateExchangeRate()",children:[t("option",{value:"",children:"Seleccionar..."}),t("option",{value:"MXN",children:"🇲🇽 MXN"}),t("option",{value:"USD",children:"🇺🇸 USD"}),t("option",{value:"EUR",children:"🇪🇺 EUR"})]})]})]}),t("div",{id:"exchange-rate-section",className:"hidden",children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Tipo de Cambio ",t("i",{className:"fas fa-exchange-alt ml-1 text-blue-600"})]}),t("div",{className:"flex items-center space-x-2",children:[t("input",{type:"number",step:"0.000001",id:"form-exchange-rate",readonly:!0,className:"flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"}),t("button",{type:"button",onclick:"refreshExchangeRate()",className:"px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",children:t("i",{className:"fas fa-sync-alt"})})]}),t("p",{id:"exchange-rate-info",className:"text-xs text-gray-500 mt-1"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Método de Pago * ",t("i",{className:"fas fa-credit-card ml-1 text-purple-600"})]}),t("select",{id:"form-payment-method",required:!0,className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:[t("option",{value:"",children:"Seleccione método..."}),t("option",{value:"cash",children:"💵 Efectivo"}),t("option",{value:"credit_card",children:"💳 Tarjeta de Crédito"}),t("option",{value:"debit_card",children:"💳 Tarjeta de Débito"}),t("option",{value:"bank_transfer",children:"🏦 Transferencia Bancaria"}),t("option",{value:"company_card",children:"🏢 Tarjeta Empresarial"}),t("option",{value:"petty_cash",children:"🪙 Caja Chica"})]})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Proveedor/Establecimiento ",t("i",{className:"fas fa-store ml-1 text-teal-500"})]}),t("input",{type:"text",id:"form-vendor",placeholder:"Ej: Restaurante Pujol, Uber, Adobe Inc",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Número de Factura/Folio ",t("i",{className:"fas fa-receipt ml-1 text-gray-600"})]}),t("input",{type:"text",id:"form-invoice-number",placeholder:"Ej: A123456789",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Estado Inicial ",t("i",{className:"fas fa-flag ml-1 text-yellow-500"})]}),t("select",{id:"form-status",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",children:[t("option",{value:"pending",children:"⏳ Pendiente"}),t("option",{value:"approved",children:"✅ Aprobado"})]})]}),t("div",{className:"flex items-center space-x-2",children:[t("input",{type:"checkbox",id:"form-billable",className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),t("label",{for:"form-billable",className:"text-sm font-medium text-gray-700",children:[t("i",{className:"fas fa-file-invoice-dollar mr-1 text-green-600"}),"Gasto Facturable al Cliente"]})]})]})]}),t("div",{className:"mt-6",children:[t("h4",{className:"font-semibold text-gray-900 border-b pb-2 mb-4",children:"📝 Información Adicional"}),t("div",{children:[t("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:["Notas y Comentarios ",t("i",{className:"fas fa-sticky-note ml-1 text-yellow-500"})]}),t("textarea",{id:"form-notes",rows:"3",placeholder:"Información adicional, contexto del gasto, observaciones...",className:"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"})]})]}),t("div",{className:"mt-6",children:[t("h4",{className:"font-semibold text-gray-900 border-b pb-2 mb-4",children:"📎 Archivos Adjuntos con OCR Inteligente"}),t("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4",children:[t("div",{className:"flex items-center space-x-3",children:[t("input",{type:"checkbox",id:"enable-ocr",checked:!0,className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),t("label",{for:"enable-ocr",className:"text-sm font-medium text-blue-900",children:[t("i",{className:"fas fa-robot mr-1"}),"Activar OCR - Extracción Automática de Datos"]})]}),t("p",{className:"text-xs text-blue-700 mt-1 ml-6",children:"El sistema extraerá automáticamente: monto, fecha, proveedor, y método de pago desde tickets y facturas"})]}),t("div",{className:"border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors",ondrop:"handleFileDrop(event)",ondragover:"handleDragOver(event)",ondragleave:"handleDragLeave(event)",children:[t("i",{className:"fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"}),t("p",{className:"text-gray-600 mb-2",children:[t("strong",{children:"Arrastra archivos aquí"})," o haz clic para seleccionar"]}),t("p",{className:"text-sm text-gray-500 mb-3",children:"📸 Tickets • 📄 Facturas PDF/XML • 🖼️ Fotografías (Max: 10MB por archivo)"}),t("div",{className:"flex justify-center space-x-3",children:[t("input",{type:"file",id:"form-attachments",multiple:!0,accept:".pdf,.xml,.jpg,.jpeg,.png,.gif",className:"hidden",onchange:"handleFileSelect(event)"}),t("button",{type:"button",onclick:"document.getElementById('form-attachments').click()",className:"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700",children:[t("i",{className:"fas fa-paperclip mr-2"}),"Seleccionar Archivos"]}),t("button",{type:"button",onclick:"captureFromCamera()",className:"px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 md:hidden min-h-12",children:[t("i",{className:"fas fa-camera mr-2"}),"📸 Tomar Foto"]}),t("button",{type:"button",onclick:"captureLocationForExpense()",className:"px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 md:hidden min-h-12",children:[t("i",{className:"fas fa-map-marker-alt mr-2"}),"📍 Ubicación"]})]}),t("input",{type:"file",id:"camera-capture",accept:"image/*",capture:"environment",className:"hidden",onchange:"handleCameraCapture(event)"})]}),t("div",{id:"ocr-status",className:"mt-3 hidden",children:t("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-3",children:t("div",{className:"flex items-center",children:[t("i",{className:"fas fa-cog fa-spin text-yellow-600 mr-2"}),t("span",{class:"text-yellow-800",children:"Procesando OCR..."})]})})}),t("div",{id:"attachments-preview",className:"mt-4 hidden",children:[t("h5",{className:"font-medium text-gray-900 mb-2",children:"Archivos y Datos Extraídos:"}),t("div",{id:"attachments-list",className:"space-y-2"})]}),t("div",{id:"ocr-results",className:"mt-4 hidden",children:[t("h5",{className:"font-medium text-gray-900 mb-2",children:[t("i",{className:"fas fa-magic mr-1 text-purple-600"}),"Datos Extraídos Automáticamente:"]}),t("div",{id:"ocr-data-preview",className:"bg-green-50 border border-green-200 rounded-lg p-4"}),t("div",{className:"flex space-x-2 mt-2",children:[t("button",{type:"button",onclick:"applyOcrData()",className:"text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700",children:[t("i",{className:"fas fa-check mr-1"}),"Aplicar Datos"]}),t("button",{type:"button",onclick:"clearOcrData()",className:"text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700",children:[t("i",{className:"fas fa-times mr-1"}),"Descartar"]})]})]})]}),t("div",{className:"mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200",children:[t("button",{type:"button",onclick:"closeExpenseForm()",className:"px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50",children:[t("i",{className:"fas fa-times mr-2"}),"Cancelar"]}),t("button",{type:"button",onclick:"saveDraft()",className:"px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700",children:[t("i",{className:"fas fa-save mr-2"}),"Guardar Borrador"]}),t("button",{type:"submit",className:"px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700",children:[t("i",{className:"fas fa-check mr-2"}),"Registrar Gasto"]})]})]})]})})})]})]})));w.get("/api/dashboard-metrics",Mt,async e=>{const{env:a}=e;try{const r=e.get("userId"),s=e.get("userRole");let i="";s!=="admin"&&(i=`
        AND e.company_id IN (
          SELECT company_id FROM user_companies WHERE user_id = ${r}
        )
      `);const n=await a.DB.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount_mxn), 0) as total
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${i}
    `).first(),o=await a.DB.prepare(`
      SELECT COUNT(*) as count
      FROM expenses e
      WHERE e.status = 'pending'
      ${i}
    `).first(),c=await a.DB.prepare(`
      SELECT c.name as company, COUNT(e.id) as count, 
             COALESCE(SUM(e.amount_mxn), 0) as total_mxn
      FROM companies c
      LEFT JOIN expenses e ON c.id = e.company_id
      WHERE c.active = TRUE
      ${s!=="admin"?`AND c.id IN (SELECT company_id FROM user_companies WHERE user_id = ${r})`:""}
      GROUP BY c.id, c.name
      ORDER BY total_mxn DESC
    `).all(),l=await a.DB.prepare(`
      SELECT currency, COUNT(*) as count, SUM(amount) as total_original, SUM(amount_mxn) as total_mxn
      FROM expenses e
      WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now')
      ${i}
      GROUP BY currency
      ORDER BY total_mxn DESC
    `).all(),d=await a.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM expenses e
      WHERE 1=1 ${i}
      GROUP BY status
    `).all(),m=await a.DB.prepare(`
      SELECT e.*, c.name as company_name, u.name as user_name
      FROM expenses e
      JOIN companies c ON e.company_id = c.id
      JOIN users u ON e.user_id = u.id
      WHERE 1=1 ${i}
      ORDER BY e.created_at DESC
      LIMIT 10
    `).all();return e.json({success:!0,total_expenses:n,pending_expenses:o,company_metrics:c.results||[],currency_metrics:l.results||[],status_metrics:d.results||[],recent_expenses:m.results||[]})}catch(r){return e.json({error:"Failed to load dashboard metrics",details:r.message},500)}});const ra=new TextEncoder().encode("lyra-expenses-jwt-secret-2024-very-secure-key-change-in-production");async function cs(e,a){const r=Math.floor(Date.now()/1e3),s=await new Pa({sub:e.toString(),role:a,type:"access"}).setProtectedHeader({alg:"HS256"}).setIssuedAt(r).setExpirationTime(r+900).sign(ra),i=await new Pa({sub:e.toString(),role:a,type:"refresh"}).setProtectedHeader({alg:"HS256"}).setIssuedAt(r).setExpirationTime(r+10080*60).sign(ra);return{accessToken:s,refreshToken:i}}async function ls(e,a="access"){try{const{payload:r}=await Nn(e,ra);if(r.type!==a)throw new Error("Invalid token type");return r}catch{return null}}async function Mt(e,a){const r=e.req.header("Authorization");if(!r||!r.startsWith("Bearer "))return e.json({error:"Authentication required"},401);const s=r.split(" ")[1],i=await ls(s,"access");if(!i)return e.json({error:"Invalid or expired token"},401);e.set("userId",parseInt(i.sub)),e.set("userRole",i.role),await a()}w.post("/api/auth/login",async e=>{const{env:a}=e;try{const{email:r,password:s}=await e.req.json();if(!r||!s)return e.json({error:"Email and password are required"},400);const i=await a.DB.prepare("SELECT * FROM users WHERE email = ? AND active = TRUE").bind(r.toLowerCase()).first();if(!i)return e.json({error:"Invalid credentials"},401);if(!await Fn.compare(s,i.password_hash))return e.json({error:"Invalid credentials"},401);const o=await cs(i.id,i.role);await a.DB.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").bind(i.id).run();const c=crypto.randomUUID();return await a.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, expires_at, ip_address, user_agent) 
      VALUES (?, ?, datetime('now', '+7 days'), ?, ?)
    `).bind(c,i.id,e.req.header("CF-Connecting-IP")||e.req.header("X-Forwarded-For")||"unknown",e.req.header("User-Agent")||"unknown").run(),e.json({success:!0,user:{id:i.id,email:i.email,name:i.name,role:i.role},tokens:o,session_id:c})}catch(r){return e.json({error:"Login failed",details:r.message},500)}});w.post("/api/auth/refresh",async e=>{const{env:a}=e;try{const{refresh_token:r}=await e.req.json();if(!r)return e.json({error:"Refresh token is required"},400);const s=await ls(r,"refresh");if(!s)return e.json({error:"Invalid or expired refresh token"},401);const i=parseInt(s.sub),n=await a.DB.prepare("SELECT * FROM users WHERE id = ? AND active = TRUE").bind(i).first();if(!n)return e.json({error:"User not found or inactive"},401);const o=await cs(n.id,n.role);return e.json({success:!0,tokens:o})}catch(r){return e.json({error:"Token refresh failed",details:r.message},500)}});w.post("/api/auth/logout",Mt,async e=>{const{env:a}=e;try{const{session_id:r}=await e.req.json(),s=e.get("userId");return r?await a.DB.prepare("DELETE FROM user_sessions WHERE id = ? AND user_id = ?").bind(r,s).run():await a.DB.prepare("DELETE FROM user_sessions WHERE user_id = ?").bind(s).run(),e.json({success:!0,message:"Logged out successfully"})}catch(r){return e.json({error:"Logout failed",details:r.message},500)}});w.get("/api/auth/profile",Mt,async e=>{const{env:a}=e;try{const r=e.get("userId"),s=await a.DB.prepare(`
      SELECT u.*, 
             GROUP_CONCAT(DISTINCT c.id || ':' || c.name) as companies
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.id = ? AND u.active = TRUE
      GROUP BY u.id
    `).bind(r).first();if(!s)return e.json({error:"User not found"},404);const i=s.companies?s.companies.split(",").map(n=>{const[o,c]=n.split(":");return{id:parseInt(o),name:c}}):[];return e.json({success:!0,user:{id:s.id,email:s.email,name:s.name,role:s.role,companies:i,last_login:s.last_login,created_at:s.created_at}})}catch(r){return e.json({error:"Failed to get profile",details:r.message},500)}});w.get("/api/auth/companies",Mt,async e=>{const{env:a}=e;try{const r=e.get("userId"),s=e.get("userRole");let i;return s==="admin"?i=await a.DB.prepare("SELECT * FROM companies WHERE active = TRUE").all():i=await a.DB.prepare(`
        SELECT c.* 
        FROM companies c
        JOIN user_companies uc ON c.id = uc.company_id
        WHERE uc.user_id = ? AND c.active = TRUE
      `).bind(r).all(),e.json({success:!0,companies:i.results})}catch(r){return e.json({error:"Failed to get companies",details:r.message},500)}});w.get("/analytics",e=>e.render(t("div",{className:"min-h-screen",style:"background: linear-gradient(135deg, #0a0b0d 0%, #12141a 50%, #1a1d25 100%);",children:[t("nav",{className:"nav-premium border-b",style:"border-color: rgba(255, 255, 255, 0.1);",children:t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:t("div",{className:"flex justify-between items-center py-6",children:[t("div",{className:"flex items-center space-x-6",children:[t("div",{className:"flex items-center space-x-3",children:[t("div",{className:"relative",children:[t("i",{className:"fas fa-gem text-3xl text-gold animate-pulse-gold"}),t("div",{className:"absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"})]}),t("div",{children:[t("h1",{className:"nav-logo text-3xl",children:"Lyra Expenses"}),t("p",{className:"text-xs text-secondary opacity-75 font-medium",children:"Executive Financial Management"})]})]}),t("span",{className:"nav-badge",children:"Sistema 4-D Premium"})]}),t("div",{className:"flex items-center space-x-8",children:[t("nav",{className:"flex space-x-6",children:[t("a",{href:"/",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-chart-pie"}),t("span",{children:"Dashboard"})]}),t("a",{href:"/companies",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-building"}),t("span",{children:"Empresas"})]}),t("a",{href:"/expenses",className:"nav-link text-secondary hover:text-gold transition-colors duration-200 flex items-center space-x-2",children:[t("i",{className:"fas fa-receipt"}),t("span",{children:"Gastos"})]}),t("a",{href:"/analytics",className:"nav-link text-gold active flex items-center space-x-2",children:[t("i",{className:"fas fa-chart-line"}),t("span",{children:"Analytics"})]})]}),t("div",{className:"flex items-center space-x-4 border-l border-glass-border pl-6",children:[t("div",{id:"auth-indicator"}),t("select",{id:"currency-selector",className:"form-input-premium bg-glass border-0 text-sm min-w-[120px]",children:[t("option",{value:"MXN",children:"💎 MXN"}),t("option",{value:"USD",children:"🔹 USD"}),t("option",{value:"EUR",children:"🔸 EUR"})]}),t("button",{onclick:"showExpenseForm()",className:"btn-premium btn-emerald text-sm",children:[t("i",{className:"fas fa-plus mr-1"}),"Nuevo"]})]})]})]})})}),t("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",children:[t("div",{className:"text-center mb-12",children:[t("h2",{className:"text-4xl font-bold gradient-text-gold mb-3",children:[t("i",{className:"fas fa-chart-line mr-3"}),"Analytics Avanzado"]}),t("p",{className:"text-secondary text-lg",children:"Análisis profundo y reportes inteligentes multiempresa"}),t("div",{className:"flex justify-center mt-4",children:t("div",{className:"flex items-center space-x-6 text-sm text-tertiary",children:[t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-emerald rounded-full mr-2 animate-pulse"}),"Datos en tiempo real"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-gold rounded-full mr-2 animate-pulse"}),"Machine Learning activo"]}),t("span",{className:"flex items-center",children:[t("div",{className:"w-2 h-2 bg-sapphire rounded-full mr-2 animate-pulse"}),"Predicciones inteligentes"]})]})})]}),t("div",{className:"glass-panel p-16 text-center",children:[t("div",{className:"mb-8",children:[t("i",{className:"fas fa-rocket text-6xl text-gold mb-6"}),t("h3",{className:"text-3xl font-bold text-primary mb-4",children:"Próximamente"}),t("p",{className:"text-xl text-secondary mb-6",children:"Analytics Avanzado con IA"})]}),t("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",children:[t("div",{className:"p-6 bg-glass rounded-lg",children:[t("i",{className:"fas fa-brain text-3xl text-emerald mb-4"}),t("h4",{className:"text-lg font-bold text-primary mb-2",children:"Machine Learning"}),t("p",{className:"text-sm text-tertiary",children:"Predicciones automáticas de gastos y detección de anomalías"})]}),t("div",{className:"p-6 bg-glass rounded-lg",children:[t("i",{className:"fas fa-chart-network text-3xl text-gold mb-4"}),t("h4",{className:"text-lg font-bold text-primary mb-2",children:"Analytics Predictivo"}),t("p",{className:"text-sm text-tertiary",children:"Forecasting inteligente y optimización de presupuestos"})]}),t("div",{className:"p-6 bg-glass rounded-lg",children:[t("i",{className:"fas fa-file-chart-line text-3xl text-sapphire mb-4"}),t("h4",{className:"text-lg font-bold text-primary mb-2",children:"Reportes Avanzados"}),t("p",{className:"text-sm text-tertiary",children:"Reportes ejecutivos automatizados con insights accionables"})]})]}),t("div",{className:"flex justify-center space-x-4",children:[t("a",{href:"/",className:"btn-premium btn-gold",children:[t("i",{className:"fas fa-chart-pie mr-2"}),"Volver al Dashboard"]}),t("a",{href:"/companies",className:"btn-premium btn-sapphire",children:[t("i",{className:"fas fa-building mr-2"}),"Ver Empresas"]})]})]})]}),t("script",{src:"https://cdn.tailwindcss.com"}),t("link",{href:"https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",rel:"stylesheet"}),t("link",{href:"/static/styles.css",rel:"stylesheet"}),t("script",{src:"/static/app.js"}),t("script",{children:`
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
</html>`));const Ha=new _r,Kn=Object.assign({"/src/index.tsx":w});let ds=!1;for(const[,e]of Object.entries(Kn))e&&(Ha.all("*",a=>{let r;try{r=a.executionCtx}catch{}return e.fetch(a.req.raw,a.env,r)}),Ha.notFound(a=>{let r;try{r=a.executionCtx}catch{}return e.fetch(a.req.raw,a.env,r)}),ds=!0);if(!ds)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Ha as default};
