'use client';

import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';

const data = [
  { name: 'May 01', selfDrive: 1000, guided: 800 },
  { name: 'May 10', selfDrive: 1500, guided: 1200 },
  { name: 'May 20', selfDrive: 2800, guided: 1800 },
  { name: 'May 30', selfDrive: 2500, guided: 2100 },
  { name: 'June 05', selfDrive: 3500, guided: 2600 },
];

export default function GrowthChart() {
  return (
    <div className="h-[300px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSelfDrive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C4F000" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#C4F000" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGuided" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            dy={10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px' }}
          />
          <Area type="monotone" dataKey="selfDrive" stroke="#C4F000" strokeWidth={3} fillOpacity={1} fill="url(#colorSelfDrive)" />
          <Area type="monotone" dataKey="guided" stroke="#4F46E5" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorGuided)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
