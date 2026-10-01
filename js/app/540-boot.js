load();if(!prof.since){prof.since=ymd(new Date());saveProf()}$('app').classList.toggle('calm',!!prof.calm);applyRed();render();syncLockUI();if(obNeeded())openOnb();else if(prof.pin)openLock('unlock');
setTimeout(()=>mediaGC().catch(()=>{}),4000);
