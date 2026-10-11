// Calculations operate only on the retained aggregate inputs. No network or state.
export function position(data,year,score,{thresholdOnly=false}={}){
 const s=data.sessions[String(year)];
 if(!s||!Number.isInteger(Number(score)))return null;
 score=Number(score);
 const observed=s.histogram.some(([v,n])=>v===score&&n>0);
 if(!observed&&(!thresholdOnly||score<s.histogram[0][0]||score>s.histogram.at(-1)[0]))return null;
 const n=s.histogram.reduce((a,[,c])=>a+c,0),a=s.histogram.reduce((a,[v,c])=>a+(v>=score?c:0),0);
 return {year:Number(year),score,a,n,N:s.participants,U:s.unpublished,p:a/n,low:a/s.participants,high:(a+s.unpublished)/s.participants,ties:s.histogram.find(([v])=>v===score)?.[1]||0,observed};
}
export function categoryAt(numerator,denominator,categories){
 let cumulative=0;const total=categories.reduce((s,[,n])=>s+n,0);
 if(numerator<0||numerator>denominator||denominator<=0)throw Error('Position outside [0,1]');
 for(const [label,count] of categories){cumulative+=count;if(BigInt(numerator)*BigInt(total)<=BigInt(cumulative)*BigInt(denominator))return label;}
 return categories.at(-1)[0];
}
export function inverse(ref,p){
 if(!Number.isFinite(p)||p<0||p>1)throw Error('Position outside [0,1]');
 const total=ref.values.reduce((s,[,n])=>s+n,0),q=ref.rule==='lower_is_better_step'?p:1-p;
 let cumulative=0,prior=0,previous=ref.values[0][0];
 for(const [value,weight]of ref.values){cumulative+=weight/total;
  if(q<=cumulative){
   if(ref.rule==='linear_frequency_interpolation')return cumulative===prior?value:previous+(value-previous)*(q-prior)/(cumulative-prior);
   return value;
  }prior=cumulative;previous=value;
 }return ref.values.at(-1)[0];
}
export function format(ref,value){
 switch(ref.country){
  case 'United States':return value;
  case 'United Kingdom':return ['U','E','D','C','B','A','A*'][Math.round(value)];
  case 'Türkiye':return value===500?'500':`${Math.round(value)}–${Math.round(value)+19}`;
  case 'South Africa':return value===90?'90–100%':`${Math.round(value)}–${Math.round(value)+9}%`;
  case 'Germany':return value===5?'Not passed':value.toFixed(1);
  case 'France':return value.toFixed(1)+' / 20';
  case 'Japan':return value.toFixed(0)+' / 100';
  default:return value.toFixed(ref.precision);
 }
}
export function referenceResults(data,pos){
 return data.references.map(ref=>{
  if(ref.country==='United States'){
   const cats=ref.categories, strongest=cats.map(x=>[...x]),weakest=cats.map(x=>[...x]);strongest[0][1]+=ref.missing;weakest.at(-1)[1]+=ref.missing;
   return {ref,point:categoryAt(pos.a,pos.n,cats),strong:categoryAt(pos.a,pos.N,cats),weak:categoryAt(pos.a+pos.U,pos.N,cats),targetStrong:categoryAt(pos.a,pos.n,strongest),targetWeak:categoryAt(pos.a,pos.n,weakest),combinedStrong:categoryAt(pos.a,pos.N,strongest),combinedWeak:categoryAt(pos.a+pos.U,pos.N,weakest)};
  }
  const point=inverse(ref,pos.p),x=inverse(ref,pos.low),y=inverse(ref,pos.high);
  return {ref,point,rangeLow:Math.min(x,y),rangeHigh:Math.max(x,y),strong:x,weak:y};
 });
}
export function sessionMatch(data,pos,targetYear){
 const s=data.sessions[String(targetYear)];if(!s||!pos)return null;
 const n=s.histogram.reduce((s,[,c])=>s+c,0);let sum=0;
 const curve=s.histogram.slice().reverse().map(([v,c])=>{sum+=c;return [sum/n,v];});
 const p=pos.p,tolerance=1e-14;
 if(p<curve[0][0]-tolerance||p>curve.at(-1)[0]+tolerance)return null;
 if(p<=curve[0][0])return curve[0][1];
 for(let i=1;i<curve.length;i++)if(p<=curve[i][0]){const [a,x]=curve[i-1],[b,y]=curve[i];return x+(y-x)*(p-a)/(b-a);}
 return curve.at(-1)[1];
}
