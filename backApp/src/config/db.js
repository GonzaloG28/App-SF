import mongoose from "mongoose"
import envs from "../utils/envs.utils.js"

const connectDB = async () => {
    try{
        await mongoose.connect(envs.MONGO_URI)
        console.log("MongoDB conectado")
    } catch (error){
        console.log("Error conectando a MongoDB:", error.message)
        process.exit(1)
    }
}

export default connectDB