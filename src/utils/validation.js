const validator = require("validator");

const validation = (req) => {
  const { firstName, emailId, password, age, lastName } = req.body;

  if (!firstName || !emailId || !password || !age) {
    throw new Error("Required fields are missing!");
  }


  if (typeof firstName !== "string" || (lastName && typeof lastName !== "string")) {
    throw new Error("Name fields must be text!");
  }

  if (typeof age !== "number") {
    throw new Error("Age must be a number!");
  }


  if (firstName.length < 2) {
    throw new Error("First name must have at least 2 characters!");
  }

  if (age < 13 || age > 120) {
    throw new Error("Age must be between 13 and 120!");
  }


  if (!validator.isEmail(emailId)) {
    throw new Error(" Email is not valid!");
  }

 
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol!"
    );
  }

  if (firstName.includes(" ")) {
    throw new Error("First name should not contain spaces!");
  }
};

const validateProfileEdit = (req)=>{
const allowedEditField = ["firstName","lastName","age","gender","photoUrl","about","skills"]
      const updates = Object.keys(req.body).filter((field) => field !== "_id");
  const isEditAllowed = updates.every((field) =>
    allowedEditField.includes(field)
  );
   return isEditAllowed

}
const passwordValidation = (oldPassword,newPassword,confirmPassword)=>{
   if (!oldPassword || !newPassword || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match");
  }
}

module.exports = {validation,validateProfileEdit,passwordValidation};
