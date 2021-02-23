import React, {useEffect, useState, useContext} from 'react';
import Select from 'react-select'
import { gql, useQuery } from '@apollo/client';
import PedidoContext from '../../context/pedidos/PedidoContext'
const OBTENER_PRODUCTOS = gql`
query obtenerProductos {
    obtenerProductos { 
    id
    nombre
    precio
    existencia
    }
  }
`;

const AsignarProducto = () => {
    // state local del componente
    const [productos, setProductos] = useState([]);
    // CONTEXT de pedidos 
    const pedidoContext = useContext(PedidoContext);
    const {agregarProducto, actualizarTotal} = pedidoContext;

    // consulta a la base de datos
    const { data, loading, error } = useQuery(OBTENER_PRODUCTOS);
    // console.log(data);
    // console.log(loading);
    // console.log(error);
    useEffect(()=>{
        // todo funcion para pasar a pedidoState.js
        // agregarProducto(productos);
        // if (productos == null) {
        //     setProductos([]);
        //     actualizarTotal();
        // } else {
            agregarProducto(productos);
            actualizarTotal();

        // }
    }, [productos])
    const seleccionarProducto = producto => {
        setProductos(producto);
    }
    if(loading) return null;
    const { obtenerProductos } = data;


    return (
        <>
            <p className="mt-10 my-2 bg-white border-l-4 border-gray-800 text-gray-700 p-2 text-sm font-bold">2.- Selecciona o busca los productos</p>
            <Select
                className="mt-3"
                options={obtenerProductos}
                isMulti={true}
                onChange={opcion => seleccionarProducto(opcion)}
                getOptionValue={opciones => opciones.id}
                getOptionLabel={opciones => `${opciones.nombre} - ${opciones.existencia} Disponibles`}
                placeholder="Busque o seleccione productos"
                noOptionsMessage={() => "No hay resultados"}
            />
        </>
    );
}

export default AsignarProducto;