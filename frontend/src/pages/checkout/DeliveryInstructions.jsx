import { useState } from "react";
import {
  Mic,
  PhoneOff,
  BellOff,
  PawPrint,
  DoorOpen,
  ShieldCheck,
  Check,
} from "lucide-react";

const DeliveryInstructions = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const options = [
    {
      id: "record",
      icon: Mic,
      label: "Tap here and hold",
      subtitle: "Record",
      action: "record",
      showCheckbox: false,
    },
    {
      id: "avoid-calling",
      icon: PhoneOff,
      label: "Avoid calling",
      action: "toggle",
      showCheckbox: true,
    },
    {
      id: "dont-ring",
      icon: BellOff,
      label: "Don't ring the bell",
      action: "toggle",
      showCheckbox: true,
    },
    {
      id: "leave-at-door",
      icon: DoorOpen,
      label: "Leave at door",
      action: "toggle",
      showCheckbox: true,
    },
    {
      id: "leave-with-guard",
      icon: ShieldCheck,
      label: "Leave with guard",
      action: "toggle",
      showCheckbox: true,
    },
    {
      id: "pet-at-home",
      icon: PawPrint,
      label: "Pet at home",
      action: "toggle",
      showCheckbox: true,
    },
  ];

  const handleOptionClick = (option) => {
    if (option.action === "record") {
      setIsRecording(!isRecording);
      // Add voice recording logic here
    } else {
      setSelectedOptions((prev) =>
        prev.includes(option.id)
          ? prev.filter((id) => id !== option.id)
          : [...prev, option.id],
      );
    }
  };

  const isSelected = (optionId) => selectedOptions.includes(optionId);

  return (
    <div className="mx-3 mb-24">
      {/* Header */}
      <h2 className="text-white font-semibold text-sm mb-3">
        Delivery instructions
      </h2>

      {/* Horizontal Scrollable Options */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {options.map((option) => {
          const Icon = option.icon;
          const selected =
            option.action === "record" ? isRecording : isSelected(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-3 min-w-[100px] shrink-0 transition-all duration-300 hover:border-white/20 relative"
            >
              {/* Checkbox - Only show if showCheckbox is true */}
              {option.showCheckbox && (
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selected
                        ? "bg-[rgb(49,134,22)] border-[rgb(49,134,22)]"
                        : "border-white/30 bg-transparent"
                    }`}
                  >
                    {selected && <Check className="w-2 h-2 text-black" />}
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-lg bg-white/5">
                  <Icon className="w-4 h-4 text-white/60" />
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <div className="text-white/80 text-[10px] font-medium">
                  {option.label}
                </div>
                {option.subtitle && (
                  <div className="text-[rgb(49,134,22)] text-[8px] font-medium mt-1">
                    {option.subtitle}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryInstructions;
