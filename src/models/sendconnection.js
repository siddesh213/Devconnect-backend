const mongoose=require("mongoose")
const SendConnectionRequest= new mongoose.Schema({
    FromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true

    },
    ToUserid:{
            type:mongoose.Schema.Types.ObjectId,
            require:true
    },
    Status:{
        type:String,
      enum:{
    values:["ignored", "interested", "accepted", "rejected"],
    message:"{VALUE} is incorrect status type"
},

        require:true
    }
},{
    timestamps:true
});
SendConnectionRequest.index({FromUserId:1,ToUserid:1})
const ConnectionRequestModel=new mongoose.model("Connectionrequestmodel",SendConnectionRequest)
module.exports={ConnectionRequestModel}