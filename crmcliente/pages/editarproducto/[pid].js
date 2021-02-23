import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Formik } from 'formik';
import * as Yup from 'yup'
import { gql, useQuery, useMutation } from '@apollo/client';
import Swal from 'sweetalert2';

const OBTENER_PRODUCTO = gql`
    query obtenerProducto($id: ID!) {
        obtenerProducto(id: $id) {
        id
        nombre
        existencia
        precio
        }
    }
`;
const ACTUALIZAR_PRODUCTO = gql `
    mutation actualizarProducto($id: ID!, $input: ProductoInput) {
        actualizarProducto(id: $id, input: $input) {
        id
        nombre
        existencia
        precio
        }
    }
`;

const EditarProducto = () => {
    const router = useRouter();
    const { query: { id } } = router;
    // console.log(id);
    // consultar para obtener el producto 
    const { data, loading, error } = useQuery(OBTENER_PRODUCTO, {
        variables: {
            id
        }
    });
    // mutation para modificar producto
    const [actualizarProducto] = useMutation(ACTUALIZAR_PRODUCTO);


    // schema of validation
    const schemaValidacion = Yup.object({
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
    })
    if (loading) return 'Cargando...'

    // para que no se vea nada mm
    if(!data) return 'Acción no permitida';
    const actualizarInfoProducto = async valores => {
        // console.log(valores);
        const { nombre, existencia, precio } = valores;
        try {
            const { data } = await actualizarProducto({
                variables: {
                    id,
                    input: {
                        nombre,
                        existencia,
                        precio
                    }
                }
            });
            // console.log(data);
            Swal.fire(
                'Actualizado',
                `El producto:s ${data.actualizarProducto.nombre} actualizó correctamente`,
                'success'
            )
            // redirigir 
            router.push('/productos')
        } catch (error) {
            console.log(error);
        }
    }
    const {obtenerProducto} = data;
    return (
        <Layout>
            <h1 className="text-2xl text-gray-800 font-light">Editar Producto</h1>

            <div className="flex justify-center mt-5">
                <div className="w-full max-w-lg">
                    <Formik
                        validationSchema={schemaValidacion}
                        // para que se reinice el form
                        enableReinitialize
                        initialValues={obtenerProducto}
                        onSubmit={(valores) => {
                            actualizarInfoProducto(valores)
                        }}
                    >
                        {props => {
                            return (
                                <form
                                    className="bg-white shadow-md px-8 pt-6 pb-8 mb-4"
                                    onSubmit={props.handleSubmit}
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
                                            value={props.values.nombre}
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                    </div>
                                    {props.touched.nombre && props.errors.nombre ? (
                                        <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                            <p className="font-bold">Error</p>
                                            <p>{props.errors.nombre}</p>
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
                                            value={props.values.existencia}
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                    </div>
                                    {props.touched.existencia && props.errors.existencia ? (
                                        <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                            <p className="font-bold">Error</p>
                                            <p>{props.errors.existencia}</p>
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
                                            value={props.values.precio}
                                            onChange={props.handleChange}
                                            onBlur={props.handleBlur}
                                        />
                                    </div>
                                    {props.touched.precio && props.errors.precio ? (
                                        <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                                            <p className="font-bold">Error</p>
                                            <p>{props.errors.precio}</p>
                                        </div>
                                    ) : null}
                                    <input
                                        type="submit"
                                        className="bg-gray-800 w-full mt-5 p-2 text-white uppercase rounded font-bold hover:bg-gray-900"
                                        value="Editar Producto"
                                    />
                                </form>
                            )
                        }}

                    </Formik>
                </div>
            </div>
        </Layout>
    );
}

export default EditarProducto;