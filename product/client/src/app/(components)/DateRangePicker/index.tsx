"use client";

import React from "react";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { HiOutlineXCircle } from "react-icons/hi2";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  const handleStartChange = (date: Date | null) => {
    onChange({ startDate: date ? format(date, "dd/MM/yyyy") : "", endDate });
  };

  const handleEndChange = (date: Date | null) => {
    onChange({ startDate, endDate: date ? format(date, "dd/MM/yyyy") : "" });
  };

  const clearStart = () => onChange({ startDate: "", endDate });
  const clearEnd = () => onChange({ startDate, endDate: "" });

  const inputClass =
    "w-full px-3 py-2 pr-8 border border-gray-300 rounded-md bg-white placeholder:font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 transition";

  return (
    <div className="flex gap-4 items-start justify-end mb-4">
      <div className="relative flex-1">
        <DatePicker
          locale={es}
          selected={startDate ? parse(startDate, "dd/MM/yyyy", new Date()) : null}
          onChange={handleStartChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="Desde"
          showYearDropdown
          yearDropdownItemNumber={15}
          customInput={<input className={inputClass} />}
        />
        {startDate && (
          <HiOutlineXCircle
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
            size={20}
            onClick={clearStart}
          />
        )}
      </div>

      <div className="relative flex-1">
        <DatePicker
          locale={es}
          selected={endDate ? parse(endDate, "dd/MM/yyyy", new Date()) : null}
          onChange={handleEndChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="Hacia"
          showYearDropdown
          yearDropdownItemNumber={15}
          customInput={<input className={inputClass} />}
        />
        {endDate && (
          <HiOutlineXCircle
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
            size={20}
            onClick={clearEnd}
          />
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;