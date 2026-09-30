import { useEffect } from 'react';
import { animate, stagger } from 'animejs';
export function usePageMotion(key:string){
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const animations:ReturnType<typeof animate>[]=[];
  const intro=document.querySelectorAll('[data-intro]');
  if(intro.length)animations.push(animate(intro,{opacity:[0,1],y:[35,0],delay:stagger(100,{start:80}),duration:950,ease:'out(4)'}));
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){animations.push(animate(entry.target,{opacity:[0,1],y:[30,0],duration:800,ease:'out(4)'}));observer.unobserve(entry.target)}})},{threshold:0.08});
  document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
  return()=>{observer.disconnect();animations.forEach(a=>a.revert())}
 },[key]);
}
