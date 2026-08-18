import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: [true, "Room title is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Room description is required"],
            trim: true,
        },

        rent: {
            type: Number,
            required: [true, "Room rent is required"],
            min: 0,
        },

        location: {
            type: String,
            required: [true, "Room location is required"],
            trim: true,
        },

        roomType: {
            type: String,
            enum: ["single", "double", "3BHK", "1BHK", "2BHK"],
            required: true,
        },

        facilities: {
            type: [String],
            default: [],
        },

        images: [
            {
                url: {
                    type: String,
                    required: true
                },
                fileId: {
                    type: String,
                    required: true
                }
            }
        ],
        
        availability: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const RoomModel = mongoose.model("Room", roomSchema);

export default RoomModel;