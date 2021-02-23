import React from 'react';
import Layout from '../components/Layout'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, gql } from '@apollo/client';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

const NUEVO_PRODUCTO = gql`
    mutation nuevoProducto($input: ProductoInput!) {
        nuevoProducto(input:$input) {
        id
        nombre
        existencia
        precio
        }
    }
`;
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

const NuevoProducto = () => {
    // routing 
    const router = useRouter();

    // mutation de apollo
    // una vez ejecutado el mutation, update cache y le pasamos el nuevo producto
    const [nuevoProducto] = useMutation(NUEVO_PRODUCTO, {
        update(cache, { data: { nuevoProducto } } ) {
            // obtener el objeto de cache
            const { obtenerProductos } = cache.readQuery({ query: OBTENER_PRODUCTOS });

            // reescribir el objeto
            cache.writeQuery({
                query: OBTENER_PRODUCTOS,
                // creamos copia de obtener producto y le agregamos el nuevo producto
                data: {
                    obtenerProductos: [...obtenerProductos, nuevoProducto]
                }
            })
        }
    });

    const formik = useFormik({
        initialValues: {
            nombre: '',
            existencia: '',
            precio: ''
        },
        validationSchema: Yup.object({
            nombre: Yup.string()
                .required('El nombre del producto es requerido'),
            existencia: Yup.number()
                .required('La existencia es obligatoria')
                .positive('No se aceptan números negativos')
                .integer('La existencia debe ser numeros enteros'),
            precio: Yup.number('El precio solo puede contener numeros')
                .typeError('Solo puede contener numeros')
                .required('El precio del producto es obligatorio')
                .positive('No se aceptan números negativos')
        }),
        onSubmit: async valores => {
            console.log(valores);
            const { nombre, existencia, precio } = valores;
            try {
                const { data } = await nuevoProducto({
                    variables: {
                        input: {
                            nombre,
                            existencia,
                            precio
                        }
                    }
                });
                // mostrar alerta
                Swal.fire(
                    'Creado!',
                    data.nuevoProducto.nombre,
                    'success'
                )
                // console.log(data);
                router.push('/productos');

            } catch (error) {
            // console.log(JSON.stringify(error, null, 2));
            }
        }
    })
    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Nuevo Producto</h1>
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
                                placeholder="Nombre Producto"
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
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="existencia">
                                Cantidad disponible:
                        </label>
                            <input
                                className="shadow appereance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                                id="existencia"
                                type="number"
                                placeholder="Cantidad Disponible"
                                value={formik.values.existencia}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.existencia && formik.errors.existencia ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.existencia}</p>
                            </div>
                        ) : null}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="empresa">
                                Precio:
                        </label>
                            <input
                                className="shadow appereance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-600"
                                id="precio"
                                type="number"
                                placeholder="Precio Producto"
                                value={formik.values.precio}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.precio && formik.errors.precio ? (
                            <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                <p className="font-bold">Error</p>
                                <p>{formik.errors.precio}</p>
                            </div>
                        ) : null}
                        <input
                            type="submit"
                            className="bg-gray-800 w-full mt-5 p-2 text-white uppercase rounded font-bold hover:bg-gray-900"
                            value="Registrar Producto"
                        />
                    </form>
                </div>
            </div>
        </Layout>


    );
}

export default NuevoProducto;