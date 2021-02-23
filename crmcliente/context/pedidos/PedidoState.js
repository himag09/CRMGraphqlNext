import React, { useReducer } from 'react';
import PedidoContext from './PedidoContext';
import PedidoReducer from './PedidoReducer';

import {
    SELECCIONAR_CLIENTE,
    SELECCIONAR_PRODUCTO,
    CANTIDAD_PRODUCTOS,
    ACTUALIZAR_TOTAL
} from '../../types';

const PedidoState = ({children}) => {
    // state de pedidos
    const initialState = {
        cliente: {},
        productos: [],
        total: 0
    }
    const [state, dispatch ] = useReducer(PedidoReducer, initialState);

    // modifica el cliente
    const agregarCliente = cliente => {
        // console.log(cliente);
        dispatch({
            type: SELECCIONAR_CLIENTE,
            payload: cliente
        })
    }

    // modifica los productos
    const agregarProducto = productosSeleccionados => {
        // console.log(productosSeleccionados);
        let nuevoState;
        if (state.productos.length > 0) {
            // tomar del 2do arreglo una copia para asignarlo al primero
            nuevoState = productosSeleccionados.map( producto => {
                const nuevoObjeto = state.productos.find( productoState => productoState.id === producto.id );
                return {...producto, ...nuevoObjeto}
            })
        } else {
            nuevoState = productosSeleccionados;
        }
        dispatch({
            type: SELECCIONAR_PRODUCTO,
            payload: nuevoState
        })
    }

    // modifica las cantidades de los producutos
    const cantidadProductos = nuevoProducto =>{
        // console.log(nuevoProducto);
        dispatch({
            type: CANTIDAD_PRODUCTOS,
            payload: nuevoProducto
        })
    }

    const actualizarTotal = () => {
        // console.log('cargando');
        dispatch({
            type: ACTUALIZAR_TOTAL
        })
    }
    return (    
        <PedidoContext.Provider
            value={{
                cliente: state.cliente,
                productos: state.productos,
                total: state.total,
                agregarCliente,
                agregarProducto,
                cantidadProductos,
                actualizarTotal
            }}
        >{children}

        </PedidoContext.Provider>
     );
}
 

export default PedidoState;

