import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/router';


const OBTENER_USUARIO = gql`
    query obtenerUsuario{
        obtenerUsuario{
        id
        nombre
        apellido
        }
    }
`;
const Header = () => {
    const router = useRouter();
    const {data, loading, error, client} = useQuery(OBTENER_USUARIO);
    // proteger para no acceder a data antes de loading 
    if(loading) return null;
     // si no hay informacion 
    if(!data.obtenerUsuario) {
        client.clearStore();
        return router.push('/login');
    }
    const { nombre, apellido } = data.obtenerUsuario;
    const cerrarsesion = () => {
        localStorage.removeItem('token');
        client.clearStore();
        router.push('/login');
    }
    return ( 
        <div className="sm:flex sm:justify-between mb-6">
            <p className="mr-2 mb-5 lg:mb-0">Hola: {nombre} {apellido} </p>

            <button 
            onClick={() => cerrarsesion()}
                type="button"
                className="bg-blue-800 w-full sm:w-auto font-bold uppercase text-xs rounded py-1 px-2 text-white shadow-md"
            >
                Cerrar Sesion
            </button>
        </div>
     );
}
 
export default Header;