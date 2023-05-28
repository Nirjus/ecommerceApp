const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/mongoose");


//handel Uncaught Exception
process.on("uncaughtException",(err)=>{
       console.log(`Error: ${err.message}`);
       console.log(`sutting down the server due to Uncaught Exception`);
       process.exit(1);
})
// COnfig

dotenv.config({path:"Backend/config/config.env"});

//connecting to datbase
connectDatabase();

const server = app.listen(process.env.PORT,()=>{
       console.log(`server is working on http://localhost:${process.env.PORT}`)
})


//Unhandeled promise Rejection

process.on("unhandledRejection",err=>{
       console.log(`Error: ${err.message}`);
       console.log(`sutting down the server due to Unhandeled Promise rejection`);

    server.close(()=>{
       process.exit(1);
    })
})