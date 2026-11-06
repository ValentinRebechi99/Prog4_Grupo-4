export function renderizarTablaIncidencias (incidencias){
    console.log("Renderizando tablas de incidencias")
    const tbody = document.getElementById('tabla-incidencias');
    tbody.textContent = ''; //Limpiar datos
    for (let inc of incidencias){
        const row = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = inc.id_incidencia;
        row.appendChild(tdId);

        const tdCreado = document.createElement('td');
        tdCreado.textContent= inc.creado;
        row.appendChild(tdCreado);

        const tdArticulo = document.createElement('td');
        tdArticulo.textContent= inc.articulo_descripcion;
        tdArticulo.className= 'text-truncate';
        tdArticulo.style.maxWidth = '50px';
        row.appendChild(tdArticulo);

        const tdDescripcion = document.createElement('td');
        tdDescripcion.textContent= inc.descripcion_pedido;
        tdDescripcion.className= 'text-truncate';
        tdDescripcion.style.maxWidth = '50px';
        row.appendChild(tdDescripcion);

        const tdPrioridad = document.createElement('td');
        tdPrioridad.textContent= textoPrioridad[inc.prioridad];        
        row.appendChild(tdPrioridad);

        const tdEstado = document.createElement('td');
        tdEstado.textContent= inc.id_estado;
        tdEstado.innerHTML = badgesEstado[inc.id_estado];
        row.appendChild(tdEstado);


        const tdAcciones = document.createElement('td');
        const botonFinalizar = document.createElement('button');
        botonFinalizar.textContent = 'Finalizar';

        if(inc.id_estado > 2){        
            botonFinalizar.className = 'btn btn-sm btn-success disabled';            
        }else{
            botonFinalizar.className = 'btn btn-sm btn-success';
        }
        tdAcciones.appendChild(botonFinalizar);            
        row.appendChild(tdAcciones);

        tbody.appendChild(row);
    }
}