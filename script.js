const DEFAULT_PRODUCTS=[
{id:1,name:"Laptop HP 15",category:"Computadoras",price:650,stock:8,image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80"},
{id:2,name:"iPhone 15",category:"Celulares",price:899,stock:5,image:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80"},
{id:3,name:"Audífonos Bluetooth",category:"Audio",price:59.99,stock:15,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"},
{id:4,name:"Mouse Gamer RGB",category:"Accesorios",price:35.5,stock:12,image:"https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=300&q=80"},
{id:5,name:"Teclado Mecánico",category:"Accesorios",price:75,stock:3,image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80"},
{id:6,name:"Monitor 24 pulgadas",category:"Computadoras",price:189.99,stock:6,image:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80"}
];
const placeholder="https://placehold.co/300x220/e8eef7/475569?text=Mi+Negocio";
let products=JSON.parse(localStorage.getItem("miNegocioProducts"))||DEFAULT_PRODUCTS;
let cart=JSON.parse(localStorage.getItem("miNegocioCart"))||[];
let sales=JSON.parse(localStorage.getItem("miNegocioSales"))||[];
let business=JSON.parse(localStorage.getItem("miNegocioBusiness"))||{name:"",phone:"",address:""};

const $=id=>document.getElementById(id), money=n=>"$"+Number(n).toFixed(2);
function save(){localStorage.setItem("miNegocioProducts",JSON.stringify(products));localStorage.setItem("miNegocioCart",JSON.stringify(cart));localStorage.setItem("miNegocioSales",JSON.stringify(sales));localStorage.setItem("miNegocioBusiness",JSON.stringify(business))}
function estado(stock){return stock===0?["Agotado","out"]:stock<=5?["Stock bajo","low"]:["Disponible","available"]}

function renderCategories(){
 const cats=[...new Set(products.map(p=>p.category))];
 $("categoryFilter").innerHTML='<option value="todos">Todas las categorías</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join("");
 $("productCategory").innerHTML=cats.map(c=>`<option value="${c}">${c}</option>`).join("");
}
function renderProductos(){
 const q=$("search").value.toLowerCase(),cat=$("categoryFilter").value,stf=$("statusFilter").value;
 const list=products.filter(p=>{
   const [st]=estado(p.stock);
   return p.name.toLowerCase().includes(q)&&(cat==="todos"||p.category===cat)&&
   (stf==="todos"||(stf==="disponible"&&st==="Disponible")||(stf==="bajo"&&st==="Stock bajo")||(stf==="agotado"&&st==="Agotado"));
 });
 $("productTable").innerHTML=list.length?list.map(p=>{
   const [st,cl]=estado(p.stock);
   return `<tr><td>#${p.id}</td><td><div class="product-cell"><img src="${p.image||placeholder}" onerror="this.src='${placeholder}'"><div><strong>${p.name}</strong><small>Producto registrado</small></div></div></td><td>${p.category}</td><td><b>${money(p.price)}</b></td><td>${p.stock}</td><td><span class="badge ${cl}">${st}</span></td><td><div class="actions"><button class="action cart-add" title="Agregar al carrito" onclick="agregarCarrito(${p.id})" ${p.stock===0?"disabled":""}>🛒</button><button class="action edit" title="Editar" onclick="editarProducto(${p.id})">✏️</button><button class="action delete" title="Eliminar" onclick="eliminarProducto(${p.id})">🗑️</button></div></td></tr>`
 }).join(""):`<tr><td colspan="7"><div style="padding:30px;text-align:center;color:#94a3b8">📦 No hay productos que coincidan con la búsqueda.</div></td></tr>`;
 updateStats();
}
function updateStats(){
 const stock=products.reduce((a,p)=>a+p.stock,0),value=products.reduce((a,p)=>a+p.stock*p.price,0),low=products.filter(p=>p.stock>0&&p.stock<=5).length;
 $("totalProducts").textContent=products.length;$("totalStock").textContent=stock;$("inventoryValue").textContent=money(value);$("lowStock").textContent=low;
 const sold=sales.reduce((a,s)=>a+s.total,0);$("salesTotal").textContent=money(sold);$("salesNumber").textContent=`${sales.length} venta${sales.length!==1?"s":""}`;
 $("cartCount").textContent=cart.reduce((a,i)=>a+i.qty,0);
 $("cartPreview").textContent=cart.length?`${cart.reduce((a,i)=>a+i.qty,0)} artículo(s) en el carrito · ${money(cartTotal())}`:"Tu carrito está vacío.";
}
function abrirModal(id=null){
 $("productForm").reset();$("productId").value="";$("modalTitle").textContent=id?"Editar producto":"Nuevo producto";
 if(id){const p=products.find(x=>x.id===id);$("productId").value=p.id;$("productName").value=p.name;$("productCategory").value=p.category;$("productPrice").value=p.price;$("productStock").value=p.stock;$("productImage").value=p.image}
 $("productModal").classList.add("show");
}
function cerrarModal(){$("productModal").classList.remove("show")}
$("productForm").addEventListener("submit",e=>{
 e.preventDefault();const id=Number($("productId").value);
 const data={name:$("productName").value.trim(),category:$("productCategory").value,price:Number($("productPrice").value),stock:Number($("productStock").value),image:$("productImage").value.trim()||placeholder};
 if(id){Object.assign(products.find(p=>p.id===id),data);alert("Producto actualizado correctamente.");}
 else{products.push({id:products.length?Math.max(...products.map(p=>p.id))+1:1,...data});alert("Producto agregado correctamente.");}
 save();renderCategories();renderProductos();cerrarModal();
});
function editarProducto(id){abrirModal(id)}
function eliminarProducto(id){const p=products.find(x=>x.id===id);if(confirm(`¿Eliminar "${p.name}"?`)){products=products.filter(x=>x.id!==id);cart=cart.filter(x=>x.id!==id);save();renderProductos();renderCart();updateStats()}}
function agregarCarrito(id){const p=products.find(x=>x.id===id);if(!p||p.stock===0)return alert("Este producto está agotado.");const i=cart.find(x=>x.id===id);if(i){if(i.qty>=p.stock)return alert("No hay más unidades disponibles.");i.qty++}else cart.push({id,qty:1});save();renderCart();updateStats();alert("Producto agregado al carrito.");}
function cartTotal(){return cart.reduce((a,i)=>{const p=products.find(x=>x.id===i.id);return a+(p?p.price*i.qty:0)},0)}
function cambiarCantidad(id,d){
 const i=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);if(!i)return;i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);if(i.qty>p.stock)i.qty=p.stock;save();renderCart();updateStats();
}
function quitarDelCarrito(id){cart=cart.filter(x=>x.id!==id);save();renderCart();updateStats()}
function renderCart(){
 $("cartItems").innerHTML=cart.length?cart.map(i=>{const p=products.find(x=>x.id===i.id);return `<div class="cart-row"><img src="${p.image||placeholder}" onerror="this.src='${placeholder}'"><div class="cart-info"><strong>${p.name}</strong><small>${money(p.price)} cada uno</small></div><div class="qty"><button onclick="cambiarCantidad(${p.id},-1)">−</button><b>${i.qty}</b><button onclick="cambiarCantidad(${p.id},1)">+</button></div><strong>${money(p.price*i.qty)}</strong><button class="remove-cart" onclick="quitarDelCarrito(${p.id})">🗑️</button></div>`}).join(""):`<div style="padding:35px;text-align:center;color:#94a3b8">🛒<br><br>Tu carrito está vacío.</div>`;
 $("cartTotal").textContent=money(cartTotal());
}
function abrirCarrito(){renderCart();$("cartModal").classList.add("show")}
function cerrarCarrito(){$("cartModal").classList.remove("show")}
function finalizarCompra(){
 if(!cart.length)return alert("Agrega productos al carrito antes de comprar.");
 for(const i of cart){const p=products.find(x=>x.id===i.id);if(!p||i.qty>p.stock)return alert("No hay suficiente stock para completar la compra.")}
 const total=cartTotal();cart.forEach(i=>products.find(x=>x.id===i.id).stock-=i.qty);
 sales.unshift({id:Date.now(),date:new Date().toLocaleString("es-GT"),total,items:cart.reduce((a,i)=>a+i.qty,0)});
 cart=[];save();renderProductos();renderCart();updateStats();cerrarCarrito();alert(`¡Venta realizada correctamente!\\nTotal: ${money(total)}`);
}
$("businessForm").addEventListener("submit",e=>{e.preventDefault();business={name:$("businessName").value.trim(),phone:$("businessPhone").value.trim(),address:$("businessAddress").value.trim()};save();alert("Información del negocio guardada.")});
function loadBusiness(){$("businessName").value=business.name;$("businessPhone").value=business.phone;$("businessAddress").value=business.address}
$("productModal").addEventListener("click",e=>{if(e.target===$("productModal"))cerrarModal()});
$("cartModal").addEventListener("click",e=>{if(e.target===$("cartModal"))cerrarCarrito()});
renderCategories();loadBusiness();renderProductos();renderCart();updateStats();