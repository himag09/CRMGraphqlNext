import React, {useState} from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useMutation, gql } from '@apollo/client';

const NUEVO_CLIENTE = gql`
    mutation nuevoCliente($input: ClienteInput) {
        nuevoCliente(input: $input) {
        id
        nombre
        apellido
        email
        telefono
        }
    }
`;
const OBTENER_CLIENTES_USUARIO = gql`
  query	obtenerClientesVendedor {
    obtenerClientesVendedor {
      id
      nombre
      apellido
      empresa
      email
    }
  }
`;
const NuevoCliente = () => {
    const router = useRouter();
    // mensaje de alerta 
    const [mensaje, guardarMensaje] = useState(null);

// cuando se insertan nuevos registros se debe actualizar al igual que cuando se elimina, si se usa esta sintaxis se ahorra una consulta, si se usa refresh es una consulta más y en cambio con cache se gana en perfomance y se gasta menos en la base de ddatos 
    const [nuevoCliente] = useMutation(NUEVO_CLIENTE, {
        update(cache, { data: { nuevoCliente }}) {
            // obtener el objeto de cache que deseamos actualizar
            const { obtenerClientesVendedor } = cache.readQuery({ query: OBTENER_CLIENTES_USUARIO});
            // reescribimos el cache pq cache nunca se debe modificar, se debe reescribir
            // creamos nuevo arregloqque toma copia que hay en cache + lo nuevo que se le agrega y se reescriber el de obtenerclientesvendedor
            cache.writeQuery({
                query: OBTENER_CLIENTES_USUARIO,
                data: {
                    obtenerClientesVendedor: [...obtenerClientesVendedor, nuevoCliente]
                }
            })
        }
    });
    const formik = useFormik({
        initialValues: {
            nombre: '',
            apellido: '',
            empresa: '',
            email: '',
            telefono: ''
        },
        validationSchema: Yup.object({
            nombre: Yup.string()
                .required('El nombre del cliente es obligatorio'),
            apellido: Yup.string()
                .required('El apellido del cliente es obligatorio'),
            empresa: Yup.string()
                .required('El campo de la empresa es obligatorio'),
            email: Yup.string()
                .email('El email no es valido')
                .required('El email del cliente es obligatorio')
        }),
        onSubmit: async valores => {
            // data es la respuesta que obtenemos de mutation una vez que cum correctamente
            console.log(valores);
            const { nombre, apellido, empresa, email, telefono } = valores;
            
            try {
                const { data } = await nuevoCliente({
                    variables: {
                        input: {
                            nombre,
                            apellido,
                            empresa,
                            email,
                            telefono
                        }
                    }
                });
                // console.log(data.nuevoCliente);
                // redireccionar  hacia clientes 
                router.push('/');
            } catch (error) {
                // console.log(error);
                guardarMensaje(error.message.replace('GraphQL error: ', ''));
                setTimeout(() => {
                    guardarMensaje(null);
                }, 2700);
            }
        }
    });
    const mostrarMensaje = () => {
        return (
            <div className="bg-white py-2 px-3 w-full my-3 px-3 my-3 max-w-sm text-center mx-auto">
                <p>{mensaje}</p>
            </div>
        )
    }
    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Nuevo Cliente</h1>
            {mensaje && mostrarMensaje()}

            <div className="flex justify-center mt-5">
                <div className="w-full max-w-lg">
                    <form
                        className="bg-white shadow-md px-8 pt-6 pb-8 mb-4"
                        onSubmit={formik.handleSubmit}
                    >
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                                Nombre:
                        </label>
                            <input
                                className="shadow appereance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                                id="nombre"
                                type="text"
                                placeholder="Nombre Cliente"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.nombre && formik.errors.nombre ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.nombre}</p>
                            </div>
                        ) : null}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apellido">
                                Apellido:
                        </label>
                            <input
                                className="shadow appereance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                                id="apellido"
                                type="text"
                                placeholder="Apellido Cliente"
                                value={formik.values.apellido}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.apellido && formik.errors.apellido ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.apellido}</p>
                            </div>
                        ) : null}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="empresa">
                                Empresa:
                        </label>
                            <input
                                className="shadow appereance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                                id="empresa"
                                type="text"
                                placeholder="Empresa Cliente"
                                value={formik.values.empresa}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.empresa && formik.errors.empresa ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.empresa}</p>
                            </div>
                        ) : null}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email:
                        </label>
                            <input
                                className="shadow appereance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                                id="email"
                                type="email"
                                placeholder="Email Cliente"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.email && formik.errors.email ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.email}</p>
                            </div>
                        ) : null}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telefono">
                                Teléfono:
                        </label>
                            <input
                                className="shadow appereance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                                id="telefono"
                                type="tel"
                                placeholder="Telefono Cliente"
                                value={formik.values.telefono}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <input
                            type="submit"
                            className="bg-gray-800 w-full mt-5 p-2 text-white uppercase rounded font-bold hover:bg-gray-900"
                            value="Registrar Cliente"
                        />
                    </form>
                </div>
            </div>

        </Layout>
    );
}

export default NuevoCliente;