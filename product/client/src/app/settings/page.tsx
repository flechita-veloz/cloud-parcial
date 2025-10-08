"use client";

import React, { useState } from "react";
import Header from "@/app/(components)/Header";
import { setIsDarkMode } from "@/state";
import { useAppDispatch } from "@/app/redux";

type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};


const mockSettings: UserSetting[] = [
  { label: "Username", value: "flechita_veloz", type: "text" },
  { label: "Email", value: "flechita_veloz@gmail.com", type: "text" },
  { label: "Notificaciones", value: true, type: "toggle" },
  { label: "Modo oscuro", value: false, type: "toggle" },
  { label: "Lenguaje", value: "Español", type: "text" },
];

const Settings = () => {
  const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);
  const dispatch = useAppDispatch();
  const handleToggleChange = (index: number) => {
    const settingsCopy = [...userSettings];
    const updatedValue = !settingsCopy[index].value as boolean;
    settingsCopy[index].value = updatedValue;
    setUserSettings(settingsCopy);

    if (settingsCopy[index].label === "Modo oscuro") {
      dispatch(setIsDarkMode(updatedValue));
    }
  };

  return (
    <div className="w-full">
      <Header name="Configuraciones" />
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg">
          <thead className="bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-100">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Configuración
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr className="hover:bg-blue-50 dark:hover:bg-gray-800" key={setting.label}>
                <td className="py-2 px-4 text-gray-900 dark:text-gray-100">{setting.label}</td>
                <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                  {setting.type === "toggle" ? (
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.value as boolean}
                        onChange={() => handleToggleChange(index)}
                      />
                      <div
                        className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4 
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:bg-blue-600"
                      ></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      className="px-4 py-2 border rounded-lg bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                      value={setting.value as string}
                      onChange={(e) => {
                        const settingsCopy = [...userSettings];
                        settingsCopy[index].value = e.target.value;
                        setUserSettings(settingsCopy);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
