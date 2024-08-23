"use client";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {SignInButton} from "@/components/sign-in-component";
import { useSession } from "next-auth/react";
import BookingForm from "@/components/public/booking-form";


export default function Home() {

  const session = useSession();

  console.log(session);

  return (
      <main className="flex min-h-screen flex-col items-center justify-between p-6">
        <div>
          <BookingForm />
        </div>
      </main>
  );
}
