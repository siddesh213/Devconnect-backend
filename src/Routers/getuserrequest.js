const express=require("express")
const {UserAuth}=require("../middlwares/auth.js")
const {ConnectionRequestModel}=require("../models/sendconnection.js")
const getuserrequest=express.Router()
const {UserModel}=require("../models/user")
getuserrequest.get("/connection/request/recevied", UserAuth, async (req, res) => {
  try {
    const LoggedInUser = req.User;
    const findAllRequest = await ConnectionRequestModel.find({
      ToUserid: LoggedInUser._id,
      Status: "interested"
    }).populate("FromUserId", ["FirstName", "LastName", "PhotoUrl", "Age", "Gender", "About", "Skills"]);

    res.json({
      message: "All the requests you have received",
      connectionRequests: findAllRequest
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});


getuserrequest.get("/connection/accepted", UserAuth, async (req, res) => {
  try {
    const loggedPearson = req.User;

    const Getallconnections = await ConnectionRequestModel.find({
      $or: [
        { FromUserId: loggedPearson._id, Status: "accepted" },
        { ToUserid: loggedPearson._id, Status: "accepted" },
      ],
    })
      .populate("FromUserId", ["FirstName", "Skills"])
      .populate("ToUserid", ["FirstName", "Skills"]);

    // Use map to get only the friend (other user)
    const friends = Getallconnections.map(row => {
      if (row.FromUserId._id.toString() === loggedPearson._id.toString()) {
        return row.ToUserid; // friend is the receiver
      }
      return row.FromUserId; // friend is the sender
    });

    res.json({
      message: "find all your connections",
      friends
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// In getuserrequest.js or a new route
getuserrequest.get("/connection/stats", UserAuth, async (req, res) => {
  try {
    const user = req.User;

    const pendingRequests = await ConnectionRequestModel.countDocuments({
      ToUserid: user._id,
      Status: "interested",
    });

    const totalConnections = await ConnectionRequestModel.countDocuments({
      $or: [
        { FromUserId: user._id, Status: "accepted" },
        { ToUserid: user._id, Status: "accepted" },
      ],
    });

    res.json({
      pendingRequests,
      totalConnections,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

getuserrequest.get("/feed", UserAuth, async (req, res) => {
  try {
    const loggedUser = req.User;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 20) limit = 10;
    const skip = (page - 1) * limit;

    // ✅ Find all connection requests related to this user
    const existingConnections = await ConnectionRequestModel.find({
      $or: [
        { FromUserId: loggedUser._id },
        { ToUserid: loggedUser._id },
      ],
    }).select(["FromUserId", "ToUserid"]);

    // ✅ Collect all IDs to exclude (including self)
    const excludeIds = new Set([loggedUser._id.toString()]);
    existingConnections.forEach((conn) => {
      if (conn.FromUserId) excludeIds.add(conn.FromUserId.toString());
      if (conn.ToUserid) excludeIds.add(conn.ToUserid.toString());
    });

    // ✅ Fetch all users except excluded ones
    let query = {
      _id: { $nin: Array.from(excludeIds) },
    };

    // ✅ (optional) Only filter by profile completeness if user’s profile is complete
    const loggedUserData = await UserModel.findById(loggedUser._id);
    const hasCompleteProfile =
      loggedUserData.PhotoUrl &&
      loggedUserData.About &&
      loggedUserData.Skills &&
      loggedUserData.Skills.length > 0;

    if (hasCompleteProfile) {
      query.PhotoUrl = { $exists: true, $ne: "" };
      query.About = { $exists: true, $ne: "" };
    }

    const feedUsers = await UserModel.find(query)
      .select([
        "FirstName",
        "LastName",
        "Age",
        "Gender",
        "About",
        "Skills",
        "PhotoUrl",
      ])
      .skip(skip)
      .limit(limit);

    if (!feedUsers || feedUsers.length === 0) {
      return res.json({
        message: [],
        info: "No new users available right now.",
      });
    }

    return res.json({ message: feedUsers });
  } catch (err) {
    console.error("Feed Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});




module.exports={getuserrequest}