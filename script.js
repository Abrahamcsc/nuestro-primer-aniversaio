/* Cover, transition, and precisely timed song-scene orchestration. */
const cover = document.querySelector('.cover');
const letter = document.querySelector('.letter');
const transition = document.querySelector('.transition');
const readyButton = document.querySelector('.ready-button');
const cleanPause = document.querySelector('.clean-pause');
const songScene = document.querySelector('.song-scene');
const songAudio = document.querySelector('#song-audio');
const universeCanvas = document.querySelector('.universe-canvas');
const lyricPrevious = document.querySelector('.lyric--previous');
const lyricCurrent = document.querySelector('.lyric--current');
const lyricNext = document.querySelector('.lyric--next');
const leftPhoto = document.querySelector('#left-photo');
const rightPhoto = document.querySelector('#right-photo');
const photoCluster = document.querySelector('#photo-cluster');
const storyThreshold = document.querySelector('#story-threshold');
const storyScene = document.querySelector('#story-scene');
const storyAudio = document.querySelector('#story-audio');
const storyTitle = document.querySelector('#story-title');
const storyFragments = document.querySelector('.story-fragments');
const storyGallery = document.querySelector('.story-gallery');
const storyNext = document.querySelector('.story-next');
const storyBack = document.querySelector('.story-back');
const storyStart = document.querySelector('.story-start');
const storyCount = document.querySelector('.story-progress__count');
const storyChapterNumber = document.querySelector('#story-chapter-number');
const storyProgressLine = document.querySelector('.story-progress__line i');
const globalChapterNav = document.querySelector('#global-chapter-nav');
const globalChapterPrev = globalChapterNav?.querySelector('.global-chapter-nav__prev');
const globalChapterNext = globalChapterNav?.querySelector('.global-chapter-nav__next');
const globalChapterCurrent = globalChapterNav?.querySelector('.global-chapter-nav__current');
const letterSection = document.querySelector('#letter-section');
const letterFlow = document.querySelector('#letter-flow');
const letterAudioToggle = document.querySelector('.letter-final__audio-toggle');
const cartaAudioSrc = 'audio/out-of-my-league.mp3';
const globalChapters = [
  {name:'Make You Stay', enter:()=>showGlobal(songScene)},
  {name:'Nuestra Historia', enter:()=>showGlobal(storyThreshold)},
  {name:'Todo lo que nos falta vivir', enter:()=>showGlobal(futureStory)},
  {name:'Un pequeño universo de nosotros', enter:()=>showGlobal(universeSection)},
  {name:'Carta para ti', enter:()=>showGlobal(letterSection)}
];
let globalChapterIndex = 0;
function showGlobal(target){
  const wasPlaying = [songAudio, storyAudio, futureAudio, universeAudio].some((audio) => audio && !audio.paused);
  storyAudio.pause(); songAudio.pause(); futureAudio.pause(); universeAudio?.pause();
  transition.classList.remove('is-visible','is-leaving'); transition.setAttribute('aria-hidden','true'); cleanPause.classList.remove('is-visible');
  document.body.classList.remove('entering-transition');
  cover.classList.add('is-hidden'); cover.setAttribute('aria-hidden','true');
  [songScene,storyThreshold,storyScene,futureThreshold,futureStory,universeSection,letterSection].forEach((el)=>{if(el){el.classList.remove('is-visible');el.setAttribute('aria-hidden','true')}});
  if(target===cover){cover.classList.remove('is-hidden');cover.classList.add('is-visible');cover.setAttribute('aria-hidden','false');}
  else if(target===storyThreshold){
    storyScene.classList.add('is-visible'); storyScene.setAttribute('aria-hidden','false');
    renderStoryChapter(0); storyAudio.currentTime=0; storyAudio.volume=.68;
    if(wasPlaying) storyAudio.play().catch(()=>{});
  } else if(target===futureStory){
    futureStory.classList.add('is-visible'); futureStory.setAttribute('aria-hidden','false'); futureEnding.hidden=true;
    futureAudio.src = 'audio/Taylor Swift - Lover.mp3'; futureAudio.loop = false; futureAudio.load();
    renderFuture(0); futureAudio.currentTime=0; futureAudio.volume=.68;
    if(wasPlaying) futureAudio.play().catch(()=>{});
  } else if(target===futureEnding){futureStory.classList.add('is-visible');futureStory.setAttribute('aria-hidden','false');futureEnding.hidden=false;}
  else if(target===letterSection){
    letterSection.classList.add('is-visible'); letterSection.setAttribute('aria-hidden','false');
    futureAudio.src = cartaAudioSrc; futureAudio.loop = true; futureAudio.load(); futureAudio.currentTime = 0;
    renderLetter();
    if(wasPlaying) futureAudio.play().catch(()=>{});
    window.setTimeout(()=>{const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;letterSection.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});updateLetterCamera();},40);
  }
  else if(target){
    target.classList.add('is-visible'); target.setAttribute('aria-hidden','false');
    if(target===songScene){
      songAudio.currentTime=0;
      beginSongScene();
      renderLyrics(); photoDirector(songAudio.currentTime); schedulePhotoPreload(songAudio.currentTime);
      if(wasPlaying) songAudio.play().catch(()=>{});
    }
    if(target===universeSection&&wasPlaying)universeAudio.play().catch(()=>{});
  }
}
function renderGlobalNav(){if(!globalChapterNav)return;globalChapterCurrent.textContent=globalChapters[globalChapterIndex].name;globalChapterPrev.querySelector('span').textContent=globalChapterIndex?globalChapters[globalChapterIndex-1].name:'';globalChapterNext.querySelector('span').textContent=globalChapterIndex<globalChapters.length-1?globalChapters[globalChapterIndex+1].name:'';globalChapterPrev.hidden=globalChapterIndex===0;globalChapterNext.hidden=globalChapterIndex===globalChapters.length-1;}
function activateGlobalNav(){globalChapterNav.hidden=false;globalChapterNav.classList.add('is-active');document.querySelector('.universe-nav')?.setAttribute('hidden','true');renderGlobalNav();}
function moveGlobalChapter(delta){globalChapterIndex=Math.max(0,Math.min(globalChapters.length-1,globalChapterIndex+delta));globalChapters[globalChapterIndex].enter();renderGlobalNav();}
globalChapterPrev?.addEventListener('click',()=>moveGlobalChapter(-1));
globalChapterNext?.addEventListener('click',()=>moveGlobalChapter(1));
const storyAudioToggle = document.querySelector('.story-audio-toggle');
const futureThreshold = document.querySelector('#future-threshold');
const futureStory = document.querySelector('#future-story');
const futureAudio = document.querySelector('#future-audio');
const futureStart = document.querySelector('.future-start');
const futureChapters = Array.from(document.querySelectorAll('.future-chapter'));
const futureEnding = document.querySelector('.future-ending');
const futureAudioToggle = document.querySelector('.future-audio-toggle');
const futureBackToStory = document.querySelector('.future-back-to-story');
let futureIndex = 0;
const futureData = [
  {key:'kiss', photos:['beso 1.JPEG','beso 2.JPEG','beso 3.JPEG','beso 4.JPEG'], text:['Hay algo que todavía me emociona imaginar, sueño con que llegue el momento de poder vernos frente a frente y saber que no hay una pantalla en medio de nosotros, poder juntar tus labios con los mios, y decirnos lo mucho que nos amamos, sueño con un dia sentir tu piel. poder sentir tu cuerpo en mis brazos y no soltarte nunca.','Quiero descubrir contigo esa parte de nuestro amor que todavía no hemos podido vivir, con confianza, cariño y paciencia.','Quiero que nuestra intimidad también sea algo maravilloso, algo nuestro, algo que podamos descubrir juntos y recordar con una sonrisa.','Porque a pesar de tantos kilómetros de distancia yo jamas dejare de desearte mi amor.']},
  {key:'wedding', photos:['boda 1.png','boda 2.png','boda3.png','boda 4.png'], text:['Me imagino viéndote ese día y pensando en todo lo que tuvimos que pasar para llegar hasta ahí.','En todas nuestras llamadas, nuestras noches hablando, los momentos bonitos, los difíciles y todas las veces que a pesar de estar tan lejos, seguimos formando parte de la vida del otro.','Quiero que algún día podamos tener ese momento que tantas veces hemos imaginado. Poder tomar tu mano, abrazarte, mirarte a los ojos y saber que después de tanto tiempo ya no tenemos que despedirnos detrás de una pantalla.','Y aunque todavía falta muchísimo para ese día, sueño todos los dias con ese momento. Porque no sé cómo será nuestra boda, ni dónde será, ni qué ropa llevaremos, ni cómo la vayamos a pagar. Pero sí sé algo.','Si algún día llegamos hasta ahí, quiero que seas tú.','por que yo te quiero tener hasta el ultimo dia de mi vida.']},
  {key:'travel', photos:['viajes 1.png','viajes 2.png','viajes 3.png','viajes 4.png'], text:['Quiero conocer lugares nuevos contigo, caminar por calles que nunca hemos visto, probar comidas que nunca hemos comido y terminar riéndonos de cualquier cosa aunque ya no sepamos a donde ir.','QUIERO MILES DE VIAJES JUNTO A TI','Quiero playas, ciudades, lugares tranquilos, lugares llenos de gente y también esos pequeños lugares en silencio donde solo seremos tú y yo.','Quiero tomar muchísimas fotos contigo, pero también quiero tener momentos en los que simplemente guardemos el teléfono y disfrutemos de solo saber que uno esta al lado del otro en un lugar hermoso.','Porque viajar contigo no sería solamente conocer cada vez nuevos lugares, tambien seria llevarnos recuerdos inolvidables que recordaremos para toda la vida.','Porque quiero que tengamos todos esos álbumes que dijimos que tendriamos y me encanta pensar que algún día podremos llenarlas juntos. 🤍']}
  ,{key:'family', photos:['familia 1.png','familia 2.png','familia 3.png','familia 4.png'], text:['A veces me pongo a imaginar cómo sería despertar un día y saber que ya no estamos separados por una pantalla, que esta vez cuando abra los ojos voy a saber que estás ahí.','Quiero que tengamos nuestro propio lugar, uno que podamos llamar nuestro. No importa si al principio es pequeño, si no tenemos todo lo que queremos o si todavía nos falta muchísimo por conseguir. Quiero que sea nuestro porque lo vamos a construir juntos.','Me imagino nuestras cosas por todos lados, fotos de nuestros viajes, recuerdos de todos estos años, nuestras canciones sonando mientras hacemos cualquier cosa y hasta esas pequeñas cosas tontas que solo nosotros entenderíamos JAJAJA.','Quiero llegar a casa después de un día largo y encontrarte ahí. Poder abrazarte, preguntarte cómo estuvo tu día y sentir que por fin estoy exactamente donde quiero estar.','Quiero que tengamos nuestras propias rutinas, cocinar juntos, ver películas acostados, salir en auto sin saber exactamente a dónde vamos, comprar cosas para la casa aunque probablemente terminemos discutiendo cuál elegir JAJAJA.','Y sobre todo quiero que nuestro hogar no sea solamente una casa. Quiero que sea el lugar al que siempre queramos volver.','Porque después de tantos kilómetros, tantas despedidas y tanto tiempo esperando poder estar juntos, mi sueño más grande no es tener una casa enorme ni una vida perfecta. Es simplemente tener una vida contigo. 🤍']}
];
const futureImagePath = (name) => encodeURI(`images/future/${name}`);
const cartaText = `No sé cómo empezar esta carta, porque siento que hay demasiado que quiero decirte y, aun así, ninguna palabra parece suficiente para explicar todo lo que has significado para mí durante este año.

Pero hay algo que quiero que recuerdes por encima de todo:

la confianza que me diste.

Y no, no hablo de pequeñas demostraciones.
Nunca fueron pequeñas.

Fueron demostraciones enormes, constantes, profundas y, para mí, sin tamaño ni límite.

Me diste muchísimo de ti.

Me diste tu tiempo, tu atención, tus sentimientos, tus recuerdos, tus pensamientos, tus momentos más vulnerables y tantas partes de tu vida que decidiste compartir conmigo porque confiabas en mí.

Y creo que eso es de las cosas que más voy a valorar de nuestra historia.

Porque confiar realmente en alguien significa dejarlo entrar.

Significa permitirle conocerte de verdad.

Significa mostrarle partes de ti que no necesariamente le mostrarías a cualquiera.

Y tú hiciste eso conmigo una y otra vez.

Me dejaste entrar en tu mundo.

Me mostraste quién eres cuando estabas feliz, cuando estabas triste, cuando estabas cansado, cuando querías hablar de absolutamente cualquier cosa y también cuando simplemente necesitabas que yo estuviera ahí.

Me diste una confianza que nunca sentí pequeña.

Al contrario.

Muchas veces pensé:

“¿Cómo puede alguien confiar tanto en mí?”

y no por que no deberias , sino porque es tan infinita que todavía hoy me parece increíble.

Porque fueron tantas cosas, tantas veces y tantas maneras distintas de demostrarme que me querías y sería imposible resumirlas en una sola frase.

Me consentiste muchísimo.

Hiciste cosas por mí simplemente porque sabías que me hacían muy feliz.

Escuchaste mis ideas, aceptaste mis ocurrencias, seguiste mis locuras, encontraste maneras de sorprenderme y muchísimas veces pusiste una sonrisa en mi cara solamente porque querías verme feliz.

Y eso significa muchísimo para mí.

Porque detrás de cada una de esas cosas había algo mucho más grande:

tú pensando en mí.

Tú queriendo hacerme feliz.

Tú queriendo demostrarme cuánto me amabas.

Y eso lo sentí.

Lo vi.

Lo guardé.

Lo recuerdo.

No fueron una ni dos demostraciones.

Fueron muchísimas.

Sin medida.

Y cada una de ellas fue formando esa historia que hoy estoy mirando con una sonrisa.

Hay algo todavía más importante que todo lo que hiciste:

la confianza que pusiste en mí para hacerlo.

Porque cada vez que compartiste conmigo algo importante, cada vez que te abriste, cada vez que me dejaste conocer una parte más profunda de ti, entendí que estabas entregándome algo que valía muchísimo.

Y quiero que sepas que nunca consideré eso algo normal.

Nunca lo vi como algo que simplemente “tenía que pasar”.

Lo valoré.

Lo sigo valorando.

Y probablemente siempre lo voy a valorar.

Me diste una cercanía que, estando tan lejos, parecía imposible.

Hiciste que una llamada pudiera convertirse en mi momento favorito del día.

Hiciste que una simple conversación pudiera quedarse en mi cabeza durante horas.

Y convertiste kilómetros en recuerdos.

Por eso, cuando pienso en nosotros, no solamente pienso en todo lo que vivimos.

Pienso en todo lo que me entregaste de ti con confianza.

Y quiero cuidar eso.

Quiero cuidar todo lo que me contaste.

TODO LO QUE ME MOSTRASTE.

Todo lo que compartiste conmigo.

Todo lo que alguna vez decidiste confiarme.

Porque sé perfectamente que no cualquiera recibe ese nivel de confianza.

Y yo tuve la suerte de recibirla de ti.

También quiero que recuerdes que cada vez que me demostraste que me amabas, yo lo noté.

Quizás no siempre supe expresarlo.

Quizás no siempre encontré las palabras correctas.

Pero lo vi.

Vi cada esfuerzo.

Cada llamada.

Cada noche.

Cada conversación.

Cada vez que intentaste hacerme feliz.

Cada vez que buscaste una manera de consentirme.

Cada vez que pensaste en mí.

Cada vez que me dejaste acercarme un poquito más.

Todo eso fue amor para mí.

Y cuando pienso en este primer año, siento que una de las cosas más bonitas que me dejó fue precisamente eso:

saber que hubo una persona al otro lado de tantos kilómetros que decidió confiar en mí de una manera tan grande.

Una persona que me permitió conocerla profundamente.

Una persona que me entregó tanto de sí misma.

Y una persona que, de mil maneras diferentes, me hizo sentir querida, importante y amada.

Por todo eso, gracias.

Gracias por confiar en mí.

Gracias por dejarme conocerte.

Gracias por compartir conmigo tantas partes de tu vida.

Gracias por consentirme.

Gracias por querer hacerme feliz.

Gracias por demostrarme tu amor tantas veces y de tantas maneras.

Gracias por todo lo que hiciste por mí.

Pero, sobre todo...

gracias por entregarme una confianza tan grande.

Porque entre todas las cosas que una persona puede darle a otra, creo que esa es una de las más bonitas.

Y tú me diste muchísimo.

Más de lo que probablemente pueda explicar en una sola carta.

Así que quiero que algún día, cuando volvamos a mirar todo esto, recuerdes algo:

yo nunca voy a olvidar todo lo que hiciste por mí.

Nunca voy a olvidar todo lo que compartiste conmigo.

Nunca voy a olvidar la confianza que me diste.

Nunca voy a olvidar todas las maneras en las que me demostraste que me amabas.

Y nunca voy a olvidar este primer año.

Tal vez algún día volvamos a leer esta carta y nos riamos de quiénes éramos ahora.

Tal vez la vida nos lleve por caminos que todavía ni siquiera imaginamos.

Tal vez cambien muchísimas cosas.

Pero una cosa sí sé:

esta parte de nuestra historia siempre va a existir, TU y YO , NUESTRA VIDA JUNTOS NUNCA DEJARA DE CRECER.

Este año fue nuestro.

Nuestros recuerdos.

Nuestras llamadas.

Nuestras noches.

Nuestras risas.

Nuestras locuras.

Nuestra confianza.

Nuestro amor.

Y todavía nos queda muchísimo por vivir.

Así que, por ahora, solamente quiero terminar diciendo algo que probablemente ya sabes, pero que nunca me cansaré de repetir:

gracias por entregarme tanto de ti.

Y gracias por dejarme formar parte de tu mundo.

Te amo con todo lo que soy, mi rey.

— Abraham`;
const cartaEmphasis = new Set(['la confianza que me diste.','Nunca fueron pequeñas.','sin tamaño ni límite.','Me dejaste entrar en tu mundo.','“¿Cómo puede alguien confiar tanto en mí?”','Sin medida.','la confianza que pusiste en mí para hacerlo.','Lo valoré.','TODO LO QUE ME MOSTRASTE.','yo tuve la suerte de recibirla de ti.','Todo eso fue amor para mí.','gracias por entregarme una confianza tan grande.','yo nunca voy a olvidar todo lo que hiciste por mí.','Nunca voy a olvidar todas las maneras en las que me demostraste que me amabas.','esta parte de nuestra historia siempre va a existir, TU y YO , NUESTRA VIDA JUNTOS NUNCA DEJARA DE CRECER.','Nuestro amor.','gracias por entregarme tanto de ti.','Te amo con todo lo que soy, mi rey.','— Abraham']);
function renderLetter(){
  if(!letterFlow || letterFlow.childElementCount) return;
  cartaText.split(/\n\n+/).forEach((block,index)=>{
    const article=document.createElement('article'); article.className='letter-block'; article.dataset.index=index;
    const p=document.createElement('p'); p.textContent=block; if(cartaEmphasis.has(block)) article.classList.add('letter-block--emphasis');
    if(block==='Todo eso fue amor para mí.') article.classList.add('letter-block--heart');
    if(block.startsWith('esta parte de nuestra historia')) article.classList.add('letter-block--climax');
    if(block==='Este año fue nuestro.') article.classList.add('letter-block--sequence-start');
    if(['Nuestros recuerdos.','Nuestras llamadas.','Nuestras noches.','Nuestras risas.','Nuestras locuras.','Nuestra confianza.','Nuestro amor.'].includes(block)) article.classList.add('letter-block--sequence');
    if(block==='Te amo con todo lo que soy, mi rey.') article.classList.add('letter-block--final');
    article.append(p); letterFlow.append(article);
  });
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');if(entry.target.classList.contains('letter-block--heart'))letterSection.classList.add('is-heartbeat');if(entry.target.classList.contains('letter-block--climax'))letterSection.classList.add('is-climax');if(!entry.target.classList.contains('letter-block--final'))observer.unobserve(entry.target);}}),{threshold:reduced?.05:.18});
  letterFlow.querySelectorAll('.letter-block').forEach((block)=>observer.observe(block));
}
let letterScrollFrame = 0;
function updateLetterCamera(){
  letterScrollFrame = 0;
  if(!letterSection?.classList.contains('is-visible')) return;
  const rect = letterSection.getBoundingClientRect();
  const total = Math.max(1, letterSection.offsetHeight - window.innerHeight);
  const progress = Math.max(0, Math.min(1, -rect.top / total));
  const sample = (stops) => {
    for(let i=1;i<stops.length;i++){
      const [end, endValue] = stops[i];
      if(progress <= end){
        const [start, startValue] = stops[i-1];
        const amount = (progress-start)/(end-start);
        return startValue+(endValue-startValue)*amount;
      }
    }
    return stops[stops.length-1][1];
  };
  letterSection.style.setProperty('--letter-progress', progress.toFixed(4));
  const warmth = sample([[0,0],[.22,.3],[.4,1],[.62,.86],[.78,.12],[1,1]]);
  const finalBlock = letterFlow?.querySelector('.letter-block--final');
  const finalTop = finalBlock?.getBoundingClientRect().top ?? Infinity;
  letterSection.classList.toggle('is-final', finalTop < window.innerHeight * .65);
  letterSection.style.setProperty('--letter-warmth', warmth.toFixed(4));
  letterSection.style.setProperty('--letter-night-alpha', sample([[0,1],[.2,.78],[.36,0],[.58,0],[.74,.88],[.88,.48],[1,0]]).toFixed(4));
  letterSection.style.setProperty('--letter-dawn-alpha', sample([[0,0],[.2,.16],[.37,1],[.58,1],[.74,.18],[.88,.72],[1,1]]).toFixed(4));
  letterSection.style.setProperty('--letter-camera-x', `${(-1.3*progress).toFixed(3)}vw`);
  letterSection.style.setProperty('--letter-camera-y', `${(-1.4*progress).toFixed(3)}vh`);
  letterSection.style.setProperty('--letter-camera-scale', (1.025+.035*progress).toFixed(4));
  letterSection.style.setProperty('--letter-stars-opacity', (.65-.36*progress).toFixed(4));
  letterSection.style.setProperty('--letter-stars-x1', `${(-35*progress).toFixed(2)}px`);
  letterSection.style.setProperty('--letter-stars-y1', `${(40*progress).toFixed(2)}px`);
  letterSection.style.setProperty('--letter-stars-x2', `${(55*progress).toFixed(2)}px`);
  letterSection.style.setProperty('--letter-stars-y2', `${(-28*progress).toFixed(2)}px`);
  letterSection.style.setProperty('--letter-moon-x', `${(-10*progress).toFixed(3)}vw`);
  letterSection.style.setProperty('--letter-moon-y', `${(29*progress).toFixed(3)}vh`);
  letterSection.style.setProperty('--letter-moon-scale', (1-.18*progress).toFixed(4));
  letterSection.style.setProperty('--letter-moon-opacity', (.78-.52*progress).toFixed(4));
  letterSection.style.setProperty('--letter-dust-opacity', (.13+warmth*.2).toFixed(4));
  letterSection.style.setProperty('--letter-dust-x1', `${(-18*progress).toFixed(2)}px`);
  letterSection.style.setProperty('--letter-dust-y1', `${(-8*progress).toFixed(2)}vh`);
  letterSection.style.setProperty('--letter-dust-x2', `${(28*progress).toFixed(2)}px`);
  letterSection.style.setProperty('--letter-dust-y2', `${(5*progress).toFixed(2)}vh`);
  letterSection.style.setProperty('--letter-intro-y', `${(-18*progress).toFixed(2)}vh`);
  letterSection.style.setProperty('--letter-intro-opacity', Math.max(0,1-progress*55).toFixed(4));
  letterSection.style.setProperty('--letter-overlay-opacity', (1-warmth*.12).toFixed(4));
  letterSection.style.setProperty('--letter-mobile-y', `${(-1.5*progress).toFixed(2)}vh`);
  letterSection.style.setProperty('--letter-mobile-overlay-opacity', (.9-warmth*.2).toFixed(4));
}
window.addEventListener('scroll',()=>{if(letterSection?.classList.contains('is-visible')&&!letterScrollFrame)letterScrollFrame=requestAnimationFrame(updateLetterCamera)},{passive:true});
function renderFuture(index){
  futureIndex = Math.max(0, Math.min(futureData.length - 1, index));
  futureChapters.forEach((chapter, chapterIndex) => { chapter.hidden = chapterIndex !== futureIndex; });
  const chapter = futureChapters[futureIndex]; const data = futureData[futureIndex];
  const text = chapter.querySelector('.future-text'); text.replaceChildren();
  data.text.forEach((line, i) => { const p = document.createElement('p'); p.textContent = line; p.style.setProperty('--future-delay', `${i * .16}s`); if (line === 'Si algún día llegamos hasta ahí, quiero que seas tú.' || line === 'QUIERO MILES DE VIAJES JUNTO A TI') p.classList.add('future-emphasis'); text.append(p); });
  const photos = chapter.querySelector('.future-photos'); photos.replaceChildren();
  data.photos.forEach((name, i) => { const figure = document.createElement('figure'); figure.className = `future-photo future-photo--${i + 1}`; figure.style.setProperty('--future-delay', `${i * .18}s`); const img = document.createElement('img'); img.src = futureImagePath(name); img.alt = ''; img.loading = i < 2 ? 'eager' : 'lazy'; figure.append(img); photos.append(figure); });
}
function openFuture(){ storyAudio.pause(); futureAudio.pause(); futureAudio.src='audio/Taylor Swift - Lover.mp3'; futureAudio.loop=false; futureAudio.load(); futureThreshold.classList.remove('is-visible'); futureThreshold.setAttribute('aria-hidden','true'); futureStory.classList.add('is-visible'); futureStory.setAttribute('aria-hidden','false'); futureIndex=0; renderFuture(0); futureAudio.currentTime=0; futureAudio.volume=.68; futureAudio.play().catch((error) => console.warn('[future-audio] Playback failed:', error.name)); }
if (futureStart) futureStart.addEventListener('click', openFuture);
futureChapters.forEach((chapter, index) => { chapter.querySelectorAll('.future-next').forEach((button) => button.addEventListener('click', () => { if (index < futureData.length - 1) renderFuture(index + 1); else { chapter.hidden=true; futureEnding.hidden=false; } })); chapter.querySelectorAll('.future-prev').forEach((button) => button.addEventListener('click', () => renderFuture(index - 1))); });
if (futureAudioToggle) futureAudioToggle.addEventListener('click', () => { if (futureAudio.paused) { futureAudio.play(); futureAudioToggle.textContent='Ⅱ'; futureAudioToggle.setAttribute('aria-label','Pausar música'); } else { futureAudio.pause(); futureAudioToggle.textContent='▶'; futureAudioToggle.setAttribute('aria-label','Reanudar música'); } });
if (futureBackToStory) futureBackToStory.addEventListener('click', () => { futureAudio.pause(); futureStory.classList.remove('is-visible'); futureStory.setAttribute('aria-hidden','true'); storyScene.classList.add('is-visible'); storyScene.setAttribute('aria-hidden','false'); });
if (storyAudioToggle) storyAudioToggle.addEventListener('click', () => { if (storyAudio.paused) { futureAudio.pause(); songAudio.pause(); storyAudio.play(); storyAudioToggle.textContent='Ⅱ'; storyAudioToggle.setAttribute('aria-label','Pausar música'); } else { storyAudio.pause(); storyAudioToggle.textContent='▶'; storyAudioToggle.setAttribute('aria-label','Reanudar música'); } });
const universeSection = document.querySelector('#universe-section');
const universeAudio = document.querySelector('#universe-audio');
const universeOpen = document.querySelector('.universe-open');
const universeToggle = document.querySelector('.universe-audio-toggle');
const universeObjects = document.querySelector('.universe-objects');
const universeModal = document.querySelector('.universe-modal');
const universeModalTitle = universeModal?.querySelector('h3');
const universeModalText = universeModal?.querySelector('p');
const universeClose = universeModal?.querySelector('.universe-close');
const universePrev = document.querySelector('.universe-nav__prev');
const universeNext = document.querySelector('.universe-nav__next');
const universeNextLetter = document.querySelector('.universe-next-letter');
const universeData = [
  ['💙','Risas','Me encanta cómo contigo puedo reírme hasta por las cosas más tontas que solo nosotros entendemos.'],['📞','Llamadas','Nuestras llamadas se convirtieron en la parte favorita y mas importante de mis días..'],['🌙','Noches','Las noches son el momento en donde más te deseo y muchas de mis noches favoritas tienen algo en común: terminaban contigo.'],['🍂','Octubre','Octubre siempre tendrá algo especial para mí, porque inevitablemente siempre me hace y me hará pensar en nosotros.'],['🇵🇪','Perú','Es mi mundo, y algún día quiero poder enseñártelo mientras estoy a tu lado.'],['🇺🇸','California','Es el lugar donde estás tú, y por eso siento que una parte de mi corazón también está allí. Es el lugar donde soñamos crear nuestra propia vida.'],['🎵','Nuestras canciones','Hay canciones que ahora escucho y sin querer me hacen pensar en ti, mientras fantaseo infinitamente en multiples escenarios ficticios contigo.'],['📸','Nuestros recuerdos','Me encanta guardar nuestros momentos en cartas, textos, fotos o videos, porque algún día podremos mirar atrás y ver todo lo que vivimos.'],['💌','Nuestro amor','No sé cómo explicarlo completamente con palabras, solo sé que te amo con todo lo que soy y que significas todo mi mundo.'],['✨','Nuestros sueños','Me encanta pensar en todo lo que todavía nos falta vivir y en todos los sueños que algún día lograremos cumplir juntos.']
];
function openUniverse(){ futureAudio.pause(); storyAudio.pause(); songAudio.pause(); universeSection.classList.remove('is-complete'); universeSection.classList.add('is-visible'); universeSection.setAttribute('aria-hidden','false'); universeAudio.currentTime=0; universeAudio.volume=.62; universeAudio.play().catch((error)=>console.warn('[universe-audio] Playback failed:',error.name)); }
function closeUniverseObject(){ universeModal.classList.remove('is-open'); universeModal.setAttribute('aria-hidden','true'); universeSection.classList.remove('has-selection'); if(universeNextLetter) universeNextLetter.hidden=!universeSection.classList.contains('is-complete'); }
if (universeOpen) universeOpen.addEventListener('click', openUniverse);
universeData.forEach(([icon,title,text], index) => { const button=document.createElement('button'); button.type='button'; button.className=`universe-object universe-object--${index+1}`; button.innerHTML=`<span class="universe-object__icon">${icon}</span><strong>${title}</strong>`; button.addEventListener('click',()=>{ universeSection.classList.add('has-selection'); if(universeNextLetter) universeNextLetter.hidden=true; universeModalTitle.textContent=title; universeModalText.textContent=text; universeModal.classList.add('is-open'); universeModal.setAttribute('aria-hidden','false'); }); universeObjects.append(button); });
if (universeClose) universeClose.addEventListener('click',closeUniverseObject);
function leaveUniverse(){ closeUniverseObject(); universeAudio.pause(); universeSection.classList.remove('is-visible'); universeSection.setAttribute('aria-hidden','true'); }
if (universePrev) universePrev.addEventListener('click',()=>{ leaveUniverse(); futureStory.classList.add('is-visible'); futureStory.setAttribute('aria-hidden','false'); futureEnding.hidden=false; });
if (universeNext) universeNext.addEventListener('click',()=>{ globalChapterIndex=globalChapters.length-1; showGlobal(letterSection); renderGlobalNav(); });
if (universeNextLetter) universeNextLetter.addEventListener('click',()=>{ closeUniverseObject(); globalChapterIndex=globalChapters.length-1; showGlobal(letterSection); renderGlobalNav(); });
if (universeToggle) universeToggle.addEventListener('click',()=>{ if(universeAudio.paused){universeAudio.play();universeToggle.textContent='Ⅱ';universeToggle.setAttribute('aria-label','Pausar música')}else{universeAudio.pause();universeToggle.textContent='▶';universeToggle.setAttribute('aria-label','Reanudar música')} });
if (letterAudioToggle) letterAudioToggle.addEventListener('click',()=>{ if(futureAudio.paused){futureAudio.play().catch(()=>{});letterAudioToggle.textContent='Ⅱ';letterAudioToggle.setAttribute('aria-label','Pausar música')}else{futureAudio.pause();letterAudioToggle.textContent='▶';letterAudioToggle.setAttribute('aria-label','Reanudar música')} });
const storyChapters = [
  { title:'Cómo empezó todo', theme:'beginning', range:[0,35], photos:['comienzo 1.jpg','comienzo 2.jpeg','comienzo 3.jpg','comienzo 4.jpg'], fragments:['Todo empezó una noche en Rave, buscando películas sin saber que me encontraría con el amor de mi vida.','No sabía que una persona podía aparecer en mi vida y terminar ocupando un lugar tan grande en ella.','Al principio no sabía todo lo que vendría después. Solo estaban esas primeras conversaciones y esa sensación extraña de querer seguir hablando contigo un poquito más, mientras nos desvelábamos hablando sobre el otro.','Sin darnos cuenta, empezamos a construir algo que todavía no sabíamos cómo llamar. Y quizá eso es lo bonito de nuestro comienzo: no anunció lo importante que sería.','Simplemente pasó. Y un día miré hacia atrás y descubrí que, sin darme cuenta, nuestra historia de amor ya había comenzado.'] },
  { title:'Cuando empezamos a enamorarnos', theme:'falling', range:[35,72], photos:['enamorarnos 1.png','enamorarnos 2.jpg','enamorarnos 3.jpg','enamorarnos 4.JPEG'], fragments:['Después llegaron las videollamadas.','Nunca olvidaré la videollamada en la cual me enamoraste con tu belleza y en donde me convencí por completo de que te quería para mí.','Me cautivaste con tus bellos ojos, el brillo de tu pelo, tu hermosa nariz, tus manos tan preciosas y, sobre todo, por tu maravillosa sonrisa que me sonrojaba con solo verla.','Poco a poco dejaste de ser solamente alguien con quien hablaba y comenzaste a ser parte de mis días. Había momentos en los que simplemente escuchar tu voz hacía que mi día se sintiera diferente.','Empezamos a enamorarnos no en un momento exacto, sino en cientos de pequeños momentos que juntos se volvían únicos.'] },
  { title:'A pesar de la distancia', theme:'distance', range:[72,108], photos:['distancia 1.JPEG','distancia 2.jpg','distancia 3.JPEG','distancia 4.JPEG'], fragments:['La distancia no fue solamente una cantidad de miles de kilómetros.','A veces era extrañarte, querer abrazarte y no poder hacerlo. Mirar una pantalla viendo un tesoro que aún no puedo tocar.','Pero también aprendimos que estar lejos no significa necesariamente sentirse lejos. Estabas en todas las notificaciones de mi teléfono, en mis pensamientos, en las canciones que escuchaba y en momentos cotidianos en los que aparecías en mi cabeza sin la necesidad de querer pensarte.','De alguna manera aprendimos a construir cercanía con tiempo, dedicación y con la decisión de seguir encontrándonos incluso desde lugares tan diferentes.'] },
  { title:'Todo lo que vivimos', theme:'living', range:[108,148], photos:['vivimos 1.JPEG','vivimos 2.JPEG','vivimos 3.JPEG','vivimos 4.JPEG'], fragments:['Nuestro primer año no fue solamente algo lleno de momentos bonitos, porque también tuvimos problemas. Pero eso solo la convierte en una historia real.','Hubo risas que todavía me hacen sonreír, recuerdos que guardaré para siempre en mi corazón y también momentos que nos hicieron aprender, cambiar y sentir cosas que no siempre fueron fáciles.','Pero incluso esos momentos forman parte de nuestra historia. Porque amar no significa solamente recordar los días perfectos.','También significa reconocer todo lo que nuestra historia nos enseñó. Y cuando pienso en todo lo que vivimos, entiendo que cada llamada, cada risa y cada recuerdo terminó formando lo especial y único que ahora tenemos.'] },
  { title:'Nuestro primer año', theme:'now', range:[148,187], photos:['ahora 1.JPEG','ahora 2.JPEG','ahora 3.JPEG','ahora 4.JPEG'], fragments:['Y entonces llegamos aquí. Un año.','Un año de videollamadas infinitas, de risas, de extrañarnos, de elegirnos todos los días, de aprender del otro poco a poco y de convertir momentos pequeños en recuerdos únicos.','¿Y sabes algo? Si pudiera volver al principio, sabiendo todo lo que vendría después, todavía elegiría conocer aquella versión de ti que ADORO en mi vida sin saber cuánto iba a significar.','Creo que eso es lo que más me gusta de nuestra historia: que no fue escrita de una sola vez. La fuimos escribiendo nosotros, día tras día, con muchísimo amor, tiempo y dedicación.','Y entre tantos millones de millones de personas, tantos lugares y tantos caminos posibles…','qué maravilloso que nuestras vidas se hayan encontrado para crear una misma historia juntos.'] }
];
let storyIndex = 0;
let storyTimer;
let storyUnlockTimer;
let storyManualOverride = false;
const storyImagePath = (name) => encodeURI(`images/historia/${name}`);
function renderStoryChapter(index, direction = 1) {
  storyIndex = Math.max(0, Math.min(storyChapters.length - 1, index));
  storyScene.classList.remove('is-complete');
  const chapter = storyChapters[storyIndex];
  storyScene.dataset.chapter = chapter.theme;
  storyTitle.textContent = chapter.title;
  storyCount.textContent = `${String(storyIndex + 1).padStart(2,'0')} / 05`;
  storyChapterNumber.textContent = String(storyIndex + 1).padStart(2,'0');
  storyBack.hidden = storyIndex === 0;
  storyProgressLine.style.width = `${((storyIndex + 1) / 5) * 100}%`;
  storyNext.disabled = true;
  window.clearTimeout(storyUnlockTimer);
  storyFragments.replaceChildren(); storyGallery.replaceChildren();
  chapter.fragments.forEach((text, fragmentIndex) => { const p = document.createElement('p'); p.textContent = text; p.style.setProperty('--fragment-delay', `${fragmentIndex * .18}s`); if (storyIndex === 4 && fragmentIndex === 3) p.classList.add('story-fragment--final'); storyFragments.append(p); });
  chapter.photos.forEach((name, photoIndex) => { const figure = document.createElement('figure'); figure.className = `story-photo story-photo--${photoIndex + 1}`; figure.style.setProperty('--photo-delay', `${photoIndex * .16}s`); const image = document.createElement('img'); image.src = storyImagePath(name); image.alt = ''; image.decoding = 'async'; figure.append(image); storyGallery.append(figure); });
  storyUnlockTimer = window.setTimeout(() => { storyNext.disabled = false; }, 750 + Math.max(0, chapter.fragments.length - 1) * 180);
  storyScene.style.setProperty('--story-direction', direction);
}
function showStoryThreshold() { storyThreshold.classList.add('is-visible'); storyThreshold.setAttribute('aria-hidden','false'); }
function startStory() { songAudio.pause(); futureAudio.pause(); document.body.classList.add('story-scroll'); storyThreshold.classList.remove('is-visible'); storyThreshold.setAttribute('aria-hidden','true'); storyScene.classList.add('is-visible'); storyScene.setAttribute('aria-hidden','false'); storyManualOverride = false; renderStoryChapter(0); storyAudio.currentTime = 0; storyAudio.volume = .68; storyAudio.play().catch((error) => console.warn('[story-audio] Playback failed:', error.name)); }
storyStart.addEventListener('click', startStory);
storyBack.addEventListener('click', () => { if (storyIndex > 0) { storyManualOverride = true; renderStoryChapter(storyIndex - 1, -1); } });
storyNext.addEventListener('click', () => { if (storyIndex < storyChapters.length - 1) { storyManualOverride = true; renderStoryChapter(storyIndex + 1, 1); } else { storyScene.classList.add('is-complete'); window.setTimeout(() => futureThreshold.classList.add('is-visible'), 900); } });
storyAudio.addEventListener('ended', () => window.clearInterval(storyTimer));
const photoRanges = [[3,8,1,2],[10,14,3,4],[14,18,5,6],[19,22,7,28],[22,25,29,30],[25,28,31,32],[28,32,33,40],[33,37,41,42],[37,41,43,44],[41,44,45,46],[44,46,47,48],[47,50,49,50],[50,53,51,52],[53,56,53,54],[56,60,55,56],[60,62,57,58],[62,65,59,60],[65,72,61,62],[72,75,63,64],[75,82,65,66],[82,85,67,68],[87,91,69,70],[92,95,71,72],[96,100,73,74],[100,102,75,76],[102,105,77,78],[105,109,79,80],[109,112,81,82],[112,114,83,84],[115,118,85,86],[118,121,87,88],[121,124,89,90],[124,131,91,92],[131,134,93,94],[134,141,95,96],[141,144,97,98],[145,152,99,100],[147,152,101,102],[152,156,103,104],[154,156,105,106],[156,159,107,108],[160,162,109,110],[162,166,111,112],[166,168,113,114],[168,171,115,116],[171,175,117,118],[175,177,119,120],[177,180,121,122],[181,188,123,124],[188,190,125,126],[190,197,127,128],[197,201,129,130],[202,206,131,132],[206,211,133,134]];
const photoExt = new Set([5,6,29,43,44,46,52,82,99,100,106,111,122,134]);
const photoPath = (id) => encodeURI(`images/memories/foto ${id}${id === 109 ? ' ' : ''}.${id === 121 ? 'JPG' : id === 133 ? 'PNG' : photoExt.has(id) ? 'jpg' : 'JPEG'}`);
const photoItems = Array.from({ length: 22 }, () => { const item = document.createElement('figure'); item.className = 'photo-cluster__item'; const image = document.createElement('img'); image.alt = ''; image.decoding = 'async'; item.append(image); photoCluster.append(item); return item; });
const fixedImages = [leftPhoto, rightPhoto].map((slot) => { const image = document.createElement('img'); image.alt = ''; image.decoding = 'async'; slot.prepend(image); return image; });
const photoLoadCache = new Map();
let photoSignature = '';
let photoTargetSignature = '';
let photoPreloadFrame = 0;

