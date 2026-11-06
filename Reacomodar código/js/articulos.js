export function renderizarTablaArticulos (articulos){
    console.log("Renderizando tablas de artículos")
    const tbody = document.getElementById('tabla-articulos');
    tbody.textContent = ''; //Limpiar datos
    for (let art of articulos){
        const row = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = art.id_articulo;
        row.appendChild(tdId);

        const tdArea = document.createElement('td');
        tdArea.textContent= art.id_area;
        row.appendChild(tdArea);

        const tdCategoria = document.createElement('td');
        tdCategoria.textContent= art.id_categoria;
        row.appendChild(tdCategoria);

        const tdDescripcion = document.createElement('td');
        tdDescripcion.textContent= art.descripcion;
        tdDescripcion.className= 'text-truncate';
        tdDescripcion.style.maxWidth = '50px';
        row.appendChild(tdDescripcion);

        tbody.appendChild(row);
    }
}