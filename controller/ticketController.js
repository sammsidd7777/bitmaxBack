const AppError = require("../utils/AppError");
const USER = require("../module/userSchema");
const TICKET = require("../module/ticketSchema");
const sendTestEmail = require("../testEmail");



const createTicket = async (req, res, next) => {
  try {
    const { Subject, Description,  Priority } = req.body;

    console.log( Subject, Description,  Priority,"datacoming")
    const id = req.user?._id;

    // 1. Validate required fields
    if (!Subject || !Description  || !Priority) {
      return next(
        new AppError("Some details are missing", 400)
      );
    }

    // 2. Find logged-in user
    const user = await USER.findById(id);

    if (!user) {
      return next(
        new AppError("User not found", 404)
      );
    };

    // 3. Generate ticket number
    const totalTicket = await TICKET.countDocuments();

    const TicketNum = `TKT-${10001 + totalTicket}`;

    // 4. Create ticket in MongoDB
    const ticket = await TICKET.create({
      TicketNumber: TicketNum,
      Subject,
      Description,
      Priority,
      RequesterId: id,
      RequesterEmail: user.Email,
      Status: "open",
    });

    // 5. Send response
    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    return next(error);
  }
};



const myTicketList = async (req, res, next) => {
  try {
    // 1. Get logged-in user ID
    const id = req.user?._id;

    console.log(req.user,"myTicketlist")

    // 2. Find user
    const user = await USER.findById(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // 3. Find tickets created by this user
    const List = await TICKET.find({
      $or: [
        { RequesterId: id },
        { RequesterEmail: user.Email },
      ],
    }).sort({ createdAt: -1 });

    // 4. Check if tickets exist
    if (List.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You have not created any tickets yet",
        tickets: [],
      });
    }

    // 5. Send response
    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      tickets: List,
    });
  } catch (error) {
    return next(error);
  }
};


const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(id, "params");

    const ticket = await TICKET.findById(id);

    if (!ticket) {
      return next(
        new AppError("Ticket not found", 404)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      ticket,
    });

  } catch (error) {
    next(error);
  }
};



const assignTicket = async (req, res, next) => {
  try {
   
    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return next(new AppError("Agent ID is required", 400));
    }

  
    const ticket = await TICKET.findById(id);
    const agent = await USER.findById(agentId);

    if (!ticket) {
      return next(new AppError("Ticket not found", 404));
    }

    if (!agent) {
      return next(new AppError("Agent not found", 404));
    }

    if (agent.Role !== "supportAgent") {
      return next(
        new AppError("Selected user is not a support agent", 403)
      );
    }

 
    if (ticket.Category !== agent.AgentRole) {
      return next(
        new AppError(
          "Ticket category does not match the agent's category",
          403
        )
      );
    }

 
    ticket.Status = "in_progress";
    ticket.AssignedTo = agent._id;
    ticket.Assigned = true;

    await ticket.save();

    
    await sendTestEmail({
      to: agent.Email,
      subject: "You have been assigned a new ticket",
      text: `Ticket ${ticket.TicketNumber}: ${ticket.Subject}`,
    });

    await sendTestEmail({
      to: ticket.RequesterEmail,
      subject: "Your support ticket has been assigned",
      text: "Our support agent is reviewing your ticket and will respond as soon as possible.",
    });

    return res.status(200).json({
      success: true,
      message: "Ticket assigned to agent successfully",
      ticket,
    });
  } catch (error) {
    return next(error);
  }
};


const allTicket = async (req, res, next) => {
  try {
    // 1. Get logged-in user ID
    console.log(req?.user,"user")
    const id = req.user?._id || req?.user.id;

    if (!id) {
      return next(new AppError("User not authenticated", 401));
    }

    // 2. Find user
    const user = await USER.findById(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    let totalTicket = [];
    let assignTicket = [];
    let unAssinTicket = [];

    // 3. Admin can see all tickets
    if (user.Role === "admin") {
      totalTicket = await TICKET.find();

      assignTicket = totalTicket.filter(
        (ticket) => ticket.AssignedTo
      );

      unAssinTicket = totalTicket.filter(
        (ticket) => !ticket.AssignedTo
      );
    }

    // 4. Customer can see only their own tickets
    else if (user.Role === "customer") {
      totalTicket = await TICKET.find({
        RequesterId: id,
      });

      assignTicket = totalTicket.filter(
        (ticket) => ticket.AssignedTo
      );

      unAssinTicket = totalTicket.filter(
        (ticket) => !ticket.AssignedTo
      );
    }

    // 5. Support agent sees tickets assigned to them
    else if (user.Role === "supportAgent") {
      totalTicket = await TICKET.find({
        AssignedTo: id,
      });

      assignTicket = totalTicket;
      unAssinTicket = [];
    } else {
      return next(new AppError("Invalid user role", 403));
    }

    // 6. Response
    return res.status(200).json({
      success: true,
      totalCount: totalTicket.length,
      assignedCount: assignTicket.length,
      unassignedCount: unAssinTicket.length,
      totalTicket,
      assignTicket,
      unAssinTicket,
    });
  } catch (error) {
    return next(error);
  }
};












module.exports = { createTicket,myTicketList,assignTicket,allTicket,getTicketById };