function listRangeIds(first, last) {
  const ids = [];
  for (let id = first; id <= last; id += 1) {
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

function isPriorityPhotoRange(start) {
  return (start >= 19 && start < 23) || (start >= 28 && start < 33);
}

function getPhotoPreloadPlan(currentTime) {
  const priorityRanges = photoRanges
    .map(([start, end, first, last]) => ({
      start,
      end,
      ids: listRangeIds(first, last),
      priority: Math.max(0, start - currentTime) + (isPriorityPhotoRange(start) ? -0.75 : 0)
    }))
    .filter(({ end }) => end > currentTime - 2 && end <= currentTime + 25)
    .sort((a, b) => a.priority - b.priority || b.ids.length - a.ids.length);

  const ids = [];
  const seen = new Set();
  for (const { ids: rangeIds } of priorityRanges) {
    for (const id of rangeIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
      if (ids.length >= 24) break;
    }
    if (ids.length >= 24) break;
  }
  return ids;
}

function loadPhotoAsset(id) {
  if (!Number.isInteger(id)) return Promise.resolve(null);
  if (photoLoadCache.has(id)) return photoLoadCache.get(id);

  const loader = new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.onload = () => {
      if (typeof image.decode === 'function') {
        image.decode().then(() => resolve(image)).catch(() => resolve(image));
      } else {
        resolve(image);
      }
    };
    image.onerror = () => resolve(null);
    image.src = photoPath(id);
  });

  photoLoadCache.set(id, loader);
  return loader;
}

