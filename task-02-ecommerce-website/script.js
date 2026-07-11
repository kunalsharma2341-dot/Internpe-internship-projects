const products = [
  {id:1,name:'Orbit Bottle',category:'Lifestyle',price:749,image:'assets/orbit-bottle.webp',color:'#f4d7c5',description:'Insulated everyday bottle with a clean, compact profile.'},
  {id:2,name:'Focus Lamp',category:'Workspace',price:1299,image:'assets/focus-lamp.webp',color:'#dbe5d9',description:'Warm adjustable light for reading and focused work.'},
  {id:3,name:'Canvas Carry',category:'Lifestyle',price:899,image:'assets/canvas-carry.webp',color:'#e8ddca',description:'Durable carry-all tote for errands, work and weekends.'},
  {id:4,name:'Arc Headphones',category:'Tech',price:2499,image:'assets/arc-headphones.webp',color:'#d7e1e5',description:'Comfortable wireless listening with a minimal design.'},
  {id:5,name:'Daily Journal',category:'Workspace',price:499,image:'assets/daily-journal.webp',color:'#eadccf',description:'Undated pages for plans, notes and daily reflections.'},
  {id:6,name:'Stone Mug',category:'Home',price:599,image:'assets/stone-mug.webp',color:'#e1ded5',description:'Hand-finished ceramic mug for slow morning rituals.'},
  {id:7,name:'Pocket Speaker',category:'Tech',price:1599,image:'assets/pocket-speaker.webp',color:'#d9d6e6',description:'Portable sound with simple controls and rich audio.'},
  {id:8,name:'Calm Candle',category:'Home',price:699,image:'assets/calm-candle.webp',color:'#eee0c5',description:'Soft cedar and citrus fragrance in a reusable jar.'}
];

const storageKey='shopnest-cart';
let activeCategory='All';
let cart=loadCart();
const $=selector=>document.querySelector(selector);
const productGrid=$('#productGrid'), filters=$('#filters'), searchInput=$('#searchInput');

function loadCart(){try{return JSON.parse(localStorage.getItem(storageKey))||{}}catch{return {}}}
function saveCart(){localStorage.setItem(storageKey,JSON.stringify(cart));renderCart()}
function money(value){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)}

function renderFilters(){
  // Clear the previous buttons before rebuilding the category list.
  // Without this, every category click appends another duplicate row.
  filters.replaceChildren();
  ['All',...new Set(products.map(p=>p.category))].forEach(category=>{
    const button=document.createElement('button');button.type='button';button.className='filter-button'+(category===activeCategory?' active':'');button.textContent=category;
    button.setAttribute('aria-pressed',String(category===activeCategory));
    button.addEventListener('click',()=>{activeCategory=category;renderFilters();renderProducts()});filters.append(button);
  });
}

function renderProducts(){
  const query=searchInput.value.trim().toLowerCase();
  const visible=products.filter(p=>(activeCategory==='All'||p.category===activeCategory)&&(`${p.name} ${p.description}`.toLowerCase().includes(query)));
  productGrid.replaceChildren();
  visible.forEach(product=>{
    const article=document.createElement('article');article.className='product-card';
    article.innerHTML=`<div class="product-art" style="--product-bg:${product.color}"><img src="${product.image}" alt="${product.name}" loading="lazy" width="700" height="700"></div><div class="product-info"><small>${product.category}</small><h3>${product.name}</h3><p>${product.description}</p><div class="product-bottom"><strong>${money(product.price)}</strong><button class="add-button" type="button" aria-label="Add ${product.name} to cart">+</button></div></div>`;
    article.querySelector('button').addEventListener('click',()=>addToCart(product.id));productGrid.append(article);
  });
  $('#resultCount').textContent=`${visible.length} product${visible.length===1?'':'s'}`;$('#emptyState').hidden=visible.length!==0;
}

function addToCart(id){cart[id]=(cart[id]||0)+1;saveCart();showToast('Added to cart')}
function changeQuantity(id,change){cart[id]=(cart[id]||0)+change;if(cart[id]<=0)delete cart[id];saveCart()}
function renderCart(){
  const container=$('#cartItems');container.replaceChildren();let subtotal=0,count=0;
  Object.entries(cart).forEach(([id,quantity])=>{const product=products.find(p=>p.id===Number(id));if(!product)return;subtotal+=product.price*quantity;count+=quantity;
    const item=document.createElement('article');item.className='cart-item';item.innerHTML=`<div class="cart-item-art" style="--product-bg:${product.color}"><img src="${product.image}" alt=""></div><div><h3>${product.name}</h3><strong>${money(product.price)}</strong><div class="quantity"><button type="button" data-change="-1" aria-label="Decrease ${product.name}">−</button><span>${quantity}</span><button type="button" data-change="1" aria-label="Increase ${product.name}">+</button></div></div><button class="remove-button" type="button" aria-label="Remove ${product.name}">Remove</button>`;
    item.querySelectorAll('[data-change]').forEach(button=>button.addEventListener('click',()=>changeQuantity(id,Number(button.dataset.change))));item.querySelector('.remove-button').addEventListener('click',()=>{delete cart[id];saveCart()});container.append(item);
  });
  if(!count)container.innerHTML='<p class="cart-empty">Your cart is empty.<br>Add something you like.</p>';
  const differentProducts=Object.keys(cart).filter(id=>cart[id]>0).length;
  const bundleUnlocked=differentProducts>=3;
  const discount=bundleUnlocked?Math.round(subtotal*.10):0;
  const bundleStatus=$('#bundleStatus');
  bundleStatus.classList.toggle('unlocked',bundleUnlocked);
  bundleStatus.textContent=bundleUnlocked
    ? 'Everyday Kit unlocked — you saved 10%.'
    : `Add ${3-differentProducts} more different product${3-differentProducts===1?'':'s'} to save 10%.`;
  $('#discountRow').hidden=!bundleUnlocked;
  $('#cartDiscount').textContent=`−${money(discount)}`;
  $('#cartCount').textContent=count;$('#cartTotal').textContent=money(subtotal-discount);$('#checkoutButton').disabled=!count;
}

function setCart(open){$('#cartDrawer').classList.toggle('open',open);$('#cartDrawer').setAttribute('aria-hidden',String(!open));$('#overlay').hidden=!open;document.body.style.overflow=open?'hidden':'';if(open)$('#closeCart').focus()}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200)}

searchInput.addEventListener('input',renderProducts);
$('#cartButton').addEventListener('click',()=>setCart(true));$('#closeCart').addEventListener('click',()=>setCart(false));$('#overlay').addEventListener('click',()=>setCart(false));
$('#menuButton').addEventListener('click',event=>{const open=$('#mainNav').classList.toggle('open');event.currentTarget.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('#mainNav a').forEach(link=>link.addEventListener('click',()=>{$('#mainNav').classList.remove('open');$('#menuButton').setAttribute('aria-expanded','false')}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setCart(false)});
$('#checkoutButton').addEventListener('click',()=>{setCart(false);$('#checkoutDialog').showModal()});
$('#checkoutForm').addEventListener('submit',event=>{if(event.submitter?.value==='cancel')return;event.preventDefault();if(!event.currentTarget.reportValidity())return;cart={};saveCart();$('#checkoutDialog').close();event.currentTarget.reset();showToast('Demo order placed successfully')});
$('#newsletterForm').addEventListener('submit',event=>{event.preventDefault();showToast('Thanks for subscribing!');event.currentTarget.reset()});

renderFilters();renderProducts();renderCart();
