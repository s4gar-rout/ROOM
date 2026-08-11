import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        contact: {
            type: String,
            trim: true,
        },

        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
        },

        role: {
            type: String,
            enum: ["tenant", "owner", "admin"],
            default: "tenant",
        },

        ownerRequestStatus: {
            type: String,
            enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
            default: "NONE",
        },

        ownerVerified: {
            type: Boolean,
            default: false,
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        ownerVerified: {
            type: Boolean,
            default: false,
        },

        otp: {
            type: String,
        },

        otpExpiresAt: {
            type: Date,
        },

        otpCooldownExpiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) {
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;