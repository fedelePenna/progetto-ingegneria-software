import mongoose, {Schema, Document, Model} from "mongoose";

interface ILog extends Document {
    eventType: string;
    details: any;
    timestamp: Date;
}

const LogSchema: Schema = new Schema({
    eventType: { type: String, required: true },
    details: { type: Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Log: Model<ILog> = mongoose.models?.Log || mongoose.model("Log", LogSchema);

export default Log;
