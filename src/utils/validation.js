
const validator=require("validator")

const ValidateSignupData=(req)=>{
    const {FirstName,LastName,EmailId,PassWord}=req.body
    if (!FirstName || !LastName || !EmailId|| !PassWord){
        throw new Error("Please fill all required fields (FirstName,LastName,EmailId,PassWord)")
    }

 else if (!validator.isEmail(EmailId)){
    throw new Error("Your email id is not valid")
 } else if (!validator.isStrongPassword(PassWord)){
    throw new Error("Passord must be valid")
 }  


}

const ValidateProfileEditData=(req)=>{
         const AllowEditFields=["FirstName","LastName","Age","Skills","About","PhotoUrl","Gender"]
         if(req.body.Skills.length>10){
           throw new Error("you can only add upto 10 skills")

         }

   
   const Isallowed=Object.keys(req.body).every(field=>AllowEditFields.includes(field))
   return Isallowed
  

}
module.exports={
    ValidateSignupData,ValidateProfileEditData}
