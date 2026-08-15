import { ReactNode } from "react";

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: ReactNode;
};

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  icon,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="text-xs font-medium text-[#1C1B18]"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#756A5C]">
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`
            h-12 w-full rounded-2xl
            border border-[#174D35]/15
            bg-white
            px-4
            text-sm text-[#1C1B18]
            outline-none
            transition-all duration-200
            placeholder:text-[#756A5C]/50
            focus:border-[#174D35]/50
            focus:ring-2
            focus:ring-[#174D35]/10
            ${icon ? "pl-11" : ""}
          `}
        />
      </div>
    </div>
  );
}
