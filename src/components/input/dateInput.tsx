import { mergeClasses } from "@/lib/mergeClasses";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Field, FieldLabel } from "./Field";
import { Input } from "./Input";

interface DataInputProps {
  className?: string;
  label?: string;
}
const DataInput = ({ label, className }: DataInputProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className={mergeClasses("relative w-full", className)}>
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        customInput={
          <Field>
            <FieldLabel>{label}</FieldLabel>
            <Input
              value={selectedDate ? selectedDate.toLocaleDateString() : ""}
              className="w-full"
              readOnly
            />
          </Field>
        }
        dateFormat="dd/MM/yyyy"
        placeholderText="dd/mm/aaaa"
      />
    </div>
  );
};

export default DataInput;
