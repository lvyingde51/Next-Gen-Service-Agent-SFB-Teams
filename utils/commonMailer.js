(function () {
    //imports
    const nodemailer = require('nodemailer');
    var log = require('../utils/logs');

    var sendMail = function (subject, mailAddress, data) {
        let mailSubject = '', messageContent = '';
        log.consoleDefault('Sending Mail...');
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: '39416.hexaware@gmail.com',
                pass: 'T3m!24618024'
            }
        });

        switch (subject) {
            case "Create Incident":
                mailSubject = 'RE : New Incident Logged';
                messageContent = `<html>
                                        <head>
                                            <style>
                                                p.green {
                                                    color: green;
                                                }
                                                .render table, .render td, .render th {
                                                    border: 1px solid #000;
                                                }
                                                .render table {
                                                    border-collapse: collapse;
                                                }
                                            </style>
                                        </head>
                                        <body>
                                            Hi
                                            <br/><br/><br/>
                                            <div class="render">
                                                <table>
                                                    <tr>
                                                        <th>Incident ID</th>
                                                        <th>Urgency</th>
                                                        <th>Category</th>
                                                        <th>Short Description</th>
                                                        <th>Status</th>
                                                    </tr>
                                                    <tr>
                                                        <td>` + data.incidentid + `</td>
                                                        <td>` + data.urgency + `</td>
                                                        <td>` + data.category + `</td>
                                                        <td>` + data.short_description + `</td>
                                                        <td>` + data.status + `</td>
                                                    </tr>
                                                </table>
                                            </div>
                                            <br/><br/><br/>
                                            <p>Please do not reply to this mail. This is an auto generated mail</p>
                                            <br/>
                                            <p class="green">Please do not print this email unless it is absolutely necessary.</p>
                                        </body>
                                    </html>`
                break;
            case "Create Service Request":
                mailSubject = 'RE : New Service Request Logged';
                messageContent = `<html>
                                        <head>
                                            <style>
                                                p.green {
                                                    color: green;
                                                }
                                                .render table, .render td, .render th {
                                                    border: 1px solid #000;
                                                }
                                                .render table {
                                                    border-collapse: collapse;
                                                }
                                            </style>
                                        </head>
                                        <body>
                                            Hi
                                            <br/><br/><br/>
                                            <div class="render">
                                                <table>
                                                    <tr>
                                                        <th>Service Request Item Number</th>
                                                        <th>Urgency</th>
                                                        <th>Requested For</th>
                                                    </tr>
                                                    <tr>
                                                        <td>` + data.sr_ID + `</td>
                                                        <td>` + data.short_description + `</td>
                                                    </tr>
                                                </table>
                                            </div>
                                            <br/><br/><br/>
                                            <p>Please do not reply to this mail. This is an auto generated mail</p>
                                            <br/>
                                            <p class="green">Please do not print this email unless it is absolutely necessary.</p>
                                        </body>
                                    </html>`
                break;
        }

        transporter.sendMail({
            from: '39416.hexaware@gmail.com',
            to: mailAddress,
            subject: mailSubject,
            html: messageContent
        });
    };

    module.exports.sendMail = sendMail;
}());