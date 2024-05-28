const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
    otp_validity: {
      type: Date,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    // Convert email to lowercase
    this.email = this.email.toLowerCase();

    if (this.isModified("password")) {
      const hashedPassword = await bcrypt.hash(
        this.password,
        parseInt(process.env.SALT_ROUNDS)
      );
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    // Convert email to lowercase
    if (this._update.email) {
      this._update.email = this._update.email.toLowerCase();
    }

    if (this._update?.password) {
      const hashedPassword = await bcrypt.hash(
        this._update.password,
        parseInt(process.env.SALT_ROUNDS)
      );
      this._update.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.set("timestamps", { createdAt: true, updatedAt: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
