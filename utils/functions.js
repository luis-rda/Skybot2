/**
 * Created by rualejan on 28/07/2017.
 */

exports.devolvermensaje = function (mensaje, mensajeM, lstMensajes) {


    if(mensajeM.includes('@')) {
        mensajeM = mensaje.split('@').reverse().pop();
    }

    for (let mensaje of lstMensajes) {

        let regex = new RegExp('@'+ mensaje.name, "i");
        if (mensajeM.match(regex)) {
            return mensaje.value;
        }
    }

    return "NO ENTIENDO";
};
