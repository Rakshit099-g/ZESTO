//cloudinary accepts buffer only so when we have to upload image then we have to make buffer of it and for making buffer we make datauri.ts
import DataUriParser from "datauri/parser.js";
import path from "path" //path is to get the path of file
const getBuffer = (file:any)=>{
    const parser = new DataUriParser()
    const ext_name = path.extname(file.originalname).toString()
    return parser.format(ext_name,file.buffer)
}
export default getBuffer