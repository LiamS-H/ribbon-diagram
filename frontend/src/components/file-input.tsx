import { Input } from "@/components/(ui)/input";
import { type ChangeEventHandler } from "react";

export function FileInput({
    onChange,
}: {
    onChange: ChangeEventHandler<HTMLInputElement>;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <Input multiple onChange={onChange} id="bed-file" type="file" />
            </div>
        </div>
    );
}
