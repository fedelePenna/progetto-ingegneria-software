import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {SignInButton} from "@/components/sign-in-component";


export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div>
            <SignInButton/>
        </div>
      </main>
  );
}
