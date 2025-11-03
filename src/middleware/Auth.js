 const authRequest =  (req,res,next)=>{
    const token  = "fhrjfdxnef";//req.body.token
    const isTokenAuthorized = token==="xyz";
    if(!isTokenAuthorized){
        res.status(401).send("Unauthorized Request");
    }else{
       next();
    }
}
 const userAuth =  (req,res,next)=>{
    const token  = "fhrjfdxnef";//req.body.token
    const isTokenAuthorized = token==="fhrjfdxnef";
    if(!isTokenAuthorized){
        res.status(401).send("Unauthorized Request");
    }else{
       next();
    }
}
module.exports ={
    authRequest,userAuth
}