import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import fetch from 'node-fetch';
import { setContext } from 'apollo-link-context';
// le decimos a donde se va a conectar
const httpLink = createHttpLink({
    uri: 'http://localhost:4000/',
    fetch
});
// le agregamos un header nuevo
const authLink = setContext((_, { headers }) => {
    // leer el storage almacenado
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    }
});
// mandamos a apolloclient
const client = new ApolloClient({
    connectToDevTools:true,
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink)
});
export default client;