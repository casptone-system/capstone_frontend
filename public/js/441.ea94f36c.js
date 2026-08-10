"use strict";(self["webpackChunkcapstone_project"]=self["webpackChunkcapstone_project"]||[]).push([[441],{9441:function(t,e,n){n.r(e),n.d(e,{createSwipeBackGesture:function(){return s}});var r=n(5518),c=n(3872),o=n(3642);
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const s=(t,e,n,s,a)=>{const i=t.ownerDocument.defaultView;let u=(0,c.i)(t);const l=t=>{const e=50,{startX:n}=t;return u?n>=i.innerWidth-e:n<=e},h=t=>u?-t.deltaX:t.deltaX,d=t=>u?-t.velocityX:t.velocityX,p=n=>(u=(0,c.i)(t),l(n)&&e()),f=t=>{const e=h(t),n=e/i.innerWidth;s(n)},k=t=>{const e=h(t),n=i.innerWidth,c=e/n,o=d(t),s=n/2,u=o>=0&&(o>.2||e>s),l=u?1-c:c,p=l*n;let f=0;if(p>5){const t=p/Math.abs(o);f=Math.min(t,540)}a(u,c<=0?.01:(0,r.m)(0,c,.9999),f)};return(0,o.createGesture)({el:t,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:p,onStart:n,onMove:f,onEnd:k})}}}]);
//# sourceMappingURL=441.ea94f36c.js.map