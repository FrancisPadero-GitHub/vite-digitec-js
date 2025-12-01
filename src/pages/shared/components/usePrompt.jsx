import { toast } from "react-hot-toast";

/**
 *
 * Usage
 * import it using {usePrompt}
 *
 * then store it
 * const { showPrompt } = usePrompt();
 *
 * then add values
 *
 * showPrompt("error", "You are not eligible for applying!");
 */

export function usePrompt() {
  const showPrompt = (type, message, options = {}) => {
    const baseOptions = {
      duration: 3000,
      style: { padding: "12px", borderRadius: "8px" },
      ...options,
    };

    switch (type) {
      case "success":
        toast.success(message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: "1px solid #22c55e",
            color: "#166534",
          },
          iconTheme: { primary: "#22c55e", secondary: "#ecfdf5" },
        });
        break;
      case "error":
        toast.error(message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: "1px solid #ef4444",
            color: "#7f1d1d",
          },
          iconTheme: { primary: "#ef4444", secondary: "#fee2e2" },
        });
        break;
      case "warning":
        toast(message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: "1px solid #facc15",
            color: "#78350f",
          },
          icon: "⚠️",
        });
        break;
      case "info":
        toast(message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: "1px solid #3b82f6",
            color: "#1e3a8a",
          },
          icon: "ℹ️",
        });
        break;
      default:
        toast(message, baseOptions);
    }
  };

  return { showPrompt };
}
