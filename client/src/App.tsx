import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { init, themeParams, viewport, mainButton, hapticFeedback, invoice } from "@telegram-apps/sdk";
import request from "./api/requests";

// Инициализация Telegram SDK (вызываем только 1 раз)
init();
viewport.mount();
viewport.expand();
mainButton.mount();
themeParams.mount();
mainButton.setParams({
  hasShineEffect: true,
  isEnabled: true,
  isVisible: false,
  isLoaderVisible: false,
  text: "SPEND",
  textColor: "#ffffff"
})

function App() {
  const [stars, setStars] = useState<number>(999);

  useEffect(() => {
    // Проверяем, не были ли уже привязаны переменные
    if (!(window as any).__CSS_VARS_BOUND__) {
      themeParams.bindCssVars();
      (window as any).__CSS_VARS_BOUND__ = true; // Устанавливаем флаг
    }

    const handleClick = async () => {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.impactOccurred("soft")
      }

      const response = await request("donate", "post", {amount: 1})
      invoice.open(response.invoice_link.replace("https://t.me/$", ""))
    };

    mainButton.onClick(handleClick)
    return () => {
      mainButton.offClick(handleClick)
    };
  }, [stars]);

  function calcStars(e: any) {
    const userValue = e.target.value.trim()
    const starCost = userValue / (0.625 / 50)
    const prevParams = mainButton.state()

    if (userValue && !isNaN(userValue) && userValue > 0) {
      mainButton.setParams({...prevParams, isVisible: true})
      setStars(starCost)
    } else {
      mainButton.setParams({...prevParams, isVisible: false})
      setStars(0)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen flex-col">
      <h1 className="text-4xl mb-5 text-white font-semibold">
        <CountUp end={stars} />{" "}
        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
      </h1>

      <input
        type="number"
        className="HeCyla p-3 text-2xl text-center w-[90%] mb-2 mx-auto"
        placeholder="$$$"
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={calcStars}
        style={{
          background: "none",
          border: "2px solid var(--tg-theme-accent-text-color)",
          color: "white",
          outline: "none",
        }}
      />
      <div className="text-center text-sm text-gray-300 w-[90%] mt-2 mx-auto">
        <p className="text-xs opacity-75">
          * Сумма указывается в долларах США (USD),
          после чего автоматически конвертируется
          в Telegram Stars
        </p>
      </div>
    </div>
  );
}

export default App;
