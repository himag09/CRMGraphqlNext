import React, {useContext} from 'react';
import PedidoContext from '../../context/pedidos/PedidoContext'



const Total = () => {
    const pedidoContext = useContext(PedidoContext);
    const {total} = pedidoContext;

    return ( 
        <div className="flex items-center justify-between mt-5 p-3 rounded bg-white">
            <h2 className="text-gray-800 text-lg">Total a pagar:</h2>
            <p className="text-gray-800 mt-0">$ {total}</p>
        </div>
     );
}
 
export default Total;