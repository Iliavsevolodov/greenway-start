const screens=[...document.querySelectorAll('.screen')],tasks=[...document.querySelectorAll('[data-task]')],nextBtns=[...document.querySelectorAll('[data-next]')],backBtns=[...document.querySelectorAll('[data-back]')],finishBtn=document.getElementById('finishBtn'),stepLabel=document.getElementById('stepLabel'),stepTitle=document.getElementById('stepTitle'),dots=document.getElementById('dots'),resetBtn=document.getElementById('resetBtn'),toast=document.getElementById('toast'),confetti=document.getElementById('confetti'),openCards=[...document.querySelectorAll('.open')];
const KEY='greenway-start-yellow-v2',TITLES=['Командный чат','Компания Greenway','Приложение Greenway'];let current=0;
function makeDots(){dots.innerHTML='';screens.forEach(()=>dots.insertAdjacentHTML('beforeend','<div class="dot"></div>'))}
function read(){try{return JSON.parse(localStorage.getItem(KEY))||{current:0,tasks:{}}}catch{return{current:0,tasks:{}}}}
function save(){const s={};tasks.forEach(t=>s[t.dataset.task]=t.checked);localStorage.setItem(KEY,JSON.stringify({current,tasks:s}))}
function done(i){const list=tasks.filter(t=>t.dataset.task.startsWith(i+'-'));return list.length?list.every(t=>t.checked):false}
function note(t){toast.textContent=t;toast.classList.add('show');clearTimeout(note.t);note.t=setTimeout(()=>toast.classList.remove('show'),1600)}
function party(){confetti.innerHTML='';for(let i=0;i<34;i++){const p=document.createElement('span');p.className='confetti-piece';p.textContent=['✨','●','◆','✳','💛'][Math.floor(Math.random()*5)];p.style.left=Math.random()*100+'%';p.style.color=['#f6c400','#15120d','#2f7d4a','#ffe67a'][Math.floor(Math.random()*4)];p.style.animationDelay=Math.random()*.25+'s';confetti.appendChild(p)}setTimeout(()=>confetti.innerHTML='',1700)}
function update(){stepLabel.textContent='Шаг '+(current+1)+' из '+screens.length;stepTitle.textContent=TITLES[current]||'Запуск';document.querySelectorAll('.dot').forEach((d,i)=>{d.classList.toggle('active',i===current);d.classList.toggle('done',done(i))});nextBtns.forEach(b=>{const p=Number(b.closest('.screen').dataset.step);b.disabled=!done(p)});if(finishBtn)finishBtn.disabled=!done(2);save()}
function show(i,toastMsg=false){current=Math.max(0,Math.min(i,screens.length-1));screens.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===current));update();window.scrollTo({top:0,behavior:'smooth'});if(toastMsg)note('Открыт шаг '+(current+1))}
function restore(){const s=read();current=Number.isInteger(s.current)?s.current:0;tasks.forEach(t=>t.checked=!!s.tasks?.[t.dataset.task]);show(current,false)}
tasks.forEach(t=>t.addEventListener('change',()=>{const i=Number(t.dataset.task.split('-')[0]);update();if(done(i)){note('Шаг '+(i+1)+' выполнен');party()}else note('Отмечено')}));
nextBtns.forEach(b=>b.addEventListener('click',()=>{if(!b.disabled)show(Number(b.dataset.next),true)}));
backBtns.forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.back),true)));
if(finishBtn)finishBtn.addEventListener('click',()=>{if(!finishBtn.disabled){note('Три шага выполнены');party()}});
resetBtn.addEventListener('click',()=>{tasks.forEach(t=>t.checked=false);current=0;localStorage.removeItem(KEY);show(0,false);note('Прогресс сброшен')});
openCards.forEach(c=>c.addEventListener('click',()=>{openCards.forEach(x=>x.classList.remove('active'));c.classList.add('active')}));
makeDots();restore();