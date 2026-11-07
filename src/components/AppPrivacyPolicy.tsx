import React from 'react';
import {Helmet} from 'react-helmet-async';
import BackToPortal from './BackToPortal';
import policy from '../data/appPrivacyPolicy.json';
const Text:React.FC<{value:string}>=({value})=><>{value.split(/(https?:\/\/[^\s]+|dostrike0@gmail\.com)/g).map((part,i)=>part.startsWith('https://')?<a key={i} href={part.replace(/\.$/,'')}>{part}</a>:part==='dostrike0@gmail.com'?<a key={i} href={'mailto:'+part}>{part}</a>:<React.Fragment key={i}>{part}</React.Fragment>)}</>;
export default function AppPrivacyPolicy(){return <>
 <Helmet><title>Android App Privacy Policy - DoStrike Games</title><meta name="description" content="Privacy policy for DoStrike Games Android apps: device storage, AdMob, optional Firebase analytics, Nearby play, purchases and privacy choices."/><link rel="canonical" href="https://dostrike.com/app-privacy"/></Helmet>
 <article className="container reading-page" style={{maxWidth:800,margin:'40px auto',background:'var(--surface)',color:'var(--text)',padding:'32px 24px',borderRadius:10,overflowWrap:'anywhere'}}>
  <BackToPortal/><h1>{policy.title}</h1><p><strong>Last updated:</strong> {policy.updated}</p><p><Text value={policy.intro}/></p>
  {policy.sections.map(section=><section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph,i)=>paragraph.startsWith('- ')?<ul key={i}>{paragraph.split('\n').map((line,j)=><li key={j}><Text value={line.replace(/^- /,'')}/></li>)}</ul>:<p key={i}><Text value={paragraph}/></p>)}</section>)}
 </article>
 </>;}
