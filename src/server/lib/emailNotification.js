var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
exports.sendEmail  = function (user,room,cb) {



    // create reusable transporter object using the default SMTP transport
    let smtpTransport = nodemailer.createTransport({
        service: "Gmail", // secure:true for port 465, secure:false for port 587
        auth: {
            user: "testchatbot33@gmail.com",
            pass: "testing@123"
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "amitchh@smartdatainc.net", // sender address
        to: "davinder.kaur@smartdatainc.net",//", // list of receivers,
        cc:"chhangani.amit@gmail.com",
        subject: "Chatbot", // Subject line
        text: "New User want to chat with you" , // plaintext body
        html: `<h3>${user} wants to chat with you </h3>
               <a href=http://172.24.5.22:3000/hrTeam/AnonymousHrDavinder/${room}>Please click here</a>` // html body
    }

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message %s sent: %s', info.messageId, info.response);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
}

//module.exports = sendEmail