function schedulePhotoPreload(currentTime = Number.isFinite(songAudio?.currentTime) ? songAudio.currentTime : 0) {
  if (photoPreloadFrame) return;
  photoPreloadFrame = requestAnimationFrame(() => {
    photoPreloadFrame = 0;
    const safeTime = Number.isFinite(songAudio?.currentTime) ? songAudio.currentTime : currentTime;
    const nextPhotos = getPhotoPreloadPlan(safeTime);
    nextPhotos.slice(0, 18).forEach((id) => {
      if (!photoLoadCache.has(id)) loadPhotoAsset(id);
    });
  });
}

function photoDirector(time) {
  const ids = []; photoRanges.forEach(([start,end,first,last]) => { if (time >= start && time < end) for (let id=first; id<=last; id += 1) if (!ids.includes(id)) ids.push(id); });
  const signature = ids.join(',');
  if (signature === photoTargetSignature) return;
  photoTargetSignature = signature;
  const pair = ids.length === 2;
  [leftPhoto,rightPhoto].forEach((slot) => slot.classList.toggle('is-hidden', !pair));
  photoCluster.classList.toggle('is-visible', ids.length > 2);
  if (!ids.length) return;

  if (pair) {
    Promise.all(ids.map((id) => loadPhotoAsset(id))).then(() => {
      if (photoTargetSignature !== signature) return;
      fixedImages.forEach((image, index) => {
        const id = ids[index];
        if (!id) return;
        const nextSource = photoPath(id);
        const slot = image.parentElement;
        if (image.dataset.photoId === String(id) && image.currentSrc === nextSource) {
          slot.classList.add('is-ready');
          return;
        }
        image.src = nextSource;
        image.dataset.photoId = String(id);
        slot.classList.add('is-ready');
      });
      photoSignature = signature;
    });
    return;
  }

  Promise.all(ids.map((id) => loadPhotoAsset(id))).then(() => {
    if (photoTargetSignature !== signature) return;
    photoItems.forEach((item, index) => {
      const id = ids[index];
      const image = item.querySelector('img');
      if (!id) {
        item.classList.remove('is-active', 'is-ready');
        image.removeAttribute('src');
        image.dataset.photoId = '';
        return;
      }
      const nextSource = photoPath(id);
      if (image.dataset.photoId === String(id) && image.currentSrc === nextSource) {
        item.classList.add('is-active', 'is-ready');
        return;
      }
      image.src = nextSource;
      image.dataset.photoId = String(id);
      item.classList.add('is-active', 'is-ready');
    });
    photoSignature = signature;
  });
}

