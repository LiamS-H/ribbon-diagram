import { ThemeToggle } from "@/components/(theme)/theme-toggle";

export function NavBar() {
    return (
        <div className="relative">
            <div className="absolute top-4 w-full">
                <div className="absolute right-4 flex gap-4">
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
}
