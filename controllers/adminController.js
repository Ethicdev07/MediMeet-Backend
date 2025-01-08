import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";


//Api for adding doctor

const addDoctor = async (req, res)=> {
  try {

    const { name, email, password, speciality, degree,  experience, about,   fees,  address } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
      return res.json({success: false, message: "All fields are required"});
    }
    
    //validating email

    if(!validator.isEmail(email)){
      return res.json({success: false, message: "Please enter a valid email"});
    }

    //validating password

    if(password.length < 8){
      return res.json({success: false, message: "Password must be at least 8 characters long"});
    }

     // Check if doctor already exists
     const existingDoctor = await doctorModel.findOne({ email });
     if (existingDoctor) {
       return res.status(409).json({ success: false, message: "Doctor with this email already exists" });
     }

    //hashing doctor password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    

    //upload image to cloudinary

    const imageUpload =  await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
    const imageUrl = imageUpload.secure_url;
    
    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address:JSON.parse(address),
      date: Date.now()
    }

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.status(201).json({success: true, message: "Doctor added successfully"});

  } catch (error) {
    console.log(error)
    res.status(500).json({success: false, message: error.message});
  }
}

//Api for admin login

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, password },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } 
      );

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
      });
    }

    return res.json({ success: false, message: "Invalid email or password" });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};


//API TO GET ALL DOCTORS LIST FROM THE ADMIN PANEL

const getAllDoctors = async (req, res) => {
  try {

    const doctors = await doctorModel.find({}).select('-password')
    res.json({success: true, doctors});
    
  } catch (error) {
    console.log(error);
    res.json({success: false, message: error.message});
    
  }
}

export { addDoctor, adminLogin, getAllDoctors };