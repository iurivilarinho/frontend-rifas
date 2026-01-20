import { useSearchParams } from "react-router-dom";
import RifasSection from "./module/raffleModule";
import UsuariosSection from "./module/userModule";

const Painel = () => {
  const [params] = useSearchParams();
  const menu = params.get("tab") ?? "rifas";

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="h-16" /> {/* spacer para não ficar atrás da navbar */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {menu === "rifas" && <RifasSection />}
        {menu === "usuarios" && <UsuariosSection />}
      </div>
    </div>
  );
};

export default Painel;
