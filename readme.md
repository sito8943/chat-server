## Chat-Server

Servidor de chat muy sencillo

### Bibliotecas

#### Servidor

- [cookie-parser@~1.4.4](https://www.npmjs.com/package/cookie-parser)
- [cors@2.8.5](https://www.npmjs.com/package/cors)
- [debug@~2.6.9](https://www.npmjs.com/package/debug)
- [express@~4.16.1](https://www.npmjs.com/package/express)
- [morgan@~1.9.1](https://www.npmjs.com/package/morgan)
- [nodemon@^2.0.15](https://www.npmjs.com/package/nodemon)
- [socket.io@4.4.0](https://www.npmjs.com/package/socket.io)
- [uuid@8.3.2](https://www.npmjs.com/package/uuid)

#### Cliente

- [base62str@^1.0.9](https://www.npmjs.com/package/base62str)
- [crypto-js@^4.1.1](https://www.npmjs.com/package/crypto-js)
- [nanoid@^3.3.1](https://www.npmjs.com/package/nanoid)
- [react@^17.0.2](https://www.npmjs.com/package/react)
- [react-dom@^17.0.2](https://www.npmjs.com/package/react-dom)
- [react-scripts@5.0.0](https://www.npmjs.com/package/react-scripts)
- [socket.io-client@^4.4.1](https://www.npmjs.com/package/socket.io-client)

### Rutas

- :3000/ Página de inicio
- :3001/ Sala de chat

### Funcionamiento

#### Servidor

- Al unirse un cliente este recibe un UUID único y carga todos los mensajes que se han enviado, todos los demás usuarios serán notificados de la llegada de un nuevo usuario
- El usuario puede mandar mensajes estilo transmisión
- Al desconectarse un cliente todos los demás serán notificados

#### Cliente

- Al conectarse el cliente este crea una llave pública con nanoId
- Al enviar un mensaje el cliente encripta el mensaje con AES usando la llave pública y lo envía con llave pública encriptada con base62
- Al recibir un mensaje de otro cliente este decencripta el mensaje con AES usando la llave pública recibida después de haberla descencriptado con base62
