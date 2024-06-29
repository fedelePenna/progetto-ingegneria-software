import {NextApiRequest, NextApiResponse} from "next";
import {connectToMongoDB} from "@/lib/mongodb";
import Log from "@/lib/Log";
import {NextResponse} from "next/server";

export async function GET(request: NextApiRequest) {
    await connectToMongoDB();
    const logs = await Log.find();
    return NextResponse.json(logs);
}
