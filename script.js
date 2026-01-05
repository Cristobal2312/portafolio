// ------------------- Firebase -------------------
const firebaseConfig = {
  apiKey: "AIzaSyDzat84DH03lKgjSokNwG4F8rPjW5Cpqpk",
  authDomain: "portafolio-toby.firebaseapp.com",
  projectId: "portafolio-toby",
  storageBucket: "portafolio-toby.appspot.com",
  messagingSenderId: "690857992515",
  appId: "1:690857992515:web:bd59f9434db949af7c4ff6",
  measurementId: "G-NDWJXF6XME"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ------------------- EmailJS -------------------
emailjs.init('rKZd6xDB8Uvkn1Out');

// ------------------- Formulario -------------------
const form = document.getElementById('form');
const btn = document.getElementById('button');

form.addEventListener('submit', function(e){
  e.preventDefault();
  btn.value='Enviando...';

  emailjs.sendForm('service_l10egdr','template_95tr0ob', this)
    .then(()=>console.log('Correo enviado ✅'))
    .catch(err=>console.error('Error EmailJS:', err));

  const title = form.title.value;
  const name = form.name.value;
  const message = form.message.value;
  const email = form.email.value;

  db.collection('mensajes').add({title,name,message,email,timestamp:new Date()})
    .then(()=>{ alert('Mensaje enviado correctamente ✅'); btn.value='Enviar'; form.reset(); })
    .catch(err=>{ console.error(err); alert('Ocurrió un error al enviar.'); btn.value='Enviar'; });
});

// ------------------- Menú hamburguesa -------------------
const hamburger = document.getElementById('hamburger');
const menuMobile = document.getElementById('menu-mobile');
hamburger?.addEventListener('click', ()=>menuMobile.classList.toggle('show'));



  window.addEventListener('load', () => {
    const foto = document.querySelector('.foto');
    foto.classList.add('zoom-in');
  });
// Seleccionamos todos los enlaces del menú
const menuLinks = document.querySelectorAll('.menu li a');

// Seleccionamos todas las secciones
const sections = document.querySelectorAll('section');

// Función para actualizar el enlace activo según scroll
function updateActiveLink() {
  let scrollPos = window.scrollY + window.innerHeight / 2; // Punto medio de la pantalla

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < bottom) {
      menuLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// Escuchamos scroll
window.addEventListener('scroll', updateActiveLink);

// Actualizamos al cargar la página
window.addEventListener('load', updateActiveLink);

/* ================= ACTIVAR MODO JS ================= */
document.body.classList.add('js');

// Intersection Observer para animaciones repetibles
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show'); // entra
      } else {
        entry.target.classList.remove('show'); // sale, se puede reactivar
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  }
);

// Todos los elementos animados
document.querySelectorAll(
  '.animate-up, .animate-left, .animate-right, .project-card, .social-icons'
).forEach(el => observer.observe(el));


if (hamburger) {
  hamburger.addEventListener('click', () => {
    menuMobile.classList.toggle('open');
  });
}

/* ================= PROYECTOS: obtener y mostrar repos de GitHub como cards ================= */
const projectsList = document.getElementById('projects-list');

function getGithubUsernameFromProfileLink(){
  const a = document.querySelector('.social-icons a[href*="github.com"]');
  if(!a) return null;
  try{
    const url = new URL(a.href);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[0] || null;
  }catch(e){return null}
}

async function fetchGithubRepos(username){
  if(!username) return [];
  try{
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if(!res.ok) return [];
    const data = await res.json();
    return data;
  }catch(e){console.error('GitHub fetch error', e); return []}
}

function renderGithubRepos(repos){
  if(!projectsList) return;
  projectsList.innerHTML = '';
  if(!repos || repos.length === 0){
    projectsList.innerHTML = '<p class="muted">No se encontraron repositorios públicos o usuario no detectado.</p>';
    return;
  }

  // Create a card per repo
  repos.forEach(repo => {
    const card = document.createElement('article');
    card.className = 'project-card animate-up';
    const desc = repo.description ? `<p class="proj-desc">${repo.description}</p>` : '';
    
    // IMPORTANTE: Para mostrar el botón Demo, agrega un URL en el campo "homepage" del repo en GitHub
    // Visita: https://github.com/{usuario}/{repo}/settings y llena "Homepage" con tu URL
    const demoUrl = repo.homepage && repo.homepage.trim() ? repo.homepage : null;
    const demo = demoUrl ? `<a class="demo" href="${demoUrl}" target="_blank"><i class="fas fa-play"></i> Demo</a>` : '';

    // Try OpenGraph image (fallback if unavailable will hide via onerror)
    const og = `https://opengraph.githubassets.com/1/${repo.html_url}`;

    const meta = ` <div class="proj-meta"> <span class="badge lang">${repo.language || '—'}</span> <span class="badge stars">★ ${repo.stargazers_count || 0}</span> </div>`;

    card.innerHTML = `
      <img class="project-thumb" src="${og}" alt="Preview ${repo.name}" onerror="this.style.display='none'" />
      ${meta}
      <h3 class="proj-title">${repo.name}</h3>
      ${desc}
      <div class="project-links">
        <a href="${repo.html_url}" target="_blank">GitHub</a>
        ${demo}
      </div>
    `;
    projectsList.appendChild(card);
    observer.observe(card);
  });
}

async function initGithubProjects(){
  const username = getGithubUsernameFromProfileLink();
  if(!username){
    renderGithubRepos([]);
    return;
  }
  const repos = await fetchGithubRepos(username);
  renderGithubRepos(repos);
}

window.addEventListener('load', initGithubProjects);
