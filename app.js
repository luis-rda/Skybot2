const restify = require('restify');
const builder = require('botbuilder');
const funciones = require('./utils/functions.js');
const db = require('./db/dao.js');
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

/*ARUIZ: MEJORAS AL CODIGO -> CACHE DE RESPUESTAS AL INICIALIZAR EL APP*/
function inicializarCache() {
    let lstMessage = db.devolverMensajes();
    lstMessage.then(function (result) {
        myCache.set("lstMensajes", result, function (err, success) {
            if (!err && success) {
                console.log('Cache Cargada');
            }
        });
    });
}
/*FIN CACHE*/


let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8080, function () {
    console.log('%s listening to %s', server.name, server.url);
    inicializarCache();
});

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

server.get('https://skybot-danielazo.herokuapp.com/api/messages', function (req, response) {

    let respuesta = myCache.get( "lstMensajes", function( err, value ){
        if( !err ){
            if(value === undefined){
                console.log("Error al obtener los mensajes de la cache")
            }else{
                console.log("Se obtuvo los mensajes de la cache correctamente");
            }
        }
    });

    response.send(respuesta);
});

// Listen for messages from users
server.post('https://skybot-danielazo.herokuapp.com/api/messages', connector.listen());

// Receive messages from the user
    let bot = new builder.UniversalBot(connector, function (session) {
    let mensaje = session.message.text;
    let mensajeVal = session.message.text.toUpperCase();
    let listaMensajes = myCache.get( "lstMensajes" );
    let rpta = funciones.devolvermensaje(mensaje,mensajeVal, listaMensajes);
        
    if(mensajeVal.includes("GAA")){
         let msg = new builder.Message(session)
                    .text("GAAAAAAAAAAAAAAAAAAAAAAAAAAAA! DALE PLAY!!!")
                    .attachments([{
                        contentType: "video/mp4",
                        name: "oOyWRE50fjGr.mp4",
                        contentUrl: "https://a.uguu.se/oOyWRE50fjGr.mp4"
                    }]);
                session.endDialog(msg);
    };
    
        /*
        if(mensajeVal.indexOf("MEME") > -1) {
            if(rpta !== "NO ENTIENDO") {
                let msg = new builder.Message(session)
                    .text("Toma un momazo!")
                    .attachments([{
                        contentType: "image/jpeg",
                        contentUrl: rpta
                    }]);
                session.endDialog(msg);
            }else{
                session.send("Ese momo no me lo se ...");
            }
        }else{
            session.send(rpta);
        }
        
        */
    });

bot.on('conversationUpdate', function (message) {

    let danSalio = false;

    if (message.membersAdded && message.membersAdded.length > 0) {
        let membersAdded = message.membersAdded
            .map(function (m) {
                let isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.id : m.id) || '' + ' (Nombre: ' + m.id + ')';
            })
            .join(', ');

        bot.send(new builder.Message()
            .address(message.address)
            .text('Bienvenido ' + membersAdded + ' :)'));
    }

    if (message.membersRemoved && message.membersRemoved.length > 0) {
        let membersRemoved = message.membersRemoved
            .map(function (m) {
                if(m.id === "29:1WQ6aolBgg8k5pFCtNV3dk__auzje3gG56OGWnL9ro-g"){
                    danSalio = true;
                }
                let isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name) || '' + ' (Nombre: ' + m.name + ')';
            })
            .join(', ');

        if(danSalio){
            bot.send(new builder.Message()
                .address(message.address)
                .text('Marica se ha salido, alguien agreguelo porfa :S'));
        }

        bot.send(new builder.Message()
            .address(message.address)
            .text('El siguiente miembro ' + membersRemoved + ' se ha quitado :('));

    }
});
