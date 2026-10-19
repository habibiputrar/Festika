import {Icon} from './icon';

export function AboutStory({text}:{text:string}){
 const paragraphs=text.split(/\n\s*\n/).filter(Boolean);
 return <div className="about-prose">
  <p>{paragraphs[0]}</p>
  {paragraphs.length>1&&<details className="about-story">
   <summary><span className="about-read-more">Baca selengkapnya</span><span className="about-read-less">Tutup cerita</span><Icon name="down" size={17}/></summary>
   <div className="about-story-body">{paragraphs.slice(1).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
  </details>}
 </div>;
}
