import { ThemeProvider } from "./context/ThemeContext";
import InvoiceApp from "./InvoiceApp";

function App() {
  return (
    <ThemeProvider>
      <InvoiceApp />
    </ThemeProvider>
  );
}

export default App;
