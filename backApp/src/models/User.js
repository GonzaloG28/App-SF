import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
     nombre: {
        type: String,
        required: true
    },
    apellido:{
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ["profesor", "nadador"],
        required: true
    },
    debeCambiarPassword: {
        type: Boolean,
        default: false
    }
},{timestamps: true})

export default mongoose.model('User', userSchema)