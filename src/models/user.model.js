const mongoose=require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    failedLoginAttempts:{
        type: Number,
        default: 0
    },
    lastFailedLoginAt:{
        type: Date,
        default: null
    },
    lockUntil:{
        type: Date,
        default: null,
    },
    accountStatus:{
        type: String,
        enum : ["active", "locked", "suspended"],
        default:"active"
    }
},
{ timestamps: true }
);

const User = mongoose.model("User",userSchema);

module.exports= User;