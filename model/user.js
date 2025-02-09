const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { generateToken } = require("../service/auth");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageURL: {
    type: String,
    default: "/img/default.png",
  },
  salt: {
    type: String,
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
},{ timestamps: true });

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    const salt = await randomBytes(16).toString();
    const hashedPassword = await createHmac("sha256", salt)
      .update(user.password)
      .digest("hex");
    this.salt = salt;
    this.password = hashedPassword;
    next();
  } catch (error) {
    throw new Error('Internal server error')
  }
});

userSchema.static("matchPasswordAndGenToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('user not found!');

  const salt = user.salt;
  const hashedPassword = user.password;

  const userProvidedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error('Incorrect password!');

  const token=generateToken(user)
  return token;
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
