import Route from '../structures/RouteBuilder';

export default
(new Route)
  .on('get', async (request, response) => 
    await response.send('Hello, world!'),
  );