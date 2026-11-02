/* Waktu sholat lokal Masjid Al Mujahidin Kukusan, Depok + tanggal Masehi & Hijriah (KHGT)
   Kriteria Muhammadiyah: Subuh -18 derajat (lebih lambat ±8 menit dari kriteria lama -20 derajat),
   Isya -18 derajat, Ashar bayangan = tinggi benda (+ bayangan saat zawal), Maghrib/Terbit -0,833 derajat
   ditambah koreksi ketinggian tempat, ihtiyat 2 menit. Semua dapat diubah di objek CONFIG. */
(function(){
  var CONFIG = {
    lat: -6.3680,      // Kukusan, Beji, Depok
    lng: 106.8250,
    elevation: 60,     // meter di atas permukaan laut (perkiraan)
    tz: 7,             // WIB
    fajrAngle: 18,     // Muhammadiyah (Munas Tarjih XXXI)
    ishaAngle: 18,
    asrFactor: 1,
    ihtiyat: 2,        // menit
    imsakBefore: 10    // menit sebelum Subuh
  };

  var rad = Math.PI/180, deg = 180/Math.PI;
  function sin(d){return Math.sin(d*rad);} function cos(d){return Math.cos(d*rad);} function tan(d){return Math.tan(d*rad);}
  function asin(x){return Math.asin(x)*deg;} function acos(x){return Math.acos(x)*deg;} function atan2(y,x){return Math.atan2(y,x)*deg;}
  function fix(a,b){a=a-b*Math.floor(a/b);return a<0?a+b:a;}

  function julian(y,m,d){
    if(m<=2){y-=1;m+=12;}
    var A=Math.floor(y/100), B=2-A+Math.floor(A/4);
    return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;
  }
  function sunPos(jd){
    var D=jd-2451545.0, g=fix(357.529+0.98560028*D,360), q=fix(280.459+0.98564736*D,360);
    var L=fix(q+1.915*sin(g)+0.020*sin(2*g),360), e=23.439-0.00000036*D;
    var RA=fix(atan2(cos(e)*sin(L),cos(L)),360)/15;
    var eq=q/15-RA; if(eq>12)eq-=24; if(eq<-12)eq+=24;
    return {decl:asin(sin(e)*sin(L)), eqt:eq};
  }
  // Mengembalikan menit sejak tengah malam (desimal) untuk tanggal lokal date
  function compute(date){
    var jd=julian(date.getFullYear(),date.getMonth()+1,date.getDate()) - CONFIG.tz/24 + 0.5; // 12:00 lokal
    var s=sunPos(jd), lat=CONFIG.lat;
    var noon=12 + CONFIG.tz - CONFIG.lng/15 - s.eqt; // jam desimal
    function T(angle){
      var v=(-sin(angle)-sin(s.decl)*sin(lat))/(cos(s.decl)*cos(lat));
      return acos(Math.max(-1,Math.min(1,v)))/15;
    }
    var horizon=0.8333+0.0347*Math.sqrt(CONFIG.elevation);
    var asrAlt=Math.atan(1/(CONFIG.asrFactor+tan(Math.abs(lat-s.decl))))*deg;
    var asrT=acos((sin(asrAlt)-sin(s.decl)*sin(lat))/(cos(s.decl)*cos(lat)))/15;
    var raw={
      subuh:noon-T(CONFIG.fajrAngle),
      terbit:noon-T(horizon),
      dzuhur:noon,
      ashar:noon+asrT,
      maghrib:noon+T(horizon),
      isya:noon+T(CONFIG.ishaAngle)
    };
    var out={};
    Object.keys(raw).forEach(function(k){
      var m=raw[k]*60;
      out[k]= k==='terbit' ? Math.floor(m-CONFIG.ihtiyat) : Math.ceil(m+CONFIG.ihtiyat);
    });
    out.imsak=out.subuh-CONFIG.imsakBefore;
    return out;
  }

  /* ===== Kalender Hijriah Global Tunggal (KHGT) Muhammadiyah ===== */
  var hijriMonthNames=['Muharam','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadan','Syawal','Dzulkaidah','Dzulhijjah'];
  function toJDN(y,m,d){var a=Math.floor((14-m)/12),y2=y+4800-a,m2=m+12*a-3;
    return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045;}
  function newMoonJDE(k){
    var T=k/1236.85;
    var JDE=2451550.09766+29.530588861*k+0.00015437*T*T-0.000000150*T*T*T+0.00000000073*T*T*T*T;
    var E=1-0.002516*T-0.0000074*T*T;
    function d(x){return ((x%360)+360)%360*Math.PI/180;}
    var M=d(2.5534+29.10535669*k-0.0000218*T*T-0.00000011*T*T*T);
    var Mp=d(201.5643+385.81693528*k+0.0107582*T*T+0.00001238*T*T*T-0.000000058*T*T*T*T);
    var F=d(160.7108+390.67050284*k-0.0016118*T*T-0.00000227*T*T*T+0.000000011*T*T*T*T);
    var Om=d(124.7746-1.56375588*k+0.0020672*T*T+0.00000215*T*T*T);
    var A1=d(299.77+0.107408*k-0.009173*T*T),A2=d(251.88+0.016321*k),A3=d(251.83+26.651886*k),A4=d(349.42+36.412478*k),
        A5=d(84.66+18.206239*k),A6=d(141.74+53.303771*k),A7=d(207.14+2.453732*k),A8=d(154.84+7.306860*k),
        A9=d(34.52+27.261239*k),A10=d(207.19+0.121824*k),A11=d(291.34+1.844379*k),A12=d(161.72+24.198154*k),
        A13=d(239.56+25.513099*k),A14=d(331.55+3.592518*k);
    var S=Math.sin;
    var corr=-0.40720*S(Mp)+0.17241*E*S(M)+0.01608*S(2*Mp)+0.01039*S(2*F)+0.00739*E*S(Mp-M)-0.00514*E*S(Mp+M)+0.00208*E*E*S(2*M)
      -0.00111*S(Mp-2*F)-0.00057*S(Mp+2*F)+0.00056*E*S(2*Mp+M)-0.00042*S(3*Mp)+0.00042*E*S(M+2*F)+0.00038*E*S(M-2*F)
      -0.00024*E*S(2*Mp-M)-0.00017*S(Om)-0.00007*S(Mp+2*M)+0.00004*S(2*Mp-2*F)+0.00004*S(3*M)+0.00003*S(Mp+M-2*F)
      +0.00003*S(2*Mp+2*F)-0.00003*S(Mp+M+2*F)+0.00003*S(Mp-M+2*F)-0.00002*S(Mp-M-2*F)-0.00002*S(3*Mp+M)+0.00002*S(4*Mp);
    var pl=0.000325*S(A1)+0.000165*S(A2)+0.000164*S(A3)+0.000126*S(A4)+0.000110*S(A5)+0.000062*S(A6)+0.000060*S(A7)
      +0.000056*S(A8)+0.000047*S(A9)+0.000042*S(A10)+0.000040*S(A11)+0.000037*S(A12)+0.000035*S(A13)+0.000023*S(A14);
    return JDE+corr+pl;
  }
  function newMonthStartJDN(k){return Math.floor(newMoonJDE(k)+7/24+0.5)+1;}
  var K_REF=327, Y_REF=1448;
  function getHijriDate(date){
    var jdn=toJDN(date.getFullYear(),date.getMonth()+1,date.getDate());
    var k=Math.round((date.getFullYear()+date.getMonth()/12-2000)*12.3685), g=0;
    while(newMonthStartJDN(k)>jdn&&g<36){k--;g++;}
    while(newMonthStartJDN(k+1)<=jdn&&g<36){k++;g++;}
    var total=Y_REF*12+(k-K_REF);
    return {year:Math.floor(total/12),month:((total%12)+12)%12,day:jdn-newMonthStartJDN(k)+1};
  }

  /* ===== Tampilan ===== */
  var days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  var months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  function pad(n){return (n<10?'0':'')+n;}
  function fmt(m){m=((m%1440)+1440)%1440;return pad(Math.floor(m/60))+':'+pad(m%60);}
  var LABELS=[['subuh','Subuh'],['terbit','Terbit'],['dzuhur','Dzuhur'],['ashar','Ashar'],['maghrib','Maghrib'],['isya','Isya']];

  function remain(diff){
    var sec=Math.floor(diff*60);
    if(sec<=0) return 'sudah lewat';
    return pad(Math.floor(sec/3600))+':'+pad(Math.floor(sec%3600/60))+':'+pad(sec%60);
  }

  function dateLabels(now){
    var h=getHijriDate(now);
    return {
      masehi: days[now.getDay()]+', '+now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear(),
      hijri: h.day+' '+hijriMonthNames[h.month]+' '+h.year+' H'
    };
  }

  function renderBar(){
    var bar=document.getElementById('prayBar'); if(!bar) return;
    var oldTimes=bar.querySelector('.pray-times'), keepScroll=oldTimes?oldTimes.scrollLeft:0;
    var now=new Date(), t=compute(now), nowM=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
    var nextIdx=-1;
    for(var i=0;i<LABELS.length;i++){ if(t[LABELS[i][0]]>nowM){nextIdx=i;break;} }
    var lab=dateLabels(now);
    var html='<div class="pray-date"><strong>'+lab.masehi+'</strong><span class="pray-sep">•</span><span class="pray-hijri">'+lab.hijri+'</span></div><div class="pray-times">';
    LABELS.forEach(function(l,i){
      html+='<div class="pray-t'+(i===nextIdx?' is-next':'')+'"><span class="pn">'+l[1]+'</span><span class="pv">'+fmt(t[l[0]])+'</span><span class="pr">'+remain(t[l[0]]-nowM)+'</span></div>';
    });
    html+='</div>';
    var nextName,diffMin;
    if(nextIdx>=0){nextName=LABELS[nextIdx][1];diffMin=t[LABELS[nextIdx][0]]-nowM;}
    else{nextName='Subuh';diffMin=1440-nowM+compute(new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)).subuh;}
    var cd=remain(diffMin);
    html+='<div class="pray-next">'+nextName+' dalam <strong>'+cd+'</strong></div>';
    bar.innerHTML=html;
    var nt=bar.querySelector('.pray-times'); if(nt&&keepScroll) nt.scrollLeft=keepScroll;
  }

  window.MasjidWaktuSholat={compute:compute,getHijriDate:getHijriDate,config:CONFIG,fmt:fmt,remain:remain,dateLabels:dateLabels};
  function init(){
    renderBar(); setInterval(renderBar,1000);
    document.dispatchEvent(new CustomEvent('waktusholat-ready'));
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
