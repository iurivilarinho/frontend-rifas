import { useSearchParams } from "react-router-dom";
import ActionModule from "./module/ActionModule";
import UserModule from "./module/UserModule";

const Painel = () => {
  const [params] = useSearchParams();
  const menu = params.get("tab") ?? "raffles";

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="h-16" /> {/* spacer para não ficar atrás da navbar */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {menu === "raffles" && <ActionModule />}
        {menu === "users" && <UserModule />}
      </div>
    </div>
  );
};

export default Painel;
