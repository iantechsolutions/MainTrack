import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export default function FileUpload(props: { id: string, label?: string, onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      {props.label ? <Label htmlFor={props.id}>{props.label}</Label> : <></>}
      <Input onChange={props.onChange} id={props.id} type="file" />
    </div>
  );
}
