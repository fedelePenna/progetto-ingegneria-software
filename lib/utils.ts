import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {connectToMongoDB} from "@/lib/mongodb";
import Log from "@/lib/Log";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function logEvent(eventType: string, details: any){
  try{
    const db = await connectToMongoDB();
    const log = new Log({eventType, details});
    await log.save();
  }
  catch (e){
  console.log(e)
  }

}
