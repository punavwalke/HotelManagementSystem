require('dotenv').config()
const express=require('express')
const app=express()
const path=require('path')
const hbs=require('hbs')
const bcrypt=require('bcryptjs')
//to make the connection with db
require('./db/conn')

const Register=require("./models/register")

const port=process.env.PORT||3000

const static_path=path.join(__dirname,"../public")
const template_path=path.join(__dirname,"../templates/views")
const partials_path=path.join(__dirname,"../templates/partials")

app.use(express.json())
app.use(express.urlencoded({extended:false}))

//to use static html pages
app.use(express.static(static_path))
app.set("view engine","hbs")
app.set("views",template_path)
hbs.registerPartials(partials_path)

//console.log(process.env.SECRET_KEY)

app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/register",(req,res)=>{
    res.render("register")
})

//now create a new user

app.post("/register",async(req,res)=>{
    try {
        const password=req.body.password
        const confirmPassword=req.body.confirmPassword

        if(password===confirmPassword){
            const registerCustomer=new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                password:req.body.password,
                confirmPassword:req.body.confirmPassword
            })
            
            console.log("the success part "+registerCustomer)

            const token=await registerCustomer.generateAuthToken()

            const registered=await registerCustomer.save()
            res.status(201).render("index")
        }
        else{
            res.send("Passwords are not matching")
        }

    } catch (error) {
        res.status(400).send(error)
    }
})

//now read a customer

app.post("/login",async(req,res)=>{
    try {
        const email=req.body.email
        const password=req.body.password

        const usermail=await Register.findOne({email:email})

        const isMatch=await bcrypt.compare(password,usermail.password)

        const token=await usermail.generateAuthToken()

        if(isMatch){
            res.status(201).render("index")
        }
        else{
            res.status(400).render("Invalid password Details")
        }

    } catch (error) {
        res.status(400).send("Invalid Login Details")
    }
})

app.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})