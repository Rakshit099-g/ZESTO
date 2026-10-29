import mongoose from "mongoose"

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI as string,{
            dbName:"Zesto_Database"
        })
        console.log("Connected to DataBase")
    }
    catch(error){
        console.log(error)
    }
}

export default connectDB