console.log("TheSuftSocials Loaded");
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    button.parentElement.classList.toggle('active');
  });
});
import { useState, useEffect } from "react";

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <>
      {/* Your website code */}
    </>
  );
}

export default App;
