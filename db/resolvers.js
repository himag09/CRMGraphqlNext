const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env'});

const crearToken = (usuario, secreta, expiresIn) => {
    console.log(usuario);
    const {id, email, nombre, apellido } = usuario; 
    return jwt.sign( { id, email, nombre, apellido }, secreta, { expiresIn })
}
// resolver /* suelen ser funciones */
const resolvers ={
    Query: {
        obtenerUsuario: async (_, {}, ctx) => {
            return ctx.usuario;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({});
                return productos
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, { id }) => {
            // revisar si el producto existe
            const producto = await Producto.findById(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            return producto;
        },
        obtenerClientes: async() => {
            try {
                const clientes = await Cliente.find({});
                return clientes
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientesVendedor: async( _, {}, ctx ) => {
            try {
                const clientes = await Cliente.find({vendedor: ctx.usuario.id.toString()});
                return clientes
            } catch (error) {
                console.log(error);
            }
        },
        obtenerCliente: async( _, { id }, ctx) => {
            // revisar que el cliente exista
            const cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }
            // quien lo creo puede verlo
            // .vendedor.toString porque es un objeto
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            return cliente;

        },
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {                                                                   //populate es como un innerjoin
                const pedidos = await Pedido.find({vendedor: ctx.usuario.id}).populate('cliente');
                console.log(pedidos);
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedido: async (_, {id}, ctx) => {
            // si el pedido existe 
            const pedido = await Pedido.findById(id);
            if (!pedido) {
                throw new Error('Pedido no encontrado');
            }
            // solo quien lo creo lo puede ver 
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            // retornamos el pedido
            return pedido;
        },
        obtenerPedidosEstado: async(_,{estado}, ctx) => {
            const pedidos = await Pedido.find({vendedor: ctx.usuario.id, estado});
            return pedidos;
        },
        mejoresClientes: async () => {
            //  al usar aggregate, mongo devuelve un objeto plano de Javascript ( por lo que lei ), y lo que está en el type de cliente es un ID que mongo lo puede obtener, no asi del objeto plano que devuelve la funcion aggregate, y en alguna forma termina cambiando el campo "id", por "_id". Una solucion rapida que encontre, es agregar en el type de cliente,  el campo "_id: ID". Entonces en el query, si le pedis el id, sigue siendo null, pero si le pedis "_id", va a obtener el id
            const clientes= await Pedido.aggregate([
                { $match : {estado : "COMPLETADO"} },
                { $group : {
                    _id: "$cliente",
                    total: { $sum: '$total' }
                }},
                {
                    $lookup: {
                        from: 'clientes',
                        localField: '_id',
                        foreignField: "_id",
                        as: "cliente"
                    }
                },
                {
                    $limit: 10
                },
                {
                    $sort: { total : -1} 
                }
            ]);
            return clientes;
        },
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([
                { $match : { estado : "COMPLETADO"} },
                { $group : {
                    _id : "$vendedor",
                    total: {$sum : '$total'}
                }},
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total : -1, _id:1 }
                }
            ]);
            return vendedores;
        },
        buscarProducto: async(_, { texto }) => {
            const productos = await Producto.find({ $text: {$search: texto } }).limit(10)
            return productos;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input} ) => {
            //destructuring 
            const { email, password } = input;
            // revisar si está registrado
            const existeUsuario = await Usuario.findOne({email});
            if (existeUsuario) {
                throw new Error('El usuario ya está registrado');
            } 
            // hashear password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                // guardar en la bdd
                const usuario = new Usuario(input);
                usuario.save();
                return usuario
            } catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, {input}) => {
            const { email, password } = input;
            //Si el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }
            // password correcto 
            const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error('La contraseña es incorrecta');
            }
            // CREAR TOKER 
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h') 
            }
        },
        nuevoProducto: async (_, {input}) => {
            try {
                const producto = new Producto(input);
                // almacenar en la bd
                const resultado = await producto.save();

                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, { id, input }) => {
            // let para poderlo reasignar
            let producto = await Producto.findById(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            // guardar en la bdd        new:true para que retorne el nuevo registro editado
            producto = await Producto.findOneAndUpdate({ _id : id}, input, { new: true });
            return producto;
        },
        eliminarProducto: async(_, { id }) => {
            let producto = await Producto.findById(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            // eliminar
            await Producto.findOneAndDelete({ _id: id});
            return "Producto Eliminado";
        },
        nuevoCliente: async (_, { input }, ctx) => {
            console.log(ctx);
            const { email } = input;
            // si el cliente ya está registrado
            console.log(input);
            const cliente = await Cliente.findOne({email});
            if (cliente) {
                throw new Error('El cliente ya está registrado');

            }
            const nuevoCliente = new Cliente(input);
            // asignar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id;            
            // guardar en la bd
            try {
                const resultado = await nuevoCliente.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarCliente: async (_, { id, input }, ctx) => {
            // verificar si existe o no
            let cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('Ese cliente no existe');
            }
            // verificar si es el vendedor el que edit
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            // guardar el cliente 
            cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});
            return cliente
        },
        eliminarCliente: async (_, {id}, ctx) => {
            // verificar si existe o no
            let cliente = await Cliente.findById(id);
            if (!cliente) {
                throw new Error('Ese cliente no existe');
            }
            // verificar si es el vendedor el que edit
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            // eliminar cliente 
            await Cliente.findOneAndDelete({_id: id});
            return "Cliente eliminado"
        },
        nuevoPedido: async (_, {input}, ctx) => {
            const { cliente } = input;
            // Verificar si el cliente existe
            let clienteExiste = await Cliente.findById(cliente);

            if (!clienteExiste) {
                throw new Error("El cliente no existe");
            }
            //verificar si el cliente es del vendedor
            if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("No tienes las credenciales");
            }
            // Revisar el stock disponible
            // input.pedido.forEach(async articulo => { no funciona pq se ejecuta igual, hay que usar forawait
            for await ( const articulo of input.pedido) {  
                const { id } = articulo;
                const producto = await Producto.findById(id);
                if (articulo.cantidad > producto.existencia) {
                    throw new Error(`la cantidad ingresada del producto: ${producto.nombre} excede a la del stock`)                   
                } else {
                    // restar la cantidad de existencia 
                    producto.existencia = producto.existencia - articulo.cantidad;
                    await producto.save();
                }
            }
            //Crear nuevo pedido 
            const nuevoPedido = new Pedido(input);
            // asignarle vendedor 
            nuevoPedido.vendedor = ctx.usuario.id
            
            // guardar en la base de datos
            const resultado = await nuevoPedido.save();
            return resultado;
        },
        actualizarPedido: async(_, {id, input}, ctx) => {
            const {cliente} = input
            // revisar que el pedido exista
            const existePedido = await Pedido.findById(id);
            if (!existePedido) {
                throw new Error('El pedido no existe');
            }
            // verificar si el cliente existe
            const existeCliente = await Cliente.findById(cliente);
            if (!existeCliente) {
                throw new Error('El cliente no existe');
            }
            // verificar si cliente y pedido pertenece al vendedor
            if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            // revisar el stock
            if (input.pedido) {
                for await ( const articulo of input.pedido) {  
                    const { id } = articulo;
                    const producto = await Producto.findById(id);
                    if (articulo.cantidad > producto.existencia) {
                        throw new Error(`la cantidad ingresada del producto: ${producto.nombre} excede a la del stock`)                   
                    } else {
                        // restar la cantidad de existencia 
                        producto.existencia = producto.existencia - articulo.cantidad;
                        // else if (articulo.cantidad < producto.existencia){
                         //     console.log(existePedido.pedido[0].cantidad);
                        //     sumar cantidad???
                        await producto.save();
                    }
                }
                
            }
            // guardar el pedido
            const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true});
            return resultado;

        },
        eliminarPedido: async(_, {id}, ctx)=> {
            // verificar si existe  o no 
            const pedido = await Pedido.findById(id);
            if (!pedido) {
                throw new Error('El pedido no existe');
            }
            //verificar el vendedor
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            // eliminar de la bdd
            await Pedido.findOneAndDelete({_id: id});
            return "Pedido eliminado";
        }
    }
}
module.exports = resolvers;