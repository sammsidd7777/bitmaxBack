const express = require("express");
const { allTicket, createTicket, assignTicket, myTicketList, getTicketById } = require("../controller/ticketController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();



router.get("/my-tickets",protect,myTicketList);
router.post("/",protect,createTicket);
router.post("/:ticketId/assign",protect,assignTicket );
router.get("/:id", getTicketById)



// router.post ("/:ticketId/message");
// router.post ("/:ticketId/resolve");
// router.post ("/:ticketId/reopen");
// router.post ("/:ticketId/close");
// router.get("/:ticketId/message");
// router.get("/:ticketId/activity");

module.exports = router;






