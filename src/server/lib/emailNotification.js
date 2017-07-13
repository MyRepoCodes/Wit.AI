var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
exports.sendEmail  = function (user,room,cb) {
    // create reusable transporter object using the default SMTP transport
    let smtpTransport = nodemailer.createTransport({
        service: "Gmail", // secure:true for port 465, secure:false for port 587
        auth: {
            user: "************************",
            pass: "*************************"
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "******************", // sender address
        to: "******************************",//", // list of receivers,
        cc:"******************************",
        subject: "Chatbot", // Subject line
        text: "New User want to chat with you" , // plaintext body
        html: `<h3>${user} wants to chat with you </h3>
       <a href=*****************************************/${room}>Please click here</a>` // html body

    }

    smtpTransport.sendMail(mailOptions, function (error, info) {
    });
}

//module.exports = sendEmail
