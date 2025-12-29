import mongoose from "mongoose";


const channelSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    members:[{type: mongoose.Schema.ObjectId,ref:"Users",required:true}],
    admin:{type: mongoose.Schema.ObjectId,ref:"Users",required:true},
    messages:[{type: mongoose.Schema.ObjectId,ref:"Messages",required:false}],
    createdAt:{
        type:Date,
        default:Date.now,

    },
    updatedAt:{
        type:Date,
        default:Date.now,
    },

});

channelSchema.pre("save",function(next){
    if (this.members.length === 0) {
        return next(new Error("A channel must have at least one member."));
    }

    this.updatedAt= Date.now();
    next();
});


channelSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });  // ✅ Properly updating `updatedAt`
    next();
});

const Channel = mongoose.model("Channels",channelSchema);

export default Channel;