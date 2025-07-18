import Image from "next/image";
import { ThemeToggle } from "./components/theme-toggle";

export default function Home() {
  return (
    <div className="dark:bg-gray-900 bg-white min-h-screen flex items-center justify-center text-center">
      Hello
      <ThemeToggle />
    </div>
  );
}