/*
 * Author-approved lyric cues. Times are in seconds and intentionally match
 * the supplied timeline exactly; do not recalculate or alter them.
 */
const lyricTimeline = [
  [3, 8, 'Make You Stay', 'title', 'relaxed'],
  [10, 14, "I'd sing a cappella in the rain"], [14, 18, "Let the whole world think I've gone insane"],
  [19, 22, 'Give you all my money and my name'], [22, 25, "Nothing I wouldn't do"], [25, 28, "Nothing I wouldn't do"],
  [28, 32, "When I'm crazy and I don't know why"], [33, 37, 'Would you calm me down and read my mind?'],
  [37, 41, 'Would you still send shivers up my spine?'], [41, 44, "Nothing I wouldn't do"], [44, 46, "Nothing I wouldn't do"],
  [47, 50, 'We could be-', 'intense', 'intense'], [50, 53, 'We could be anything tonight', 'intense', 'intense'],
  [53, 56, 'Just tell me everything you like', 'intense', 'intense'], [56, 60, "Can't you see?", 'intense', 'intense'],
  [60, 62, 'We could be something if we tried', 'intense', 'intense'], [62, 65, 'Just tell me how to make you mine', 'unique', 'intense'],
  [65, 72, 'What have I gotta do to make you-', 'stack', 'intense'], [68, 72, 'What have I gotta do to make you-', 'stack', 'intense'], [70, 72, 'What have I gotta do to make you', 'stack', 'intense'],
  [72, 75, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [75, 82, 'What have I gotta do to make you-', 'stack', 'intense'], [77, 82, 'What have I gotta do to make you-', 'stack', 'intense'], [79, 82, 'What have I gotta do to make you', 'stack', 'intense'],
  [82, 85, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [87, 91, 'I would break the laws of gravity', 'normal', 'relaxed'], [92, 95, 'Killing for you in the first degree'],
  [96, 100, 'Shut the world out when you need to breathe'], [100, 102, "Nothing I wouldn't do"], [102, 105, "Nothing I wouldn't do"],
  [105, 109, 'We could be-', 'intense', 'intense'], [109, 112, 'We could be anything tonight', 'intense', 'intense'],
  [112, 114, 'Just tell me everything you like', 'intense', 'intense'], [115, 118, "Can't you see?", 'intense', 'intense'],
  [118, 121, 'We could be something if we tried', 'intense', 'intense'], [121, 124, 'Just tell me how to make you mine', 'unique', 'intense'],
  [124, 131, 'What have I gotta do to make you-', 'stack', 'intense'], [127, 131, 'What have I gotta do to make you-', 'stack', 'intense'], [129, 131, 'What have I gotta do to make you', 'stack', 'intense'],
  [131, 134, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [134, 141, 'What have I gotta do to make you-', 'stack', 'intense'], [136, 141, 'What have I gotta do to make you-', 'stack', 'intense'], [138, 141, 'What have I gotta do to make you', 'stack', 'intense'],
  [141, 144, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [145, 152, 'Stay, yeah, yeah, yeah, yeah', 'normal', 'relaxed'], [147, 152, 'Yeah-ah-ah-ah-ay', 'stack', 'relaxed'], [150, 152, 'Yeah-ah-ah-ah-ay', 'stack', 'relaxed'],
  [152, 156, "'Cause I've never known love like this"], [154, 156, 'Never known love like this', 'stack', 'relaxed'],
  [156, 159, 'Yeah-ah-ah-ah-ay', 'normal', 'relaxed'], [158, 159, 'Yeah-ah-ah-ah-ay', 'stack', 'relaxed'], [160, 162, 'Stay, yeah, yeah, yeah, yeah', 'normal', 'relaxed'],
  [162, 166, 'We could be-', 'intense', 'intense'], [166, 168, 'We could be anything tonight', 'intense', 'intense'],
  [168, 171, 'Just tell me everything you like', 'intense', 'intense'], [171, 175, "Can't you see?", 'intense', 'intense'],
  [175, 177, 'We could be something if we tried', 'intense', 'intense'], [177, 180, 'Just tell me how to make you mine', 'unique', 'intense'],
  [181, 188, 'What have I gotta do to make you-', 'stack', 'intense'], [183, 188, 'What have I gotta do to make you-', 'stack', 'intense'], [185, 188, 'What have I gotta do to make you', 'stack', 'intense'],
  [188, 190, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'],
  [190, 197, 'What have I gotta do to make you-', 'stack', 'intense'], [193, 197, 'What have I gotta do to make you-', 'stack', 'intense'], [195, 197, 'What have I gotta do to make you', 'stack', 'intense'],
  [197, 201, 'Stay? Yeah, yeah, yeah, yeah, yeah', 'intense', 'intense'], [202, 206, 'Stay, yeah, yeah, yeah, yeah, yeah', 'normal', 'relaxed'],
  [206, 211, 'Stay, yeah, yeah, yeah, yeah', 'final', 'final']
].map(([start, end, text, style = 'normal', mood = 'relaxed']) => ({ start, end, text, style, mood }));

let visibleSignature = '';
let lyricFrame;
let beatContext;
let beatAnalyser;
let beatData;
let beatFrame;

class MemoryUniverse {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.stars = Array.from({ length: 440 }, () => this.createStar(true));
    this.running = false;
    this.lastFrame = 0;
    this.cameraTime = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  createStar(randomDepth = false) {
    return {
      x: (Math.random() - .5) * 54,
      y: (Math.random() - .5) * 34,
      z: randomDepth ? 3 + Math.random() * 76 : 78,
      size: .25 + Math.random() * 1.5,
      tone: Math.random() > .76 ? 'gold' : 'blue'
    };
  }

  resize() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 1;
    const scale = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scale = scale;
    this.canvas.width = Math.round(this.width * scale);
    this.canvas.height = Math.round(this.height * scale);
    this.context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  mood() {
    return songScene.dataset.mood || 'relaxed';
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    requestAnimationFrame((time) => this.frame(time));
  }

  stop() { this.running = false; }

  frame(time) {
    if (!this.running) return;
    const delta = Math.min((time - this.lastFrame) / 1000, .05);
    this.lastFrame = time;
    this.cameraTime += delta;
    this.render(delta);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }

  render(delta) {
    const context = this.context;
    const mood = this.mood();
    const intense = mood === 'intense';
    const final = mood === 'final';
    const speed = intense ? 13.5 : final ? 2.1 : 4.3;
    const drift = intense ? 1.45 : .48;
    const pulse = Number.parseFloat(getComputedStyle(songScene).getPropertyValue('--music-pulse')) || 0;
    const centerX = this.width / 2 + Math.sin(this.cameraTime * .19) * this.width * .024 * drift;
    const centerY = this.height / 2 + Math.cos(this.cameraTime * .14) * this.height * .018 * drift;
    const roll = Math.sin(this.cameraTime * .11) * (intense ? .065 : .018);
    const unit = Math.min(this.width, this.height) * .82;

    context.clearRect(0, 0, this.width, this.height);
    this.drawNebula(context, centerX, centerY, intense, final, pulse);

    context.save();
    context.translate(centerX, centerY);
    context.rotate(roll);
    context.translate(-centerX, -centerY);
    context.lineCap = 'round';

    for (const star of this.stars) {
      const oldZ = star.z;
      star.z -= speed * delta * (star.tone === 'gold' ? 1.05 : 1);
      if (star.z < 1.15) Object.assign(star, this.createStar(false));

      const projection = unit / star.z;
      const oldProjection = unit / oldZ;
      const x = centerX + star.x * projection;
      const y = centerY + star.y * projection;
      const oldX = centerX + star.x * oldProjection;
      const oldY = centerY + star.y * oldProjection;
      if (x < -20 || x > this.width + 20 || y < -20 || y > this.height + 20) continue;

      const brightness = Math.min(.85, .17 + (1 - star.z / 80) * .72);
      context.strokeStyle = star.tone === 'gold'
        ? `rgba(255,236,162,${brightness})`
        : `rgba(223,241,255,${brightness * .86})`;
      context.lineWidth = Math.max(.4, star.size * (intense ? 1.35 : 1));
      context.beginPath();
      context.moveTo(oldX, oldY);
      context.lineTo(x, y);
      context.stroke();
    }
    context.restore();

    if (intense) this.drawPortals(context, centerX, centerY, pulse);
    if (final) this.drawFinalHalo(context, centerX, centerY);
  }

  drawNebula(context, x, y, intense, final, pulse) {
    const radius = Math.max(this.width, this.height) * (intense ? .72 : .52);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    if (intense) {
      gradient.addColorStop(0, `rgba(255,236,157,${.14 + pulse * .22})`);
      gradient.addColorStop(.28, 'rgba(122,180,255,.12)');
      gradient.addColorStop(.66, 'rgba(70,111,181,.06)');
    } else if (final) {
      gradient.addColorStop(0, 'rgba(255,249,204,.19)');
      gradient.addColorStop(.54, 'rgba(190,224,255,.08)');
    } else {
      gradient.addColorStop(0, 'rgba(235,247,255,.075)');
      gradient.addColorStop(.6, 'rgba(153,198,247,.045)');
    }
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, this.width, this.height);
  }

  drawPortals(context, x, y, pulse) {
    const cycle = (songAudio.currentTime * .17) % 1;
    const base = Math.min(this.width, this.height);
    context.save();
    context.translate(x, y);
    context.rotate(Math.sin(this.cameraTime * .18) * .12);
    for (let index = 0; index < 3; index += 1) {
      const progress = (cycle + index / 3) % 1;
      const width = base * (.22 + progress * 1.35);
      const height = width * (.42 + Math.sin(this.cameraTime + index) * .035);
      context.globalAlpha = (1 - progress) * (.16 + pulse * .24);
      context.strokeStyle = index === 1 ? 'rgba(255,235,152,1)' : 'rgba(196,225,255,1)';
      context.lineWidth = Math.max(1, 3.1 * (1 - progress));
      context.beginPath();
      context.ellipse(0, 0, width, height, index * .41, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
    context.globalAlpha = 1;
  }

  drawFinalHalo(context, x, y) {
    context.save();
    context.globalAlpha = .26 + Math.sin(this.cameraTime * .9) * .06;
    context.strokeStyle = 'rgba(255,249,205,1)';
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(x, y, Math.min(this.width, this.height) * .35, Math.min(this.width, this.height) * .15, .1, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }
}

const memoryUniverse = new MemoryUniverse(universeCanvas);

function renderLyrics() {
  const time = songAudio.currentTime;
  const active = lyricTimeline.filter((cue) => time >= cue.start && time < cue.end);
  const previous = lyricTimeline.filter((cue) => cue.end <= time).slice(-2);
  const next = lyricTimeline.find((cue) => cue.start > time);
  const signature = active.map((cue) => `${cue.start}-${cue.end}`).join('|');

  lyricPrevious.textContent = previous.map((cue) => cue.text).join(' · ');
  lyricNext.textContent = next ? next.text : '';

  if (signature !== visibleSignature) {
    lyricCurrent.replaceChildren();
    active.forEach((cue) => {
      const line = document.createElement('span');
      line.className = `lyric-line lyric-line--${cue.style}`;
      line.textContent = cue.text;
      lyricCurrent.append(line);
    });
    visibleSignature = signature;
  }

  const moodCue = active[active.length - 1];
  songScene.dataset.mood = moodCue?.mood || 'relaxed';
}

function runLyricClock() {
  renderLyrics();
  photoDirector(songAudio.currentTime);
  schedulePhotoPreload(songAudio.currentTime);
  if (!songAudio.paused && !songAudio.ended) lyricFrame = requestAnimationFrame(runLyricClock);
}

function startBeatReactivity() {
  /* Observe a copy of native playback; never route or alter the audible output. */
  if (beatContext || !songAudio.captureStream) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    beatContext = new AudioContext();
    beatAnalyser = beatContext.createAnalyser();
    beatAnalyser.fftSize = 128;
    beatData = new Uint8Array(beatAnalyser.frequencyBinCount);
    const silentOutput = beatContext.createGain();
    silentOutput.gain.value = 0;
    beatContext.createMediaStreamSource(songAudio.captureStream()).connect(beatAnalyser);
    beatAnalyser.connect(silentOutput);
    silentOutput.connect(beatContext.destination);
    beatContext.resume();
    const readPulse = () => {
      if (!beatAnalyser || songAudio.paused || songAudio.ended) return;
      beatAnalyser.getByteFrequencyData(beatData);
      const bass = beatData.slice(0, 12).reduce((sum, value) => sum + value, 0) / (12 * 255);
      songScene.style.setProperty('--music-pulse', bass.toFixed(3));
      songScene.style.setProperty('--pulse-core', (.38 + bass * .34).toFixed(3));
      songScene.style.setProperty('--pulse-ring', (.29 + bass * .45).toFixed(3));
      songScene.style.setProperty('--pulse-wave', (.21 + bass * .4).toFixed(3));
      songScene.style.setProperty('--pulse-aurora', (.72 + bass * .28).toFixed(3));
      songScene.style.setProperty('--pulse-scale', (1 + bass * .22).toFixed(3));
      songScene.style.setProperty('--pulse-aurora-scale', (.98 + bass * .18).toFixed(3));
      songScene.style.setProperty('--pulse-shadow', `${Math.round(22 + bass * 65)}px`);
      beatFrame = requestAnimationFrame(readPulse);
    };
    readPulse();
  } catch (error) {
    console.info('[visuals] Native beat reactivity is unavailable; cinematic CSS motion remains active.');
  }
}

function startSongFromUserGesture() {
  /* Playback must begin in this click handler to satisfy modern autoplay policies. */
  storyAudio.pause();
  futureAudio.pause();
  songAudio.muted = false;
  songAudio.volume = 1;
  songAudio.currentTime = 0;
  songAudio.play().then(() => {
    schedulePhotoPreload(songAudio.currentTime);
    runLyricClock();
    startBeatReactivity();
    memoryUniverse.start();
  }).catch((error) => console.warn('[audio] Playback failed:', error.name));
}

function beginSongScene() {
  photoTargetSignature = '';
  photoSignature = '';
  leftPhoto.classList.remove('is-hidden','is-ready');
  rightPhoto.classList.remove('is-hidden','is-ready');
  photoCluster.classList.remove('is-visible');
  photoItems.forEach((item) => item.classList.remove('is-active','is-ready'));
  renderLyrics();
  photoDirector(songAudio.currentTime);
  songScene.classList.add('is-visible');
  songScene.setAttribute('aria-hidden', 'false');
}

window.addEventListener('load', () => {
  setTimeout(() => cover.classList.add('is-ready'), 120);
  schedulePhotoPreload(0);
});

document.querySelectorAll('.polaroid img').forEach((image) => {
  image.addEventListener('error', () => image.closest('.polaroid').classList.add('is-placeholder'));
  if (image.complete && !image.naturalWidth) image.closest('.polaroid').classList.add('is-placeholder');
});

letter.addEventListener('click', () => {
  activateGlobalNav();
  document.body.classList.add('entering-transition');
  window.setTimeout(() => {
    transition.classList.add('is-visible');
    transition.setAttribute('aria-hidden', 'false');
  }, 700);
});

readyButton.addEventListener('click', () => {
  readyButton.disabled = true;
  startSongFromUserGesture();
  transition.classList.add('is-leaving');
  window.setTimeout(() => cleanPause.classList.add('is-visible'), 520);
  window.setTimeout(() => {
    beginSongScene();
    cleanPause.classList.remove('is-visible');
  }, 1320);
});

songAudio.addEventListener('pause', () => { cancelAnimationFrame(lyricFrame); cancelAnimationFrame(beatFrame); memoryUniverse.stop(); });
songAudio.addEventListener('ended', () => { cancelAnimationFrame(lyricFrame); cancelAnimationFrame(beatFrame); memoryUniverse.stop(); window.setTimeout(() => { if(globalChapterIndex===0 && songScene.classList.contains('is-visible')) showStoryThreshold(); }, 900); });
songAudio.addEventListener('error', () => console.error('[audio] File error:', songAudio.error?.message || 'audio unavailable'));
