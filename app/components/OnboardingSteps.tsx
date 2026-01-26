'use client';
import { useEffect, useState } from 'react';

export default function OnboardingSteps() {
  const steps = [
    { title: 'Search a plant', desc: 'Use text or camera Lens to find your plant.' },
    { title: 'View care guide', desc: 'Soil, water, light, and images tailored to your plant.' },
    { title: 'Set reminders', desc: 'Pick days & times that fit your schedule.' },
    { title: 'Get notified', desc: 'We notify you right on your phone or desktop.' },
  ];
  const [i, setI] = useState(0);
  useEffect(()=>{ const t = setInterval(()=> setI((p)=> (p+1)%steps.length), 2000); return ()=>clearInterval(t); },[]);
  return (
    <div className="grid gap-3">
      {steps.map((s, idx)=> (
        <div key={idx} className={`rounded-2xl border p-4 transition-all ${idx===i? 'bg-white shadow scale-[1.01]' : 'bg-gray-100'}`}>
          <div className="text-sm text-gray-500">Step {idx+1}</div>
          <div className="font-semibold">{s.title}</div>
          <div className="text-gray-600 text-sm">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}
