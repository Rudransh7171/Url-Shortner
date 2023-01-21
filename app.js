const express= require ('express')
const shortId=require('shortid')
const createHttpError = require('http-errors')
const mongoose =require('mongoose')
const path =require('path')
const shortUrl=require('./models/url.model')
const dotenv = require("dotenv");

dotenv.config();
const app=express()
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
mongoose.set('strictQuery',true)
mongoose.connect(process.env.DATABASE,{
    dbName:'url-shortner',
    useNewUrlParser:true,
    useUnifiedTopology:true,
    //useCreateIndex:true
}).then(()=>console.log('mongoose connected'))

app.set('view engine','ejs')
app.get('/',async(req,res,next)=>{
    res.render('index')
})

app.post('/',async(req,res,next)=>{
    try{
        const {url}=req.body
        if(!url){
            throw createHttpError.BadRequest('Provide  a valid url')
        }
        const UrlExist =await shortUrl.findOne({url})
        if(UrlExist){
            res.render('index',{shorturl:`http://${req.headers.host}/${UrlExist.shortId}`})
            return 
        }
        const shorturl=new shortUrl({url:url,shortId:shortId.generate()})
        const result=await shorturl.save()
        res.render('index',{shorturl:`http://${req.headers.host}/${result.shortId}`})
    }
    catch(error)
    {
        next(error)
    }
})
app.get('/:shortId',async(req,res,next)=>{
    try{
        const {shortId}=req.params
        const result= await shortUrl.findOne({shortId})
        if(!result){
            throw createHttpError.NotFound('Short Url Does Not exist')  
        }
        res.redirect(result.url)
    }
    catch(error)
    {
        next(error)
    }

})
app.use((req,res,next)=>{
    next(createHttpError.NotFound())
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500)
    res.render('index',{error: err.message})
})


app.listen(3000,()=>console.log('Server is on port 3000...'))