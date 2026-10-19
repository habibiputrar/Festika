import type {FestikaEvent} from '@/lib/types';
import {timelineDate} from './competition-timeline';
export function EventSchedule({event}:{event:FestikaEvent}){
 if(!event.schedule?.length)return null;
 return <details className="event-schedule"><summary>Jadwal kompetisi</summary><ol>{event.schedule.map(item=><li key={item.id}><strong>{item.title}</strong><span><time dateTime={String(item.payload.start)}>{timelineDate(String(item.payload.start))}</time>{item.payload.end&&item.payload.end!==item.payload.start?<>{' – '}<time dateTime={String(item.payload.end)}>{timelineDate(String(item.payload.end))}</time></>:null}</span></li>)}</ol></details>;
}
