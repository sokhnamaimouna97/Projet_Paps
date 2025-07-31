const mongoose=require("mongoose")
require("dotenv").config();
const uri = process.env.MONGODB_URI
const connectDB = async ()=>{
    try{
        await mongoose.connect(uri);
        console.log("Connection a la base de donne reussi");
    }catch(error){
        console.log(error);
        
    }
}
module.exports=connectDB;