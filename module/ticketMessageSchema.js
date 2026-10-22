const { default: mongoose } = require("mongoose");
const { File } = require("node:buffer");


const ticketMessageSchema = new mongoose.Schema({

    // ticketId, senderId, senderEmail, senderRole, type(public/internal), body, attachments, source(web/email), emailMessageId, createdAt

    TicketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },
    sourceSenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    SenderEmail: {
        type: String,
        lowercase: true,
        required: true
    },
    SenderRole: {
        type: String,
        enum: ["admin", "customer", "supportAgent "]
    },
    Body: {
        type: String,
    },
    Attachments: {
        type: File
    },
    Source: {
        type: String,
        enum: ["web", "email"]
    },
    EmailMessageId: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        enum: ["public", "internal"]
    }
},
    {
        timestamps: true
    }


);
    


module.exports = mongoose.model("TICKETMESSAGE", ticketMessageSchema)